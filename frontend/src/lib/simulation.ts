/**
 * Flight simulation: integrate thrust, drag, gravity.
 * 1D vertical flight (altitude, velocity, mass change).
 * Thrust increases slightly with altitude as ambient pressure drops (F ∝ P_exit - P_amb).
 * Drag starts at zero, peaks near Max-Q (max dynamic pressure ½ρv²), then falls as ρ drops.
 * To accelerate upward: thrust > weight + drag.
 */

import { density, machNumber, pressure, P0 } from './atmosphere';
import { dragCoefficient, dragForceMagnitude } from './drag';
import type { MotorSpec } from './motors';

const G = 9.81; // m/s²

/** Thrust increases as ambient pressure drops (nozzle pressure term). Factor ≈ 1 at sea level, ~1.1–1.15 in vacuum. */
function thrustAltitudeFactor(altitude: number): number {
  const p = pressure(altitude);
  const ratio = p / P0;
  return 1 + 0.12 * (1 - Math.max(0, ratio));
}

export interface SimulationState {
  time: number;
  altitude: number;
  velocity: number;
  acceleration: number;
  mass: number;
  mach: number;
  cd: number;
  airDensity: number;
  thrust: number;
  drag: number;
  phase: 'pre' | 'burn' | 'coast' | 'apogee' | 'recovery';
  apogee: number;
  /** Trail for 3D: { altitude, velocity, mach, time } */
  trail: Array<{ altitude: number; velocity: number; mach: number; time: number }>;
}

export interface SimulationParams {
  /** Reference area (m²) */
  referenceArea: number;
  /** Dry mass (kg) - rocket without motor propellant */
  dryMass: number;
  motor: MotorSpec;
  /** Motor ignition time (s) - usually 0 */
  motorStartTime?: number;
  /** Parachute deploy at apogee */
  deployAtApogee?: boolean;
  /** Max trail points */
  maxTrailPoints?: number;
}

const MAX_TRAIL = 500;
const DT = 1 / 60; // 60 FPS

function initialState(params: SimulationParams): SimulationState {
  const motor = params.motor;
  const mass = params.dryMass + motor.propellantMass + motor.dryMass;
  return {
    time: 0,
    altitude: 0,
    velocity: 0,
    acceleration: 0,
    mass,
    mach: 0,
    cd: dragCoefficient(0),
    airDensity: density(0),
    thrust: 0,
    drag: 0,
    phase: 'pre',
    apogee: 0,
    trail: [],
  };
}

/**
 * Single integration step. Returns new state.
 */
export function stepSimulation(
  state: SimulationState,
  params: SimulationParams,
  dt: number = DT
): SimulationState {
  const { referenceArea, dryMass, motor, motorStartTime = 0 } = params;
  const t = state.time + dt;
  const h = state.altitude;
  const v = state.velocity;

  const burnTime = motor.burnTime;
  const inBurn = t >= motorStartTime && t < motorStartTime + burnTime;
  const burnElapsed = inBurn ? t - motorStartTime : 0;

  let mass = state.mass;
  if (inBurn) {
    const propUsed = (burnElapsed / burnTime) * motor.propellantMass;
    mass = dryMass + motor.dryMass + motor.propellantMass - propUsed;
  } else if (t >= motorStartTime + burnTime && state.phase === 'burn') {
    mass = dryMass + motor.dryMass;
  }

  const thrustRaw = inBurn ? motor.thrustAt(burnElapsed) : 0;
  const thrust = thrustRaw * (inBurn ? thrustAltitudeFactor(h) : 1);

  const rho = density(h);
  const mach = machNumber(Math.abs(v), h);
  const cd = dragCoefficient(mach);
  const dragMag = dragForceMagnitude(rho, Math.abs(v), cd, referenceArea);
  const drag = v >= 0 ? -dragMag : dragMag; // opposes velocity

  const gravity = -G * mass;
  const netForce = thrust + drag + gravity;
  const acceleration = mass > 0 ? netForce / mass : 0;
  const newVelocity = v + acceleration * dt;
  const newAltitude = Math.max(0, h + v * dt + 0.5 * acceleration * dt * dt);

  let phase = state.phase;
  let apogee = state.apogee;

  if (state.phase === 'pre' && (params.motorStartTime ?? 0) <= t) {
    phase = inBurn ? 'burn' : 'coast';
  }
  if (state.phase === 'burn' && !inBurn) phase = 'coast';
  // During coast, track max altitude; when velocity turns negative we've passed apogee
  if (phase === 'coast') {
    apogee = Math.max(apogee, h);
    if (v < 0) phase = 'apogee';
  }
  if (state.phase === 'apogee') {
    phase = 'recovery'; // parachute deployed
  }

  const trail = [...state.trail];
  trail.push({ altitude: newAltitude, velocity: newVelocity, mach, time: t });
  const maxTrail = params.maxTrailPoints ?? MAX_TRAIL;
  if (trail.length > maxTrail) trail.shift();

  return {
    time: t,
    altitude: newAltitude,
    velocity: newVelocity,
    acceleration,
    mass,
    mach,
    cd,
    airDensity: rho,
    thrust,
    drag,
    phase,
    apogee,
    trail,
  };
}

/**
 * Create initial state for a run.
 */
export function createSimulationState(params: SimulationParams): SimulationState {
  return initialState(params);
}

/**
 * Run simulation until apogee (or max time) for quick apogee estimate.
 */
export function runToApogee(
  params: SimulationParams,
  maxTime = 120,
  dt = 1 / 60
): { state: SimulationState; steps: number } {
  let state = createSimulationState(params);
  let steps = 0;
  while (state.time < maxTime && state.phase !== 'apogee') {
    state = stepSimulation(state, params, dt);
    steps++;
  }
  return { state, steps };
}
