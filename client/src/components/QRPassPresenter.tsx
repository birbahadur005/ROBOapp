import React from 'react';
import { Printer, Download, CheckCircle, Clock, MapPin, User, Building } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../i18n/LanguageContext';

interface QRPassProps {
  appointment: {
    referenceNo: string;
    visitorName: string;
    authorityName: string;
    designation: string;
    department: string;
    scheduledDate?: string;
    scheduledTime?: string;
    durationMinutes?: number;
    location?: string;
    authorityMessage?: string;
    qrDataUrl?: string;
  };
}

export const QRPassPresenter: React.FC<QRPassProps> = ({ appointment }) => {
  const { settings } = useSettings();
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!appointment.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = appointment.qrDataUrl;
    a.download = `visitor-pass-${appointment.referenceNo}.png`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 rounded-3xl p-6 shadow-2xl max-w-md mx-auto text-left relative overflow-hidden print:border print:shadow-none">
      {/* Decorative top ribbon */}
      <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500"></div>

      <div className="text-center pt-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{settings.collegeName}</h2>
        <p className="text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
          {t('visitor_pass', 'Official Digital Visitor Pass')}
        </p>
      </div>

      {/* QR Code Presentation */}
      <div className="my-5 flex flex-col items-center justify-center">
        {appointment.qrDataUrl ? (
          <div className="p-3 bg-white border-2 border-slate-300 rounded-2xl shadow-md">
            <img
              src={appointment.qrDataUrl}
              alt="Visitor QR Token"
              className="w-48 h-48 object-contain"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
            QR Pass Pending
          </div>
        )}
        <span className="mt-3 text-sm font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {appointment.referenceNo}
        </span>
      </div>

      {/* Pass Details */}
      <div className="space-y-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <User className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white">{appointment.visitorName}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Building className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Meeting: <strong className="text-slate-900 dark:text-white">{appointment.authorityName}</strong> ({appointment.designation})
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            {appointment.scheduledDate} at <strong>{appointment.scheduledTime}</strong> ({appointment.durationMinutes || 15} mins)
          </span>
        </div>

        {appointment.location && (
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{appointment.location}</span>
          </div>
        )}

        {appointment.authorityMessage && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs italic text-slate-600 dark:text-slate-400">
            "{appointment.authorityMessage}"
          </div>
        )}
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="mt-5 flex gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          {t('print_pass', 'Print Pass')}
        </button>
        {appointment.qrDataUrl && (
          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            title="Download QR"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
