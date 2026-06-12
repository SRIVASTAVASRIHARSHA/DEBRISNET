import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * SatelliteMarker renders a simple glowing orange sphere for a satellite and a minimal HUD label.
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
  const meshRef = useRef();
  const materialRef = useRef();

  // Lerp opacity for smooth fade and add target pulse
  useFrame((state) => {
    // Target pulse for tracked satellite
    if (isTracked && meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      const finalScale = 1.5 * pulse;
      meshRef.current.scale.set(finalScale, finalScale, finalScale);
    } else if (meshRef.current) {
      meshRef.current.scale.set(1.0, 1.0, 1.0);
    }
    
    if (materialRef.current) {
      const current = materialRef.current.opacity;
      const target = opacity;
      const lerp = 0.1;
      
      // Never allow selected satellite opacity to interpolate toward 0
      if (isTracked) {
        materialRef.current.opacity = 1.0;
      } else {
        if (Math.abs(current - target) > 0.01) {
          materialRef.current.opacity = current + (target - current) * lerp;
        } else {
          materialRef.current.opacity = target;
        }
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => onClick && onClick(noradId)}
    >
      <sphereGeometry args={[0.035, 16, 16]} />
      <meshStandardMaterial 
        ref={materialRef} 
        color="#d96c2c" 
        emissive="#d96c2c" 
        emissiveIntensity={1.5} 
        transparent={true} 
        opacity={opacity} 
      />

      {/* HUD label using Drei Html */}
      <Html
        center
        sprite
        distanceFactor={8}
        style={{
          fontSize: "8px",
          color: "#d96b2b",
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
