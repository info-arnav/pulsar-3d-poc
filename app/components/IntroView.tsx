"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import { useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import FloatingNav from "./FloatingNav";
import BikeModel from "./BikeModel";
import IntroCameraController, { type CoordinateData } from "./IntroCameraController";
import IntroFloorGrid from "./IntroFloorGrid";
import { bikeFeatures, getFeatureGroups, type BikeFeature } from "../lib/features";

const INITIAL_CAM: [number, number, number] = [2.5, 1.3, 2.9];
const TARGET: [number, number, number] = [0, 0.5, 0];
const IDLE_RESUME_MS = 10_000;

const COLORS = [
  { name: "Signal Red",  value: "#8c1d1d", label: "RED" },
  { name: "Matte Black", value: "#0f0f0f", label: "BLK" },
  { name: "Pearl White", value: "#e8e8e8", label: "WHT" },
];

type IntroViewProps = {
  interactive?: boolean;
};

// ─── Canvas Loader ────────────────────────────────────────────────────────────
function CanvasLoader() {
  const { progress, active } = useProgress();
  if (!active && progress >= 100) return null;
  return (
    <div className="canvas-loader">
      <div className="canvas-loader-ring">
        <div className="canvas-loader-spin-outer" />
        <div className="canvas-loader-spin-inner" />
        <span className="canvas-loader-pct">{Math.round(progress)}%</span>
      </div>
      <p className="canvas-loader-label">Loading Pulsar</p>
    </div>
  );
}

// ─── Coordinate Inspector Panel ───────────────────────────────────────────────
function CoordinateInspector({
  data,
  onCopy,
  copied,
}: {
  data: CoordinateData | null;
  onCopy: () => void;
  copied: boolean;
}) {
  const f = (n: number) => n.toFixed(4);
  const f3 = (v: [number, number, number]) => `[${f(v[0])}, ${f(v[1])}, ${f(v[2])}]`;

  return (
    <div className="coord-inspector">
      <div className="coord-inspector-header">
        <span className="coord-dot" />
        COORDINATE INSPECTOR
      </div>
      {data ? (
        <div className="coord-body">
          <div className="coord-row"><span className="coord-label">Target Position</span><span className="coord-value coord-red">{f3(data.targetPosition)}</span></div>
          <div className="coord-row"><span className="coord-label">Camera Position</span><span className="coord-value">{f3(data.cameraPosition)}</span></div>
          <div className="coord-row"><span className="coord-label">World Hit Point</span><span className="coord-value">{f3(data.worldHit)}</span></div>
          <div className="coord-row"><span className="coord-label">Normalized Hit</span><span className="coord-value">{f3(data.normalizedHit)}</span></div>
          <div className="coord-divider" />
          <div className="coord-row"><span className="coord-label">Spherical Dist</span><span className="coord-value coord-green">{f(data.spherical.distance)}</span></div>
          <div className="coord-row"><span className="coord-label">Spherical Polar</span><span className="coord-value coord-amber">{f(data.spherical.polar)}</span></div>
          <div className="coord-row"><span className="coord-label">Spherical Azimuth</span><span className="coord-value coord-amber">{f(data.spherical.azimuth)}</span></div>
          <button onClick={onCopy} className="coord-copy-btn">
            {copied ? "✓ Copied!" : "Copy Config"}
          </button>
        </div>
      ) : (
        <div className="coord-empty">Click any part of the bike to capture coordinates</div>
      )}
    </div>
  );
}

