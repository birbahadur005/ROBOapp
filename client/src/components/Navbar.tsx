import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Shield, User, LogOut, Radio, Menu, X, Landmark } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSettings } from '../context/SettingsContext';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & College Name */}
          <Link to="/" className="flex items-center gap-3 group">
            {(settings.siteLogoUrl || settings.logoUrl) ? (
              <img
                src={settings.siteLogoUrl || settings.logoUrl}
                alt={settings.siteName || settings.collegeName}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {settings.siteName || settings.collegeName}
              </h1>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {settings.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Live Status Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}>
              <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse text-emerald-500' : 'text-amber-500'}`} />
              <span>{isConnected ? t('connection_online', 'Live Connected') : t('connection_offline', 'Reconnecting...')}</span>
            </div>

            {/* Language Switcher */}
            {settings.allowLanguageToggle !== false && (
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>{language === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
              </button>
            )}

            {/* Public Links */}
            <Link
              to="/track"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('track_appointment', 'Track Status')}
            </Link>

            {/* Role specific or Auth buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to={
                    user.role === 'AUTHORITY'
                      ? '/authority/dashboard'
                      : user.role === 'RECEPTION'
                      ? '/reception'
                      : '/admin'
                  }
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 transition"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{user.accountId} ({user.role})</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title={t('sign_out', 'Sign Out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/authority/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
                >
                  {t('authority_login', 'Authority Login')}
                </Link>
                <Link
                  to="/admin/login"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl hover:opacity-90 transition"
                >
                  {t('admin_login', 'Admin Login')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {settings.allowLanguageToggle !== false && (
              <button
                onClick={toggleLanguage}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
              >
                {language === 'en' ? 'हिन्दी' : 'EN'}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2 bg-white dark:bg-slate-900">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('welcome', 'Home')}
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('track_appointment', 'Track Appointment')}
          </Link>
          <Link
            to="/authorities"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('meet_authority', 'Meet an Authority')}
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to={
                  user.role === 'AUTHORITY'
                    ? '/authority/dashboard'
                    : user.role === 'RECEPTION'
                    ? '/reception'
                    : '/admin'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
              >
                {t('dashboard', 'Dashboard')} ({user.accountId})
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-rose-600 font-medium"
              >
                {t('sign_out', 'Sign Out')}
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to="/authority/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-300"
              >
                {t('authority_login', 'Authority Login')}
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-center"
              >
                {t('admin_login', 'Admin Login')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
