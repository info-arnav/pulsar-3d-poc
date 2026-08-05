"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const SCENE_PATH = "/models/update_dirt_road_through_forest.glb";

// public/models/update_dirt_road_through_forest.glb — a real photogrammetry-style scene
// (Sketchfab, CC-BY 4.0, "[UPDATE] Dirt Road Through Forest" by 99.Miles).
//
// Its raw bounding box is X:551 / Y:111 / Z:548 — X and Z are both large and roughly equal
// (a ground footprint), Y is the small one (terrain relief). That's already correct Y-up, so
// no rotation is applied here. Content is recentered onto its own local origin on all three
// axes, then placed with this final pose — tuned by hand with an on-screen Move/Rotate/Scale
// gizmo (since it's uneven natural terrain, there's no single "ground height" to compute).
const POSITION: [number, number, number] = [8.16, -0.66, -9.45];
const ROTATION_Y = THREE.MathUtils.degToRad(-45.4);
const SCALE = 0.461;

export default function ForestBackdrop() {
  const { scene } = useGLTF(SCENE_PATH);

  const wrapper = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) child.receiveShadow = true;
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    cloned.position.set(-center.x, -center.y, -center.z);

    const group = new THREE.Group();
    group.add(cloned);
    return group;
  }, [scene]);

  return (
    <primitive
      object={wrapper}
      position={POSITION}
      rotation={[0, ROTATION_Y, 0]}
      scale={SCALE}
      dispose={null}
    />
  );
}

useGLTF.preload(SCENE_PATH);
