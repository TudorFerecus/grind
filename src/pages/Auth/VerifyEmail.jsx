import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight, Cuboid } from 'lucide-react';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, isLoading } = useAuthStore();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  // Resend states
  const [resendEmail, setResendEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage(t('auth.errRequired'));
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || t('auth.errRequired'));
      }
    };

    performVerification();
  }, [location.search, verifyEmail, t]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);

    try {
      await resendVerification(resendEmail);
      setResendSuccess(true);
    } catch (err) {
      setResendError(err.message || 'Trimiterea a eșuat.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-base-200 via-base-100 to-base-200 px-4 py-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="card w-full max-w-md bg-base-100/70 backdrop-blur-md shadow-2xl border border-base-200/50">
        <div className="card-body p-8 sm:p-10 text-center">
          {/* Header Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl mb-3 shadow-inner">
              <Cuboid size={32} />
            </div>
            <h2 className="card-title text-2xl font-bold text-base-content">{t('auth.verifyTitle')}</h2>
          </div>

          {/* VERIFYING STATE */}
          {status === 'verifying' && (
            <div className="flex flex-col items-center py-6 space-y-4">
              <Loader2 size={48} className="animate-spin text-primary" />
              <p className="text-base-content/70 font-medium">{t('auth.verifySubtitle')}</p>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="flex flex-col items-center py-4 space-y-6">
              <div className="p-4 bg-success/10 text-success rounded-full animate-bounce">
                <CheckCircle2 size={56} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-base-content">{t('auth.verifySuccessTitle')}</h3>
                <p className="text-sm text-base-content/60 px-2 leading-relaxed">
                  {t('auth.verifySuccessSubtitle')}
                </p>
              </div>
              <Link
                to="/"
                className="btn btn-primary w-full gap-2 rounded-xl mt-4 font-bold shadow-lg shadow-primary/20"
              >
                {t('auth.verifyExplore')}
                <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="flex flex-col items-center py-2 space-y-6">
              <div className="p-4 bg-error/10 text-error rounded-full">
                <XCircle size={56} />
              </div>
              <div className="space-y-2 w-full">
                <h3 className="text-xl font-bold text-base-content">{t('auth.verifyErrorTitle')}</h3>
                <div className="alert alert-error bg-error/10 border-error/20 text-error text-xs rounded-xl p-3 inline-block w-full">
                  {errorMessage}
                </div>
              </div>

              {/* Resend Verification Form */}
              <div className="w-full border-t border-base-200/60 pt-6 mt-4">
                <form onSubmit={handleResend} className="space-y-3 text-left">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-semibold text-xs uppercase tracking-wider">
                        {t('auth.verifyResendPlaceholder')}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-base-content/40">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        className="input input-bordered input-sm w-full pl-9 bg-base-100/50 focus:bg-base-100 transition-all rounded-lg"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        required
                        disabled={resendLoading}
                      />
                    </div>
                  </div>

                  {resendSuccess && (
                    <p className="text-xs text-success font-semibold">
                      {t('auth.verifyResendSuccess')}
                    </p>
                  )}

                  {resendError && (
                    <p className="text-xs text-error font-semibold">
                      {resendError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm w-full gap-2 rounded-lg font-bold shadow-md shadow-secondary/15"
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t('auth.verifyResendBtn')
                    )}
                  </button>
                </form>
              </div>

              <Link
                to="/login"
                className="link link-primary text-sm font-bold mt-2"
              >
                {t('auth.loginButton')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
