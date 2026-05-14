import React, { useState } from 'react';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminLogin = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.auth.login({ username, password });
      localStorage.setItem('adminToken', res.token);
      navigate('/admin/products');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
          
          {error && (
            <div className="alert alert-error text-sm py-2 mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">{t('admin.username')}</span></label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">{t('admin.password')}</span></label>
              <input 
                type="password" 
                className="input input-bordered w-full" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className={`btn btn-primary w-full mt-4 shadow-lg ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {t('admin.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
