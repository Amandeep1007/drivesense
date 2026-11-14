"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Crosshair,
  Gauge,
  MapPin,
  Pause,
  Play,
  Radio,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";

import LiveMap from "@/components/LiveMap";
import SpeedAlert from "@/components/SpeedAlert";
import Speedometer from "@/components/Speedometer";
import { useGeolocation } from "@/hooks/useGeolocation";
import { usePreferences } from "@/hooks/usePreferences";
import { useTrips } from "@/hooks/useTrips";
import { getSpeedLevel, haversineDistanceMeters } from "@/services/driving";
import type { GeoPosition, RecordedTrip, SpeedSample } from "@/types/driving";

type TripMetrics = {
  distanceMeters: number;
  samples: SpeedSample[];
  maxSpeedKmh: number | null;
  overspeedEvents: number;
  lastOverspeed: boolean;
  previousAccuratePosition: GeoPosition | null;
};

function createEmptyMetrics(): TripMetrics {
  return {
    distanceMeters: 0,
    samples: [],
    maxSpeedKmh: null,
    overspeedEvents: 0,
    lastOverspeed: false,
    previousAccuratePosition: null,
  };
}

function accuracyLabel(accuracy: number): string {
  if (accuracy <= 20) return "Good";
  if (accuracy <= 50) return "Fair";
  return "Low";
}

