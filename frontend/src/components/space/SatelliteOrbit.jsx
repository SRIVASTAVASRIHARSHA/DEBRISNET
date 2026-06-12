import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { featuredSatellites } from '../../data/featuredSatellites';
import SatelliteMarker from '../SatelliteMarker';

// ─────────────────────────────────────────────────────────────────────────────
// MISSION TIME SCALE
// 1 real second = 300 simulated seconds  (matches Earth sidereal rotation)
// ─────────────────────────────────────────────────────────────────────────────
const MISSION_TIME_SCALE = 300;



// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL ORBIT POSITION FUNCTION
// Both the orbit trail AND the satellite marker use this exact function.
// angle       – current orbital angle in radians
// radius      – orbital radius in scene units
// inclination – orbital inclination in DEGREES
// Returns a THREE.Vector3 on the inclined circular orbit.
// ─────────────────────────────────────────────────────────────────────────────
function calculateOrbitPosition(angle, radius, inclination) {
  const incRad = THREE.MathUtils.degToRad(inclination);

  // Flat orbit in XZ plane, then tilt around X-axis by inclination
  const x = radius * Math.cos(angle);
  const z = radius * Math.sin(angle);

  // Applying inclination by tilting: y rises/falls as satellite moves around
  const y = z * Math.sin(incRad);
  const zFinal = z * Math.cos(incRad);

  return new THREE.Vector3(x, y, zFinal);
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a closed TubeGeometry for the orbit trail of one satellite.
// Uses the same calculateOrbitPosition so it matches the marker exactly.
// ─────────────────────────────────────────────────────────────────────────────
function buildOrbitTube(radius, inclination) {
  const segments = 128;
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(calculateOrbitPosition(angle, radius, inclination));
  }
  const curve = new THREE.CatmullRomCurve3(points, true); // closed
  return new THREE.TubeGeometry(curve, 128, 0.008, 8, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-satellite animated marker
// Holds its own angle ref so delta-based update is accurate.
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedSatellite({ sat, searchQuery, selectedSatellite, isSameSatellite }) {
  const markerRef = useRef();
  const angle = useRef(THREE.MathUtils.degToRad(sat.phaseOffset ?? 0));

  const orbitalPeriod = sat.periodSeconds || (sat.periodMinutes ? sat.periodMinutes * 60 : 6000);
  const angularVelocity = (2 * Math.PI) / orbitalPeriod;
  const radius = 2 + sat.altitudeKm / 1000;

  useFrame((state, delta) => {
    angle.current += angularVelocity * delta * MISSION_TIME_SCALE;

    const pos = calculateOrbitPosition(angle.current, radius, sat.inclination);

    if (markerRef.current) {
      markerRef.current.position.set(pos.x, pos.y, pos.z);
    }
  });

  const nameMatches = !searchQuery || sat.name.toLowerCase().startsWith(searchQuery.toLowerCase());
  const isTracked   = selectedSatellite && isSameSatellite(selectedSatellite, sat);

  const markerOpacity = selectedSatellite ? (isTracked ? 1 : 0)    : (nameMatches ? 1    : 0.05);
  const labelOpacity  = selectedSatellite ? (isTracked ? 1 : 0)    : (nameMatches ? 1    : 0);

  return (
    <group ref={markerRef}>
      <SatelliteMarker
        position={[0, 0, 0]}
        label={sat.name}
        noradId={sat.noradId}
        opacity={markerOpacity}
        labelOpacity={labelOpacity}
        isTracked={isTracked}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SatelliteOrbit({ searchQuery = '', selectedNoradId = null }) {
  // Helper: safe identifier comparison
  function isSameSatellite(a, b) {
    return (
      a?.noradId?.toString() === b?.noradId?.toString() ||
      a?.noradId?.toString() === b?.id?.toString()     ||
      a?.id?.toString()      === b?.noradId?.toString() ||
      a?.name === b?.name
    );
  }

  const selectedSatellite = selectedNoradId ? { noradId: selectedNoradId } : null;

  return (
    <group>
      {/* ── Orbit trails ─────────────────────────────────────────── */}
      {featuredSatellites.map((sat) => {
        if (selectedSatellite && !isSameSatellite(selectedSatellite, sat)) return null;

        const radius      = 2 + sat.altitudeKm / 1000;
        const tubeGeo     = buildOrbitTube(radius, sat.inclination);
        const nameMatches = !searchQuery || sat.name.toLowerCase().startsWith(searchQuery.toLowerCase());
        const isTracked   = selectedSatellite && isSameSatellite(selectedSatellite, sat);
        const opacity     = selectedSatellite
          ? (isTracked ? 0.35 : 0)
          : (nameMatches ? 0.22 : 0.05);

        return (
          <mesh key={`orbit-trail-${sat.noradId}`} geometry={tubeGeo}>
            <meshBasicMaterial
              color="#d96b2b"
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* ── Animated satellite markers ────────────────────────────── */}
      {featuredSatellites.map((sat) => {
        if (selectedSatellite && !isSameSatellite(selectedSatellite, sat)) return null;

        return (
          <AnimatedSatellite
            key={`sat-marker-${sat.noradId}`}
            sat={sat}
            searchQuery={searchQuery}
            selectedSatellite={selectedSatellite}
            isSameSatellite={isSameSatellite}
          />
        );
      })}
    </group>
  );
}
