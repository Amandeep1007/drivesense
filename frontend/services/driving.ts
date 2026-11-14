import type { RecordedTrip, SpeedLevel } from "@/types/driving";

export const DEFAULT_SPEED_THRESHOLD_KMH = 100;
export const CAUTION_SPEED_THRESHOLD_KMH = 80;
export const TRIPS_STORAGE_KEY = "drivesense.trips.v1";
export const PREFERENCES_STORAGE_KEY = "drivesense.preferences.v1";
export const THEME_STORAGE_KEY = "drivesense.theme.v1";

export function metersPerSecondToKmh(speedMps: number | null): number | null {
  if (speedMps === null || !Number.isFinite(speedMps) || speedMps < 0) {
    return null;
  }
  return speedMps * 3.6;
}

export function getSpeedLevel(
  speedKmh: number | null,
  thresholdKmh = DEFAULT_SPEED_THRESHOLD_KMH,
): SpeedLevel {
  if (speedKmh === null || !Number.isFinite(speedKmh)) return "normal";
  if (speedKmh >= thresholdKmh) return "overspeed";
  if (speedKmh >= CAUTION_SPEED_THRESHOLD_KMH) return "caution";
  return "normal";
}

export function haversineDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(latitudeB - latitudeA);
  const longitudeDelta = radians(longitudeB - longitudeA);
  const arc =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitudeA)) *
      Math.cos(radians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

export function readRecordedTrips(storage: Storage): RecordedTrip[] {
  const value = storage.getItem(TRIPS_STORAGE_KEY);
  if (value === null) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isRecordedTrip)) {
    throw new Error("Saved trip history has an invalid format.");
  }
  return parsed;
}

export function writeRecordedTrips(storage: Storage, trips: RecordedTrip[]): void {
  storage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
}

function isRecordedTrip(value: unknown): value is RecordedTrip {
  if (!value || typeof value !== "object") return false;
  const trip = value as Record<string, unknown>;
  if (
    typeof trip.id !== "string" ||
    typeof trip.startedAt !== "string" ||
    !Number.isFinite(Date.parse(trip.startedAt)) ||
    typeof trip.endedAt !== "string" ||
    !Number.isFinite(Date.parse(trip.endedAt)) ||
    typeof trip.durationSeconds !== "number" ||
    !Number.isFinite(trip.durationSeconds) ||
    trip.durationSeconds < 0 ||
    typeof trip.distanceMeters !== "number" ||
    !Number.isFinite(trip.distanceMeters) ||
    trip.distanceMeters < 0 ||
    typeof trip.overspeedEvents !== "number" ||
    !Number.isInteger(trip.overspeedEvents) ||
    trip.overspeedEvents < 0 ||
    !(trip.averageSpeedKmh === null || isNonNegativeNumber(trip.averageSpeedKmh)) ||
    !(trip.maxSpeedKmh === null || isNonNegativeNumber(trip.maxSpeedKmh)) ||
    !Array.isArray(trip.samples)
  ) {
    return false;
  }
  return trip.samples.every(
    (sample: unknown) =>
      !!sample &&
      typeof sample === "object" &&
      "at" in sample &&
      typeof sample.at === "string" &&
      Number.isFinite(Date.parse(sample.at)) &&
      "speedKmh" in sample &&
      isNonNegativeNumber(sample.speedKmh),
  );
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
