/**
 * Simulation types (no lib imports - safe for frontend).
 */

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
  trail: Array<{ altitude: number; velocity: number; mach: number; time: number }>;
}
