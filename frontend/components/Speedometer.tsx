"use client";

import { motion } from "framer-motion";

import type { SpeedLevel } from "@/types/driving";

export default function Speedometer({
  speedKmh,
  level,
}: {
  speedKmh: number | null;
  level: SpeedLevel;
}) {
  const speed = speedKmh === null ? null : Math.round(speedKmh);
  const progress = speed === null ? 0 : Math.min(Math.max(speed, 0), 180) / 180;
  const circumference = 2 * Math.PI * 94;

  return (
    <div
      className={`speedometer speedometer-${level}`}
      role="img"
      aria-label={
        speed === null
          ? "Vehicle speed unavailable"
          : `Current GPS speed ${speed} kilometres per hour`
      }
    >
      <svg className="speedometer-ring" viewBox="0 0 220 220" aria-hidden="true">
        <circle className="speedometer-track" cx="110" cy="110" r="94" />
        <motion.circle
          className="speedometer-progress"
          cx="110"
          cy="110"
          r="94"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
        <circle className="speedometer-inner-ring" cx="110" cy="110" r="77" />
      </svg>
      <div className="speedometer-readout">
        <strong>{speed === null ? "—" : speed}</strong>
        <span>km/h</span>
      </div>
      <span className="speedometer-caption">
        {speed === null ? "WAITING FOR GPS" : "LIVE GPS SPEED"}
      </span>
    </div>
  );
}
