import ParametricLamp from '../components/3d/ParametricLamp';
import { STYLE_ENVELOPES, HEIGHT_MAX, HEIGHT_MIN } from './lampConstraints';

export const lampEngine = {
  id: 'lamp',
  title: 'engines.lamp.title',
  description: 'engines.lamp.desc',
  Component3D: ParametricLamp,
  basePrice: 200,

  defaultState: {
    style: 'architectural',
    height: 22,
    baseRadius: 10,
    topRadius: 8,
    profile: 'hourglass',
    waist: 0.5,
    intensity: 0.7,
    density: 18,
    twist: 0,
    ripple: 0,
    rippleFreq: 3,
    materialFinish: 'frosted',
    lightType: 'puck',
    lightOn: false,
  },

  calculatePrice: (config, basePrice, metrics) => {
    const mat = config.materialFinish === 'crystal' ? 1.3 : 1.0;
    const weight = metrics?.weight ?? 300;
    return Math.round((basePrice + weight * 0.15) * mat);
  },

  sections: [
    // ── Visualization (hardware + material + light) ──────────────────────
    {
      title: 'engines.lamp.visualSim',
      controls: [
        {
          type: 'select', key: 'materialFinish', label: 'engines.lamp.materialFinish',
          options: [
            { label: 'engines.lamp.frosted', value: 'frosted' },
            { label: 'engines.lamp.crystal', value: 'crystal' },
          ],
        },
        { type: 'checkbox', key: 'lightOn', label: 'engines.lamp.turnOnBulb' },
        {
          type: 'select', key: 'lightType', label: 'engines.lamp.lightType',
          condition: (c) => c.lightOn,
          options: [
            { label: 'engines.lamp.lightPuck', value: 'puck' },
            { label: 'engines.lamp.lightBulb', value: 'bulb' },
          ],
        },
      ],
    },

    // ── Silhouette (shape of the lamp body) ─────────────────────────────
    {
      title: 'engines.lamp.baseShape',
      controls: [
        {
          type: 'select', key: 'profile', label: 'engines.lamp.profile',
          options: [
            { label: 'engines.lamp.cylinder',  value: 'cylinder' },
            { label: 'engines.lamp.hourglass', value: 'hourglass' },
            { label: 'engines.lamp.teardrop',  value: 'teardrop' },
          ],
        },
        { type: 'range', key: 'height',     label: 'engines.lamp.height',  min: HEIGHT_MIN, max: HEIGHT_MAX, step: 0.5 },
        { type: 'range', key: 'baseRadius', label: 'engines.lamp.baseRad', min: 6,   max: 11.5, step: 0.1 },
        { type: 'range', key: 'topRadius',  label: 'engines.lamp.topRad',  min: 4,   max: 11.5, step: 0.1 },
        {
          // Waist position — only visible for hourglass
          type: 'range', key: 'waist', label: 'engines.lamp.waistPos',
          min: 0.15, max: 0.85, step: 0.05,
          condition: (c) => c.profile === 'hourglass',
        },
        // ── Ripple: horizontal silhouette waves (orthogonal to texture) ──
        {
          type: 'range', key: 'ripple', label: 'engines.lamp.ripple',
          min: 0, max: 1.0, step: 0.05,
          // Dynamic ceiling prevents collapse
          dynamicRange: (c) => ({
            min: 0,
            max: parseFloat(Math.min(1.0, ((c.topRadius || 8) - 1) / 3).toFixed(2)),
            default: 0,
          }),
        },
        {
          type: 'range', key: 'rippleFreq', label: 'engines.lamp.rippleFreq',
          min: 1, max: 6, step: 1,
          condition: (c) => (c.ripple || 0) > 0,
        },
      ],
    },

    // ── Surface Texture ──────────────────────────────────────────────────
    {
      title: 'engines.lamp.surfaceTex',
      controls: [
        { type: 'style-picker', key: 'style' },
        {
          type: 'range', key: 'density', label: 'engines.lamp.density',
          min: 3, max: 36, step: 1,
          dynamicRange: (c) => STYLE_ENVELOPES[c.style]?.density,
        },
        {
          type: 'range', key: 'intensity', label: 'engines.lamp.ridgeDepth',
          min: 0.1, max: 1.5, step: 0.05,
          dynamicRange: (c) => {
            const env = STYLE_ENVELOPES[c.style];
            if (!env) return null;
            const max = Math.min(env.intensity.max, 1.0 / ((c.density || 12) / 12));
            return { min: env.intensity.min, max: parseFloat(max.toFixed(2)), default: env.intensity.default };
          },
        },
        {
          type: 'range', key: 'twist', label: 'engines.lamp.twist',
          min: -360, max: 360, step: 5,
          dynamicRange: (c) => STYLE_ENVELOPES[c.style]?.twist,
          condition: (c) => {
            const env = STYLE_ENVELOPES[c.style];
            return env && (env.twist.min !== 0 || env.twist.max !== 0);
          },
        },
      ],
    },
  ],
};
