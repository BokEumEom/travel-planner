import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Bus, 
  Footprints, 
  Plane, 
  Train, 
  Car, 
  Ship, 
  Plus, 
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { Waypoint, TravelMode } from '../types';
import { useI18n } from '../lib/i18n';

interface AddWaypointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWaypoint: (waypoint: Waypoint) => void;
  onEnableMapClickMode: () => void;
  currentDayTitle?: string;
}

const PRESET_SUGGESTIONS: Array<{
  name: string;
  lat: number;
  lng: number;
  defaultMode: TravelMode;
  notes: string;
  category: string;
}> = [
  {
    name: 'Circular Quay Ferry Terminal',
    lat: -33.8614,
    lng: 151.2108,
    defaultMode: 'ferry',
    notes: 'Iconic harbor ferry departures to Manly and Taronga Zoo.',
    category: 'Sydney',
  },
  {
    name: 'Sydney Opera House Forecourt',
    lat: -33.8568,
    lng: 151.2153,
    defaultMode: 'walk',
    notes: 'Jørn Utzon architectural landmark overlooking Port Jackson.',
    category: 'Sydney',
  },
  {
    name: 'The Rocks Historic District',
    lat: -33.8587,
    lng: 151.2081,
    defaultMode: 'walk',
    notes: 'Cobblestone lanes, open-air weekend markets, and heritage pubs.',
    category: 'Sydney',
  },
  {
    name: 'Darling Harbour & Barangaroo',
    lat: -33.8749,
    lng: 151.2009,
    defaultMode: 'walk',
    notes: 'Waterfront dining precinct and maritime museum.',
    category: 'Sydney',
  },
  {
    name: 'Taronga Zoo & Sky Safari',
    lat: -33.8433,
    lng: 151.2413,
    defaultMode: 'ferry',
    notes: 'Harbor view zoo featuring native Australian wildlife.',
    category: 'Sydney',
  },
  {
    name: 'Bondi to Coogee Coastal Walk',
    lat: -33.8915,
    lng: 151.2767,
    defaultMode: 'bus',
    notes: 'Spectacular 6km clifftop path passing scenic coves.',
    category: 'Sydney',
  },
  {
    name: 'Manly Beach & Corso',
    lat: -33.7998,
    lng: 151.2878,
    defaultMode: 'ferry',
    notes: '30-minute scenic harbor ferry from Circular Quay.',
    category: 'Sydney',
  },
  {
    name: 'Christchurch Airport (CHC)',
    lat: -43.4876,
    lng: 172.5369,
    defaultMode: 'flight',
    notes: 'Gateway to New Zealand South Island alpine journeys.',
    category: 'New Zealand',
  },
  {
    name: 'Christchurch Botanic Gardens & Avon River',
    lat: -43.5309,
    lng: 172.6209,
    defaultMode: 'walk',
    notes: 'Historic gardens and leisurely punt tours on the river.',
    category: 'New Zealand',
  },
  {
    name: 'Queenstown Lakefront & Gondola',
    lat: -45.0312,
    lng: 168.6626,
    defaultMode: 'flight',
    notes: 'Lake Wakatipu views, Remarkables mountain peaks.',
    category: 'New Zealand',
  },
];

export const AddWaypointModal: React.FC<AddWaypointModalProps> = ({
  isOpen,
  onClose,
  onAddWaypoint,
  onEnableMapClickMode,
  currentDayTitle,
}) => {
  const { t, translateTravelMode } = useI18n();

  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>('walk');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');

  if (!isOpen) return null;

  const travelModes: { mode: TravelMode; icon: any }[] = [
    { mode: 'walk', icon: Footprints },
    { mode: 'bus', icon: Bus },
    { mode: 'train', icon: Train },
    { mode: 'flight', icon: Plane },
    { mode: 'car', icon: Car },
    { mode: 'ferry', icon: Ship },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use default coordinates if not provided (near Sydney harbor center or provided)
    const lat = customLat ? parseFloat(customLat) : -33.8688 + (Math.random() - 0.5) * 0.02;
    const lng = customLng ? parseFloat(customLng) : 151.2093 + (Math.random() - 0.5) * 0.02;

    const newWp: Waypoint = {
      id: 'wp-' + Date.now().toString(36),
      name: name.trim(),
      lat,
      lng,
      travelMode,
      notes: notes.trim(),
    };

    onAddWaypoint(newWp);
    onClose();
  };

  const handleSelectPreset = (preset: typeof PRESET_SUGGESTIONS[0]) => {
    const newWp: Waypoint = {
      id: 'wp-' + Date.now().toString(36),
      name: preset.name,
      lat: preset.lat,
      lng: preset.lng,
      travelMode: preset.defaultMode,
      notes: preset.notes,
    };
    onAddWaypoint(newWp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4">
      <div 
        id="add-waypoint-modal-container"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">{t('addWaypointTitle')}</h3>
              <p className="text-xs text-neutral-500">
                {currentDayTitle || t('addWaypointSubtitle')}
              </p>
            </div>
          </div>
          <button
            id="close-add-waypoint-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Click Option Banner */}
        <div className="mx-5 mt-4 p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MousePointerClick className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs text-emerald-900 font-medium">
              {t('quickAddFromMapDesc')}
            </span>
          </div>
          <button
            id="pick-on-map-btn"
            onClick={() => {
              onClose();
              onEnableMapClickMode();
            }}
            className="text-xs font-semibold px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shrink-0"
          >
            {t('quickAddFromMap')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Waypoint Name */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              {t('placeName')}
            </label>
            <input
              id="new-waypoint-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('placeNamePlaceholder')}
              required
              className="w-full text-sm px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Travel Mode selection */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              {t('travelModeToNext')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {travelModes.map((item) => {
                const Icon = item.icon;
                const isSelected = travelMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setTravelMode(item.mode)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{translateTravelMode(item.mode)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
              {t('notesTips')}
            </label>
            <textarea
              id="new-waypoint-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesTipsPlaceholder')}
              rows={2}
              className="w-full text-xs px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Quick Preset Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-neutral-600">
                {t('recommendedPlaces')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {PRESET_SUGGESTIONS.slice(0, 8).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-neutral-200/60 rounded-md text-neutral-700 font-medium transition-colors"
                >
                  + {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              id="cancel-add-waypoint-btn"
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-800 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              id="confirm-add-waypoint-btn"
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('addWaypointTitle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
