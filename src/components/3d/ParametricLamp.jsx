import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { SpotLight } from '@react-three/drei';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const ParametricLamp = ({ 
  height = 25, 
  baseRadius = 10,
  topRadius = 6,
  bulge = 0,
  twist = 0,
  ridgesCount = 0,
  ridgeDepth = 0,
  lightType = 'puck',
  lightOn = true,
  onMetrics
}) => {
  const meshRef = useRef();

  // Create a highly dense parametric solid geometry (Shell)
  const geo = useMemo(() => {
    const wallThickness = 0.045; // 0.45mm wall for optimum single-perimeter slice
    const baseThickness = 0.2; // 2mm solid bottom
    const hSegs = 256; // Max height resolution
    const rSegs = 512; // Ultra-high radial resolution for perfect curves
    const points = [];

    // Path must rotate counter-clockwise around the shell to maintain outwards-facing normals
    // 1. Inner Bottom Center (Axis Start)
    points.push(new THREE.Vector2(0, -height / 2 + baseThickness));
    
    // 2. Inner Wall (bottom to top)
    for (let i = 0; i <= hSegs; i++) {
        const ny = (i / hSegs) - 0.5;
        const t = ny + 0.5;
        const rLerp = THREE.MathUtils.lerp(baseRadius, topRadius, t);
        const parabolicStr = 1.0 - Math.pow(ny / 0.5, 2);
        const rBulge = rLerp * (1.0 + bulge * 0.2 * parabolicStr);
        const rInner = Math.max(0.005, rBulge - wallThickness);
        points.push(new THREE.Vector2(rInner, ny * height));
    }
    
    // 3. Outer Wall (top to bottom)
    for (let i = hSegs; i >= 0; i--) {
        const ny = (i / hSegs) - 0.5;
        const t = ny + 0.5;
        const rLerp = THREE.MathUtils.lerp(baseRadius, topRadius, t);
        const parabolicStr = 1.0 - Math.pow(ny / 0.5, 2);
        const rBulge = rLerp * (1.0 + bulge * 0.2 * parabolicStr);
        points.push(new THREE.Vector2(rBulge, ny * height));
    }
    
    // 4. Outer Bottom Center (Axis End)
    points.push(new THREE.Vector2(0, -height / 2));
    
    // Generate the solid watertight lathe
    let latheGeo = new THREE.LatheGeometry(points, rSegs, 0, Math.PI * 2);
    
    // --- Optimized Buffer Modification ---
    const pos = latheGeo.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const y = pos[i+1];
      const z = pos[i+2];
      
      const ny = y / height;
      const t = ny + 0.5; 
      
      let radius = Math.hypot(x, z);
      if (radius < 0.0001) continue; // Skip poles to preserve manifoldness

      let angle = Math.atan2(z, x);
      
      const twistRad = THREE.MathUtils.degToRad(twist);
      angle += twistRad * t;
      
      if (ridgesCount > 0 && ridgeDepth > 0) {
        const ridgeScale = 1.0 + (Math.sin(angle * ridgesCount) * (ridgeDepth * 0.05));
        radius *= ridgeScale;
      }
      
      pos[i] = Math.cos(angle) * radius;
      pos[i+2] = Math.sin(angle) * radius;
    }
    
    latheGeo.computeVertexNormals();
    
    // Fix non-manifold poles by merging co-located vertices
    latheGeo = mergeVertices(latheGeo);
    
    latheGeo.computeBoundingSphere();
    latheGeo.computeBoundingBox();
    
    return latheGeo;
  }, [height, baseRadius, topRadius, bulge, twist, ridgesCount, ridgeDepth]);

  // Volume Calculation using the Divergence Theorem (Tetrahedron Signed Volume)
  const metrics = useMemo(() => {
    let volume = 0;
    const pos = geo.attributes.position;
    const index = geo.index;
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    
    if (index) {
        for (let i = 0; i < index.count; i += 3) {
           vA.fromBufferAttribute(pos, index.getX(i));
           vB.fromBufferAttribute(pos, index.getX(i+1));
           vC.fromBufferAttribute(pos, index.getX(i+2));
           volume += vA.dot(vB.cross(vC)) / 6.0;
        }
    }
    
    const absVolume = Math.abs(volume); // cubic cm
    const weight = absVolume * 1.25; // 1.25 g/cm3 approximate density for PETG
    return { volume: absVolume, weight };
  }, [geo]);

  // Propagate metrics upstream
  useEffect(() => {
    if (onMetrics) onMetrics(metrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics]);

  const bulbColor = lightOn ? "#ffffff" : "#444444";
  const lightColor = "#ffeedd"; 

  return (
    <group>
      <mesh 
        ref={meshRef} 
        geometry={geo} 
        castShadow 
        receiveShadow 
        name="lamp_shade" 
      >
        <meshPhysicalMaterial 
          color="#ffffff" 
          emissive={lightOn ? "#ffcf8c" : "#000000"} 
          emissiveIntensity={lightOn ? 0.8 : 0}
          transmission={lightOn ? 0.6 : 0.9} /* High fidelity translucent look */
          roughness={0.1} 
          metalness={0.0} 
          thickness={0.1} 
          ior={1.47} /* Standard polymer IOR for realistic refraction */
          attenuationColor="#ffffff" 
          side={THREE.DoubleSide}
          clearcoat={0.4} 
          clearcoatRoughness={0.05}
          transparent={true}
          opacity={lightOn ? 0.99 : 1}
          dithering={true} 
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
            shadow-bias={-0.0005} 
          />
        </group>
      )}
      
      {!lightType.includes('puck') && (
        <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[baseRadius * 0.95, 64]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
};

export default ParametricLamp;
