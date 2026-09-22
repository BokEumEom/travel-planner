import React, { useState } from 'react';
import {
  Wifi,
  Users,
  Share2,
  Download,
  Plus,
  Compass,
  FileText,
  Sparkles,
  ExternalLink,
  Check,
  Calendar,
  Layers,
} from 'lucide-react';
import { Trip, Collaborator } from '../types';
import { sampleTrips } from '../data/defaultTrips';

interface HeaderProps {
  trip: Trip;
  collaborators: Collaborator[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onSelectTrip: (trip: Trip) => void;
  onAddDay: () => void;
  onExportMarkdown: () => void;
  onExportJson: () => void;
  notification: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  trip,
  collaborators,
  isSimulating,
  onToggleSimulation,
  onSelectTrip,
  onAddDay,
  onExportMarkdown,
  onExportJson,
  notification,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTripsMenu, setShowTripsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const openNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between select-none z-30 relative shadow-xs">
      {/* Left side: Browser style URL & App branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100/90 rounded-md text-xs font-mono text-slate-700 border border-slate-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="font-semibold text-slate-800">localhost:5173</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600 truncate max-w-[120px]">{trip.id}</span>
        </div>

        {/* Notification Toast for CRDT activity */}
        {notification && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium truncate max-w-[280px]">{notification}</span>
          </div>
        )}
      </div>

      {/* Right side: Actions, Collaborators, Connection, Export */}
      <div className="flex items-center gap-2.5">
        {/* Real-time CRDT status indicator */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-medium"
          title="CRDT Real-time Synchronization Active via BroadcastChannel & Local Storage"
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          <span>Connected</span>
        </div>

        {/* Live Collaborator Avatars */}
        <div className="flex items-center -space-x-1.5 overflow-hidden pl-1">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="relative inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white rounded-full ring-2 ring-white shadow-xs cursor-default transition-transform hover:scale-110"
              style={{ backgroundColor: collab.color }}
              title={`${collab.name}${collab.isSimulated ? ' (CRDT Co-editor)' : ''}`}
            >
              {collab.avatar}
              {collab.isSimulated && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-white" />
              )}
            </div>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Simulated Collaborator button */}
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors border ${
            isSimulating
              ? 'bg-teal-50 text-teal-800 border-teal-300 ring-1 ring-teal-400'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
          title="Simulate @unixzii (Cyan) making live CRDT changes to verify sync"
        >
          <Users className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">
            {isSimulating ? 'Co-editor Active (@unixzii)' : 'Simulate Co-editor'}
          </span>
        </button>

        {/* Open in new window to test multi-tab CRDT */}
        <button
          onClick={openNewTab}
          className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
          title="Open in new window to test live dual-window CRDT co-editing"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>Test Multi-Tab</span>
        </button>

        {/* Sample Trips Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTripsMenu(!showTripsMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Preset Trips</span>
          </button>

          {showTripsMenu && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-40 animate-fade-in text-xs">
              <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Choose Itinerary
              </div>
              <button
                onClick={() => {
                  onSelectTrip(sampleTrips['australia-nz']);
                  setShowTripsMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between text-slate-800"
              >
                <div>
                  <div className="font-medium">Australia & New Zealand</div>
                  <div className="text-[11px] text-slate-500">Video original (Sydney + Christchurch)</div>
                </div>
                {trip.id === 'trip-aus-nz-2026' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
              <button
                onClick={() => {
                  onSelectTrip(sampleTrips['japan-trip']);
                  setShowTripsMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between text-slate-800"
              >
                <div>
                  <div className="font-medium">Tokyo & Kyoto Rail</div>
                  <div className="text-[11px] text-slate-500">Shinjuku, Shibuya, Meiji Shrine</div>
                </div>
                {trip.id === 'trip-japan-2026' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 text-xs">
              <button
                onClick={() => {
                  onExportMarkdown();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Notion / Markdown (.md)</span>
              </button>
              <button
                onClick={() => {
                  onExportJson();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Raw CRDT Data (.json)</span>
              </button>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Link Copied!' : 'Share'}</span>
        </button>
      </div>
    </header>
  );
};
