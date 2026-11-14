"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Gauge,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useTrips } from "@/hooks/useTrips";

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function HomePage() {
  const { trips, ready, error } = useTrips();
  const latestTrip = trips[0];
  const overspeedEvents = trips.reduce(
    (total, trip) => total + trip.overspeedEvents,
    0,
  );
  const totalDistance = trips.reduce((total, trip) => total + trip.distanceMeters, 0);

  return (
    <div className="page-content">
      <motion.section
        className="welcome-strip"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <span className="welcome-label">
            <Sparkles size={14} aria-hidden="true" />
            A LITTLE MORE AWARENESS GOES A LONG WAY
          </span>
          <h2>Your next drive starts here.</h2>
          <p>Real-time speed. Thoughtful insights. Trip records stay on your device.</p>
        </div>
        <Link className="button button-primary" href="/live">
          Open live drive <ArrowRight size={17} aria-hidden="true" />
        </Link>
        <div className="welcome-decoration" aria-hidden="true" />
      </motion.section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RIGHT NOW</span>
            <h2>Your driving overview</h2>
          </div>
          <span className="freshness">
            <span className="status-dot" />
            GPS is off until you start
          </span>
        </div>
        <div className="overview-grid">
          <article className="surface-card overview-card">
            <span className="card-icon icon-lime">
              <Gauge size={18} aria-hidden="true" />
            </span>
            <span className="metric-label">LIVE SPEED</span>
            <strong className="metric-value">— <small>km/h</small></strong>
            <span className="metric-footnote">Waiting for your next drive</span>
          </article>
          <article className="surface-card overview-card">
            <span className="card-icon icon-blue">
              <MapPin size={18} aria-hidden="true" />
            </span>
            <span className="metric-label">DISTANCE RECORDED</span>
            <strong className="metric-value">
              {ready ? formatDistance(totalDistance) : "—"}
            </strong>
            <span className="metric-footnote">Across {trips.length} saved {trips.length === 1 ? "trip" : "trips"}</span>
          </article>
          <article className="surface-card overview-card">
            <span className="card-icon icon-amber">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <span className="metric-label">SPEED WARNINGS</span>
            <strong className="metric-value">{ready ? overspeedEvents : "—"}</strong>
            <span className="metric-footnote">From your recorded trips</span>
          </article>
        </div>
      </section>

      <section className="home-lower-grid">
        <article className="surface-card recent-card">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">YOUR LAST JOURNEY</span>
              <h2>{latestTrip ? "A drive in the books." : "Your first trip is yours to take."}</h2>
            </div>
            {latestTrip && (
              <span className="trip-date">
                {new Date(latestTrip.startedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          {error ? (
            <p className="inline-error" role="alert">{error}</p>
          ) : latestTrip ? (
            <div className="recent-trip-summary">
              <div><span>Distance</span><strong>{formatDistance(latestTrip.distanceMeters)}</strong></div>
              <div><span>Duration</span><strong>{formatDuration(latestTrip.durationSeconds)}</strong></div>
              <div><span>Max speed</span><strong>{latestTrip.maxSpeedKmh === null ? "—" : `${Math.round(latestTrip.maxSpeedKmh)} km/h`}</strong></div>
            </div>
          ) : (
            <p className="muted-copy">Trips appear here only after you record them on this device.</p>
          )}
          <Link className="text-link" href="/trips">
            See all trips <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </article>

        <article className="surface-card safety-card">
          <span className="eyebrow">BUILT AROUND YOU</span>
          <div className="safety-card-title">
            <span className="card-icon icon-lime"><ShieldCheck size={18} aria-hidden="true" /></span>
            <h2>Safety, without the guesswork.</h2>
          </div>
          <p>Speed awareness uses your live GPS readings and the threshold you choose. It is not a legal limit or a substitute for safe driving.</p>
          <div className="safety-card-stat">
            <span>Recorded distance</span>
            <strong>{ready ? formatDistance(totalDistance) : "—"}</strong>
            {totalDistance > 0 ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownRight size={16} aria-hidden="true" />}
          </div>
          <Link className="text-link" href="/risk">
            Explore safety overview <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </article>
      </section>
    </div>
  );
}