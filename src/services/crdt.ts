import { Trip, Collaborator, CRDTMessage } from '../types';

export type CRDTListener = (trip: Trip, remotePeer?: { name: string; color: string }) => void;
export type PresenceListener = (collaborators: Collaborator[]) => void;

class CRDTEngine {
  private channel: BroadcastChannel | null = null;
  public peerId: string;
  public peerName: string;
  public peerColor: string;
  private tripListeners: Set<CRDTListener> = new Set();
  private presenceListeners: Set<PresenceListener> = new Set();
  private collaborators: Map<string, Collaborator> = new Map();
  private lamportClock: number = 0;
  private currentTrip: Trip | null = null;
  private simulationInterval: any = null;

  constructor() {
    this.peerId = 'peer-' + Math.random().toString(36).substring(2, 9);
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
    this.peerColor = colors[Math.floor(Math.random() * colors.length)];
    this.peerName = 'Planner ' + this.peerId.slice(-3).toUpperCase();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('vibetrip_crdt_sync_v1');
      this.channel.onmessage = this.handleMessage.bind(this);
    }

    // Add self to collaborators
    this.collaborators.set(this.peerId, {
      id: this.peerId,
      name: 'You (' + this.peerName + ')',
      avatar: this.peerName.charAt(0),
      color: this.peerColor,
      lastActive: Date.now(),
    });

