"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const GROUND_Y = -0.09;

/**
 * Animated showroom floor: a dark reflective plane with a glowing red radial gradient
 * and subtle pulsing grid lines. Purely decorative — adds premium depth to the scene.
 */
export default function IntroFloorGrid() {
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Subtle pulse on the glow disc
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + 0.05 * Math.sin(t * 0.8);
    }
  });

  return (
    <group position={[0, GROUND_Y, 0]}>
      {/* Base dark reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.6}
          roughness={0.3}
          envMapIntensity={0.4}
        />
      </mesh>

      {/* Glowing red radial disc beneath the bike */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial
          color="#fe0100"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Inner tighter glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.8, 1.4, 64]} />
        <meshBasicMaterial
          color="#fe0100"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid lines using gridHelper */}
      <gridHelper
        args={[16, 32, "#2a0000", "#1a0000"]}
        position={[0, 0.001, 0]}
      />
    </group>
  );
}
