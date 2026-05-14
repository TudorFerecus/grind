/**
 * Lamp Design Constraints System
 * Guarantees every combination of parameters produces a beautiful,
 * physically printable lamp. The user has creative freedom; this
 * module silently enforces engineering limits.
 */

export const HEIGHT_MAX = 25; // cm — max printable on standard bed
export const HEIGHT_MIN = 10;

// Per-style aesthetic envelopes
export const STYLE_ENVELOPES = {
  architectural: {
    label: 'engines.lamp.fluted',
    icon: '⊞',
    density:   { min: 6,  max: 36, default: 18 },
    intensity: { min: 0.2, max: 1.2, default: 0.7 },
    twist:     { min: -180, max: 180, default: 0 },
    description: 'engines.lamp.styleArchDesc',
  },
  organic: {
    label: 'engines.lamp.organic',
    icon: '◌',
    density:   { min: 3,  max: 12, default: 6 },
    intensity: { min: 0.1, max: 1.0, default: 0.5 },
    twist:     { min: 0,  max: 0,  default: 0 },
    description: 'engines.lamp.styleOrgDesc',
  },
  spiral: {
    label: 'engines.lamp.spiral',
    icon: '◎',
    density:   { min: 4,  max: 24, default: 10 },
    intensity: { min: 0.2, max: 1.1, default: 0.6 },
    twist:     { min: -360, max: 360, default: 120 },
    description: 'engines.lamp.styleSpiDesc',
  },
  diamond: {
    label: 'engines.lamp.diamond',
    icon: '◇',
    density:   { min: 4,  max: 20, default: 8 },
    intensity: { min: 0.3, max: 1.0, default: 0.6 },
    twist:     { min: -90, max: 90, default: 0 },
    description: 'engines.lamp.styleDiaDesc',
  },
};

/**
 * Given raw parameters, return a safe (constrained) version.
 * Exposed _intensityMax so the UI can show a dynamic slider ceiling.
 */
export function constrain(config) {
  const envelope = STYLE_ENVELOPES[config.style] || STYLE_ENVELOPES.architectural;

  // Height hard cap: 25 cm
  const height = clamp(config.height ?? 22, HEIGHT_MIN, HEIGHT_MAX);

  // Density within style envelope
  const density = Math.round(
    clamp(config.density ?? envelope.density.default, envelope.density.min, envelope.density.max)
  );

  // Intensity ceiling derived from density → prevents wall self-intersection
  const intensityMax = Math.min(
    envelope.intensity.max,
    1.0 / (density / 12)
  );
  const intensity = clamp(
    config.intensity ?? envelope.intensity.default,
    envelope.intensity.min,
    intensityMax
  );

  // Twist clamped to style envelope
  const twist = clamp(
    config.twist ?? envelope.twist.default,
    envelope.twist.min,
    envelope.twist.max
  );

  // Top radius can't collapse too much relative to base
  const minTopRadius = Math.max(4, (config.baseRadius || 10) * 0.35);
  const topRadius = clamp(config.topRadius ?? 8, minTopRadius, config.baseRadius || 10);

  // Ripple: horizontal silhouette waves (0 = none, 1 = strong)
  // Max ripple amplitude is capped so the lamp never pinches to nothing
  const rippleMax = Math.min(1.0, (topRadius - 1) / 3);
  const ripple = clamp(config.ripple ?? 0, 0, rippleMax);

  // Ripple frequency: how many "rings" (1–6)
  const rippleFreq = Math.round(clamp(config.rippleFreq ?? 3, 1, 6));

  // Waist position: only meaningful for hourglass (0 = bottom, 1 = top)
  const waist = clamp(config.waist ?? 0.5, 0.15, 0.85);

  return {
    ...config,
    height,
    density,
    intensity,
    twist,
    topRadius,
    ripple,
    rippleFreq,
    waist,
    _intensityMax: intensityMax,
  };
}

export function isPrintable(config) {
  const envelope = STYLE_ENVELOPES[config.style] || STYLE_ENVELOPES.architectural;
  const maxI = Math.min(envelope.intensity.max, 1.0 / ((config.density || 12) / 12));
  return (config.intensity || 0) <= maxI * 1.05
    && (config.height || 0) <= HEIGHT_MAX;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
