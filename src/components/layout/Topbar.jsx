import { useState } from 'react';
import { Search, Menu, LogOut, ChevronDown } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import useAuth from '../../hooks/useAuth';
import { getInitials } from '../../lib/formatters';
import { APP_NAME } from '../../config/constants';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              placeholder="ابحث في المنصة..."
              className="w-full rounded-xl bg-gray-50 border border-gray-100 pr-10 pl-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">AR</span>
        <NotificationDropdown />
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-sm font-extrabold">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role?.name}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-50">
                <p className="text-xs text-gray-500">{APP_NAME}</p>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={16} /> تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
