import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import ParametricLamp from './ParametricLamp';

const LampPreview = ({ config, sceneRef }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 15, 30], fov: 45 }}
        onCreated={({ scene }) => {
          if (sceneRef) {
            sceneRef.current = scene;
          }
        }}
      >
        <color attach="background" args={['#1a1410']} />
        <fog attach="fog" args={['#1a1410', 30, 80]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 10]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />

        <Suspense fallback={null}>
          <group position={[0, -5, 0]}>
            <ParametricLamp {...config} />
            
            <ContactShadows 
              position={[0, 0, 0]} 
              opacity={0.4} 
              scale={40} 
              blur={2} 
              far={10} 
              color="#000000"
            />
          </group>
          <Environment preset="city" />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={15}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
};

export default LampPreview;
