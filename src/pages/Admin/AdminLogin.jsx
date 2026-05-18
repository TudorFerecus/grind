import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, isAuthenticated, user, isLoading, error: storeError, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'EDITOR')) {
      navigate('/admin/products');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      const loggedInUser = await login(email, password);
      
      if (loggedInUser.role !== 'ADMIN' && loggedInUser.role !== 'EDITOR') {
        clearAuth();
        setLocalError('Acces interzis. Acest cont nu are privilegii administrative sau editoriale.');
      } else {
        navigate('/admin/products');
      }
    } catch (err) {
      setLocalError(err.message || 'Autentificarea a eșuat. Verifică datele introduse.');
    }
  };

  const displayedError = localError || storeError;

  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="card-title justify-center text-2xl font-bold mb-6">{t('admin.loginTitle')}</h2>
          
          {displayedError && (
            <div className="alert alert-error bg-error/10 border-error/20 text-error flex items-start gap-2 p-3 text-sm rounded-xl mb-4">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{displayedError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">{t('admin.username') || 'Email'}</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/40">
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  placeholder="nume@example.com"
                  className="input input-bordered w-full pl-10" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">{t('admin.password')}</span></label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/40">
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className={`btn btn-primary w-full mt-4 shadow-lg ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                t('admin.loginButton')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
