"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { BikeFeature } from "../lib/features";
import { normalizedToWorld } from "../lib/hotspots";

// How fast the camera lerps to the target position
const LERP_SPEED = 0.06;

type IntroCameraControllerProps = {
  activeFeature: BikeFeature | null;
  box: THREE.Box3 | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onCoordinateCapture?: (data: CoordinateData) => void;
  isInspectorActive: boolean;
};

export type CoordinateData = {
  // World-space hit point on the model
  worldHit: [number, number, number];
  // Normalized bounding-box coordinate (the format used in features.ts)
  normalizedHit: [number, number, number];
  // Current camera world position
  cameraPosition: [number, number, number];
  // Current orbit controls target
  orbitTarget: [number, number, number];
  // Current camera-to-target offset
  cameraOffset: [number, number, number];
  // Current azimuthal angle (radians)
  azimuth: number;
  // Current polar angle (radians)
  polar: number;
  // Current distance from target (zoom level)
  distance: number;
};

export default function IntroCameraController({
  activeFeature,
  box,
  controlsRef,
  onCoordinateCapture,
  isInspectorActive,
}: IntroCameraControllerProps) {
  const { camera, raycaster, scene, gl } = useThree();

  // Target state for lerping
  const targetCamPos = useRef(new THREE.Vector3());
  const targetOrbitTarget = useRef(new THREE.Vector3(0, 0.5, 0));
  const isAnimating = useRef(false);
  const hasSetInitial = useRef(false);

  // Set initial camera position on mount
  useEffect(() => {
    if (!hasSetInitial.current) {
      hasSetInitial.current = true;
      targetCamPos.current.copy(camera.position);
    }
  }, [camera]);

  // When a feature is selected, compute the world-space target and camera position
  useEffect(() => {
    if (!activeFeature || !box) {
      // No feature selected — reset to default spinning view
      isAnimating.current = false;
      return;
    }

    const featureWorld = normalizedToWorld(box, activeFeature.targetPosition);
    const offset = new THREE.Vector3(...activeFeature.cameraOffset);
    const newCamPos = featureWorld.clone().add(offset);

    targetCamPos.current.copy(newCamPos);
    targetOrbitTarget.current.copy(featureWorld);
    isAnimating.current = true;
  }, [activeFeature, box]);

  // Handle raycasting click for Coordinate Inspector
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!isInspectorActive || !box || !onCoordinateCapture) return;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const hit = intersects[0].point;

        // Compute normalized bounding box coordinate
        const center = box.getCenter(new THREE.Vector3());
        const halfSize = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        const normalized: [number, number, number] = [
          halfSize.x > 0 ? (hit.x - center.x) / halfSize.x : 0,
          halfSize.y > 0 ? (hit.y - center.y) / halfSize.y : 0,
          halfSize.z > 0 ? (hit.z - center.z) / halfSize.z : 0,
        ];

        // Get current orbit state
        const controls = controlsRef.current;
        const camPos = camera.position.clone();
        const offset = camPos.clone().sub(hit);

        // Calculate spherical coordinates relative to the hit point
        const spherical = new THREE.Spherical().setFromVector3(offset);
        const azimuth = spherical.theta;
        const polar = spherical.phi;
        const distance = spherical.radius;

        onCoordinateCapture({
          worldHit: [hit.x, hit.y, hit.z],
          normalizedHit: normalized,
          cameraPosition: [camPos.x, camPos.y, camPos.z],
          orbitTarget: [hit.x, hit.y, hit.z], // The target is now the hit point
          cameraOffset: [offset.x, offset.y, offset.z],
          azimuth,
          polar,
          distance,
        });
      }
    },
    [isInspectorActive, box, onCoordinateCapture, gl, raycaster, camera, scene, controlsRef]
  );

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("click", handleClick);
    return () => canvas.removeEventListener("click", handleClick);
  }, [gl, handleClick]);

  // Smooth camera lerp on every frame
  useFrame(() => {
    if (!isAnimating.current) return;

    const controls = controlsRef.current;
    const distToTarget = camera.position.distanceTo(targetCamPos.current);

    // Lerp camera position
    camera.position.lerp(targetCamPos.current, LERP_SPEED);

    // Lerp orbit target
    if (controls) {
      controls.target.lerp(targetOrbitTarget.current, LERP_SPEED);
      controls.update();
    }

    // Stop animating when close enough
    if (distToTarget < 0.005) {
      isAnimating.current = false;
    }
  });

  return null;
}
