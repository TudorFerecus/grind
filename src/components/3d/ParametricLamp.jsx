import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { constrain } from '../../customizers/lampConstraints';

function buildGeometry(cfg, hSegs, rSegs) {
  const minPuck = parseFloat(import.meta.env.VITE_LED_PUCK_RADIUS || '3.5');
  const {
    style, height, baseRadius, topRadius,
    profile, intensity, density, twist,
    ripple, rippleFreq, waist,
  } = cfg;

  const base  = Math.max(baseRadius, minPuck + 0.5);
  const twRad = (twist * Math.PI) / 180;
  const depth  = intensity * 0.4;

  const pos     = [];
  const indices = [];

  for (let i = 0; i <= hSegs; i++) {
    const t = i / hSegs;
    const y = t * height;

    // ── Silhouette ────────────────────────────────────────────────────────
    let sR;
    switch (profile) {
      case 'hourglass': {
        // Smooth waist — position controlled by `waist` param
        const w   = waist ?? 0.5;
        const bow = Math.sin((t / (w * 2)) * Math.PI) * (t <= w ? 1 : 0)
                  + Math.sin(((t - w) / ((1 - w) * 2)) * Math.PI) * (t > w ? 1 : 0);
        sR = THREE.MathUtils.lerp(base, topRadius, t)
           - bow * (base - topRadius) * 0.55;
        break;
      }
      case 'teardrop': {
        // Wide belly tapering to top — never goes negative
        const belly = Math.sin(t * Math.PI * 0.85) * (base - topRadius) * 0.35;
        sR = base * (0.38 + 0.62 * Math.pow(1 - t, 0.55)) + belly;
        break;
      }
      default: // cylinder / linear taper
        sR = THREE.MathUtils.lerp(base, topRadius, t);
    }

    // ── Ripple: independent horizontal silhouette waves ──────────────────
    // Sine wave on silhouette radius, fades at top and bottom so edges are clean
    if (ripple > 0) {
      const edgeFade = Math.sin(t * Math.PI);                    // 0 at poles, 1 at mid
      const wave     = Math.sin(t * Math.PI * 2 * rippleFreq);   // N full cycles over height
      sR += wave * ripple * edgeFade * 1.5;
    }

    // Clamp to never fall below minimum safe wall
    sR = Math.max(sR, minPuck + 0.3);

    // ── Radial vertices ───────────────────────────────────────────────────
    for (let j = 0; j <= rSegs; j++) {
      // Regular grid angle — vertex positions are NEVER rotated per ring.
      // This guarantees smooth quad connectivity regardless of twist amount.
      const angle   = (j / rSegs) * Math.PI * 2;

      // Twisted angle is used ONLY for texture sampling.
      // It creates a phase offset that increases with height → the surface
      // pattern spirals upward, which is the intuitive meaning of "twist".
      const twAngle = angle + twRad * t;

      let offset = 0;
      switch (style) {
        case 'architectural': {
          const raw = Math.sin(twAngle * density);
          offset = (Math.pow((raw + 1) * 0.5, 1.6) - 0.45) * depth;
          break;
        }
        case 'organic': {
          const n1 = Math.sin(twAngle * density * 0.7 + t * 4.1);
          const n2 = Math.cos(twAngle * density * 0.4 - t * 6.3);
          offset = n1 * n2 * depth;
          break;
        }
        case 'spiral': {
          // Spiral already has a built-in height-based phase (t * density * -1.5).
          // Twist adds to / subtracts from that rate.
          offset = Math.sin(twAngle * density + t * density * -1.5) * depth;
          break;
        }
        case 'diamond': {
          const d1 = Math.sin(twAngle * density);
          const d2 = Math.sin(t * Math.PI * density * 0.4);
          offset = (Math.abs(d1 * d2) - 0.3) * depth;
          break;
        }
      }

      // Position on the regular (untwisted) angle — no per-ring rotation.
      const r = Math.max(sR + offset, 0.5);
      pos.push(Math.cos(angle) * r, y, Math.sin(angle) * r);
    }
  }

  for (let i = 0; i < hSegs; i++) {
    for (let j = 0; j < rSegs; j++) {
      const a = i * (rSegs + 1) + j;
      const b = (i + 1) * (rSegs + 1) + j;
      const c = (i + 1) * (rSegs + 1) + (j + 1);
      const d = i * (rSegs + 1) + (j + 1);
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const ParametricLamp = (rawConfig) => {
  const {
    style = 'architectural', height = 22, baseRadius = 10, topRadius = 8,
    profile = 'hourglass', intensity = 0.7, density = 18, twist = 0,
    ripple = 0, rippleFreq = 3, waist = 0.5,
    materialFinish = 'frosted', lightType = 'puck', lightOn = false,
    onMetrics,
  } = rawConfig;

  const cfg = useMemo(() => constrain({
    style, height, baseRadius, topRadius, profile, intensity, density, twist,
    ripple, rippleFreq, waist,
  }), [style, height, baseRadius, topRadius, profile, intensity, density, twist,
       ripple, rippleFreq, waist]);

  const previewGeo = useMemo(() => {
    // Always high-detail — GPU handles it well
    return buildGeometry(cfg, 120, 280);
  }, [cfg]);

  useEffect(() => {
    if (!onMetrics) return;
    const surfaceArea = 2 * Math.PI * Math.max(cfg.baseRadius, 4) * cfg.height;
    onMetrics({ weight: surfaceArea * 0.15 * 1.27 });
  }, [cfg, onMetrics]);

  const matProps = useMemo(() => {
    const cr = materialFinish === 'crystal';
    return {
      color:               cr ? '#ffffff' : '#eeeeee',
      transparent:         true,
      opacity:             cr ? 0.85 : 0.92,
      transmission:        cr ? 0.92 : 0.55,
      roughness:           cr ? 0.04 : 0.28,
      thickness:           cr ? 0.8  : 1.8,
      ior:                 cr ? 1.5  : 1.2,
      clearcoat:           cr ? 1.0  : 0.2,
      clearcoatRoughness:  0.1,
      envMapIntensity:     2.0,
      attenuationColor:    cr ? '#ddeeff' : '#fff8e1',
      attenuationDistance: cr ? 0.3 : 0.8,
      side:                THREE.DoubleSide,
    };
  }, [materialFinish]);

  return (
    <group>
      <mesh geometry={previewGeo}>
        <meshPhysicalMaterial {...matProps} />
      </mesh>

      {lightOn && (
        <group position={[0, lightType === 'puck' ? 0.8 : cfg.height * 0.5, 0]}>
          <pointLight intensity={lightType === 'puck' ? 18 : 30} distance={50} color="#ffb347" castShadow />
          <mesh>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial emissive="#ffcc66" emissiveIntensity={8} color="#ffcc66" />
          </mesh>
          <mesh>
            <sphereGeometry args={[1.2, 16, 16]} />
            <meshBasicMaterial color="#ffcc88" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* Pedestal */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[baseRadius * 1.08, baseRadius * 1.12, 0.6, 64]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
};

export default ParametricLamp;
