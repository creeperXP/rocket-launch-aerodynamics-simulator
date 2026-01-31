/**
 * Barrowman equations for center of pressure (CP) calculation.
 * Subsonic, small angle of attack. Distances from nose tip.
 * Ref: James S. Barrowman, "The Practical Calculation of the Aerodynamic
 * Characteristics of Slender Finned Vehicles", 1967.
 */

import type { NoseShape, RocketGeometry } from '@/types/rocket';

export type { NoseShape, RocketGeometry };

/**
 * Nose cone: (CN)N = 2
 * Cone: XN = 0.666*LN, Ogive: XN = 0.466*LN
 */
function noseTerms(ln: number, shape: NoseShape) {
  const CN_N = 2;
  const XN = shape === 'cone' ? (2 / 3) * ln : 0.466 * ln;
  return { CN: CN_N, X: XN };
}

/**
 * Body tube has zero normal force at zero angle of attack in Barrowman.
 * So we only sum nose + fins.
 */

/**
 * Fin terms (trapezoidal fins).
 * K_FB = 1 + R/(S+R)  (fin-body interference)
 * (CN)F = K_FB * 4*N*(S/d)^2 / (1 + sqrt(1 + (2*LF/(CR+CT))^2))
 * LF = length of fin mid-chord line = sqrt(S^2 + (XR + (CT-CR)/2)^2)
 * XF = XB + (XR/3)*(CR+2*CT)/(CR+CT) + (1/6)*(CR^2+CT^2+CR*CT)/(CR+CT)
 */
function finTerms(g: RocketGeometry) {
  const d = g.bodyDiameter;
  const R = d / 2;
  const S = g.finSemispan;
  const CR = g.finRootChord;
  const CT = g.finTipChord;
  const XR = g.finSweep;
  const XB = g.finRootLeadingEdge;
  const N = g.numFins;

  const K_FB = 1 + R / (S + R);
  const midChordHorizontal = XR + (CT - CR) / 2;
  const LF = Math.sqrt(S * S + midChordHorizontal * midChordHorizontal);
  const denom = 1 + Math.sqrt(1 + Math.pow((2 * LF) / (CR + CT), 2));
  const CN_F = K_FB * (4 * N * (S / d) ** 2) / denom;

  const XF =
    XB +
    (XR / 3) * ((CR + 2 * CT) / (CR + CT)) +
    (1 / 6) * ((CR * CR + CT * CT + CR * CT) / (CR + CT));

  return { CN: CN_F, X: XF };
}

/**
 * CP distance from nose tip (m).
 * CP = ((CN)N * XN + (CN)F * XF) / ((CN)N + (CN)F)
 */
export function centerOfPressure(geometry: RocketGeometry): number {
  const nose = noseTerms(geometry.noseLength, geometry.noseShape);
  const fin = finTerms(geometry);

  const totalCN = nose.CN + fin.CN;
  if (totalCN <= 0) return 0;
  return (nose.CN * nose.X + fin.CN * fin.X) / totalCN;
}

/**
 * Reference area for stability margin (cross-section of body), m²
 */
export function referenceArea(geometry: RocketGeometry): number {
  const r = geometry.bodyDiameter / 2;
  return Math.PI * r * r;
}

/**
 * Caliber = body diameter. Stability margin in calibers = (CP - CG) / diameter.
 * Stable if margin >= 1 (ideally 1–2).
 */
export function stabilityMarginCalibers(cpFromNose: number, cgFromNose: number, diameter: number): number {
  return (cpFromNose - cgFromNose) / diameter;
}

export function isStable(calibers: number, minCalibers = 1): boolean {
  return calibers >= minCalibers;
}
