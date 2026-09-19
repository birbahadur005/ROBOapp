import React, { useEffect, useState } from 'react';
import { Bell, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

interface Announcement {
  id: string;
  title: string;
  description: string;
  priority: string;
  publishDate: string;
}

export const AnnouncementsPage: React.FC = () => {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await api.get<{ success: boolean; announcements: Announcement[] }>('/college/announcements');
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-blue-600" />
          {t('notices', 'Notices & Announcements')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Stay updated with official college notices, event alerts, and circulars.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          No active announcements at this time.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getPriorityBadge(ann.priority)}`}>
                  {ann.priority} Notice
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(ann.publishDate).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {ann.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {ann.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
