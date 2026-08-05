"use client";

import { useState } from "react";
import * as THREE from "three";
import FloatingNav from "../components/FloatingNav";
import BikeScene from "../components/BikeScene";
import HotspotMarker from "../components/HotspotMarker";
import ForestBackdrop from "../components/ForestBackdrop";
import { hotspots } from "../lib/hotspots";

export default function ModelHotspotsPage() {
  const [box, setBox] = useState<THREE.Box3 | null>(null);
  const [showBackground, setShowBackground] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface-grey">
      <BikeScene onBoxReady={setBox} className="absolute inset-0">
        {box && hotspots.map((h) => <HotspotMarker key={h.id} data={h} box={box} />)}
        {showBackground && <ForestBackdrop />}
      </BikeScene>

      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={() => setShowBackground((v) => !v)}
          className={`rounded-full border border-white/10 px-4 py-2 text-xs font-medium backdrop-blur-md transition-colors ${
            showBackground
              ? "bg-neon-red text-white"
              : "bg-black/60 text-zinc-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          Background: {showBackground ? "On" : "Off"}
        </button>
      </div>

      <FloatingNav />
    </div>
  );
}
