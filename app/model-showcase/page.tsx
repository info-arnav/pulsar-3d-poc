"use client";

import { useState } from "react";
import FloatingNav from "../components/FloatingNav";
import BikeScene, { type CameraPreset } from "../components/BikeScene";
import ForestBackdrop from "../components/ForestBackdrop";

const COLORS = [
  { name: "Racing Blue", value: "#1f3a63" },
  { name: "Matte Black", value: "#141414" },
  { name: "Signal Red", value: "#8c1d1d" },
];

const VIEWS: { label: string; preset: CameraPreset }[] = [
  { label: "3/4", preset: { azimuth: Math.PI / 4, polar: 1.15 } },
  { label: "Side", preset: { azimuth: Math.PI / 2, polar: 1.3 } },
  { label: "Front", preset: { azimuth: 0, polar: 1.3 } },
  { label: "Rear", preset: { azimuth: Math.PI, polar: 1.3 } },
];

export default function ModelShowcasePage() {
  const [color, setColor] = useState(COLORS[0].value);
  const [preset, setPreset] = useState<CameraPreset | null>(null);
  const [showBackground, setShowBackground] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-surface-grey">
      <BikeScene color={color} preset={preset} className="absolute inset-0">
        {showBackground && <ForestBackdrop />}
      </BikeScene>

      <div className="absolute top-6 right-6 flex flex-col gap-3">
        <div className="flex gap-2 rounded-full border border-white/10 bg-black/60 p-2 backdrop-blur-md">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.name}
              className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c.value ? "border-neon-red" : "border-transparent"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-md">
          {VIEWS.map((v) => (
            <button
              key={v.label}
              type="button"
              onClick={() => setPreset({ ...v.preset })}
              className="rounded-full px-4 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {v.label}
            </button>
          ))}
        </div>

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
