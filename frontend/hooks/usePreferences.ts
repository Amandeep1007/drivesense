"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_SPEED_THRESHOLD_KMH,
  PREFERENCES_STORAGE_KEY,
} from "@/services/driving";
import type { Preferences } from "@/types/driving";

const defaultPreferences: Preferences = {
  speedThresholdKmh: DEFAULT_SPEED_THRESHOLD_KMH,
  audioAlerts: false,
  visualAlerts: true,
};

export function usePreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed === "object" &&
          "speedThresholdKmh" in parsed &&
          typeof parsed.speedThresholdKmh === "number" &&
          parsed.speedThresholdKmh >= 80 &&
          parsed.speedThresholdKmh <= 180 &&
          "audioAlerts" in parsed &&
          typeof parsed.audioAlerts === "boolean" &&
          "visualAlerts" in parsed &&
          typeof parsed.visualAlerts === "boolean"
        ) {
          setPreferences({
            speedThresholdKmh: parsed.speedThresholdKmh,
            audioAlerts: parsed.audioAlerts,
            visualAlerts: parsed.visualAlerts,
          });
        } else {
          throw new Error("Saved preferences have an invalid format.");
        }
      }
      setReady(true);
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to read saved preferences.",
      );
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        PREFERENCES_STORAGE_KEY,
        JSON.stringify(preferences),
      );
      setError(null);
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? storageError.message
          : "Unable to save preferences.",
      );
    }
  }, [preferences, ready]);

  return { preferences, setPreferences, error };
}
