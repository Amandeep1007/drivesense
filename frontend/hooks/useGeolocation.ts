"use client";

import { useEffect, useState } from "react";

import { metersPerSecondToKmh } from "@/services/driving";
import { getGeolocationIssue } from "@/services/geolocation";
import type { GeoPosition, GeolocationStatus } from "@/types/driving";

type GeolocationState = {
  position: GeoPosition | null;
  status: GeolocationStatus;
  error: string | null;
};

export function useGeolocation(enabled: boolean) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    status: "idle",
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setState({
        position: null,
        status: "unavailable",
        error: "This browser does not support device geolocation.",
      });
      return;
    }

    setState({ position: null, status: "connecting", error: null });
    const watchId = navigator.geolocation.watchPosition(
      (location) => {
        setState({
          position: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracyMeters: location.coords.accuracy,
            speedKmh: metersPerSecondToKmh(location.coords.speed),
            timestamp: location.timestamp,
          },
          status: "active",
          error: null,
        });
      },
      (error) => {
        const issue = getGeolocationIssue(error.code);
        setState((current) => ({
          ...current,
          position: null,
          status: issue.status,
          error: issue.message,
        }));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setState({ position: null, status: "idle", error: null });
    }
  }, [enabled]);

  return state;
}