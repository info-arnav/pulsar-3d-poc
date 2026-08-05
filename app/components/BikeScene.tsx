"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  OrbitControls,
  useProgress,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import BikeModel from "./BikeModel";

export type CameraPreset = { azimuth: number; polar: number };

// Known bounding box of public/models/pulsar.glb, used for sensible camera/shadow defaults
// without needing a runtime auto-fit pass. The model's origin sits at ground level, not its
// visual center, so the camera target needs to aim up at the bike's actual vertical middle.
const GROUND_Y = -0.09;
const TARGET: [number, number, number] = [0, 0.5, 0];

function CameraAim({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);
  return null;
}

function Loader() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-grey/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-neon-red transition-[width] duration-150"
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>
        <p className="text-xs font-medium tracking-wide text-zinc-400">
          Loading model…
        </p>
      </div>
    </div>
  );
}

type BikeSceneProps = {
  color?: string;
  interactive?: boolean;
  cameraPosition?: [number, number, number];
  preset?: CameraPreset | null;
  onBoxReady?: (box: THREE.Box3) => void;
  children?: React.ReactNode;
  className?: string;
};

export default function BikeScene({
  color,
  interactive = true,
  cameraPosition = [2.5, 1.3, 2.9],
  preset,
  onBoxReady,
  children,
  className,
}: BikeSceneProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    if (!preset || !controlsRef.current) return;
    setAutoRotate(false);
    controlsRef.current.setAzimuthalAngle(preset.azimuth);
    controlsRef.current.setPolarAngle(preset.polar);
  }, [preset]);

  return (
    <div className={className ?? "relative h-full w-full"}>
      <Loader />
      <Canvas shadows camera={{ position: cameraPosition, fov: 40 }}>
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[3, 4, 3]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
          shadow-bias={-0.0004}
        />
        <Suspense fallback={null}>
          <BikeModel
            color={color}
            onReady={(box) => {
              onBoxReady?.(box);
            }}
          />
          <Environment preset="city" />
        </Suspense>
        <ContactShadows
          position={[0, GROUND_Y, 0]}
          opacity={0.45}
          blur={2.2}
          far={1.8}
          scale={3}
        />
        {interactive ? (
          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={TARGET}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={2.2}
            maxDistance={7}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1.4}
            onStart={() => setAutoRotate(false)}
          />
        ) : (
          <CameraAim target={TARGET} />
        )}
        {children}
      </Canvas>
    </div>
  );
}
