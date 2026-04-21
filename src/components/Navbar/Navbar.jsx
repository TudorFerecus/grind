import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Cuboid, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStore from '../../store/useStore';


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemsCount = useStore(state => state.getCartItemsCount());
  const openCart = useStore(state => state.openCart);

  const { t, i18n } = useTranslation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const switchLanguage = () => {
    const newLang = i18n.language === 'ro' ? 'en' : 'ro';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-200 shadow-sm">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl gap-2 hover:bg-transparent" onClick={closeMobileMenu}>
          <Cuboid className="text-primary" />
          <span className="font-serif font-bold text-base-content hidden sm:inline-block">Forge3D</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 font-medium gap-1">
          <li><Link to="/" className="hover:text-primary">{t('navbar.home')}</Link></li>
          <li>
            <details className="dropdown">
              <summary className="hover:text-primary">{t('navbar.categories')}</summary>
              <ul className="p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200 z-50">
                <li><Link to="/category/lampi-3d">{t('navbar.lamps3d')}</Link></li>
                <li><Link to="/category/poze-litografice">{t('navbar.lithophanes')}</Link></li>
                <li><Link to="/category/tablouri-fire">{t('navbar.stringArt')}</Link></li>
              </ul>
            </details>
          </li>
          <li>
            <details className="dropdown">
              <summary className="text-primary hover:text-primary-focus">{t('navbar.diyCustomizer')}</summary>
              <ul className="p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-200 z-50">
                <li><Link to="/customizer/lamp">{t('navbar.sculptureLamps')}</Link></li>
                <li><Link to="/customizer/lithophane">{t('navbar.litho3d')}</Link></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-1">
        <button 
          className="btn btn-ghost btn-sm sm:btn-md" 
          onClick={switchLanguage}
          title={i18n.language === 'ro' ? "Switch to English" : "Schimbă în Română"}
        >
          <Globe size={20} className="text-base-content/70" />
          <span className="text-xs font-bold uppercase">{i18n.language}</span>
        </button>
        
        <button 
          className="btn btn-ghost btn-circle" 
          onClick={openCart}
          aria-label="Deschide coșul"
        >
          <div className="indicator">
            <ShoppingCart size={20} className="text-base-content/80" />
            {cartItemsCount > 0 && (
              <span className="badge badge-sm badge-primary indicator-item">{cartItemsCount}</span>
            )}
          </div>
        </button>

        {/* Mobile menu layout */}
        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-circle" onClick={toggleMobileMenu}>
             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </label>
          {isMobileMenuOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-50 p-4 shadow-xl bg-base-100 rounded-box w-64 border border-base-200 gap-2">
              <li className="menu-title">{t('navbar.categories')}</li>
              <li><Link to="/category/lampi-3d" onClick={closeMobileMenu}>{t('navbar.lamps3d')}</Link></li>
              <li><Link to="/category/poze-litografice" onClick={closeMobileMenu}>{t('navbar.lithophanes')}</Link></li>
              <li><Link to="/category/tablouri-fire" onClick={closeMobileMenu}>{t('navbar.stringArt')}</Link></li>
              
              <div className="divider my-1"></div>
              
              <li className="menu-title text-primary">{t('navbar.diyCustomizer')}</li>
              <li><Link to="/customizer/lamp" className="text-primary font-medium" onClick={closeMobileMenu}>{t('navbar.sculptureLamps')}</Link></li>
              <li><Link to="/customizer/lithophane" className="text-primary font-medium" onClick={closeMobileMenu}>{t('navbar.litho3d')}</Link></li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
