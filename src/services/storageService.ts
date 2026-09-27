import { Trip } from '../types';
import { INITIAL_TRIP, PRESET_TRIPS } from '../data/initialTrip';

const DB_NAME = 'VibeTripStorageDB';
const DB_VERSION = 1;
const STORE_ITINERARIES = 'itineraries';
const STORE_METADATA = 'metadata';

const STORAGE_KEYS = {
  ACTIVE_TRIP: 'vibetrip_active_trip_v2',
  CUSTOM_TRIPS: 'vibetrip_custom_trips_v2',
  TRIPS_MAP: 'vibetrip_all_saved_trips_v2',
  LAST_SAVED: 'vibetrip_last_saved_timestamp',
  LEGACY_DATA: 'vibetrip_crdt_data',
};

export interface StorageState {
  activeTrip: Trip;
  customTrips: Trip[];
  savedTripsMap: Record<string, Trip>;
  lastSavedAt: number | null;
}

type SaveListener = (state: { status: 'saving' | 'saved' | 'idle'; lastSavedAt: number | null }) => void;
const saveListeners: Set<SaveListener> = new Set();

function notifySaveStatus(status: 'saving' | 'saved' | 'idle', lastSavedAt: number | null) {
  for (const listener of saveListeners) {
    listener({ status, lastSavedAt });
  }
}

export function subscribeSaveStatus(listener: SaveListener) {
  saveListeners.add(listener);
  return () => {
    saveListeners.delete(listener);
  };
}

/**
 * Open native IndexedDB safely with fallback to null on sandboxed/private browsing
 */
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_ITINERARIES)) {
          db.createObjectStore(STORE_ITINERARIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Asynchronously mirror data into IndexedDB for persistent, high-capacity storage
 */
async function saveToIndexedDB(
  activeTrip: Trip,
  customTrips: Trip[],
  tripsMap: Record<string, Trip>
): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction([STORE_ITINERARIES, STORE_METADATA], 'readwrite');
      const itinStore = tx.objectStore(STORE_ITINERARIES);
      const metaStore = tx.objectStore(STORE_METADATA);

      // Store all trips in the itineraries store
      const allTripsToStore: Trip[] = [activeTrip, ...customTrips, ...Object.values(tripsMap)];
      const seenIds = new Set<string>();

      for (const t of allTripsToStore) {
        if (t && t.id && !seenIds.has(t.id)) {
          seenIds.add(t.id);
          itinStore.put(t);
        }
      }

      // Store metadata
      metaStore.put({ key: 'activeTripId', value: activeTrip.id, updatedAt: Date.now() });
      metaStore.put({ key: 'customTripIds', value: customTrips.map((ct) => ct.id), updatedAt: Date.now() });
      metaStore.put({ key: 'lastSavedAt', value: Date.now(), updatedAt: Date.now() });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Validates whether an object is a legitimate Trip structure
 */
function isValidTrip(t: any): t is Trip {
  return (
    t &&
    typeof t === 'object' &&
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    Array.isArray(t.days) &&
    t.days.length > 0 &&
    typeof t.activeDayId === 'string'
  );
}

/**
 * Loads synchronously from LocalStorage on app initialization for 0ms hydration,
 * with legacy migration and validation.
 */
export function loadInitialStorageState(): StorageState {
  if (typeof window === 'undefined') {
    return {
      activeTrip: INITIAL_TRIP,
      customTrips: [],
      savedTripsMap: {},
      lastSavedAt: null,
    };
  }

  try {
    // 1. Load custom trips
    let customTrips: Trip[] = [];
    const rawCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_TRIPS);
    if (rawCustom) {
      try {
        const parsed = JSON.parse(rawCustom);
        if (Array.isArray(parsed)) {
          customTrips = parsed.filter(isValidTrip);
        }
      } catch {
        // invalid JSON
      }
    }

    // 2. Load saved trips map (holds modified presets or user trips)
    let savedTripsMap: Record<string, Trip> = {};
    const rawMap = localStorage.getItem(STORAGE_KEYS.TRIPS_MAP);
    if (rawMap) {
      try {
        const parsed = JSON.parse(rawMap);
        if (parsed && typeof parsed === 'object') {
          for (const [k, v] of Object.entries(parsed)) {
            if (isValidTrip(v)) {
              savedTripsMap[k] = v;
            }
          }
        }
      } catch {
        // invalid JSON
      }
    }

    // 3. Load active trip
    let activeTrip: Trip | null = null;
    const rawActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP);
    if (rawActive) {
      try {
        const parsed = JSON.parse(rawActive);
        if (isValidTrip(parsed)) {
          activeTrip = parsed;
        }
      } catch {
        // ignore
      }
    }

    // Legacy fallback check (from vibetrip_crdt_data)
    if (!activeTrip) {
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_DATA);
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw);
          if (isValidTrip(parsed)) {
            activeTrip = parsed;
          }
        } catch {
          // ignore
        }
      }
    }

    // 4. Last saved timestamp
    let lastSavedAt: number | null = null;
    const rawLastSaved = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    if (rawLastSaved) {
      const ts = Number(rawLastSaved);
      if (!isNaN(ts)) lastSavedAt = ts;
    }

    // If still no valid active trip, fallback to default INITIAL_TRIP
    if (!activeTrip) {
      activeTrip = INITIAL_TRIP;
    }

    return {
      activeTrip,
      customTrips,
      savedTripsMap,
      lastSavedAt,
    };
  } catch (err) {
    console.warn('[Storage] Failed to read from localStorage:', err);
    return {
      activeTrip: INITIAL_TRIP,
      customTrips: [],
      savedTripsMap: {},
      lastSavedAt: null,
    };
  }
}

