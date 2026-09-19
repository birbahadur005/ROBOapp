import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export interface ApplicationSettings {
  // Legacy branding (preserved for full compatibility)
  collegeName: string;
  tagline: string;
  logoUrl?: string;

  // Dedicated Website / Portal settings
  siteName: string;
  siteLogoUrl?: string;

  // Dedicated PWA / Mobile / Kiosk App settings
  appName: string;
  appShortName: string;
  appLogoUrl?: string;

  themeColor: string;
  darkModeDefault: boolean;

  collegeEmail?: string;
  collegePhone?: string;
  emergencyPhone?: string;
  collegeAddress?: string;
  visitingHoursGeneral?: string;

  defaultLanguage: string;
  allowLanguageToggle: boolean;

  allowCameraPhoto: boolean;
  requireVisitorPhoto: boolean;
  requiredVisitorFields: string[];
  photoSourceMode: string;

  maxAdvanceBookingDays: number;
  appointmentLeadTimeHours: number;
  defaultSlotMinutes: number;
  allowWeekendAppointments: boolean;
  strictConflictPrevention: boolean;
  maxVisitorsPerRequest: number;

  soundAlertsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFrom?: string;

  enableAIAssistant: boolean;
  aiWelcomeMessage?: string;
  aiCustomInstructions?: string;

  kioskAutoResetSeconds: number;
  kioskShowAnnouncements: boolean;
  kioskShowCampusMap: boolean;
}

interface SettingsContextType {
  settings: ApplicationSettings;
  refreshSettings: () => Promise<void>;
  loading: boolean;
}

const defaultSettings: ApplicationSettings = {
  collegeName: 'RAVAN College Receptionist',
  tagline: 'AI Visitor & Appointment Management System',
  logoUrl: '',

  siteName: 'RAVAN College Receptionist',
  siteLogoUrl: '',

  appName: 'RAVAN College Receptionist',
  appShortName: 'RAVAN Reception',
  appLogoUrl: '',

  themeColor: '#1e3a8a',
  darkModeDefault: false,

  collegeEmail: 'info@college.edu',
  collegePhone: '+91 98765 43210',
  emergencyPhone: '+91 98765 99999',
  collegeAddress: 'Main Campus Boulevard, Knowledge Park',
  visitingHoursGeneral: '10:00 AM - 04:00 PM',

  defaultLanguage: 'en',
  allowLanguageToggle: true,

  allowCameraPhoto: true,
  requireVisitorPhoto: false,
  requiredVisitorFields: ['visitorName', 'visitorMobile', 'purpose', 'requestedDate', 'requestedTime'],
  photoSourceMode: 'ALL',

  maxAdvanceBookingDays: 14,
  appointmentLeadTimeHours: 2,
  defaultSlotMinutes: 15,
  allowWeekendAppointments: false,
  strictConflictPrevention: true,
  maxVisitorsPerRequest: 10,

  soundAlertsEnabled: true,
  browserNotificationsEnabled: true,
  emailNotificationsEnabled: false,

  enableAIAssistant: true,
  aiWelcomeMessage: 'Hello! I am your AI College Receptionist. How can I help you today?',

  kioskAutoResetSeconds: 90,
  kioskShowAnnouncements: true,
  kioskShowCampusMap: true
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ApplicationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get<{ success: boolean; settings: any }>('/admin/settings');
      if (res.success && res.settings) {
        const raw = res.settings;
        let requiredFields: string[] = defaultSettings.requiredVisitorFields;
        if (typeof raw.requiredVisitorFields === 'string') {
          try {
            requiredFields = JSON.parse(raw.requiredVisitorFields);
          } catch (e) {
            // fallback
          }
        } else if (Array.isArray(raw.requiredVisitorFields)) {
          requiredFields = raw.requiredVisitorFields;
        }

        setSettings({
          ...defaultSettings,
          ...raw,
          siteName: raw.siteName || raw.collegeName || defaultSettings.siteName,
          siteLogoUrl: raw.siteLogoUrl || raw.logoUrl || '',
          appName: raw.appName || raw.collegeName || defaultSettings.appName,
          appShortName: raw.appShortName || defaultSettings.appShortName,
          appLogoUrl: raw.appLogoUrl || raw.logoUrl || '',
          requiredVisitorFields: requiredFields
        });
      }
    } catch (e) {
      console.warn('Using default settings fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Live document title, favicon, apple-touch-icon & theme-color update
  useEffect(() => {
    const title = settings.siteName || settings.collegeName;
    if (title) {
      document.title = settings.tagline ? `${title} — ${settings.tagline}` : title;
    }
    const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const activeLogo = settings.siteLogoUrl || settings.appLogoUrl || settings.logoUrl;
    if (favicon && activeLogo) {
      favicon.href = activeLogo;
    }

    const appleTouchIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    const appIcon = settings.appLogoUrl || settings.siteLogoUrl || settings.logoUrl || '/icon-192.svg';
    if (appleTouchIcon) {
      appleTouchIcon.href = appIcon;
    }

    const appleTitle = document.querySelector<HTMLMetaElement>("meta[name='apple-mobile-web-app-title']");
    if (appleTitle && settings.appShortName) {
      appleTitle.content = settings.appShortName;
    }

    const metaTheme = document.querySelector<HTMLMetaElement>("meta[name='theme-color']");
    if (metaTheme && settings.themeColor) {
      metaTheme.content = settings.themeColor;
    }
  }, [
    settings.siteName,
    settings.collegeName,
    settings.tagline,
    settings.siteLogoUrl,
    settings.appLogoUrl,
    settings.appShortName,
    settings.logoUrl,
    settings.themeColor
  ]);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
