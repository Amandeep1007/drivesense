"use client";

import { useEffect, useState } from "react";
import {
  BellRing,
  Check,
  ChevronRight,
  CircleHelp,
  LockKeyhole,
  MapPin,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";
import { usePreferences } from "@/hooks/usePreferences";
import { useTrips } from "@/hooks/useTrips";

export default function SettingsPage() {
  const { theme, toggleTheme, error: themeError } = useTheme();
  const { preferences, setPreferences, error: preferenceError } = usePreferences();
  const { trips, clearTrips, error: tripsError } = useTrips();
  const [locationPermission, setLocationPermission] = useState("Not requested");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.permissions) return;
    let activePermission: PermissionStatus | null = null;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (cancelled) return;
        activePermission = permission;
        setLocationPermission(permission.state);
        permission.onchange = () => setLocationPermission(permission.state);
      })
      .catch((error: unknown) => {
        setPermissionError(
          error instanceof Error ? error.message : "Unable to read location permission.",
        );
      });
    return () => {
      cancelled = true;
      if (activePermission) activePermission.onchange = null;
    };
  }, []);

  function checkLocationAccess() {
    if (!navigator.geolocation) {
      setLocationPermission("Unavailable in this browser");
      return;
    }
    setLocationPermission("Checking…");
    setPermissionError(null);
    navigator.geolocation.getCurrentPosition(
      () => setLocationPermission("granted"),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission("denied");
          setPermissionError("Location access was denied. Change this in your browser's site settings.");
        } else if (error.code === error.TIMEOUT) {
          setLocationPermission("timeout");
          setPermissionError("The location request timed out. Check that device location is enabled.");
        } else {
          setLocationPermission("unavailable");
          setPermissionError("Your device could not provide a location.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  }

  function clearHistory() {
    if (!window.confirm("Delete all trips saved on this device? This cannot be undone.")) return;
    clearTrips();
  }

  return (
    <div className="page-content settings-page">
      {(preferenceError || themeError || tripsError || permissionError) && (
        <p className="inline-error" role="alert">
          {preferenceError ?? themeError ?? tripsError ?? permissionError}
        </p>
      )}

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><BellRing size={17} /></span>
          <div><h2>Speed awareness</h2><p>Your alerts, your threshold.</p></div>
        </div>
        <article className="surface-card settings-card">
          <div className="settings-row threshold-setting">
            <div className="setting-copy">
              <strong>Overspeed warning</strong>
              <span>The app warns at this speed. This is not a legal limit.</span>
            </div>
            <label className="threshold-control">
              <input
                type="range"
                min={80}
                max={180}
                step={5}
                value={preferences.speedThresholdKmh}
                onChange={(event) =>
                  setPreferences((current) => ({
                    ...current,
                    speedThresholdKmh: Number(event.target.value),
                  }))
                }
                aria-label="Overspeed warning threshold in kilometres per hour"
              />
              <strong>{preferences.speedThresholdKmh} <small>km/h</small></strong>
            </label>
          </div>
          <div className="settings-row">
            <div className="setting-copy setting-with-icon">
              <span className="setting-icon"><Volume2 size={17} /></span>
              <span><strong>Audio alerts</strong><small>Play a short tone when your warning threshold is reached.</small></span>
            </div>
            <button
              className={`switch${preferences.audioAlerts ? " switch-on" : ""}`}
              type="button"
              role="switch"
              aria-checked={preferences.audioAlerts}
              aria-label="Audio alerts"
              onClick={() => setPreferences((current) => ({ ...current, audioAlerts: !current.audioAlerts }))}
            ><span /></button>
          </div>
          <div className="settings-row">
            <div className="setting-copy setting-with-icon">
              <span className="setting-icon"><Check size={17} /></span>
              <span><strong>Visual alerts</strong><small>Show an on-screen reminder while Live Drive is open.</small></span>
            </div>
            <button
              className={`switch${preferences.visualAlerts ? " switch-on" : ""}`}
              type="button"
              role="switch"
              aria-checked={preferences.visualAlerts}
              aria-label="Visual alerts"
              onClick={() => setPreferences((current) => ({ ...current, visualAlerts: !current.visualAlerts }))}
            ><span /></button>
          </div>
        </article>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><Palette size={17} /></span>
          <div><h2>Appearance</h2><p>A comfortable view, day or night.</p></div>
        </div>
        <article className="surface-card settings-card">
          <div className="settings-row">
            <div className="setting-copy setting-with-icon">
              <span className="setting-icon">{theme === "dark" ? <Moon size={17} /> : <Sun size={17} />}</span>
              <span><strong>{theme === "dark" ? "Dark" : "Light"} theme</strong><small>Your choice is saved on this device.</small></span>
            </div>
            <button className="button button-secondary small-button" type="button" onClick={toggleTheme}>
              Switch to {theme === "dark" ? "light" : "dark"} <ChevronRight size={15} />
            </button>
          </div>
        </article>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><MapPin size={17} /></span>
          <div><h2>Location & privacy</h2><p>You stay in control of location access.</p></div>
        </div>
        <article className="surface-card settings-card">
          <div className="settings-row">
            <div className="setting-copy setting-with-icon">
              <span className="setting-icon"><MapPin size={17} /></span>
              <span><strong>Browser location permission</strong><small>Status: {locationPermission}. DriveSense requests location only while a drive is active.</small></span>
            </div>
            <button className="button button-secondary small-button" type="button" onClick={checkLocationAccess}>Check access <ChevronRight size={15} /></button>
          </div>
          <div className="privacy-callout">
            <LockKeyhole size={17} />
            <span><strong>Private by default.</strong> GPS coordinates are used in memory for live speed and distance. Saved trips contain only trip metrics and speed samples—not coordinates—and stay in browser storage. If you configure Google Maps, your live position is also used to display the map.</span>
          </div>
          <div className="settings-row">
            <div className="setting-copy setting-with-icon">
              <span className="setting-icon"><VolumeX size={17} /></span>
              <span><strong>Background tracking</strong><small>Not supported. Keep DriveSense open while recording a drive.</small></span>
            </div>
            <span className="feature-unavailable"><span className="status-dot" /> Off</span>
          </div>
        </article>
      </section>

      <section className="settings-section">
        <div className="settings-section-heading">
          <span className="settings-section-icon"><ShieldCheck size={17} /></span>
          <div><h2>Local trip data</h2><p>Saved on this browser, not in an account.</p></div>
        </div>
        <article className="surface-card settings-card">
          <div className="settings-row">
            <div className="setting-copy setting-with-icon">
              <span className="setting-icon"><LockKeyhole size={17} /></span>
              <span><strong>{trips.length} {trips.length === 1 ? "trip" : "trips"} saved on this device</strong><small>Clearing browser storage also removes this history.</small></span>
            </div>
            <button className="button button-danger small-button" type="button" onClick={clearHistory} disabled={trips.length === 0}>
              <Trash2 size={15} /> Clear history
            </button>
          </div>
        </article>
      </section>

      <p className="settings-footer"><CircleHelp size={15} /> DriveSense is an awareness companion. Always follow local road rules and drive attentively.</p>
    </div>
  );
}