// Debounce timer for auto-saving
let saveTimeout: any = null;
let pendingState: { activeTrip: Trip; customTrips: Trip[]; tripsMap: Record<string, Trip> } | null = null;

/**
 * Immediately flushes the latest state synchronously into LocalStorage and asynchronously into IndexedDB.
 */
export function flushSyncStorage(
  activeTrip: Trip,
  customTrips: Trip[],
  tripsMap: Record<string, Trip> = {}
): void {
  if (typeof window === 'undefined') return;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  pendingState = null;

  try {
    notifySaveStatus('saving', null);
    const now = Date.now();

    // Update the trips map with the latest activeTrip
    const updatedMap: Record<string, Trip> = {
      ...tripsMap,
      [activeTrip.id]: activeTrip,
    };

    localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP, JSON.stringify(activeTrip));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TRIPS, JSON.stringify(customTrips));
    localStorage.setItem(STORAGE_KEYS.TRIPS_MAP, JSON.stringify(updatedMap));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, String(now));

    // Mirror to IndexedDB
    saveToIndexedDB(activeTrip, customTrips, updatedMap);

    notifySaveStatus('saved', now);
  } catch (err) {
    console.warn('[Storage] Error flushing to localStorage:', err);
    notifySaveStatus('idle', null);
  }
}

/**
 * Automatically debounces saving to browser storage (LocalStorage + IndexedDB).
 * Ensures smooth typing and performance while guaranteeing automatic persistence.
 */
export function autoSaveItineraries(
  activeTrip: Trip,
  customTrips: Trip[],
  tripsMap: Record<string, Trip> = {},
  delayMs = 300
): void {
  if (typeof window === 'undefined') return;

  pendingState = { activeTrip, customTrips, tripsMap };
  notifySaveStatus('saving', null);

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    if (pendingState) {
      flushSyncStorage(
        pendingState.activeTrip,
        pendingState.customTrips,
        pendingState.tripsMap
      );
    }
  }, delayMs);
}

/**
 * Clears stored itineraries and restores default presets
 */
export function resetAllStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TRIP);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_TRIPS);
    localStorage.removeItem(STORAGE_KEYS.TRIPS_MAP);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_DATA);

    // Also clear IndexedDB if accessible
    openIndexedDB().then((db) => {
      if (!db) return;
      try {
        const tx = db.transaction([STORE_ITINERARIES, STORE_METADATA], 'readwrite');
        tx.objectStore(STORE_ITINERARIES).clear();
        tx.objectStore(STORE_METADATA).clear();
      } catch {
        // ignore
      }
    });

    notifySaveStatus('idle', null);
  } catch (err) {
    console.warn('[Storage] Error resetting storage:', err);
  }
}

// Global safety listener: flush any pending debounced save when user closes tab or refreshes
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (pendingState) {
      try {
        const now = Date.now();
        const updatedMap = {
          ...pendingState.tripsMap,
          [pendingState.activeTrip.id]: pendingState.activeTrip,
        };
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP, JSON.stringify(pendingState.activeTrip));
        localStorage.setItem(STORAGE_KEYS.CUSTOM_TRIPS, JSON.stringify(pendingState.customTrips));
        localStorage.setItem(STORAGE_KEYS.TRIPS_MAP, JSON.stringify(updatedMap));
        localStorage.setItem(STORAGE_KEYS.LAST_SAVED, String(now));
      } catch {
        // ignore
      }
    }
  });
}
