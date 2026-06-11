import React, { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Earth model component – realistic textured sphere with clouds and atmospheric glow
export default function EarthModel() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const earthGroup = useRef();
  const dayTexture = useLoader(THREE.TextureLoader, '/textures/earth_daymap.jpg');
  const cloudTexture = useLoader(THREE.TextureLoader, '/textures/earth_clouds.jpg');
  // Ensure correct color space for sRGB textures
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.colorSpace = THREE.SRGBColorSpace;

const EARTH_ROTATION_RATE = 7.2921159e-5; // radians per second (sidereal)
const SIMULATION_SPEED = 300; // 1 real second = 5 simulated minutes

// DebrisNet uses accelerated mission time. Orbital physics remain proportional while allowing human‑visible visualization.
// Rotate Earth – accelerated real‑time rotation
useFrame((_, delta) => {
  if (earthGroup.current) earthGroup.current.rotation.y += delta * EARTH_ROTATION_RATE * SIMULATION_SPEED;
  if (cloudsRef.current) cloudsRef.current.rotation.y += delta * EARTH_ROTATION_RATE * SIMULATION_SPEED * 0.02;
});

  return (
    <>
      <group ref={earthGroup}>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={dayTexture} />
      </mesh>

      {/* Cloud layer – slightly larger, semi‑transparent */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshStandardMaterial map={cloudTexture} transparent opacity={0.4} depthWrite={false} />
      </mesh>

      {/* Atmospheric glow – subtle outer shell */}
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial color="#66ccff" transparent opacity={0.2} side={THREE.BackSide} />
      </mesh>
    </group>
    </>
  );
}
