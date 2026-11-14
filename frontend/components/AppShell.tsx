"use client";

import { usePathname } from "next/navigation";
import { Bell, Compass } from "lucide-react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

import BottomNavigation from "@/components/BottomNavigation";
import ThemeToggle from "@/components/ThemeToggle";

const headings: Record<string, { eyebrow: string; title: string }> = {
  "/": { eyebrow: "YOUR DRIVING SPACE", title: "Good to see you." },
  "/live": { eyebrow: "LIVE DRIVE", title: "Stay in your lane." },
  "/trips": { eyebrow: "YOUR JOURNEYS", title: "Every trip, yours." },
  "/insights": { eyebrow: "DRIVING INSIGHTS", title: "Know your rhythm." },
  "/risk": { eyebrow: "SAFETY OVERVIEW", title: "Awareness, not guesswork." },
  "/settings": { eyebrow: "PREFERENCES", title: "Make it yours." },
};

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const heading = headings[pathname] ?? headings["/"];
  const [recording, setRecording] = useState(false);
  const [navigationNotice, setNavigationNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleRecording = (event: Event) => {
      setRecording((event as CustomEvent<boolean>).detail);
    };
    window.addEventListener("drivesense:recording", handleRecording);
    return () => window.removeEventListener("drivesense:recording", handleRecording);
  }, []);

  useEffect(() => {
    if (!recording) setNavigationNotice(null);
  }, [recording]);

  function guardActiveDriveNavigation(event: MouseEvent<HTMLDivElement>) {
    if (!recording || !(event.target instanceof Element)) return;
    const link = event.target.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement) || link.pathname === pathname) return;
    event.preventDefault();
    setNavigationNotice("End and save your drive before leaving Live Drive.");
  }

  return (
    <div className="app-shell" onClickCapture={guardActiveDriveNavigation}>
      <BottomNavigation />
      <div className="app-main">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              D
            </span>
            <strong>DriveSense</strong>
          </div>
          <div className="topbar-context">
            <span className="topbar-icon">
              <Compass size={15} aria-hidden="true" />
            </span>
            <span>DRIVE WITH CLARITY</span>
          </div>
          <div className="topbar-actions">
            <span className="topbar-live-label">
              <span className="status-dot" />
              GPS starts when you do
            </span>
            <button
              className="icon-button"
              type="button"
              aria-label="Notifications are off"
              title="DriveSense does not send notifications"
              disabled
            >
              <Bell size={17} />
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="page-wrap">
          {navigationNotice && <p className="navigation-notice" role="alert">{navigationNotice}</p>}
          <div className="page-heading">
            <div>
              <span className="eyebrow">{heading.eyebrow}</span>
              <h1>{heading.title}</h1>
            </div>
            {pathname === "/live" && (
              <span className="local-only-pill">
                <span className="status-dot" />
                ON-DEVICE GPS
              </span>
            )}
          </div>
          {children}
        </main>
      </div>
      <div className="mobile-nav-spacer" aria-hidden="true" />
    </div>
  );
}
