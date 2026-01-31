/**
 * Motor thrust curves. Simple trapezoidal or Estes-like data.
 * Thrust in N, time in s.
 */

export interface MotorSpec {
  id: string;
  name: string;
  /** Total impulse (N·s) */
  totalImpulse: number;
  /** Burn time (s) */
  burnTime: number;
  /** Propellant mass (kg) */
  propellantMass: number;
  /** Casing + nozzle mass (kg) */
  dryMass: number;
  /** Get thrust (N) at time t (s) from start of burn */
  thrustAt: (t: number) => number;
}

/**
 * Trapezoidal: ramp up, sustain, ramp down.
 */
function trapezoidalThrust(
  peakThrust: number,
  burnTime: number,
  rampUpRatio = 0.1,
  rampDownRatio = 0.2
): (t: number) => number {
  const t1 = burnTime * rampUpRatio;
  const t2 = burnTime * (1 - rampDownRatio);
  return (t: number) => {
    if (t <= 0 || t >= burnTime) return 0;
    if (t < t1) return (peakThrust * t) / t1;
    if (t <= t2) return peakThrust;
    return (peakThrust * (burnTime - t)) / (burnTime - t2);
  };
}

/**
 * Estes C6-like: total impulse ~10 N·s, burn ~1.5 s.
 */
export const MOTORS: MotorSpec[] = [
  {
    id: 'estes-a8',
    name: 'Estes A8',
    totalImpulse: 2.5,
    burnTime: 0.5,
    propellantMass: 0.006,
    dryMass: 0.012,
    thrustAt: trapezoidalThrust(5.5, 0.5),
  },
  {
    id: 'estes-b6',
    name: 'Estes B6',
    totalImpulse: 5,
    burnTime: 0.8,
    propellantMass: 0.012,
    dryMass: 0.012,
    thrustAt: trapezoidalThrust(7.5, 0.8),
  },
  {
    id: 'estes-c6',
    name: 'Estes C6',
    totalImpulse: 10,
    burnTime: 1.6,
    propellantMass: 0.024,
    dryMass: 0.012,
    thrustAt: trapezoidalThrust(9, 1.6),
  },
  {
    id: 'estes-d12',
    name: 'Estes D12',
    totalImpulse: 20,
    burnTime: 2.2,
    propellantMass: 0.044,
    dryMass: 0.014,
    thrustAt: trapezoidalThrust(14, 2.2),
  },
  {
    id: 'custom-mid',
    name: 'Custom Mid',
    totalImpulse: 50,
    burnTime: 3,
    propellantMass: 0.08,
    dryMass: 0.02,
    thrustAt: trapezoidalThrust(25, 3),
  },
];

export function getMotor(id: string): MotorSpec | undefined {
  return MOTORS.find((m) => m.id === id);
}
