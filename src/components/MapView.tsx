import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import { 
  Crosshair, 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Layers,
  X,
  Navigation,
  Globe
} from 'lucide-react';
import { Waypoint, Origin, WeatherData } from '../types';
import { fetchWeatherForLocation } from '../services/weatherService';
import { useI18n } from '../lib/i18n';

interface MapViewProps {
  tripId?: string;
  activeDayId?: string;
  origin: Origin;
  waypoints: Waypoint[];
  isMapClickMode: boolean;
  onMapClickCoordinates: (lat: number, lng: number) => void;
  onSelectWaypoint: (wp: Waypoint) => void;
  selectedWaypointId?: string | null;
  hoveredWaypointId?: string | null;
  dayNumber?: number;
  dayTitle?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  tripId,
  activeDayId,
  origin,
  waypoints,
  isMapClickMode,
  onMapClickCoordinates,
  onSelectWaypoint,
  selectedWaypointId,
  hoveredWaypointId,
  dayNumber,
  dayTitle,
}) => {
  const { t, language, formatDayNumber, translateWeatherDesc } = useI18n();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const markerInstancesRef = useRef<Map<string, L.Marker>>(new Map());

  // Map Tile Style: 'standard' (OSM Standard), 'humanitarian' (OSM Humanitarian/HOT), 'topo' (OpenTopoMap)
  const [mapStyle, setMapStyle] = useState<'standard' | 'humanitarian' | 'topo'>('standard');

  // Weather state
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [selectedWeatherKey, setSelectedWeatherKey] = useState<string>('origin');
  const [isWeatherOpen, setIsWeatherOpen] = useState<boolean>(true);
  const [showMarkerWeatherBadges, setShowMarkerWeatherBadges] = useState<boolean>(true);

  // Fetch OpenWeatherMap forecast for origin city and each waypoint location
  useEffect(() => {
    let isMounted = true;
    setIsLoadingWeather(true);

    async function loadAllLocationsWeather() {
      const results: Record<string, WeatherData> = {};

      if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
        const originWeather = await fetchWeatherForLocation(origin.lat, origin.lng, origin.name);
        if (originWeather) {
          results['origin'] = originWeather;
        }
      }

      for (const wp of waypoints) {
        if (typeof wp.lat === 'number' && typeof wp.lng === 'number') {
          const wpWeather = await fetchWeatherForLocation(wp.lat, wp.lng, wp.name);
          if (wpWeather) {
            results[wp.id] = wpWeather;
          }
        }
      }

      if (isMounted) {
        setWeatherMap(results);
        setIsLoadingWeather(false);
      }
    }

    loadAllLocationsWeather();

    return () => {
      isMounted = false;
    };
  }, [origin?.lat, origin?.lng, origin?.name, waypoints]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on Sydney, Australia
    const map = L.map(mapContainerRef.current, {
      center: [origin.lat || -33.8688, origin.lng || 151.2093],
      zoom: 13,
      zoomControl: false, // We customize or position zoom control
    });

    // Zoom controls in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Ensure map tiles and dimensions render smoothly
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Layer Switching (Standard OSM vs Humanitarian HOT vs OpenTopoMap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    let maxZoom = 19;

    if (mapStyle === 'humanitarian') {
      tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>';
      maxZoom = 19;
    } else if (mapStyle === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';
      maxZoom = 17;
    }

    const layer = L.tileLayer(tileUrl, {
      maxZoom,
      attribution,
    }).addTo(map);

    tileLayerRef.current = layer;
    setTimeout(() => {
      map.invalidateSize();
    }, 50);
  }, [mapStyle]);

  // Handle map click for adding waypoints
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClickCoordinates(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [onMapClickCoordinates]);

  // Update Markers & Routes (with OpenWeatherMap data and pin badges)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const routesLayer = routesLayerRef.current;

    if (!map || !markersLayer || !routesLayer) return;

    markersLayer.clearLayers();
    routesLayer.clearLayers();
    markerInstancesRef.current.clear();

    const allPoints: [number, number][] = [];

    // 1. Origin Marker (Black circle with 'S' and optional temperature badge)
    if (origin && origin.lat && origin.lng) {
      allPoints.push([origin.lat, origin.lng]);
      const originWeather = weatherMap['origin'];

      const originIcon = L.divIcon({
        className: 'custom-origin-div-icon',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            ${showMarkerWeatherBadges && originWeather ? `
              <div style="
                position: absolute;
                bottom: calc(100% + 4px);
                white-space: nowrap;
                background: rgba(15, 23, 42, 0.94);
                color: #FFFFFF;
                border-radius: 9999px;
                padding: 1px 6px;
                font-size: 10px;
                font-weight: 700;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 2px;
                pointer-events: none;
              ">
                <span>${originWeather.temp}°C</span>
              </div>
            ` : ''}
            <div style="
              width: 28px;
              height: 28px;
              background-color: #0F172A;
              color: #FFFFFF;
              border: 2px solid #FFFFFF;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 13px;
              box-shadow: 0 4px 10px rgba(15, 23, 42, 0.45);
              cursor: pointer;
            ">
              S
            </div>
          </div>
        `,
        iconSize: [28, showMarkerWeatherBadges && originWeather ? 46 : 28],
        iconAnchor: [14, showMarkerWeatherBadges && originWeather ? 32 : 14],
      });

      const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon });
      originMarker.on('click', () => {
        setSelectedWeatherKey('origin');
      });

      const originWeatherHtml = originWeather ? `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${originWeather.iconUrl ? `<img src="${originWeather.iconUrl}" alt="${originWeather.condition}" style="width: 32px; height: 32px; margin-left: -4px;" />` : '⛅'}
              <div>
                <div style="font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1.1;">${originWeather.temp}°C</div>
                <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: capitalize;">${originWeather.description}</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748B; line-height: 1.3;">
              <div>Feels ${originWeather.feelsLike}°C</div>
              <div>H: ${originWeather.tempMax}° L: ${originWeather.tempMin}°</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #64748B; background: #F8FAFC; padding: 4px 6px; border-radius: 6px;">
            <span>💧 ${originWeather.humidity}% humidity</span>
            <span>💨 ${originWeather.windSpeed} km/h wind</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 9px; color: #94A3B8;">
            <span style="display: flex; align-items: center; gap: 3px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: ${originWeather.isLive ? '#10B981' : '#3B82F6'};"></span>
              ${originWeather.source}
            </span>
          </div>
        </div>
      ` : `<div style="font-size: 11px; color: #94A3B8; margin-top: 6px;">Loading weather...</div>`;

      originMarker.bindPopup(`
        <div style="font-family: inherit; padding: 2px 4px; min-width: 210px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Trip Origin City</div>
          <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-top: 2px;">${origin.name}</div>
          ${originWeatherHtml}
        </div>
      `);
      markersLayer.addLayer(originMarker);
      markerInstancesRef.current.set('origin', originMarker);
    }

    // 2. Waypoint Markers (Emerald green circles with numbers 1, 2, 3... and weather badges)
    waypoints.forEach((wp, idx) => {
      allPoints.push([wp.lat, wp.lng]);
      const isSelected = wp.id === selectedWaypointId;
      const isHovered = wp.id === hoveredWaypointId;
      const wpWeather = weatherMap[wp.id];

      const wpIcon = L.divIcon({
        className: 'custom-waypoint-div-icon',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            ${showMarkerWeatherBadges && wpWeather ? `
              <div style="
                position: absolute;
                bottom: calc(100% + 4px);
                white-space: nowrap;
                background: rgba(255, 255, 255, 0.95);
                color: #0F172A;
                border: 1px solid #CBD5E1;
                border-radius: 9999px;
                padding: 1px 6px;
                font-size: 10px;
                font-weight: 700;
                box-shadow: 0 2px 6px rgba(0,0,0,0.18);
                display: flex;
                align-items: center;
                gap: 2px;
                pointer-events: none;
              ">
                <span>${wpWeather.temp}°C</span>
              </div>
            ` : ''}
            ${isHovered ? '<div class="waypoint-pin-halo"></div>' : ''}
            <div 
              class="waypoint-pin-circle ${isHovered ? 'waypoint-pin-pulsing' : ''}"
              style="
              width: ${isSelected ? '34px' : '28px'};
              height: ${isSelected ? '34px' : '28px'};
              background-color: #059669;
              color: #FFFFFF;
              border: ${isSelected || isHovered ? '3px solid #F59E0B' : '2px solid #FFFFFF'};
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: ${isSelected ? '14px' : '12px'};
              box-shadow: 0 4px 12px rgba(5, 150, 105, 0.5);
              cursor: pointer;
            ">
              ${idx + 1}
            </div>
          </div>
        `,
        iconSize: [isSelected ? 34 : 28, showMarkerWeatherBadges && wpWeather ? (isSelected ? 52 : 46) : (isSelected ? 34 : 28)],
        iconAnchor: [isSelected ? 17 : 14, showMarkerWeatherBadges && wpWeather ? (isSelected ? 35 : 32) : (isSelected ? 17 : 14)],
      });

      const marker = L.marker([wp.lat, wp.lng], { 
        icon: wpIcon,
        zIndexOffset: isHovered ? 1000 : (isSelected ? 500 : 0),
      });
      marker.on('click', () => {
        onSelectWaypoint(wp);
        setSelectedWeatherKey(wp.id);
      });

      const wpWeatherHtml = wpWeather ? `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E2E8F0;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              ${wpWeather.iconUrl ? `<img src="${wpWeather.iconUrl}" alt="${wpWeather.condition}" style="width: 32px; height: 32px; margin-left: -4px;" />` : '⛅'}
              <div>
                <div style="font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1.1;">${wpWeather.temp}°C</div>
                <div style="font-size: 11px; font-weight: 600; color: #475569; text-transform: capitalize;">${wpWeather.description}</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748B; line-height: 1.3;">
              <div>Feels ${wpWeather.feelsLike}°C</div>
              <div>H: ${wpWeather.tempMax}° L: ${wpWeather.tempMin}°</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 10px; color: #64748B; background: #F8FAFC; padding: 4px 6px; border-radius: 6px;">
            <span>💧 ${wpWeather.humidity}% humidity</span>
            <span>💨 ${wpWeather.windSpeed} km/h wind</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; font-size: 9px; color: #94A3B8;">
            <span style="display: flex; align-items: center; gap: 3px;">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: ${wpWeather.isLive ? '#10B981' : '#3B82F6'};"></span>
              ${wpWeather.source}
            </span>
          </div>
        </div>
      ` : `<div style="font-size: 11px; color: #94A3B8; margin-top: 6px;">Loading weather...</div>`;

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 210px;">
          <div style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.05em;">
            Waypoint ${idx + 1} • ${wp.travelMode.toUpperCase()}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #1E293B; margin-top: 2px;">${wp.name}</div>
          ${wp.notes ? `<div style="font-size: 11px; color: #64748B; margin-top: 3px; line-height: 1.3;">${wp.notes}</div>` : ''}
          ${wpWeatherHtml}
        </div>
      `);

      markersLayer.addLayer(marker);
      markerInstancesRef.current.set(wp.id, marker);
    });

    // 3. Draw Connecting Routes
    if (allPoints.length >= 2) {
      for (let i = 0; i < allPoints.length - 1; i++) {
        const p1 = allPoints[i];
        const p2 = allPoints[i + 1];

        const nextWp = waypoints[i];
        const isFlight = nextWp?.travelMode === 'flight';

        if (isFlight) {
          // Generate curved arc for flight
          const curvedPoints = generateFlightArc(p1, p2);
          const flightLine = L.polyline(curvedPoints, {
            color: '#E11D48', // Red / Rose arc
            weight: 3.5,
            dashArray: '8, 8',
            opacity: 0.85,
            smoothFactor: 1,
          });
          routesLayer.addLayer(flightLine);
        } else {
          // Emerald green line for local routes
          const routeLine = L.polyline([p1, p2], {
            color: '#10B981',
            weight: 3.5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          });
          routesLayer.addLayer(routeLine);
        }
      }
    }
  }, [origin, waypoints, selectedWaypointId, onSelectWaypoint, weatherMap, showMarkerWeatherBadges]);

  // Focus to Day: automatically pans and zooms the map to fit all waypoints assigned to the active day
  const handleFocusToDay = useCallback((animate = true) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    const points: [number, number][] = [];

    // Collect all waypoints currently assigned to the active day
    waypoints.forEach((wp) => {
      if (typeof wp.lat === 'number' && typeof wp.lng === 'number') {
        points.push([wp.lat, wp.lng]);
      }
    });

    // If origin is present, include it if waypoints are empty, or if origin is in local vicinity
    if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
      if (points.length === 0) {
        points.push([origin.lat, origin.lng]);
      } else {
        const isLocal = points.some(
          (p) => Math.hypot(p[0] - origin.lat, p[1] - origin.lng) < 2.5
        );
        if (isLocal) {
          points.push([origin.lat, origin.lng]);
        }
      }
    }

    if (points.length === 0) return;

    if (points.length === 1) {
      if (animate) {
        map.flyTo(points[0], 14, { animate: true, duration: 0.8 });
      } else {
        map.setView(points[0], 14);
      }
    } else {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15,
        animate,
        duration: animate ? 0.8 : undefined,
      });
    }
  }, [waypoints, origin]);

  // Automatically pan and fit map to bounds when trip, active day, origin, or waypoints change
  const lastLocationKeyRef = useRef<string>('');

  useEffect(() => {
    const locationKey = `${tripId || ''}_${activeDayId || dayNumber || ''}_${origin?.lat}_${origin?.lng}_${waypoints.map(w => w.id).join(',')}`;
    if (lastLocationKeyRef.current !== locationKey) {
      lastLocationKeyRef.current = locationKey;
      const timer = setTimeout(() => {
        handleFocusToDay(true);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [tripId, activeDayId, dayNumber, origin?.lat, origin?.lng, waypoints, handleFocusToDay]);

  // Automatically fly to selected waypoint and open popup when selected from sidebar or map
  useEffect(() => {
    if (!selectedWaypointId) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    setSelectedWeatherKey(selectedWaypointId);

    const targetMarker = markerInstancesRef.current.get(selectedWaypointId);
    const targetWp = waypoints.find(w => w.id === selectedWaypointId);

    if (targetWp && typeof targetWp.lat === 'number' && typeof targetWp.lng === 'number') {
      map.flyTo([targetWp.lat, targetWp.lng], 16, { animate: true, duration: 0.8 });
      if (targetMarker) {
        setTimeout(() => {
          targetMarker.openPopup();
        }, 250);
      }
    }
  }, [selectedWaypointId, waypoints]);

  // Instantly toggle gentle pulsing animation on map marker pin when hovered in planning sidebar
  useEffect(() => {
    markerInstancesRef.current.forEach((marker, id) => {
      const el = marker.getElement();
      if (!el) return;

      const circleEl = el.querySelector('.waypoint-pin-circle') as HTMLElement | null;
      let haloEl = el.querySelector('.waypoint-pin-halo') as HTMLElement | null;

      if (id === hoveredWaypointId) {
        marker.setZIndexOffset(1000);
        if (circleEl) {
          circleEl.classList.add('waypoint-pin-pulsing');
          circleEl.style.borderColor = '#F59E0B';
        }
        if (!haloEl && circleEl?.parentElement) {
          haloEl = document.createElement('div');
          haloEl.className = 'waypoint-pin-halo';
          circleEl.parentElement.appendChild(haloEl);
        }
      } else {
        const isSelected = id === selectedWaypointId;
        marker.setZIndexOffset(isSelected ? 500 : 0);
        if (circleEl) {
          circleEl.classList.remove('waypoint-pin-pulsing');
          circleEl.style.borderColor = isSelected ? '#F59E0B' : '#FFFFFF';
        }
        if (haloEl) {
          haloEl.remove();
        }
      }
    });
  }, [hoveredWaypointId, selectedWaypointId]);

  // ResizeObserver to handle container layout changes cleanly
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    observer.observe(mapContainerRef.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle focusing a specific location and opening its popup
  const handleFocusLocationOnMap = (key: string) => {
    setSelectedWeatherKey(key);
    const map = mapInstanceRef.current;
    const targetMarker = markerInstancesRef.current.get(key);

    if (key === 'origin' && origin) {
      if (map) {
        map.flyTo([origin.lat, origin.lng], 15, { animate: true, duration: 0.8 });
      }
      if (targetMarker) {
        targetMarker.openPopup();
      }
    } else {
      const wp = waypoints.find(w => w.id === key);
      if (wp) {
        onSelectWaypoint(wp);
        if (map) {
          map.flyTo([wp.lat, wp.lng], 15, { animate: true, duration: 0.8 });
        }
        if (targetMarker) {
          targetMarker.openPopup();
        }
      }
    }
  };

  // Find active location weather and details
  const activeLocationTitle = selectedWeatherKey === 'origin' 
    ? (origin?.name || 'Origin City')
    : (waypoints.find(w => w.id === selectedWeatherKey)?.name || 'Waypoint Location');

  const activeWeather = weatherMap[selectedWeatherKey];

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        id="leaflet-map-canvas" 
        className={`w-full h-full ${isMapClickMode ? 'cursor-crosshair' : 'cursor-grab'}`} 
      />

      {/* Floating Map Controls: Focus to Day, Weather Toggle & Map Style */}
      <div className="absolute top-3.5 left-3.5 z-30 flex flex-wrap items-center gap-2">
        {/* Focus to Day Button */}
        <button
          id="focus-to-day-btn"
          type="button"
          onClick={() => handleFocusToDay(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/95 hover:bg-white text-neutral-800 hover:text-neutral-950 font-semibold text-xs rounded-xl shadow-md hover:shadow-lg border border-neutral-200/90 backdrop-blur-xs transition-all duration-150 active:scale-95 cursor-pointer group"
          title={t('focusToDayTitle')}
        >
          <Crosshair className="w-4 h-4 text-emerald-600 group-hover:rotate-45 transition-transform duration-300 shrink-0" />
          <span>{t('focusToDay')}</span>
          {typeof dayNumber === 'number' && (
            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {formatDayNumber(dayNumber)}
            </span>
          )}
          {waypoints.length > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {waypoints.length}
            </span>
          )}
        </button>

        {/* Weather Forecast Toggle Button */}
        <button
          id="toggle-weather-panel-btn"
          type="button"
          onClick={() => setIsWeatherOpen(prev => !prev)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl shadow-md border backdrop-blur-xs transition-all duration-150 active:scale-95 cursor-pointer ${
            isWeatherOpen 
              ? 'bg-sky-50 text-sky-900 border-sky-200 shadow-sky-100' 
              : 'bg-white/95 hover:bg-white text-neutral-800 hover:text-neutral-950 border-neutral-200/90'
          }`}
          title={t('weatherForecast')}
        >
          <CloudSun className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{t('weather')}</span>
          {activeWeather && (
            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
              {activeWeather.temp}°C
            </span>
          )}
          {isWeatherOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-60" /> : <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
        </button>

        {/* Map Tile Style Toggle Button (Tourist English vs Native OSM vs Light) */}
        <button
          id="map-style-toggle-btn"
          type="button"
          onClick={() => {
            setMapStyle(prev => {
              if (prev === 'standard') return 'humanitarian';
              if (prev === 'humanitarian') return 'topo';
              return 'standard';
            });
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl shadow-md border bg-white/95 hover:bg-white text-neutral-800 border-neutral-200/90 transition-all cursor-pointer"
          title={`${t('mapTileStyle')} (클릭 시 OSM 표준 / 인도주의 / 지형도 스타일 순환)`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {mapStyle === 'standard' 
              ? t('mapStyleStandard') 
              : mapStyle === 'humanitarian' 
              ? t('mapStyleHot') 
              : t('mapStyleTopo')}
          </span>
        </button>
      </div>

      {/* Floating OpenWeatherMap Forecast Panel directly on Map interface */}
      {isWeatherOpen && (
        <div 
          id="map-weather-forecast-panel"
          className="absolute top-14 left-3.5 z-30 w-80 sm:w-92 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-neutral-200/90 p-3.5 transition-all text-neutral-900 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
            <div className="flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-sky-600" />
              <span className="font-bold text-xs text-neutral-900">{t('weatherForecast')}</span>
              {typeof dayNumber === 'number' && (
                <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                  {formatDayNumber(dayNumber)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowMarkerWeatherBadges(prev => !prev)}
                className={`text-[10px] flex items-center gap-1 font-medium px-2 py-0.5 rounded transition-colors ${
                  showMarkerWeatherBadges 
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
                title="Toggle temperature badges directly on the map pins"
              >
                <Layers className="w-3 h-3" />
                <span>{t('pinsBadgeToggle')}: {showMarkerWeatherBadges ? 'ON' : 'OFF'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsWeatherOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
                title={t('close')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Location Selector Chips (Origin + All Waypoints of active day) */}
          <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {/* Origin Chip */}
            {origin && (
              <button
                type="button"
                onClick={() => handleFocusLocationOnMap('origin')}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedWeatherKey === 'origin'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>{t('originCity')}</span>
                {weatherMap['origin'] && (
                  <span className={`text-[10px] font-bold ${selectedWeatherKey === 'origin' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {weatherMap['origin'].temp}°C
                  </span>
                )}
              </button>
            )}

            {/* Waypoint Chips */}
            {waypoints.map((wp, idx) => {
              const isSelectedLoc = selectedWeatherKey === wp.id;
              const wpWeather = weatherMap[wp.id];
              return (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => handleFocusLocationOnMap(wp.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelectedLoc
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  <span className="font-bold text-[10px] opacity-80">{idx + 1}.</span>
                  <span className="max-w-[80px] truncate">{wp.name}</span>
                  {wpWeather && (
                    <span className={`text-[10px] font-bold ${isSelectedLoc ? 'text-emerald-100' : 'text-neutral-500'}`}>
                      {wpWeather.temp}°C
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detailed Forecast for Selected Location */}
          {activeWeather ? (
            <div className="bg-gradient-to-br from-neutral-50 to-sky-50/50 rounded-xl p-3 border border-neutral-200/80">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-[170px]">{activeLocationTitle}</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-neutral-900 tracking-tight">
                      {activeWeather.temp}°C
                    </span>
                    <span className="text-xs font-medium text-neutral-600">
                      {t('feelsLike')} {activeWeather.feelsLike}°C
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-sky-700 capitalize mt-0.5">
                    {translateWeatherDesc(activeWeather.description)}
                  </div>
                </div>

                {/* Weather icon badge */}
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-xs border border-neutral-200/80 shrink-0">
                  {activeWeather.iconUrl ? (
                    <img 
                      src={activeWeather.iconUrl} 
                      alt={activeWeather.condition} 
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <CloudSun className="w-6 h-6 text-sky-500" />
                  )}
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-neutral-200/70 text-center">
                <div className="bg-white/80 rounded-lg p-1.5 border border-neutral-100">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500">
                    <Droplets className="w-3 h-3 text-sky-500" />
                    <span>{t('humidity')}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-800 mt-0.5">
                    {activeWeather.humidity}%
                  </div>
                </div>

                <div className="bg-white/80 rounded-lg p-1.5 border border-neutral-100">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500">
                    <Wind className="w-3 h-3 text-teal-500" />
                    <span>{t('wind')}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-800 mt-0.5">
                    {activeWeather.windSpeed} km/h
                  </div>
                </div>

                <div className="bg-white/80 rounded-lg p-1.5 border border-neutral-100">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500">
                    <Thermometer className="w-3 h-3 text-rose-500" />
                    <span>{t('hiLo')}</span>
                  </div>
                  <div className="text-xs font-bold text-neutral-800 mt-0.5">
                    {activeWeather.tempMax}° / {activeWeather.tempMin}°
                  </div>
                </div>
              </div>

              {/* Footer Actions & OpenWeatherMap Attribution */}
              <div className="mt-2.5 pt-2 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-neutral-500">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeWeather.isLive ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                  <span className="font-medium text-neutral-600 truncate max-w-[130px]" title={activeWeather.source}>
                    {activeWeather.isLive ? 'OpenWeatherMap Live' : 'OpenWeatherMap'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleFocusLocationOnMap(selectedWeatherKey)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{t('panToPin')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-neutral-500">
              {isLoadingWeather ? t('fetchingWeather') : t('noWeatherData')}
            </div>
          )}
        </div>
      )}

      {/* Map Click Mode Banner */}
      {isMapClickMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/90 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full shadow-lg border border-neutral-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{t('mapClickModeBanner')}</span>
        </div>
      )}
    </div>
  );
};

// Helper to generate curved arc for trans-ocean / flight routes (Sydney to Christchurch, etc.)
function generateFlightArc(
  start: [number, number],
  end: [number, number],
  numPoints: number = 30
): [number, number][] {
  const points: [number, number][] = [];
  const lat1 = start[0];
  const lng1 = start[1];
  const lat2 = end[0];
  const lng2 = end[1];

  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  // Calculate distance
  const dLat = lat2 - lat1;
  const dLng = end[1] - start[1];
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);

  // Perpendicular offset for arc curvature
  const curvature = 0.18;
  const perpLat = -dLng * curvature;
  const perpLng = dLat * curvature;

  const controlLat = midLat + perpLat;
  const controlLng = midLng + perpLng;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const invT = 1 - t;
    // Quadratic bezier
    const lat = invT * invT * lat1 + 2 * invT * t * controlLat + t * t * lat2;
    const lng = invT * invT * lng1 + 2 * invT * t * controlLng + t * t * lng2;
    points.push([lat, lng]);
  }

  return points;
}

