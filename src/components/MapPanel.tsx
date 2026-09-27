import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Search,
  Maximize2,
  Plus,
  MapPin,
  Compass,
  X,
  Loader2,
  Navigation,
} from 'lucide-react';
import { DayPlan, Waypoint } from '../types';
import {
  searchPlaces,
  GeocodingResult,
  getFlightArcCoordinates,
} from '../services/geo';

interface MapPanelProps {
  activeDay: DayPlan;
  onAddWaypoint: (waypoint: Waypoint) => void;
  onUpdateWaypoint: (waypoint: Waypoint) => void;
  onDeleteWaypoint: (waypointId: string) => void;
  focusedWaypoint: Waypoint | null;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  activeDay,
  onAddWaypoint,
  onUpdateWaypoint,
  onDeleteWaypoint,
  focusedWaypoint,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([activeDay.origin.lat, activeDay.origin.lng], 13);

    // OpenStreetMap standard tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add layers
    const routesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    routesLayerRef.current = routesLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Click on map to add waypoint
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const count = activeDay.waypoints.length + 1;
      const newWaypoint: Waypoint = {
        id: 'wp-' + Date.now(),
        name: `Stop ${count} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng,
        travelMode: 'walk',
        estimatedDuration: '10 min',
      };
      onAddWaypoint(newWaypoint);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers & Routes whenever activeDay changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routesLayer = routesLayerRef.current;
    if (!map || !markersLayer || !routesLayer) return;

    markersLayer.clearLayers();
    routesLayer.clearLayers();

    const boundsPoints: [number, number][] = [];

    // 1. Render Origin Marker ('S' or 'H' badge)
    const originIcon = L.divIcon({
      className: 'custom-origin-pin-wrapper',
      html: `
        <div class="custom-origin-pin" style="width: 28px; height: 28px;">
          <span>S</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const originMarker = L.marker([activeDay.origin.lat, activeDay.origin.lng], {
      icon: originIcon,
      title: activeDay.origin.name,
    }).addTo(markersLayer);

    originMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 4px;">
        <strong style="color: #0f172a; font-size: 13px;">Origin: ${activeDay.origin.name}</strong>
        <p style="color: #64748b; margin: 4px 0 0;">Starting location for Day ${activeDay.dayNumber}</p>
      </div>
    `);

    boundsPoints.push([activeDay.origin.lat, activeDay.origin.lng]);

    // 2. Render Waypoint Markers ('1', '2', '3'...)
    let prevPoint: [number, number] = [activeDay.origin.lat, activeDay.origin.lng];

    activeDay.waypoints.forEach((wp, index) => {
      const wpIcon = L.divIcon({
        className: 'custom-waypoint-pin-wrapper',
        html: `
          <div class="custom-waypoint-pin" style="width: 28px; height: 28px;">
            <span>${index + 1}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const wpMarker = L.marker([wp.lat, wp.lng], {
        icon: wpIcon,
        draggable: true,
        title: wp.name,
      }).addTo(markersLayer);

      // Drag to reposition
      wpMarker.on('dragend', (e) => {
        const newLatLng = (e.target as L.Marker).getLatLng();
        onUpdateWaypoint({
          ...wp,
          lat: newLatLng.lat,
          lng: newLatLng.lng,
        });
      });

      wpMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 160px; padding: 4px;">
          <div style="color: #10B981; font-weight: 700; text-transform: uppercase; font-size: 10px;">Waypoint ${index + 1}</div>
          <strong style="color: #0f172a; font-size: 13px; display: block; margin: 2px 0 4px;">${wp.name}</strong>
          <div style="color: #64748b; font-size: 11px;">Mode: <b>${wp.travelMode}</b></div>
          ${wp.notes ? `<p style="color: #475569; margin: 6px 0 0; font-size: 11px;">${wp.notes}</p>` : ''}
          <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">(Drag pin to move)</div>
        </div>
      `);

      boundsPoints.push([wp.lat, wp.lng]);

      // 3. Connect Routes:
      if (wp.travelMode === 'flight') {
        // Prominent curved red/coral flight path arc across the globe
        const arcPoints = getFlightArcCoordinates(
          prevPoint[0],
          prevPoint[1],
          wp.lat,
          wp.lng,
          60
        );
        L.polyline(arcPoints, {
          color: '#EF4444',
          weight: 3.5,
          opacity: 0.9,
          dashArray: '6, 6',
          lineCap: 'round',
        }).addTo(routesLayer);
      } else {
        // Standard green ground travel route
        L.polyline([prevPoint, [wp.lat, wp.lng]], {
          color: '#10B981',
          weight: 3.5,
          opacity: 0.85,
          lineJoin: 'round',
        }).addTo(routesLayer);
      }

      prevPoint = [wp.lat, wp.lng];
    });

    // Fit map bounds smoothly
    if (boundsPoints.length > 0) {
      map.fitBounds(boundsPoints, {
        padding: [60, 60],
        maxZoom: 14,
        animate: true,
      });
    }
  }, [activeDay]);

  // Handle Pan to Focused Waypoint
  useEffect(() => {
    if (!focusedWaypoint || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([focusedWaypoint.lat, focusedWaypoint.lng], 15, {
      duration: 1.2,
    });
  }, [focusedWaypoint]);

  // Search places execution
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchPlaces(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Add search result as waypoint
  const handleSelectSearchResult = (res: GeocodingResult) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    const name = res.display_name.split(',')[0] || searchQuery;

    const newWaypoint: Waypoint = {
      id: 'wp-' + Date.now(),
      name,
      lat,
      lng,
      travelMode: 'walk',
      notes: res.display_name,
      estimatedDuration: '15 min',
    };

    onAddWaypoint(newWaypoint);
    setSearchResults([]);
    setSearchQuery('');
    setSearchOpen(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 14);
    }
  };

  // Fit bounds button
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const points: [number, number][] = [
      [activeDay.origin.lat, activeDay.origin.lng],
      ...activeDay.waypoints.map((w): [number, number] => [w.lat, w.lng]),
    ];
    mapInstanceRef.current.fitBounds(points, {
      padding: [50, 50],
      maxZoom: 14,
    });
  };

  return (
    <div className="relative flex-1 h-[calc(100vh-53px)] w-full overflow-hidden bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Place Search Overlay Bar */}
      <div className="absolute top-4 left-4 z-20 w-80 sm:w-96">
        <div className="relative bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 overflow-hidden">
          <form onSubmit={handleSearchSubmit} className="flex items-center px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places & add to route..."
              className="w-full text-xs text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
              onFocus={() => setSearchOpen(true)}
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </form>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && searchOpen && (
            <div className="border-t border-slate-100 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {searchResults.map((res) => (
                <button
                  key={res.place_id}
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2.5 hover:bg-emerald-50/80 flex items-start gap-2.5 text-xs transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {res.display_name.split(',')[0]}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {res.display_name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Map Controls */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleFitBounds}
          className="p-2.5 bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200/90 transition-all active:scale-95"
          title="Fit route to screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Map Hint Banner */}
      <div className="absolute bottom-2 left-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/80 text-[11px] text-slate-500 shadow-xs flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-emerald-600" />
          <span>Click anywhere on map to drop a new waypoint & drag pins to reposition</span>
        </div>
      </div>

      {/* Leaflet Attribution */}
      <div className="absolute bottom-1 right-2 z-20 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded shadow-2xs pointer-events-auto">
        &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors
      </div>
    </div>
  );
};
