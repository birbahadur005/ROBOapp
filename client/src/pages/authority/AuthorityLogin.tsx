import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AuthorityLogin: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(identifier.trim(), password);
      if (user.role === 'AUTHORITY') {
        navigate('/authority/dashboard');
      } else if (user.role === 'RECEPTION') {
        navigate('/reception');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('authority_login', 'Authority Login')}
          </h2>
          <p className="text-xs text-slate-500">
            Sign in with your official account ID (e.g. DIRECTOR-001) or email.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('account_id', 'Account ID or Email')}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="DIRECTOR-001 or name@college.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('password', 'Password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{t('sign_in', 'Sign In')}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Demo Authority Accounts: DIRECTOR-001 (Director@123), PRINCIPAL-001 (Principal@123), CSE-HOD-001 (Hod@123)
          </p>
        </div>
      </div>
    </div>
  );
};
