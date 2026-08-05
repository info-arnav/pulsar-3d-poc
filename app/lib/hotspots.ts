import * as THREE from "three";

export type Hotspot = {
  id: string;
  label: string;
  description: string;
  /**
   * Position expressed as a fraction of the model's bounding-box half-extent
   * from its center, each axis in [-1, 1]. Derived from the actual named
   * materials in public/models/pulsar.glb (HeadLight, SEAT, FrontTyre, etc).
   */
  position: [number, number, number];
  /** Optional YouTube video ID — proves a hotspot card can carry more than text. */
  youtubeId?: string;
};

export const hotspots: Hotspot[] = [
  {
    id: "headlight",
    label: "LED Headlight",
    description:
      "Projector LED headlamp tuned for a sharp beam pattern and lower power draw than a halogen unit.",
    position: [0, 0.37, 0.6],
  },
  {
    id: "front-tyre",
    label: "Front Tyre",
    description:
      "Grippy tread compound built to last, engineered for confident control across wet and dry roads.",
    position: [0, -0.29, 0.64],
    youtubeId: "nGmCNl9nRAc",
  },
  {
    id: "seat",
    label: "Split Seat",
    description:
      "Sculpted dual-tone seat that balances rider comfort on long rides with a sporty stance.",
    position: [0, 0.3, -0.38],
  },
  {
    id: "engine",
    label: "150cc Engine",
    description:
      "Fuel-injected single-cylinder engine tuned for a strong mid-range punch and refined cruising.",
    position: [0, -0.05, -0.1],
  },
  {
    id: "rear-tyre",
    label: "Rear Tyre",
    description:
      "Wider rear contact patch for stability under acceleration and confident cornering lean angles.",
    position: [0, -0.41, -0.6],
  },
];

export function normalizedToWorld(box: THREE.Box3, position: [number, number, number]) {
  const center = box.getCenter(new THREE.Vector3());
  const halfSize = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  return new THREE.Vector3(
    center.x + position[0] * halfSize.x,
    center.y + position[1] * halfSize.y,
    center.z + position[2] * halfSize.z
  );
}
