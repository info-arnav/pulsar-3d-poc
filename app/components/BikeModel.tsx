"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const MODEL_PATH = "/models/pulsar.glb";

/** The painted tank/side-panel shrouds use the "main_body" material — we retint it to swap color. */
const PAINT_MATERIAL_NAME = "main_body";

type BikeModelProps = {
  color?: string;
  onReady?: (box: THREE.Box3) => void;
};

export default function BikeModel({ color, onReady }: BikeModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const reportedRef = useRef(false);

  useEffect(() => {
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
    });

    if (!reportedRef.current) {
      reportedRef.current = true;
      const box = new THREE.Box3().setFromObject(cloned);
      onReady?.(box);
    }
  }, [cloned, onReady]);

  useEffect(() => {
    if (!color) return;
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const material = child.material as
        | THREE.MeshStandardMaterial
        | THREE.MeshStandardMaterial[];
      const materials = Array.isArray(material) ? material : [material];
      for (const mat of materials) {
        if (mat?.name === PAINT_MATERIAL_NAME) {
          mat.color.set(color);
        }
      }
    });
  }, [cloned, color]);

  return <primitive object={cloned} dispose={null} />;
}

useGLTF.preload(MODEL_PATH);
