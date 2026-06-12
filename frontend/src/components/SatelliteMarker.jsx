import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * SatelliteMarker renders a tiny satellite representation and a minimal HUD label.
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
  const bodyColor = isSelected ? '#ff9b42' : '#d96b2b';
  const groupRef = useRef();
  const bodyMatRef = useRef();
  const panelMatRef1 = useRef();
  const panelMatRef2 = useRef();

  // Apply size and emissive intensity for tracked satellite
  useEffect(() => {
    if (groupRef.current) {
      const scale = isTracked ? 0.12 : 0.08;
      groupRef.current.scale.set(scale, scale, scale);
    }
    if (bodyMatRef.current) {
      bodyMatRef.current.emissiveIntensity = isTracked ? 1.0 : 0.6;
    }
  }, [isTracked]);

  // Lerp opacity for smooth fade and face camera
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.lookAt(state.camera.position);
    }
    
    const target = opacity;
    const lerp = 0.1; // adjust for speed (0.1 per frame ~ 500ms)
    
    [bodyMatRef, panelMatRef1, panelMatRef2].forEach(ref => {
      if (ref.current) {
        const current = ref.current.opacity;
        if (Math.abs(current - target) > 0.01) {
          ref.current.opacity = current + (target - current) * lerp;
        } else {
          ref.current.opacity = target;
        }
      }
    });
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={() => onClick && onClick(noradId)}
      scale={[0.08, 0.08, 0.08]}
    >
      {/* Center body */}
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial 
          ref={bodyMatRef} 
          color={bodyColor} 
          emissive="#d96b2b" 
          emissiveIntensity={0.6} 
          transparent={true} 
          opacity={opacity} 
        />
      </mesh>
      
      {/* Left solar panel */}
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial 
          ref={panelMatRef1} 
          color="#8a3f18" 
          transparent={true} 
          opacity={opacity} 
        />
      </mesh>
      
      {/* Right solar panel */}
      <mesh position={[0.6, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial 
          ref={panelMatRef2} 
          color="#8a3f18" 
          transparent={true} 
          opacity={opacity} 
        />
      </mesh>

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
    </group>
  );
};

export default SatelliteMarker;
