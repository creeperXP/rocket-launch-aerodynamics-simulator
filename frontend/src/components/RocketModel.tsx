'use client';

/**
 * Rocket built from Three.js primitives: cylinder body + cone nose + rectangular fins.
 * All dimensions in meters. Rocket is aligned along +Y (up) with nose at top.
 * Origin at base of rocket (tail).
 */

export interface RocketModelProps {
  noseLength: number;
  bodyDiameter: number;
  bodyLength: number;
  finRootChord: number;
  finTipChord: number;
  finSemispan: number;
  finSweep: number;
  numFins: number;
  /** Distance from nose tip to fin root leading edge (m) */
  finRootLeadingEdge: number;
  /** Show CG/CP markers (from nose tip, in same length units) */
  cgFromNose?: number;
  cpFromNose?: number;
  totalLength: number;
}

export function RocketModel({
  noseLength,
  bodyDiameter,
  bodyLength,
  finRootChord,
  finTipChord,
  finSemispan,
  finSweep,
  numFins,
  finRootLeadingEdge,
  cgFromNose,
  cpFromNose,
  totalLength,
}: RocketModelProps) {
  const R = bodyDiameter / 2;
  // In our coords: origin at base, +Y up. So "from nose" = distance from top.
  // Nose tip is at y = totalLength. Base at y = 0.
  const noseTipY = totalLength;
  const bodyTopY = totalLength - noseLength;
  const bodyCylinderLength = bodyLength;
  const bodyCylinderY = bodyTopY - bodyCylinderLength / 2;

  const finRootLeY = noseTipY - finRootLeadingEdge; // leading edge of root chord
  const finRootTeY = finRootLeY - finRootChord;
  const finTipLeY = finRootLeY - finSweep;
  const finTipTeY = finTipLeY - finTipChord;

  return (
    <group>
      {/* Nose cone: cone primitive, tip up */}
      <mesh position={[0, noseTipY - noseLength / 2, 0]} castShadow receiveShadow>
        <coneGeometry args={[R, noseLength, 24]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Body tube */}
      <mesh position={[0, bodyCylinderY, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[R, R, bodyCylinderLength, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Fins: box approximating trapezoid (thickness 2% of chord), extend from body */}
      {Array.from({ length: numFins }).map((_, i) => {
        const angle = (2 * Math.PI * i) / numFins;
        const midChord = (finRootChord + finTipChord) / 2;
        const midY = (finRootLeY + finRootTeY + finTipLeY + finTipTeY) / 4;
        const finThickness = Math.max(bodyDiameter * 0.02, 0.002);
        const radialOffset = R + finSemispan / 2;
        return (
          <mesh
            key={i}
            position={[radialOffset * Math.cos(angle), midY, radialOffset * Math.sin(angle)]}
            rotation={[0, angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[finThickness, midChord, finSemispan]} />
            <meshStandardMaterial color="#808080" metalness={0.2} roughness={0.7} />
          </mesh>
        );
      })}

      {/* CG marker (green sphere) */}
      {cgFromNose != null && cgFromNose >= 0 && (
        <mesh position={[0, noseTipY - cgFromNose, 0]} castShadow>
          <sphereGeometry args={[bodyDiameter * 0.15, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
        </mesh>
      )}

      {/* CP marker (orange sphere) */}
      {cpFromNose != null && cpFromNose >= 0 && (
        <mesh position={[0, noseTipY - cpFromNose, 0]} castShadow>
          <sphereGeometry args={[bodyDiameter * 0.15, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  );
}
