import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Wifi, 
  MapPin, 
  Crosshair, 
  Plus, 
  X, 
  CheckSquare, 
  GitBranch, 
  ChevronLeft, 
  ChevronRight,
  Share2
} from 'lucide-react';
import { DayPlan, Waypoint, Trip } from '../types';
import { WaypointCard } from './WaypointCard';
import { useI18n } from '../lib/i18n';

interface PlanningSidebarProps {
  trip: Trip;
  activeDay: DayPlan;
  onUpdateTitle: (title: string) => void;
  onUpdateOrigin: (originName: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onUpdateNotes: (notes: string) => void;
  onUpdateWaypoint: (waypoint: Waypoint) => void;
  onDeleteWaypoint: (waypointId: string) => void;
  onReorderWaypoints?: (waypoints: Waypoint[]) => void;
  onOpenAddWaypoint: () => void;
  onOpenCalendar: () => void;
  onSelectDay: (dayId: string) => void;
  onSelectWaypointOnMap: (waypoint: Waypoint) => void;
  hoveredWaypointId?: string | null;
  onHoverWaypoint?: (id: string | null) => void;
  isCollaborativeConnected?: boolean;
  activePeerCount?: number;
  onToggleCollabInfo?: () => void;
}

export const PlanningSidebar: React.FC<PlanningSidebarProps> = ({
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
  hoveredWaypointId,
  onHoverWaypoint,
  isCollaborativeConnected = true,
  activePeerCount = 1,
  onToggleCollabInfo,
}) => {
  const { t, formatDate, formatDayNumber } = useI18n();
  const [newTagInput, setNewTagInput] = useState('');
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [originInput, setOriginInput] = useState(activeDay.origin.name);

  // Drag and drop state for waypoints reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);

  // Sync origin input when activeDay changes
  React.useEffect(() => {
    setOriginInput(activeDay.origin.name);
  }, [activeDay.origin.name]);

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    onAddTag(newTagInput.trim());
    setNewTagInput('');
  };

  const handleOriginSubmit = () => {
    if (originInput.trim()) {
      onUpdateOrigin(originInput.trim());
    }
    setIsEditingOrigin(false);
  };

  // Waypoint Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'above' : 'below';