// ─── Reusable View ───────────────────────────────────────────────────────────
export default function IntroView({ interactive = true }: IntroViewProps) {
  const [box, setBox] = useState<THREE.Box3 | null>(null);
  const [activeFeature, setActiveFeature] = useState<BikeFeature | null>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [coordData, setCoordData] = useState<CoordinateData | null>(null);
  const [copied, setCopied] = useState(false);

  const controlsRef = useRef<OrbitControlsImpl>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const featureGroups = getFeatureGroups();

  // Start a countdown — after IDLE_RESUME_MS of no interaction, resume rotation
  const scheduleRotationResume = useCallback(() => {
    if (!interactive) return; // If locked, rotation only resumes on explicit reset or timeout
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setAutoRotate(true), IDLE_RESUME_MS);
  }, [interactive]);

  // Called whenever the user starts dragging the model
  const handleUserDragStart = useCallback(() => {
    if (!interactive) return;
    setAutoRotate(false);
    scheduleRotationResume();
  }, [interactive, scheduleRotationResume]);

  const handleFeatureClick = useCallback(
    (feature: BikeFeature) => {
      setActiveFeature((prev) => (prev?.id === feature.id ? null : feature));
      setAutoRotate(false);
      if (interactive) {
        scheduleRotationResume();
      }
    },
    [interactive, scheduleRotationResume]
  );

  const handleReset = useCallback(() => {
    setActiveFeature(null);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setAutoRotate(true);
    if (controlsRef.current) controlsRef.current.reset();
  }, []);

  const handleCoordCapture = useCallback((data: CoordinateData) => {
    setCoordData(data);
  }, []);

  const handleCopyConfig = useCallback(() => {
    if (!coordData) return;
    const config = JSON.stringify(
      {
        targetPosition: coordData.targetPosition.map((v) => parseFloat(v.toFixed(4))),
        cameraPosition: coordData.cameraPosition.map((v) => parseFloat(v.toFixed(4))),
        spherical: {
          distance: parseFloat(coordData.spherical.distance.toFixed(4)),
          polar: parseFloat(coordData.spherical.polar.toFixed(4)),
          azimuth: parseFloat(coordData.spherical.azimuth.toFixed(4)),
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(config).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [coordData]);

  // Cleanup idle timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return (
    <div className="intro-root">
      <div className="intro-bg-glow" />
      <div className="intro-bg-noise" />

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <aside className="feature-panel">
        {/* Logo */}
        <header className="feature-header">
          <p className="feature-eyebrow">Bajaj Auto</p>
          <div className="feature-logo">
            <span className="feature-logo-pulsar">PULSAR</span>
            <span className="feature-logo-model">150 · Twin Disc</span>
          </div>
          <div className="feature-header-rule" />
        </header>

        {/* Feature list — grouped by category */}
        <nav className="feature-list" aria-label="Bike features">
          {featureGroups.map(({ category, features }) => (
            <div key={category} className="feature-group">
              <p className="feature-category">{category}</p>
              {features.map((feature) => {
                const isActive = activeFeature?.id === feature.id;
                return (
                  <button
                    key={feature.id}
                    id={`feature-${feature.id}`}
                    onClick={() => handleFeatureClick(feature)}
                    className={`feature-row${isActive ? " feature-row--active" : ""}`}
                  >
                    <span className="feature-row-num">
                      {String(feature.index).padStart(2, "0")}
                    </span>
                    <div className="feature-row-body">
                      <span className="feature-row-label">{feature.label}</span>
                      <span className="feature-row-tagline">{feature.tagline}</span>
                    </div>
                    <span className="feature-row-chevron" aria-hidden>›</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>



        {/* Footer — paint + reset */}
        <footer className="panel-footer">
          <div className="color-switcher">
            <p className="color-switcher-label">Paint</p>
            <div className="color-swatches">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  id={`color-${c.label}`}
                  onClick={() => setColor(c.value)}
                  title={c.name}
                  className={`color-swatch${color === c.value ? " color-swatch--active" : ""}`}
                >
                  <span className="color-swatch-dot" style={{ backgroundColor: c.value }} />
                  <span className="color-swatch-text">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
          <button id="btn-reset" onClick={handleReset} className="reset-btn">
            ↺ Default Orbit
          </button>
        </footer>
      </aside>

      {/* ── 3D CANVAS ──────────────────────────────────────────────────────── */}
      <main className="canvas-area">
        <CanvasLoader />

        {/* Floating Spec Panel (Popup to the right of the sidebar) */}
        {activeFeature && (
          <div className="spec-popup" id="spec-popup">
            <span className="spec-popup-badge">{activeFeature.category}</span>
            <h2 className="spec-popup-name">{activeFeature.label}</h2>
            <p className="spec-popup-desc">{activeFeature.description}</p>
            <div className="spec-popup-divider" />
            <div className="spec-chips">
              {activeFeature.specs.map((s, i) => (
                <div key={i} className="spec-chip">{s}</div>
              ))}
            </div>
          </div>
        )}

        <Canvas shadows camera={{ position: INITIAL_CAM, fov: 42 }} className="intro-canvas">
          <color attach="background" args={["#080808"]} />
          <fog attach="fog" args={["#080808", 10, 22]} />

          <ambientLight intensity={0.7} />
          <directionalLight
            position={[4, 6, 4]}
            intensity={2.0}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-4}
            shadow-camera-right={4}
            shadow-camera-top={4}
            shadow-camera-bottom={-4}
            shadow-camera-near={0.5}
            shadow-camera-far={14}
            shadow-bias={-0.0004}
          />
          <pointLight position={[0, 0.5, 2.5]} color="#fe0100" intensity={1.0} distance={5} />
          <pointLight position={[-2, 1.5, -2]} color="#ffffff" intensity={0.35} distance={6} />

          <Suspense fallback={null}>
            <BikeModel color={color} onReady={setBox} />
            <Environment preset="city" />
          </Suspense>

          <ContactShadows position={[0, -0.09, 0]} opacity={0.5} blur={2.5} far={2} scale={4} />
          <IntroFloorGrid />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={TARGET}
            enablePan={false}
            enableZoom={interactive}
            enableRotate={interactive}
            enableDamping
            dampingFactor={0.07}
            minDistance={0.5}
            maxDistance={7}
            minPolarAngle={Math.PI / 8}
            maxPolarAngle={Math.PI / 2.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            onStart={handleUserDragStart}
          />

          {box && (
            <IntroCameraController
              activeFeature={activeFeature}
              box={box}
              controlsRef={controlsRef}
              onCoordinateCapture={handleCoordCapture}
              isInspectorActive={showInspector}
            />
          )}
        </Canvas>

        {/* Inspector toggle */}
        <button
          id="btn-inspector-toggle"
          onClick={() => setShowInspector((v) => !v)}
          className={`inspector-toggle${showInspector ? " inspector-toggle--active" : ""}`}
        >
          {showInspector ? "◉" : "○"} Inspector
        </button>

        {/* Coordinate Inspector Panel */}
        {showInspector && (
          <CoordinateInspector data={coordData} onCopy={handleCopyConfig} copied={copied} />
        )}
      </main>

      <FloatingNav />
    </div>
  );
}
