import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Wifi,
  MapPin,
  CheckSquare,
  Route,
  Plus,
  X,
  Pencil,
  Trash2,
  Crosshair,
  ChevronUp,
  ChevronDown,
  Navigation,
  Clock,
  Search,
} from 'lucide-react';
import { Trip, DayPlan, Waypoint, TravelMode } from '../types';
import { TravelModeIcon, travelModeLabels } from './TravelModeIcon';
import { formatDistance, calculateDistanceKm } from '../services/geo';

interface SidebarProps {
  trip: Trip;
  activeDay: DayPlan;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onSelectDay: (dayId: string) => void;
  onAddDay: () => void;
  onFocusWaypoint: (waypoint: Waypoint | null) => void;
  onLocateOrigin: () => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  trip,
  activeDay,
  onUpdateTrip,
  onSelectDay,
  onAddDay,
  onFocusWaypoint,
  onLocateOrigin,
  onOpenSearch,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [editingWaypointId, setEditingWaypointId] = useState<string | null>(null);
  const [editingOrigin, setEditingOrigin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWpName, setNewWpName] = useState('');
  const [newWpMode, setNewWpMode] = useState<TravelMode>('walk');
  const [newWpDuration, setNewWpDuration] = useState('15 min');
  const [newWpNotes, setNewWpNotes] = useState('');
  const [isGeocodingNew, setIsGeocodingNew] = useState(false);

