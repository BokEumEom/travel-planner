import { Trip, DayPlan, Waypoint, CRDTMessage, Collaborator } from '../types';

export interface CRDTOperation {
  opId: string;
  type:
    | 'UPDATE_TRIP_TITLE'
    | 'UPDATE_DAY_NOTES'
    | 'UPDATE_DAY_ORIGIN'
    | 'ADD_TAG'
    | 'REMOVE_TAG'
    | 'ADD_WAYPOINT'
    | 'UPDATE_WAYPOINT'
    | 'DELETE_WAYPOINT'
    | 'REORDER_WAYPOINTS'
    | 'SELECT_DAY'
    | 'FULL_STATE_SYNC';
  dayId?: string;
  timestamp: number;
  peerId: string;
  payload: any;
}

export class CRDTEngine {
  private peerId: string;
  private peerName: string;
  private peerColor: string;
  private lamportClock: number = 0;
  private tripState: Trip;
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(trip: Trip, lastOp?: CRDTOperation) => void> = new Set();
  private peerListeners: Set<(peers: Collaborator[]) => void> = new Set();
  private activePeers: Map<string, Collaborator> = new Map();
  private operationHistory: CRDTOperation[] = [];

  constructor(initialTrip: Trip, peerName = 'You (Host)', peerColor = '#10B981') {
    this.peerId = 'peer_' + Math.random().toString(36).substring(2, 9);
    this.peerName = peerName;
    this.peerColor = peerColor;
    this.tripState = JSON.parse(JSON.stringify(initialTrip));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('vibetrip_crdt_channel');
      this.channel.onmessage = (event) => this.handleIncomingMessage(event.data);

      // Announce presence
      this.broadcastPresence();

      // Setup periodic presence ping
      setInterval(() => {
        this.broadcastPresence();
        this.cleanupStalePeers();
      }, 5000);
    }
  }

  public getPeerId(): string {
    return this.peerId;
  }

  public getPeerName(): string {
    return this.peerName;
  }

  public getPeerColor(): string {
    return this.peerColor;
  }

  public getTrip(): Trip {
    return this.tripState;
  }

  public getOperationsCount(): number {
    return this.operationHistory.length;
  }

  public getActivePeers(): Collaborator[] {
    return Array.from(this.activePeers.values());
  }

  public subscribe(fn: (trip: Trip, lastOp?: CRDTOperation) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  public subscribePeers(fn: (peers: Collaborator[]) => void) {
    this.peerListeners.add(fn);
    return () => {
      this.peerListeners.delete(fn);
    };
  }

  private nextTimestamp(): number {
    this.lamportClock += 1;
    return Date.now() * 1000 + (this.lamportClock % 1000);
  }

  private notify() {
    this.tripState.updatedAt = Date.now();
    for (const listener of this.listeners) {
      listener(this.tripState, this.operationHistory[this.operationHistory.length - 1]);
    }
  }

  private notifyPeers() {
    const peerList = this.getActivePeers();
    for (const listener of this.peerListeners) {
      listener(peerList);
    }
  }

  public applyLocalOperation(
    type: CRDTOperation['type'],
    payload: any,
    dayId?: string
  ): CRDTOperation {
    const op: CRDTOperation = {
      opId: `${this.peerId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      dayId: dayId || this.tripState.activeDayId,
      timestamp: this.nextTimestamp(),
      peerId: this.peerId,
      payload,
    };

    this.applyOperation(op);
    this.broadcastOperation(op);
    return op;
  }

  public applyOperation(op: CRDTOperation): boolean {
    this.operationHistory.push(op);
    const day = this.tripState.days.find((d) => d.id === op.dayId) || this.tripState.days[0];

    switch (op.type) {
      case 'UPDATE_TRIP_TITLE':
        this.tripState.title = op.payload;
        break;

      case 'UPDATE_DAY_NOTES':
        if (day) day.notes = op.payload;
        break;

      case 'UPDATE_DAY_ORIGIN':
        if (day) day.origin = { ...day.origin, ...op.payload };
        break;

      case 'ADD_TAG':
        if (day && !day.tags.includes(op.payload)) {
          day.tags.push(op.payload);
        }
        break;

      case 'REMOVE_TAG':
        if (day) {
          day.tags = day.tags.filter((t) => t !== op.payload);
        }
        break;

      case 'ADD_WAYPOINT':
        if (day) {
          day.waypoints.push(op.payload);
        }
        break;

      case 'UPDATE_WAYPOINT':
        if (day) {
          const idx = day.waypoints.findIndex((w) => w.id === op.payload.id);
          if (idx !== -1) {
            day.waypoints[idx] = { ...day.waypoints[idx], ...op.payload };
          }
        }
        break;

      case 'DELETE_WAYPOINT':
        if (day) {
          day.waypoints = day.waypoints.filter((w) => w.id !== op.payload);
        }
        break;

      case 'REORDER_WAYPOINTS':
        if (day) {
          day.waypoints = op.payload;
        }
        break;

      case 'SELECT_DAY':
        this.tripState.activeDayId = op.payload;
        break;

      case 'FULL_STATE_SYNC':
        this.tripState = JSON.parse(JSON.stringify(op.payload));
        break;
    }

    this.notify();
    return true;
  }

  private broadcastOperation(op: CRDTOperation) {
    if (!this.channel) return;
    const message: CRDTMessage = {
      type: 'SYNC_UPDATE',
      peerId: this.peerId,
      peerName: this.peerName,
      peerColor: this.peerColor,
      timestamp: op.timestamp,
      payload: op,
    };
    this.channel.postMessage(message);
  }

  public broadcastPresence(cursor?: { lat: number; lng: number }, activeSection?: string) {
    if (!this.channel) return;
    const message: CRDTMessage = {
      type: 'PEER_PRESENCE',
      peerId: this.peerId,
      peerName: this.peerName,
      peerColor: this.peerColor,
      timestamp: Date.now(),
      payload: { cursor, activeSection },
    };
    this.channel.postMessage(message);
  }

  private handleIncomingMessage(msg: CRDTMessage) {
    if (!msg || msg.peerId === this.peerId) return;

    if (msg.type === 'PEER_PRESENCE') {
      this.activePeers.set(msg.peerId, {
        id: msg.peerId,
        name: msg.peerName || 'Collaborator',
        color: msg.peerColor || '#3B82F6',
        avatar: (msg.peerName || 'C')[0].toUpperCase(),
        lastActive: Date.now(),
        cursor: msg.payload?.cursor,
        activeSection: msg.payload?.activeSection,
      });
      this.notifyPeers();
    } else if (msg.type === 'SYNC_UPDATE' && msg.payload) {
      this.applyOperation(msg.payload);
    }
  }

  private cleanupStalePeers() {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of this.activePeers.entries()) {
      if (now - peer.lastActive > 15000) {
        this.activePeers.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.notifyPeers();
    }
  }

  public setTrip(trip: Trip) {
    this.tripState = JSON.parse(JSON.stringify(trip));
    this.applyLocalOperation('FULL_STATE_SYNC', this.tripState);
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}
