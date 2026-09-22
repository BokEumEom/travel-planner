import React, { useState } from 'react';
import { Trip, DayPlan, Waypoint } from '../types';
import { PlanningSidebar } from './PlanningSidebar';
import { Users, Sparkles, X, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface CollaboratorSplitViewProps {
  trip: Trip;
  activeDay: DayPlan;
  onUpdateTitle: (title: string) => void;
  onUpdateOrigin: (origin: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateWaypoint: (wp: Waypoint) => void;
  onDeleteWaypoint: (id: string) => void;
  onReorderWaypoints?: (waypoints: Waypoint[]) => void;
  onOpenAddWaypoint: () => void;
  onOpenCalendar: () => void;
  onSelectDay: (dayId: string) => void;
  onSelectWaypointOnMap: (wp: Waypoint) => void;
  onClose: () => void;
  crdtOpCount: number;
}

export const CollaboratorSplitView: React.FC<CollaboratorSplitViewProps> = ({
  trip,
  activeDay,
  onUpdateTitle,
  onUpdateOrigin,
  onAddTag,
  onRemoveTag,
  onUpdateNotes,
  onUpdateWaypoint,
  onDeleteWaypoint,
  onReorderWaypoints,
  onOpenAddWaypoint,
  onOpenCalendar,
  onSelectDay,
  onSelectWaypointOnMap,
  onClose,
  crdtOpCount,
}) => {
  const { t } = useI18n();
  const [peerSimulatedAction, setPeerSimulatedAction] = useState<string | null>(null);

  // Quick simulation actions for Peer B (e.g. Alice in Sydney) to test real-time CRDT updates
  const simulatePeerAddTag = () => {
    const sampleTags = ['Photography', 'Sunset Spot', 'Local Food', 'Coffee Hop', 'Ferry Ride'];
    const randomTag = sampleTags[Math.floor(Math.random() * sampleTags.length)];
    onAddTag(randomTag);
    setPeerSimulatedAction(`Peer Alice added tag #${randomTag}`);
    setTimeout(() => setPeerSimulatedAction(null), 3000);
  };

  const simulatePeerReorder = () => {
    if (activeDay.waypoints.length < 2 || !onReorderWaypoints) return;
    const reordered = [...activeDay.waypoints];
    const temp = reordered[0];
    reordered[0] = reordered[1];
    reordered[1] = temp;
    onReorderWaypoints(reordered);
    setPeerSimulatedAction(`Peer Alice dragged & swapped waypoint sequence`);
    setTimeout(() => setPeerSimulatedAction(null), 3000);
  };

  const simulatePeerAddWaypoint = () => {
    const sampleSpots = [
      { name: 'Barangaroo Reserve Waterfront', travelMode: 'walk' as const, lat: -33.8588, lng: 151.2005 },
      { name: 'Manly Scenic Ferry', travelMode: 'ferry' as const, lat: -33.8055, lng: 151.2855 },
      { name: 'Surry Hills Specialty Roastery', travelMode: 'walk' as const, lat: -33.8845, lng: 151.2135 },
    ];
    const spot = sampleSpots[Math.floor(Math.random() * sampleSpots.length)];
    const newWp: Waypoint = {
      id: 'wp-sim-' + Date.now().toString(36),
      name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
      travelMode: spot.travelMode,
      notes: 'Added by collaborator via CRDT sync stream.',
    };
    onUpdateWaypoint(newWp);
    setPeerSimulatedAction(`Peer Alice added waypoint "${spot.name}"`);
    setTimeout(() => setPeerSimulatedAction(null), 3000);
  };

  return (
    <div className="absolute inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px] flex flex-col">
      {/* Top Banner explaining CRDT Dual View */}
      <div className="h-10 bg-neutral-900 text-white px-4 flex items-center justify-between text-xs border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">{t('collaboratorViewTitle')}</span>
          <span className="text-neutral-400 hidden sm:inline">
            — {t('collaboratorViewSubtitle')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded text-[11px] text-emerald-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CRDT Ops: {crdtOpCount}</span>
          </div>

          <button
            id="close-split-view-btn"
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Panes */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-300 overflow-hidden">
        {/* Pane 1: User 1 (Host / You) */}
        <div className="flex flex-col h-full bg-white relative">
          <div className="px-4 py-2 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-emerald-950">{t('hostEditor')}</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Local Client Node</span>
          </div>

          <div className="flex-1 overflow-hidden">
            <PlanningSidebar
              trip={trip}
              activeDay={activeDay}
              onUpdateTitle={onUpdateTitle}
              onUpdateOrigin={onUpdateOrigin}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onUpdateNotes={onUpdateNotes}
              onUpdateWaypoint={onUpdateWaypoint}
              onDeleteWaypoint={onDeleteWaypoint}
              onReorderWaypoints={onReorderWaypoints}
              onOpenAddWaypoint={onOpenAddWaypoint}
              onOpenCalendar={onOpenCalendar}
              onSelectDay={onSelectDay}
              onSelectWaypointOnMap={onSelectWaypointOnMap}
              isCollaborativeConnected={true}
              activePeerCount={2}
            />
          </div>
        </div>

        {/* Pane 2: User 2 (Collaborator / Alice) */}
        <div className="flex flex-col h-full bg-white relative">
          <div className="px-4 py-2 bg-blue-50/70 border-b border-blue-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="font-bold text-blue-950">{t('guestEditor')}</span>
            </div>
            {/* Quick Simulate Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={simulatePeerAddTag}
                className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[11px] font-medium transition-colors"
                title="Simulate collaborator adding a tag"
              >
                + {t('addTagPrompt')}
              </button>
              <button
                onClick={simulatePeerReorder}
                disabled={activeDay.waypoints.length < 2}
                className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-[11px] font-medium transition-colors disabled:opacity-40"
                title="Simulate collaborator reordering waypoints"
              >
                ⇄ {t('moveUp')}
              </button>
              <button
                onClick={simulatePeerAddWaypoint}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors"
                title="Simulate collaborator adding a waypoint"
              >
                + {t('addWaypointTitle')}
              </button>
            </div>
          </div>

          {/* Action Notification Toast */}
          {peerSimulatedAction && (
            <div className="absolute top-10 right-4 z-50 bg-blue-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{peerSimulatedAction}</span>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <PlanningSidebar
              trip={trip}
              activeDay={activeDay}
              onUpdateTitle={onUpdateTitle}
              onUpdateOrigin={onUpdateOrigin}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              onUpdateNotes={onUpdateNotes}
              onUpdateWaypoint={onUpdateWaypoint}
              onDeleteWaypoint={onDeleteWaypoint}
              onReorderWaypoints={onReorderWaypoints}
              onOpenAddWaypoint={onOpenAddWaypoint}
              onOpenCalendar={onOpenCalendar}
              onSelectDay={onSelectDay}
              onSelectWaypointOnMap={onSelectWaypointOnMap}
              isCollaborativeConnected={true}
              activePeerCount={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