  // Submit quick add waypoint
  const handleQuickAddWaypoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWpName.trim()) return;

    setIsGeocodingNew(true);
    let lat = activeDay.origin.lat + (Math.random() - 0.5) * 0.02;
    let lng = activeDay.origin.lng + (Math.random() - 0.5) * 0.02;

    try {
      const results = await import('../services/geo').then((m) =>
        m.searchPlaces(newWpName)
      );
      if (results && results.length > 0) {
        lat = parseFloat(results[0].lat);
        lng = parseFloat(results[0].lon);
      }
    } catch (err) {}

    const newWp: Waypoint = {
      id: 'wp-' + Date.now(),
      name: newWpName.trim(),
      lat,
      lng,
      travelMode: newWpMode,
      notes: newWpNotes.trim() || undefined,
      estimatedDuration: newWpDuration.trim() || undefined,
    };

    updateActiveDay((day) => ({
      ...day,
      waypoints: [...day.waypoints, newWp],
    }));

    setNewWpName('');
    setNewWpNotes('');
    setShowAddForm(false);
    setIsGeocodingNew(false);
    onFocusWaypoint(newWp);
  };

  // Update Trip Title
  const handleTitleChange = (newTitle: string) => {
    onUpdateTrip({
      ...trip,
      title: newTitle,
    });
  };

  // Update active day helper
  const updateActiveDay = (updater: (day: DayPlan) => DayPlan) => {
    const updatedDays = trip.days.map((d) => (d.id === activeDay.id ? updater(d) : d));
    onUpdateTrip({
      ...trip,
      days: updatedDays,
    });
  };

  // Add tag
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim();
    if (!tag || activeDay.tags.includes(tag)) return;
    updateActiveDay((day) => ({
      ...day,
      tags: [...day.tags, tag],
    }));
    setNewTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    updateActiveDay((day) => ({
      ...day,
      tags: day.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Update Day Plan Notes
  const handleNotesChange = (notes: string) => {
    updateActiveDay((day) => ({
      ...day,
      notes,
    }));
  };

  // Update Origin name
  const handleOriginNameChange = (name: string) => {
    updateActiveDay((day) => ({
      ...day,
      origin: { ...day.origin, name },
    }));
  };

  // Update Waypoint Travel Mode
  const handleTravelModeCycle = (waypointId: string) => {
    const modes: TravelMode[] = ['walk', 'bus', 'train', 'flight', 'car', 'ferry'];
    updateActiveDay((day) => ({
      ...day,
      waypoints: day.waypoints.map((wp) => {
        if (wp.id !== waypointId) return wp;
        const nextIndex = (modes.indexOf(wp.travelMode) + 1) % modes.length;
        return { ...wp, travelMode: modes[nextIndex] };
      }),
    }));
  };

  // Update Waypoint Name
  const handleWaypointNameChange = (waypointId: string, name: string) => {
    updateActiveDay((day) => ({
      ...day,
      waypoints: day.waypoints.map((wp) => (wp.id === waypointId ? { ...wp, name } : wp)),
    }));
  };

  // Update Waypoint Notes
  const handleWaypointNotesChange = (waypointId: string, notes: string) => {
    updateActiveDay((day) => ({
      ...day,
      waypoints: day.waypoints.map((wp) => (wp.id === waypointId ? { ...wp, notes } : wp)),
    }));
  };

  // Delete Waypoint
  const handleDeleteWaypoint = (waypointId: string) => {
    updateActiveDay((day) => ({
      ...day,
      waypoints: day.waypoints.filter((wp) => wp.id !== waypointId),
    }));
  };

  // Reorder Waypoint
  const handleMoveWaypoint = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDay.waypoints.length) return;

    const newWaypoints = [...activeDay.waypoints];
    const temp = newWaypoints[index];
    newWaypoints[index] = newWaypoints[targetIndex];
    newWaypoints[targetIndex] = temp;

    updateActiveDay((day) => ({
      ...day,
      waypoints: newWaypoints,
    }));
  };

  // Calculate total distance for this day
  let totalDistanceKm = 0;
  let prevLat = activeDay.origin.lat;
  let prevLng = activeDay.origin.lng;
  for (const wp of activeDay.waypoints) {
    totalDistanceKm += calculateDistanceKm(prevLat, prevLng, wp.lat, wp.lng);
    prevLat = wp.lat;
    prevLng = wp.lng;
  }

  return (
    <aside className="w-full md:w-[420px] lg:w-[460px] h-[calc(100vh-53px)] overflow-y-auto bg-white border-r border-slate-200/90 flex flex-col shrink-0 shadow-xs z-20">
      {/* Day Selector Tabs */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 pt-3 pb-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {trip.days.map((day) => (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                day.id === activeDay.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
              }`}
            >
              <span>Day {day.dayNumber}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {day.date.slice(5)}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onAddDay}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors shrink-0"
          title="Add next travel day"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Day</span>
        </button>
      </div>

      <div className="p-5 flex-1 space-y-6">
        {/* Top Header Row matching unixzii's video: Date + Connected badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={activeDay.date}
              onChange={(e) =>
                updateActiveDay((day) => ({ ...day, date: e.target.value }))
              }
              className="bg-transparent hover:bg-slate-100/80 px-2 py-0.5 rounded cursor-pointer text-slate-800 font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-medium">
            <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>Connected</span>
          </div>
        </div>

        {/* Trip Title Section */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 tracking-wide block">
            Trip title
          </label>
          <input
            type="text"
            value={trip.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-2xl font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-1.5 py-1 -ml-1.5 rounded-lg border border-transparent hover:border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all tracking-tight"
            placeholder="Name your trip..."
          />
        </div>

        {/* Overview Section */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <MapPin className="w-4 h-4 text-slate-800" />
            <span>Overview</span>
          </div>

          {/* Origin */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-400">Origin</label>
              <button
                onClick={onLocateOrigin}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
                title="Center map on origin"
              >
                <Crosshair className="w-3 h-3" />
                <span>Locate on map</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={activeDay.origin.name}
                onChange={(e) => handleOriginNameChange(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50/80 hover:bg-slate-50 focus:bg-white px-3 py-2 rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none transition-all pr-8"
                placeholder="Starting hotel or airport"
              />
              <button
                onClick={onLocateOrigin}
                className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                title="Locate origin on map"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {activeDay.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium rounded-full transition-colors"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-slate-700 rounded-full"
                    title="Remove tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add tag"
                  className="w-20 text-xs px-2 py-0.5 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-600 focus:outline-none placeholder:text-slate-400 text-slate-700"
                />
                <button
                  type="submit"
                  disabled={!newTagInput.trim()}
                  className="w-5 h-5 flex items-center justify-center rounded-full border border-slate-300 hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                  title="Add tag"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Day plan Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <CheckSquare className="w-4 h-4 text-slate-800" />
            <span>Day plan</span>
          </div>
          <textarea
            rows={3}
            value={activeDay.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full text-xs leading-relaxed text-slate-700 bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-3 rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none transition-all resize-y placeholder:text-slate-400"
            placeholder="Write free-form notes, daily schedule or highlights for this day..."
          />
        </div>

        {/* Waypoints Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Route className="w-4 h-4 text-slate-800" />
              <span>Waypoints</span>
              <span className="text-xs font-normal text-slate-400">
                ({activeDay.waypoints.length} stops)
              </span>
            </div>

            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200/80 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Waypoint</span>
            </button>
          </div>

          {/* Waypoint Cards List */}
          <div className="space-y-2.5">
            {activeDay.waypoints.map((wp, index) => {
              const isEditing = editingWaypointId === wp.id;

              return (
                <div
                  key={wp.id}
                  onClick={() => onFocusWaypoint(wp)}
                  className="group relative bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Waypoint Label */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                          WAYPOINT {index + 1}
                        </span>
                        {wp.estimatedDuration && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            {wp.estimatedDuration}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      {isEditing ? (
                        <input
                          type="text"
                          value={wp.name}
                          onChange={(e) => handleWaypointNameChange(wp.id, e.target.value)}
                          className="w-full text-xs font-bold text-slate-900 bg-white px-2 py-1 border border-emerald-400 rounded focus:outline-none"
                          autoFocus
                          onBlur={() => setEditingWaypointId(null)}
                        />
                      ) : (
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {wp.name}
                        </h4>
                      )}

                      {/* Notes if available */}
                      {wp.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {wp.notes}
                        </p>
                      )}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingWaypointId(isEditing ? null : wp.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/60"
                        title="Edit name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWaypoint(wp.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete waypoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Travel Mode & Reordering Bar */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    {/* Mode Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTravelModeCycle(wp.id);
                      }}
                      className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200/80 rounded text-slate-700 font-medium text-[11px] transition-colors"
                      title="Click to cycle travel mode (Walk, Bus, Train, Flight, Car)"
                    >
                      <TravelModeIcon mode={wp.travelMode} className="w-3 h-3 text-slate-600" />
                      <span>{travelModeLabels[wp.travelMode]}</span>
                    </button>

                    {/* Order up / down */}
                    <div className="flex items-center gap-0.5 text-slate-400">
                      <button
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveWaypoint(index, 'up');
                        }}
                        className="p-1 hover:text-slate-700 disabled:opacity-20"
                        title="Move up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === activeDay.waypoints.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveWaypoint(index, 'down');
                        }}
                        className="p-1 hover:text-slate-700 disabled:opacity-20"
                        title="Move down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {activeDay.waypoints.length === 0 && (
              <div className="text-center py-6 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
                <Navigation className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No waypoints added for this day</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click on the map or use "+ Add Waypoint" to insert stops.
                </p>
              </div>
            )}
          </div>

          {/* Add Waypoint Form or Trigger Button */}
          {showAddForm ? (
            <form
              onSubmit={handleQuickAddWaypoint}
              className="bg-slate-50 border border-slate-300/80 rounded-xl p-3.5 space-y-2.5 animate-fade-in text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Add New Waypoint</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  value={newWpName}
                  onChange={(e) => setNewWpName(e.target.value)}
                  placeholder="Location name (e.g. Bondi Beach, Museum)"
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Mode</label>
                  <select
                    value={newWpMode}
                    onChange={(e) => setNewWpMode(e.target.value as TravelMode)}
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none capitalize"
                  >
                    <option value="walk">Walk</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="flight">Flight</option>
                    <option value="car">Car</option>
                    <option value="ferry">Ferry</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Duration</label>
                  <input
                    type="text"
                    value={newWpDuration}
                    onChange={(e) => setNewWpDuration(e.target.value)}
                    placeholder="e.g. 15 min"
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={newWpNotes}
                  onChange={(e) => setNewWpNotes(e.target.value)}
                  placeholder="Notes or activities (optional)"
                  className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWpName.trim() || isGeocodingNew}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-1"
                >
                  {isGeocodingNew ? 'Locating...' : 'Add Stop'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Waypoint</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Route Stats */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-800">Total Route:</span>{' '}
          {formatDistance(totalDistanceKm)}
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {activeDay.waypoints.length} stops
        </div>
      </div>
    </aside>
  );
};
