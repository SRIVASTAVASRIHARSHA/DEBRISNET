import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * SatelliteMarker renders a small glowing sphere for a satellite and a minimal HUD label.
 */
const SatelliteMarker = ({
  position,
  isSelected = false,
  onClick,
  label = '',
  noradId,
  opacity = 1,
  labelOpacity = 1,
  isTracked = false,
}) => {
  const sphereColor = isSelected ? '#ffcc00' : '#00eaff';
  const meshRef = React.useRef();
  const materialRef = React.useRef();

  // Apply size and emissive intensity for tracked satellite
  React.useEffect(() => {
    if (meshRef.current) {
      const scale = isTracked ? 1.3 : 1.0;
      meshRef.current.scale.set(scale, scale, scale);
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = isTracked ? 2 : 1;
    }
  }, [isTracked]);

  // Lerp opacity for smooth fade (500ms approx)
  useFrame((state, delta) => {
    if (materialRef.current) {
      const current = materialRef.current.opacity;
      const target = opacity;
      const lerp = 0.1; // adjust for speed (0.1 per frame ~ 500ms)
      if (Math.abs(current - target) > 0.01) {
        materialRef.current.opacity = current + (target - current) * lerp;
      } else {
        materialRef.current.opacity = target;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick && onClick(noradId)}
    >
      {/* Small sphere – radius limited to 0.03 */}
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial ref={materialRef} color={sphereColor} emissive="#00eaff" transparent={true} opacity={opacity} />
        {/* HUD label using Drei Html */}
        <Html
          center
          sprite
          distanceFactor={8}
          style={{
            fontSize: "8px",
            color: "#00eaff",
            opacity: labelOpacity,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            transition: "opacity 0.5s",
          }}
          className="sat-label"
        >
          {label}
        </Html>
    </mesh>
  );
};

export default SatelliteMarker;
