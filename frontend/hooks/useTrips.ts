"use client";

import { useCallback, useEffect, useState } from "react";

import {
  readRecordedTrips,
  writeRecordedTrips,
} from "@/services/driving";
import type { RecordedTrip } from "@/types/driving";

export function useTrips() {
  const [trips, setTrips] = useState<RecordedTrip[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTrips(readRecordedTrips(window.localStorage));
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to read this device's trip history.",
      );
    } finally {
      setReady(true);
    }
  }, []);

  const addTrip = useCallback((trip: RecordedTrip) => {
    try {
      const updated = [trip, ...readRecordedTrips(window.localStorage)];
      writeRecordedTrips(window.localStorage, updated);
      setTrips(updated);
      setError(null);
      return true;
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to save this trip on the device.",
      );
      return false;
    }
  }, []);

  const clearTrips = useCallback(() => {
    try {
      writeRecordedTrips(window.localStorage, []);
      setTrips([]);
      setError(null);
      return true;
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to clear this device's trip history.",
      );
      return false;
    }
  }, []);

  return { trips, ready, error, addTrip, clearTrips };
}
