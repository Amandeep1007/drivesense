"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock3, Gauge, MapPin, ShieldAlert, Signpost } from "lucide-react";

import { useTrips } from "@/hooks/useTrips";
import type { RecordedTrip } from "@/types/driving";

function distanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function durationLabel(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function TripCard({ trip, index }: { trip: RecordedTrip; index: number }) {
  return (
    <motion.article
      className="surface-card trip-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <div className="trip-card-head">
        <span className="trip-card-icon"><Signpost size={18} aria-hidden="true" /></span>
        <div>
          <strong>
            {new Date(trip.startedAt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "long",
              day: "numeric",
            })}
          </strong>
          <span>
            {new Date(trip.startedAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
            {" · "}
            {durationLabel(trip.durationSeconds)}
          </span>
        </div>
        <span className="trip-date">
          {new Date(trip.startedAt).getFullYear()}
        </span>
      </div>
      <div className="trip-stats">
        <div><MapPin size={15} /><span>Distance</span><strong>{distanceLabel(trip.distanceMeters)}</strong></div>
        <div><Gauge size={15} /><span>Average</span><strong>{trip.averageSpeedKmh === null ? "—" : `${Math.round(trip.averageSpeedKmh)} km/h`}</strong></div>
        <div><ArrowRight size={15} /><span>Max speed</span><strong>{trip.maxSpeedKmh === null ? "—" : `${Math.round(trip.maxSpeedKmh)} km/h`}</strong></div>
        <div><ShieldAlert size={15} /><span>Warnings</span><strong>{trip.overspeedEvents}</strong></div>
      </div>
    </motion.article>
  );
}

export default function TripsPage() {
  const { trips, ready, error } = useTrips();
  const totalDistance = trips.reduce((sum, trip) => sum + trip.distanceMeters, 0);
  const totalWarnings = trips.reduce((sum, trip) => sum + trip.overspeedEvents, 0);

  return (
    <div className="page-content">
      {error && <p className="inline-error" role="alert">{error}</p>}
      <section className="trip-summary-grid">
        <article className="surface-card trip-summary-card">
          <span className="eyebrow">RECORDED DRIVES</span>
          <strong>{ready ? trips.length : "—"}</strong>
          <span>Only trips saved from this device</span>
        </article>
        <article className="surface-card trip-summary-card">
          <span className="eyebrow">TOTAL DISTANCE</span>
          <strong>{ready ? <>{(totalDistance / 1000).toFixed(1)} <small>km</small></> : "—"}</strong>
          <span>Calculated from accurate GPS fixes</span>
        </article>
        <article className="surface-card trip-summary-card">
          <span className="eyebrow">SPEED WARNINGS</span>
          <strong>{ready ? totalWarnings : "—"}</strong>
          <span>Observed during saved drives</span>
        </article>
      </section>

      <section className="section-block trips-list-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR JOURNEYS</span>
            <h2>{trips.length ? "A record of where you have been." : "Your road, your record."}</h2>
          </div>
          <span className="freshness"><Clock3 size={14} /> Stored on this device</span>
        </div>
        {!ready ? (
          <div className="surface-card empty-state"><span className="loading-mark" /><p>Loading saved trips…</p></div>
        ) : trips.length ? (
          <div className="trip-list">
            {trips.map((trip, index) => <TripCard key={trip.id} trip={trip} index={index} />)}
          </div>
        ) : (
          <div className="surface-card empty-state">
            <span className="empty-icon"><Signpost size={22} aria-hidden="true" /></span>
            <h3>No trips recorded yet.</h3>
            <p>Start a Live Drive to record real GPS distance and speed readings. Your location is not uploaded.</p>
            <Link className="button button-primary" href="/live">Start a drive <ArrowRight size={16} /></Link>
          </div>
        )}
      </section>
    </div>
  );
}
