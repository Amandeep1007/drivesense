"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
      console.error("DriveSense offline support could not be registered.", error);
    });
  }, []);

  return null;
}
