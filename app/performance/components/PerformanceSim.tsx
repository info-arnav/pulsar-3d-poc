"use client";

import { useState } from "react";
import { Bike3D } from "./Bike3D";
import { Dashboard } from "./Dashboard";
import { RideControls } from "./RideControls";
import { FOCUS_ORDER, FOCUS_TARGETS, type FocusKey } from "../lib/focus";
import FloatingNav from "@/app/components/FloatingNav";

export default function PerformanceSim() {
  const [focus, setFocus] = useState<FocusKey>("overview");
  const active = FOCUS_TARGETS[focus];

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <section className="relative h-[100vh] w-full overflow-hidden">
        {/* WebGL 3D canvas viewport */}
        <div className="absolute inset-0">
          <Bike3D focus={focus} />
        </div>
        
        {/* Vignette/Glow overlay backdrop */}
        <div className="glow-red pointer-events-none absolute inset-0" />

        {/* Title and Specs description cards (Left Side) */}
        <div className="pointer-events-none absolute top-12 left-5 max-w-sm md:left-10">
          <p className="text-[10px] tracking-[0.3em] text-neon-red uppercase font-semibold">{active.label}</p>
          <h1 className="font-display mt-2 text-4xl leading-[0.95] uppercase md:text-5xl text-white">
            {active.headline}
          </h1>
          <p className="mt-3 max-w-xs text-sm text-zinc-400">{active.body}</p>
          <dl className="mt-5 grid max-w-xs grid-cols-2 gap-x-6 gap-y-2">
            {active.specs.map(([k, v]) => (
              <div key={k} className="border-t border-white/10 pt-1.5">
                <dt className="text-[9px] tracking-[0.2em] text-zinc-500 uppercase">{k}</dt>
                <dd className="text-sm text-zinc-200">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Configurator buttons (Right Side) */}
        <div className="absolute top-12 right-4 hidden w-56 flex-col gap-1.5 lg:flex">
          {FOCUS_ORDER.map((k) => (
            <button
              key={k}
              onClick={() => setFocus(k)}
              className={`panel px-4 py-2.5 text-left transition-all cursor-pointer ${
                focus === k
                  ? "border-neon-red/60 bg-neon-red/10 translate-x-0"
                  : "translate-x-2 hover:translate-x-0 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">
                {String(FOCUS_ORDER.indexOf(k) + 1).padStart(2, "0")}
              </div>
              <div className="font-display text-sm tracking-wide uppercase text-white">{FOCUS_TARGETS[k].label}</div>
            </button>
          ))}
        </div>

        {/* Mobile Horizontal configurator strip */}
        <div className="absolute top-16 right-0 left-0 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
          {FOCUS_ORDER.map((k) => (
            <button
              key={k}
              onClick={() => setFocus(k)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[10px] tracking-widest uppercase cursor-pointer ${
                focus === k ? "border-neon-red bg-neon-red/15 text-neon-red" : "border-white/10 text-zinc-400"
              }`}
            >
              {FOCUS_TARGETS[k].label}
            </button>
          ))}
        </div>

        {/* HUD Deck & Control inputs panel */}
        <div className="absolute inset-x-0 bottom-4 z-20 grid gap-3 p-4 md:grid-cols-[1fr_360px] md:p-6">
          <Dashboard />
          <RideControls />
        </div>

        {/* Navigation bottom overlay */}
        <FloatingNav position="top" />
      </section>
    </main>
  );
}
