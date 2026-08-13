// Camera framing per motorcycle component. Coordinates are easy to tune later.
export type FocusKey =
  | "overview"
  | "engine"
  | "console"
  | "wheels"
  | "exhaust"
  | "chassis"
  | "lighting";

export type FocusTarget = {
  label: string;
  headline: string;
  body: string;
  specs: [string, string][];
  camera: [number, number, number];
  target: [number, number, number];
};

export const FOCUS_TARGETS: Record<FocusKey, FocusTarget> = {
  overview: {
    label: "Overview",
    headline: "Instant torque. Adrenaline on demand.",
    body: "A track-bred naked built around a high-revving single. Every input you make is simulated end to end — throttle, revs, torque, gearing, sound.",
    specs: [
      ["Engine", "373cc DOHC"],
      ["Peak power", "39.4 hp"],
      ["Peak torque", "28.5 Nm"],
      ["Kerb weight", "163 kg"],
    ],
    camera: [5.2, 2.2, 6.8],
    target: [0, 0.5, 0],
  },
  engine: {
    label: "Engine",
    headline: "Liquid-cooled, race-mapped single",
    body: "Peak torque arrives at 7,600 rpm and the map keeps pulling to the 10,500 rpm limiter. Watch the block glow as load builds.",
    specs: [
      ["Bore x stroke", "89 x 60 mm"],
      ["Compression", "12.6:1"],
      ["Redline", "10,500 rpm"],
      ["Fueling", "Ride-by-wire"],
    ],
    camera: [1.3, 0.8, 1.4],
    target: [0.05, 0.62, 0],
  },
  console: {
    label: "Console",
    headline: "Connected to your ride",
    body: "Full-colour TFT with live telemetry: gear position, rev bar, torque draw and throttle map, all mirrored in the dashboard below.",
    specs: [
      ["Display", '5" TFT'],
      ["Modes", "Road / Rain / Track"],
      ["Telemetry", "Live 60 Hz"],
      ["Connectivity", "BT + Nav"],
    ],
    camera: [0.15, 1.7, 0.7],
    target: [0.65, 1.15, 0.0],
  },
  wheels: {
    label: "Wheels & Brakes",
    headline: "Grip that answers instantly",
    body: "Lightweight alloys with radial-mount calipers. Wheel speed in the scene is driven directly by simulated road speed.",
    specs: [
      ["Front", "300 mm disc"],
      ["Rear", "230 mm disc"],
      ["Tyres", "110/70 - 150/60"],
      ["ABS", "Dual channel"],
    ],
    camera: [1.7, 0.7, 1.7],
    target: [0.5, 0.42, 0.0],
  },
  exhaust: {
    label: "Exhaust",
    headline: "The voice of the machine",
    body: "Underslung can tuned for a hard-edged bark. Pitch and volume in this experience track engine rpm in real time.",
    specs: [
      ["Layout", "Underbelly"],
      ["Material", "Stainless"],
      ["Valve", "Electronic"],
      ["Note", "Hard single"],
    ],
    camera: [-1.4, 0.7, 1.6],
    target: [-0.6, 0.5, 0.0],
  },
  chassis: {
    label: "Chassis",
    headline: "Built for the urban flow",
    body: "Perimeter frame with USD forks and a monoshock. Braking dives the fork, hard drive squats the tail — visible in the model.",
    specs: [
      ["Frame", "Perimeter steel"],
      ["Front", "USD 43 mm"],
      ["Rear", "Nitrox monoshock"],
      ["Wheelbase", "1,357 mm"],
    ],
    camera: [0.0, 1.1, 4.4],
    target: [-0.3, 0.15, 0.0],
  },
  lighting: {
    label: "Lighting",
    headline: "Designed to turn heads",
    body: "Projector LED with a signature DRL blade. The face was drawn to look fast standing still.",
    specs: [
      ["Headlamp", "LED projector"],
      ["DRL", "Twin blade"],
      ["Tail", "LED stack"],
      ["Indicators", "Sequential"],
    ],
    camera: [1.9, 1.3, 1.2],
    target: [0.95, 1.05, 0.0],
  },
};

export const FOCUS_ORDER: FocusKey[] = [
  "overview",
  "engine",
  "console",
  "wheels",
  "exhaust",
  "chassis",
  "lighting",
];
