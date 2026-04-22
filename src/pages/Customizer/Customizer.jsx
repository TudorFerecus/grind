import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Download, ShoppingCart, Activity, Shuffle, Trash2, ChevronDown, ChevronUp, Layers, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LampPreview from '../../components/3d/LampPreview'; // We will dynamically render instead, but LampPreview wraps <Canvas>.
import { exportToStl } from '../../components/3d/exportStl';
import { products } from '../../data/products';
import useStore from '../../store/useStore';
import { engines } from '../../customizers/engineRegistry';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';

const Loader3D = () => {
  const { t } = useTranslation();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold uppercase tracking-widest text-primary whitespace-nowrap">
          {t('customizer.loading')}
        </span>
      </div>
    </Html>
  );
};

const Customizer = () => {
  const { engineId } = useParams();
  const navigate = useNavigate();
  const sceneRef = useRef();
  const { t } = useTranslation();
  
  const { addToCart, openCart } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [config, setConfig] = useState({});
  const [metrics, setMetrics] = useState({ volume: 0, weight: 0 });
  const [expandedIndices, setExpandedIndices] = useState({}); // Tracking expanded items per repeater key

  // Cautam motorul (Engine-ul configuratorului curent) prin parametrul din URL
  const engine = engines[engineId];

  useEffect(() => {
    if (engine) {
      setConfig(engine.defaultState);
    }
  }, [engine]);

  // Daca nu exista engine pentru ruta data, inapoi la home
  if (!engine) {
    return <Navigate to="/" replace />;
  }

  const currentPrice = config ? engine.calculatePrice(config, engine.basePrice, metrics) : engine.basePrice;

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayItemChange = (arrayKey, index, subKey, value) => {
    setConfig(prev => {
      const newArray = [...(prev[arrayKey] || [])];
      newArray[index] = { ...newArray[index], [subKey]: value };
      return { ...prev, [arrayKey]: newArray };
    });
  };

  const handleAddArrayItem = (arrayKey, defaultValue) => {
    setConfig(prev => ({
      ...prev,
      [arrayKey]: [...(prev[arrayKey] || []), { ...defaultValue }]
    }));
    // Auto-expand the newly added item
    setExpandedIndices(prev => {
      const current = prev[arrayKey] || [];
      const newIndex = (config[arrayKey] || []).length;
      return { ...prev, [arrayKey]: [...current, newIndex] };
    });
  };

  const toggleExpand = (arrayKey, index) => {
    setExpandedIndices(prev => {
      const current = prev[arrayKey] || [];
      if (current.includes(index)) {
        return { ...prev, [arrayKey]: current.filter(i => i !== index) };
      } else {
        return { ...prev, [arrayKey]: [...current, index] };
      }
    });
  };

  const handleRemoveArrayItem = (arrayKey, index) => {
    setConfig(prev => ({
      ...prev,
      [arrayKey]: (prev[arrayKey] || []).filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleConfigChange(key, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    if (!sceneRef.current) return;
    setIsExporting(true);
    setTimeout(() => {
      exportToStl(sceneRef.current, `forge3d_${engine.id}_${Date.now()}.stl`);
      setIsExporting(false);
    }, 100);
  };

  const handleRandomize = () => {
    const newConfig = { ...config };
    const excludeKeys = ['lightOn', 'lightType', 'bulges']; // Exclude additive arrays from basic shuffle

    engine.sections.forEach(section => {
      section.controls.forEach(ctrl => {
        if (excludeKeys.includes(ctrl.key)) return;

        if (ctrl.type === 'range') {
          const range = ctrl.max - ctrl.min;
          const steps = range / ctrl.step;
          const randomStep = Math.floor(Math.random() * (steps + 1));
          let val = ctrl.min + (randomStep * ctrl.step);
          newConfig[ctrl.key] = Number(val.toFixed(5));
        } else if (ctrl.type === 'select') {
          const randIdx = Math.floor(Math.random() * ctrl.options.length);
          newConfig[ctrl.key] = ctrl.options[randIdx].value;
        } else if (ctrl.type === 'checkbox') {
          newConfig[ctrl.key] = Math.random() > 0.5;
        }
      });
    });
    setConfig(newConfig);
  };

  const handleAddToCart = () => {
    const targetCategoryId = engine.id === 'lamp' ? 'lampi-3d' : 'poze-litografice';
    const diyProduct = products.find(p => p.categoryId === targetCategoryId && p.isCustomizable);
    
    if (diyProduct) {
      const customProduct = {
        ...diyProduct,
        price: currentPrice,
        name: `${diyProduct.name} - Parametric Custom`
      };
      addToCart(customProduct, 1, config);
      openCart();
    } else {
      addToCart({
        id: `diy-${engine.id}-${Date.now()}`,
        name: `Produs Custom: ${engine.title}`,
        price: currentPrice,
        image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834b?auto=format&fit=crop&q=80&w=800'
      }, 1, config);
      openCart();
    }
  };

  const renderControl = (control, data = config, onChange = handleConfigChange) => {
    if (control.condition && !control.condition(data)) return null;

    switch (control.type) {
      case 'range':
        return (
          <div className="form-control w-full mb-4" key={control.key}>
            <div className="flex justify-between mb-1">
              <label className="text-xs font-bold text-base-content/50 uppercase tracking-tighter">{t(control.label)}</label>
              <span className="text-xs font-mono font-bold text-primary">{data[control.key]}</span>
            </div>
            <input 
              type="range" 
              min={control.min} 
              max={control.max} 
              step={control.step}
              value={data[control.key] || 0} 
              onChange={(e) => onChange(control.key, parseFloat(e.target.value))} 
              className="range range-primary range-xs"
            />
          </div>
        );
      case 'select':
        return (
          <div className="form-control w-full mb-4" key={control.key}>
            <label className="text-xs font-bold text-base-content/50 uppercase tracking-tighter mb-2">{t(control.label)}</label>
            <div className="join w-full">
              {control.options.map(opt => (
                <button
                  key={opt.value}
                  className={`btn join-item btn-xs flex-1 ${data[control.key] === opt.value ? 'btn-primary' : 'btn-outline border-base-300'}`}
                  onClick={() => onChange(control.key, opt.value)}
                >
                  {t(opt.label)}
                </button>
              ))}
            </div>
          </div>
        );
      case 'repeater':
        const items = config[control.key] || [];
        const isLimitReached = control.maxCount && items.length >= control.maxCount;
        const currentExpanded = expandedIndices[control.key] || [0]; // Default first item open
        
        return (
          <div className="space-y-4 mb-6" key={control.key}>
            <div className="flex justify-between items-center bg-base-300/30 p-3 rounded-2xl border border-base-300">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                   <Layers size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-base-content">{t(control.label)}</span>
                  {control.maxCount && (
                    <span className="text-[10px] opacity-50 font-mono">
                      {items.length} / {control.maxCount} {t('customizer.layers')}
                    </span>
                  )}
                </div>
              </div>
              <button 
                className={`btn btn-sm btn-primary rounded-xl shadow-lg hover:scale-105 transition-transform ${isLimitReached ? 'btn-disabled opacity-50' : ''}`}
                onClick={() => !isLimitReached && handleAddArrayItem(control.key, control.defaultItem)}
                disabled={isLimitReached}
              >
                <Plus size={16} />
                {t(control.addButtonLabel || 'Add')}
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const isExpanded = currentExpanded.includes(index);
                return (
                  <div key={index} className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                    {/* Header */}
                    <div 
                      className="flex justify-between items-center p-3 cursor-pointer bg-base-100 select-none hover:bg-base-200/50"
                      onClick={() => toggleExpand(control.key, index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">
                          {t(control.itemLabel || 'engines.lamp.item')} {index + 1}
                        </span>
                        {isExpanded ? <ChevronUp size={14} className="opacity-40" /> : <ChevronDown size={14} className="opacity-40" />}
                      </div>
                      
                      <button 
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveArrayItem(control.key, index);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Content */}
                    {isExpanded && (
                      <div className="p-4 border-t border-base-200 bg-base-200/20">
                        <div className="grid grid-cols-1 gap-1">
                          {control.schema.map(subCtrl => renderControl(
                            subCtrl, 
                            item, 
                            (subKey, value) => handleArrayItemChange(control.key, index, subKey, value)
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {items.length === 0 && (
                <div className="text-center py-8 bg-base-200/50 rounded-2xl border-2 border-dashed border-base-300 opacity-50 text-xs italic">
                  {t('customizer.noLayers')}
                </div>
              )}
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div className="form-control w-full mb-4" key={control.key}>
            <label className="cursor-pointer label p-0 items-center">
              <span className="text-sm font-medium text-base-content/70">{t(control.label)}</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary toggle-sm" 
                checked={!!data[control.key]} 
                onChange={(e) => onChange(control.key, e.target.checked)} 
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  const Component3D = engine.Component3D;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100svh-64px)] lg:h-[calc(100vh-64px)] w-full overflow-hidden bg-base-100">
      
      {/* Viewport 3D */}
      <div className="h-[40vh] lg:h-full lg:flex-1 relative bg-neutral shrink-0">
        <div className="absolute inset-0">
          <Canvas 
            shadows 
            dpr={[1, 2]}
            gl={{ 
              antialias: true, 
              preserveDrawingBuffer: true, 
              powerPreference: "high-performance" 
            }}
            camera={{ position: [0, 15, 30], fov: 45 }} 
            onCreated={({ scene }) => { sceneRef.current = scene; }}
          >
            <color attach="background" args={['#292524']} /> {/* Stone 800 - match Tailwind neutral object */}
            <ambientLight intensity={0.15} />
            <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow shadow-mapSize={[1024, 1024]} />
            
            <React.Suspense fallback={<Loader3D />}>
              <group position={[0, -5, 0]}>
                {Object.keys(config).length > 0 && <Component3D {...config} onMetrics={setMetrics} />}
              </group>
              <Environment preset="city" />
            </React.Suspense>
            <OrbitControls enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2 + 0.1} minDistance={15} maxDistance={80} />
          </Canvas>
        </div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="badge badge-primary gap-1 shadow-md pointer-events-auto">
            <Activity size={14} />
            {engine.id.toUpperCase()} {t('customizer.engine')}
          </div>
          <button 
            className="btn btn-sm btn-outline btn-primary bg-base-100/50 backdrop-blur pointer-events-auto shadow-md" 
            onClick={handleExport} 
            disabled={isExporting}
          >
            <Download size={16} />
            {isExporting ? t('customizer.exportingStl') : t('customizer.exportStl')}
          </button>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="flex-1 min-h-0 lg:w-96 bg-base-100 flex flex-col border-t lg:border-t-0 lg:border-l border-base-200 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="p-6 border-b border-base-200 bg-base-100 shrink-0 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-serif font-bold text-base-content mb-1">{t(engine.title)}</h1>
            <p className="text-sm text-base-content/60">{t(engine.description)}</p>
          </div>
          <button className="btn btn-circle btn-outline btn-sm text-primary shadow-sm" onClick={handleRandomize} title={t('customizer.randomize')}>
            <Shuffle size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-200/30">
          {engine.sections.map((section, idx) => (
            <div key={idx} className="bg-base-100 p-5 rounded-2xl border border-base-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b border-base-200 text-base-content">{t(section.title)}</h3>
              <div className="space-y-2">
                {section.controls.map(ctrl => renderControl(ctrl))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-base-200 bg-base-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {metrics.weight > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-base-content/60 text-xs uppercase tracking-wider">{t('customizer.estWeight')}</span>
              <span className="text-sm font-bold text-base-content/80 text-right">{metrics.weight.toFixed(0)}g PETG</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-base-content/80 text-sm uppercase tracking-wider">{t('customizer.estimatedTotal')}</span>
            <span className="text-2xl font-bold text-primary">{currentPrice} RON</span>
          </div>
          <button className="btn btn-primary btn-lg w-full shadow-md hover:-translate-y-1 transition-transform" onClick={handleAddToCart}>
            {t('customizer.saveAndBuy')}
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customizer;
