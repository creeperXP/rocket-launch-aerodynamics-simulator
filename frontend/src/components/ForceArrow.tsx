'use client';

import * as THREE from 'three';

/**
 * Simple arrow for force vector. Direction is +Y (up) in local space.
 * Scale by magnitude (length in meters).
 */

const ARROW_HEAD_LENGTH = 0.15;
const ARROW_HEAD_RADIUS = 0.08;
const SHAFT_RADIUS = 0.03;

export interface ForceArrowProps {
  /** Length (magnitude) in meters */
  length: number;
  /** Base color (e.g. red for thrust, blue for drag, green for gravity) */
  color: string;
  position: [number, number, number];
  /** Rotate so arrow points in direction (default +Y) - pass direction vector */
  direction?: [number, number, number];
}

export function ForceArrow({ length, color, position, direction }: ForceArrowProps) {
  if (length <= 0) return null;

  const shaftLength = Math.max(0, length - ARROW_HEAD_LENGTH);
  const dir = direction ?? [0, 1, 0];
  const quat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(...dir).normalize()
  );
  const euler = new THREE.Euler().setFromQuaternion(quat);

  return (
    <group position={position} rotation={[euler.x, euler.y, euler.z]}>
      <mesh position={[0, shaftLength / 2, 0]}>
        <cylinderGeometry args={[SHAFT_RADIUS, SHAFT_RADIUS, shaftLength, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, shaftLength + ARROW_HEAD_LENGTH / 2, 0]}>
        <coneGeometry args={[ARROW_HEAD_RADIUS, ARROW_HEAD_LENGTH, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}
