import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Download, ShoppingCart, Shuffle, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';

import { exportToStl } from '../../components/3d/exportStl';
import { api } from '../../api/client';
import useStore from '../../store/useStore';
import { engines } from '../../customizers/engineRegistry';
import { STYLE_ENVELOPES, constrain, isPrintable } from '../../customizers/lampConstraints';

// ─── 3D Loader ───────────────────────────────────────────────────────────────
const Loader3D = () => (
  <Html center>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-primary/80 whitespace-nowrap">
        Generating…
      </span>
    </div>
  </Html>
);

// ─── Style Picker Card ────────────────────────────────────────────────────────
const StylePicker = ({ value, onChange, t }) => (
  <div className="grid grid-cols-2 gap-2 mb-2">
    {Object.entries(STYLE_ENVELOPES).map(([key, env]) => (
      <button
        key={key}
        onClick={() => onChange('style', key)}
        className={`
          flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left
          ${value === key
            ? 'border-primary bg-primary/10 shadow-md'
            : 'border-base-200 hover:border-primary/40 bg-base-100'}
        `}
      >
        <span className="text-xl leading-none">{env.icon}</span>
        <span className={`text-xs font-bold ${value === key ? 'text-primary' : 'text-base-content'}`}>
          {t(env.label)}
        </span>
      </button>
    ))}
  </div>
);

// ─── Dynamic Range Slider ─────────────────────────────────────────────────────
const DynamicSlider = ({ control, config, onChange, t }) => {
  const range = control.dynamicRange ? control.dynamicRange(config) : null;
  const min   = range?.min  ?? control.min;
  const max   = range?.max  ?? control.max;
  const step  = control.step;
  const val   = config[control.key] ?? ((min + max) / 2);
  // Clamp display value within current dynamic bounds
  const displayVal = Math.min(max, Math.max(min, val));

  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wide">
          {t(control.label)}
        </label>
        <span className="text-xs font-mono font-bold text-primary tabular-nums">
          {displayVal % 1 === 0 ? displayVal : displayVal.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayVal}
        onChange={(e) => onChange(control.key, parseFloat(e.target.value))}
        className="range range-primary range-xs w-full"
      />
      {/* Dynamic bounds label */}
      <div className="flex justify-between text-[9px] text-base-content/30 font-mono mt-0.5 px-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
};

// ─── Printability Badge ───────────────────────────────────────────────────────
const PrintBadge = ({ config, t }) => {
  const ok = isPrintable(config);
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors
      ${ok ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}
    >
      {ok
        ? <><CheckCircle size={12} /> Printabil</>
        : <><AlertCircle size={12} /> Ajustat automat</>
      }
    </div>
  );
};

