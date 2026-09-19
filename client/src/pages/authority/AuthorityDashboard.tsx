import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Building,
  Loader2,
  CalendarDays,
  Bell
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';

interface Appointment {
  id: string;
  referenceNo: string;
  visitorName: string;
  visitorMobile: string;
  visitorEmail?: string;
  purpose: string;
  message?: string;
  numberOfVisitors: number;
  requestedDate: string;
  requestedTime: string;
  scheduledDate?: string;
  scheduledTime?: string;
  durationMinutes: number;
  location?: string;
  status: string;
  authorityMessage?: string;
  internalNotes?: string;
  createdAt: string;
  visitorPhotoId?: string;
  photoSignedUrl?: string;
}

export const AuthorityDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lastUpdate, newRequestAlert } = useSocket();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACCEPTED' | 'RESCHEDULED' | 'COMPLETED' | 'ALL'>('PENDING');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'ACCEPT' | 'REJECT' | 'RESCHEDULE' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Action form state
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDuration, setFormDuration] = useState('15');
  const [formLocation, setFormLocation] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formInternalNotes, setFormInternalNotes] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  // Listen for WebSocket live updates
  useEffect(() => {
    if (lastUpdate || newRequestAlert) {
      loadAppointments();
    }
  }, [lastUpdate, newRequestAlert]);

  const loadAppointments = async () => {
    try {
      const res = await api.get<{ success: boolean; appointments: Appointment[] }>('/appointments');
      if (res.success) {
        setAppointments(res.appointments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (appt: Appointment, type: 'ACCEPT' | 'REJECT' | 'RESCHEDULE') => {
    setSelectedAppt(appt);
    setActionType(type);
    setActionError(null);
    setFormDate(appt.scheduledDate || appt.requestedDate);
    setFormTime(appt.scheduledTime || appt.requestedTime);
    setFormDuration(String(appt.durationMinutes || '15'));
    setFormLocation(appt.location || user?.authorityProfile?.officeLocation || '');
    setFormMessage('');
    setFormInternalNotes(appt.internalNotes || '');
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt || !actionType) return;

    setActionLoading(true);
    setActionError(null);

    try {
      if (actionType === 'ACCEPT') {
        await api.post(`/appointments/${selectedAppt.id}/accept`, {
          scheduledDate: formDate,
          scheduledTime: formTime,
          durationMinutes: parseInt(formDuration, 10),
          location: formLocation,
          authorityMessage: formMessage || 'Appointment accepted. Please report to office on time.',
          internalNotes: formInternalNotes
        });
      } else if (actionType === 'REJECT') {
        await api.post(`/appointments/${selectedAppt.id}/reject`, {
          reason: formMessage || 'Currently unavailable due to scheduled commitments.',
          internalNotes: formInternalNotes
        });
      } else if (actionType === 'RESCHEDULE') {
        await api.post(`/appointments/${selectedAppt.id}/reschedule`, {
          newDate: formDate,
          newTime: formTime,
          durationMinutes: parseInt(formDuration, 10),
          location: formLocation,
          message: formMessage || 'Appointment rescheduled to a new slot.',
          internalNotes: formInternalNotes
        });
      }

      setActionType(null);
      setSelectedAppt(null);
      loadAppointments();
    } catch (err: any) {
      setActionError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const acceptedCount = appointments.filter((a) => a.status === 'ACCEPTED').length;
  const rescheduledCount = appointments.filter((a) => a.status === 'RESCHEDULED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const filtered = appointments.filter((a) => {
    if (activeTab === 'ALL') return true;
    return a.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
            Official Authority Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {user?.authorityProfile?.name || user?.accountId}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {user?.authorityProfile?.designation} — Office: {user?.authorityProfile?.officeLocation}
          </p>
        </div>

        <button
          onClick={loadAppointments}
          className="self-start md:self-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`p-5 rounded-3xl border text-left transition ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Pending Requests</span>
          <p className="text-3xl font-extrabold mt-1">{pendingCount}</p>
        </button>

        <button
          onClick={() => setActiveTab('ACCEPTED')}
          className={`p-5 rounded-3xl border text-left transition ${
            activeTab === 'ACCEPTED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Accepted</span>
          <p className="text-3xl font-extrabold mt-1">{acceptedCount}</p>
        </button>

        <button
          onClick={() => setActiveTab('RESCHEDULED')}
          className={`p-5 rounded-3xl border text-left transition ${
            activeTab === 'RESCHEDULED'
              ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Rescheduled</span>
          <p className="text-3xl font-extrabold mt-1">{rescheduledCount}</p>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`p-5 rounded-3xl border text-left transition ${
            activeTab === 'COMPLETED'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400'
          }`}
        >
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Completed</span>
          <p className="text-3xl font-extrabold mt-1">{completedCount}</p>
        </button>
      </div>

      {/* Appointment Queue Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeTab === 'ALL' ? 'All Appointments' : `${activeTab} Appointments`} ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            No {activeTab.toLowerCase()} appointments found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300">
                      {appt.referenceNo}
                    </span>
                    <StatusBadge status={appt.status} size="sm" />
                    <span className="text-xs text-slate-400">
                      Requested {new Date(appt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {appt.visitorName}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {appt.visitorMobile}</span>
                      {appt.visitorEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {appt.visitorEmail}</span>}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                    <strong className="text-slate-900 dark:text-white">Purpose: </strong>
                    <span className="text-slate-700 dark:text-slate-300">{appt.purpose}</span>
                    {appt.message && (
                      <p className="mt-1 text-slate-500 italic">"{appt.message}"</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>
                        Requested: <strong>{appt.requestedDate}</strong> at <strong>{appt.requestedTime}</strong>
                      </span>
                    </div>

                    {appt.scheduledDate && (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          Confirmed: {appt.scheduledDate} at {appt.scheduledTime} ({appt.durationMinutes}m)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0 justify-end">
                  {appt.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => openActionModal(appt, 'ACCEPT')}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition"
                      >
                        {t('accept', 'Accept')}
                      </button>
                      <button
                        onClick={() => openActionModal(appt, 'RESCHEDULE')}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow transition"
                      >
                        {t('reschedule', 'Reschedule')}
                      </button>
                      <button
                        onClick={() => openActionModal(appt, 'REJECT')}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold text-xs rounded-xl border border-rose-200 transition"
                      >
                        {t('reject', 'Reject')}
                      </button>
                    </>
                  )}

                  {(appt.status === 'ACCEPTED' || appt.status === 'RESCHEDULED') && (
                    <>
                      <button
                        onClick={() => openActionModal(appt, 'RESCHEDULE')}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-100 transition"
                      >
                        Change Slot
                      </button>
                      <button
                        onClick={() => openActionModal(appt, 'REJECT')}
                        className="px-4 py-2 text-rose-600 text-xs font-semibold hover:bg-rose-50 rounded-xl transition"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal (Accept / Reject / Reschedule) */}
      {actionType && selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {actionType === 'ACCEPT' && 'Accept Appointment Request'}
                  {actionType === 'REJECT' && 'Reject Appointment Request'}
                  {actionType === 'RESCHEDULE' && 'Reschedule Appointment Slot'}
                </h3>
                <p className="text-xs text-slate-500">
                  Visitor: <strong>{selectedAppt.visitorName}</strong> ({selectedAppt.referenceNo})
                </p>
              </div>
              <button
                onClick={() => setActionType(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              {(actionType === 'ACCEPT' || actionType === 'RESCHEDULE') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Meeting Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Meeting Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Duration (Minutes)
                      </label>
                      <select
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="15">15 Minutes</option>
                        <option value="20">20 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">1 Hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Meeting Location
                      </label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Room 201, Director Office"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {actionType === 'REJECT' ? 'Reason for Rejection (Visible to Visitor) *' : 'Instructions for Visitor'}
                </label>
                <textarea
                  rows={2}
                  required={actionType === 'REJECT'}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={
                    actionType === 'REJECT'
                      ? 'Currently unavailable. Please contact the office for another appointment.'
                      : 'Please arrive 10 minutes prior with your photo ID.'
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Private Internal Notes (Never visible to visitor)
                </label>
                <textarea
                  rows={1}
                  value={formInternalNotes}
                  onChange={(e) => setFormInternalNotes(e.target.value)}
                  placeholder="Notes for office staff or records..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2 ${
                    actionType === 'ACCEPT'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : actionType === 'RESCHEDULE'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Confirm {actionType}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
