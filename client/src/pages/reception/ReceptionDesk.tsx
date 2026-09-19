import React, { useEffect, useState } from 'react';
import {
  QrCode,
  Search,
  CheckCircle,
  Clock,
  User,
  ShieldCheck,
  Building,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';

export const ReceptionDesk: React.FC = () => {
  const { t } = useLanguage();

  const [searchRef, setSearchRef] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedAppointment, setVerifiedAppointment] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodayAppointments();
  }, []);

  const loadTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.get<{ success: boolean; appointments: any[] }>(`/appointments?date=${today}`);
      if (res.success) {
        setTodayAppointments(res.appointments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    setError(null);
    setVerifying(true);
    setVerifiedAppointment(null);

    try {
      const res = await api.post<{ success: boolean; appointment: any }>('/appointments/verify-qr', {
        qrToken: qrInput.trim()
      });

      if (res.success && res.appointment) {
        setVerifiedAppointment(res.appointment);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or unrecognized QR token.');
    } finally {
      setVerifying(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.post(`/appointments/${id}/complete`);
      loadTodayAppointments();
      if (verifiedAppointment && verifiedAppointment.id === id) {
        setVerifiedAppointment((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete appointment');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
          Gate & Lobby Security Checkpoint
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {t('reception_desk', 'Reception & Security Desk')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Verify visitor digital passes, check-in arrivals, and monitor today's scheduled guests.
        </p>
      </div>

      {/* QR Code Pass Verification Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Verify Digital QR Visitor Pass
          </h2>
        </div>

        <form onSubmit={handleVerifyQR} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Scan barcode/QR token string (e.g. RAVAN_PASS:RAVAN-2026-000001:...)"
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={verifying}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow flex items-center justify-center gap-2 transition"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Verify Pass</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Success Result */}
        {verifiedAppointment && (
          <div className="mt-4 p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Valid Official Pass
              </span>
              <StatusBadge status={verifiedAppointment.status} size="sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Visitor:</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{verifiedAppointment.visitorName}</p>
                <p className="text-slate-500">{verifiedAppointment.visitorMobile}</p>
              </div>
              <div>
                <span className="text-slate-400">Authority:</span>
                <p className="font-bold text-slate-900 dark:text-white">{verifiedAppointment.authority.name}</p>
                <p className="text-slate-500">{verifiedAppointment.location || verifiedAppointment.authority.officeLocation}</p>
              </div>
              <div>
                <span className="text-slate-400">Scheduled:</span>
                <p className="font-bold text-slate-900 dark:text-white">{verifiedAppointment.scheduledDate} at {verifiedAppointment.scheduledTime}</p>
                <p className="text-slate-500">{verifiedAppointment.durationMinutes || 15} minutes</p>
              </div>
            </div>

            {verifiedAppointment.status === 'ACCEPTED' && (
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleComplete(verifiedAppointment.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow transition"
                >
                  Mark Visit Completed
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Today's Scheduled Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Today's Visitors ({todayAppointments.length})
          </h2>
          <button
            onClick={loadTodayAppointments}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading today's list...</div>
        ) : todayAppointments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-xs">
            No scheduled visitors for today.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{appt.referenceNo}</span>
                    <StatusBadge status={appt.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{appt.visitorName}</h4>
                  <p className="text-slate-500">Meeting: {appt.authority.name} ({appt.authority.department.name})</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">{appt.scheduledTime || appt.requestedTime}</p>
                    <p className="text-slate-400">{appt.location || 'Office'}</p>
                  </div>
                  {appt.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleComplete(appt.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
