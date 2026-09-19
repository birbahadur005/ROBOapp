import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, Search, GraduationCap, FileCheck, Clock, ShieldAlert, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

interface InfoItem {
  id: string;
  category: string;
  title: string;
  contentEn: string;
  contentHi: string;
  priority: number;
}

export const CollegeInfo: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const [items, setItems] = useState<InfoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'ALL', label: 'All Topics', icon: BookOpen },
    { id: 'ABOUT', label: 'About College', icon: Info },
    { id: 'ADMISSION', label: 'Admissions', icon: GraduationCap },
    { id: 'EXAMINATION', label: 'Examinations', icon: FileCheck },
    { id: 'HOURS', label: 'Office Hours', icon: Clock },
    { id: 'EMERGENCY', label: 'Emergency & Help', icon: ShieldAlert }
  ];

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const res = await api.get<{ success: boolean; items: InfoItem[] }>('/college/info');
      if (res.success) {
        setItems(res.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const content = language === 'hi' ? item.contentHi : item.contentEn;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Info className="w-8 h-8 text-blue-600" />
          {t('college_info', 'College Information')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore official guidelines, admission details, examination policies, and emergency helpdesk.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search information..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Content Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading information...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          {t('no_results', 'No information found.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                  {item.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'hi' ? item.contentHi : item.contentEn}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
