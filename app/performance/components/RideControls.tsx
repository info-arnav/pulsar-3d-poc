import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Volume2, VolumeX, Gauge } from "lucide-react";
import { sim } from "../lib/sim";
import { engineAudio } from "../lib/engine-audio";

export function RideControls() {
  const [auto, setAuto] = useState(true);
  const [muted, setMuted] = useState(false);
  const [armed, setArmed] = useState(false);
  const [mode, setMode] = useState<"eco" | "normal" | "sports">("normal");
  const throttleBar = useRef<HTMLDivElement>(null);
  const brakeBar = useRef<HTMLDivElement>(null);
  const input = useRef({ throttle: false, brake: false });

  useEffect(() => {
    // Preload audio files in the background immediately
    void engineAudio.preload();

    sim.onShift = (dir) => engineAudio.shift(dir);
    sim.start();

    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const s = sim.s;
      const tt = input.current.throttle ? 1 : 0;
      const bt = input.current.brake ? 1 : 0;
      s.throttle += (tt - s.throttle) * Math.min(1, dt * (tt > s.throttle ? 4.2 : 3.2));
      s.brake += (bt - s.brake) * Math.min(1, dt * 8);
      if (throttleBar.current) throttleBar.current.style.transform = `scaleX(${s.throttle})`;
      if (brakeBar.current) brakeBar.current.style.transform = `scaleX(${s.brake})`;
      // Control loop for braking audio squeal
      engineAudio.setBraking(input.current.brake && s.speed > 1.0);

      engineAudio.update(s.rpm, s.throttle, Math.min(1, s.speed / 160));
      
      // Sync state back to React
      setAuto(s.auto);
      setMode(s.mode);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === "w" || e.key === "ArrowUp") input.current.throttle = true;
      if (e.key === "s" || e.key === "ArrowDown") input.current.brake = true;
      if (e.key === "e") sim.shift(1);
      if (e.key === "q") sim.shift(-1);
      if (e.key === "a") sim.set({ lean: -0.9 });
      if (e.key === "d") sim.set({ lean: 0.9 });
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "ArrowUp") input.current.throttle = false;
      if (e.key === "s" || e.key === "ArrowDown") input.current.brake = false;
      if (e.key === "a" || e.key === "d") sim.set({ lean: 0 });
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      sim.stop();
    };
  }, []);

  const arm = async () => {
    if (armed) return;
    await engineAudio.init();
    setArmed(true);
  };

  const hold = (key: "throttle" | "brake", value: boolean) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      void arm();
      input.current[key] = value;
    },
    onPointerUp: () => {
      input.current[key] = false;
    },
    onPointerLeave: () => {
      input.current[key] = false;
    },
    onPointerCancel: () => {
      input.current[key] = false;
    },
  });

  return (
    <div className="panel grid gap-4 p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.24em] text-zinc-500 uppercase">Rider inputs</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const next = !auto;
              setAuto(next);
              sim.set({ auto: next });
            }}
            className={`rounded-full border px-3 py-1 text-[10px] tracking-widest uppercase transition-colors cursor-pointer ${
              auto ? "border-neon-red bg-neon-red/15 text-neon-red" : "border-zinc-800 text-zinc-400"
            }`}
          >
            {auto ? "Auto box" : "Manual"}
          </button>
          <button
            aria-label={muted ? "Unmute engine" : "Mute engine"}
            onClick={() => {
              void arm();
              const m = !muted;
              setMuted(m);
              engineAudio.setMuted(m);
            }}
            className="rounded-full border border-zinc-800 p-1.5 text-zinc-400 transition-colors hover:text-white cursor-pointer"
          >
            {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          {...hold("throttle", true)}
          className="group relative overflow-hidden rounded-xl border border-neon-red/40 bg-neon-red/10 py-5 text-sm font-semibold tracking-[0.2em] text-neon-red uppercase transition-transform select-none active:scale-[0.98] cursor-pointer"
        >
          Throttle
          <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-neon-red" ref={throttleBar} />
        </button>
        <button
          {...hold("brake", true)}
          className="relative overflow-hidden rounded-xl border border-zinc-850 bg-zinc-900 py-5 text-sm font-semibold tracking-[0.2em] text-white uppercase transition-transform select-none active:scale-[0.98] cursor-pointer"
        >
          Brake
          <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-red-650 bg-red-600" ref={brakeBar} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => sim.shift(1)}
          className="flex items-center justify-center gap-1 rounded-lg border border-zinc-800 py-2.5 text-xs tracking-widest uppercase hover:border-neon-red hover:text-neon-red cursor-pointer"
        >
          <ChevronUp className="size-4" /> Up
        </button>
        <button
          onClick={() => sim.shift(-1)}
          className="flex items-center justify-center gap-1 rounded-lg border border-zinc-800 py-2.5 text-xs tracking-widest uppercase hover:border-neon-red hover:text-neon-red cursor-pointer"
        >
          <ChevronDown className="size-4" /> Down
        </button>
        <label className="flex items-center gap-2 rounded-lg border border-zinc-800 px-3 cursor-pointer">
          <Gauge className="size-4 shrink-0 text-zinc-500" />
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            defaultValue={0}
            aria-label="Lean angle"
            onChange={(e) => sim.set({ lean: Number(e.target.value) })}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLInputElement).value = "0";
              sim.set({ lean: 0 });
            }}
            className="w-full accent-neon-red cursor-pointer"
          />
        </label>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
        <span className="text-[10px] tracking-[0.24em] text-zinc-500 uppercase">Power Mode</span>
        <div className="flex gap-1.5">
          {(["eco", "normal", "sports"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                void arm();
                sim.set({ mode: m });
                setMode(m);
              }}
              className={`rounded-full border px-3 py-1 text-[9px] tracking-widest uppercase transition-all cursor-pointer ${
                mode === m
                  ? "border-neon-red bg-neon-red/15 text-neon-red font-semibold"
                  : "border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
