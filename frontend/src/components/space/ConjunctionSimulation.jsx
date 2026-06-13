import React, { useMemo, useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { formatUTC } from "../../utils/timeFormatter";


// Scaling factor to convert kilometers (ECEF) to scene units (Earth radius ~2)
const EARTH_SCALE_FACTOR = 2 / 6378.0; // approx 0.0003135

const MISSION_TIME_SCALE = 300;
export default function ConjunctionSimulation({ activeConjunction, primaryId, secondaryId }) {

  // Using primaryId and secondaryId passed as props from ConjunctionPanel.
  // Debug logging (can be removed later)
  useEffect(() => {
    console.log('Conjunction data received:', activeConjunction);
  }, [activeConjunction]);
  const { camera, controls } = useThree();
  const primaryRef = useRef();
  const secondaryRef = useRef();
  const primarySatRef = useRef();
  const secondarySatRef = useRef();

  const [simulationTime, setSimulationTime] = useState(
    () => new Date(activeConjunction?.analysis_start).getTime()
  );

  const primaryPath = activeConjunction?.primary_orbit_path || [];
  const secondaryPath = activeConjunction?.secondary_orbit_path || [];
function getVisibleOrbit(path) {
  if (!path || path.length === 0) return [];
  const closestIndex = Math.floor(path.length / 2);
  const before = 25;
  const after = 60;
  return path.slice(
    Math.max(closestIndex - before, 0),
    Math.min(closestIndex + after, path.length)
  );
}
  const primaryVisualPath = getVisibleOrbit(primaryPath);
  const secondaryVisualPath = getVisibleOrbit(secondaryPath);


  const endTime = new Date(activeConjunction?.analysis_end).getTime();

  // Smooth camera transition to focus slightly towards midpoint
  useEffect(() => {
    if (activeConjunction?.closest_point?.midpoint) {
      const mid = activeConjunction?.closest_point?.midpoint;
      const targetVec = new THREE.Vector3(mid.x * EARTH_SCALE_FACTOR, mid.z * EARTH_SCALE_FACTOR, -mid.y * EARTH_SCALE_FACTOR);
      if (controls) {
        controls.target.copy(targetVec);
        controls.update();
      }
      // Fixed camera distance to keep Earth comfortably visible (≈40% of view)
      camera.position.set(0, 0, 22);
      camera.lookAt(targetVec);
    } else {
      // Fallback to default neutral position
      camera.position.set(0, 0, 18);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
  }, [activeConjunction, camera, controls]);

  // Build THREE.Vector3 arrays for orbit lines AND satellite position tracking
  const primaryOrbitPoints = useMemo(() =>
    primaryVisualPath.map(p => new THREE.Vector3(p.x * EARTH_SCALE_FACTOR, p.z * EARTH_SCALE_FACTOR, -p.y * EARTH_SCALE_FACTOR)),
    [primaryVisualPath]
  );
  const secondaryOrbitPoints = useMemo(() =>
    secondaryVisualPath.map(p => new THREE.Vector3(p.x * EARTH_SCALE_FACTOR, p.z * EARTH_SCALE_FACTOR, -p.y * EARTH_SCALE_FACTOR)),
    [secondaryVisualPath]
  );

  // Build static path geometries from the same point arrays
  const { primaryLineGeo, secondaryLineGeo } = useMemo(() => {
    const pGeo = new THREE.BufferGeometry().setFromPoints(primaryOrbitPoints);
    const sGeo = new THREE.BufferGeometry().setFromPoints(secondaryOrbitPoints);
    return { primaryLineGeo: pGeo, secondaryLineGeo: sGeo };
  }, [primaryOrbitPoints, secondaryOrbitPoints]);

  // Animation Loop
  useFrame((state, delta) => {
    // Advance simulation time
    let newTime = simulationTime + delta * 1000 * MISSION_TIME_SCALE;
    if (newTime > endTime) {
      newTime = new Date(activeConjunction?.analysis_start).getTime(); // loop
    }
    setSimulationTime(newTime);

    // Helper to find interpolated position
    const getInterpolatedPosition = (path, timeMs) => {
      if (!path || path.length === 0) return new THREE.Vector3();
      if (path.length === 1) return new THREE.Vector3(path[0].x * EARTH_SCALE_FACTOR, path[0].z * EARTH_SCALE_FACTOR, -path[0].y * EARTH_SCALE_FACTOR);

      let i = 0;
      while (i < path.length - 1 && new Date(path[i + 1].timestamp).getTime() < timeMs) {
        i++;
      }

      if (i >= path.length - 1) {
        const last = path[path.length - 1];
        return new THREE.Vector3(last.x * EARTH_SCALE_FACTOR, last.z * EARTH_SCALE_FACTOR, -last.y * EARTH_SCALE_FACTOR);
      }

      const p1 = path[i];
      const p2 = path[i + 1];
      const t1 = new Date(p1.timestamp).getTime();
      const t2 = new Date(p2.timestamp).getTime();

      const ratio = Math.max(0, Math.min(1, (timeMs - t1) / (t2 - t1)));

      const interpX = p1.x + (p2.x - p1.x) * ratio;
      const interpY = p1.y + (p2.y - p1.y) * ratio;
      const interpZ = p1.z + (p2.z - p1.z) * ratio;

      return new THREE.Vector3(
        interpX * EARTH_SCALE_FACTOR,
        interpZ * EARTH_SCALE_FACTOR,
        -interpY * EARTH_SCALE_FACTOR
      );
    };

    const pPos = getInterpolatedPosition(primaryPath, newTime);
    const sPos = getInterpolatedPosition(secondaryPath, newTime);

    if (primaryRef.current) {
      primaryRef.current.position.copy(pPos);
      primaryRef.current.lookAt(camera.position);
    }
    if (secondaryRef.current) {
      secondaryRef.current.position.copy(sPos);
      secondaryRef.current.lookAt(camera.position);
    }

    // Satellite dots follow their exact orbit point arrays
    const t = state.clock.elapsedTime * 0.08;
    if (primarySatRef.current && primaryOrbitPoints?.length) {
      const index = Math.floor((t % 1) * primaryOrbitPoints.length);
      primarySatRef.current.position.copy(primaryOrbitPoints[index]);
    }
    if (secondarySatRef.current && secondaryOrbitPoints?.length) {
      const index = Math.floor((t % 1) * secondaryOrbitPoints.length);
      secondarySatRef.current.position.copy(secondaryOrbitPoints[index]);
    }
  });

  const riskLevel = activeConjunction?.risk_level?.toUpperCase() || 'UNKNOWN';
  const isLowRisk = riskLevel === 'LOW';
  const isMediumRisk = riskLevel === 'MEDIUM';
  const isHighRisk = riskLevel === 'HIGH' || activeConjunction?.minimum_distance_km < 10;

  // Vector geometry at TCA
  const interceptLineGeo = useMemo(() => {
    if (!activeConjunction?.closest_point) return null;
    const p1 = activeConjunction?.closest_point?.primary_position;
    const p2 = activeConjunction?.closest_point?.secondary_position;
    const points = [
      new THREE.Vector3(p1.x * EARTH_SCALE_FACTOR, p1.z * EARTH_SCALE_FACTOR, -p1.y * EARTH_SCALE_FACTOR),
      new THREE.Vector3(p2.x * EARTH_SCALE_FACTOR, p2.z * EARTH_SCALE_FACTOR, -p2.y * EARTH_SCALE_FACTOR)
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [activeConjunction]);

  const midpoint = activeConjunction?.closest_point?.midpoint;

  const primaryLabel = (
    <div style={{
      color: 'white',
      border: '1px solid #ff7b00',
      padding: '2px 6px',
      borderRadius: '2px',
      background: 'rgba(0,0,0,0.6)',
      fontSize: '0.7rem',
      textAlign: 'center'
    }}>
      SAT-{activeConjunction?.primary_id || activeConjunction?.primary || "25544"}
    </div>
  );

  const secondaryLabel = (
    <div style={{
      color: 'white',
      border: '1px solid #00ffff',
      padding: '2px 6px',
      borderRadius: '2px',
      background: 'rgba(0,0,0,0.6)',
      fontSize: '0.7rem',
      textAlign: 'center'
    }}>
      SAT-{activeConjunction?.secondary_id || activeConjunction?.secondary || "43013"}
    </div>
  );

  return (
    <group>
      {/* Primary Orbit (simplified for display) */}
        <line geometry={primaryLineGeo}>
  <lineBasicMaterial color="#ff8c00" opacity={0.85} transparent linewidth={1} depthWrite={false} />
</line>

      {/* Secondary Orbit (simplified for display) */}
        <line geometry={secondaryLineGeo}>
  <lineBasicMaterial color="#00eaff" opacity={0.85} transparent linewidth={1} depthWrite={false} />
</line>

      {/* Intercept / Possible Intersection line for MEDIUM or HIGH risk */}
        {(isMediumRisk || isHighRisk) && interceptLineGeo && (
          <lineSegments geometry={interceptLineGeo}>
            <lineDashedMaterial color="#ff0000" dashSize={0.1} gapSize={0.1} linewidth={2} depthWrite={false} />
          </lineSegments>
        )}

      {/* Closest Approach Visuals */}
      {midpoint && (
        <group position={[midpoint.x * EARTH_SCALE_FACTOR, midpoint.z * EARTH_SCALE_FACTOR, -midpoint.y * EARTH_SCALE_FACTOR]}>
          {/* Cyan sphere for low risk */}
          {isLowRisk && (
            <mesh>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
            </mesh>
          )}
          {/* HTML label */}
          <Html center style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(23, 38, 53, 0.85)',
              border: '1px solid ' + (isLowRisk ? '#00ffff' : isHighRisk ? '#A94438' : '#ff6600'),
              color: '#FFFFFF',
              padding: '6px 10px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              pointerEvents: 'none'
            }}>
              {isLowRisk ? 'CLOSEST APPROACH' : isHighRisk ? '⚠ CLOSE APPROACH' : 'POSSIBLE INTERSECTION'}<br />
              Dist: {activeConjunction?.minimum_distance_km?.toFixed(2) ?? 'N/A'} KM<br />
              TCA: {formatUTC(activeConjunction?.closest_approach_time)}<br />
              Risk: {activeConjunction?.risk_level}
            </div>
          </Html>
        </group>
      )}

        {/* Animated satellite groups — position updated each frame via useFrame */}
        <group ref={primaryRef} />
        <group ref={secondaryRef} />

        {/* Satellite dot markers — walk along real orbit point arrays */}
        <mesh ref={primarySatRef}>
          <sphereGeometry args={[0.065, 32, 32]} />
          <meshBasicMaterial color="#ff8c00" />
        </mesh>

        <mesh ref={secondarySatRef}>
          <sphereGeometry args={[0.065, 32, 32]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
    </group>
  );
}
