import React, { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

// Utility for fetching image pixel data via Canvas API
const getLuminanceData = (src, maxRes = 256) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // Calculate aspect ratio and bounds for resolution
      const aspect = img.width / img.height;
      let w = img.width;
      let h = img.height;
      
      if (w > maxRes || h > maxRes) {
        if (w > h) {
          w = maxRes;
          h = Math.round(maxRes / aspect);
        } else {
          h = maxRes;
          w = Math.round(maxRes * aspect);
        }
      }
      
      // Prevent 0 width/height
      w = Math.max(2, w);
      h = Math.max(2, h);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      
      // Store luminance (0.0 to 1.0)
      const luminance = new Float32Array(w * h);
      for (let i = 0; i < data.length; i += 4) {
        // Human perception of luminance: 0.299*R + 0.587*G + 0.114*B
        const l = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
        luminance[i / 4] = l;
        
        // Convert to inverted grayscale for the Thickness Map (Black=Thin, White=Thick)
        // Since lum=1.0 is white (thin wall), we want it to be 0 mapping to 0 thickness
        // Since lum=0.0 is black (thick wall), we want it to be 255 mapping to max thickness
        const thicknessVal = Math.round((1.0 - l) * 255);
        data[i] = thicknessVal;     // R
        data[i+1] = thicknessVal;   // G
        data[i+2] = thicknessVal;   // B
      }
      
      ctx.putImageData(imgData, 0, 0);
      const grayscaleDataUrl = canvas.toDataURL();
      
      resolve({ luminance, width: w, height: h, aspect, grayscaleDataUrl });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

export const ParametricLithophane = ({ 
  modelType = 'flat',
  thickness = 3.5,
  baseThickness = 0.5,
  size = 15,
  lightOn = true,
  imageSource = null
}) => {
  const meshRef = useRef();
  const [pixelData, setPixelData] = useState(null);

  // Load Image Data when source changes
  useEffect(() => {
    if (imageSource) {
      getLuminanceData(imageSource).then(data => {
        if (data) setPixelData(data);
      });
    } else {
      setPixelData(null);
    }
  }, [imageSource]);

  const geometry = useMemo(() => {
    // If no image, create a basic placeholder
    if (!pixelData) {
      return new THREE.PlaneGeometry(size, size, 1, 1);
    }

    const { luminance, width: cols, height: rows, aspect } = pixelData;
    
    // Scale model in generic units (cm roughly)
    const H = size; 
    const W = size * aspect;
    
    // Convert mm to standard units assuming size is in cm (so 3.5mm = 0.35cm)
    const thickMax = thickness / 10;
    const thickMin = baseThickness / 10;

    const geo = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];

    // Map luminance to a grid of vertices
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // Luminance at this pixel
        const lum = luminance[y * cols + x];
        
        // Dark pixels = thick material, Light pixels = thin material
        const zDisplacement = thickMin + (1.0 - lum) * (thickMax - thickMin);
        
        // Normalized UVs (0 to 1)
        const u = x / (cols - 1);
        const v = 1.0 - (y / (rows - 1));

        let px, py, pz;

        if (modelType === 'flat') {
          px = (u - 0.5) * W;
          py = (v - 0.5) * H;
          pz = zDisplacement;
        } 
        else if (modelType === 'curved') {
          // Arc of an implied cylinder (e.g. 120 degrees arc)
          const angleRange = Math.PI * 0.6; // 108 degrees
          const radius = W / angleRange;
          const theta = (u - 0.5) * angleRange;
          
          px = Math.sin(theta) * (radius + zDisplacement);
          py = (v - 0.5) * H;
          pz = Math.cos(theta) * (radius + zDisplacement) - radius; // Center it locally
        }
        else if (modelType === 'cylinder') {
          // Full 360 wrap
          const radius = W / (Math.PI * 2);
          const theta = u * Math.PI * 2;
          
          px = Math.cos(theta) * (radius + zDisplacement);
          py = (v - 0.5) * H;
          pz = Math.sin(theta) * (radius + zDisplacement);
        }
        else if (modelType === 'dome') {
          // portion of a sphere (polar coordinates)
          const phiRange = Math.PI * 0.4; // 72 degree dome
          const thetaRange = Math.PI * 0.4;
          const radius = W / thetaRange;
          
          const phi = (v - 0.5) * phiRange + Math.PI/2; 
          const theta = (u - 0.5) * thetaRange;

          px = Math.sin(phi) * Math.sin(theta) * (radius + zDisplacement);
          py = Math.cos(phi) * (radius + zDisplacement);
          pz = Math.sin(phi) * Math.cos(theta) * (radius + zDisplacement) - radius;
        }

        vertices.push(px, py, pz);
        uvs.push(u, v);
      }
    }

    // Build faces (Triangle grid)
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols - 1; x++) {
        let current = y * cols + x;
        let next = current + 1;
        let above = (y + 1) * cols + x;
        let aboveNext = above + 1;

        if (modelType === 'cylinder' && x === cols - 2) {
            // When building cylinder, we need the seam to connect identically.
            // Since we generated cols vertices, the last col is at U=1, first is U=0.
            // They overlap in space conceptually but might have different luminance due to image not tiling perfectly.
            // But we must connect them. We use the generated vertices.
        }

        // CCW faces
        indices.push(current, next, aboveNext);
        indices.push(current, aboveNext, above);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    
    geo.computeVertexNormals();
    
    // Center properly
    geo.computeBoundingBox();
    const box = geo.boundingBox;
    geo.translate(
      -(box.max.x + box.min.x) / 2, 
      -(box.max.y + box.min.y) / 2, 
      -(box.max.z + box.min.z) / 2
    );

    return geo;
  }, [pixelData, modelType, thickness, baseThickness, size]);

  const textureThickness = useMemo(() => {
    if (!pixelData || !pixelData.grayscaleDataUrl) return null;
    const tex = new THREE.TextureLoader().load(pixelData.grayscaleDataUrl);
    // Nu setăm SRGBColorSpace pt a păstra linearitatea densității
    return tex;
  }, [pixelData]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#dddddd",  // Plastic alb-ușor-gri
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      emissive: "#ffffff",
      emissiveMap: textureThickness,
      emissiveIntensity: lightOn ? 2.5 : 0, // Aici se va face diferența uriașă On/Off
    });
  }, [textureThickness, lightOn]);

  return (
    <group>
      {/* Lithophane Mesh */}
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        material={material} 
        castShadow 
        receiveShadow
        name="lamp_shade" // Used for finding it during export script
      />

      {/* Backlight Simulation (Real bulb inside) */}
      <mesh position={[0, 0, (modelType === 'dome' || modelType === 'curved' || modelType === 'flat') ? -size/2 : 0]}>
        <pointLight 
          intensity={lightOn ? 100 : 0} 
          distance={Math.max(100, size * 5)} 
          color="#ffeedd" 
        />
      </mesh>
    </group>
  );
};

export default ParametricLithophane;
