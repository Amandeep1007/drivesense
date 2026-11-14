"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleAlert, ShieldCheck, ShieldOff, Sparkles } from "lucide-react";

import { useTrips } from "@/hooks/useTrips";
import { getApiBaseUrl } from "@/services/api";
import type { ModelStatus } from "@/types/driving";

export default function RiskPage() {
  const { trips, ready, error: tripError } = useTrips();
  const [model, setModel] = useState<ModelStatus | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const apiBase = getApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
    if (!apiBase) {
      setModelError("The DriveSense API URL is not configured for this deployment.");
      setLoading(false);
      return () => controller.abort();
    }

    fetch(`${apiBase.replace(/\/$/, "")}/api/ml/status`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Model status request failed (${response.status}).`);
        }
        setModel((await response.json()) as ModelStatus);
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setModelError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to check the model service.",
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const overspeedEvents = trips.reduce((sum, trip) => sum + trip.overspeedEvents, 0);
  const samples = useMemo(
    () =>
      trips
        .flatMap((trip) => trip.samples.map((sample) => ({ ...sample, tripId: trip.id })))
        .sort((left, right) => left.at.localeCompare(right.at)),
    [trips],
  );
  const sharpSpeedChanges = useMemo(() => {
    let count = 0;
    for (let index = 1; index < samples.length; index += 1) {
      const current = samples[index];
      const previous = samples[index - 1];
      if (current.tripId !== previous.tripId) continue;
      const elapsed =
        (new Date(current.at).getTime() - new Date(previous.at).getTime()) / 1000;
      if (elapsed <= 0 || elapsed > 120) continue;
      const rate = Math.abs((current.speedKmh - previous.speedKmh) / 3.6 / elapsed);
      if (rate >= 1.5) count += 1;
    }
    return count;
  }, [samples]);

  return (
    <div className="page-content">
      {tripError && <p className="inline-error" role="alert">{tripError}</p>}
      <section className="risk-intro-card surface-card">
        <span className="risk-shield"><ShieldCheck size={23} aria-hidden="true" /></span>
        <div>
          <span className="eyebrow">HOW TO READ THIS PAGE</span>
          <h2>Indicators, not predictions.</h2>
          <p>These are simple counts from GPS readings you chose to record. They are not an accident probability, diagnosis, or measure of driver quality.</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RECORDED INDICATORS</span>
            <h2>What your saved data shows.</h2>
          </div>
          <span className="freshness">From this device only</span>
        </div>
        <div className="risk-indicators">
          <article className="surface-card risk-indicator">
            <span className="card-icon icon-amber"><CircleAlert size={18} /></span>
            <span className="metric-label">SPEED THRESHOLD EVENTS</span>
            <strong>{ready ? overspeedEvents : "—"}</strong>
            <p>Crossings of the warning threshold you chose, counted during recorded drives.</p>
          </article>
          <article className="surface-card risk-indicator">
            <span className="card-icon icon-blue"><Sparkles size={18} /></span>
            <span className="metric-label">LARGE GPS SPEED CHANGES</span>
            <strong>{ready ? sharpSpeedChanges : "—"}</strong>
            <p>Roughly estimated from sampled speed changes. GPS noise can create false changes.</p>
          </article>
        </div>
      </section>

      <section className="risk-lower-grid">
        <article className="surface-card model-card">
          <div className="model-card-head">
            <span className="card-icon icon-muted"><ShieldOff size={18} /></span>
            <span className={`model-status ${model?.available ? "model-ready" : ""}`}>
              <span className="status-dot" />
              {loading ? "CHECKING" : model?.available ? "AVAILABLE" : "UNAVAILABLE"}
            </span>
          </div>
          <span className="eyebrow">MACHINE-LEARNING MODEL</span>
          <h2>{model?.available ? "Model integration status" : "No validated model is connected."}</h2>
          <p>{model?.message ?? (loading ? "Checking the DriveSense API for model status." : "The API could not confirm a validated DriveSense model.")}</p>
          {modelError && <p className="inline-error" role="alert">{modelError}</p>}
          <div className="model-check-list">
            <span><span className={model?.validated ? "check-dot" : "status-dot"} /> Feature names & order</span>
            <span><span className={model?.validated ? "check-dot" : "status-dot"} /> Preprocessing & target labels</span>
            <span><span className={model?.validated ? "check-dot" : "status-dot"} /> Model compatibility</span>
          </div>
          <Link className="text-link" href="/insights">View driving insights <ArrowRight size={15} /></Link>
        </article>
        <article className="surface-card recommendation-card">
          <span className="eyebrow">GENTLE REMINDERS</span>
          <h2>Good habits, one drive at a time.</h2>
          <ul>
            <li><span className="recommendation-mark">01</span><span>Choose an alert threshold that suits your needs, then keep your eyes on the road.</span></li>
            <li><span className="recommendation-mark">02</span><span>GPS readings can be delayed or inaccurate. Never rely on this app as your only speed indicator.</span></li>
            <li><span className="recommendation-mark">03</span><span>Keep the phone secured and avoid interacting with it while driving.</span></li>
          </ul>
          <p className="subtle-note">DriveSense is an awareness companion—not a safety-critical or emergency system.</p>
        </article>
      </section>
    </div>
  );
}
