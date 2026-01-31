/**
 * Drag coefficient vs Mach number and drag force.
 * Subsonic: ~0.35, Transonic: spike, Supersonic: ~0.6 decreasing.
 */

export function dragCoefficient(mach: number): number {
  if (mach < 0.8) return 0.35;
  if (mach <= 1.2) {
    // Transonic drag rise (smooth interpolation)
    const t = (mach - 0.8) / 0.4;
    return 0.35 + t * (1.0 - 0.35) + 0.3 * Math.sin(Math.PI * t); // spike
  }
  // Supersonic: Cd ~ 0.6, slowly decreasing
  return 0.6 - 0.02 * Math.min(mach - 1.2, 2);
}

/**
 * Drag force (N): F = 0.5 * rho * v^2 * Cd * A
 * Opposes velocity (caller applies direction).
 */
export function dragForceMagnitude(
  airDensity: number,
  velocityMagnitude: number,
  cd: number,
  referenceArea: number
): number {
  return 0.5 * airDensity * velocityMagnitude * velocityMagnitude * cd * referenceArea;
}
