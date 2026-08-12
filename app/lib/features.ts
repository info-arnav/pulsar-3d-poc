/**
 * Bajaj Pulsar 150 — Twin Disc / Split Seat Variant
 * Feature Definitions for the Interactive Introduction Page
 *
 * Camera View Parameters (using direct world-space and spherical math):
 * - targetPosition: world-space coordinate [x, y, z] to look AT
 * - cameraPosition: world-space coordinate [x, y, z] where the camera is physically located
 * - spherical: nested spherical offset values relative to targetPosition
 */

export type BikeFeature = {
  id: string;
  index: number;
  category: string;
  label: string;
  tagline: string;
  description: string;
  specs: string[];
  targetPosition: [number, number, number];
  cameraPosition: [number, number, number];
  spherical: {
    distance: number;
    polar: number;
    azimuth: number;
  };
};

export const bikeFeatures: BikeFeature[] = [
  // ── PERFORMANCE ──────────────────────────────────────────────────────────
  {
    id: "engine",
    index: 1,
    category: "PERFORMANCE",
    label: "DTS-i 149.5cc Engine",
    tagline: "Digital Twin Spark. Pure Power.",
    description:
      "Air-cooled, 4-stroke, single-cylinder engine with Bajaj's patented Digital Twin Spark Ignition (DTS-i) technology — two spark plugs per cylinder for faster, more complete combustion, yielding superior fuel efficiency and a punchy mid-range response.",
    specs: ["149.5 cc Displacement", "14 PS @ 8,500 RPM", "13.25 Nm @ 6,500 RPM", "DTS-i Twin Spark"],
    targetPosition: [1.1637, -0.0890, 1.0000],
    cameraPosition: [1.1637, 0.5688, 0.2586],
    spherical: {
      distance: 0.9912,
      polar: 0.845,
      azimuth: 3.1416,
    },
  },
  {
    id: "gearbox",
    index: 2,
    category: "PERFORMANCE",
    label: "5-Speed Gearbox",
    tagline: "Smooth. Precise. Fast.",
    description:
      "Constant-mesh 5-speed manual gearbox with optimised gear ratios designed to keep the engine in its power band at all speeds — from city traffic crawls to open-road cruising.",
    specs: ["5-Speed Manual", "Constant Mesh", "Return-Shift Pattern", "Optimised Gear Ratios"],
    targetPosition: [0, 0.4, 0],
    cameraPosition: [2.0, 0.7, 0.4],
    spherical: {
      distance: 2.6,
      polar: 1.45,
      azimuth: 0.6,
    },
  },

  // ── LIGHTING ─────────────────────────────────────────────────────────────
  {
    id: "headlamp",
    index: 3,
    category: "LIGHTING",
    label: "Wolf-Eye Headlamp",
    tagline: "Cut Through the Dark.",
    description:
      "Iconic Wolf-Eye halogen headlamp design flanked by twin LED pilot lamps — the signature face of the Pulsar. Carbon-fibre-textured tank shrouds and pilot lamp housings give it an unmistakably predatory stance.",
    specs: ["Wolf-Eye Design", "Twin LED Pilots", "Halogen Main Beam", "Carbon-Fibre Shrouds"],
    targetPosition: [0, 0.8, 0.7],
    cameraPosition: [0.5, 1.1, 2.1],
    spherical: {
      distance: 2.2,
      polar: 1.2,
      azimuth: 0.0,
    },
  },
  {
    id: "tail-light",
    index: 4,
    category: "LIGHTING",
    label: "LED Tail Light",
    tagline: "Be Seen. Stay Safe.",
    description:
      "Aggressive LED tail light cluster styled to echo the Wolf-Eye theme at the rear. Integrated brake light flash pattern and wide-angle illumination ensure maximum visibility in all conditions.",
    specs: ["Full LED Cluster", "Integrated Brake Flash", "165° Visibility", "Razor-Edge Styling"],
    targetPosition: [0, 0.9, -0.85],
    cameraPosition: [-0.8, 1.4, -2.65],
    spherical: {
      distance: 2.2,
      polar: 1.15,
      azimuth: Math.PI,
    },
  },

  // ── INSTRUMENTATION ───────────────────────────────────────────────────────
  {
    id: "console",
    index: 5,
    category: "INSTRUMENTATION",
    label: "Semi-Digital Console",
    tagline: "Command the Dashboard.",
    description:
      "Semi-digital instrument cluster blending a sharp digital speedometer, trip meter, and fuel gauge with an analogue tachometer — giving you instant readouts at a glance without sacrificing the visceral feel of a needle in the red.",
    specs: ["Digital Speedometer", "Analog Tachometer", "Trip Meter", "Fuel Gauge"],
    targetPosition: [0.0762, 0.5729, 0.4185],
    cameraPosition: [-0.1816, 1.8893, -0.3176],
    spherical: {
      distance: 1.8,
      polar: 0.5345,
      azimuth: -2.9472,
    },
  },

  // ── BRAKING ───────────────────────────────────────────────────────────────
  {
    id: "brakes",
    index: 6,
    category: "BRAKING",
    label: "Twin Disc + ABS",
    tagline: "Stop on a Dime.",
    description:
      "Twin disc brake setup — disc at the front and rear — paired with single-channel ABS for confident, fade-free stopping in both wet and dry conditions. Tubeless tyres add an extra layer of puncture resilience.",
    specs: ["Front Disc Brake", "Rear Disc Brake", "Single-Channel ABS", "Tubeless Tyres"],
    targetPosition: [0.2, 0.2, 0.7],
    cameraPosition: [0.8, 0.8, 0.7],
    spherical: {
      distance: 2.4,
      polar: 1.35,
      azimuth: 0.0,
    },
  },

  // ── SUSPENSION ────────────────────────────────────────────────────────────
  {
    id: "front-fork",
    index: 7,
    category: "SUSPENSION",
    label: "Telescopic Front Fork",
    tagline: "Absorb Every Imperfection.",
    description:
      "Anti-friction bush telescopic front fork soaks up road imperfections with a measured, controlled stroke — keeping the front wheel tracking true even over broken surfaces without transmitting harshness to the rider.",
    specs: ["Telescopic Design", "Anti-Friction Bush", "130mm Travel", "Progressive Damping"],
    targetPosition: [0, 0.515, 0.937],
    cameraPosition: [0.995, 0.715, 2.137],
    spherical: {
      distance: 2.4,
      polar: 1.35,
      azimuth: 0.0,
    },
  },
  {
    id: "rear-shocks",
    index: 8,
    category: "SUSPENSION",
    label: "Twin Nitrox Shocks",
    tagline: "Ride, Never Bounce.",
    description:
      "Twin gas-charged Nitrox shock absorbers at the rear deliver plush ride quality while maintaining sharp cornering composure. Adjustable spring preload lets you tune the setup to your load and riding style.",
    specs: ["Twin Nitrox Units", "Gas-Charged", "5-Step Preload", "Enhanced Stability"],
    targetPosition: [0, 0.4, -0.4],
    cameraPosition: [1.5, 0.7, -1.6],
    spherical: {
      distance: 2.4,
      polar: 1.35,
      azimuth: 2.35,
    },
  },
];

// ── Grouped view for UI rendering ───────────────────────────────────────────
export type FeatureGroup = { category: string; features: BikeFeature[] };

export function getFeatureGroups(): FeatureGroup[] {
  const map = new Map<string, BikeFeature[]>();
  for (const f of bikeFeatures) {
    if (!map.has(f.category)) map.set(f.category, []);
    map.get(f.category)!.push(f);
  }
  return Array.from(map.entries()).map(([category, features]) => ({ category, features }));
}
