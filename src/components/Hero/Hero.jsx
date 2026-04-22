import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden w-full min-h-[85vh] flex items-center pt-24 pb-16">
      {/* Background Graphic Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-20 bg-primary/40 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* subtle grid overlay */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base-100/50 to-base-100 z-0 pointer-events-none"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10 flex flex-col items-center lg:flex-row lg:gap-12">
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="badge badge-accent badge-outline gap-2 mb-6 p-4">
            <Sparkles size={16} />
            <span className="font-medium text-accent">{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-base-content mb-6 leading-tight drop-shadow-md">
            <span className="block">{t('hero.title').split('<br />')[0]}</span>
            {t('hero.title').includes('<br />') ? (
               <span className="text-primary mt-2 block drop-shadow-[0_0_15px_rgba(212,132,90,0.3)]">{t('hero.title2')}</span>
            ) : (
               <span className="text-primary mt-2 block drop-shadow-[0_0_15px_rgba(212,132,90,0.3)]">{t('hero.title2')}</span>
            )}
          </h1>
          
          <p className="text-lg sm:text-xl text-base-content/80 mb-10 max-w-2xl leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start">
            <Link to="/customizer/lamp" className="btn btn-primary text-primary-content btn-lg shadow-[0_0_20px_-3px_rgba(212,132,90,0.4)] hover:-translate-y-1 hover:shadow-[0_0_25px_-1px_rgba(212,132,90,0.6)] transition-all">
              {t('hero.buttonCustomizer')}
              <ArrowRight size={20} />
            </Link>
            <Link to="/category/lampi-3d" className="btn btn-outline btn-primary btn-lg hover:-translate-y-1 transition-transform bg-base-200/50 backdrop-blur-sm">
              {t('hero.buttonShop')}
            </Link>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 mt-16 lg:mt-0 xl:pl-10">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group border border-base-300">
            <img 
              src="/hero-image.jpg" 
              alt="Lampă 3D Parametrică" 
              className="w-full h-[350px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
