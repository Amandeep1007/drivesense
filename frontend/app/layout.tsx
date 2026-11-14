import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import AppShell from "@/components/AppShell";
import PwaRegistration from "@/components/PwaRegistration";
import { ThemeProvider } from "@/components/ThemeProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "DriveSense — Your drive, in focus",
  description:
    "A private, GPS-powered driving companion for live speed awareness and real trip insights.",
  applicationName: "DriveSense",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveSense",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#11130f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <PwaRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}