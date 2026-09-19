import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';
import { InteractiveCampusMap, CampusLocationItem } from '../../components/InteractiveCampusMap';

export const CampusMapPage: React.FC = () => {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<CampusLocationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const res = await api.get<{ success: boolean; locations: CampusLocationItem[] }>('/college/campus');
      if (res.success) {
        setLocations(res.locations);
      }
    } catch (e) {
      console.error('Failed to load campus locations:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <MapPin className="w-8 h-8 text-blue-600" />
          {t('campus_map', 'Campus Map & Navigation')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore campus buildings, laboratories, offices, classrooms, and emergency checkpoints.
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">Loading campus layout...</div>
      ) : (
        <InteractiveCampusMap locations={locations} />
      )}
    </div>
  );
};
