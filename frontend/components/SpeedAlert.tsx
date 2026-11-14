"use client";

import { AlertTriangle, Check, CircleAlert } from "lucide-react";

import type { SpeedLevel } from "@/types/driving";

const copy = {
  normal: {
    icon: Check,
    title: "Looking good",
    detail: "You are below the caution threshold.",
  },
  caution: {
    icon: CircleAlert,
    title: "Ease back a little",
    detail: "You are in the application caution range.",
  },
  overspeed: {
    icon: AlertTriangle,
    title: "Speed warning",
    detail: "You have reached your configured warning threshold.",
  },
};

export default function SpeedAlert({
  level,
  visible,
}: {
  level: SpeedLevel;
  visible: boolean;
}) {
  if (!visible) return null;
  const { icon: Icon, title, detail } = copy[level];

  return (
    <div className={`speed-alert alert-${level}`} role="status" aria-live="polite">
      <span className="alert-icon">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
    </div>
  );
}