// ─── Customizer ───────────────────────────────────────────────────────────────
const Customizer = () => {
  const { engineId } = useParams();
  const { t } = useTranslation();
  const { addToCart, openCart } = useStore();
  const sceneRef = useRef();

  const engine = engines[engineId];
  if (!engine) return <Navigate to="/" replace />;

  const [rawConfig, setRawConfig] = useState(engine.defaultState);
  const [metrics,   setMetrics]   = useState({ weight: 0 });
  const [price,     setPrice]     = useState(engine.basePrice);
  const [isSaving,  setIsSaving]  = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Apply constraints to get the safe config that flows into 3D
  const config = useMemo(() => constrain(rawConfig), [rawConfig]);

  // ── Config change handler — always writes to raw, constraints applied in memo
  const handleChange = useCallback((key, value) => {
    setRawConfig(prev => {
      const next = { ...prev, [key]: value };
      // When style changes, snap tuning params to that style's defaults
      if (key === 'style') {
        const env = STYLE_ENVELOPES[value];
        if (env) {
          next.density   = env.density.default;
          next.intensity = env.intensity.default;
          next.twist     = env.twist.default;
        }
      }
      return next;
    });
  }, []);

  // ── Debounced backend price calc (400ms)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const result = await api.designs.calculatePrice(engine.id, config);
        setPrice(result.price ?? engine.basePrice);
      } catch {
        // Fallback to local estimate
        setPrice(engine.calculatePrice(config, engine.basePrice, metrics));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [config]);

  // ── Randomize (within style envelope)
  const handleRandomize = () => {
    const env = STYLE_ENVELOPES[rawConfig.style] || STYLE_ENVELOPES.architectural;
    const profiles = ['cylinder', 'hourglass', 'teardrop'];
    setRawConfig(prev => ({
      ...prev,
      profile:    profiles[Math.floor(Math.random() * profiles.length)],
      height:     Math.round((12 + Math.random() * 14) * 2) / 2,
      baseRadius: parseFloat((7 + Math.random() * 4).toFixed(1)),
      topRadius:  parseFloat((4 + Math.random() * 6).toFixed(1)),
      density:    Math.round(env.density.min + Math.random() * (env.density.max - env.density.min)),
      intensity:  parseFloat((env.intensity.min + Math.random() * (env.intensity.max - env.intensity.min)).toFixed(2)),
      twist:      env.twist.max !== 0
        ? Math.round((env.twist.min + Math.random() * (env.twist.max - env.twist.min)) / 5) * 5
        : 0,
    }));
  };

  // ── STL Export
  const handleExport = () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    setTimeout(() => {
      exportToStl(sceneRef.current, `forge3d_lamp_${Date.now()}.stl`);
      setIsExporting(false);
    }, 100);
  };

  // ── Add to Cart
  const handleAddToCart = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const saved = await api.designs.save(engine.id, config);
      const products = await api.products.getAll({ categoryId: 'lampi-3d', isCustomizable: true });
      const product  = products[0];
      if (product) {
        addToCart({ ...product, price: saved.calculatedPrice || price }, 1, saved.id);
      } else {
        addToCart({ id: `diy-lamp`, name: t('product.diyAvailable'), price }, 1, saved.id);
      }
      openCart();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render a single control
  const renderControl = (ctrl) => {
    if (ctrl.condition && !ctrl.condition(config)) return null;

    switch (ctrl.type) {
      case 'style-picker':
        return <StylePicker key="style-picker" value={config.style} onChange={handleChange} t={t} />;

      case 'range':
        return <DynamicSlider key={ctrl.key} control={ctrl} config={config} onChange={handleChange} t={t} />;

      case 'select':
        return (
          <div key={ctrl.key} className="mb-4">
            <label className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wide block mb-2">
              {t(ctrl.label)}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {ctrl.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleChange(ctrl.key, opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${config[ctrl.key] === opt.value
                      ? 'bg-primary text-primary-content border-primary shadow-sm'
                      : 'border-base-300 text-base-content/70 hover:border-primary/50'}`}
                >
                  {t(opt.label)}
                </button>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label key={ctrl.key} className="flex items-center justify-between mb-4 cursor-pointer">
            <span className="text-sm font-medium text-base-content/70">{t(ctrl.label)}</span>
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={!!config[ctrl.key]}
              onChange={(e) => handleChange(ctrl.key, e.target.checked)}
            />
          </label>
        );

      default:
        return null;
    }
  };

  const Component3D = engine.Component3D;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100svh-64px)] lg:h-[calc(100vh-64px)] w-full overflow-hidden">

      {/* ── 3D Viewport ────────────────────────────────────────────────────── */}
      <div className="h-[45vh] lg:h-full lg:flex-1 relative bg-[#111]">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
          camera={{ position: [0, config.height * 0.6, config.height * 1.8], fov: 38 }}
          onCreated={({ scene }) => { sceneRef.current = scene; }}
        >
          <color attach="background" args={['#111111']} />
          <ambientLight intensity={0.25} />
          <spotLight position={[15, 40, 20]} angle={0.2} penumbra={1} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-15, 8, -15]} intensity={0.8} color="#6699ff" />

          <React.Suspense fallback={<Loader3D />}>
            <group position={[0, -(config.height || 20) / 2, 0]}>
              <Component3D {...config} onMetrics={setMetrics} />
            </group>
            <Environment preset="studio" />
            <ContactShadows
              position={[0, -(config.height || 20) / 2 - 0.3, 0]}
              opacity={0.5} scale={50} blur={2.5} far={12}
            />
          </React.Suspense>

          <OrbitControls
            enablePan={false}
            minPolarAngle={Math.PI * 0.15}
            maxPolarAngle={Math.PI * 0.55}
            minDistance={20}
            maxDistance={120}
            makeDefault
          />
        </Canvas>

        {/* Viewport overlays */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          <PrintBadge config={config} t={t} />
          <button
            className="pointer-events-auto btn btn-xs btn-ghost bg-black/30 backdrop-blur text-white border-white/10 hover:bg-black/50 gap-1.5"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download size={13} />
            {isExporting ? 'STL…' : 'Export STL'}
          </button>
        </div>
      </div>

      {/* ── Controls Panel ──────────────────────────────────────────────────── */}
      <div className="
        flex-shrink-0 lg:w-[340px] xl:w-[380px]
        flex flex-col
        bg-base-100 border-t lg:border-t-0 lg:border-l border-base-200
        overflow-hidden
      ">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-base-200 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-base-content leading-tight">{t(engine.title)}</h1>
            <p className="text-xs text-base-content/40 mt-0.5">{t(engine.description)}</p>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost text-primary"
            onClick={handleRandomize}
            title={t('customizer.randomize')}
          >
            <Shuffle size={16} />
          </button>
        </div>

        {/* Scrollable controls */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {engine.sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-base-content/30 mb-3">
                {t(section.title)}
              </h3>
              {section.controls.map(ctrl => renderControl(ctrl))}
            </div>
          ))}
        </div>

        {/* Footer — weight + price + CTA */}
        <div className="shrink-0 px-5 py-4 border-t border-base-200 bg-base-100 space-y-3">
          {/* Metrics row */}
          <div className="flex justify-between text-xs text-base-content/50">
            <span>{t('customizer.estWeight')}:</span>
            <span className="font-mono font-semibold text-base-content/70">
              {metrics.weight > 0 ? `${metrics.weight.toFixed(0)} g PETG` : '—'}
            </span>
          </div>

          {/* Price */}
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-base-content/60">{t('customizer.estimatedTotal')}</span>
            <span className="text-2xl font-bold text-primary tabular-nums">{price} RON</span>
          </div>

          {/* CTA */}
          <button
            className={`btn btn-primary w-full shadow-md hover:-translate-y-0.5 transition-transform ${isSaving ? 'loading' : ''}`}
            onClick={handleAddToCart}
            disabled={isSaving}
          >
            {!isSaving && <ShoppingCart size={18} />}
            {t('customizer.saveAndBuy')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
