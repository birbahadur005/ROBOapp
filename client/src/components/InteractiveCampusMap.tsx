import React, { useState } from 'react';
import { MapPin, Navigation, Info, Search } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export interface CampusLocationItem {
  id: string;
  name: string;
  category: string;
  locationCode: string;
  description?: string;
  xCoord: number;
  yCoord: number;
  floorInfo?: string;
}

interface CampusMapProps {
  locations: CampusLocationItem[];
}

export const InteractiveCampusMap: React.FC<CampusMapProps> = ({ locations }) => {
  const { t } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState<CampusLocationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = locations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.locationCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder', 'Search building, department, room...')}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Campus Map Canvas */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-4 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="text-left mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" /> Interactive College Map
            </span>
            <span className="text-xs text-slate-500">Tap pin for details</span>
          </div>

          <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner">
            {/* Campus Pathways & Green Zones SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="0" y="0" width="100" height="100" fill="#090d16" />
              {/* Campus Roads */}
              <path d="M 15,90 L 15,20 L 85,20 L 85,80 L 15,80" stroke="#334155" strokeWidth="4" fill="none" />
              <path d="M 50,20 L 50,80" stroke="#334155" strokeWidth="3" fill="none" />
              <path d="M 15,50 L 85,50" stroke="#334155" strokeWidth="3" fill="none" />
              {/* Central Green Quadrangle */}
              <circle cx="50" cy="50" r="14" fill="#065f46" opacity="0.3" />
            </svg>

            {/* Interactive Location Markers */}
            {locations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedLocation(loc)}
                  style={{ left: `${loc.xCoord}%`, top: `${loc.yCoord}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div className={`p-2 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
                    isSelected
                      ? 'bg-blue-500 text-white ring-4 ring-blue-400/40'
                      : 'bg-slate-800 text-blue-400 border border-slate-700 hover:bg-blue-600 hover:text-white'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  {/* Floating Label */}
                  <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md pointer-events-none ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900/90 text-slate-300 border border-slate-800'
                  }`}>
                    {loc.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Location Card & Directory List */}
        <div className="space-y-4 text-left">
          {selectedLocation ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-3xl p-6 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg">
                  {selectedLocation.locationCode}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">{selectedLocation.category}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedLocation.name}</h3>
              {selectedLocation.floorInfo && (
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Floor / Room: {selectedLocation.floorInfo}
                </p>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedLocation.description || 'No description provided.'}
              </p>
              <button
                type="button"
                onClick={() => setSelectedLocation(null)}
                className="w-full mt-2 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-6 text-center text-slate-400 flex flex-col items-center justify-center gap-2 min-h-[160px]">
              <Info className="w-6 h-6 text-slate-400" />
              <p className="text-xs font-medium">Click any point on the map or select from the list below.</p>
            </div>
          )}

          {/* Quick List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm max-h-72 overflow-y-auto space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Campus Points of Interest</h4>
            {filteredLocations.map(loc => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                  selectedLocation?.id === loc.id
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">{loc.name}</span>
                </div>
                <span className="text-[10px] text-slate-400">{loc.floorInfo || loc.category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
