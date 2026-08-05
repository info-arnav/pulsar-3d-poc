"use client";

import { useState } from "react";
import * as THREE from "three";
import FloatingNav from "../components/FloatingNav";
import BikeScene from "../components/BikeScene";
import HotspotMarker from "../components/HotspotMarker";
import { hotspots } from "../lib/hotspots";

const LOCKED_CAMERA: [number, number, number] = [2.4, 1.2, 2.8];

export default function SpecHotspotsPage() {
  const [box, setBox] = useState<THREE.Box3 | null>(null);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface-grey">
      <BikeScene
        interactive={false}
        cameraPosition={LOCKED_CAMERA}
        onBoxReady={setBox}
        className="absolute inset-0"
      >
        {box && hotspots.map((h) => <HotspotMarker key={h.id} data={h} box={box} />)}
      </BikeScene>

      <FloatingNav />
    </div>
  );
}
