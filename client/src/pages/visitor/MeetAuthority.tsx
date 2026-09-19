import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, MapPin, Clock, ArrowRight, Search, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

interface Authority {
  id: string;
  name: string;
  designation: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  officeLocation: string;
  visitingHours: string;
  profilePhotoUrl?: string;
  isAcceptingAppointments: boolean;
  bio?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export const MeetAuthority: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirectory();
  }, []);

  const loadDirectory = async () => {
    try {
      const [authRes, deptRes] = await Promise.all([
        api.get<{ success: boolean; authorities: Authority[] }>('/authorities'),
        api.get<{ success: boolean; departments: Department[] }>('/admin/departments')
      ]);

      if (authRes.success) setAuthorities(authRes.authorities);
      if (deptRes.success) setDepartments(deptRes.departments);
    } catch (e) {
      console.error('Failed to load directory:', e);
    } finally {
      setLoading(false);
    }
  };

  const parseSchedule = (scheduleStr: string) => {
    try {
      const parsed = JSON.parse(scheduleStr);
      const days = parsed.days ? parsed.days.join(', ') : 'Mon - Fri';
      const time = parsed.startTime && parsed.endTime ? `${parsed.startTime} - ${parsed.endTime}` : 'Regular Hours';
      return `${days} (${time})`;
    } catch {
      return scheduleStr || 'Contact Office';
    }
  };

  const filteredAuthorities = authorities.filter((a) => {
    const matchesDept = selectedDeptId === 'ALL' || a.department?.id === selectedDeptId;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.officeLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          {t('meet_authority', 'Meet an Authority')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Browse by category or department and request an official appointment.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Department / Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedDeptId('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
              selectedDeptId === 'ALL'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDeptId(d.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                selectedDeptId === d.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder', 'Search authority name...')}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
        </div>
      </div>

      {/* Authorities Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading directory...</div>
      ) : filteredAuthorities.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          {t('no_results', 'No authorities found matching criteria.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthorities.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {a.name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, '')[0] || 'A'}
                  </div>
                  <div>
                    {a.isAcceptingAppointments ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {t('status_available', 'Available')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <XCircle className="w-3 h-3 text-slate-400" />
                        {t('status_unavailable', 'Unavailable')}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {a.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {a.designation}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {a.department?.name}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{a.officeLocation}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{parseSchedule(a.visitingHours)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={!a.isAcceptingAppointments}
                  onClick={() => navigate(`/book/${a.id}`)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>{t('request_appointment', 'Request Appointment')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
