'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RocketModel } from './RocketModel';
import { FlightTrail } from './FlightTrail';
import { ForceArrow } from './ForceArrow';
import { CameraFollow } from './CameraFollow';
import type { RocketGeometry } from '@/types/rocket';
import type { SimulationState } from '@/types/simulation';

const SCALE = 1; // 1 unit = 1 m

export interface SceneProps {
  /** Rocket geometry for 3D model */
  geometry: RocketGeometry;
  /** Total length (nose + body) for positioning */
  totalLength: number;
  /** Pre-launch: show CG/CP */
  cgFromNose?: number;
  cpFromNose?: number;
  /** Flight: current sim state */
  simState?: SimulationState | null;
  /** Show force arrows (thrust, drag, gravity) */
  showForces?: boolean;
}

function SceneContent({
  geometry,
  totalLength,
  cgFromNose,
  cpFromNose,
  simState,
  showForces,
}: SceneProps) {
  const inFlight = simState && simState.phase !== 'pre' && simState.phase !== 'apogee' && simState.trail.length > 0;
  const rocketY = inFlight ? simState!.altitude * SCALE : 0;
  const trailPoints = simState?.trail ?? [];

  // Arrow lengths relative to largest force so all three stay visible and show correct behavior:
  // thrust high then → 0, drag 0 → Max-Q → 0, weight constant. Base length ~ rocket size.
  const weightForce = simState ? 9.81 * simState.mass : 0;
  const thrustForce = simState ? Math.abs(simState.thrust) : 0;
  const dragForce = simState ? Math.abs(simState.drag) : 0;
  const refForce = Math.max(thrustForce, dragForce, weightForce, 0.1);
  const baseLength = totalLength * 0.9; // arrows on order of rocket length
  const thrustLen = (thrustForce / refForce) * baseLength;
  const dragLen = (dragForce / refForce) * baseLength;
  const gravityLen = (weightForce / refForce) * baseLength;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <OrbitControls
        makeDefault
        minDistance={0.5}
        maxDistance={500}
        enablePan
        target={[0, rocketY, 0]}
      />
      <CameraFollow rocketY={rocketY} inFlight={!!inFlight} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2d5016" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Launch pad (small platform) */}
      <mesh position={[0, 0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.04, 24]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Flight trail */}
      {trailPoints.length >= 2 && (
        <FlightTrail points={trailPoints} scale={SCALE} maxMach={2} />
      )}

      {/* Rocket */}
      <group position={[0, rocketY, 0]}>
        <RocketModel
          noseLength={geometry.noseLength}
          bodyDiameter={geometry.bodyDiameter}
          bodyLength={geometry.bodyLength}
          finRootChord={geometry.finRootChord}
          finTipChord={geometry.finTipChord}
          finSemispan={geometry.finSemispan}
          finSweep={geometry.finSweep}
          numFins={geometry.numFins}
          finRootLeadingEdge={geometry.finRootLeadingEdge}
          totalLength={totalLength}
          cgFromNose={inFlight ? undefined : cgFromNose}
          cpFromNose={inFlight ? undefined : cpFromNose}
        />

        {/* Force arrows (at rocket base, pointing in force direction) */}
        {showForces && simState && (
          <>
            <ForceArrow
              length={thrustLen}
              color="#ef4444"
              position={[0, 0, 0]}
              direction={[0, 1, 0]}
            />
            <ForceArrow
              length={dragLen}
              color="#3b82f6"
              position={[0, 0.1, 0]}
              direction={[0, simState.velocity >= 0 ? -1 : 1, 0]}
            />
            <ForceArrow
              length={gravityLen}
              color="#22c55e"
              position={[0.15, 0, 0]}
              direction={[0, -1, 0]}
            />
          </>
        )}
      </group>
    </>
  );
}

export function Scene(props: SceneProps) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-900 rounded-lg overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [3, 5, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        <SceneContent {...props} />
      </Canvas>

      {/* Legend overlay: visible when showing forces in flight */}
      {props.showForces && props.simState && props.simState.phase !== 'pre' && props.simState.trail.length > 0 && (
        <div className="absolute top-3 right-3 z-50">
          <div className="bg-slate-800/90 text-sm text-slate-100 rounded p-2 border border-slate-700 shadow-md max-w-[200px]">
            <div className="font-semibold text-xs text-amber-400 mb-1">Forces</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 inline-block rounded-sm shrink-0" style={{ background: '#ef4444' }} />
              <span>Thrust: high/rising as pressure drops</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 inline-block rounded-sm shrink-0" style={{ background: '#3b82f6' }} />
              <span>Drag: 0 → Max-Q peak → 0</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 inline-block rounded-sm shrink-0" style={{ background: '#22c55e' }} />
              <span>Weight: constant down</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 border-t border-slate-600 pt-1">
              Climb: thrust &gt; weight + drag
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
