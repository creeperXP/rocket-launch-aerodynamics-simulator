/**
 * Center of Gravity (CG) from nose tip.
 * CG = sum(mass_i * x_i) / total_mass
 * All positions x from nose tip (m).
 */

export interface MassComponent {
  /** Position of component's center from nose tip (m) */
  positionFromNose: number;
  /** Mass (kg) */
  mass: number;
}

/**
 * Approximate positions for common components (center of each part).
 */
export function computeCG(components: MassComponent[]): number {
  let sumMx = 0;
  let sumM = 0;
  for (const c of components) {
    sumMx += c.mass * c.positionFromNose;
    sumM += c.mass;
  }
  return sumM <= 0 ? 0 : sumMx / sumM;
}

/**
 * Build mass components from rocket geometry and payload/motor params.
 * Nose: center at noseLength/2, estimate mass from volume * density (or use param).
 * Body: center at noseLength + bodyLength/2.
 * Fins: center at fin CP region (simplified: finRootLeadingEdge + avg chord).
 * Payload: user-specified position.
 * Motor: user-specified position (e.g. at aft end).
 */
export interface CGParams {
  noseLength: number;
  bodyLength: number;
  bodyDiameter: number;
  finRootLeadingEdge: number;
  finRootChord: number;
  finTipChord: number;
  /** Nose cone mass (kg) - optional, estimated if not provided */
  noseMass?: number;
  /** Body tube mass (kg) */
  bodyMass: number;
  /** Fins total mass (kg) */
  finMass: number;
  /** Payload mass (kg) */
  payloadMass: number;
  /** Payload position from nose (m) */
  payloadPosition: number;
  /** Motor (case + propellant) mass (kg) */
  motorMass: number;
  /** Motor center position from nose (m) */
  motorPosition: number;
}

const NOSE_DENSITY = 500; // kg/m³ typical for plastic/balsa

export function buildCGComponents(p: CGParams): MassComponent[] {
  const comps: MassComponent[] = [];

  // Nose cone: solid cone CG is 3/4 of length from tip (1/4 from base)
  const noseMass = p.noseMass ?? (1 / 3) * Math.PI * (p.bodyDiameter / 2) ** 2 * p.noseLength * NOSE_DENSITY;
  comps.push({ positionFromNose: (3 / 4) * p.noseLength, mass: noseMass });

  comps.push({
    positionFromNose: p.noseLength + p.bodyLength / 2,
    mass: p.bodyMass,
  });

  const finCenterX = p.finRootLeadingEdge + (p.finRootChord + p.finTipChord) / 4;
  comps.push({ positionFromNose: finCenterX, mass: p.finMass });

  if (p.payloadMass > 0) {
    comps.push({ positionFromNose: p.payloadPosition, mass: p.payloadMass });
  }

  comps.push({ positionFromNose: p.motorPosition, mass: p.motorMass });

  return comps;
}

export function centerOfGravity(p: CGParams): number {
  return computeCG(buildCGComponents(p));
}
