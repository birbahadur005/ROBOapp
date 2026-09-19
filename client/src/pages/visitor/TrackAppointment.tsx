import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Radio, CheckCircle, Clock, MapPin, Building, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { StatusBadge } from '../../components/StatusBadge';
import { QRPassPresenter } from '../../components/QRPassPresenter';

export const TrackAppointment: React.FC = () => {
  const { t } = useLanguage();
  const { subscribeToAppointment, lastUpdate } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [referenceNo, setReferenceNo] = useState(searchParams.get('referenceNo') || '');
  const [mobile, setMobile] = useState(searchParams.get('mobile') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);

  // Auto track if query params present
  useEffect(() => {
    if (referenceNo && mobile) {
      handleTrack();
    }
  }, []);

  // Listen for real-time WebSocket update for this appointment
  useEffect(() => {
    if (lastUpdate && appointment && lastUpdate.referenceNo === appointment.referenceNo) {
      // Live reload appointment state
      handleTrack();
    }
  }, [lastUpdate]);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!referenceNo.trim() || !mobile.trim()) {
      setError('Please provide both Appointment Reference Number and registered Mobile Number.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.get<{ success: boolean; appointment: any }>(
        `/appointments/track?referenceNo=${referenceNo.trim()}&mobile=${mobile.trim()}`
      );

      if (res.success && res.appointment) {
        setAppointment(res.appointment);
        // Subscribe to WebSocket live channel for this reference number
        subscribeToAppointment(res.appointment.referenceNo);
        // Update URL query parameters
        setSearchParams({ referenceNo: res.appointment.referenceNo, mobile });
      }
    } catch (err: any) {
      setError(err.message || 'Appointment not found or details mismatch.');
      setAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {t('track_header', 'Check Appointment Status')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          {t('track_instructions', 'Enter your Appointment Reference Number and registered Mobile Number.')}
        </p>
      </div>

      {/* Lookup Card */}
      <form
        onSubmit={handleTrack}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('reference_number', 'Reference Number')}
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RAVAN-2026-000001"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('mobile_number', 'Registered Mobile')}
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow flex items-center justify-center gap-2 text-sm transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{t('check_status_btn', 'Check Status')}</span>
        </button>
      </form>

      {/* Appointment Result Card */}
      {appointment && (
        <div className="space-y-6 animate-in fade-in">
          {/* Status Header Pill */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Appointment Reference</span>
                <h3 className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
                  {appointment.referenceNo}
                </h3>
              </div>
              <StatusBadge status={appointment.status} size="lg" />
            </div>

            {/* Authority & Meeting Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Meeting With:</span>
                <p className="font-bold text-slate-900 dark:text-white">{appointment.authorityName}</p>
                <p className="text-slate-500">{appointment.designation} ({appointment.department})</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Office / Location:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{appointment.location || appointment.officeLocation}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-xs font-semibold">Requested Slot:</span>
                <p className="text-slate-700 dark:text-slate-300">{appointment.requestedDate} at {appointment.requestedTime}</p>
              </div>

              {appointment.scheduledDate && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-semibold">Confirmed Scheduled Slot:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {appointment.scheduledDate} at {appointment.scheduledTime} ({appointment.durationMinutes} mins)
                  </p>
                </div>
              )}
            </div>

            {appointment.authorityMessage && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl text-xs text-blue-900 dark:text-blue-200">
                <strong>Authority Note:</strong> {appointment.authorityMessage}
              </div>
            )}
          </div>

          {/* If Accepted or Rescheduled: Display QR Pass */}
          {(appointment.status === 'ACCEPTED' || appointment.status === 'RESCHEDULED') && appointment.qrDataUrl && (
            <div className="pt-2">
              <QRPassPresenter appointment={appointment} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
