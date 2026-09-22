/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trip, DayPlan, Waypoint, Collaborator } from './types';
import { INITIAL_TRIP, PRESET_TRIPS } from './data/initialTrip';
import { CRDTEngine } from './lib/crdt';
import { TopNavbar } from './components/TopNavbar';
import { PlanningSidebar } from './components/PlanningSidebar';
import { MapView } from './components/MapView';
import { CalendarModal } from './components/CalendarModal';
import { AddWaypointModal } from './components/AddWaypointModal';
import { ExportModal } from './components/ExportModal';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { CRDTInfoModal } from './components/CRDTInfoModal';
import { CollaboratorSplitView } from './components/CollaboratorSplitView';
import { HelpGuideModal } from './components/HelpGuideModal';
import { Map, List, Layers, Plus } from 'lucide-react';

export default function App() {
  // Initialize CRDT Engine
  const crdtEngineRef = useRef<CRDTEngine | null>(null);
  const [trip, setTrip] = useState<Trip>(INITIAL_TRIP);
  const [activePeers, setActivePeers] = useState<Collaborator[]>([]);
  const [crdtOpCount, setCrdtOpCount] = useState<number>(0);

  // Modal states
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddWaypointOpen, setIsAddWaypointOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);
  const [isCRDTInfoOpen, setIsCRDTInfoOpen] = useState(false);
  const [isSplitView, setIsSplitView] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Map interaction states
  const [isMapClickMode, setIsMapClickMode] = useState(false);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(null);
  const [hoveredWaypointId, setHoveredWaypointId] = useState<string | null>(null);

  // Mobile layout state ('planner' or 'map')
  const [mobileTab, setMobileTab] = useState<'planner' | 'map'>('planner');

  // Initialize engine once
  useEffect(() => {
    const engine = new CRDTEngine(INITIAL_TRIP, 'You (Host)', '#10B981');
    crdtEngineRef.current = engine;
    setTrip(engine.getTrip());

    const unsubscribe = engine.subscribe((updatedTrip) => {
      setTrip({ ...updatedTrip });
      setCrdtOpCount(engine.getOperationsCount());
    });

    const unsubscribePeers = engine.subscribePeers((peers) => {
      setActivePeers([...peers]);
    });

    return () => {
      unsubscribe();
      unsubscribePeers();
      engine.destroy();
    };
  }, []);

  // Active day object
  const activeDay: DayPlan = useMemo(() => {
    return trip.days.find((d) => d.id === trip.activeDayId) || trip.days[0];
  }, [trip]);

  // Operations dispatched through CRDT Engine
  const handleUpdateTitle = (title: string) => {
    crdtEngineRef.current?.applyLocalOperation('UPDATE_TRIP_TITLE', title);
  };

  const handleUpdateOrigin = (originName: string) => {
    crdtEngineRef.current?.applyLocalOperation(
      'UPDATE_DAY_ORIGIN',
      { name: originName },
      activeDay.id
    );
  };

  const handleAddTag = (tag: string) => {
    crdtEngineRef.current?.applyLocalOperation('ADD_TAG', tag, activeDay.id);
  };

  const handleRemoveTag = (tag: string) => {
    crdtEngineRef.current?.applyLocalOperation('REMOVE_TAG', tag, activeDay.id);
  };

  const handleUpdateNotes = (notes: string) => {
    crdtEngineRef.current?.applyLocalOperation('UPDATE_DAY_NOTES', notes, activeDay.id);
  };

  const handleAddWaypoint = (wp: Waypoint) => {
    crdtEngineRef.current?.applyLocalOperation('ADD_WAYPOINT', wp, activeDay.id);
    setSelectedWaypointId(wp.id);
  };

  const handleUpdateWaypoint = (updatedWp: Waypoint) => {
    crdtEngineRef.current?.applyLocalOperation('UPDATE_WAYPOINT', updatedWp, activeDay.id);
  };

  const handleDeleteWaypoint = (id: string) => {
    crdtEngineRef.current?.applyLocalOperation('DELETE_WAYPOINT', id, activeDay.id);
    if (selectedWaypointId === id) setSelectedWaypointId(null);
  };

  const handleReorderWaypoints = (reorderedWaypoints: Waypoint[]) => {
    crdtEngineRef.current?.applyLocalOperation(
      'REORDER_WAYPOINTS',
      reorderedWaypoints,
      activeDay.id
    );
  };

  const handleSelectDay = (dayId: string) => {
    crdtEngineRef.current?.applyLocalOperation('SELECT_DAY', dayId);
    setSelectedWaypointId(null);
  };

  const handleAddNewDay = (dateString: string) => {
    const newDay: DayPlan = {
      id: 'day-' + Date.now().toString(36),
      date: dateString,
      dayNumber: trip.days.length + 1,
      title: 'Exploration & Free Day',
      origin: { ...activeDay.origin },
      tags: ['Sightseeing'],
      notes: 'New day plan added to itinerary.',
      waypoints: [],
    };

    const updatedDays = [...trip.days, newDay];
    crdtEngineRef.current?.applyLocalOperation('FULL_STATE_SYNC', {
      ...trip,
      days: updatedDays,
      activeDayId: newDay.id,
    });
  };

  const handleResetTrip = () => {
    crdtEngineRef.current?.setTrip(INITIAL_TRIP);
  };

  const handleSelectTripPreset = (presetId: string) => {
    const selected = PRESET_TRIPS.find((t) => t.id === presetId);
    if (selected) {
      crdtEngineRef.current?.setTrip(selected);
    }
  };

  // Map Click Handler for precise waypoint drop
  const handleMapClickCoordinates = (lat: number, lng: number) => {
    if (!isMapClickMode) return;

    const newWp: Waypoint = {
      id: 'wp-' + Date.now().toString(36),
      name: `Dropped Stop (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      lat,
      lng,
      travelMode: 'walk',
      notes: 'Pinned directly on the map.',
    };

    handleAddWaypoint(newWp);
    setIsMapClickMode(false);
  };

  const handleSelectWaypointOnMap = (wp: Waypoint) => {
    setSelectedWaypointId(wp.id);
    // On mobile, switch to map view to inspect
    if (window.innerWidth < 768) {
      setMobileTab('map');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F8F9FA] text-[#1E293B]">
      {/* 1. Browser Navigation Toolbar */}
      <TopNavbar
        trip={trip}
        isSplitView={isSplitView}
        onToggleSplitView={() => setIsSplitView(!isSplitView)}
        onExportMarkdown={() => setIsExportOpen(true)}
        onOpenPhotos={() => setIsPhotosOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onResetTrip={handleResetTrip}
        onSelectTripPreset={handleSelectTripPreset}
        availableTrips={PRESET_TRIPS}
        crdtOpCount={crdtOpCount}
        activePeersCount={activePeers.length + 1}
      />

      {/* 2. Main Content Split View (Desktop: Left Panel + Right Map) */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Left Itinerary Planning Sidebar (matching video screenshot) */}
        <div
          id="main-planner-sidebar"
          className={`
            w-full md:w-[410px] lg:w-[430px] h-full z-20 shrink-0
            ${mobileTab === 'planner' ? 'flex' : 'hidden md:flex'}
          `}
        >
          <PlanningSidebar
            trip={trip}
            activeDay={activeDay}
            onUpdateTitle={handleUpdateTitle}
            onUpdateOrigin={handleUpdateOrigin}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onUpdateNotes={handleUpdateNotes}
            onUpdateWaypoint={handleUpdateWaypoint}
            onDeleteWaypoint={handleDeleteWaypoint}
            onReorderWaypoints={handleReorderWaypoints}
            onOpenAddWaypoint={() => setIsAddWaypointOpen(true)}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onSelectDay={handleSelectDay}
            onSelectWaypointOnMap={handleSelectWaypointOnMap}
            hoveredWaypointId={hoveredWaypointId}
            onHoverWaypoint={setHoveredWaypointId}
            isCollaborativeConnected={true}
            activePeerCount={activePeers.length + 1}
            onToggleCollabInfo={() => setIsCRDTInfoOpen(true)}
          />
        </div>

        {/* Right Interactive OpenStreetMap */}
        <div
          id="main-map-viewport"
          className={`
            flex-1 h-full relative z-10
            ${mobileTab === 'map' ? 'block' : 'hidden md:block'}
          `}
        >
          <MapView
            tripId={trip.id}
            activeDayId={activeDay.id}
            origin={activeDay.origin}
            waypoints={activeDay.waypoints}
            isMapClickMode={isMapClickMode}
            onMapClickCoordinates={handleMapClickCoordinates}
            onSelectWaypoint={handleSelectWaypointOnMap}
            selectedWaypointId={selectedWaypointId}
            hoveredWaypointId={hoveredWaypointId}
            dayNumber={activeDay.dayNumber}
            dayTitle={activeDay.title}
          />
        </div>

        {/* Mobile Navigation Toggle Tab Bar */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-neutral-200/90 rounded-full shadow-lg p-1 flex items-center gap-1">
          <button
            onClick={() => setMobileTab('planner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              mobileTab === 'planner'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Itinerary</span>
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              mobileTab === 'map'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </main>

      {/* 3. Modals & Overlays */}
      {/* Calendar Overlay (matching Frame 10) */}
      {isCalendarOpen && (
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          days={trip.days}
          activeDayId={trip.activeDayId}
          onSelectDay={handleSelectDay}
          onAddNewDay={handleAddNewDay}
        />
      )}

      {/* Add Waypoint Modal */}
      {isAddWaypointOpen && (
        <AddWaypointModal
          isOpen={isAddWaypointOpen}
          onClose={() => setIsAddWaypointOpen(false)}
          onAddWaypoint={handleAddWaypoint}
          onEnableMapClickMode={() => {
            setIsMapClickMode(true);
            if (window.innerWidth < 768) setMobileTab('map');
          }}
          currentDayTitle={activeDay.title}
        />
      )}

      {/* Markdown / Notion Export Modal */}
      {isExportOpen && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          trip={trip}
        />
      )}

      {/* Scenery Photos Gallery Modal */}
      {isPhotosOpen && (
        <PhotoGalleryModal
          isOpen={isPhotosOpen}
          onClose={() => setIsPhotosOpen(false)}
          activeDay={activeDay}
        />
      )}

      {/* User Help Guide Modal */}
      {isHelpOpen && (
        <HelpGuideModal
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />
      )}

      {/* CRDT Diagnostics Modal */}
      {isCRDTInfoOpen && (
        <CRDTInfoModal
          isOpen={isCRDTInfoOpen}
          onClose={() => setIsCRDTInfoOpen(false)}
          peerId={crdtEngineRef.current?.getPeerId() || 'peer_local'}
          opCount={crdtOpCount}
          peers={activePeers}
          trip={trip}
        />
      )}

      {/* CRDT Dual-Peer Collaborator Mode */}
      {isSplitView && (
        <CollaboratorSplitView
          trip={trip}
          activeDay={activeDay}
          onUpdateTitle={handleUpdateTitle}
          onUpdateOrigin={handleUpdateOrigin}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onUpdateNotes={handleUpdateNotes}
          onUpdateWaypoint={handleUpdateWaypoint}
          onDeleteWaypoint={handleDeleteWaypoint}
          onReorderWaypoints={handleReorderWaypoints}
          onOpenAddWaypoint={() => setIsAddWaypointOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onSelectDay={handleSelectDay}
          onSelectWaypointOnMap={handleSelectWaypointOnMap}
          onClose={() => setIsSplitView(false)}
          crdtOpCount={crdtOpCount}
        />
      )}
    </div>
  );
}
