import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Helper: convert lat/lon/alt → Vector3 (km altitude scaled)
const latLonAltToVector3 = (latitude, longitude, altitude) => {
  const earthRadius = 2; // matches sphere radius
  const r = earthRadius + (altitude != null ? altitude / 1000 : 0);
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.cos(phi);
  const z = r * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

// Earth – realistic texture, standard material
function Earth() {
  const ref = useRef();
  const [dayMap, setDayMap] = React.useState(null);
  // Load texture safely
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/textures/earth_daymap.jpg',
      (texture) => setDayMap(texture),
      undefined,
      () => setDayMap(null) // onError keep null
    );
  }, []);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001; // slow rotation
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 64, 64]} />
      {dayMap ? (
        <meshStandardMaterial map={dayMap} roughness={0.7} metalness={0.2} color="#1e90ff" />
      ) : (
        <meshStandardMaterial color="#1e90ff" roughness={0.7} metalness={0.2} />
      )}
    </mesh>
  );
}

// Cloud layer – slightly larger, semi‑transparent
function Clouds() {
  const ref = useRef();
  const [cloudMap, setCloudMap] = React.useState(null);
  // Load cloud texture safely
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/textures/earth_clouds.jpg',
      (texture) => setCloudMap(texture),
      undefined,
      () => setCloudMap(null)
    );
  }, []);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0015;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.05, 64, 64]} />
      {cloudMap ? (
        <meshStandardMaterial map={cloudMap} transparent opacity={0.4} depthWrite={false} />
      ) : (
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
      )}
    </mesh>
  );
}

// Atmospheric glow – larger, subtle
function Atmosphere() {
  return (
    <mesh>
      <sphereGeometry args={[2.2, 64, 64]} />
      <meshBasicMaterial color="#66ccff" transparent opacity={0.2} side={THREE.BackSide} />
    </mesh>
  );
}

// Orbit ring – equatorial reference ring
function OrbitRing() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.5, 0.04, 8, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  );
}

// OrbitTrail – renders the predicted orbit path as a glowing polyline
function OrbitTrail({ positions }) {
  // All geometry computed in one useMemo – no hooks after any return
  const { coreGeo, glowGeo } = useMemo(() => {
    if (!positions || positions.length < 2) return { coreGeo: null, glowGeo: null };

    const coords = positions.map(({ latitude, longitude, altitude }) =>
      latLonAltToVector3(latitude, longitude, altitude)
    );

    const flat = new Float32Array(coords.length * 3);
    coords.forEach((v, i) => {
      flat[i * 3]     = v.x;
      flat[i * 3 + 1] = v.y;
      flat[i * 3 + 2] = v.z;
    });

    const core = new THREE.BufferGeometry();
    core.setAttribute('position', new THREE.BufferAttribute(flat, 3));

    // Glow uses a separate geometry instance (same data)
    const flatGlow = new Float32Array(flat);
    const glow = new THREE.BufferGeometry();
    glow.setAttribute('position', new THREE.BufferAttribute(flatGlow, 3));

    return { coreGeo: core, glowGeo: glow };
  }, [positions]);

  if (!coreGeo) return null;

  return (
    <group>
      {/* Outer glow – low opacity halo */}
      <line geometry={glowGeo}>
        <lineBasicMaterial
          color="#00eaff"
          transparent
          opacity={0.18}
          linewidth={1}
          depthWrite={false}
        />
      </line>
      {/* Core trail – bright cyan line */}
      <line geometry={coreGeo}>
        <lineBasicMaterial
          color="#00eaff"
          transparent
          opacity={0.85}
          linewidth={1}
          depthWrite={false}
        />
      </line>
      {/* Vertex dots at each predicted position */}
      <points geometry={coreGeo}>
        <pointsMaterial
          color="#00eaff"
          size={0.025}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// Satellite – larger, metallic body with solar panels, always faces camera
function SatelliteModel({ position }) {
  const groupRef = useRef();
  const { camera } = useThree();
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });
  const defaultPos = useMemo(() => new THREE.Vector3(0, 2.5, 0), []);
  const pos = position ?? defaultPos;
  return (
    <group ref={groupRef} position={pos}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.4]} />
        <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
      </mesh>
      {/* Left solar panel */}
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#222" metalness={1} roughness={0.3} />
      </mesh>
      {/* Right solar panel */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.4, 0.1]} />
        <meshStandardMaterial color="#222" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function EarthViewer({ latitude, longitude, altitude, orbitPath }) {
  const satellitePos = useMemo(() => {
    if (latitude != null && longitude != null && altitude != null) {
      return latLonAltToVector3(latitude, longitude, altitude);
    }
    return null;
  }, [latitude, longitude, altitude]);

  // Only show trail when we have real data (>= 2 points)
  const hasTrail = Array.isArray(orbitPath) && orbitPath.length >= 2;

  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      {/* Empty state overlay when no satellite tracking data */}
      {latitude == null && longitude == null && altitude == null && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          textAlign: 'center',
          padding: '1rem',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          <h3 style={{ margin: 0, color: '#fff' }}>Tracking System Idle</h3>
          <p style={{ margin: '0.5rem 0 0' }}>Search and track a satellite to initialize live orbital visualization.</p>
        </div>
      )}
      <Canvas camera={{ position: [0, 0, 6] }} style={{ background: '#000' }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        {/* Scene objects */}
        <Earth />
        <Clouds />
        <Atmosphere />
        <OrbitRing />
        {/* Predicted orbit trail – only rendered after a satellite is selected */}
        {hasTrail && <OrbitTrail positions={orbitPath} />}
        <SatelliteModel position={satellitePos} />
        {/* Controls and background */}
        <OrbitControls enableZoom />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} />
      </Canvas>
    </div>
  );
}
