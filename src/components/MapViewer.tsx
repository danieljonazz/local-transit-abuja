"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback for the map
const MapSkeleton = () => (
  <div className="h-full w-full bg-slate-200 animate-pulse rounded-md flex items-center justify-center">
    <span className="text-slate-500 font-medium">Loading Map...</span>
  </div>
);

// Dynamically import the Map component with SSR disabled
// We have to use any here because dynamic imports with props can be tricky in TS, 
// but we cast it properly in the export.
const DynamicMap = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Extract props type from Map component
type MapProps = {
  center?: [number, number];
  zoom?: number;
  markers?: { id: string; position: [number, number]; title: string }[];
};

export default function MapViewer(props: MapProps) {
  return <DynamicMap {...props} />;
}
