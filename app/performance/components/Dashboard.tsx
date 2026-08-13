import { useEffect, useRef } from "react";
import { sim } from "../lib/sim";

function Readout({
  label,
  unit,
  refEl,
  accent,
}: {
  label: string;
  unit: string;
  refEl: React.RefObject<HTMLSpanElement | null>;
  accent?: boolean;
}) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-[10px] tracking-[0.22em] text-zinc-400 uppercase">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          ref={refEl}
          className={`font-display text-3xl leading-none tabular-nums ${accent ? "text-primary" : "text-foreground"}`}
        >
          0
        </span>
        <span className="text-[10px] tracking-wider text-zinc-500 uppercase">{unit}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const speed = useRef<HTMLSpanElement>(null);
  const rpm = useRef<HTMLSpanElement>(null);
  const gear = useRef<HTMLSpanElement>(null);
  const torque = useRef<HTMLSpanElement>(null);
  const throttle = useRef<HTMLSpanElement>(null);
  const accel = useRef<HTMLSpanElement>(null);
  const power = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const redlineLabel = useRef<HTMLSpanElement>(null);
  const midLabel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const CIRC = 2 * Math.PI * 68 * 0.75;
    const unsub = sim.subscribe((s) => {
      frame++;
      if (frame % 2) return; // ~30 Hz text updates
      if (speed.current) speed.current.textContent = Math.round(s.speed).toString();
      if (rpm.current) rpm.current.textContent = Math.round(s.rpm).toLocaleString();
      if (gear.current) gear.current.textContent = s.speed < 1 && s.throttle < 0.02 ? "N" : String(s.gear);
      if (torque.current) torque.current.textContent = s.torque.toFixed(1);
      if (throttle.current) throttle.current.textContent = Math.round(s.throttle * 100).toString();
      if (accel.current) accel.current.textContent = s.accel.toFixed(1);
      if (power.current) power.current.textContent = s.power.toFixed(1);
      const redlines = { eco: 6500, normal: 9000, sports: 10500 };
      const limit = redlines[s.mode] ?? 9000;
      const p = Math.min(1, s.rpm / limit);
      if (bar.current) {
        bar.current.style.width = `${p * 100}%`;
        bar.current.style.background = "#fe0100";
      }
      if (redlineLabel.current) {
        const kLimit = (limit / 1000).toFixed(limit % 1000 === 0 ? 0 : 1);
        redlineLabel.current.textContent = `${kLimit}K REDLINE`;
      }
      if (midLabel.current) {
        const kMid = (limit / 2000).toFixed(limit % 2000 === 0 ? 0 : 1);
        midLabel.current.textContent = `${kMid}K`;
      }
      if (arc.current) {
        arc.current.style.strokeDashoffset = String(CIRC * (1 - Math.min(1, s.speed / 200)));
      }
    });
    return () => {
      unsub();
    };
  }, []);

  const CIRC = 2 * Math.PI * 68 * 0.75;

  return (
    <div className="grid gap-3">
      <div className="panel flex items-center gap-5 px-5 py-4">
        <div className="relative h-[150px] w-[150px] shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-[135deg]">
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="var(--color-white-10)"
              className="stroke-white/10"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${CIRC} 999`}
            />
            <circle
              ref={arc}
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="var(--color-neon-red)"
              className="stroke-neon-red"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${CIRC} 999`}
              strokeDashoffset={CIRC}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span ref={speed} className="font-display text-5xl leading-none tabular-nums">
              0
            </span>
            <span className="text-[10px] tracking-[0.28em] text-zinc-400 uppercase">km/h</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] tracking-[0.22em] text-zinc-400 uppercase">Engine</div>
              <div className="flex items-baseline gap-1">
                <span ref={rpm} className="font-display text-3xl tabular-nums">
                  1,250
                </span>
                <span className="text-[10px] tracking-wider text-zinc-500 uppercase">rpm</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] tracking-[0.22em] text-zinc-400 uppercase">Gear</div>
              <span ref={gear} className="font-display text-4xl leading-none text-neon-red tabular-nums">
                N
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div ref={bar} className="h-full rounded-full bg-neon-red transition-all duration-75" style={{ width: "0%" }} />
          </div>
          <div className="mt-1 flex justify-between text-[9px] tracking-widest text-zinc-500">
            <span>0</span>
            <span ref={midLabel}>5K</span>
            <span ref={redlineLabel} className="text-neon-red font-semibold">10.5K REDLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Readout label="Torque" unit="Nm" refEl={torque} accent />
        <Readout label="Throttle" unit="%" refEl={throttle} />
        <Readout label="Accel" unit="m/s²" refEl={accel} />
        <Readout label="Power" unit="hp" refEl={power} />
      </div>
    </div>
  );
}
