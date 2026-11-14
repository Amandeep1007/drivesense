"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { MapPin, Radio } from "lucide-react";

import type { GeoPosition } from "@/types/driving";

export default function LiveMap({
  position,
}: {
  position: GeoPosition | null;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-grid" aria-hidden="true" />
        <span className="map-placeholder-icon">
          <MapPin size={20} aria-hidden="true" />
        </span>
        <strong>Map ready when you are</strong>
        <p>Add a Google Maps key to enable the live map. No map tiles or traffic are simulated.</p>
        <span className="map-provider-label">GOOGLE MAPS · NOT CONFIGURED</span>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="map-placeholder">
        <div className="map-placeholder-grid" aria-hidden="true" />
        <span className="map-placeholder-icon">
          <Radio size={20} aria-hidden="true" />
        </span>
        <strong>Waiting for your location</strong>
        <p>The map will centre on your real GPS position after location access is granted.</p>
        <span className="map-provider-label">GOOGLE MAPS · LIVE POSITION ONLY</span>
      </div>
    );
  }

  return (
    <div className="live-map">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: position.latitude, lng: position.longitude }}
          center={{ lat: position.latitude, lng: position.longitude }}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          mapTypeControl={false}
          streetViewControl={false}
        >
          <Marker position={{ lat: position.latitude, lng: position.longitude }} />
        </Map>
      </APIProvider>
    </div>
  );
}