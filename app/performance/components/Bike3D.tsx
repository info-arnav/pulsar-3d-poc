import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, useGLTF } from "@react-three/drei";
import { useRef, memo, useMemo, Suspense } from "react";
import * as THREE from "three";
import { sim } from "../lib/sim";
import { FOCUS_TARGETS, type FocusKey } from "../lib/focus";

const MODEL_URL = "/pulsar.glb";

function BikeModel() {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);

  const { model, wheels, spinAxis, spinSign } = useMemo(() => {
    const model = scene.clone(true);

    const wheels: THREE.Group[] = [];
    const front = model.getObjectByName("front_wheel_579");
    const rear = model.getObjectByName("back_wheel_34");

    // orient: bike length along X with the front wheel at +X
    const oriented = new THREE.Group();
    if (front && rear) {
      const fp = front.getWorldPosition(new THREE.Vector3());
      const rp = rear.getWorldPosition(new THREE.Vector3());
      const dir = fp.clone().sub(rp);
      oriented.rotation.y = -Math.atan2(dir.z, dir.x) + Math.PI;
    }
    oriented.add(model);
    oriented.updateMatrixWorld(true);

    // normalise: centre on origin, sit on the ground, ~2.5 units long
    const box = new THREE.Box3().setFromObject(oriented);
    const size = box.getSize(new THREE.Vector3());
    const s = 2.5 / Math.max(size.x, size.z);
    const holder = new THREE.Group();
    holder.add(oriented);
    holder.scale.setScalar(s);
    holder.updateMatrixWorld(true);
    const box2 = new THREE.Box3().setFromObject(holder);
    const c = box2.getCenter(new THREE.Vector3());
    holder.position.set(-c.x, -box2.min.y, -c.z);

    // spin axis must be the world Z axis expressed inside the rotated model
    const ry = oriented.rotation.y;
    const spinAxis: "x" | "z" = Math.abs(Math.cos(ry)) >= Math.abs(Math.sin(ry)) ? "z" : "x";
    const spinSign = spinAxis === "z" ? Math.sign(Math.cos(ry)) || 1 : -Math.sign(Math.sin(ry)) || 1;

    for (const n of [rear, front]) {
      // the wheel nodes' own origins sit on the axle, so spin them directly
      if (n) wheels.push(n as THREE.Group);
    }

    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });

    return { model: holder, wheels, spinAxis, spinSign };
  }, [scene]);

  useFrame((_, dt) => {
    const s = sim.s;
    for (const w of wheels) w.rotation[spinAxis] = -s.wheelAngle * spinSign;
    if (body.current) {
      const squat = Math.max(0, s.accel) * 0.004 - s.brake * 0.03;
      body.current.rotation.z += (squat - body.current.rotation.z) * Math.min(1, dt * 5);
      const vib = (s.rpm / 10500) * 0.004;
      body.current.position.y = Math.sin(performance.now() * 0.05) * vib;
    }
    if (root.current) {
      root.current.rotation.x += (s.lean * 0.42 - root.current.rotation.x) * Math.min(1, dt * 4);
    }
  });

  return (
    <group ref={root}>
      <group ref={body}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

function Rig({ focus }: { focus: FocusKey }) {
  const target = useRef(new THREE.Vector3(0, 0.85, 0));
  useFrame(({ camera }, dt) => {
    const f = FOCUS_TARGETS[focus];
    const speedBoost = Math.min(1, sim.s.speed / 180);
    const pos = new THREE.Vector3(...f.camera);
    pos.z += speedBoost * 0.5;
    pos.y -= speedBoost * 0.1;
    const k = Math.min(1, dt * 2.2);
    camera.position.lerp(pos, k);
    target.current.lerp(new THREE.Vector3(...f.target), k);
    camera.lookAt(target.current);
  });
  return null;
}

function Ground() {
  const lines = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!lines.current) return;
    const v = sim.s.speed / 3.6;
    lines.current.position.x = (lines.current.position.x - v * dt * 0.6) % 2;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color="#1a1c27" roughness={0.85} metalness={0.2} />
      </mesh>
      <group ref={lines}>
        {Array.from({ length: 40 }).map((_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-20 + i * 2, 0.002, -3.2]}>
            <planeGeometry args={[1.1, 0.06]} />
            <meshBasicMaterial color="#e01f26" opacity={0.35} transparent />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Bike3DInner({ focus }: { focus: FocusKey }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [4.3, 2.0, 5.6], fov: 38 }}
    >
      <color attach="background" args={["#1f222e"]} />
      <fog attach="fog" args={["#1f222e", 8, 24]} />
      <hemisphereLight intensity={1.2} groundColor="#1f222e" color="#8fbaff" />
      <directionalLight
        position={[4, 6, 4]}
        intensity={3.5}
        castShadow
        shadow-mapSize={1024}
        shadow-bias={-0.001}
      />
      {/* Dedicated studio key lights to illuminate the engine and mechanical core */}
      <pointLight position={[1.2, 0.7, 1.2]} intensity={6.0} distance={3} decay={1.5} color="#ffffff" />
      <pointLight position={[-1.2, 0.7, 1.2]} intensity={6.0} distance={3} decay={1.5} color="#ffffff" />
      <pointLight position={[0, 1.3, 0]} intensity={2.0} distance={2} decay={1.5} color="#ffffff" />
      <spotLight position={[-6, 5, 3]} castShadow={false} intensity={70} color="#ff2b3a" angle={0.8} penumbra={1} />
      <spotLight position={[5, 3, -4]} intensity={30} color="#06b6d4" angle={0.9} penumbra={1} />
      <Ground />
      <Suspense fallback={null}>
        <BikeModel />
      </Suspense>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={9} blur={2.4} far={3} frames={1} />

      <Rig focus={focus} />
    </Canvas>
  );
}

export const Bike3D = memo(Bike3DInner);