    if (dragOverIndex !== index || dropPosition !== pos) {
      setDragOverIndex(index);
      setDropPosition(pos);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    if (dragOverIndex === index) {
      setDragOverIndex(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !onReorderWaypoints) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    if (draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }

    const currentWaypoints = [...activeDay.waypoints];
    const [draggedItem] = currentWaypoints.splice(draggedIndex, 1);

    let destinationIndex = targetIndex;
    if (draggedIndex < targetIndex) {
      destinationIndex -= 1;
    }
    if (dropPosition === 'below') {
      destinationIndex += 1;
    }

    destinationIndex = Math.max(0, Math.min(destinationIndex, currentWaypoints.length));
    currentWaypoints.splice(destinationIndex, 0, draggedItem);

    onReorderWaypoints(currentWaypoints);

    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0 || !onReorderWaypoints) return;
    const newWaypoints = [...activeDay.waypoints];
    const temp = newWaypoints[index - 1];
    newWaypoints[index - 1] = newWaypoints[index];
    newWaypoints[index] = temp;
    onReorderWaypoints(newWaypoints);
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeDay.waypoints.length - 1 || !onReorderWaypoints) return;
    const newWaypoints = [...activeDay.waypoints];
    const temp = newWaypoints[index + 1];
    newWaypoints[index + 1] = newWaypoints[index];
    newWaypoints[index] = temp;
    onReorderWaypoints(newWaypoints);
  };

  const currentDayIndex = trip.days.findIndex((d) => d.id === activeDay.id);

  return (
    <div 
      id="planning-sidebar-panel"
      className="w-full h-full flex flex-col bg-white/95 backdrop-blur-md border-r border-neutral-200/80 shadow-lg select-text overflow-hidden"
    >
      {/* 1. Top Bar: Calendar date selector & Connected status badge */}
      <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between shrink-0">
        {/* Date Selector Button */}
        <button
          id="sidebar-date-picker-btn"
          onClick={onOpenCalendar}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-800 font-semibold text-sm group"
          title={t('selectDayPrompt')}
        >
          <CalendarIcon className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          <span>{formatDate(activeDay.date) || activeDay.date}</span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">
            {formatDayNumber(activeDay.dayNumber)}
          </span>
        </button>

        {/* Connection Status Pill */}
        <button
          id="crdt-connection-status-pill"
          onClick={onToggleCollabInfo}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 hover:bg-emerald-100/70 transition-colors cursor-pointer"
          title={t('crdtLiveActive')}
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>{isCollaborativeConnected ? t('connected') : t('offline')}</span>
          {activePeerCount > 1 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5"></span>
          )}
        </button>
      </div>

      {/* Scrollable Planning Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* 2. Trip Title Section */}
        <div id="section-trip-title" className="space-y-1">
          <label className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase block">
            {t('tripTitleLabel')}
          </label>
          <input
            id="trip-title-input"
            type="text"
            value={trip.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="w-full text-xl font-extrabold text-neutral-900 bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-emerald-500 focus:outline-none transition-colors py-0.5"
            placeholder={t('tripTitlePlaceholder')}
          />
        </div>

        {/* 3. Overview Section (Origin & Tags) */}
        <div id="section-overview" className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
            <MapPin className="w-4 h-4 text-neutral-700" />
            <span>{t('overview')}</span>
          </div>

          {/* Origin */}
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-neutral-400 font-medium w-16 shrink-0">{t('origin')}</span>
            <div className="flex-1 flex items-center justify-between gap-2 pl-2">
              {!isEditingOrigin ? (
                <span 
                  onClick={() => setIsEditingOrigin(true)}
                  className="font-semibold text-neutral-800 truncate cursor-pointer hover:text-emerald-700"
                  title={t('setOrigin')}
                >
                  {activeDay.origin.name || t('setOrigin')}
                </span>
              ) : (
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOriginSubmit()}
                    onBlur={handleOriginSubmit}
                    autoFocus
                    className="w-full text-xs font-semibold px-2 py-1 bg-neutral-100 border border-neutral-300 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <button
                id="origin-locate-crosshair-btn"
                onClick={() => setIsEditingOrigin(!isEditingOrigin)}
                className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                title={t('setOrigin')}
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">{t('tags')}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* Existing Tag Pills */}
              {activeDay.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-200/80 shadow-2xs group"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => onRemoveTag(tag)}
                    className="text-neutral-400 hover:text-neutral-700 transition-colors"
                    title={`Remove ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {/* Add Tag Form Input */}
              <form onSubmit={handleAddTagSubmit} className="inline-flex items-center gap-1">
                <input
                  id="add-tag-input"
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder={t('addTag')}
                  className="text-xs px-2.5 py-0.5 w-20 focus:w-28 bg-transparent border-b border-dashed border-neutral-300 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-neutral-400"
                />
                <button
                  id="add-tag-btn"
                  type="submit"
                  disabled={!newTagInput.trim()}
                  className="w-5 h-5 rounded-full bg-neutral-100 hover:bg-emerald-600 hover:text-white border border-neutral-200 flex items-center justify-center text-neutral-600 transition-colors disabled:opacity-30"
                  title={t('addTag')}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 4. Day Plan Section */}
        <div id="section-day-plan" className="space-y-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <CheckSquare className="w-4 h-4 text-neutral-700" />
              <span>{t('dayPlan')}</span>
            </div>
            {activeDay.title && (
              <span className="text-xs font-medium text-neutral-500 truncate max-w-[180px]">
                {activeDay.title}
              </span>
            )}
          </div>

          <textarea
            id="day-plan-notes-textarea"
            value={activeDay.notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            rows={3}
            placeholder={t('dayPlanPlaceholder')}
            className="w-full text-xs text-neutral-700 leading-relaxed p-3 bg-neutral-50/70 border border-neutral-200/80 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none shadow-2xs"
          />
        </div>

        {/* 5. Waypoints Section */}
        <div id="section-waypoints" className="space-y-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <GitBranch className="w-4 h-4 text-neutral-700" />
              <span>{t('waypoints')}</span>
              <span className="text-xs font-normal text-neutral-400">
                ({activeDay.waypoints.length})
              </span>
            </div>

            <button
              id="sidebar-add-waypoint-btn"
              onClick={onOpenAddWaypoint}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('addWaypoint')}</span>
            </button>
          </div>

          {/* Waypoints List */}
          <div className="space-y-2.5">
            {activeDay.waypoints.length > 1 && (
              <p className="text-[11px] text-neutral-400 font-normal">
                {t('reorderHint')}
              </p>
            )}

            {activeDay.waypoints.map((wp, idx) => (
              <WaypointCard
                key={wp.id}
                waypoint={wp}
                index={idx}
                totalCount={activeDay.waypoints.length}
                onUpdate={onUpdateWaypoint}
                onDelete={onDeleteWaypoint}
                onSelectOnMap={onSelectWaypointOnMap}
                isHovered={hoveredWaypointId === wp.id}
                onHover={onHoverWaypoint}
                isDragging={draggedIndex === idx}
                isDragOver={dragOverIndex === idx}
                dropPosition={dragOverIndex === idx ? dropPosition : null}
                onDragStart={handleDragStart}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            ))}

            {activeDay.waypoints.length === 0 && (
              <div className="text-center py-6 px-4 bg-neutral-50/50 border border-dashed border-neutral-200 rounded-xl">
                <p className="text-xs text-neutral-400">{t('noWaypointsYet')}</p>
                <button
                  onClick={onOpenAddWaypoint}
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  {t('addFirstWaypoint')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Day Navigation Footer */}
      <div className="px-5 py-3 border-t border-neutral-200/80 bg-neutral-50/90 flex items-center justify-between text-xs shrink-0">
        <button
          id="prev-day-footer-btn"
          disabled={currentDayIndex <= 0}
          onClick={() => {
            if (currentDayIndex > 0) {
              onSelectDay(trip.days[currentDayIndex - 1].id);
            }
          }}
          className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-600 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{currentDayIndex > 0 ? formatDayNumber(currentDayIndex) : ''}</span>
        </button>

        <div className="flex items-center gap-1.5">
          {trip.days.map((d, i) => (
            <button
              key={d.id}
              onClick={() => onSelectDay(d.id)}
              className={`w-2 h-2 rounded-full transition-all ${
                d.id === activeDay.id ? 'w-5 bg-emerald-600' : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
              title={t('dayNavTooltip', { n: i + 1, date: d.date })}
            />
          ))}
        </div>

        <button
          id="next-day-footer-btn"
          disabled={currentDayIndex >= trip.days.length - 1}
          onClick={() => {
            if (currentDayIndex < trip.days.length - 1) {
              onSelectDay(trip.days[currentDayIndex + 1].id);
            }
          }}
          className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:hover:text-neutral-600 transition-colors font-medium"
        >
          <span>{currentDayIndex < trip.days.length - 1 ? formatDayNumber(currentDayIndex + 2) : ''}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
