"use client";

import dynamic from "next/dynamic";

const PerformanceSim = dynamic(
  () => import("./components/PerformanceSim"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[#08090c] text-sm text-zinc-400 font-medium tracking-widest uppercase">
        Loading Performance Sim...
      </div>
    ),
  }
);

export default function PerformancePage() {
  return <PerformanceSim />;
}
