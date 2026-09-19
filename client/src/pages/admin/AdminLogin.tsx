import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminLogin: React.FC = () => {
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
      if (user.role === 'SUPER_ADMIN' || user.role === 'COLLEGE_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'AUTHORITY') {
        navigate('/authority/dashboard');
      } else {
        navigate('/reception');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-left">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('admin_login', 'College Administration')}
          </h2>
          <p className="text-xs text-slate-500">
            Authorized management login for administrators and executive staff.
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
              Admin Account ID / Email
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ADMIN-001 or admin@college.edu"
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
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md text-sm flex items-center justify-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{t('sign_in', 'Sign In to Panel')}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Demo Credentials: <strong>ADMIN-001</strong> / <strong>Admin@123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
