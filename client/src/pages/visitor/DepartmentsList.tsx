import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Users, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../i18n/LanguageContext';

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  officeLocation?: string;
  contactEmail?: string;
  contactPhone?: string;
  _count?: { authorities: number };
}

export const DepartmentsList: React.FC = () => {
  const { t } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const res = await api.get<{ success: boolean; departments: Department[] }>('/admin/departments');
      if (res.success) {
        setDepartments(res.departments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          {t('find_department', 'Academic & Administrative Departments')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Locate departments, office locations, and connected faculty authorities.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
          No departments registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg">
                    {dept.code}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {dept._count?.authorities || 0} Authorities
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {dept.name}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {dept.description || 'Department office and academic block.'}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {dept.officeLocation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{dept.officeLocation}</span>
                    </div>
                  )}
                  {dept.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{dept.contactPhone}</span>
                    </div>
                  )}
                  {dept.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{dept.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to={`/authorities?departmentId=${dept.id}`}
                  className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>View Faculty & Authorities</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
