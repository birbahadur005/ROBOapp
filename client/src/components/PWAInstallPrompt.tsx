import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export const PWAInstallPrompt: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const appDisplayName = settings.appName || settings.collegeName || 'RAVAN App';
  const appLogo = settings.appLogoUrl || settings.siteLogoUrl || settings.logoUrl;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-3">
        {appLogo ? (
          <img
            src={appLogo}
            alt={appDisplayName}
            className="w-10 h-10 rounded-xl object-cover shadow border border-slate-700 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="p-2.5 bg-blue-600 rounded-xl shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="text-left">
          <h4 className="text-sm font-bold">Install {appDisplayName}</h4>
          <p className="text-xs text-slate-300">{t('pwa_prompt', 'Fast touch & offline kiosk support.')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow transition"
        >
          {t('install_pwa', 'Install')}
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
