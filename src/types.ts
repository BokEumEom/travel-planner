export type TravelMode = 'bus' | 'walk' | 'train' | 'flight' | 'car' | 'ferry';

export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  travelMode: TravelMode;
  notes?: string;
  time?: string;
  estimatedDuration?: string;
}

export interface Origin {
  name: string;
  lat: number;
  lng: number;
}

export interface DayPlan {
  id: string;
  date: string; // e.g., '2026-07-03'
  dayNumber: number;
  title?: string;
  origin: Origin;
  tags: string[];
  notes: string;
  waypoints: Waypoint[];
}

export interface Trip {
  id: string;
  title: string;
  days: DayPlan[];
  activeDayId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isSimulated?: boolean;
  lastActive: number;
  cursor?: { lat: number; lng: number };
  activeSection?: string;
}

export interface CRDTMessage {
  type: 'SYNC_UPDATE' | 'PEER_PRESENCE' | 'PEER_TYPING' | 'PING';
  peerId: string;
  peerName?: string;
  peerColor?: string;
  timestamp: number;
  payload?: any;
}

export interface WeatherData {
  cityName: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  icon: string;
  iconUrl: string | null;
  humidity: number;
  windSpeed: number;
  pressure: number;
  isLive: boolean;
  source: string;
}

