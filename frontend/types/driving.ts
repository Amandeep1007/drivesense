export type SpeedLevel = "normal" | "caution" | "overspeed";

export type SpeedSample = {
  at: string;
  speedKmh: number;
};

export type RecordedTrip = {
  id: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  distanceMeters: number;
  averageSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  overspeedEvents: number;
  samples: SpeedSample[];
};

export type Preferences = {
  speedThresholdKmh: number;
  audioAlerts: boolean;
  visualAlerts: boolean;
};

export type GeoPosition = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  speedKmh: number | null;
  timestamp: number;
};

export type GeolocationStatus =
  | "idle"
  | "connecting"
  | "active"
  | "denied"
  | "unavailable"
  | "timeout";

export type ModelStatus = {
  available: boolean;
  status: string;
  message: string;
  artifact_name: string | null;
  validated: boolean;
  prediction_supported: boolean;
};
