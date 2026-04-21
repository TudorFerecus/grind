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
    // 256 radial segments to support dense ribs, 128 height segments for smooth curves
    const defaultRadius = 10;
    const geo = new THREE.CylinderGeometry(defaultRadius, defaultRadius, height, 256, 128, true);
    
    const positionAttribute = geo.attributes.position;
    const uvAttribute = geo.attributes.uv;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      
      // Normalized height: varies from -0.5 at base to 0.5 at top
      const ny = vertex.y / height;
      
      // 1. Tapering (Base Radius vs Top Radius interpolation)
      // ny ranges from [-0.5, 0.5], so (ny + 0.5) ranges from [0, 1]
      const t = ny + 0.5;
      const radiusScale = THREE.MathUtils.lerp(baseRadius / defaultRadius, topRadius / defaultRadius, t);
      
      // 2. Bulge / Pinch (Parabolic curve)
      // Parabola equation: 1 - ((y) / 0.5)^2 -> 1 at center, 0 at ends
      const parabolicStr = 1.0 - Math.pow(ny / 0.5, 2); 
      const bulgeScale = 1.0 + (bulge * 0.2 * parabolicStr);
      
      // Calculate current angle
      let angle = Math.atan2(vertex.z, vertex.x);
      
      // 3. Twist
      // twist parameter is in degrees. Convert to radians.
      const twistRad = THREE.MathUtils.degToRad(twist);
      // Apply twist smoothly from bottom to top
      angle += twistRad * t;
      
      // 4. Ribs (Flutes)
      let ridgeScale = 1.0;
      if (ridgesCount > 0 && ridgeDepth > 0) {
        // sine wave around the perimeter
        // Note: we use original angle without twist for the continuous mapping 
        // to avoid distortions, but twisting the angle gives it the spiraling ribbed look!
        ridgeScale = 1.0 + (Math.sin(angle * ridgesCount) * (ridgeDepth * 0.05));
      }
      
      // Apply transforms
      const finalScale = radiusScale * bulgeScale * ridgeScale;
      vertex.x = Math.cos(angle) * defaultRadius * finalScale;
      vertex.z = Math.sin(angle) * defaultRadius * finalScale;
      
      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    // We must recompute normals after moving vertices manually
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    
    return geo;
  }, [height, baseRadius, topRadius, bulge, twist, ridgesCount, ridgeDepth]);

  const bulbColor = lightOn ? "#ffffff" : "#444444";
  const lightColor = "#fff7ed"; // Very warm, glowing light

  return (
    <group>
      {/* 
        The Translucent Lamp Shade 
        Simulating a high-quality 3D printed translucent plastic like PETG or natural PLA.
      */}
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        castShadow 
        receiveShadow // Self-shadowing is key for realism on ribs/ribbons
        name="lamp_shade" 
      >
        <meshPhysicalMaterial 
          color="#dfdfdf" /* Off-white PETG base color */
          transmission={lightOn ? 0.99 : 0.85} /* High transmission when light is on to simulate bright light bleed */
          roughness={0.7} /* Higher roughness so it scatters light correctly */
          metalness={0.0} 
          thickness={lightOn ? 2.0 : 4.0} /* Lower thickness when on so light penetrates more easily */
          ior={1.45} /* Index of Refraction typical for plastics */
          attenuationColor="#ffffff" 
          attenuationDistance={lightOn ? height * 5 : height * 1.0} /* Light travels much further when actively lit */
          side={THREE.DoubleSide}
          clearcoat={0.0} 
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
