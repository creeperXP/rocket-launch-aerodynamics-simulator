/**
 * Atmospheric model for flight simulation.
 * ISA-like: temperature and density vs altitude.
 */

const R_AIR = 287.05; // J/(kg·K)
const T0 = 288.15; // K at sea level
const RHO0 = 1.225; // kg/m³ at sea level
const LAPSE = 0.0065; // K/m up to 11 km
const TROPOPAUSE_ALT = 11000; // m
const T_TROP = 216.65; // K at tropopause

/**
 * Temperature (K) vs altitude (m). Linear lapse to 11 km, then constant.
 */
export function temperature(altitude: number): number {
  if (altitude <= 0) return T0;
  if (altitude <= TROPOPAUSE_ALT) return T0 - LAPSE * altitude;
  return T_TROP;
}

/** Sea-level pressure (Pa) for thrust altitude correction */
export const P0 = 101325;

/**
 * Density (kg/m³). Exponential approximation: rho = rho0 * exp(-h/7400).
 * Alternative: use hydrostatic integration; exp is simpler and commonly used.
 */
export function density(altitude: number): number {
  if (altitude <= 0) return RHO0;
  return RHO0 * Math.exp(-altitude / 7400);
}

/**
 * Pressure (Pa) vs altitude. P = ρ R T; using same density model gives
 * P ≈ P0 * exp(-h/7400) for isothermal approximation; we use T(h) for consistency.
 */
export function pressure(altitude: number): number {
  const rho = density(altitude);
  const T = temperature(altitude);
  return rho * R_AIR * T;
}

/**
 * Speed of sound (m/s): a = sqrt(gamma * R * T), gamma = 1.4.
 */
export function speedOfSound(altitude: number): number {
  const T = temperature(altitude);
  return Math.sqrt(1.4 * R_AIR * T);
}

export function machNumber(velocity: number, altitude: number): number {
  const a = speedOfSound(altitude);
  return a > 0 ? velocity / a : 0;
}
