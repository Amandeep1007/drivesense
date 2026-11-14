"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Gauge,
  Home,
  Settings,
  ShieldAlert,
  Signpost,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Gauge },
  { href: "/trips", label: "Trips", icon: Signpost },
  { href: "/insights", label: "Insights", icon: Activity },
  { href: "/risk", label: "Risk", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>
            <strong>DriveSense</strong>
            <small>YOUR DRIVE, IN FOCUS</small>
          </span>
        </Link>
        <span className="nav-section-label">YOUR SPACE</span>
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              className={`nav-link${active ? " is-active" : ""}`}
              href={href}
              key={href}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {href === "/live" && <span className="live-nav-dot" aria-hidden="true" />}
            </Link>
          );
        })}
        <div className="nav-footnote">
          <span className="status-dot" />
          <span>Private by design</span>
          <small>DriveSense keeps trip records on this device.</small>
        </div>
      </nav>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navigation
          .filter(({ href }) => href !== "/risk")
          .map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                className={`mobile-nav-link${active ? " is-active" : ""}`}
                href={href}
                key={href}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
      </nav>
    </>
  );
}