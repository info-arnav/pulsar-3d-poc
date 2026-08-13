// Interconnected motorcycle performance simulation.
// Runs on a single rAF loop outside React; consumers subscribe imperatively.

export type SimState = {
  throttle: number; // 0..1
  brake: number; // 0..1
  rpm: number;
  speed: number; // km/h
  gear: number; // 1..6
  torque: number; // Nm at crank
  accel: number; // m/s^2
  lean: number; // -1..1
  wheelAngle: number; // rad
  power: number; // hp
  auto: boolean;
  running: boolean;
  shiftFlash: number; // decays 0..1 right after a shift
  mode: "eco" | "normal" | "sports";
};

export const GEARS = [2.92, 2.05, 1.6, 1.32, 1.13, 0.96];
const FINAL = 7.8;
const WHEEL_R = 0.31; // m
const MASS = 210; // kg (bike + rider)
const IDLE = 1250;
const REDLINE = 10500;
const DRAG = 0.32; // aero
const ROLL = 0.014;

// Crank torque curve (Nm) vs rpm — peaky single-cylinder feel.
export function torqueAt(rpm: number) {
  const x = Math.max(rpm, 800);
  const peak = 28.5;
  const t = peak * Math.exp(-Math.pow((x - 7600) / 3300, 2)) + 8 * Math.exp(-Math.pow((x - 3000) / 2600, 2));
  return Math.max(3, t);
}

type Listener = (s: SimState) => void;

class Sim {
  s: SimState = {
    throttle: 0,
    brake: 0,
    rpm: IDLE,
    speed: 0,
    gear: 1,
    torque: torqueAt(IDLE),
    accel: 0,
    lean: 0,
    wheelAngle: 0,
    power: 0,
    auto: true,
    running: false,
    shiftFlash: 0,
    mode: "normal",
  };
  private listeners = new Set<Listener>();
  private raf = 0;
  private last = 0;
  private shiftCooldown = 0;
  private clutch = 1; // 1 = engaged
  private brakeTime = 0;
  private initialBrakeSpeed = 0;
  onShift: ((dir: number, gear: number) => void) | null = null;

  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  set(partial: Partial<SimState>) {
    Object.assign(this.s, partial);
  }

  shift(dir: number) {
    const next = Math.min(GEARS.length, Math.max(1, this.s.gear + dir));
    if (next === this.s.gear) return;
    this.s.gear = next;
    this.s.shiftFlash = 1;
    this.clutch = 0;
    this.shiftCooldown = 0.45;
    this.onShift?.(dir, next);
  }

  start() {
    if (this.raf) return;
    this.s.running = true;
    this.last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - this.last) / 1000);
      this.last = t;
      this.step(dt);
      for (const l of this.listeners) l(this.s);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.s.running = false;
  }

  private step(dt: number) {
    const s = this.s;
    const v = s.speed / 3.6; // m/s

    // clutch re-engage after a shift
    if (this.shiftCooldown > 0) this.shiftCooldown -= dt;
    this.clutch += ((this.shiftCooldown > 0.2 ? 0 : 1) - this.clutch) * Math.min(1, dt * 9);
    s.shiftFlash = Math.max(0, s.shiftFlash - dt * 2.2);

    const ratio = (GEARS[s.gear - 1] ?? 1) * FINAL;

    // drive modes RPM limit and torque scale
    const modeRpmLimits = { eco: 6500, normal: 9000, sports: 10500 };
    const modeTorqueScales = { eco: 0.65, normal: 1.0, sports: 1.15 };
    const currentRedline = modeRpmLimits[s.mode] ?? 9000;
    const torqueScale = modeTorqueScales[s.mode] ?? 1.0;

    // clutch slips off the line, locks up as road speed builds
    const launchLock = Math.min(1, v / 6.5);
    const lock = this.clutch * launchLock;

    // engine rpm follows wheel speed through the gearbox, blended by lock-up
    const geared = (v / WHEEL_R) * ratio * (60 / (2 * Math.PI));
    const free = IDLE + s.throttle * (currentRedline - IDLE);
    const target = Math.max(IDLE, lock * geared + (1 - lock) * Math.max(free, geared * 0.6));
    const rpmLag = lock > 0.5 ? 14 : 5;
    s.rpm += (Math.min(currentRedline, target) - s.rpm) * Math.min(1, dt * rpmLag);

    // limiter chop
    if (s.rpm > currentRedline - 120) s.rpm = currentRedline - 120 - Math.random() * 260;

    s.torque = torqueAt(s.rpm) * (0.2 + 0.8 * s.throttle) * torqueScale;
    s.power = (s.torque * s.rpm) / 7127; // hp

    let nv = v;
    let a = 0;

    // precision braking: speed to 0 in exactly 3 seconds if brake is active
    if (s.brake > 0.1) {
      if (this.brakeTime === 0) {
        this.initialBrakeSpeed = s.speed;
      }
      this.brakeTime += dt;
      const progress = Math.min(1.0, this.brakeTime / 3.0);
      s.speed = Math.max(0, this.initialBrakeSpeed * (1.0 - progress));
      nv = s.speed / 3.6;
      a = dt > 0 ? (nv - v) / dt : 0;
    } else {
      this.brakeTime = 0;
      this.initialBrakeSpeed = 0;

      // normal acceleration/deceleration physics
      const transmit = this.clutch * Math.max(launchLock, s.throttle * 0.95);
      const wheelForce = (s.torque * ratio * 0.92 * transmit) / WHEEL_R;
      const dragF = DRAG * v * v + ROLL * MASS * 9.81 + (s.throttle < 0.05 ? 90 : 0);
      a = (wheelForce - dragF) / MASS;
      if (v <= 0.05 && a < 0) a = 0;

      nv = v + a * dt;
      if (nv < 0) nv = 0;
      s.speed = nv * 3.6;
    }

    // In manual mode, clamp speed by gear
    if (!s.auto) {
      const gearSpeedLimits = [40, 70, 95, 120, 140, 160]; // km/h limits for gear 1, 2, 3, 4, 5, 6
      const maxSpeedForGear = gearSpeedLimits[s.gear - 1] ?? 160;
      if (s.speed > maxSpeedForGear) {
        s.speed = maxSpeedForGear;
        nv = maxSpeedForGear / 3.6;
      }
    }

    s.accel += (a - s.accel) * Math.min(1, dt * 8);

    // automatic gearbox
    if (s.auto && this.shiftCooldown <= 0) {
      if (s.rpm > 9400 && s.gear < GEARS.length) this.shift(1);
      else if (s.rpm < 3400 && s.gear > 1 && v > 2) this.shift(-1);
    }

    // visuals
    s.wheelAngle += (nv / WHEEL_R) * dt;
    const leanTarget = Math.max(-1, Math.min(1, s.lean));
    s.lean = leanTarget;
  }
}

export const sim = new Sim();