export default function LiveDrivePage() {
  const [watching, setWatching] = useState(false);
  const [recording, setRecording] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const { position, status, error: gpsError } = useGeolocation(watching);
  const { preferences, setPreferences, error: preferenceError } = usePreferences();
  const { addTrip, error: tripsError } = useTrips();
  const metricsRef = useRef<TripMetrics>(createEmptyMetrics());
  const lastSampleAtRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastLevelRef = useRef("normal");
  const speedKmh = status === "active" ? position?.speedKmh ?? null : null;
  const level = getSpeedLevel(speedKmh, preferences.speedThresholdKmh);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("drivesense:recording", { detail: recording }));
  }, [recording]);

  useEffect(() => {
    if (!recording) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [recording]);

  useEffect(() => {
    if (!recording || !position) return;
    const metrics = metricsRef.current;
    if (position.accuracyMeters <= 50) {
      if (metrics.previousAccuratePosition) {
        metrics.distanceMeters += haversineDistanceMeters(
          metrics.previousAccuratePosition.latitude,
          metrics.previousAccuratePosition.longitude,
          position.latitude,
          position.longitude,
        );
      }
      metrics.previousAccuratePosition = position;
    }

    if (position.speedKmh !== null) {
      metrics.maxSpeedKmh =
        metrics.maxSpeedKmh === null
          ? position.speedKmh
          : Math.max(metrics.maxSpeedKmh, position.speedKmh);
      if (
        position.timestamp - lastSampleAtRef.current >= 5_000 ||
        metrics.samples.length === 0
      ) {
        metrics.samples.push({
          at: new Date(position.timestamp).toISOString(),
          speedKmh: position.speedKmh,
        });
        lastSampleAtRef.current = position.timestamp;
      }
      const overspeed = position.speedKmh >= preferences.speedThresholdKmh;
      if (overspeed && !metrics.lastOverspeed) metrics.overspeedEvents += 1;
      metrics.lastOverspeed = overspeed;
    } else {
      metrics.lastOverspeed = false;
    }
  }, [position, preferences.speedThresholdKmh, recording]);

  useEffect(() => {
    if (!recording || startedAt === null) return;
    const updateDuration = () =>
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    updateDuration();
    const timer = window.setInterval(updateDuration, 1000);
    return () => window.clearInterval(timer);
  }, [recording, startedAt]);

  useEffect(() => {
    if (level !== "overspeed") {
      lastLevelRef.current = level;
      return;
    }
    if (lastLevelRef.current === "overspeed") return;
    lastLevelRef.current = level;
    if (!preferences.audioAlerts || !audioContextRef.current) return;
    const context = audioContextRef.current;
    const play = () => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 740;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.24);
    };
    context.resume().then(play).catch((audioFailure: unknown) => {
      setAudioError(
        audioFailure instanceof Error
          ? audioFailure.message
          : "The browser could not play the speed alert.",
      );
    });
  }, [level, preferences.audioAlerts]);

  useEffect(
    () => () => {
      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        context.close().catch((audioFailure: unknown) => {
          console.error("DriveSense audio context could not be closed.", audioFailure);
        });
      }
    },
    [],
  );

  async function enableAudioForDrive() {
    if (!preferences.audioAlerts || typeof window === "undefined") return;
    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextConstructor) {
      setAudioError("Audio alerts are not supported by this browser.");
      return;
    }
    try {
      const context =
        audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = context;
      await context.resume();
      setAudioError(null);
    } catch (audioFailure) {
      setAudioError(
        audioFailure instanceof Error
          ? audioFailure.message
          : "Unable to enable audio alerts.",
      );
    }
  }

  async function startDrive() {
    metricsRef.current = createEmptyMetrics();
    lastSampleAtRef.current = 0;
    setSessionNotice(null);
    setElapsedSeconds(0);
    const now = Date.now();
    setStartedAt(now);
    setRecording(true);
    setWatching(true);
    await enableAudioForDrive();
  }

  function stopDrive() {
    const endedAt = Date.now();
    setRecording(false);
    setWatching(false);
    const metrics = metricsRef.current;
    if (metrics.samples.length === 0 && metrics.distanceMeters === 0) {
      setSessionNotice(
        "No trip was saved because your device did not provide usable GPS speed or distance readings.",
      );
      setStartedAt(null);
      setElapsedSeconds(0);
      metricsRef.current = createEmptyMetrics();
      return;
    }
    const averageSpeed =
      metrics.samples.length === 0
        ? null
        : metrics.samples.reduce((sum, sample) => sum + sample.speedKmh, 0) /
          metrics.samples.length;
    const trip: RecordedTrip = {
      id: crypto.randomUUID(),
      startedAt: new Date(startedAt ?? endedAt).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      durationSeconds: Math.max(
        0,
        Math.floor((endedAt - (startedAt ?? endedAt)) / 1000),
      ),
      distanceMeters: metrics.distanceMeters,
      averageSpeedKmh: averageSpeed,
      maxSpeedKmh: metrics.maxSpeedKmh,
      overspeedEvents: metrics.overspeedEvents,
      samples: metrics.samples.slice(-720),
    };
    addTrip(trip);
    setStartedAt(null);
    setElapsedSeconds(0);
    metricsRef.current = createEmptyMetrics();
  }

  function toggleAudio() {
    setPreferences((current) => ({ ...current, audioAlerts: !current.audioAlerts }));
    setAudioError(null);
  }

  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;
  const distanceKm = metricsRef.current.distanceMeters / 1000;

  return (
    <div className="page-content live-page">
      <motion.section
        className={`live-drive-card surface-card live-${level}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="live-card-head">
          <span className="live-status">
            <span className={`status-dot ${status === "active" ? "dot-active" : ""}`} />
            {status === "active"
              ? "GPS CONNECTED"
              : status === "connecting"
                ? "SEARCHING FOR GPS"
                : recording
                  ? "WAITING FOR GPS"
                  : "DRIVE SESSION"}
          </span>
          <button
            className={`audio-toggle${preferences.audioAlerts ? " audio-on" : ""}`}
            onClick={toggleAudio}
            type="button"
            aria-pressed={preferences.audioAlerts}
          >
            {preferences.audioAlerts ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Audio {preferences.audioAlerts ? "on" : "off"}</span>
          </button>
        </div>

        <div className="live-main-grid">
          <div className="speed-side">
            <Speedometer speedKmh={speedKmh} level={level} />
            <SpeedAlert
              level={level}
              visible={preferences.visualAlerts && speedKmh !== null}
            />
            <p className="speed-disclaimer">
              Your warning threshold is an app setting, not a legal speed limit.
            </p>
          </div>
          <div className="live-details">
            <div className="session-state">
              <span className="eyebrow">SESSION STATUS</span>
              <strong>{recording ? "Drive recording" : "Ready when you are"}</strong>
              <span>
                {recording
                  ? "Keep this screen open while driving."
                  : "GPS only turns on when you start a drive."}
              </span>
            </div>
            <div className="session-metrics">
              <div className="session-metric">
                <span><Crosshair size={15} aria-hidden="true" /> GPS ACCURACY</span>
                <strong>
                  {position && status === "active"
                    ? `${Math.round(position.accuracyMeters)} m`
                    : "—"}
                </strong>
                <small>
                  {position && status === "active"
                    ? accuracyLabel(position.accuracyMeters)
                    : "Waiting for a fix"}
                </small>
              </div>
              <div className="session-metric">
                <span><Activity size={15} aria-hidden="true" /> DRIVE TIME</span>
                <strong>{recording ? elapsedLabel : "00:00:00"}</strong>
                <small>{recording ? "This session" : "Not recording"}</small>
              </div>
              <div className="session-metric">
                <span><MapPin size={15} aria-hidden="true" /> DISTANCE</span>
                <strong>{recording ? `${distanceKm.toFixed(2)} km` : "—"}</strong>
                <small>{recording ? "Accurate GPS fixes" : "This session"}</small>
              </div>
              <div className="session-metric">
                <span><Gauge size={15} aria-hidden="true" /> WARNING AT</span>
                <strong>{preferences.speedThresholdKmh}<small> km/h</small></strong>
                <small>Chosen by you</small>
              </div>
            </div>
            <button
              className={`button drive-action${recording ? " button-stop" : " button-primary"}`}
              type="button"
              onClick={recording ? stopDrive : () => void startDrive()}
            >
              {recording ? <Pause size={17} /> : <Play size={17} />}
              {recording ? "End and save drive" : "Start live drive"}
            </button>
            {recording && (
              <span className="recording-note">
                <span className="recording-dot" />
                Location is in use while this session is active.
              </span>
            )}
          </div>
        </div>
        {gpsError && <p className="inline-error gps-error" role="alert">{gpsError}</p>}
        {sessionNotice && <p className="navigation-notice" role="status">{sessionNotice}</p>}
        {audioError && <p className="inline-error" role="alert">{audioError}</p>}
        {preferenceError && <p className="inline-error" role="alert">{preferenceError}</p>}
        {tripsError && <p className="inline-error" role="alert">{tripsError}</p>}
        <div className="threshold-note">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>
            {preferences.speedThresholdKmh > 80 && (
              <>
                <strong>80–{preferences.speedThresholdKmh - 1} km/h</strong> caution
                <span className="threshold-divider">/</span>
              </>
            )}
            <strong>{preferences.speedThresholdKmh}+ km/h</strong> warning
          </span>
          <Link href="/settings">Change threshold <ArrowRight size={14} /></Link>
        </div>
      </motion.section>

      <section className="live-lower-grid">
        <article className="surface-card map-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">YOUR POSITION</span>
              <h2>Live map</h2>
            </div>
            <span className="map-live-tag">
              <span className="status-dot" />
              {position && status === "active" ? "GPS FIX" : "NO LOCATION"}
            </span>
          </div>
          <LiveMap position={status === "active" ? position : null} />
          <div className="map-privacy">
            <Radio size={14} aria-hidden="true" />
            {position && status === "active"
              ? `Position accuracy ±${Math.round(position.accuracyMeters)} m · ${
                  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    ? "used by Google Maps"
                    : "not shared with a map provider"
                }`
              : "Location is never requested until you start a drive."}
          </div>
        </article>
        <article className="surface-card range-card">
          <span className="eyebrow">APPLICATION WARNING LEVELS</span>
          <h2>Awareness, at a glance.</h2>
          <p>These are configurable app reminders, not statements about local laws or road conditions.</p>
          <div className="range-list">
            <div><span className="range-swatch range-normal" /><span>Under 80 km/h</span><strong>Normal</strong></div>
            <div>
              <span className="range-swatch range-caution" />
              <span>{preferences.speedThresholdKmh > 80 ? `80–${preferences.speedThresholdKmh - 1} km/h` : "Below 80 km/h"}</span>
              <strong>{preferences.speedThresholdKmh > 80 ? "Caution" : "Normal"}</strong>
            </div>
            <div><span className="range-swatch range-danger" /><span>{preferences.speedThresholdKmh}+ km/h</span><strong>Warning</strong></div>
          </div>
          <div className="range-footnote">
            <ShieldCheck size={16} aria-hidden="true" />
            {status === "active"
              ? "Speed comes directly from your device GPS; some devices do not report speed."
              : "No coordinates or speed values are shown until your device provides them."}
          </div>
        </article>
      </section>
    </div>
  );
}
