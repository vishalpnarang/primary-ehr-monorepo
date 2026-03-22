import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Settings,
  Briefcase,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employers', icon: Building2, label: 'Employers' },
  { to: '/commissions', icon: DollarSign, label: 'Commissions' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export const BrokerSidebar = () => {
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Primus EHR</p>
            <p className="text-xs text-gray-400">Broker Portal</p>
          </div>
        </div>
      </div>

      {/* Agency badge */}
      {user && (
        <div className="px-6 py-3 border-b border-gray-700 bg-gray-800">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Agency</p>
          <p className="text-sm font-medium text-white truncate">{user.agencyName}</p>
          <p className="text-xs text-gray-400">NPN: {user.npn}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      {user && (
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400">Licensed Broker</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
};

export default BrokerSidebar;
