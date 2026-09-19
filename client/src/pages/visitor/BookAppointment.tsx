import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Building,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Users
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import { CameraCapture } from '../../components/CameraCapture';

interface Authority {
  id: string;
  name: string;
  designation: string;
  department: { name: string };
  officeLocation: string;
  visitingHours: string;
}

export const BookAppointment: React.FC = () => {
  const { authorityId } = useParams<{ authorityId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const [authority, setAuthority] = useState<Authority | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);

  // Form State
  const [visitorName, setVisitorName] = useState('');
  const [visitorMobile, setVisitorMobile] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [numberOfVisitors, setNumberOfVisitors] = useState(1);
  const [requestedDate, setRequestedDate] = useState('');
  const [requestedTime, setRequestedTime] = useState('11:00');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  // Field requirement helper
  const isFieldRequired = (fieldName: string) => {
    if (!settings.requiredVisitorFields || settings.requiredVisitorFields.length === 0) {
      return ['visitorName', 'visitorMobile', 'purpose', 'requestedDate', 'requestedTime'].includes(fieldName);
    }
    return settings.requiredVisitorFields.includes(fieldName);
  };

  // Date boundary calculation
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + (settings.maxAdvanceBookingDays || 14));
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (authorityId) {
      loadAuthority(authorityId);
    }
  }, [authorityId]);

  const loadAuthority = async (id: string) => {
    try {
      const res = await api.get<{ success: boolean; authority: Authority }>(`/authorities/${id}`);
      if (res.success && res.authority) {
        setAuthority(res.authority);
      }
    } catch (e) {
      setError('Failed to load selected authority profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authority) return;

    setError(null);

    // Validate weekend appointments
    if (settings.allowWeekendAppointments === false && requestedDate) {
      const reqDate = new Date(requestedDate + 'T00:00:00');
      const dayOfWeek = reqDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        setError('Weekend appointments are disabled by college schedule policy. Please select a weekday (Monday to Friday).');
        return;
      }
    }

    // Validate photo mandatory requirement
    if (settings.requireVisitorPhoto && !photoBase64) {
      setError('Visitor photo capture is mandatory by college policy. Please capture or upload your photo before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        authorityId: authority.id,
        visitorName,
        visitorMobile,
        visitorEmail: visitorEmail || undefined,
        studentId: studentId || undefined,
        departmentName: departmentName || undefined,
        organization: organization || undefined,
        purpose,
        message: message || undefined,
        numberOfVisitors: Number(numberOfVisitors),
        requestedDate,
        requestedTime,
        photoBase64: photoBase64 || undefined
      };

      const res = await api.post<{ success: boolean; message: string; appointment: any }>('/appointments', payload);

      if (res.success && res.appointment) {
        setSuccessData(res.appointment);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit appointment request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading authority details...</div>;
  }

  if (successData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('request_submitted', 'Appointment Request Submitted!')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Your request has been delivered to {successData.authorityName}. You will receive status updates in real time.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {t('reference_number', 'Appointment Reference Number')}
            </span>
            <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">
              {successData.referenceNo}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/track?referenceNo=${successData.referenceNo}&mobile=${visitorMobile}`)}
              className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow transition"
            >
              {t('track_appointment', 'Track Status Live')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-2xl transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Authorities
      </button>

      {/* Selected Authority Summary Card */}
      {authority && (
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
              Requested Authority
            </span>
            <h2 className="text-xl font-bold mt-1">{authority.name}</h2>
            <p className="text-xs text-blue-100 font-medium">{authority.designation} — {authority.department.name}</p>
            <p className="text-xs text-blue-200 mt-1">Office: {authority.officeLocation}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          {t('visitor_details', 'Visitor Information')}
        </h3>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('visitor_name', 'Full Name')} {isFieldRequired('visitorName') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required={isFieldRequired('visitorName')}
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="e.g. Ramesh Verma"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('mobile_number', 'Mobile Number')} {isFieldRequired('visitorMobile') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required={isFieldRequired('visitorMobile')}
                value={visitorMobile}
                onChange={(e) => setVisitorMobile(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('email_optional', 'Email Address')} {isFieldRequired('visitorEmail') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required={isFieldRequired('visitorEmail')}
                value={visitorEmail}
                onChange={(e) => setVisitorEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('organization', 'Organization / Institute')} {isFieldRequired('organization') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required={isFieldRequired('organization')}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. ABC Technologies / University"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Student / Employee ID {isFieldRequired('studentId') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required={isFieldRequired('studentId')}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STU-2026-042 (Optional)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Department / Class {isFieldRequired('departmentName') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required={isFieldRequired('departmentName')}
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g. Computer Science & Engg."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('preferred_date', 'Preferred Date')} {isFieldRequired('requestedDate') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required={isFieldRequired('requestedDate')}
                min={todayStr}
                max={maxDateStr}
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Booking allowed up to {settings.maxAdvanceBookingDays || 14} days in advance.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('preferred_time', 'Preferred Time')} {isFieldRequired('requestedTime') && <span className="text-rose-500">*</span>}
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="time"
                required={isFieldRequired('requestedTime')}
                value={requestedTime}
                onChange={(e) => setRequestedTime(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Number of Visitors Attending (Group Size)
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min={1}
                max={settings.maxVisitorsPerRequest || 10}
                value={numberOfVisitors}
                onChange={(e) => setNumberOfVisitors(Math.max(1, Number(e.target.value)))}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Max permitted visitors per request: {settings.maxVisitorsPerRequest || 10} people.
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('purpose_of_visit', 'Purpose of Visit')} {isFieldRequired('purpose') && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="text"
            required={isFieldRequired('purpose')}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Discussion regarding AI Lab admission or certificate endorsement"
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {t('message_optional', 'Additional Message / Notes')} {isFieldRequired('message') && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            rows={2}
            required={isFieldRequired('message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any background information or special request..."
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
          />
        </div>

        {/* Visitor Photo Capture Section (Camera or file upload) */}
        {settings.allowCameraPhoto && (
          <div className="pt-2">
            <CameraCapture
              onPhotoCaptured={(base64) => setPhotoBase64(base64)}
              required={settings.requireVisitorPhoto}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg text-base flex items-center justify-center gap-2 transition"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{t('submitting', 'Submitting Request...')}</span>
            </>
          ) : (
            <span>{t('submit_request', 'Submit Appointment Request')}</span>
          )}
        </button>
      </form>
    </div>
  );
};
