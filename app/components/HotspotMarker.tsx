"use client";

import { useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Hotspot, normalizedToWorld } from "../lib/hotspots";

type HotspotMarkerProps = {
  data: Hotspot;
  box: THREE.Box3;
};

export default function HotspotMarker({ data, box }: HotspotMarkerProps) {
  const [open, setOpen] = useState(false);
  const worldPosition = normalizedToWorld(box, data.position);

  return (
    <Html position={worldPosition} center zIndexRange={[20, 0]}>
      <div
        className="relative flex items-center justify-center"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
      >
        <button
          type="button"
          aria-label={data.label}
          className={`h-1.5 w-1.5 cursor-pointer rounded-full border border-white/80 bg-white/90 transition-all duration-200 hover:scale-150 hover:border-electric-blue hover:bg-electric-blue ${
            open ? "scale-150 border-electric-blue bg-electric-blue" : ""
          }`}
        />
        {open && (
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 w-48 -translate-x-1/2 rounded-lg border border-white/10 bg-dark-gray/95 p-3 text-left text-white shadow-xl">
            <p className="text-sm font-semibold">{data.label}</p>
            <p className="mt-1 text-xs leading-snug text-zinc-400">{data.description}</p>
          </div>
        )}
      </div>
    </Html>
  );
}
