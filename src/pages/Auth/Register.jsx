import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, AlertCircle, ArrowRight, UserPlus, Cuboid } from 'lucide-react';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, googleLogin, isAuthenticated, isLoading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const [registered, setRegistered] = useState(false);

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Google OAuth Initialization
  useEffect(() => {
    let interval;

    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.warn("VITE_GOOGLE_CLIENT_ID is not set in environment.");
        return;
      }

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              setLocalError(null);
              await googleLogin(response.credential);
            } catch (err) {
              console.error("Google register failed", err);
            }
          },
          cancel_on_tap_outside: true,
        });

        // Render the Google Button
        const btnContainer = document.getElementById('google-signin-btn');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.offsetWidth || 340,
            text: 'signup_with',
            shape: 'rectangular',
          });
        }

        // Display One-Tap prompt
        window.google.accounts.id.prompt();
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          initGoogle();
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [googleLogin]);

  // Form Validation
  const validateForm = () => {
    if (!name || !email || !password) {
      setLocalError(t('auth.errRequired'));
      return false;
    }

    if (name.length < 2) {
      setLocalError(t('auth.errNameLength'));
      return false;
    }

    // Email pattern regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError(t('auth.errEmailInvalid'));
      return false;
    }

    if (password.length < 8) {
      setLocalError(t('auth.errPasswordLength'));
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setLocalError(t('auth.errPasswordUpper'));
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setLocalError(t('auth.errPasswordDigit'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) return;

    try {
      await register(name, email, password);
      setRegistered(true);
    } catch (err) {
      // Error handled by store
    }
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="card w-full max-w-md bg-base-100/70 backdrop-blur-md shadow-2xl border border-base-200/50">
        <div className="card-body p-8 sm:p-10">
          {registered ? (
            <div className="flex flex-col items-center py-6 text-center space-y-6">
              <div className="p-4 bg-primary/10 text-primary rounded-full animate-bounce">
                <Mail size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-base-content">{t('auth.registerSuccessTitle')}</h3>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  {t('auth.registerSuccessSubtitle')}
                </p>
              </div>
              <Link
                to="/login"
                className="btn btn-primary w-full gap-2 rounded-xl mt-4 font-bold shadow-lg shadow-primary/20"
              >
                {t('auth.registerSuccessBtn')}
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-5">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl mb-3 shadow-inner">
              <Cuboid size={32} />
            </div>
            <h2 className="card-title text-2xl font-bold text-base-content">{t('auth.register')}</h2>
            <p className="text-sm text-base-content/60 mt-1">{t('auth.registerSubtitle')}</p>
          </div>

          {/* Error Alert */}
          {displayedError && (
            <div className="alert alert-error bg-error/10 border-error/20 text-error flex items-start gap-2 p-3 text-sm rounded-xl mb-4">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{displayedError}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider">{t('auth.name')}</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/40">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Popescu Ion"
                  className="input input-bordered w-full pl-10 bg-base-100/50 focus:bg-base-100 transition-all rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider">{t('auth.email')}</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/40">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="input input-bordered w-full pl-10 bg-base-100/50 focus:bg-base-100 transition-all rounded-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs uppercase tracking-wider">{t('auth.password')}</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/40">
                  <Lock size={18} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 bg-base-100/50 focus:bg-base-100 transition-all rounded-xl"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <label className="label py-1.5">
                <span className="label-text-alt text-base-content/50 leading-snug">
                  {t('auth.passwordRequirement')}
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2 rounded-xl mt-2 font-bold shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <UserPlus size={18} />
                  {t('auth.register')}
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-xs uppercase tracking-widest text-base-content/40 my-5">{t('auth.or')}</div>

          {/* Google Sign In Container */}
          <div className="flex flex-col items-center">
            <div id="google-signin-btn" className="w-full flex justify-center min-h-[44px]"></div>
          </div>

          {/* Footer Link */}
          <div className="text-center mt-6 text-sm text-base-content/70">
            <span>{t('auth.haveAccount')} </span>
            <Link
              to="/login"
              className="link link-primary font-bold inline-flex items-center gap-0.5 hover:gap-1 transition-all"
            >
              {t('auth.loginButton')}
              <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
      </div>
    </div>
  );
};

export default Register;
