export enum EmergencyType {
  GENERAL = 'General',
  MEDICAL = 'Medical',
  VIOLENCE = 'Violence',
  ACCIDENT = 'Accident',
  FIRE = 'Fire',
  HARASSMENT = 'Harassment'
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyAlert {
  id: string;
  type: EmergencyType;
  distance: number; // in meters
  timestamp: Date;
  location: Coordinates;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export interface GeminiAdviceResponse {
  steps: string[];
  safetyTip: string;
}

export type GestureShape = 'S' | 'Circle' | 'Z';

export interface UserSettings {
  enableShake: boolean;
  enableSwipeS: boolean;
  stealthGestureShape: GestureShape;
  enableIncomingAlerts: boolean;
  enableAlertSound: boolean;
}