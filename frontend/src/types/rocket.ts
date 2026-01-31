/**
 * Shared rocket design types (no lib imports - safe for frontend).
 */

export type NoseShape = 'cone' | 'ogive';

export interface RocketGeometry {
  noseLength: number;
  noseShape: NoseShape;
  bodyDiameter: number;
  bodyLength: number;
  finRootLeadingEdge: number;
  finRootChord: number;
  finTipChord: number;
  finSemispan: number;
  finSweep: number;
  numFins: number;
}

export interface RocketDesign {
  geometry: RocketGeometry;
  bodyMass: number;
  finMass: number;
  noseMass?: number;
  payloadMass: number;
  payloadPosition: number;
  motorId: string;
  motorPosition: number;
}

export interface DesignUpdate {
  geometry?: Partial<RocketGeometry>;
  bodyMass?: number;
  finMass?: number;
  noseMass?: number;
  payloadMass?: number;
  payloadPosition?: number;
  motorId?: string;
  motorPosition?: number;
}
