'use client';

import type { RocketDesign } from '@/types/rocket';
import type { RocketGeometry, NoseShape } from '@/types/rocket';
import { MOTORS } from '@/lib/motors';
import { TermTooltip } from './TermTooltip';

export interface LeftSidebarProps {
  design: RocketDesign;
  onDesignChange: (updates: Partial<RocketDesign>) => void;
  /** Pre-launch results */
  cgFromNose: number;
  cpFromNose: number;
  stabilityCalibers: number;
  isStable: boolean;
  /** Loading analysis from API */
  loading?: boolean;
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span>{value.toFixed(3)} {unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none bg-slate-600 accent-amber-500"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-300">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full px-2 py-1.5 rounded bg-slate-700 text-slate-100 text-sm border border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
      />
      <span className="text-xs text-slate-500">{unit}</span>
    </div>
  );
}

export function LeftSidebar({
  design,
  onDesignChange,
  cgFromNose,
  cpFromNose,
  stabilityCalibers,
  isStable,
  loading = false,
}: LeftSidebarProps) {
  const g = design.geometry;

  const updateGeometry = (updates: Partial<RocketGeometry>) => {
    onDesignChange({ geometry: { ...g, ...updates } });
  };

  return (
    <aside className="w-72 flex-shrink-0 bg-slate-800/95 border-r border-slate-700 overflow-y-auto">
      <div className="p-4 space-y-6">
        <h2 className="text-lg font-semibold text-amber-400 border-b border-slate-600 pb-2">
          Rocket Design
        </h2>

        {/* Nose cone */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            <TermTooltip term="Nose cone" definition="Front of the rocket. Shape and length affect drag and CP. Cone and ogive are common; Barrowman CP uses different XN for each (cone: 0.666×L, ogive: 0.466×L).">Nose Cone</TermTooltip>
          </h3>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Shape</label>
            <select
              value={g.noseShape}
              onChange={(e) => updateGeometry({ noseShape: e.target.value as NoseShape })}
              className="w-full px-2 py-1.5 rounded bg-slate-700 text-slate-100 text-sm border border-slate-600"
            >
              <option value="cone">Cone</option>
              <option value="ogive">Ogive</option>
            </select>
          </div>
          <Slider
            label="Length"
            value={g.noseLength}
            min={0.02}
            max={0.5}
            step={0.01}
            unit="m"
            onChange={(v) => updateGeometry({ noseLength: v })}
          />
        </section>

        {/* Body */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            <TermTooltip term="Body tube" definition="Main cylindrical section. Diameter sets reference area for drag and stability (caliber). Length and mass affect CG.">Body Tube</TermTooltip>
          </h3>
          <NumberInput
            label="Mass"
            value={design.bodyMass}
            min={0.01}
            max={0.5}
            step={0.01}
            unit="kg"
            onChange={(v) => onDesignChange({ bodyMass: v })}
          />
          <Slider
            label="Diameter"
            value={g.bodyDiameter}
            min={0.02}
            max={0.15}
            step={0.005}
            unit="m"
            onChange={(v) => updateGeometry({ bodyDiameter: v })}
          />
          <Slider
            label="Length"
            value={g.bodyLength}
            min={0.1}
            max={1.5}
            step={0.05}
            unit="m"
            onChange={(v) => updateGeometry({ bodyLength: v })}
          />
        </section>

        {/* Fins */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            <TermTooltip term="Fins" definition="Stabilizing surfaces at the aft end. Root chord, tip chord, semispan, and sweep define the planform. Barrowman equations use these to compute the fin CP contribution.">Fins</TermTooltip>
          </h3>
          <Slider
            label="Position from nose (root LE)"
            value={g.finRootLeadingEdge}
            min={g.noseLength + 0.01}
            max={g.noseLength + g.bodyLength - 0.01}
            step={0.01}
            unit="m"
            onChange={(v) => updateGeometry({ finRootLeadingEdge: v })}
          />
          <Slider
            label="Root chord"
            value={g.finRootChord}
            min={0.02}
            max={0.2}
            step={0.01}
            unit="m"
            onChange={(v) => updateGeometry({ finRootChord: v })}
          />
          <Slider
            label="Tip chord"
            value={g.finTipChord}
            min={0}
            max={0.15}
            step={0.01}
            unit="m"
            onChange={(v) => updateGeometry({ finTipChord: v })}
          />
          <Slider
            label="Semispan"
            value={g.finSemispan}
            min={0.02}
            max={0.15}
            step={0.005}
            unit="m"
            onChange={(v) => updateGeometry({ finSemispan: v })}
          />
          <Slider
            label="Sweep"
            value={g.finSweep}
            min={0}
            max={0.15}
            step={0.005}
            unit="m"
            onChange={(v) => updateGeometry({ finSweep: v })}
          />
          <NumberInput
            label="Fins mass"
            value={design.finMass}
            min={0.001}
            max={0.1}
            step={0.005}
            unit="kg"
            onChange={(v) => onDesignChange({ finMass: v })}
          />
        </section>

        {/* Payload */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            <TermTooltip term="Payload" definition="Extra mass (e.g. altimeter, camera). Position from nose strongly affects CG; moving it forward improves stability.">Payload</TermTooltip>
          </h3>
          <NumberInput
            label="Mass"
            value={design.payloadMass}
            min={0}
            max={2}
            step={0.01}
            unit="kg"
            onChange={(v) => onDesignChange({ payloadMass: v })}
          />
          <Slider
            label="Position from nose"
            value={design.payloadPosition}
            min={0}
            max={g.noseLength + g.bodyLength}
            step={0.01}
            unit="m"
            onChange={(v) => onDesignChange({ payloadPosition: v })}
          />
        </section>

        {/* Motor */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            <TermTooltip term="Motor" definition="Solid rocket motor. Thrust curve and burn time determine acceleration; propellant mass decreases during burn. Position affects CG.">Motor</TermTooltip>
          </h3>
          <select
            value={design.motorId}
            onChange={(e) => onDesignChange({ motorId: e.target.value })}
            className="w-full px-2 py-1.5 rounded bg-slate-700 text-slate-100 text-sm border border-slate-600"
          >
            {MOTORS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <Slider
            label="Motor position from nose"
            value={design.motorPosition}
            min={g.noseLength}
            max={g.noseLength + g.bodyLength}
            step={0.01}
            unit="m"
            onChange={(v) => onDesignChange({ motorPosition: v })}
          />
        </section>

        {/* Pre-launch results */}
        <section className="pt-4 border-t border-slate-600 space-y-3">
          <h3 className="text-sm font-medium text-slate-400">
            Pre-launch Analysis {loading && <span className="text-amber-500">(updating…)</span>}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-slate-500">
              <TermTooltip
                term="CG (Center of Gravity)"
                definition="The point where the rocket’s mass is balanced. All weight acts through this point. For stable flight, CG must be ahead of the Center of Pressure."
                detail="CG = Σ(mᵢ × xᵢ) / total mass"
              >
                CG (from nose):
              </TermTooltip>
            </span>
            <span className="text-slate-200">{cgFromNose.toFixed(3)} m</span>
            <span className="text-slate-500">
              <TermTooltip
                term="CP (Center of Pressure)"
                definition="The point where aerodynamic forces (from fins and nose) effectively act. Calculated using Barrowman equations for subsonic flight. Must be behind CG for the rocket to weathercock into the wind."
                detail="Barrowman: nose + fin contributions"
              >
                CP (from nose):
              </TermTooltip>
            </span>
            <span className="text-slate-200">{cpFromNose.toFixed(3)} m</span>
            <span className="text-slate-500">
              <TermTooltip
                term="Stability margin (calibers)"
                definition="How many body diameters the CP is behind the CG. One caliber (1 cal) = one body diameter. Aim for 1–2 cal for stable flight; less than 1 cal can be unstable."
                detail="margin = (CP − CG) / diameter"
              >
                Stability margin:
              </TermTooltip>
            </span>
            <span className="text-slate-200">{stabilityCalibers.toFixed(2)} cal</span>
          </div>
          <div
            className={`rounded px-3 py-2 text-sm font-medium ${
              isStable ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'
            }`}
          >
            <TermTooltip
              term={isStable ? 'Stable' : 'Unstable'}
              definition={isStable
                ? 'CP is behind CG by at least one caliber. The rocket will tend to point into the wind (weathercock stability).'
                : 'CP is ahead of or too close to CG. The rocket may tumble. Move mass forward (e.g. payload) or move CP aft (e.g. larger fins).'}
            >
              {isStable ? 'Stable (1–2 cal recommended)' : 'Unstable — move CG forward or CP aft'}
            </TermTooltip>
          </div>
        </section>
      </div>
    </aside>
  );
}
