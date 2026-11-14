import type { GeolocationStatus } from "@/types/driving";

type GeolocationIssue = {
  status: Extract<GeolocationStatus, "denied" | "timeout" | "unavailable">;
  message: string;
};

export function getGeolocationIssue(code: number): GeolocationIssue {
  if (code === 1) {
    return {
      status: "denied",
      message:
        "Location access was denied. Allow location access in your browser to use Live Drive.",
    };
  }
  if (code === 3) {
    return {
      status: "timeout",
      message:
        "GPS has not responded yet. Keep the page open and check that device location is enabled.",
    };
  }
  return {
    status: "unavailable",
    message:
      "Your device could not provide a location. Check its location settings and try again.",
  };
}
