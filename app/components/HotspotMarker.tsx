"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Hotspot, normalizedToWorld } from "../lib/hotspots";

type HotspotMarkerProps = {
  data: Hotspot;
  box: THREE.Box3;
};

export default function HotspotMarker({ data, box }: HotspotMarkerProps) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  const worldPosition = useMemo(() => normalizedToWorld(box, data.position), [box, data.position]);
  const center = useMemo(() => box.getCenter(new THREE.Vector3()), [box]);

  // Which way this part of the bike "faces" horizontally — approximated as the direction
  // from the bike's center out to this hotspot's own surface position, flattened onto the
  // XZ plane (rotating the camera around the bike is an azimuthal move; height shouldn't
  // make a low part like the engine read as "behind" a high one like the seat). A
  // raycast-based occlusion test (tried first) checked against the bike's full 583-mesh
  // detail and falsely hid markers blocked by their own neighboring parts (mirrors,
  // cables, trim). Comparing the camera's direction against this facing vector instead
  // only cares about which side of the bike the camera has orbited to.
  const facingDir = useMemo(() => {
    const flat = new THREE.Vector3(worldPosition.x - center.x, 0, worldPosition.z - center.z);
    // Hotspots near the vertical centerline (e.g. the engine) don't have a meaningful
    // front/back side — normalizing a near-zero vector gives an unstable direction, so
    // leave those permanently visible instead of guessing.
    return flat.lengthSq() > 0.02 ? flat.normalize() : null;
  }, [worldPosition, center]);

  useFrame(({ camera }) => {
    if (!facingDir) return;
    const toCamera = new THREE.Vector3(
      camera.position.x - center.x,
      0,
      camera.position.z - center.z
    ).normalize();
    const shouldHide = toCamera.dot(facingDir) < -0.5;
    if (shouldHide !== hiddenRef.current) {
      hiddenRef.current = shouldHide;
      setHidden(shouldHide);
      if (shouldHide) setOpen(false);
    }
  });

  return (
    <Html
      position={worldPosition}
      center
      style={{
        transition: "opacity 0.15s ease",
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
      zIndexRange={[20, 0]}
    >
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
