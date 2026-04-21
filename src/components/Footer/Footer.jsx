import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Globe, Mail, Cuboid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-neutral text-neutral-content pt-16 pb-8 border-t border-neutral-focus">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Cuboid className="text-primary" size={28} />
              <span className="text-2xl font-serif font-bold text-base-100">Forge3D</span>
            </Link>
            <p className="text-neutral-content/70 leading-relaxed mb-4">
              {t('footer.desc')}
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Camera" className="text-neutral-content/60 hover:text-primary transition-colors"><Camera size={24} /></a>
              <a href="#" aria-label="Globe" className="text-neutral-content/60 hover:text-primary transition-colors"><Globe size={24} /></a>
              <a href="#" aria-label="Email" className="text-neutral-content/60 hover:text-primary transition-colors"><Mail size={24} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold text-base-100 mb-6 uppercase tracking-wider">{t('navbar.categories')}</h4>
            <ul className="space-y-3 font-medium">
              <li><Link to="/category/lampi-3d" className="text-neutral-content/70 hover:text-primary transition-colors">{t('navbar.lamps3d')}</Link></li>
              <li><Link to="/category/poze-litografice" className="text-neutral-content/70 hover:text-primary transition-colors">{t('navbar.lithophanes')}</Link></li>
              <li><Link to="/category/tablouri-fire" className="text-neutral-content/70 hover:text-primary transition-colors">{t('navbar.stringArt')}</Link></li>
              <li><Link to="/customizer/lamp" className="text-primary hover:text-primary-focus transition-colors">{t('navbar.sculptureLamps')}</Link></li>
              <li><Link to="/customizer/lithophane" className="text-primary hover:text-primary-focus transition-colors">{t('navbar.litho3d')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-base-100 mb-6 uppercase tracking-wider">{t('footer.links')}</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Despre Noi</a></li>
              <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Întrebări Frecvente</a></li>
              <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Livrare și Retur</a></li>
              <li><a href="#" className="text-neutral-content/70 hover:text-primary transition-colors">Termeni și Condiții</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-base-100 mb-6 uppercase tracking-wider">Fii la curent</h4>
            <p className="text-neutral-content/70 mb-4">Abonează-te pentru a afla despre noile lansări și reduceri.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Adresa ta de email" className="input input-bordered w-full bg-neutral-focus text-base-100 border-neutral focus:border-primary" required />
              <button type="submit" className="btn btn-primary w-full shadow-md">Abonează-te</button>
            </form>
          </div>

        </div>
        
        <div className="pt-8 border-t border-neutral-focus text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-content/60 text-sm">&copy; {new Date().getFullYear()} Forge3D. {t('footer.allRights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
