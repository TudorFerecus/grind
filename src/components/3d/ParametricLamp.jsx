import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { SpotLight } from '@react-three/drei';

export const ParametricLamp = ({ 
  height = 25, 
  baseRadius = 10,
  topRadius = 6,
  bulge = 0,
  twist = 0,
  ridgesCount = 0,
  ridgeDepth = 0,
  lightType = 'puck',
  lightOn = true
}) => {
  const meshRef = useRef();

  // Create a highly dense parametric geometry
  const geometry = useMemo(() => {
    // 256 radial and 256 height segments: ultra-smooth to eliminate visible quads even at extreme zoom.
    const defaultRadius = 10;
    const geo = new THREE.CylinderGeometry(defaultRadius, defaultRadius, height, 256, 256, true);
    
    const positionAttribute = geo.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      
      const ny = vertex.y / height;
      const t = ny + 0.5;
      
      const radiusScale = THREE.MathUtils.lerp(baseRadius / defaultRadius, topRadius / defaultRadius, t);
      
      const parabolicStr = 1.0 - Math.pow(ny / 0.5, 2); 
      const bulgeScale = 1.0 + (bulge * 0.2 * parabolicStr);
      
      let angle = Math.atan2(vertex.z, vertex.x);
      
      const twistRad = THREE.MathUtils.degToRad(twist);
      angle += twistRad * t;
      
      let ridgeScale = 1.0;
      if (ridgesCount > 0 && ridgeDepth > 0) {
        ridgeScale = 1.0 + (Math.sin(angle * ridgesCount) * (ridgeDepth * 0.05));
      }
      
      const finalScale = radiusScale * bulgeScale * ridgeScale;
      vertex.x = Math.cos(angle) * defaultRadius * finalScale;
      vertex.z = Math.sin(angle) * defaultRadius * finalScale;
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    
    return geo;
  }, [height, baseRadius, topRadius, bulge, twist, ridgesCount, ridgeDepth]);

  const bulbColor = lightOn ? "#ffffff" : "#444444";
  const lightColor = "#ffeedd"; 

  return (
    <group>
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        castShadow 
        receiveShadow 
        name="lamp_shade" 
      >
        <meshPhysicalMaterial 
          color="#ffffff" 
          emissive={lightOn ? "#ffcf8c" : "#000000"} 
          emissiveIntensity={lightOn ? 0.8 : 0}
          transmission={lightOn ? 0.4 : 0.7} /* Balanced to hide vertex structure better while staying translucent */
          roughness={0.15} 
          metalness={0.0} 
          thickness={2.0} 
          ior={1.3} /* Lower IOR reduces refractive distortion that highlights quads */
          attenuationColor="#ffffff" 
          side={THREE.DoubleSide}
          clearcoat={0.2} 
          clearcoatRoughness={0.1}
          transparent={true}
          opacity={lightOn ? 0.98 : 1}
          dithering={true} /* Helps smooth out gradient banding */
        />
      </mesh>

      {/* Lighting Modality: Ambient omni-directional bulb inside the lamp */}
      {lightType === 'bulb' && (
        <group position={[0, (-height / 2) + (height * 0.4), 0]}>
          <mesh>
            <sphereGeometry args={[Math.min(baseRadius, topRadius) * 0.2, 32, 32]} />
            <meshBasicMaterial color={bulbColor} />
            <pointLight 
              intensity={lightOn ? 1800 : 0} 
              distance={height * 5} 
              decay={2} 
              color={lightColor} 
              castShadow 
              shadow-bias={-0.001}
            />
          </mesh>
        </group>
      )}

      {/* Lighting Modality: Base-mounted directional puck light */}
      {lightType === 'puck' && (
        <group position={[0, -height / 2, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[baseRadius * 0.8, baseRadius * 0.8, 1, 64]} />
            <meshStandardMaterial color="#222" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[baseRadius * 0.7, 64]} />
            <meshBasicMaterial color={bulbColor} />
          </mesh>
          <SpotLight 
            position={[0, 1.2, 0]} 
            angle={Math.PI / 2.5} 
            penumbra={0.6} 
            intensity={lightOn ? 4000 : 0} 
            distance={height * 4}
            decay={2}
            color={lightColor} 
            castShadow
            shadow-bias={-0.0005} // prevent shadow acne internally
          />
        </group>
      )}
      
      {/* Aesthetic Base cap if non-puck lighting is active */}
      {!lightType.includes('puck') && (
        <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[baseRadius * 0.95, 64]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      )}
      
      {/* Optional Top ring/lip to make geometry feel closed/solid if needed, though open vases are nice */}
    </group>
  );
};

export default ParametricLamp;
