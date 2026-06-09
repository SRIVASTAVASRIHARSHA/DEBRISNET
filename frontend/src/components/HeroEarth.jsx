import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import './HeroEarth.css';

const EarthNode = () => {
  const earthRef = useRef();

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
      earthRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <group>
      <group ref={earthRef}>
        {/* Core solid blueprint sphere - slightly transparent navy */}
        <mesh>
          <sphereGeometry args={[1.25, 32, 32]} />
          <meshStandardMaterial 
            color="#1E2D3D" 
            transparent 
            opacity={0.85}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
        
        {/* Technical wireframe latitude/longitude lines */}
        <mesh>
          <sphereGeometry args={[1.252, 24, 24]} />
          <meshBasicMaterial 
            color="#4A5568" 
            wireframe={true} 
            transparent 
            opacity={0.4} 
          />
        </mesh>

        {/* Equatorial Grid Mesh */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.9, 64, 8]} />
          <meshBasicMaterial color="#8FA5BB" wireframe={true} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Orbit Inclination Paths & Satellite Nodes */}
      <OrbitRing radius={1.6} color="#C76D32" rotation={[Math.PI / 2.2, 0.2, 0]} label="SAT: 25544" speed={0.01} />
      <OrbitRing radius={2.1} color="#8FA5BB" rotation={[Math.PI / 1.8, -0.4, 0]} speed={0.005} />
      <OrbitRing radius={2.6} color="#4A5568" rotation={[Math.PI / 2.5, 0.5, 0]} speed={0.008} />
    </group>
  );
};

const OrbitRing = ({ radius, color, rotation, label, speed }) => {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }

  const satRef = useRef();
  useFrame(() => {
    if (satRef.current) {
      satRef.current.rotation.y += speed;
    }
  });

  return (
    <group rotation={rotation}>
      <Line points={points} color={color} lineWidth={1.5} dashed={true} dashScale={5} dashSize={1} dashOffset={0} transparent opacity={0.7} />
      <group ref={satRef}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={color} />
          <mesh>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={color} wireframe={true} transparent opacity={0.5} />
          </mesh>
          {label && (
            <Html distanceFactor={10} position={[0.1, 0.1, 0]}>
              <div className="hero-earth-sat-label">{label}</div>
            </Html>
          )}
        </mesh>
      </group>
    </group>
  );
};

const HeroEarth = () => {
  return (
    <div className="hero-earth-container">
      {/* Telemetry Overlays */}
      <div className="hero-earth-overlay top-left">
        <div className="overlay-title">TELEMETRY</div>
        <div className="overlay-group">
          <div className="overlay-label">ALTITUDE</div>
          <div className="overlay-value">408 KM</div>
        </div>
        <div className="overlay-group">
          <div className="overlay-label">INCLINATION</div>
          <div className="overlay-value">51.6&deg;</div>
        </div>
      </div>
      
      <div className="hero-earth-overlay top-right">
        <div className="overlay-title">ORBITAL VIEW</div>
        <div className="overlay-group">
          <div className="overlay-label">FRAME:</div>
          <div className="overlay-value">ECI</div>
        </div>
        <div className="overlay-group">
          <div className="overlay-label">REFERENCE:</div>
          <div className="overlay-value">TEME</div>
        </div>
      </div>
      
      <div className="hero-earth-crosshair-h"></div>
      <div className="hero-earth-crosshair-v"></div>

      <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
        <ambientLight intensity={1.5} color="#ffffff" />
        <directionalLight position={[5, 3, 5]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.8} color="#8FA5BB" />
        <EarthNode />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
      
      <div className="hero-earth-strip">
        <div className="strip-item">PROPAGATION: SGP4</div>
        <div className="strip-divider"></div>
        <div className="strip-item">DATA SOURCE: LIVE TLE</div>
        <div className="strip-divider"></div>
        <div className="strip-item">REFERENCE FRAME: TEME</div>
      </div>
    </div>
  );
};

export default HeroEarth;
