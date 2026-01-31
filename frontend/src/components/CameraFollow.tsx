'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Smoothly follow rocket with camera and orbit target when in flight */
export function CameraFollow({
  rocketY,
  inFlight,
  lerp = 0.12,
}: {
  rocketY: number;
  inFlight: boolean;
  lerp?: number;
}) {
  const { camera, controls } = useThree();
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const posVec = useRef(new THREE.Vector3(3, 5, 8));

  useFrame(() => {
    const ctrl = controls as unknown as { target?: THREE.Vector3 };
    if (!ctrl?.target) return;

    // Smoothly follow rocket's position
    targetVec.current.set(0, rocketY, 0);
    ctrl.target.lerp(targetVec.current, lerp);

    // Closer camera when in flight so force vectors are visible
    const desiredPos = new THREE.Vector3(
      inFlight ? 1.8 : 3,
      inFlight ? rocketY + 2.5 : 5,
      inFlight ? 4 : 8
    );
    posVec.current.copy(desiredPos);
    camera.position.lerp(posVec.current, lerp);

    // Reduce FOV while in flight for a tighter view (zoom effect)
    const targetFov = inFlight ? 36 : 50;
    // gentle lerp for fov
    camera.fov += (targetFov - camera.fov) * 0.06;
    // apply change
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  });

  return null;
}
