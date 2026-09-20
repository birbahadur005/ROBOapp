import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';

import { Navbar } from './components/Navbar';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { GlobalBackground } from './components/GlobalBackground';

import { VisitorHome } from './pages/visitor/VisitorHome';
import { MeetAuthority } from './pages/visitor/MeetAuthority';
import { BookAppointment } from './pages/visitor/BookAppointment';
import { TrackAppointment } from './pages/visitor/TrackAppointment';
import { DepartmentsList } from './pages/visitor/DepartmentsList';
import { CollegeInfo } from './pages/visitor/CollegeInfo';
import { CampusMapPage } from './pages/visitor/CampusMapPage';
import { AnnouncementsPage } from './pages/visitor/AnnouncementsPage';

import { AuthorityLogin } from './pages/authority/AuthorityLogin';
import { AuthorityDashboard } from './pages/authority/AuthorityDashboard';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';

import { ReceptionDesk } from './pages/reception/ReceptionDesk';

// Protected Route wrappers
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Verifying session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500 mt-2">
          Your role ({user.role}) is not authorized to access this interface.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// Global Live Broadcast Banner
const RealTimeNotificationBanner: React.FC = () => {
  const { newRequestAlert } = useSocket();
  const { user } = useAuth();
  const [visible, setVisible] = React.useState(false);
  const [alertData, setAlertData] = React.useState<any>(null);

  React.useEffect(() => {
    if (newRequestAlert) {
      // If authority or reception/admin
      if (
        user?.role === 'SUPER_ADMIN' ||
        user?.role === 'COLLEGE_ADMIN' ||
        user?.role === 'RECEPTION' ||
        (user?.authorityProfile && user?.authorityProfile.id === newRequestAlert.authorityId)
      ) {
        setAlertData(newRequestAlert);
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [newRequestAlert, user]);

  if (!visible || !alertData) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm bg-blue-600 text-white p-4 rounded-2xl shadow-2xl border border-blue-400 animate-in slide-in-from-top-4 flex items-center justify-between gap-3">
      <div className="text-left text-xs">
        <strong className="block text-sm">New Visitor Request!</strong>
        <span>{alertData.visitorName} requested to meet on {alertData.requestedDate}</span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg"
      >
        Dismiss
      </button>
    </div>
  );
};

const DynamicFooter: React.FC = () => {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-600 dark:text-slate-400">
        {settings.collegePhone && <span>📞 Reception: {settings.collegePhone}</span>}
        {settings.emergencyPhone && (
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            🚨 Emergency: {settings.emergencyPhone}
          </span>
        )}
        {settings.collegeEmail && <span>✉️ {settings.collegeEmail}</span>}
        {settings.visitingHoursGeneral && <span>🕒 Visiting: {settings.visitingHoursGeneral}</span>}
      </div>
      {settings.collegeAddress && (
        <p className="text-[11px] text-slate-400">{settings.collegeAddress}</p>
      )}
      <p className="text-[11px]">
        {settings.collegeName} &copy; {new Date().getFullYear()}. {settings.tagline}
      </p>
    </footer>
  );
};

const AppShell: React.FC = () => {
  const { settings } = useSettings();
  const hasCustomBg = settings.backgroundType && settings.backgroundType !== 'default';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        hasCustomBg
          ? 'bg-transparent text-slate-900 dark:text-slate-100'
          : 'bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100'
      }`}
    >
      <GlobalBackground />
      <Navbar />
      <RealTimeNotificationBanner />

      <main className="flex-1">
        <Routes>
          {/* Visitor Kiosk & Public Interfaces */}
          <Route path="/" element={<VisitorHome />} />
          <Route path="/authorities" element={<MeetAuthority />} />
          <Route path="/book/:authorityId" element={<BookAppointment />} />
          <Route path="/track" element={<TrackAppointment />} />
          <Route path="/departments" element={<DepartmentsList />} />
          <Route path="/college-info" element={<CollegeInfo />} />
          <Route path="/campus-map" element={<CampusMapPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />

          {/* Authority Portal */}
          <Route path="/authority/login" element={<AuthorityLogin />} />
          <Route
            path="/authority/dashboard"
            element={
              <ProtectedRoute allowedRoles={['AUTHORITY', 'COLLEGE_ADMIN', 'SUPER_ADMIN']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Reception Desk */}
          <Route
            path="/reception"
            element={
              <ProtectedRoute allowedRoles={['RECEPTION', 'COLLEGE_ADMIN', 'SUPER_ADMIN']}>
                <ReceptionDesk />
              </ProtectedRoute>
            }
          />

          {/* College Admin Dashboard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['COLLEGE_ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Dynamic Configured Footer */}
      <DynamicFooter />

      {/* Progressive Web App prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <SettingsProvider>
            <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
              <AppShell />
            </Router>
          </SettingsProvider>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
