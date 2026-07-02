import { NavLink } from 'react-router-dom';
import { BarChart3, Megaphone, UsersRound, Users, ClipboardList, Activity } from 'lucide-react';
import { ROUTES } from '../../config/routes';

const items = [
  { label: 'نظرة عامة', path: ROUTES.REPORTS, icon: BarChart3, end: true },
  { label: 'تقرير الحملات', path: ROUTES.REPORTS_CAMPAIGNS, icon: Megaphone },
  { label: 'تقرير الفرق', path: ROUTES.REPORTS_TEAMS, icon: UsersRound },
  { label: 'تقرير الأعضاء', path: ROUTES.REPORTS_MEMBERS, icon: Users },
  { label: 'تقرير المهام', path: ROUTES.REPORTS_TASKS, icon: ClipboardList },
  { label: 'تقرير النشاطات', path: ROUTES.REPORTS_ACTIVITY, icon: Activity },
];

export default function ReportsNav() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive ? 'bg-[#2563EB] text-white shadow-md' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Icon size={16} />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
}
