import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  FileText,
  MapPin,
  Bell,
  Settings,
  Shield,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  Lock,
  UserCheck,
  UserX,
  Palette,
  PhoneCall,
  ClipboardList,
  CalendarClock,
  Bot,
  Volume2,
  Monitor,
  Globe,
  Mail,
  Save,
  Check,
  Smartphone,
  Upload,
  Image as ImageIcon,
  Landmark,
  ExternalLink,
  X,
  Sparkles,
  Laptop
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../i18n/LanguageContext';

const THEME_COLOR_PRESETS = [
  { name: 'Deep Navy', hex: '#1e3a8a' },
  { name: 'Royal Indigo', hex: '#4338ca' },
  { name: 'Emerald Forest', hex: '#059669' },
  { name: 'Cyber Violet', hex: '#7c3aed' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Amber Bronze', hex: '#d97706' },
  { name: 'Slate Charcoal', hex: '#334155' }
];

const APP_ICON_PRESETS = [
  { id: 'robot', name: 'AI Robot', url: '/icons/app-robot.svg', badge: 'Modern AI' },
  { id: 'mortarboard', name: 'Academic Cap', url: '/icons/app-mortarboard.svg', badge: 'Education' },
  { id: 'crest', name: 'College Crest', url: '/icons/app-crest.svg', badge: 'Heritage' },
  { id: 'shield', name: 'Pass Shield', url: '/icons/app-shield.svg', badge: 'Security' },
  { id: 'bell', name: 'Concierge Bell', url: '/icons/app-bell.svg', badge: 'Reception' },
  { id: 'monogram', name: 'RAVAN Monogram', url: '/icons/app-monogram.svg', badge: 'Brand' }
];

const AVAILABLE_VISITOR_FIELDS = [
  { key: 'visitorName', label: 'Full Name', locked: true },
  { key: 'visitorMobile', label: 'Mobile Number', locked: true },
  { key: 'purpose', label: 'Purpose of Visit', locked: true },
  { key: 'requestedDate', label: 'Preferred Date', locked: true },
  { key: 'requestedTime', label: 'Preferred Time', locked: true },
  { key: 'visitorEmail', label: 'Email Address', locked: false },
  { key: 'organization', label: 'Organization / Institute', locked: false },
  { key: 'studentId', label: 'Student / Employee ID', locked: false },
  { key: 'departmentName', label: 'Department to Visit', locked: false },
  { key: 'message', label: 'Additional Message / Notes', locked: false }
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { settings, refreshSettings } = useSettings();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'ANALYTICS' | 'AUTHORITIES' | 'DEPARTMENTS' | 'COLLEGE_INFO' | 'CAMPUS_MAP' | 'ANNOUNCEMENTS' | 'SETTINGS' | 'AUDIT_LOGS'
  >('ANALYTICS');

  // Settings sub-tab
  const [settingsSubTab, setSettingsSubTab] = useState<
    'SITE_SETTINGS' | 'APP_SETTINGS' | 'CONTACTS' | 'VISITOR_FORM' | 'SCHEDULING' | 'AI_ASSISTANT' | 'NOTIFICATIONS' | 'KIOSK'
  >('SITE_SETTINGS');

  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Departments State
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '', officeLocation: '' });

  // Authorities State
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [newAuth, setNewAuth] = useState({
    accountId: '',
    email: '',
    password: '',
    name: '',
    designation: '',
    departmentId: '',
    officeLocation: ''
  });

  // College Info State
  const [infoItems, setInfoItems] = useState<any[]>([]);
  const [newInfo, setNewInfo] = useState({ category: 'ABOUT', title: '', contentEn: '', contentHi: '', priority: 1 });

  // Campus Map State
  const [campusLocations, setCampusLocations] = useState<any[]>([]);
  const [newLoc, setNewLoc] = useState({ name: '', category: 'OFFICE', locationCode: '', xCoord: 50, yCoord: 50, floorInfo: '', description: '' });

  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnn, setNewAnn] = useState({ title: '', description: '', priority: 'NORMAL' });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Logo upload state
  const [uploadingSiteLogo, setUploadingSiteLogo] = useState(false);
  const [uploadingAppLogo, setUploadingAppLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [iconPreviewDevice, setIconPreviewDevice] = useState<'ANDROID' | 'IOS' | 'DESKTOP'>('ANDROID');

  // Comprehensive Settings form state
  const [settingsForm, setSettingsForm] = useState<any>({
    // Website Identity
    siteName: '',
    tagline: '',
    siteLogoUrl: '',

    // Installed App / PWA Identity
    appName: '',
    appShortName: '',
    appLogoUrl: '',

    // Legacy fallback
    collegeName: '',
    logoUrl: '',

    themeColor: '#1e3a8a',
    darkModeDefault: false,

    collegeEmail: '',
    collegePhone: '',
    emergencyPhone: '',
    collegeAddress: '',
    visitingHoursGeneral: '',

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
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',

    enableAIAssistant: true,
    aiWelcomeMessage: '',
    aiCustomInstructions: '',

    kioskAutoResetSeconds: 90,
    kioskShowAnnouncements: true,
    kioskShowCampusMap: true
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Direct image file upload for Site Logo or App Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'siteLogoUrl' | 'appLogoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('Logo image must be under 5MB.');
      return;
    }

    setLogoUploadError(null);
    if (targetField === 'siteLogoUrl') setUploadingSiteLogo(true);
    else setUploadingAppLogo(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await api.post<{ success: boolean; logoUrl: string; message: string }>('/admin/upload-logo', formData);
      if (res.success && res.logoUrl) {
        setSettingsForm((prev: any) => ({
          ...prev,
          [targetField]: res.logoUrl,
          logoUrl: prev.logoUrl || res.logoUrl
        }));
      }
    } catch (err: any) {
      setLogoUploadError(err.message || 'Failed to upload logo image.');
    } finally {
      if (targetField === 'siteLogoUrl') setUploadingSiteLogo(false);
      else setUploadingAppLogo(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (settings) {
      setSettingsForm({
        siteName: settings.siteName || settings.collegeName || '',
        tagline: settings.tagline || '',
        siteLogoUrl: settings.siteLogoUrl || settings.logoUrl || '',

        appName: settings.appName || settings.collegeName || '',
        appShortName: settings.appShortName || 'RAVAN Reception',
        appLogoUrl: settings.appLogoUrl || settings.logoUrl || '',

        collegeName: settings.collegeName || settings.siteName || '',
        logoUrl: settings.logoUrl || settings.siteLogoUrl || '',

        themeColor: settings.themeColor || '#1e3a8a',
        darkModeDefault: !!settings.darkModeDefault,

        collegeEmail: settings.collegeEmail || '',
        collegePhone: settings.collegePhone || '',
        emergencyPhone: settings.emergencyPhone || '',
        collegeAddress: settings.collegeAddress || '',
        visitingHoursGeneral: settings.visitingHoursGeneral || '',

        defaultLanguage: settings.defaultLanguage || 'en',
        allowLanguageToggle: settings.allowLanguageToggle !== false,

        allowCameraPhoto: settings.allowCameraPhoto !== false,
        requireVisitorPhoto: !!settings.requireVisitorPhoto,
        requiredVisitorFields: Array.isArray(settings.requiredVisitorFields)
          ? settings.requiredVisitorFields
          : ['visitorName', 'visitorMobile', 'purpose', 'requestedDate', 'requestedTime'],
        photoSourceMode: settings.photoSourceMode || 'ALL',

        maxAdvanceBookingDays: settings.maxAdvanceBookingDays ?? 14,
        appointmentLeadTimeHours: settings.appointmentLeadTimeHours ?? 2,
        defaultSlotMinutes: settings.defaultSlotMinutes ?? 15,
        allowWeekendAppointments: !!settings.allowWeekendAppointments,
        strictConflictPrevention: settings.strictConflictPrevention !== false,
        maxVisitorsPerRequest: settings.maxVisitorsPerRequest ?? 10,

        soundAlertsEnabled: settings.soundAlertsEnabled !== false,
        browserNotificationsEnabled: settings.browserNotificationsEnabled !== false,
        emailNotificationsEnabled: !!settings.emailNotificationsEnabled,
        smtpHost: settings.smtpHost || '',
        smtpPort: settings.smtpPort || 587,
        smtpUser: settings.smtpUser || '',
        smtpPass: settings.smtpPass || '',
        smtpFrom: settings.smtpFrom || '',

        enableAIAssistant: settings.enableAIAssistant !== false,
        aiWelcomeMessage: settings.aiWelcomeMessage || '',
        aiCustomInstructions: settings.aiCustomInstructions || '',

        kioskAutoResetSeconds: settings.kioskAutoResetSeconds ?? 90,
        kioskShowAnnouncements: settings.kioskShowAnnouncements !== false,
        kioskShowCampusMap: settings.kioskShowCampusMap !== false
      });
    }
  }, [settings]);

  const loadAllData = async () => {
    try {
      const [anaRes, deptRes, authRes, infoRes, mapRes, annRes, auditRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ success: false })),
        api.get('/admin/departments').catch(() => ({ success: false })),
        api.get('/authorities').catch(() => ({ success: false })),
        api.get('/college/info').catch(() => ({ success: false })),
        api.get('/college/campus').catch(() => ({ success: false })),
        api.get('/college/announcements').catch(() => ({ success: false })),
        api.get('/admin/audit-logs').catch(() => ({ success: false }))
      ]);

      if (anaRes.success) setAnalytics(anaRes.analytics);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (authRes.success) setAuthorities(authRes.authorities);
      if (infoRes.success) setInfoItems(infoRes.items);
      if (mapRes.success) setCampusLocations(mapRes.locations);
      if (annRes.success) setAnnouncements(annRes.announcements);
      if (auditRes.success) setAuditLogs(auditRes.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Department CRUD
  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    try {
      await api.post('/admin/departments', newDept);
      setNewDept({ name: '', code: '', description: '', officeLocation: '' });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create department');
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/admin/departments/${id}`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete department');
    }
  };

  // Authority CRUD
  const handleCreateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuth.name || !newAuth.accountId || !newAuth.departmentId) return;
    try {
      await api.post('/admin/authorities', newAuth);
      setNewAuth({ accountId: '', email: '', password: '', name: '', designation: '', departmentId: '', officeLocation: '' });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create authority');
    }
  };

  // College Info CRUD
  const handleCreateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInfo.title || !newInfo.contentEn) return;
    try {
      await api.post('/college/info', newInfo);
      setNewInfo({ category: 'ABOUT', title: '', contentEn: '', contentHi: '', priority: 1 });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to add information');
    }
  };

  const handleDeleteInfo = async (id: string) => {
    if (!confirm('Delete this information item?')) return;
    try {
      await api.delete(`/college/info/${id}`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  // Campus Map CRUD
  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoc.name || !newLoc.locationCode) return;
    try {
      await api.post('/college/campus', newLoc);
      setNewLoc({ name: '', category: 'OFFICE', locationCode: '', xCoord: 50, yCoord: 50, floorInfo: '', description: '' });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to add location');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Delete this campus location?')) return;
    try {
      await api.delete(`/college/campus/${id}`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete location');
    }
  };

  // Announcements CRUD
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.description) return;
    try {
      await api.post('/college/announcements', newAnn);
      setNewAnn({ title: '', description: '', priority: 'NORMAL' });
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/college/announcements/${id}`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  // Settings update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await api.patch('/admin/settings', settingsForm);
      await refreshSettings();
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const token = localStorage.getItem('ravan_auth_token');
    window.open(`/api/admin/export-csv?token=${token}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-full">
            Executive Admin Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            College Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure college branding, manage authorities, monitor visitor analytics, and audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadAllData}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none text-xs font-bold">
        {[
          { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
          { id: 'AUTHORITIES', label: 'Authorities', icon: Users },
          { id: 'DEPARTMENTS', label: 'Departments', icon: Building2 },
          { id: 'COLLEGE_INFO', label: 'College Info', icon: FileText },
          { id: 'CAMPUS_MAP', label: 'Campus Map', icon: MapPin },
          { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Bell },
          { id: 'SETTINGS', label: 'Settings', icon: Settings },
          { id: 'AUDIT_LOGS', label: 'Audit Logs', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl whitespace-nowrap flex items-center gap-2 transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6 animate-in fade-in">
          {analytics ? (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs uppercase font-semibold text-slate-400">Total Appointments</span>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {analytics.totalAppointments}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs uppercase font-semibold text-slate-400">Today's Visitors</span>
                  <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {analytics.todayAppointments}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs uppercase font-semibold text-slate-400">Pending Review</span>
                  <p className="text-3xl font-extrabold text-amber-500 mt-1">
                    {analytics.pendingAppointments}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <span className="text-xs uppercase font-semibold text-slate-400">Accepted & Active</span>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                    {analytics.acceptedAppointments}
                  </p>
                </div>
              </div>

              {/* Department Breakdown */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Visitor Volume by Department
                </h3>
                <div className="space-y-3">
                  {analytics.departmentBreakdown?.map((dept: any) => (
                    <div key={dept.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{dept.name} ({dept.code})</span>
                        <span className="text-slate-500">{dept.appointmentCount} appointments</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${
                              analytics.totalAppointments > 0
                                ? Math.min(100, (dept.appointmentCount / analytics.totalAppointments) * 100)
                                : 0
                            }%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">Loading analytics...</div>
          )}
        </div>
      )}

      {/* TAB 2: AUTHORITIES */}
      {activeTab === 'AUTHORITIES' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Add Authority Form */}
          <form onSubmit={handleCreateAuthority} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add New Authority Profile & Account
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Account ID (e.g. REGISTRAR-001)"
                value={newAuth.accountId}
                onChange={(e) => setNewAuth({ ...newAuth, accountId: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="email"
                required
                placeholder="Email (e.g. registrar@college.edu)"
                value={newAuth.email}
                onChange={(e) => setNewAuth({ ...newAuth, email: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="password"
                required
                placeholder="Initial Password"
                value={newAuth.password}
                onChange={(e) => setNewAuth({ ...newAuth, password: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Dr. Sunita Rao)"
                value={newAuth.name}
                onChange={(e) => setNewAuth({ ...newAuth, name: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Designation (e.g. Registrar)"
                value={newAuth.designation}
                onChange={(e) => setNewAuth({ ...newAuth, designation: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <select
                required
                value={newAuth.departmentId}
                onChange={(e) => setNewAuth({ ...newAuth, departmentId: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="">Select Department *</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Office Location (e.g. Room 105)"
                value={newAuth.officeLocation}
                onChange={(e) => setNewAuth({ ...newAuth, officeLocation: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl sm:col-span-2"
              />
              <button
                type="submit"
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
              >
                Create Authority
              </button>
            </div>
          </form>

          {/* List of Authorities */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Authorities ({authorities.length})</h3>
            <div className="grid grid-cols-1 gap-3">
              {authorities.map(a => (
                <div key={a.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.name}</h4>
                    <p className="text-slate-500">{a.designation} • {a.department?.name} • {a.officeLocation}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    a.isAcceptingAppointments ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {a.isAcceptingAppointments ? 'Accepting' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="space-y-6 animate-in fade-in">
          <form onSubmit={handleCreateDept} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Department
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Department Name"
                value={newDept.name}
                onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Code (e.g. MECH)"
                value={newDept.code}
                onChange={(e) => setNewDept({ ...newDept, code: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text"
                placeholder="Office Location"
                value={newDept.officeLocation}
                onChange={(e) => setNewDept({ ...newDept, officeLocation: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <button
                type="submit"
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
              >
                Save Department
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Existing Departments</h3>
            <div className="grid grid-cols-1 gap-2">
              {departments.map(d => (
                <div key={d.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-900 dark:text-white">{d.name} ({d.code})</strong>
                    <p className="text-slate-400">{d.officeLocation || 'Main Block'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDept(d.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COLLEGE INFO */}
      {activeTab === 'COLLEGE_INFO' && (
        <div className="space-y-6 animate-in fade-in">
          <form onSubmit={handleCreateInfo} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Knowledge Base Topic
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <select
                value={newInfo.category}
                onChange={(e) => setNewInfo({ ...newInfo, category: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="ABOUT">About College</option>
                <option value="ADMISSION">Admissions</option>
                <option value="EXAMINATION">Examinations</option>
                <option value="HOURS">Office Hours</option>
                <option value="EMERGENCY">Emergency Contacts</option>
              </select>
              <input
                type="text"
                required
                placeholder="Topic Title"
                value={newInfo.title}
                onChange={(e) => setNewInfo({ ...newInfo, title: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <textarea
                required
                rows={2}
                placeholder="Content in English..."
                value={newInfo.contentEn}
                onChange={(e) => setNewInfo({ ...newInfo, contentEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl sm:col-span-2 resize-none"
              />
              <textarea
                rows={2}
                placeholder="Content in Hindi (हिन्दी)..."
                value={newInfo.contentHi}
                onChange={(e) => setNewInfo({ ...newInfo, contentHi: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl sm:col-span-2 resize-none"
              />
              <button
                type="submit"
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition sm:col-span-2"
              >
                Publish Knowledge Item
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {infoItems.map(item => (
              <div key={item.id} className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex items-start justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-blue-600">{item.category}</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{item.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{item.contentEn}</p>
                </div>
                <button
                  onClick={() => handleDeleteInfo(item.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CAMPUS MAP */}
      {activeTab === 'CAMPUS_MAP' && (
        <div className="space-y-6 animate-in fade-in">
          <form onSubmit={handleCreateLocation} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Add Map Location / Building
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Location Name"
                value={newLoc.name}
                onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text"
                required
                placeholder="Code (e.g. LIB-01)"
                value={newLoc.locationCode}
                onChange={(e) => setNewLoc({ ...newLoc, locationCode: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="text"
                placeholder="Floor info (e.g. 2nd Floor)"
                value={newLoc.floorInfo}
                onChange={(e) => setNewLoc({ ...newLoc, floorInfo: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Map X Coord (0-100)"
                value={newLoc.xCoord}
                onChange={(e) => setNewLoc({ ...newLoc, xCoord: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Map Y Coord (0-100)"
                value={newLoc.yCoord}
                onChange={(e) => setNewLoc({ ...newLoc, yCoord: Number(e.target.value) })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
              <button
                type="submit"
                className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition"
              >
                Add Map Pin
              </button>
            </div>
          </form>

          <div className="bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold">Map Points ({campusLocations.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {campusLocations.map(loc => (
                <div key={loc.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 dark:text-white">{loc.name}</strong> ({loc.locationCode})
                    <p className="text-slate-400">Position: ({loc.xCoord}%, {loc.yCoord}%) • {loc.floorInfo}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <div className="space-y-6 animate-in fade-in">
          <form onSubmit={handleCreateAnnouncement} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Publish Announcement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Title"
                value={newAnn.title}
                onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl sm:col-span-2"
              />
              <select
                value={newAnn.priority}
                onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value })}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>
              <textarea
                required
                rows={2}
                placeholder="Description / Notice content..."
                value={newAnn.description}
                onChange={(e) => setNewAnn({ ...newAnn, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl sm:col-span-3 resize-none"
              />
              <button
                type="submit"
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition sm:col-span-3"
              >
                Broadcast Notice
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="p-4 bg-white dark:bg-slate-900 border rounded-2xl flex items-start justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-xs text-blue-600">[{ann.priority}]</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">{ann.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{ann.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS (Full College & Website Configuration) */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Application & Website Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize institution identity, contact details, visitor requirements, scheduling rules, AI persona, and kiosk behavior.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 shrink-0"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save All Settings</span>
            </button>
          </div>

          {settingsSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">All settings updated successfully! Changes are immediately active across website, kiosk, and admin panels.</span>
            </div>
          )}

          {/* Sub-Tabs Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800 scrollbar-none text-xs font-bold">
            {[
              { id: 'SITE_SETTINGS', label: 'Site Settings (Website)', icon: Globe },
              { id: 'APP_SETTINGS', label: 'App Settings & Icon (PWA)', icon: Smartphone },
              { id: 'CONTACTS', label: 'Contacts & Hours', icon: PhoneCall },
              { id: 'VISITOR_FORM', label: 'Visitor Form & Photos', icon: ClipboardList },
              { id: 'SCHEDULING', label: 'Scheduling Rules', icon: CalendarClock },
              { id: 'AI_ASSISTANT', label: 'AI Receptionist', icon: Bot },
              { id: 'NOTIFICATIONS', label: 'Notifications & Audio', icon: Volume2 },
              { id: 'KIOSK', label: 'Kiosk & Display', icon: Monitor }
            ].map((subTab) => {
              const Icon = subTab.icon;
              return (
                <button
                  key={subTab.id}
                  onClick={() => setSettingsSubTab(subTab.id as any)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition ${
                    settingsSubTab === subTab.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{subTab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
            {/* Logo Upload Error Alert */}
            {logoUploadError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs flex items-center justify-between gap-2">
                <span>{logoUploadError}</span>
                <button type="button" onClick={() => setLogoUploadError(null)} className="text-rose-400 hover:text-rose-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* SUB-TAB 1: SITE SETTINGS (WEBSITE) */}
            {settingsSubTab === 'SITE_SETTINGS' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Website & Web Portal Settings</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Controls the branding for the desktop/mobile web portal, browser navigation bar, tab title, and visitor appointment booking pages.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Website / Portal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value, collegeName: e.target.value })}
                      placeholder="e.g. RAVAN College Receptionist"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rendered in the main header navbar, footer copyright, and browser tab title.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Website Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      placeholder="e.g. AI Visitor & Appointment Management System"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Appears under the website name in the top navigation and visitor greeting banner.
                    </p>
                  </div>

                  {/* Site Logo Section with Direct Upload & Live Preview */}
                  <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Website Header Logo
                      </label>
                      {settingsForm.siteLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, siteLogoUrl: '', logoUrl: '' })}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Logo (Use Default Icon)</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Live Preview Box */}
                      <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                          Live Navbar Preview
                        </span>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3 w-full">
                          {settingsForm.siteLogoUrl ? (
                            <img
                              src={settingsForm.siteLogoUrl}
                              alt="Site Logo Preview"
                              className="w-10 h-10 rounded-xl object-contain shadow-sm border border-slate-100 dark:border-slate-800 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                              <Landmark className="w-5 h-5" />
                            </div>
                          )}
                          <div className="text-left truncate">
                            <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {settingsForm.siteName || 'RAVAN College'}
                            </p>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 truncate">
                              {settingsForm.tagline || 'Visitor Management'}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2">
                          {settingsForm.siteLogoUrl ? 'Custom uploaded logo active' : 'Default college emblem active'}
                        </span>
                      </div>

                      {/* Upload and URL controls */}
                      <div className="md:col-span-8 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-sm">
                            {uploadingSiteLogo ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>{uploadingSiteLogo ? 'Uploading...' : 'Upload Logo File (PNG, SVG, JPG)'}</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              disabled={uploadingSiteLogo}
                              onChange={(e) => handleLogoUpload(e, 'siteLogoUrl')}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                            Or enter direct image URL / file path:
                          </label>
                          <input
                            type="text"
                            value={settingsForm.siteLogoUrl || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, siteLogoUrl: e.target.value, logoUrl: e.target.value })}
                            placeholder="e.g. /uploads/logos/logo.png or https://example.com/logo.svg"
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Recommended: 512×512px or horizontal transparent SVG / PNG. Max file size: 5MB. Files are saved securely on the server and served instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: APP SETTINGS (PWA & KIOSK) */}
            {settingsSubTab === 'APP_SETTINGS' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Progressive Web App (PWA) & Mobile Launcher Settings</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      Configure how RAVAN appears when installed on Android smartphones, tablets, Windows desktop, macOS, Linux, and kiosk touch displays.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      App Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.appName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, appName: e.target.value })}
                      placeholder="e.g. RAVAN College Receptionist"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Shown on application splash screens, Windows Start Menu, and install banners.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      App Short Name (Under App Icon) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={20}
                      value={settingsForm.appShortName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, appShortName: e.target.value })}
                      placeholder="e.g. RAVAN Reception"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Short label (10-15 chars) displayed beneath the icon on smartphone home screens.
                    </p>
                  </div>

                  {/* App Icon Section with Curated Presets, Upload, and Multi-Device Simulator */}
                  <div className="sm:col-span-2 space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>App Icon & Mobile Touch Logo</span>
                        </label>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Choose a pre-built icon or upload your custom logo. This icon is used on Android/iOS home screens, desktop app windows, and install prompts.
                        </p>
                      </div>
                      {settingsForm.appLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, appLogoUrl: '' })}
                          className="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 self-start sm:self-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset to Default PWA Icon</span>
                        </button>
                      )}
                    </div>

                    {/* PRE-BUILT CURATED ICON PRESETS (1-Click Selection) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Curated App Icon Presets (1-Click Apply)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Click any icon to select</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                        {APP_ICON_PRESETS.map((preset) => {
                          const isSelected = settingsForm.appLogoUrl === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setSettingsForm({ ...settingsForm, appLogoUrl: preset.url })}
                              className={`relative p-3 rounded-2xl border transition text-center flex flex-col items-center gap-2 group ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-11 h-11 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
                              />
                              <div>
                                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[85px]">
                                  {preset.name}
                                </p>
                                <span className="text-[9px] text-slate-400">
                                  {preset.badge}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* CUSTOM UPLOAD & MULTI-DEVICE SIMULATOR PREVIEW */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-2">
                      {/* Multi-Device Interactive Simulator */}
                      <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 flex flex-col items-center text-center">
                        <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Live Device Preview
                          </span>
                          {/* Device Switcher */}
                          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setIconPreviewDevice('ANDROID')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                                iconPreviewDevice === 'ANDROID'
                                  ? 'bg-indigo-600 text-white shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Android
                            </button>
                            <button
                              type="button"
                              onClick={() => setIconPreviewDevice('IOS')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                                iconPreviewDevice === 'IOS'
                                  ? 'bg-indigo-600 text-white shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              iOS
                            </button>
                            <button
                              type="button"
                              onClick={() => setIconPreviewDevice('DESKTOP')}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                                iconPreviewDevice === 'DESKTOP'
                                  ? 'bg-indigo-600 text-white shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Desktop
                            </button>
                          </div>
                        </div>

                        {/* Device Screen Frame */}
                        <div className="w-full py-4 flex flex-col items-center justify-center">
                          {iconPreviewDevice === 'ANDROID' && (
                            <div className="flex flex-col items-center">
                              {/* Android Squircle Phone Icon */}
                              <div className="w-16 h-16 rounded-[24%] bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 shadow-2xl p-1 flex items-center justify-center ring-2 ring-white/20 transition-transform hover:scale-105">
                                {settingsForm.appLogoUrl || settingsForm.siteLogoUrl ? (
                                  <img
                                    src={settingsForm.appLogoUrl || settingsForm.siteLogoUrl}
                                    alt="App Icon"
                                    className="w-full h-full object-cover rounded-[20%]"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-[20%] bg-blue-700 flex items-center justify-center text-white">
                                    <Smartphone className="w-7 h-7" />
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                                {settingsForm.appShortName || 'RAVAN App'}
                              </p>
                              <span className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Android Squircle
                              </span>
                            </div>
                          )}

                          {iconPreviewDevice === 'IOS' && (
                            <div className="flex flex-col items-center">
                              {/* iOS Continuous Corner Icon */}
                              <div className="w-16 h-16 rounded-[22.5%] bg-gradient-to-br from-slate-800 to-black shadow-2xl p-1 flex items-center justify-center ring-1 ring-white/30 transition-transform hover:scale-105 overflow-hidden">
                                {settingsForm.appLogoUrl || settingsForm.siteLogoUrl ? (
                                  <img
                                    src={settingsForm.appLogoUrl || settingsForm.siteLogoUrl}
                                    alt="App Icon"
                                    className="w-full h-full object-cover rounded-[20%]"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-[20%] bg-indigo-700 flex items-center justify-center text-white">
                                    <Smartphone className="w-7 h-7" />
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-xs font-semibold text-slate-100 truncate max-w-[120px]">
                                {settingsForm.appShortName || 'RAVAN App'}
                              </p>
                              <span className="text-[9px] text-blue-400 mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Apple Touch Icon
                              </span>
                            </div>
                          )}

                          {iconPreviewDevice === 'DESKTOP' && (
                            <div className="flex flex-col items-center">
                              {/* Desktop PWA Window / Taskbar Tile */}
                              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-3 w-full max-w-[200px] shadow-lg">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 p-0.5 flex items-center justify-center shrink-0 border border-slate-700">
                                  {settingsForm.appLogoUrl || settingsForm.siteLogoUrl ? (
                                    <img
                                      src={settingsForm.appLogoUrl || settingsForm.siteLogoUrl}
                                      alt="App Icon"
                                      className="w-full h-full object-contain rounded-lg"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Laptop className="w-5 h-5 text-indigo-400" />
                                  )}
                                </div>
                                <div className="text-left truncate">
                                  <p className="text-xs font-bold text-white truncate">
                                    {settingsForm.appName || 'RAVAN App'}
                                  </p>
                                  <span className="text-[9px] text-slate-400">PWA Desktop App</span>
                                </div>
                              </div>
                              <span className="text-[9px] text-indigo-400 mt-2 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                                Windows / Linux Desktop PWA
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload and Custom URL Controls */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                            Upload Custom App Icon
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm text-xs">
                              {uploadingAppLogo ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{uploadingAppLogo ? 'Uploading Icon...' : 'Upload Image File (PNG, SVG, JPG)'}</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                disabled={uploadingAppLogo}
                                onChange={(e) => handleLogoUpload(e, 'appLogoUrl')}
                                className="hidden"
                              />
                            </label>

                            {settingsForm.siteLogoUrl && settingsForm.siteLogoUrl !== settingsForm.appLogoUrl && (
                              <button
                                type="button"
                                onClick={() => setSettingsForm({ ...settingsForm, appLogoUrl: settingsForm.siteLogoUrl })}
                                className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition"
                              >
                                Sync from Website Logo
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                              Or enter direct icon URL / file path:
                            </label>
                            <input
                              type="text"
                              value={settingsForm.appLogoUrl || ''}
                              onChange={(e) => setSettingsForm({ ...settingsForm, appLogoUrl: e.target.value })}
                              placeholder="e.g. /icons/app-robot.svg or /uploads/logos/app-icon.png"
                              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                            />
                          </div>

                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>
                              Synchronized across <code className="text-indigo-600 dark:text-indigo-400 font-mono">/manifest.webmanifest</code>, Apple Touch Icon, and home screen launchers.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Accent Color */}
                  <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Primary Theme Accent Color
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {THEME_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, themeColor: preset.hex })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                            settingsForm.themeColor === preset.hex
                              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="color"
                        value={settingsForm.themeColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, themeColor: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                      />
                      <input
                        type="text"
                        value={settingsForm.themeColor}
                        onChange={(e) => setSettingsForm({ ...settingsForm, themeColor: e.target.value })}
                        className="w-32 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Dark Mode Default */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.darkModeDefault}
                        onChange={(e) => setSettingsForm({ ...settingsForm, darkModeDefault: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Default to Dark Theme</span>
                        <p className="text-[11px] text-slate-400">Automatically show high-contrast dark theme on first app or kiosk launch.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: CONTACTS & HOURS */}
            {settingsSubTab === 'CONTACTS' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Campus Contacts & Visiting Hours</h4>
                  <p className="text-slate-400">Displayed in footer, contact kiosks, and confirmation passes.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={settingsForm.collegeEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, collegeEmail: e.target.value })}
                      placeholder="info@college.edu"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      General Phone / Reception
                    </label>
                    <input
                      type="tel"
                      value={settingsForm.collegePhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, collegePhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Campus Security / Emergency Hotline
                    </label>
                    <input
                      type="tel"
                      value={settingsForm.emergencyPhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, emergencyPhone: e.target.value })}
                      placeholder="+91 98765 99999"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      General Public Visiting Hours
                    </label>
                    <input
                      type="text"
                      value={settingsForm.visitingHoursGeneral || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, visitingHoursGeneral: e.target.value })}
                      placeholder="10:00 AM - 04:00 PM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Physical Campus Address
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.collegeAddress || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, collegeAddress: e.target.value })}
                      placeholder="Main Campus Boulevard, Knowledge Park, City, State - PIN"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: VISITOR FORM & PHOTO POLICY */}
            {settingsSubTab === 'VISITOR_FORM' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visitor Form & Photo Policy</h4>
                  <p className="text-slate-400">Configure photo security rules and dynamic required visitor fields.</p>
                </div>

                {/* Photo Policy */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">Visitor Photo Verification</h5>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.allowCameraPhoto}
                        onChange={(e) => setSettingsForm({ ...settingsForm, allowCameraPhoto: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Enable Visitor Photo Capture / Upload</span>
                        <p className="text-[11px] text-slate-400">Shows camera capture box on appointment booking form.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.requireVisitorPhoto}
                        onChange={(e) => setSettingsForm({ ...settingsForm, requireVisitorPhoto: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Make Visitor Photo Mandatory</span>
                        <p className="text-[11px] text-slate-400">Visitor cannot submit appointment request without capturing or uploading a valid face photo.</p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Photo Source Mode
                    </label>
                    <select
                      value={settingsForm.photoSourceMode || 'ALL'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, photoSourceMode: e.target.value })}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    >
                      <option value="ALL">Camera & File Upload Allowed (Recommended)</option>
                      <option value="CAMERA_ONLY">Strict WebRTC Camera Live Capture Only (Prevents spoofing)</option>
                      <option value="FILE_ONLY">File Upload Only</option>
                    </select>
                  </div>
                </div>

                {/* Required Fields Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">Required Visitor Form Fields</h5>
                      <p className="text-[11px] text-slate-400">Select which fields visitors must complete before booking.</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                      {(settingsForm.requiredVisitorFields || []).length} Required
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AVAILABLE_VISITOR_FIELDS.map((field) => {
                      const isChecked = (settingsForm.requiredVisitorFields || []).includes(field.key);
                      return (
                        <div
                          key={field.key}
                          onClick={() => {
                            if (field.locked) return;
                            const current = [...(settingsForm.requiredVisitorFields || [])];
                            if (isChecked) {
                              setSettingsForm({
                                ...settingsForm,
                                requiredVisitorFields: current.filter((k: string) => k !== field.key)
                              });
                            } else {
                              setSettingsForm({
                                ...settingsForm,
                                requiredVisitorFields: [...current, field.key]
                              });
                            }
                          }}
                          className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                            field.locked
                              ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-80'
                              : isChecked
                              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={field.locked}
                              readOnly
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{field.label}</span>
                          </div>
                          {field.locked ? (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Core
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isChecked ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-slate-400'
                            }`}>
                              {isChecked ? 'Required' : 'Optional'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: SCHEDULING RULES */}
            {settingsSubTab === 'SCHEDULING' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Appointment & Scheduling Rules</h4>
                  <p className="text-slate-400">Configure advance booking boundaries, slot durations, and double-booking guardrails.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Advance Booking Window (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={settingsForm.maxAdvanceBookingDays}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maxAdvanceBookingDays: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Visitors cannot pick dates farther than this many days into the future.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Minimum Notice Lead Time (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="48"
                      value={settingsForm.appointmentLeadTimeHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, appointmentLeadTimeHours: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Prevents last-minute walk-in bookings without notice.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Default Slot Duration (Minutes)
                    </label>
                    <select
                      value={settingsForm.defaultSlotMinutes}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultSlotMinutes: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes (1 Hour)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max Visitors Allowed Per Booking Request
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={settingsForm.maxVisitorsPerRequest}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maxVisitorsPerRequest: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.allowWeekendAppointments}
                        onChange={(e) => setSettingsForm({ ...settingsForm, allowWeekendAppointments: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Allow Weekend Appointments</span>
                        <p className="text-[11px] text-slate-400">If unchecked, visitors cannot schedule visits on Saturdays and Sundays.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.strictConflictPrevention}
                        onChange={(e) => setSettingsForm({ ...settingsForm, strictConflictPrevention: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Strict Double-Booking Conflict Prevention</span>
                        <p className="text-[11px] text-slate-400">Enforces schedule isolation so no two accepted visitors overlap in the same authority's time slot.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: AI ASSISTANT (GEMINI) */}
            {settingsSubTab === 'AI_ASSISTANT' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Google Gemini AI Receptionist Configuration</h4>
                  <p className="text-slate-400">Configure persona instructions, welcome speech, and activation on kiosks.</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.enableAIAssistant}
                      onChange={(e) => setSettingsForm({ ...settingsForm, enableAIAssistant: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Enable AI Receptionist on Visitor Kiosk</span>
                      <p className="text-[11px] text-slate-400">Displays the interactive bilingual AI inquiry box on the visitor home screen.</p>
                    </div>
                  </label>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      AI Welcome Greeting Message
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.aiWelcomeMessage || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, aiWelcomeMessage: e.target.value })}
                      placeholder="Hello! I am your AI College Receptionist. How can I help you today?"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Custom Knowledge & System Instructions for Gemini
                    </label>
                    <textarea
                      rows={4}
                      value={settingsForm.aiCustomInstructions || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, aiCustomInstructions: e.target.value })}
                      placeholder="Provide specific institution rules, gate instructions, ID card policies, parking locations, or VIP directions that the AI must communicate to visitors..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 6: NOTIFICATIONS & AUDIO */}
            {settingsSubTab === 'NOTIFICATIONS' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alerts, Audio & Email Relay</h4>
                  <p className="text-slate-400">Control browser push, sound chimes, and automated SMTP email dispatch.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.soundAlertsEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, soundAlertsEnabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Enable In-App Sound / Chime Alerts</span>
                        <p className="text-[11px] text-slate-400">Plays an audible chime at the reception desk and authority portals when new visitors register.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.browserNotificationsEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, browserNotificationsEnabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Enable Browser Push Notifications</span>
                        <p className="text-[11px] text-slate-400">Prompts staff browsers for native system desktop notifications.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.emailNotificationsEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, emailNotificationsEnabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Enable Automated Email Notifications</span>
                        <p className="text-[11px] text-slate-400">Sends confirmation emails with appointment passes directly to visitors.</p>
                      </div>
                    </label>
                  </div>

                  {settingsForm.emailNotificationsEnabled && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl space-y-3 animate-in fade-in">
                      <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        SMTP Email Server Settings
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <input
                          type="text"
                          placeholder="SMTP Host (e.g. smtp.gmail.com)"
                          value={settingsForm.smtpHost || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl"
                        />
                        <input
                          type="number"
                          placeholder="SMTP Port (e.g. 587)"
                          value={settingsForm.smtpPort || 587}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: Number(e.target.value) })}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="SMTP User (e.g. reception@college.edu)"
                          value={settingsForm.smtpUser || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl"
                        />
                        <input
                          type="password"
                          placeholder="SMTP Password / App Key"
                          value={settingsForm.smtpPass || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpPass: e.target.value })}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="Sender Email Address (From)"
                          value={settingsForm.smtpFrom || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smtpFrom: e.target.value })}
                          className="px-3 py-2 bg-white dark:bg-slate-900 border rounded-xl sm:col-span-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 7: KIOSK DISPLAY & TIMERS */}
            {settingsSubTab === 'KIOSK' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kiosk Display & Touchscreen Behavior</h4>
                  <p className="text-slate-400">Settings for physical touchscreen reception kiosks and digital tablets.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Inactivity Auto-Reset Timer (Seconds)
                    </label>
                    <select
                      value={settingsForm.kioskAutoResetSeconds}
                      onChange={(e) => setSettingsForm({ ...settingsForm, kioskAutoResetSeconds: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="30">30 Seconds</option>
                      <option value="60">60 Seconds (1 Min)</option>
                      <option value="90">90 Seconds (Recommended)</option>
                      <option value="120">120 Seconds (2 Mins)</option>
                      <option value="180">180 Seconds (3 Mins)</option>
                      <option value="0">Disabled (Never Auto-Reset)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">Returns to welcome screen when left idle by visitors.</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Default Kiosk Language
                    </label>
                    <select
                      value={settingsForm.defaultLanguage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, defaultLanguage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.allowLanguageToggle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, allowLanguageToggle: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Allow Language Switcher</span>
                        <p className="text-[11px] text-slate-400">Allows visitors to toggle between English and Hindi on header navigation.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.kioskShowAnnouncements}
                        onChange={(e) => setSettingsForm({ ...settingsForm, kioskShowAnnouncements: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Display Urgent Announcements on Kiosk</span>
                        <p className="text-[11px] text-slate-400">Shows urgent circulars and notices directly on the kiosk touch interface.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.kioskShowCampusMap}
                        onChange={(e) => setSettingsForm({ ...settingsForm, kioskShowCampusMap: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Display Interactive Campus Map Quick Access</span>
                        <p className="text-[11px] text-slate-400">Shows campus navigation map card on the main reception home screen.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes apply instantly across all visitor kiosks, PWA devices, and backend databases.
              </span>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md transition text-xs flex items-center gap-2"
              >
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save All Application Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            System Security Audit Trail ({auditLogs.length} events)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Actor / Account</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {log.action}
                    </td>
                    <td className="py-2 px-3 text-blue-600 dark:text-blue-400 font-semibold">
                      {log.user?.accountId || 'Public Visitor / System'}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {log.entityType} ({log.entityId ? log.entityId.substring(0, 8) + '...' : '-'})
                    </td>
                    <td className="py-2 px-3 text-slate-400 font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
