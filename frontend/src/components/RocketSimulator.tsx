'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import type { RocketDesign } from '@/types/rocket';
import type { SimulationState } from '@/types/simulation';

const Scene = dynamic(() => import('./Scene').then((m) => ({ default: m.Scene })), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg flex items-center justify-center text-slate-500">Loading 3D…</div>,
});

const DT = 1 / 60;

/** Linear interpolation between two simulation states for smooth playback (thrust, drag, velocity, etc.). */
function interpolateState(
  a: SimulationState,
  b: SimulationState,
  frac: number
): SimulationState {
  const f = Math.max(0, Math.min(1, frac));
  return {
    ...a,
    time: a.time + f * (b.time - a.time),
    altitude: a.altitude + f * (b.altitude - a.altitude),
    velocity: a.velocity + f * (b.velocity - a.velocity),
    acceleration: a.acceleration + f * (b.acceleration - a.acceleration),
    mass: a.mass + f * (b.mass - a.mass),
    mach: a.mach + f * (b.mach - a.mach),
    cd: a.cd + f * (b.cd - a.cd),
    airDensity: a.airDensity + f * (b.airDensity - a.airDensity),
    thrust: a.thrust + f * (b.thrust - a.thrust),
    drag: a.drag + f * (b.drag - a.drag),
    trail: f < 0.5 ? a.trail : b.trail,
  };
}

interface PreLaunchResult {
  cg: number;
  cp: number;
  stabilityCalibers: number;
  isStable: boolean;
}

const DEFAULT_DESIGN: RocketDesign = {
  geometry: {
    noseLength: 0.1,
    noseShape: 'cone',
    bodyDiameter: 0.04,
    bodyLength: 0.35,
    finRootLeadingEdge: 0.4,
    finRootChord: 0.08,
    finTipChord: 0.04,
    finSemispan: 0.04,
    finSweep: 0.02,
    numFins: 3,
  },
  bodyMass: 0.03,
  finMass: 0.01,
  payloadMass: 0.02,
  payloadPosition: 0.15,
  motorId: 'estes-c6',
  motorPosition: 0.42,
};

const DEFAULT_PRELAUNCH: PreLaunchResult = {
  cg: 0.25,
  cp: 0.3,
  stabilityCalibers: 1.25,
  isStable: true,
};

export function RocketSimulator() {
  const [mounted, setMounted] = useState(false);
  const [design, setDesign] = useState<RocketDesign>(DEFAULT_DESIGN);
  const [preLaunch, setPreLaunch] = useState<PreLaunchResult>(DEFAULT_PRELAUNCH);
  const [preLaunchLoading, setPreLaunchLoading] = useState(false);
  const [simState, setSimState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [telemetryHistory, setTelemetryHistory] = useState<Array<{ time: number; altitude: number; velocity: number }>>([]);
  const [showForces, setShowForces] = useState(true);

  const playbackStatesRef = useRef<SimulationState[]>([]);
  const playbackHistoryRef = useRef<Array<{ time: number; altitude: number; velocity: number }>>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalLength = design.geometry.noseLength + design.geometry.bodyLength;

  const fetchPreLaunch = useCallback(async (d: RocketDesign) => {
    setPreLaunchLoading(true);
    try {
      const res = await fetch('/api/design/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design: d }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreLaunch(data);
      }
    } catch {
      // keep previous preLaunch
    } finally {
      setPreLaunchLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPreLaunch(design), 300);
    return () => clearTimeout(t);
  }, [design, fetchPreLaunch]);

  const handleDesignChange = useCallback((updates: Partial<RocketDesign>) => {
    setDesign((d) => {
      const next = { ...d, ...updates };
      if (updates.geometry) {
        next.geometry = { ...d.geometry, ...updates.geometry };
        const g = next.geometry;
        next.geometry.finRootLeadingEdge = Math.max(
          g.noseLength + 0.01,
          Math.min(g.finRootLeadingEdge, g.noseLength + g.bodyLength - 0.01)
        );
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setSimState(null);
    setTelemetryHistory([]);
    playbackStatesRef.current = [];
    playbackHistoryRef.current = [];
  }, []);

  const handleLaunch = useCallback(async () => {
    setPreLaunchLoading(true);
    try {
      const res = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(err.error || res.statusText);
        setPreLaunchLoading(false);
        return;
      }
      const { states, telemetryHistory: history } = await res.json();
      playbackStatesRef.current = states;
      playbackHistoryRef.current = history;
      setTelemetryHistory(history);
      setSimState(states[0] ?? null);
      startTimeRef.current = performance.now();
      setIsRunning(true);
    } catch (e) {
      console.error(e);
    } finally {
      setPreLaunchLoading(false);
    }
  }, [design]);

  const handlePlayPause = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      if (playbackStatesRef.current.length === 0) handleLaunch();
      else setIsRunning(true);
    }
  }, [isRunning, handleLaunch]);

  useEffect(() => {
    if (!isRunning || playbackStatesRef.current.length === 0) return;
    let rafId: number;
    const tick = (time: number) => {
      rafId = requestAnimationFrame(tick);
      const states = playbackStatesRef.current;
      const history = playbackHistoryRef.current;
      const elapsed = (time - startTimeRef.current) / 1000;
      const simTime = elapsed * simSpeed;
      const indexFloat = simTime / DT;
      const index = Math.min(Math.floor(indexFloat), states.length - 1);
      const state = states[index];
      const nextState = states[index + 1];
      const frac = indexFloat - index;
      const displayState =
        state && nextState && frac > 0 && frac < 1
          ? interpolateState(state, nextState, frac)
          : state;
      if (displayState) {
        setSimState(displayState);
        if (index < history.length) {
          setTelemetryHistory(history.slice(0, index + 1));
        }
      }
      if (index >= states.length - 1 || state?.phase === 'apogee' || state?.phase === 'recovery') {
        setIsRunning(false);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isRunning, simSpeed]);

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100">
      <LeftSidebar
        design={design}
        onDesignChange={handleDesignChange}
        cgFromNose={preLaunch.cg}
        cpFromNose={preLaunch.cp}
        stabilityCalibers={preLaunch.stabilityCalibers}
        isStable={preLaunch.isStable}
        loading={preLaunchLoading}
      />
      <main className="flex-1 flex flex-col min-w-0 p-4">
        <header className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-amber-400">Rocket Launch Simulator</h1>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showForces}
              onChange={(e) => setShowForces(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600"
            />
            Force vectors
          </label>
        </header>
        <div className="flex-1 min-h-0 rounded-lg overflow-hidden">
          {mounted ? (
            <Scene
              geometry={design.geometry}
              totalLength={totalLength}
              cgFromNose={preLaunch.cg}
              cpFromNose={preLaunch.cp}
              simState={simState}
              showForces={showForces}
            />
          ) : (
            <div className="w-full h-full min-h-[400px] bg-slate-900 rounded-lg flex items-center justify-center text-slate-500">
              Loading 3D…
            </div>
          )}
        </div>
      </main>
      <RightSidebar
        simState={simState}
        isRunning={isRunning}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        simSpeed={simSpeed}
        onSimSpeedChange={setSimSpeed}
        telemetryHistory={telemetryHistory}
        launchLoading={preLaunchLoading}
      />
    </div>
  );
}
