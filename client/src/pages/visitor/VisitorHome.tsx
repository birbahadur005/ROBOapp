import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Info,
  MapPin,
  GraduationCap,
  Bell,
  PhoneCall,
  Search,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  Bot
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { api } from '../../services/api';
import { resolveAssetUrl } from '../../utils/assets';

export const VisitorHome: React.FC = () => {
  const { settings } = useSettings();
  const { t, language } = useLanguage();

  // Quick AI Assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    setAiLoading(true);
    try {
      const res = await api.post<{ success: boolean; answer: string }>('/ai/ask', {
        question: aiQuery.trim(),
        language
      });
      if (res.success && res.answer) {
        setAiResponse(res.answer);
      }
    } catch (err: any) {
      setAiResponse(language === 'hi'
        ? 'माफ़ कीजिए, अभी AI सहायक उपलब्ध नहीं है। कृपया रिसेप्शन से संपर्क करें।'
        : 'AI Assistant temporarily unavailable. Please contact the reception desk.');
    } finally {
      setAiLoading(false);
    }
  };

  // Idle timer auto-reset for kiosk display
  React.useEffect(() => {
    if (!settings.kioskAutoResetSeconds || settings.kioskAutoResetSeconds <= 0) return;

    let timer: any;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setAiQuery('');
        setAiResponse(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, settings.kioskAutoResetSeconds * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [settings.kioskAutoResetSeconds]);

  const allReceptionActions = [
    {
      to: '/authorities',
      title: t('meet_authority', 'Meet an Authority'),
      description: 'Schedule a visit with Director, Principal, HODs, or Faculty',
      icon: Users,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Popular',
      visible: true
    },
    {
      to: '/departments',
      title: t('find_department', 'Find Department'),
      description: 'Directory of academic & administrative departments',
      icon: Building2,
      color: 'from-indigo-600 to-violet-700',
      visible: true
    },
    {
      to: '/college-info',
      title: t('college_info', 'College Information'),
      description: 'Knowledge base, office timings & facilities',
      icon: Info,
      color: 'from-sky-600 to-cyan-700',
      visible: true
    },
    {
      to: '/campus-map',
      title: t('campus_map', 'Campus Map'),
      description: 'Interactive map, buildings, rooms & parking locations',
      icon: MapPin,
      color: 'from-emerald-600 to-teal-700',
      visible: settings.kioskShowCampusMap !== false
    },
    {
      to: '/college-info?category=ADMISSION',
      title: t('admissions', 'Admissions'),
      description: 'Courses, eligibility, fee structure & counseling',
      icon: GraduationCap,
      color: 'from-amber-600 to-orange-700',
      visible: true
    },
    {
      to: '/announcements',
      title: t('notices', 'Notices / Announcements'),
      description: 'Important circulars & digital notice board',
      icon: Bell,
      color: 'from-rose-600 to-pink-700',
      visible: settings.kioskShowAnnouncements !== false
    },
    {
      to: '/college-info?category=EMERGENCY',
      title: t('contact_reception', 'Contact Reception'),
      description: 'Helpline, emergency contacts & administrative support',
      icon: PhoneCall,
      color: 'from-purple-600 to-indigo-800',
      visible: true
    }
  ];

  const receptionActions = allReceptionActions.filter((a) => a.visible);

  const hasCustomBg = settings.backgroundType && settings.backgroundType !== 'default';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Hero Banner */}
      <div className={`relative overflow-hidden text-white rounded-3xl p-8 sm:p-12 shadow-2xl border text-center space-y-4 transition-all ${
        hasCustomBg
          ? 'bg-gradient-to-br from-slate-950/85 via-blue-950/75 to-slate-950/85 backdrop-blur-xl border-white/20'
          : 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-blue-900/40'
      }`}>
        {/* Logo Avatar Badge */}
        <div className="flex justify-center mb-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60 blur group-hover:opacity-100 transition duration-500"></div>
            <img
              src={resolveAssetUrl(settings.siteLogoUrl || settings.logoUrl || 'logo.png')}
              alt={settings.collegeName}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-blue-400/40 p-1 bg-slate-950/80 shadow-2xl"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full ring-2 ring-slate-900 shadow-md" title="Kiosk System Ready">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" /> {settings.heroBadgeText || 'Digital Reception Kiosk'}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          {settings.welcomeHeading ? settings.welcomeHeading : t('welcome', 'Welcome to')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
            {settings.collegeName}
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base font-medium">
          {settings.tagline}
        </p>

        {/* Global Track Status Quick Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/track"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            <span>{t('track_appointment', 'Track Appointment Status')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/authorities"
            className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition flex items-center justify-center gap-2 text-sm sm:text-base border border-white/20"
          >
            <span>{t('meet_authority', 'Meet an Authority')}</span>
          </Link>
        </div>
      </div>

      {/* 7 Touch Actions Grid */}
      <div>
        <div className="text-left mb-4">
          <h2 className={`text-xl font-bold ${hasCustomBg ? 'text-white drop-shadow' : 'text-slate-900 dark:text-white'}`}>
            College Reception Services
          </h2>
          <p className={`text-xs ${hasCustomBg ? 'text-slate-300' : 'text-slate-500'}`}>
            Touch any option below for assistance or booking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {receptionActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.to}
                className={`group relative border rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left flex flex-col justify-between overflow-hidden ${
                  hasCustomBg
                    ? 'bg-slate-900/75 backdrop-blur-md border-white/15 hover:bg-slate-900/90 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${action.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold transition-colors ${hasCustomBg ? 'text-white group-hover:text-blue-300' : 'text-slate-900 dark:text-white group-hover:text-blue-600'}`}>
                      {action.title}
                    </h3>
                    <p className={`text-xs mt-1 line-clamp-2 ${hasCustomBg ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {action.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grounded Gemini AI Receptionist Interactive Box */}
      {settings.enableAIAssistant !== false && (
        <div className={`border rounded-3xl p-6 sm:p-8 text-left shadow-md transition-all ${
          hasCustomBg
            ? 'bg-slate-900/80 backdrop-blur-xl border-white/15 text-white'
            : 'bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-blue-900/10 dark:bg-slate-900/80 border-blue-200 dark:border-blue-900/60'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {t('ask_ai', 'Ask AI Receptionist')}
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  Powered by Gemini
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.aiWelcomeMessage || 'Ask any question about departments, admissions, exams, faculty, or visiting instructions.'}
              </p>
            </div>
          </div>

        <form onSubmit={handleAskAI} className="mt-4 flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            placeholder={t('ai_placeholder', 'Where is the examination department? / Principal se milna hai...')}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
          <button
            type="submit"
            disabled={aiLoading || !aiQuery.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-2xl shadow flex items-center gap-2 text-sm transition"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">{t('send', 'Ask')}</span>
          </button>
        </form>

        {aiResponse && (
          <div className="mt-4 p-4 bg-white dark:bg-slate-800/90 border border-blue-100 dark:border-blue-900/60 rounded-2xl shadow-sm text-sm text-slate-800 dark:text-slate-200 leading-relaxed animate-in fade-in">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-500 mt-1 shrink-0" />
              <div>
                <p className="font-medium">{aiResponse}</p>
                {aiResponse.toLowerCase().includes('authority') && (
                  <Link
                    to="/authorities"
                    className="inline-flex items-center gap-1.5 mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-700 transition"
                  >
                    <span>{t('meet_authority', 'Meet an Authority')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};
