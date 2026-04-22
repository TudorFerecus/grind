import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { SpotLight } from '@react-three/drei';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const ParametricLamp = ({ 
  height = 25, 
  baseRadius = 10,
  topRadius = 6,
  bulges = [],
  ridgeLayers = [],
  twist = 0,
  ridgesCount = 0,
  ridgeDepth = 0,
  ridgeSharpness = 1,
  lightType = 'puck',
  lightOn = true,
  onMetrics
}) => {
  const meshRef = useRef();

  // 1. Create the static skeleton geometry only once
  const baseGeo = useMemo(() => {
    const baseThickness = 0.2; 
    const hSegs = 128; 
    const rSegs = 512; // Ultra-high resolution for premium sculptural quality
    const points = [];

    // Path for a unit-height, unit-radius solid shell
    points.push(new THREE.Vector2(0, -0.5 + baseThickness/25)); // Base Center
    for (let i = 0; i <= hSegs; i++) {
        points.push(new THREE.Vector2(1, (i/hSegs) - 0.5)); // Unit Wall
    }
    for (let i = hSegs; i >= 0; i--) {
        points.push(new THREE.Vector2(0.95, (i/hSegs) - 0.5)); // Internal Wall
    }
    points.push(new THREE.Vector2(0, -0.5)); // Outer Center
    
    let geo = new THREE.LatheGeometry(points, rSegs, 0, Math.PI * 2);
    geo = mergeVertices(geo); // Merge poles once
    geo.userData.origPos = Array.from(geo.attributes.position.array);
    return geo;
  }, []);

  // 2. Performance-optimized Rendering Geometry
  const renderGeo = useMemo(() => baseGeo.clone(), [baseGeo]);

  // 3. Hot-Loop Math: Mutate buffer directy at 60 FPS
  useMemo(() => {
    const pos = renderGeo.attributes.position.array;
    const orig = baseGeo.userData.origPos;
    const wallThickness = 0.045;

    const bodyTwistRad = THREE.MathUtils.degToRad(twist);

    for (let i = 0; i < pos.length; i += 3) {
      const ox = orig[i];
      const oy = orig[i+1];
      const oz = orig[i+2];

      const ny = oy; // [-0.5, 0.5]
      const t = ny + 0.5; // [0, 1]

      // 1. Tapering (Linear)
      const taperRadius = THREE.MathUtils.lerp(baseRadius, topRadius, t);
      
      // 2. Additive Bulges (Sum of Gaussian contributions)
      let cumulativeBulgeFactor = 0;
      if (Array.isArray(bulges)) {
        for (const b of bulges) {
            const intensity = b.bulge || 0;
            const center = (b.bulgeCenter || 0) - 0.5; // Map [0,1] to [-0.5, 0.5]
            const sigma = 0.25; 
            const gaussian = Math.exp(-Math.pow(ny - center, 2) / (2 * Math.pow(sigma, 2)));
            cumulativeBulgeFactor += intensity * 0.2 * gaussian;
        }
      }
      const bulgeScale = 1.0 + cumulativeBulgeFactor;
      
      const initialRadius = Math.hypot(ox, oz);
      if (initialRadius < 0.0001) {
          pos[i+1] = ny * height;
          continue; 
      }

      const isInner = initialRadius < 0.98;
      let finalRadius = taperRadius * bulgeScale;
      
      // Geometric Clamping: Ensure the lamp fits within the printer's bed (11.5cm radius)
      // We apply this BEFORE subtracting wall thickness to maintain consistent shells
      finalRadius = Math.min(finalRadius, 11.5);
      
      if (isInner) finalRadius -= wallThickness;
      
      let angle = Math.atan2(oz, ox);

      // 3. Advanced Additive Ridge Deformation (Peak Sharpening + Per-layer Twist)
      let cumulativeRidgeOffset = 0;
      if (Array.isArray(ridgeLayers)) {
        for (const layer of ridgeLayers) {
          const rCount = layer.count || 0;
          const rDepth = layer.depth || 0;
          const rSharp = layer.sharpness || 1;
          const rTwistRad = THREE.MathUtils.degToRad(layer.twist || 0);

          if (rCount > 0 && rDepth > 0) {
            const layerPhase = angle + (rTwistRad * t);
            const sn = Math.sin(layerPhase * rCount);
            const sharpSn = Math.pow(Math.abs(sn), rSharp) * Math.sign(sn);
            cumulativeRidgeOffset += sharpSn * (rDepth * 0.05);
          }
        }
      }
      finalRadius *= 1.0 + cumulativeRidgeOffset;

      // 4. Final Rotation (Twist)
      const finalAngle = angle + (bodyTwistRad * t);

      pos[i] = Math.cos(finalAngle) * finalRadius;
      pos[i+1] = ny * height;
      pos[i+2] = Math.sin(finalAngle) * finalRadius;
    }
    
    renderGeo.attributes.position.needsUpdate = true;
    renderGeo.computeVertexNormals();
    renderGeo.computeBoundingSphere();
  }, [renderGeo, baseGeo, height, baseRadius, topRadius, bulges, ridgeLayers, twist, ridgesCount, ridgeDepth, ridgeSharpness]);

  // Volume Calculation (Deferred/Debounced for performance)
  const metrics = useMemo(() => {
    let volume = 0;
    const pos = renderGeo.attributes.position;
    const index = renderGeo.index;
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const vC = new THREE.Vector3();
    
    for (let i = 0; i < index.count; i += 3) {
        vA.fromBufferAttribute(pos, index.getX(i));
        vB.fromBufferAttribute(pos, index.getX(i+1));
        vC.fromBufferAttribute(pos, index.getX(i+2));
        volume += vA.dot(vB.cross(vC)) / 6.0;
    }
    
    const absVolume = Math.abs(volume); 
    const weight = absVolume * 1.25; 
    return { volume: absVolume, weight };
  }, [renderGeo]);

  // Propagate metrics upstream with a debounce to keep sliding fluid
  useEffect(() => {
    const timer = setTimeout(() => {
        if (onMetrics) onMetrics(metrics);
    }, 200);
    return () => clearTimeout(timer);
  }, [metrics, onMetrics]);

  const bulbColor = lightOn ? "#ffffff" : "#444444";
  const lightColor = "#ffeedd"; 

  return (
    <group>
      <mesh 
        ref={meshRef} 
        geometry={renderGeo} 
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
