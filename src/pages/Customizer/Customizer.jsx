import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Download, ShoppingCart, Activity, Shuffle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LampPreview from '../../components/3d/LampPreview'; // We will dynamically render instead, but LampPreview wraps <Canvas>.
import { exportToStl } from '../../components/3d/exportStl';
import { products } from '../../data/products';
import useStore from '../../store/useStore';
import { engines } from '../../customizers/engineRegistry';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';

const Customizer = () => {
  const { engineId } = useParams();
  const navigate = useNavigate();
  const sceneRef = useRef();
  const { t } = useTranslation();
  
  const { addToCart, openCart } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [config, setConfig] = useState({});
  const [metrics, setMetrics] = useState({ volume: 0, weight: 0 });

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
    engine.sections.forEach(section => {
      section.controls.forEach(ctrl => {
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
      // Fallback
      addToCart({
        id: `diy-${engine.id}-${Date.now()}`,
        name: `Produs Custom: ${engine.title}`,
        price: currentPrice,
        image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834b?auto=format&fit=crop&q=80&w=800'
      }, 1, config);
      openCart();
    }
  };

  const renderControl = (control) => {
    if (control.condition && !control.condition(config)) return null;

    switch (control.type) {
      case 'range':
        return (
          <div className="form-control w-full mb-4" key={control.key}>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-base-content/70">{t(control.label)}</label>
              <span className="text-sm font-bold text-primary">{config[control.key]}</span>
            </div>
            <input 
              type="range" 
              min={control.min} 
              max={control.max} 
              step={control.step}
              value={config[control.key] || 0} 
              onChange={(e) => handleConfigChange(control.key, parseFloat(e.target.value))} 
              className="range range-primary range-sm"
            />
          </div>
        );
      case 'select':
        return (
          <div className="form-control w-full mb-4" key={control.key}>
            <label className="text-sm font-medium text-base-content/70 mb-2">{t(control.label)}</label>
            <div className="join w-full">
              {control.options.map(opt => (
                <button
                  key={opt.value}
                  className={`btn join-item flex-1 ${config[control.key] === opt.value ? 'btn-primary' : 'btn-outline border-base-300'}`}
                  onClick={() => handleConfigChange(control.key, opt.value)}
                >
                  {t(opt.label)}
                </button>
              ))}
            </div>
          </div>
        );
      case 'imageUpload':
        return (
           <div className="form-control w-full mb-4" key={control.key}>
             <label className="text-sm font-medium text-base-content/70 mb-2">{t(control.label)}</label>
             <input 
               type="file" 
               accept="image/png, image/jpeg, image/jpg" 
               onChange={(e) => handleImageUpload(e, control.key)}
               className="file-input file-input-bordered file-input-primary w-full max-w-xs"
             />
             {config[control.key] && (
               <img src={config[control.key]} alt="Preview" className="mt-4 w-full h-32 object-contain bg-base-200 rounded-box border border-base-300" />
             )}
           </div>
        );
      case 'checkbox':
        return (
          <div className="form-control w-full mb-4" key={control.key}>
            <label className="cursor-pointer label p-0 items-center">
              <span className="text-sm font-medium text-base-content/70">{t(control.label)}</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={!!config[control.key]} 
                onChange={(e) => handleConfigChange(control.key, e.target.checked)} 
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-base-100">
      
      {/* Viewport 3D */}
      <div className="flex-1 relative bg-neutral min-h-[50vh] lg:min-h-0">
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
            
            <React.Suspense fallback={null}>
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
      <div className="w-full lg:w-96 bg-base-100 flex flex-col border-t lg:border-t-0 lg:border-l border-base-200 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] lg:shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="p-6 border-b border-base-200 bg-base-100 shrink-0 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-serif font-bold text-base-content mb-1">{t(engine.title)}</h1>
            <p className="text-sm text-base-content/60">{t(engine.description)}</p>
          </div>
          <button className="btn btn-circle btn-outline btn-sm text-primary shadow-sm" onClick={handleRandomize} title="Randomize Parameters">
            <Shuffle size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-200/30">
          {engine.sections.map((section, idx) => (
            <div key={idx} className="bg-base-100 p-5 rounded-2xl border border-base-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 pb-2 border-b border-base-200 text-base-content">{t(section.title)}</h3>
              <div className="space-y-2">
                {section.controls.map(renderControl)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-base-200 bg-base-100 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {metrics.weight > 0 && (
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-base-content/60 text-xs uppercase tracking-wider">Est. Weight</span>
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
