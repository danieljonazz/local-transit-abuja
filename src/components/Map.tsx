"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons in React-Leaflet, safe for SSR
let icon: L.Icon;
if (typeof window !== "undefined") {
  icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
}

interface MapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  startCoords?: [number, number] | null;
  endCoords?: [number, number] | null;
}

function MapBoundsUpdater({ startCoords, endCoords, center, zoom }: { startCoords?: [number, number] | null, endCoords?: [number, number] | null, center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (startCoords && endCoords) {
      const bounds = L.latLngBounds([startCoords, endCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, zoom);
    }
  }, [startCoords, endCoords, center, zoom, map]);
  return null;
}

export default function Map({ center = [9.05785, 7.49508], zoom = 13, startCoords, endCoords }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      className="h-full w-full rounded-md shadow-md z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapBoundsUpdater startCoords={startCoords} endCoords={endCoords} center={center} zoom={zoom} />

      {startCoords && icon && (
        <Marker position={startCoords} icon={icon}>
          <Popup>Start Point</Popup>
        </Marker>
      )}

      {endCoords && icon && (
        <Marker position={endCoords} icon={icon}>
          <Popup>End Point</Popup>
        </Marker>
      )}

      {startCoords && endCoords && (
        <Polyline positions={[startCoords, endCoords]} color="blue" weight={4} opacity={0.7} />
      )}
    </MapContainer>
  );
}
