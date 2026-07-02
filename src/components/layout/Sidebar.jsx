import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, LayoutGrid, Megaphone, ClipboardList, UserCheck, UsersRound,
  Users, Shield, Globe, ListChecks, BarChart3, ScrollText, Settings, KeyRound, Bell, Briefcase,
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import usePermissions from '../../hooks/usePermissions';

const sections = [
  {
    title: 'مساحة العمل',
    items: [
      { label: 'الرئيسية', icon: LayoutDashboard, path: ROUTES.WORKSPACE, permission: ['dashboard.view', 'dashboard_stats.view', 'boards.view'] },
      { label: 'مساحة عملي', icon: Briefcase, path: ROUTES.MY_WORK, permission: 'task_assignments.view' },
      { label: 'البوردات', icon: LayoutGrid, path: ROUTES.BOARDS, permission: 'boards.view' },
      { label: 'حملاتي', icon: Megaphone, path: ROUTES.CAMPAIGNS, permission: 'campaigns.view' },
      { label: 'المهام', icon: ClipboardList, path: ROUTES.TASKS, permission: 'tasks.view' },
      { label: 'قيد المراجعة', icon: UserCheck, path: ROUTES.REVIEWS, permission: ['task_assignments.approve', 'proofs.approve'] },
      { label: 'الفريق', icon: UsersRound, path: ROUTES.TEAMS, permission: 'teams.view' },
    ],
  },
  {
    title: 'الإدارة',
    items: [
      { label: 'المستخدمين', icon: Users, path: ROUTES.USERS, permission: 'users.view' },
      { label: 'الأدوار والصلاحيات', icon: Shield, path: ROUTES.ROLES, permission: 'roles.view' },
      { label: 'المنصات', icon: Globe, path: ROUTES.PLATFORMS, permission: 'platforms.view' },
      { label: 'أنواع المهام', icon: ListChecks, path: ROUTES.TASK_TYPES, permission: 'task_types.view' },
    ],
  },
  {
    title: 'التقارير',
    items: [
      { label: 'لوحة التحليلات', icon: BarChart3, path: ROUTES.REPORTS, permission: 'reports.view' },
      { label: 'تقارير الحملات', icon: Megaphone, path: ROUTES.REPORTS_CAMPAIGNS, permission: 'reports.view' },
      { label: 'تقارير الفرق', icon: UsersRound, path: ROUTES.REPORTS_TEAMS, permission: 'reports.view' },
      { label: 'تقارير الأعضاء', icon: Users, path: ROUTES.REPORTS_MEMBERS, permission: 'reports.view' },
    ],
  },
  {
    title: 'النظام',
    items: [
      { label: 'الإشعارات', icon: Bell, path: ROUTES.NOTIFICATIONS, permission: 'notifications.view' },
      { label: 'سجل النشاطات', icon: ScrollText, path: ROUTES.AUDIT_LOGS, permission: 'audit_logs.view' },
      { label: 'الصلاحيات', icon: KeyRound, path: ROUTES.PERMISSIONS, permission: 'permissions.view' },
      { label: 'الإعدادات', icon: Settings, path: ROUTES.SETTINGS, permission: 'settings.view' },
    ],
  },
];

function isActive(path, location) {
  if (path === ROUTES.WORKSPACE) return location.pathname === ROUTES.WORKSPACE;
  if (path === ROUTES.HOME) return location.pathname === ROUTES.HOME;
  return location.pathname === path || location.pathname.startsWith(`${path}/`);
}

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const { can } = usePermissions();

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center font-extrabold text-sm">س</div>
          <div>
            <h1 className="text-sm font-extrabold leading-tight">مساحة عمليات</h1>
            <p className="text-[10px] text-slate-400">السوشيال ميديا</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {sections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            const perms = Array.isArray(item.permission) ? item.permission : [item.permission];
            return perms.some((p) => can(p));
          });
          if (!visibleItems.length) return null;
          return (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.title}</p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.path, location);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                    >
                      <Icon size={17} className={active ? 'text-[#60A5FA]' : ''} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