    // Heartbeat for presence
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.broadcastPresence();
        this.cleanStaleCollaborators();
      }, 4000);
    }
  }

  public init(initialTrip: Trip): Trip {
    // Check localStorage first
    const saved = localStorage.getItem('vibetrip_crdt_data');
    if (saved) {
      try {
        this.currentTrip = JSON.parse(saved);
      } catch (e) {
        this.currentTrip = initialTrip;
      }
    } else {
      this.currentTrip = initialTrip;
    }
    this.broadcastPresence();
    return this.currentTrip || initialTrip;
  }

  public subscribeTrip(listener: CRDTListener) {
    this.tripListeners.add(listener);
    return () => {
      this.tripListeners.delete(listener);
    };
  }

  public subscribePresence(listener: PresenceListener) {
    this.presenceListeners.add(listener);
    listener(Array.from(this.collaborators.values()));
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  public getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values());
  }

  public updateTrip(updatedTrip: Trip, origin: 'local' | 'remote' = 'local') {
    this.lamportClock++;
    const mergedTrip: Trip = {
      ...updatedTrip,
      updatedAt: Date.now(),
    };
    this.currentTrip = mergedTrip;

    // Persist
    try {
      localStorage.setItem('vibetrip_crdt_data', JSON.stringify(mergedTrip));
    } catch (e) {
      // ignore quota errors
    }

    if (origin === 'local') {
      this.broadcastTrip(mergedTrip);
    }

    this.notifyTripListeners(mergedTrip);
  }

  private broadcastTrip(trip: Trip) {
    if (!this.channel) return;
    const msg: CRDTMessage = {
      type: 'SYNC_UPDATE',
      peerId: this.peerId,
      peerName: this.peerName,
      peerColor: this.peerColor,
      timestamp: Date.now(),
      payload: trip,
    };
    this.channel.postMessage(msg);
  }

  public broadcastPresence(activeSection?: string) {
    if (!this.channel) return;
    const self = this.collaborators.get(this.peerId);
    if (self) {
      self.lastActive = Date.now();
      if (activeSection) self.activeSection = activeSection;
    }
    const msg: CRDTMessage = {
      type: 'PEER_PRESENCE',
      peerId: this.peerId,
      peerName: this.peerName,
      peerColor: this.peerColor,
      timestamp: Date.now(),
      payload: { activeSection },
    };
    this.channel.postMessage(msg);
    this.notifyPresenceListeners();
  }

  private handleMessage(event: MessageEvent) {
    const msg = event.data as CRDTMessage;
    if (!msg || msg.peerId === this.peerId) return;

    if (msg.type === 'PEER_PRESENCE') {
      this.collaborators.set(msg.peerId, {
        id: msg.peerId,
        name: msg.peerName || 'Peer',
        avatar: (msg.peerName || 'P').charAt(0),
        color: msg.peerColor || '#3B82F6',
        lastActive: Date.now(),
        activeSection: msg.payload?.activeSection,
      });
      this.notifyPresenceListeners();
    } else if (msg.type === 'SYNC_UPDATE') {
      const incomingTrip = msg.payload as Trip;
      if (incomingTrip) {
        this.currentTrip = incomingTrip;
        try {
          localStorage.setItem('vibetrip_crdt_data', JSON.stringify(incomingTrip));
        } catch (e) {}

        this.notifyTripListeners(incomingTrip, {
          name: msg.peerName || 'Collaborator',
          color: msg.peerColor || '#3B82F6',
        });
      }
    }
  }

  private cleanStaleCollaborators() {
    const now = Date.now();
    let changed = false;
    for (const [id, collab] of this.collaborators.entries()) {
      if (id !== this.peerId && !collab.isSimulated && now - collab.lastActive > 12000) {
        this.collaborators.delete(id);
        changed = true;
      }
    }
    if (changed) this.notifyPresenceListeners();
  }

  private notifyTripListeners(trip: Trip, remotePeer?: { name: string; color: string }) {
    this.tripListeners.forEach((fn) => fn(trip, remotePeer));
  }

  private notifyPresenceListeners() {
    const list = Array.from(this.collaborators.values());
    this.presenceListeners.forEach((fn) => fn(list));
  }

  // Live simulation of a remote co-planner (e.g. Cyandev / Alex)
  public toggleSimulation(enable: boolean, onAction?: (actionDesc: string) => void) {
    const simId = 'peer-sim-cyan';

    if (!enable) {
      if (this.simulationInterval) clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      this.collaborators.delete(simId);
      this.notifyPresenceListeners();
      return;
    }

    // Add simulated peer
    this.collaborators.set(simId, {
      id: simId,
      name: 'Cyan (@unixzii)',
      avatar: 'C',
      color: '#06B6D4',
      isSimulated: true,
      lastActive: Date.now(),
      activeSection: 'Waypoints',
    });
    this.notifyPresenceListeners();

    // Perform co-editing action every 6-8 seconds
    const simulatedActions = [
      (trip: Trip) => {
        const activeDay = trip.days.find((d) => d.id === trip.activeDayId) || trip.days[0];
        if (!activeDay) return trip;
        if (!activeDay.tags.includes('Scenic Views')) {
          const updated = {
            ...trip,
            days: trip.days.map((d) =>
              d.id === activeDay.id ? { ...d, tags: [...d.tags, 'Scenic Views'] } : d
            ),
          };
          onAction?.('Cyan added tag "Scenic Views" to ' + activeDay.title);
          return updated;
        }
        return trip;
      },
      (trip: Trip) => {
        const activeDay = trip.days.find((d) => d.id === trip.activeDayId) || trip.days[0];
        if (!activeDay) return trip;
        const exists = activeDay.waypoints.some((w) => w.name.includes('Barangaroo'));
        if (!exists && activeDay.dayNumber === 1) {
          const newWp = {
            id: 'wp-sim-' + Date.now(),
            name: 'Barangaroo Reserve',
            lat: -33.8588,
            lng: 151.2014,
            travelMode: 'walk' as const,
            notes: 'Harbour foreshore park with native flora',
            estimatedDuration: '15 min',
          };
          const updated = {
            ...trip,
            days: trip.days.map((d) =>
              d.id === activeDay.id ? { ...d, waypoints: [...d.waypoints, newWp] } : d
            ),
          };
          onAction?.('Cyan added waypoint "Barangaroo Reserve" (CRDT merged)');
          return updated;
        }
        return trip;
      },
      (trip: Trip) => {
        const activeDay = trip.days.find((d) => d.id === trip.activeDayId) || trip.days[0];
        if (!activeDay) return trip;
        const noteAddition = activeDay.notes.includes('Don’t forget sunscreen!')
          ? ''
          : ' Don’t forget sunscreen!';
        if (noteAddition) {
          const updated = {
            ...trip,
            days: trip.days.map((d) =>
              d.id === activeDay.id ? { ...d, notes: d.notes + noteAddition } : d
            ),
          };
          onAction?.('Cyan edited Day plan notes (CRDT sync)');
          return updated;
        }
        return trip;
      },
    ];

    let actionIndex = 0;
    this.simulationInterval = setInterval(() => {
      if (!this.currentTrip) return;
      const fn = simulatedActions[actionIndex % simulatedActions.length];
      actionIndex++;
      const nextTrip = fn(this.currentTrip);
      if (nextTrip !== this.currentTrip) {
        this.updateTrip(nextTrip, 'local');
      }
    }, 7000);
  }
}

export const crdtEngine = new CRDTEngine();
