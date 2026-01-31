/**
 * Build simulation params and dry mass from rocket design.
 */

import { centerOfPressure, referenceArea } from './barrowman';
import { centerOfGravity } from './cg';
import { getMotor } from './motors';
import {
  createSimulationState,
  stepSimulation,
  type SimulationParams,
  type SimulationState,
} from './simulation';
import type { RocketDesign } from '@/types/rocket';

export function getSimParams(design: RocketDesign): SimulationParams | null {
  const motor = getMotor(design.motorId);
  if (!motor) return null;

  const g = design.geometry;
  const noseMass =
    design.noseMass ??
    (1 / 3) * Math.PI * (g.bodyDiameter / 2) ** 2 * g.noseLength * 500;
  const dryMass =
    noseMass +
    design.bodyMass +
    design.finMass +
    design.payloadMass +
    motor.dryMass;

  return {
    referenceArea: referenceArea(g),
    dryMass,
    motor,
    motorStartTime: 0,
    deployAtApogee: true,
    maxTrailPoints: 500,
  };
}

export function getPreLaunchResults(design: RocketDesign) {
  const g = design.geometry;
  const cp = centerOfPressure(g);
  const cg = centerOfGravity({
    noseLength: g.noseLength,
    bodyLength: g.bodyLength,
    bodyDiameter: g.bodyDiameter,
    finRootLeadingEdge: g.finRootLeadingEdge,
    finRootChord: g.finRootChord,
    finTipChord: g.finTipChord,
    bodyMass: design.bodyMass,
    finMass: design.finMass,
    noseMass: design.noseMass,
    payloadMass: design.payloadMass,
    payloadPosition: design.payloadPosition,
    motorMass: (() => {
      const m = getMotor(design.motorId);
      return m ? m.propellantMass + m.dryMass : 0.03;
    })(),
    motorPosition: design.motorPosition,
  });
  const diameter = g.bodyDiameter;
  const stabilityCalibers = (cp - cg) / diameter;
  const isStable = stabilityCalibers >= 1;
  return { cp, cg, stabilityCalibers, isStable };
}

export function createInitialSimState(design: RocketDesign): SimulationState | null {
  const params = getSimParams(design);
  if (!params) return null;
  return createSimulationState(params);
}

export { stepSimulation };
export type { SimulationState, SimulationParams };
