"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ArrowDownRight, ArrowRight, Gauge, TrendingUp } from "lucide-react";

import { useTrips } from "@/hooks/useTrips";

type SpeedPoint = {
  at: string;
  label: string;
  speed: number | null;
  tripId: string;
};

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function InsightsPage() {
  const { trips, ready, error } = useTrips();
  const speedPoints = useMemo<SpeedPoint[]>(
    () => {
      const orderedTrips = trips
        .filter((trip) => trip.samples.length > 0)
        .sort((left, right) => left.startedAt.localeCompare(right.startedAt));
      const points: SpeedPoint[] = [];
      for (const trip of orderedTrips) {
        if (points.length > 0) {
          points.push({
            at: trip.samples[0].at,
            label: "",
            speed: null,
            tripId: trip.id,
          });
        }
        for (const sample of trip.samples) {
          points.push({
            at: sample.at,
            label: new Date(sample.at).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            }),
            speed: Math.round(sample.speedKmh),
            tripId: trip.id,
          });
        }
      }
      return points;
    },
    [trips],
  );
  const speedChanges = useMemo(() => {
    let accelerationEvents = 0;
    let brakingEvents = 0;
    for (let index = 1; index < speedPoints.length; index += 1) {
      const current = speedPoints[index];
      const previous = speedPoints[index - 1];
      if (current.tripId !== previous.tripId || current.speed === null || previous.speed === null) continue;
      const elapsed =
        (new Date(current.at).getTime() - new Date(previous.at).getTime()) / 1000;
      if (elapsed <= 0 || elapsed > 120) continue;
      const metresPerSecondSquared =
        ((current.speed - previous.speed) / 3.6) / elapsed;
      if (metresPerSecondSquared >= 0.7) accelerationEvents += 1;
      if (metresPerSecondSquared <= -0.7) brakingEvents += 1;
    }
    return { accelerationEvents, brakingEvents };
  }, [speedPoints]);
  const measuredSpeedCount = speedPoints.filter((point) => point.speed !== null).length;
  const averageSpeed =
    measuredSpeedCount === 0
      ? null
      : speedPoints.reduce((total, point) => total + (point.speed ?? 0), 0) /
        measuredSpeedCount;
  const totalDuration = trips.reduce((total, trip) => total + trip.durationSeconds, 0);
  const totalWarnings = trips.reduce((total, trip) => total + trip.overspeedEvents, 0);

  return (
    <div className="page-content">
      {error && <p className="inline-error" role="alert">{error}</p>}
      <section className="insight-intro">
        <div>
          <span className="eyebrow">THE PICTURE SO FAR</span>
          <h2>Patterns built from your actual drives.</h2>
          <p>Insights use GPS speed readings saved on this device. More recorded drives mean more context.</p>
        </div>
        {!trips.length && (
          <Link className="button button-secondary" href="/live">Record a drive <ArrowRight size={16} /></Link>
        )}
      </section>

      <section className="insight-metrics-grid">
        <article className="surface-card insight-metric">
          <span className="card-icon icon-lime"><Gauge size={18} /></span>
          <span className="metric-label">SAMPLED AVG. SPEED</span>
          <strong>
            {!ready || averageSpeed === null
              ? "—"
              : <>{Math.round(averageSpeed)} <small>km/h</small></>}
          </strong>
          <span className="metric-footnote">Across measured GPS speed samples</span>
        </article>
        <article className="surface-card insight-metric">
          <span className="card-icon icon-blue"><Activity size={18} /></span>
          <span className="metric-label">RECORDED DRIVE TIME</span>
          <strong>{ready ? formatDuration(totalDuration) : "—"}</strong>
          <span className="metric-footnote">Across {trips.length} saved {trips.length === 1 ? "trip" : "trips"}</span>
        </article>
        <article className="surface-card insight-metric">
          <span className="card-icon icon-amber"><TrendingUp size={18} /></span>
          <span className="metric-label">SPEED WARNINGS</span>
          <strong>{ready ? totalWarnings : "—"}</strong>
          <span className="metric-footnote">Threshold crossings recorded on device</span>
        </article>
      </section>

      <section className="surface-card chart-card">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">SPEED OVER TIME</span>
            <h2>Your measured pace</h2>
          </div>
          <span className="chart-legend"><span /> GPS speed · km/h</span>
        </div>
        {speedPoints.length > 1 ? (
          <div className="chart-wrap" role="img" aria-label="Chart of recorded GPS speed samples over time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={speedPoints} margin={{ top: 10, right: 12, bottom: 4, left: -12 }}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={32} />
                <YAxis unit=" " tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "var(--card-strong)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-primary)" }}
                  labelStyle={{ color: "var(--text-muted)" }}
                  formatter={(value) => [`${value} km/h`, "GPS speed"]}
                />
                <Line type="monotone" dataKey="speed" stroke="var(--accent-strong)" strokeWidth={2.5} dot={false} connectNulls={false} activeDot={{ r: 4, fill: "var(--accent-strong)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-empty">
            <span className="empty-icon"><Gauge size={20} /></span>
            <p>{speedPoints.length === 1 ? "One GPS speed sample is recorded. Record another to see a trend." : "A speed trend appears after your device provides GPS speed during a recorded drive."}</p>
            {!trips.length && <Link className="text-link" href="/live">Start your first drive <ArrowRight size={15} /></Link>}
          </div>
        )}
      </section>

      <section className="insight-lower-grid">
        <article className="surface-card pattern-card">
          <span className="eyebrow">GPS SPEED-CHANGE ESTIMATE</span>
          <h2>Acceleration & braking</h2>
          <p>Estimated from changes between sampled GPS speeds—not vehicle accelerometer data or an ML classification.</p>
          <div className="pattern-stats">
            <div><span className="pattern-mark mark-accel"><TrendingUp size={17} /></span><span>Speed increases</span><strong>{speedChanges.accelerationEvents}</strong></div>
            <div><span className="pattern-mark mark-brake"><ArrowDownRight size={17} /></span><span>Speed decreases</span><strong>{speedChanges.brakingEvents}</strong></div>
          </div>
          <span className="subtle-note">GPS noise and sample spacing can affect these estimates.</span>
        </article>
        <article className="surface-card pattern-card">
          <span className="eyebrow">BEHAVIOUR CLASSIFICATION</span>
          <h2>No labels without a validated model.</h2>
          <p>The available dataset has not been validated against a compatible, trained DriveSense model. No behaviour distribution or prediction is shown.</p>
          <span className="feature-unavailable"><span className="status-dot" /> ML service unavailable</span>
          <Link className="text-link" href="/risk">See model status <ArrowRight size={15} /></Link>
        </article>
      </section>
    </div>
  );
}
