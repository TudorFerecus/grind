import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, LogOut, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

const AdminLayout = () => {
  const { t } = useTranslation();
  const token = localStorage.getItem('adminToken');
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-base-200">
      <aside className="w-64 bg-base-100 shadow-md flex flex-col hidden md:flex">
        <div className="p-4 border-b border-base-200">
          <h2 className="text-xl font-bold text-primary">Forge3D Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/admin/products" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname.includes('/products') || location.pathname === '/admin' ? 'bg-primary text-primary-content font-semibold shadow-md' : 'hover:bg-base-200 text-base-content/70'}`}
          >
            <Package size={20} />
            {t('admin.productsTitle')}
          </Link>
          <Link 
            to="/admin/orders" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname.includes('/orders') ? 'bg-primary text-primary-content font-semibold shadow-md' : 'hover:bg-base-200 text-base-content/70'}`}
          >
            <ShoppingBag size={20} />
            {t('admin.ordersTitle')}
          </Link>
          
          {user?.role === 'ADMIN' && (
            <Link 
              to="/admin/users" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname.includes('/users') ? 'bg-primary text-primary-content font-semibold shadow-md' : 'hover:bg-base-200 text-base-content/70'}`}
            >
              <Users size={20} />
              {t('admin.usersTitle') || 'Users'}
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-base-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-error hover:bg-error/10 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {t('admin.logout')}
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
