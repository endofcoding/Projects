export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

export interface SafetyFactor {
  name: string;
  score: number; // 0 to 100
  description: string;
  icon: string;
}

export interface RouteSafety {
  overallScore: number;
  factors: SafetyFactor[];
  tips: string[];
}

export interface Route {
  id: string;
  name: string;
  distance: string;
  duration: string;
  safety: RouteSafety;
  coordinates: [number, number][];
}

export interface SafetyReport {
  id: string;
  userId?: string;
  type: 'lighting' | 'construction' | 'crowded' | 'isolated' | 'other' | 'safe-haven';
  lat: number;
  lng: number;
  description: string;
  timestamp?: number;
  createdAt?: any;
  isVerified?: boolean;
}

export interface UserRoute {
  id: string;
  type: 'safe' | 'unsafe';
  coordinates: [number, number][];
  description?: string;
  comments?: string;
  intensity?: number; // 1-5
  timeOfDay?: 'day' | 'night' | 'always';
}

export interface NavigationState {
  isActive: boolean;
  currentStepIndex: number;
  currentPosition: [number, number];
  alert?: string;
  nextTurn?: string;
  distanceToNextTurn?: string;
  currentStreet?: string;
}
