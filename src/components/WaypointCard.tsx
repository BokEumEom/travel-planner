import React, { useState } from 'react';
import { 
  Bus, 
  Footprints, 
  Plane, 
  Train, 
  Car, 
  Ship,
  Pencil, 
  Trash2, 
  Check, 
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  GripVertical
} from 'lucide-react';
import { Waypoint, TravelMode } from '../types';
import { useI18n } from '../lib/i18n';

interface WaypointCardProps {
  waypoint: Waypoint;
  index: number;
  totalCount: number;
  onUpdate: (updated: Waypoint) => void;
  onDelete: (id: string) => void;
  onSelectOnMap: (waypoint: Waypoint) => void;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
  // Drag-and-drop properties
  isDragging?: boolean;
  isDragOver?: boolean;
  dropPosition?: 'above' | 'below' | null;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export const WaypointCard: React.FC<WaypointCardProps> = ({
  waypoint,
  index,
  totalCount,
  onUpdate,
  onDelete,
  onSelectOnMap,
  isHovered = false,
  onHover,
  isDragging = false,
  isDragOver = false,
  dropPosition = null,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
}) => {
  const { t, language, translateTravelMode } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(waypoint.name);
  const [notes, setNotes] = useState(waypoint.notes || '');
  const [travelMode, setTravelMode] = useState<TravelMode>(waypoint.travelMode);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const getTravelModeIcon = (mode: TravelMode) => {
    switch (mode) {
      case 'bus':
        return <Bus className="w-3.5 h-3.5" />;
      case 'walk':
        return <Footprints className="w-3.5 h-3.5" />;
      case 'flight':
        return <Plane className="w-3.5 h-3.5" />;
      case 'train':
        return <Train className="w-3.5 h-3.5" />;
      case 'car':
        return <Car className="w-3.5 h-3.5" />;
      case 'ferry':
        return <Ship className="w-3.5 h-3.5" />;
      default:
        return <Footprints className="w-3.5 h-3.5" />;
    }
  };

  const travelModes: TravelMode[] = ['walk', 'bus', 'train', 'flight', 'car', 'ferry'];

  const handleSave = () => {
    onUpdate({
      ...waypoint,
      name: name.trim() || waypoint.name,
      notes: notes.trim(),
      travelMode,
    });
    setIsEditing(false);
  };

  const handleQuickModeChange = (newMode: TravelMode) => {
    setTravelMode(newMode);
    setIsModeDropdownOpen(false);
    onUpdate({
      ...waypoint,
      travelMode: newMode,
    });
  };

  const waypointLabel = language === 'ko' ? `경유지 ${index + 1}` : `WAYPOINT ${index + 1}`;

  return (
    <div 
      id={`waypoint-card-${waypoint.id}`}
      draggable={!isEditing}
      onMouseEnter={() => onHover?.(waypoint.id)}
      onMouseLeave={() => onHover?.(null)}
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragEnter={(e) => onDragEnter?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDragLeave={(e) => onDragLeave?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative bg-white border rounded-xl p-3.5 transition-all select-none ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-dashed border-emerald-500/80 bg-emerald-50/40 shadow-inner'
          : isHovered
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
            : 'border-neutral-200/80 hover:border-neutral-300 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Visual Drop Target Indicators */}
      {isDragOver && dropPosition === 'above' && (
        <div 
          id={`drop-indicator-above-${waypoint.id}`}
          className="absolute -top-1.5 left-2 right-2 h-1 bg-emerald-500 rounded-full z-30 pointer-events-none shadow-sm animate-pulse"
        />
      )}
      {isDragOver && dropPosition === 'below' && (
        <div 
          id={`drop-indicator-below-${waypoint.id}`}
          className="absolute -bottom-1.5 left-2 right-2 h-1 bg-emerald-500 rounded-full z-30 pointer-events-none shadow-sm animate-pulse"
        />
      )}

      {!isEditing ? (
        <div className="flex items-start gap-2.5">
          {/* Drag Grab Handle on the Left */}
          <div
            className="shrink-0 pt-0.5 text-neutral-300 hover:text-neutral-600 group-hover:text-neutral-400 cursor-grab active:cursor-grabbing transition-colors"
            title={t('reorderHint')}
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0" onClick={() => onSelectOnMap(waypoint)}>
            {/* Waypoint number tag & Duration */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                {waypointLabel}
              </span>
              {waypoint.estimatedDuration && (
                <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                  <Clock className="w-3 h-3" />
                  {waypoint.estimatedDuration}
                </span>
              )}
            </div>

            {/* Waypoint Name */}
            <h4 className="text-sm font-bold text-neutral-900 truncate cursor-pointer hover:text-emerald-700 flex items-center gap-1.5">
              <span>{waypoint.name}</span>
              <MapPin className="w-3 h-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h4>

            {/* Optional Notes */}
            {waypoint.notes && (
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                {waypoint.notes}
              </p>
            )}

            {/* Travel Mode Pill */}
            <div className="mt-2.5 flex items-center gap-2 relative">
              <button
                id={`waypoint-travel-mode-btn-${waypoint.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModeDropdownOpen(!isModeDropdownOpen);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200/80 transition-colors border border-neutral-200/60"
                title={t('travelModeToNext')}
              >
                {getTravelModeIcon(waypoint.travelMode)}
                <span>{translateTravelMode(waypoint.travelMode)}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400 ml-0.5" />
              </button>

              {/* Travel Mode Dropdown */}
              {isModeDropdownOpen && (
                <div 
                  className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-neutral-200 rounded-lg shadow-xl py-1 w-32 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  {travelModes.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleQuickModeChange(mode)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-neutral-50 ${
                        waypoint.travelMode === mode
                          ? 'text-emerald-600 font-semibold bg-emerald-50/60'
                          : 'text-neutral-700'
                      }`}
                    >
                      {getTravelModeIcon(mode)}
                      <span>{translateTravelMode(mode)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons on the right: Move Up/Down, Edit, Delete */}
          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
            {/* Move Up */}
            <button
              id={`waypoint-move-up-btn-${waypoint.id}`}
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp?.(index);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
              title={t('moveUp')}
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Move Down */}
            <button
              id={`waypoint-move-down-btn-${waypoint.id}`}
              disabled={index >= totalCount - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown?.(index);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-20 disabled:hover:bg-transparent"
              title={t('moveDown')}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Edit */}
            <button
              id={`waypoint-edit-btn-${waypoint.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              title={t('edit')}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              id={`waypoint-delete-btn-${waypoint.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(waypoint.id);
              }}
              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title={t('delete')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block mb-1">
              {t('placeName')}
            </label>
            <input
              id={`waypoint-name-input-${waypoint.id}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-semibold px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white"
              placeholder={t('placeNamePlaceholder')}
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block mb-1">
              {t('travelModeToNext')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {travelModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTravelMode(mode)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    travelMode === mode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {getTravelModeIcon(mode)}
                  <span>{translateTravelMode(mode)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block mb-1">
              {t('notesTips')}
            </label>
            <textarea
              id={`waypoint-notes-input-${waypoint.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
              placeholder={t('notesTipsPlaceholder')}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
            <button
              id={`waypoint-cancel-edit-btn-${waypoint.id}`}
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              id={`waypoint-save-edit-btn-${waypoint.id}`}
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              {t('save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

