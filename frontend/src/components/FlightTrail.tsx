'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Flight path trail. Points in (x, y, z) with y = altitude.
 * Colored by Mach number or altitude (gradient).
 */

export interface TrailPoint {
  altitude: number;
  velocity: number;
  mach: number;
  time: number;
}

export interface FlightTrailProps {
  points: TrailPoint[];
  /** Scale factor for scene (e.g. 1 = 1m) */
  scale?: number;
  /** Max Mach for color scale */
  maxMach?: number;
}

export function FlightTrail({ points, scale = 1, maxMach = 2 }: FlightTrailProps) {
  const { geometry } = useMemo(() => {
    if (points.length < 2) {
      return { geometry: null };
    }
    const positions = new Float32Array(points.length * 3);
    const colorArray = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      positions[i * 3] = 0;
      positions[i * 3 + 1] = p.altitude * scale;
      positions[i * 3 + 2] = 0;
      const t = Math.min(1, p.mach / maxMach);
      // Color: blue (subsonic) -> red (supersonic)
      colorArray[i * 3] = t;
      colorArray[i * 3 + 1] = 1 - t;
      colorArray[i * 3 + 2] = 0.5;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geom.setDrawRange(0, points.length);
    return { geometry: geom };
  }, [points, scale, maxMach]);

  if (!geometry || points.length < 2) return null;

  return (
    <line>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial vertexColors />
    </line>
  );
}
