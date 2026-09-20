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
  Laptop,
  Key,
  Eye,
  EyeOff,
  Video,
  Sliders,
  Play
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { resolveAssetUrl } from '../../utils/assets';

const THEME_COLOR_PRESETS = [
  { name: 'Deep Navy', hex: '#1e3a8a' },
  { name: 'Royal Indigo', hex: '#4338ca' },
  { name: 'Emerald Forest', hex: '#059669' },
  { name: 'Cyber Violet', hex: '#7c3aed' },
  { name: 'Crimson Red', hex: '#dc2626' },
  { name: 'Amber Bronze', hex: '#d97706' },
  { name: 'Futuristic Cyan', hex: '#0891b2' },
  { name: 'Slate Charcoal', hex: '#334155' }
];

const SECONDARY_COLOR_PRESETS = [
  { name: 'Vibrant Blue', hex: '#3b82f6' },
  { name: 'Sky Cyan', hex: '#0284c7' },
  { name: 'Emerald Mint', hex: '#10b981' },
  { name: 'Purple Neon', hex: '#8b5cf6' },
  { name: 'Pink Rose', hex: '#ec4899' },
  { name: 'Amber Gold', hex: '#f59e0b' }
];

const BACKGROUND_VIDEO_PRESETS = [
  {
    id: 'particles',
    name: 'Tech Particles Loop',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31913-large.mp4',
    badge: 'High-Tech'
  },
  {
    id: 'campus',
    name: 'Cyber Waves Loop',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-flowing-tunnel-of-purple-and-blue-light-43615-large.mp4',
    badge: 'Futuristic'
  },
  {
    id: 'lines',
    name: 'Neon Grid Motion',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-in-a-dark-background-31745-large.mp4',
    badge: 'Ambient'
  },
  {
    id: 'bokeh',
    name: 'Soft Blue Bokeh',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-blue-particles-floating-slowly-in-the-air-42359-large.mp4',
    badge: 'Subtle'
  }
];

