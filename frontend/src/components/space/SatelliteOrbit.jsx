import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { featuredSatellites } from '../../data/featuredSatellites';
import SatelliteMarker from '../SatelliteMarker';

/**
 * SatelliteOrbit renders satellite markers and their orbit paths.
 * Each satellite moves according to its orbital period, inclination, and a unique phase offset.
 * The animation uses the same mission‑time acceleration as the Earth model (SIMULATION_SPEED)
 * so that speeds stay proportional.
 */
export default function SatelliteOrbit() {
  const groupRef = useRef();
  const startTimeRef = useRef(Date.now());

  // 1 real second = 5 simulated minutes (300 seconds)
  const SIMULATION_SPEED = 300;

  useFrame(() => {
    const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
    const missionSec = elapsedSec * SIMULATION_SPEED; // accelerated mission time
    if (!groupRef.current) return;

    featuredSatellites.forEach((sat, idx) => {
      const periodSec = sat.periodMinutes * 60;
      const phaseRad = THREE.MathUtils.degToRad(sat.phaseOffset ?? 0);
      const inclRad = THREE.MathUtils.degToRad(sat.inclination);

      // Angle = mission time * angular speed + phase offset
      const angle = missionSec * (2 * Math.PI / periodSec) + phaseRad;

      const radius = 2 + sat.altitudeKm / 1000; // simple scaling relative to Earth radius
      const x0 = radius * Math.cos(angle);
      const z0 = radius * Math.sin(angle);
      // Apply inclination (rotate around X axis)
      const pos = new THREE.Vector3(x0, 0, z0).applyAxisAngle(
        new THREE.Vector3(1, 0, 0),
        inclRad
      );

      // Marker is the child after all orbit meshes (offset by number of satellites)
      const marker = groupRef.current.children[idx + featuredSatellites.length];
      if (marker && marker.position) {
        marker.position.set(pos.x, pos.y, pos.z);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Orbit path circles – each inclined according to satellite inclination */}
      {featuredSatellites.map((sat) => {
        const radius = 2 + sat.altitudeKm / 1000;
        const inclRad = THREE.MathUtils.degToRad(sat.inclination);
        return (
          <mesh
            key={`orbit-${sat.noradId}`}
            rotation-x={-Math.PI / 2}
            rotation-y={inclRad}
          >
            <ringGeometry args={[radius, radius + 0.01, 64]} />
            <meshBasicMaterial color="#00eaff" transparent opacity={0.25} />
          </mesh>
        );
      })}

      {/* Satellite markers – positions updated each frame */}
      {featuredSatellites.map((sat) => (
        <SatelliteMarker
          key={sat.noradId}
          position={[0, 0, 0]}
          label={sat.name}
          noradId={sat.noradId}
        />
      ))}
    </group>
  );
}
