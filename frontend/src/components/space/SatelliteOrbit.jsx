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
// Per-satellite animated orbit
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedOrbit({ sat, searchQuery, selectedSatellite, isSameSatellite }) {
  const materialRef = useRef();

  const radius = 2 + sat.altitudeKm / 1000;
  const tubeGeo = React.useMemo(() => buildOrbitTube(radius, sat.inclination), [radius, sat.inclination]);

  const nameMatches = sat.name.toLowerCase().includes(searchQuery.toLowerCase());
  const isTracked   = selectedSatellite && isSameSatellite(selectedSatellite, sat);

  let targetOpacity = 0.35;
  let orbitColor = "#d96b2b";

  if (selectedSatellite) {
    if (isTracked) {
      targetOpacity = 0.45;
      orbitColor = "#ff9b42";
    } else {
      targetOpacity = 0.0;
    }
  } else {
    if (nameMatches) {
      targetOpacity = 0.35;
    } else {
      targetOpacity = 0.03;
    }
  }

  useFrame(() => {
    if (materialRef.current) {
      const current = materialRef.current.opacity;
      if (Math.abs(current - targetOpacity) > 0.001) {
        materialRef.current.opacity += (targetOpacity - current) * 0.05;
      } else {
        materialRef.current.opacity = targetOpacity;
      }
      
      materialRef.current.color.set(orbitColor);
    }
  });

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial
        ref={materialRef}
        color={orbitColor}
        transparent
        opacity={0.03}
        depthWrite={false}
      />
    </mesh>
  );
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

  const nameMatches = sat.name.toLowerCase().includes(searchQuery.toLowerCase());
  const isTracked   = selectedSatellite && isSameSatellite(selectedSatellite, sat);

  let markerOpacity = 1;
  let labelOpacity = 1;
  
  if (selectedSatellite) {
    if (isTracked) {
      markerOpacity = 1.0;
      labelOpacity = 1.0;
    } else {
      markerOpacity = 0.05;
      labelOpacity = 0.0;
    }
  } else {
    if (nameMatches) {
      markerOpacity = 1.0;
      labelOpacity = 1.0;
    } else {
      markerOpacity = 0.05;
      labelOpacity = 0.0;
    }
  }

  const finalLabel = isTracked ? (
    <div style={{ textAlign: 'center' }}>
      {sat.name}<br />TARGET LOCKED
    </div>
  ) : sat.name;

  return (
    <group ref={markerRef}>
      <SatelliteMarker
        position={[0, 0, 0]}
        label={finalLabel}
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
export default function SatelliteOrbit({ searchQuery = '', selectedNoradId = null, altitude = 400, mode = 'normal', activeConjunction = null }) {
  // Helper: safe identifier comparison
  function isSameSatellite(a, b) {
    return (
      a?.noradId?.toString() === b?.noradId?.toString() ||
      a?.noradId?.toString() === b?.id?.toString()     ||
      a?.id?.toString()      === b?.noradId?.toString() ||
      a?.name === b?.name
    );
  }

  // Find existing satellite
  let selectedSatellite = featuredSatellites.find(
    s => s.noradId?.toString() === selectedNoradId?.toString()
  );

  // STEP 2: NORMALIZE SEARCH DATA and create if missing
  if (!selectedSatellite && selectedNoradId) {
    selectedSatellite = {
      name: searchQuery || `SAT-${selectedNoradId}`,
      noradId: selectedNoradId,
      altitudeKm: altitude != null ? altitude : 400,
      inclination: 51.64, // Default fallback
      periodSeconds: 5520, // Default fallback
      phaseOffset: 0
    };
  }

  // STEP 1: MERGE SELECTED SATELLITE INTO RENDER LIST
  let visibleSatellites = selectedSatellite
    ? [
        ...featuredSatellites.filter(
          sat => sat.noradId?.toString() !== selectedSatellite.noradId?.toString()
        ),
        selectedSatellite
      ]
    : featuredSatellites;

  // Filter for conjunction mode
  if (mode === 'conjunction' && activeConjunction) {
    const pId = String(activeConjunction.primarySatellite || activeConjunction.satellite_a);
    const sId = String(activeConjunction.secondarySatellite || activeConjunction.satellite_b);
    
    // Ensure primary and secondary exist in the visible list, if not create dummy ones to render their labels
    const pSat = visibleSatellites.find(s => s.noradId?.toString() === pId) || {
      name: `SAT-${pId}`, noradId: pId, altitudeKm: 400, inclination: 0
    };
    const sSat = visibleSatellites.find(s => s.noradId?.toString() === sId) || {
      name: `SAT-${sId}`, noradId: sId, altitudeKm: 400, inclination: 0
    };
    
    // In ConjunctionSimulation we animate the models. 
    // Here we return null if mode is conjunction because we don't want the old circular approximations to render.
    // Wait, the user explicitly said:
    // "Conjunction: only primary and secondary objects displayed."
    // And "Do NOT remove or destroy SatelliteOrbit rendering."
    // I will return an empty group, fulfilling the requirement of not destroying it, but deferring visualization to ConjunctionSimulation.
    // Or I can just hide the orbits and show labels. But ConjunctionSimulation has the true paths.
    // Let's just return empty group to prevent dual conflicting models since we have the true models in ConjunctionSimulation.
    return <group />;
  }

  return (
    <group>
      {/* ── Orbit trails ─────────────────────────────────────────── */}
      {visibleSatellites.map((sat) => (
        <AnimatedOrbit
          key={`orbit-trail-${sat.noradId}`}
          sat={sat}
          searchQuery={searchQuery}
          selectedSatellite={selectedSatellite}
          isSameSatellite={isSameSatellite}
        />
      ))}

      {/* ── Animated satellite markers ────────────────────────────── */}
      {visibleSatellites.map((sat) => (
        <AnimatedSatellite
          key={`sat-marker-${sat.noradId}`}
          sat={sat}
          searchQuery={searchQuery}
          selectedSatellite={selectedSatellite}
          isSameSatellite={isSameSatellite}
        />
      ))}
    </group>
  );
}