const BACKGROUND_GRADIENT_PRESETS = [
  { name: 'Deep Space', css: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' },
  { name: 'Cyber Neon', css: 'linear-gradient(135deg, #090d16 0%, #1e1035 40%, #0c1a2e 100%)' },
  { name: 'Royal Indigo', css: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)' },
  { name: 'Oceanic Abyss', css: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)' },
  { name: 'Midnight Crimson', css: 'linear-gradient(135deg, #450a0a 0%, #1e1b4b 50%, #0f172a 100%)' },
  { name: 'Sunset Glow', css: 'linear-gradient(135deg, #31102f 0%, #1c1917 50%, #0f172a 100%)' }
];

const BACKGROUND_IMAGE_PRESETS = [
  { name: 'Modern Campus', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Grand Library', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Tech Laboratory', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80' },
  { name: 'Cyber Architecture', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80' }
];

const APP_ICON_PRESETS = [
  { id: 'robot', name: 'AI Robot', url: 'icons/app-robot.png', badge: 'Modern AI' },
  { id: 'mortarboard', name: 'Academic Cap', url: 'icons/app-mortarboard.svg', badge: 'Education' },
  { id: 'crest', name: 'College Crest', url: 'icons/app-crest.svg', badge: 'Heritage' },
  { id: 'shield', name: 'Pass Shield', url: 'icons/app-shield.svg', badge: 'Security' },
  { id: 'bell', name: 'Concierge Bell', url: 'icons/app-bell.svg', badge: 'Reception' },
  { id: 'monogram', name: 'RAVAN Monogram', url: 'icons/app-monogram.svg', badge: 'Brand' }
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
    'ANALYTICS' | 'USERS' | 'AUTHORITIES' | 'DEPARTMENTS' | 'COLLEGE_INFO' | 'CAMPUS_MAP' | 'ANNOUNCEMENTS' | 'SETTINGS' | 'AUDIT_LOGS'
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

  // User Accounts & Password Management State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    accountId: '',
    email: '',
    password: '',
    role: 'AUTHORITY',
    status: 'ACTIVE'
  });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    accountId: '',
    email: '',
    password: '',
    role: 'AUTHORITY'
  });
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);

  // Authority Edit State
  const [showEditAuthModal, setShowEditAuthModal] = useState(false);
  const [editingAuth, setEditingAuth] = useState<any | null>(null);
  const [editAuthForm, setEditAuthForm] = useState({
    id: '',
    name: '',
    designation: '',
    departmentId: '',
    officeLocation: '',
    email: '',
    mobile: '',
    bio: '',
    isAcceptingAppointments: true,
    password: ''
  });
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authActionError, setAuthActionError] = useState<string | null>(null);
  const [authActionSuccess, setAuthActionSuccess] = useState<string | null>(null);

  // Department Edit State
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  const [editDeptForm, setEditDeptForm] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    officeLocation: ''
  });
  const [deptActionLoading, setDeptActionLoading] = useState(false);
  const [deptActionError, setDeptActionError] = useState<string | null>(null);
  const [deptActionSuccess, setDeptActionSuccess] = useState<string | null>(null);

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
    secondaryColor: '#3b82f6',
    welcomeHeading: 'Welcome to',
    heroBadgeText: 'Digital Reception Kiosk',

    // Full Background Customization
    backgroundType: 'default',
    backgroundColor: '#0f172a',
    backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    backgroundImageUrl: '',
    backgroundVideoUrl: '',
    backgroundOverlayOpacity: 60,
    backgroundBlur: 0,

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
        secondaryColor: settings.secondaryColor || '#3b82f6',
        welcomeHeading: settings.welcomeHeading || 'Welcome to',
        heroBadgeText: settings.heroBadgeText || 'Digital Reception Kiosk',

        backgroundType: settings.backgroundType || 'default',
        backgroundColor: settings.backgroundColor || '#0f172a',
        backgroundGradient: settings.backgroundGradient || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        backgroundImageUrl: settings.backgroundImageUrl || '',
        backgroundVideoUrl: settings.backgroundVideoUrl || '',
        backgroundOverlayOpacity: settings.backgroundOverlayOpacity ?? 60,
        backgroundBlur: settings.backgroundBlur ?? 0,

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
      const [anaRes, deptRes, authRes, infoRes, mapRes, annRes, auditRes, userRes] = await Promise.all([
        api.get('/admin/analytics').catch(() => ({ success: false })),
        api.get('/admin/departments').catch(() => ({ success: false })),
        api.get('/authorities').catch(() => ({ success: false })),
        api.get('/college/info').catch(() => ({ success: false })),
        api.get('/college/campus').catch(() => ({ success: false })),
        api.get('/college/announcements').catch(() => ({ success: false })),
        api.get('/admin/audit-logs').catch(() => ({ success: false })),
        api.get('/admin/users').catch(() => ({ success: false }))
      ]);

      if (anaRes.success) setAnalytics(anaRes.analytics);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (authRes.success) setAuthorities(authRes.authorities);
      if (infoRes.success) setInfoItems(infoRes.items);
      if (mapRes.success) setCampusLocations(mapRes.locations);
      if (annRes.success) setAnnouncements(annRes.announcements);
      if (auditRes.success) setAuditLogs(auditRes.logs);
      if (userRes.success) setUsersList(userRes.users);
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

  const handleOpenEditDept = (dept: any) => {
    setEditingDept(dept);
    setEditDeptForm({
      id: dept.id,
      name: dept.name || '',
      code: dept.code || '',
      description: dept.description || '',
      officeLocation: dept.officeLocation || ''
    });
    setDeptActionError(null);
    setDeptActionSuccess(null);
    setShowEditDeptModal(true);
  };

  const handleSaveEditDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setDeptActionLoading(true);
    setDeptActionError(null);
    try {
      const res = await api.patch<{ success: boolean; department?: any; message?: string }>(
        `/admin/departments/${editingDept.id}`,
        editDeptForm
      );
      if (res.success) {
        setDeptActionSuccess('Department updated successfully!');
        await loadAllData();
        setTimeout(() => {
          setShowEditDeptModal(false);
          setDeptActionSuccess(null);
        }, 900);
      }
    } catch (err: any) {
      setDeptActionError(err.message || 'Failed to update department');
    } finally {
      setDeptActionLoading(false);
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

  const handleOpenEditAuthority = (auth: any) => {
    setEditingAuth(auth);
    setEditAuthForm({
      id: auth.id,
      name: auth.name || '',
      designation: auth.designation || '',
      departmentId: auth.departmentId || auth.department?.id || (departments[0]?.id || ''),
      officeLocation: auth.officeLocation || '',
      email: auth.email || auth.user?.email || '',
      mobile: auth.mobile || '',
      bio: auth.bio || '',
      isAcceptingAppointments: auth.isAcceptingAppointments !== false,
      password: ''
    });
    setAuthActionError(null);
    setAuthActionSuccess(null);
    setShowEditAuthModal(true);
  };

  const handleSaveEditAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuth) return;
    setAuthActionLoading(true);
    setAuthActionError(null);
    try {
      const payload: any = {
        name: editAuthForm.name.trim(),
        designation: editAuthForm.designation.trim(),
        departmentId: editAuthForm.departmentId,
        officeLocation: editAuthForm.officeLocation.trim(),
        email: editAuthForm.email.trim(),
        mobile: editAuthForm.mobile.trim(),
        bio: editAuthForm.bio.trim(),
        isAcceptingAppointments: editAuthForm.isAcceptingAppointments
      };
      if (editAuthForm.password.trim()) {
        payload.password = editAuthForm.password.trim();
      }

      const res = await api.patch<{ success: boolean; authority?: any; message?: string }>(
        `/admin/authorities/${editingAuth.id}`,
        payload
      );
      if (res.success) {
        setAuthActionSuccess('Authority profile updated successfully!');
        await loadAllData();
        setTimeout(() => {
          setShowEditAuthModal(false);
          setAuthActionSuccess(null);
        }, 900);
      }
    } catch (err: any) {
      setAuthActionError(err.message || 'Failed to update authority');
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleDeleteAuthority = async (auth: any) => {
    if (!confirm(`Are you sure you want to delete authority "${auth.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/authorities/${auth.id}`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete authority');
    }
  };

  const handleToggleAuthorityAccepting = async (auth: any) => {
    try {
      await api.patch(`/admin/authorities/${auth.id}`, {
        isAcceptingAppointments: !auth.isAcceptingAppointments
      });
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle appointment status');
    }
  };

  // Background Media Handlers
  const handleBackgroundVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file size exceeds 50MB. Please select a smaller video or enter an online MP4 URL.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSettingsForm((prev: any) => ({
        ...prev,
        backgroundType: 'video',
        backgroundVideoUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettingsForm((prev: any) => ({
        ...prev,
        backgroundType: 'image',
        backgroundImageUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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

  // User Accounts & Password Management Handlers (Admin Only)
  const handleOpenEditUser = (u: any) => {
    setEditingUser(u);
    setEditUserForm({
      accountId: u.accountId,
      email: u.email,
      password: '', // Blank by default, admin fills to change password
      role: u.role,
      status: u.status
    });
    setUserActionError(null);
    setUserActionSuccess(null);
    setShowPassword(false);
    setShowEditUserModal(true);
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserActionError(null);
    setUserActionSuccess(null);
    setUserActionLoading(true);

    try {
      const payload: any = {
        accountId: editUserForm.accountId.trim().toUpperCase(),
        email: editUserForm.email.trim(),
        role: editUserForm.role,
        status: editUserForm.status
      };
      if (editUserForm.password && editUserForm.password.trim()) {
        payload.password = editUserForm.password.trim();
      }

      const res = await api.patch<{ success: boolean; message?: string }>(
        `/admin/users/${editingUser.id}`,
        payload
      );

      if (res.success) {
        setUserActionSuccess(res.message || 'User credentials updated successfully!');
        await loadAllData();
        setTimeout(() => {
          setShowEditUserModal(false);
          setUserActionSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setUserActionError(err.message || 'Failed to update user credentials.');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError(null);
    setUserActionSuccess(null);
    setUserActionLoading(true);

    try {
      const payload = {
        accountId: newUserForm.accountId.trim().toUpperCase(),
        email: newUserForm.email.trim(),
        password: newUserForm.password.trim(),
        role: newUserForm.role
      };

      const res = await api.post<{ success: boolean; message?: string }>(
        '/admin/users',
        payload
      );

      if (res.success) {
        setUserActionSuccess('User created successfully!');
        setNewUserForm({ accountId: '', email: '', password: '', role: 'AUTHORITY' });
        await loadAllData();
        setTimeout(() => {
          setShowCreateUserModal(false);
          setUserActionSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setUserActionError(err.message || 'Failed to create user account.');
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.id === user?.id) {
      alert('You cannot delete your own active admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user "${u.accountId}"?`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${u.id}`);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleToggleUserStatus = async (u: any) => {
    const nextStatus = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${u.id}/status`, { status: nextStatus });
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle user status.');
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
          { id: 'USERS', label: 'Users & Passwords', icon: Key },
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

      {/* TAB: USERS & PASSWORDS (ADMIN-EXCLUSIVE CONTROL) */}
      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header & Quick Action */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  User Accounts & Passwords
                  <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                    Admin Exclusive
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full control: Change login User IDs, reset passwords, update roles, or deactivate access for any account.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setUserActionError(null);
                setUserActionSuccess(null);
                setShowCreateUserModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          </div>

          {/* Search & Role Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by User ID, Email, Role, or Name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              {[
                { id: 'ALL', label: `All (${usersList.length})` },
                { id: 'ADMIN', label: 'Admins' },
                { id: 'AUTHORITY', label: 'Authorities' },
                { id: 'RECEPTION', label: 'Reception' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setUserRoleFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    userRoleFilter === filter.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50 dark:bg-slate-900/50">
                  <tr>
                    <th className="py-3 px-4">User ID (Login Username)</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Linked Profile</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {usersList
                    .filter((u) => {
                      const q = userSearch.toLowerCase();
                      const matchesSearch =
                        u.accountId?.toLowerCase().includes(q) ||
                        u.email?.toLowerCase().includes(q) ||
                        u.role?.toLowerCase().includes(q) ||
                        u.authorityProfile?.name?.toLowerCase().includes(q);

                      const matchesRole =
                        userRoleFilter === 'ALL' ||
                        (userRoleFilter === 'ADMIN' && (u.role === 'SUPER_ADMIN' || u.role === 'COLLEGE_ADMIN')) ||
                        (userRoleFilter === 'AUTHORITY' && u.role === 'AUTHORITY') ||
                        (userRoleFilter === 'RECEPTION' && u.role === 'RECEPTION');

                      return matchesSearch && matchesRole;
                    })
                    .map((u) => {
                      const isSuperAdmin = u.role === 'SUPER_ADMIN';
                      const isCollegeAdmin = u.role === 'COLLEGE_ADMIN';
                      const isReception = u.role === 'RECEPTION';
                      const isAuthority = u.role === 'AUTHORITY';

                      const roleBadgeColor = isSuperAdmin
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                        : isCollegeAdmin
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : isAuthority
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400">
                              {u.accountId}
                            </span>
                            {u.id === user?.id && (
                              <span className="text-[10px] font-sans font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                (You)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeColor}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.authorityProfile ? (
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {u.authorityProfile.name}
                                </span>
                                <span className="block text-[11px] text-slate-400">
                                  {u.authorityProfile.designation}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">
                                {isSuperAdmin || isCollegeAdmin ? 'Executive System Admin' : 'Campus Receptionist'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition flex items-center gap-1 ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-rose-100 hover:text-rose-800'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 hover:bg-emerald-100 hover:text-emerald-800'
                              }`}
                              title="Click to toggle status"
                            >
                              {u.status === 'ACTIVE' ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  <span>Disabled</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl font-semibold flex items-center gap-1.5 transition text-xs shadow-sm"
                                title="Change User ID or Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Change ID / Password</span>
                              </button>

                              {u.id !== user?.id && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {usersList.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No users loaded. Click refresh above to load user accounts.
                </div>
              )}
            </div>
          </div>

          {/* EDIT USER ID & PASSWORD MODAL */}
          {showEditUserModal && editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Edit Credentials: {editingUser.accountId}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Admin can update the login User ID, reset password, or change role.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditUserModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {userActionError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                    {userActionError}
                  </div>
                )}

                {userActionSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{userActionSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      User ID (Login Account ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={editUserForm.accountId}
                      onChange={(e) => setEditUserForm({ ...editUserForm, accountId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      The ID used to log in (e.g. DIRECTOR-001, ADMIN-001, RECEPTION-01).
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Leave blank to keep existing password"
                        value={editUserForm.password}
                        onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Enter at least 6 characters if you want to reset this user's password.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={editUserForm.email}
                        onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        System Role
                      </label>
                      <select
                        value={editUserForm.role}
                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="COLLEGE_ADMIN">College Admin</option>
                        <option value="AUTHORITY">Authority / Faculty Head</option>
                        <option value="RECEPTION">Reception Staff</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account Status
                    </label>
                    <select
                      value={editUserForm.status}
                      onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE (Can log in)</option>
                      <option value="DISABLED">DISABLED (Login blocked)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowEditUserModal(false)}
                      className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={userActionLoading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {userActionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Credentials</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CREATE NEW USER MODAL */}
          {showCreateUserModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Create New User Account
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Create login credentials for a new authority, receptionist, or administrator.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreateUserModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {userActionError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                    {userActionError}
                  </div>
                )}

                {userActionSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{userActionSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      User ID (Login Account ID) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DEAN-001, STAFF-01, ADMIN-02"
                      value={newUserForm.accountId}
                      onChange={(e) => setNewUserForm({ ...newUserForm, accountId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Initial Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="user@college.edu"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Role *
                      </label>
                      <select
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="AUTHORITY">Authority / Faculty Head</option>
                        <option value="RECEPTION">Reception Staff</option>
                        <option value="COLLEGE_ADMIN">College Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowCreateUserModal(false)}
                      className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={userActionLoading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {userActionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Create Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Authorities ({authorities.length})</h3>
              <span className="text-[11px] text-slate-400">Click "Edit" to modify details or reset password</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {authorities.map((a) => (
                <div
                  key={a.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.name}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {a.designation}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      🏢 {a.department?.name || 'Department Head'} • 📍 {a.officeLocation || 'Main Office'} {a.email && `• ✉️ ${a.email}`} {a.mobile && `• 📞 ${a.mobile}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleAuthorityAccepting(a)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                        a.isAcceptingAppointments
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                      title="Click to toggle appointment acceptance"
                    >
                      <span className={`w-2 h-2 rounded-full ${a.isAcceptingAppointments ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{a.isAcceptingAppointments ? 'Accepting Visits' : 'Visits Paused'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditAuthority(a)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAuthority(a)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Delete Authority"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EDIT AUTHORITY MODAL */}
          {showEditAuthModal && editingAuth && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Edit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Edit Authority Profile & Settings
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Update name, designation, department, office location, or reset password.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditAuthModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {authActionError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                    {authActionError}
                  </div>
                )}

                {authActionSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{authActionSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEditAuthority} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editAuthForm.name}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Designation *
                      </label>
                      <input
                        type="text"
                        required
                        value={editAuthForm.designation}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, designation: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Department *
                      </label>
                      <select
                        required
                        value={editAuthForm.departmentId}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, departmentId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Office Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={editAuthForm.officeLocation}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, officeLocation: e.target.value })}
                        placeholder="e.g. Room 204, Academic Block"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={editAuthForm.email}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, email: e.target.value })}
                        placeholder="e.g. faculty@college.edu"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={editAuthForm.mobile}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, mobile: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Bio / Short Note
                    </label>
                    <textarea
                      rows={2}
                      value={editAuthForm.bio}
                      onChange={(e) => setEditAuthForm({ ...editAuthForm, bio: e.target.value })}
                      placeholder="Brief research domain or appointment instructions..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={editAuthForm.isAcceptingAppointments}
                        onChange={(e) => setEditAuthForm({ ...editAuthForm, isAcceptingAppointments: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Accepting Visitor Appointments</span>
                    </label>
                    <p className="text-[10px] text-slate-400 ml-6">
                      Uncheck this to temporarily pause incoming appointment requests on the visitor kiosk.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reset Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={editAuthForm.password}
                      onChange={(e) => setEditAuthForm({ ...editAuthForm, password: e.target.value })}
                      placeholder="Leave blank to keep existing password unchanged"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowEditAuthModal(false)}
                      className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={authActionLoading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {authActionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Existing Departments ({departments.length})</h3>
              <span className="text-[11px] text-slate-400">Click "Edit" to modify department details</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {departments.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl flex items-center justify-between text-xs hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 dark:text-white text-sm">{d.name}</strong>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {d.code}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      📍 {d.officeLocation || 'Main Block'} {d.description && `• ${d.description}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDept(d)}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl font-bold flex items-center gap-1 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDept(d.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                      title="Delete Department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* EDIT DEPARTMENT MODAL */}
          {showEditDeptModal && editingDept && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <Edit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        Edit Department
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Update department name, code, or office location.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditDeptModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {deptActionError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
                    {deptActionError}
                  </div>
                )}

                {deptActionSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{deptActionSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEditDept} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editDeptForm.name}
                      onChange={(e) => setEditDeptForm({ ...editDeptForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={editDeptForm.code}
                      onChange={(e) => setEditDeptForm({ ...editDeptForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Office Location
                    </label>
                    <input
                      type="text"
                      value={editDeptForm.officeLocation}
                      onChange={(e) => setEditDeptForm({ ...editDeptForm, officeLocation: e.target.value })}
                      placeholder="e.g. Science Block, 2nd Floor"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Description / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editDeptForm.description}
                      onChange={(e) => setEditDeptForm({ ...editDeptForm, description: e.target.value })}
                      placeholder="Specializations, lab details, or visiting guidelines..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowEditDeptModal(false)}
                      className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deptActionLoading}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                    >
                      {deptActionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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

                  {/* Welcome Greeting & Hero Badge Customization */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hero Welcome Heading
                    </label>
                    <input
                      type="text"
                      value={settingsForm.welcomeHeading || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, welcomeHeading: e.target.value })}
                      placeholder="e.g. Welcome to or नमस्ते / स्वागत है"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Greeting prefix displayed directly above the college name.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Hero Pill Badge Text
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroBadgeText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroBadgeText: e.target.value })}
                      placeholder="e.g. Digital Reception Kiosk or AI Smart Campus"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Glowing pill tag shown at the top of the kiosk banner.
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
                              src={resolveAssetUrl(settingsForm.siteLogoUrl)}
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
                            placeholder="e.g. logo.png or /uploads/logos/logo.png"
                            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>

                        <p className="text-[11px] text-slate-400">
                          Recommended: 512×512px transparent PNG / SVG. Max file size: 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* COLOR SCHEME & THEME CUSTOMIZATION */}
                  <div className="sm:col-span-2 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-600" />
                        <span>Website Theme Colors & Brand Palette</span>
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Choose primary brand color and secondary accent. Applies across buttons, banners, badges, and kiosk elements.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Primary Color */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                        <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                          Primary Brand Theme Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settingsForm.themeColor || '#1e3a8a'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, themeColor: e.target.value })}
                            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={settingsForm.themeColor || '#1e3a8a'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, themeColor: e.target.value })}
                            className="w-28 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">Quick Color Presets:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {THEME_COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => setSettingsForm({ ...settingsForm, themeColor: preset.hex })}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 hover:scale-105 transition"
                              >
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                                <span>{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Secondary Accent Color */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                        <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs">
                          Secondary Accent Color
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={settingsForm.secondaryColor || '#3b82f6'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                            className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={settingsForm.secondaryColor || '#3b82f6'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, secondaryColor: e.target.value })}
                            className="w-28 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono uppercase"
                          />
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-semibold block">Quick Accent Presets:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {SECONDARY_COLOR_PRESETS.map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => setSettingsForm({ ...settingsForm, secondaryColor: preset.hex })}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 hover:scale-105 transition"
                              >
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                                <span>{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FULL WEBSITE BACKGROUND CUSTOMIZATION STUDIO (WITH VIDEO LOOP SUPPORT) */}
                  <div className="sm:col-span-2 space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <Video className="w-5 h-5 text-indigo-600" />
                          <span>Website Background Studio (Video, Wallpaper, Gradient, or Color)</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                            Dynamic Full Customization
                          </span>
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Set a live looping ambient video, high-resolution wallpaper, cyber gradient, or solid color for the visitor kiosk and public portal.
                        </p>
                      </div>
                    </div>

                    {/* Mode Selector Tabs */}
                    <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
                      {[
                        { id: 'default', label: 'Default Theme', icon: Landmark, desc: 'Clean slate look' },
                        { id: 'video', label: '🎥 Looping Video', icon: Video, desc: 'Ambient MP4 video loop' },
                        { id: 'image', label: '🖼️ Image Wallpaper', icon: ImageIcon, desc: 'Custom photo background' },
                        { id: 'gradient', label: '✨ Modern Gradient', icon: Sparkles, desc: 'Dynamic CSS gradient' },
                        { id: 'color', label: '🎨 Solid Color', icon: Palette, desc: 'Custom background color' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, backgroundType: mode.id })}
                          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl font-bold text-xs transition flex flex-col items-center gap-0.5 text-center ${
                            (settingsForm.backgroundType || 'default') === mode.id
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700/60'
                          }`}
                        >
                          <span className="font-bold">{mode.label}</span>
                          <span className={`text-[10px] ${
                            (settingsForm.backgroundType || 'default') === mode.id ? 'text-blue-200' : 'text-slate-400'
                          }`}>
                            {mode.desc}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Background Mode Content Controls */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* Left: Controls for active background mode */}
                      <div className="lg:col-span-7 space-y-4">
                        {/* MODE: VIDEO */}
                        {settingsForm.backgroundType === 'video' && (
                          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Video className="w-4 h-4 text-indigo-600" />
                                <span>Background Video Settings (MP4 / WebM)</span>
                              </span>
                              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                                Auto-loops Muted
                              </span>
                            </div>

                            {/* Presets */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                1-Click Curated Royalty-Free Video Loops:
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {BACKGROUND_VIDEO_PRESETS.map((v) => {
                                  const isSelected = settingsForm.backgroundVideoUrl === v.url;
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      onClick={() => setSettingsForm({ ...settingsForm, backgroundVideoUrl: v.url })}
                                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                                        isSelected
                                          ? 'border-indigo-600 bg-indigo-100/70 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30 font-bold'
                                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                                      }`}
                                    >
                                      <div>
                                        <p className="text-xs font-semibold">{v.name}</p>
                                        <span className="text-[10px] text-slate-400">{v.badge}</span>
                                      </div>
                                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Direct URL & Upload */}
                            <div className="space-y-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                              <label className="block text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                                Or Enter Direct Video URL (MP4 / WebM):
                              </label>
                              <input
                                type="text"
                                value={settingsForm.backgroundVideoUrl || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, backgroundVideoUrl: e.target.value })}
                                placeholder="https://example.com/ambient-campus.mp4"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                              />

                              <div className="flex items-center gap-2 pt-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Local Video File (MP4)</span>
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    onChange={handleBackgroundVideoUpload}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-[10px] text-slate-400">Max recommended: 30MB</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MODE: IMAGE */}
                        {settingsForm.backgroundType === 'image' && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                              Custom Image Wallpaper Settings
                            </span>

                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                                Curated Campus Wallpaper Presets:
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                {BACKGROUND_IMAGE_PRESETS.map((img, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSettingsForm({ ...settingsForm, backgroundImageUrl: img.url })}
                                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2 text-left hover:scale-105 transition overflow-hidden"
                                  >
                                    <img src={img.url} alt={img.name} className="w-10 h-8 rounded-lg object-cover" />
                                    <span className="text-xs font-semibold truncate">{img.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                              <label className="block text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                                Or Enter Image URL / File Path:
                              </label>
                              <input
                                type="text"
                                value={settingsForm.backgroundImageUrl || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, backgroundImageUrl: e.target.value })}
                                placeholder="https://example.com/wallpaper.jpg"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />

                              <div className="flex items-center gap-2 pt-1">
                                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload Wallpaper Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBackgroundImageUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MODE: GRADIENT */}
                        {settingsForm.backgroundType === 'gradient' && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                              Modern Gradient Presets (1-Click Select)
                            </span>

                            <div className="grid grid-cols-2 gap-2">
                              {BACKGROUND_GRADIENT_PRESETS.map((grad, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSettingsForm({ ...settingsForm, backgroundGradient: grad.css })}
                                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-left flex items-center gap-2 text-white font-bold text-xs shadow hover:scale-105 transition"
                                  style={{ background: grad.css }}
                                >
                                  <span>{grad.name}</span>
                                </button>
                              ))}
                            </div>

                            <div>
                              <label className="block text-slate-700 dark:text-slate-300 text-[11px] font-bold mb-1">
                                Custom CSS Linear Gradient:
                              </label>
                              <input
                                type="text"
                                value={settingsForm.backgroundGradient || ''}
                                onChange={(e) => setSettingsForm({ ...settingsForm, backgroundGradient: e.target.value })}
                                placeholder="linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </div>
                          </div>
                        )}

                        {/* MODE: SOLID COLOR */}
                        {settingsForm.backgroundType === 'color' && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                              Custom Solid Background Color
                            </span>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={settingsForm.backgroundColor || '#0f172a'}
                                onChange={(e) => setSettingsForm({ ...settingsForm, backgroundColor: e.target.value })}
                                className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
                              />
                              <input
                                type="text"
                                value={settingsForm.backgroundColor || '#0f172a'}
                                onChange={(e) => setSettingsForm({ ...settingsForm, backgroundColor: e.target.value })}
                                className="w-32 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono uppercase"
                              />
                            </div>
                          </div>
                        )}

                        {/* Common Sliders: Overlay Opacity & Blur for Video/Image */}
                        {(settingsForm.backgroundType === 'video' || settingsForm.backgroundType === 'image') && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Sliders className="w-4 h-4 text-blue-600" />
                                <span>Readability & Visual Atmosphere Controls</span>
                              </span>
                              <span className="text-[10px] text-slate-400">Keeps kiosk text easily readable</span>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                  <span>Dark Overlay Opacity:</span>
                                  <span className="font-mono text-blue-600 dark:text-blue-400">
                                    {settingsForm.backgroundOverlayOpacity ?? 60}%
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={settingsForm.backgroundOverlayOpacity ?? 60}
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, backgroundOverlayOpacity: Number(e.target.value) })
                                  }
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                                  <span>0% (Raw Media)</span>
                                  <span>60% (Recommended)</span>
                                  <span>100% (Solid Black)</span>
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                  <span>Background Blur Filter:</span>
                                  <span className="font-mono text-blue-600 dark:text-blue-400">
                                    {settingsForm.backgroundBlur ?? 0}px
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="20"
                                  step="1"
                                  value={settingsForm.backgroundBlur ?? 0}
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, backgroundBlur: Number(e.target.value) })
                                  }
                                  className="w-full accent-blue-600 cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                                  <span>0px (Crisp)</span>
                                  <span>5px (Soft Focus)</span>
                                  <span>20px (Deep Blur)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Real-Time Interactive Miniature Kiosk Simulator */}
                      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl text-white flex flex-col items-center">
                        <div className="w-full flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>Live Kiosk Simulator</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Preview
                          </span>
                        </div>

                        {/* Interactive Screen Frame */}
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col justify-between p-4 bg-slate-950">
                          {/* Background Media inside frame */}
                          {settingsForm.backgroundType === 'video' && settingsForm.backgroundVideoUrl && (
                            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                              <video
                                key={settingsForm.backgroundVideoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                src={resolveAssetUrl(settingsForm.backgroundVideoUrl)}
                                className="w-full h-full object-cover"
                                style={{
                                  filter: settingsForm.backgroundBlur ? `blur(${settingsForm.backgroundBlur}px)` : undefined,
                                  transform: settingsForm.backgroundBlur ? 'scale(1.08)' : undefined
                                }}
                              />
                              <div
                                className="absolute inset-0 bg-slate-950"
                                style={{ opacity: (settingsForm.backgroundOverlayOpacity ?? 60) / 100 }}
                              />
                            </div>
                          )}

                          {settingsForm.backgroundType === 'image' && settingsForm.backgroundImageUrl && (
                            <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
                              <div
                                className="w-full h-full bg-cover bg-center"
                                style={{
                                  backgroundImage: `url("${resolveAssetUrl(settingsForm.backgroundImageUrl)}")`,
                                  filter: settingsForm.backgroundBlur ? `blur(${settingsForm.backgroundBlur}px)` : undefined,
                                  transform: settingsForm.backgroundBlur ? 'scale(1.08)' : undefined
                                }}
                              />
                              <div
                                className="absolute inset-0 bg-slate-950"
                                style={{ opacity: (settingsForm.backgroundOverlayOpacity ?? 60) / 100 }}
                              />
                            </div>
                          )}

                          {settingsForm.backgroundType === 'gradient' && (
                            <div
                              className="absolute inset-0 pointer-events-none -z-10"
                              style={{ background: settingsForm.backgroundGradient }}
                            />
                          )}

                          {settingsForm.backgroundType === 'color' && (
                            <div
                              className="absolute inset-0 pointer-events-none -z-10"
                              style={{ backgroundColor: settingsForm.backgroundColor }}
                            />
                          )}

                          {/* Kiosk Header bar */}
                          <div className="flex items-center justify-between text-[10px] bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 w-full">
                            <div className="flex items-center gap-1.5 truncate">
                              <img
                                src={resolveAssetUrl(settingsForm.siteLogoUrl || 'logo.png')}
                                alt="Emblem"
                                className="w-4 h-4 rounded-full object-cover border border-white/20 shrink-0"
                              />
                              <span className="font-bold truncate text-[9px]">
                                {settingsForm.siteName || 'College Kiosk'}
                              </span>
                            </div>
                            <span className="text-[8px] text-slate-300 font-mono">10:00 AM</span>
                          </div>

                          {/* Kiosk Hero Center Card */}
                          <div className="my-auto text-center space-y-1.5 bg-slate-900/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-lg max-w-[90%] mx-auto">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[8px] font-bold">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>{settingsForm.heroBadgeText || 'Digital Reception Kiosk'}</span>
                            </div>

                            <h5 className="text-xs font-black leading-tight">
                              <span className="text-slate-200">
                                {settingsForm.welcomeHeading || 'Welcome to'}{' '}
                              </span>
                              <span
                                className="text-transparent bg-clip-text"
                                style={{
                                  backgroundImage: `linear-gradient(to right, ${settingsForm.secondaryColor || '#3b82f6'}, #93c5fd)`
                                }}
                              >
                                {settingsForm.siteName || 'RAVAN College'}
                              </span>
                            </h5>

                            <p className="text-[9px] text-slate-300 line-clamp-1">
                              {settingsForm.tagline || 'AI Visitor Management'}
                            </p>

                            <div className="pt-1 flex items-center justify-center gap-2">
                              <span
                                className="px-2.5 py-1 text-[8px] font-bold text-white rounded-lg shadow"
                                style={{ backgroundColor: settingsForm.themeColor || '#1e3a8a' }}
                              >
                                Track Status
                              </span>
                              <span className="px-2.5 py-1 text-[8px] font-bold bg-white/10 text-white rounded-lg border border-white/20">
                                Meet Authority
                              </span>
                            </div>
                          </div>

                          {/* Kiosk Action row preview */}
                          <div className="grid grid-cols-3 gap-1.5 w-full">
                            {['Book Visit', 'Departments', 'Ask AI'].map((lbl, i) => (
                              <div
                                key={i}
                                className="p-1.5 bg-slate-900/70 backdrop-blur-md rounded-xl border border-white/10 text-center text-[8px] font-bold text-slate-200"
                              >
                                {lbl}
                              </div>
                            ))}
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 mt-3 text-center">
                          Simulated live view. Real background video and frosted glass effects will render across all pages.
                        </span>
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
                                src={resolveAssetUrl(preset.url)}
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
                                    src={resolveAssetUrl(settingsForm.appLogoUrl || settingsForm.siteLogoUrl)}
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
                                    src={resolveAssetUrl(settingsForm.appLogoUrl || settingsForm.siteLogoUrl)}
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
                                      src={resolveAssetUrl(settingsForm.appLogoUrl || settingsForm.siteLogoUrl)}
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
