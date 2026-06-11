import React from 'react';
import * as THREE from 'three';

/**
 * SatelliteMarker renders a simple cyan glowing sphere representing a satellite.
 * No labels or HTML are rendered.
 */
const SatelliteMarker = ({ position, isSelected = false, onClick, noradId }) => {
  const sphereColor = isSelected ? '#ffcc00' : '#00eaff';

  return (
    <mesh position={position} onClick={() => onClick && onClick(noradId)}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial color={sphereColor} emissive="#00eaff" />
    </mesh>
  );
};

export default SatelliteMarker;
