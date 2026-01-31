'use client';

import type { SimulationState } from '@/types/simulation';
import { TelemetryCharts } from './TelemetryCharts';
import { TermTooltip } from './TermTooltip';

export interface RightSidebarProps {
  /** Simulation state (null = not run yet) */
  simState: SimulationState | null;
  /** Play/pause/reset */
  isRunning: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  /** Simulation speed multiplier */
  simSpeed: number;
  onSimSpeedChange: (v: number) => void;
  /** Telemetry history for charts */
  telemetryHistory: Array<{ time: number; altitude: number; velocity: number }>;
  /** Launch request in progress */
  launchLoading?: boolean;
}

export function RightSidebar({
  simState,
  isRunning,
  onPlayPause,
  onReset,
  simSpeed,
  onSimSpeedChange,
  telemetryHistory,
  launchLoading = false,
}: RightSidebarProps) {
  return (
    <aside className="w-80 flex-shrink-0 bg-slate-800/95 border-l border-slate-700 overflow-y-auto flex flex-col">
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-2">
          Simulation
        </h2>

        {/* Controls */}
        <section className="flex flex-wrap gap-2">
          <button
            onClick={onPlayPause}
            disabled={launchLoading}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-medium text-sm"
          >
            {launchLoading ? 'Running…' : isRunning ? 'Pause' : 'Launch'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 text-sm"
          >
            Reset
          </button>
        </section>

        <div className="space-y-1">
          <label className="flex justify-between text-sm text-slate-300">
            <span>
              <TermTooltip term="Sim speed" definition="Time multiplier for the simulation. 1× is real-time; higher values run the flight faster for quicker testing.">Sim speed</TermTooltip>
            </span>
            <span>{simSpeed.toFixed(1)}×</span>
          </label>
          <input
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={simSpeed}
            onChange={(e) => onSimSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-slate-600 accent-amber-500"
          />
        </div>

        {/* Real-time telemetry */}
        <section className="pt-2 border-t border-slate-600">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Telemetry</h3>
          {simState ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-mono">
              <span className="text-slate-500"><TermTooltip term="Phase" definition="Current flight phase: pre (before launch), burn (motor firing), coast (after burnout), apogee (peak altitude), recovery (parachute).">Phase</TermTooltip></span>
              <span className="text-slate-200">{simState.phase}</span>
              <span className="text-slate-500"><TermTooltip term="Time" definition="Elapsed simulation time in seconds since ignition.">Time</TermTooltip></span>
              <span className="text-slate-200">{simState.time.toFixed(2)} s</span>
              <span className="text-slate-500"><TermTooltip term="Altitude" definition="Height above the launch pad in meters. Uses 1D vertical integration.">Altitude</TermTooltip></span>
              <span className="text-slate-200">{simState.altitude.toFixed(1)} m</span>
              <span className="text-slate-500"><TermTooltip term="Velocity" definition="Vertical speed in m/s. Positive = upward. Used with air density and Cd for drag force.">Velocity</TermTooltip></span>
              <span className="text-slate-200">{simState.velocity.toFixed(1)} m/s</span>
              <span className="text-slate-500"><TermTooltip term="Acceleration" definition="Net acceleration (thrust − drag − gravity) / mass, in m/s².">Accel</TermTooltip></span>
              <span className="text-slate-200">{simState.acceleration.toFixed(1)} m/s²</span>
              <span className="text-slate-500"><TermTooltip term="Mach number" definition="Velocity divided by local speed of sound. Below 1 = subsonic, near 1 = transonic (drag spike), above 1 = supersonic. Affects drag coefficient Cd." detail="Mach = v / a(T)">Mach</TermTooltip></span>
              <span className="text-slate-200">{simState.mach.toFixed(3)}</span>
              <span className="text-slate-500"><TermTooltip term="Cd (drag coefficient)" definition="Drag coefficient; depends on Mach. Subsonic ~0.35, transonic spike, supersonic ~0.6. Drag = ½ρv²CdA.">Cd</TermTooltip></span>
              <span className="text-slate-200">{simState.cd.toFixed(3)}</span>
              <span className="text-slate-500"><TermTooltip term="ρ (air density)" definition="Atmospheric density in kg/m³. Decreases with altitude: ρ = ρ₀ exp(−h/7400). Affects drag and speed of sound.">ρ</TermTooltip></span>
              <span className="text-slate-200">{simState.airDensity.toFixed(4)} kg/m³</span>
              <span className="text-slate-500"><TermTooltip term="Apogee" definition="Peak altitude reached when velocity crosses from positive to negative. Parachute deploys at apogee in the sim.">Apogee</TermTooltip></span>
              <span className="text-slate-200">{simState.apogee > 0 ? `${simState.apogee.toFixed(1)} m` : '—'}</span>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Run simulation to see telemetry.</p>
          )}
        </section>

        {/* Charts */}
        <section className="pt-2 border-t border-slate-600 flex-1 min-h-[200px]">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Altitude & Velocity</h3>
          <TelemetryCharts data={telemetryHistory} />
        </section>
      </div>
    </aside>
  );
}
