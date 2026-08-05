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
          // Card + spacer share one hoverable box (flex-col, no gap) so the mouse
          // never crosses dead space on the way from the dot up to the card.
          <div
            className="absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div
              className={`rounded-lg border border-white/10 bg-dark-gray/95 p-3 text-left text-white shadow-xl ${
                data.youtubeId ? "w-72 pointer-events-auto" : "w-48 pointer-events-none"
              }`}
            >
              <p className="text-sm font-semibold">{data.label}</p>
              <p className="mt-1 text-xs leading-snug text-zinc-400">{data.description}</p>
              {data.youtubeId && (
                <div className="mt-2 aspect-video w-full overflow-hidden rounded-md bg-black">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${data.youtubeId}?rel=0`}
                    title={`${data.label} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            <div className="h-2 w-full shrink-0" />
          </div>
        )}
      </div>
    </Html>
  );
}
