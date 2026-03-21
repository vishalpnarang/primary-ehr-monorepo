import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Calendar, Users, Bell, DollarSign, BarChart3, Settings,
  ChevronLeft, ChevronRight, Search, LogOut, type LucideIcon,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import type { UserRole } from '@primus/ui/types';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  roles: UserRole[];
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: Home, href: '/dashboard', roles: ['super_admin', 'tenant_admin', 'practice_admin', 'provider', 'nurse', 'front_desk', 'billing'] },
  { label: 'Scheduling', icon: Calendar, href: '/schedule', roles: ['super_admin', 'tenant_admin', 'practice_admin', 'provider', 'nurse', 'front_desk'] },
  { label: 'Patients', icon: Users, href: '/patients', roles: ['super_admin', 'tenant_admin', 'practice_admin', 'provider', 'nurse', 'front_desk', 'billing'] },
  { label: 'Inbox', icon: Bell, href: '/inbox', roles: ['provider', 'nurse', 'practice_admin'], badge: 8 },
  { label: 'Billing', icon: DollarSign, href: '/billing', roles: ['billing', 'tenant_admin', 'practice_admin'] },
  { label: 'Reports', icon: BarChart3, href: '/reports', roles: ['tenant_admin', 'practice_admin', 'billing'] },
  { label: 'Settings', icon: Settings, href: '/settings', roles: ['tenant_admin', 'super_admin'] },
];

export const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [hovering, setHovering] = useState(false);
  const location = useLocation();

  const expanded = !sidebarCollapsed || hovering;
  const filteredItems = NAV_ITEMS.filter(
    (item) => !user || item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-sidebar transition-all duration-200',
        expanded ? 'w-56' : 'w-[52px]'
      )}
      onMouseEnter={() => { if (sidebarCollapsed) setHovering(true); }}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
          P
        </div>
        {expanded ? (
          <span className="ml-2.5 font-semibold text-base text-gray-900 tracking-tight whitespace-nowrap">
            Primus <span className="text-blue-600">EHR</span>
          </span>
        ) : null}
      </div>

      {/* Search */}
      <div className="px-2 mt-2 mb-1">
        <button
          onClick={() => useUIStore.getState().openCommandPalette()}
          className={cn(
            'w-full flex items-center gap-2 rounded-md text-sm text-gray-400 hover:text-gray-600 hover:bg-slate-50 transition-colors',
            expanded ? 'px-2.5 py-2' : 'px-1.5 py-2 justify-center'
          )}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          {expanded ? (
            <>
              <span className="flex-1 text-left text-xs">Search...</span>
              <kbd className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </>
          ) : null}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto scrollbar-thin">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md text-[13px] font-medium transition-colors relative',
                expanded ? 'px-2.5 py-2' : 'px-1.5 py-2 justify-center',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-slate-50'
              )}
              title={expanded ? undefined : item.label}
            >
              {isActive ? (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r bg-blue-600" />
              ) : null}
              <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')} />
              {expanded ? (
                <>
                  <span className="flex-1">{item.label}</span>
                  {(item.badge ?? 0) > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                      {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </>
              ) : null}
              {!expanded && (item.badge ?? 0) > 0 ? (
                <span className="absolute top-1 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* User + collapse */}
      <div className="border-t border-slate-100 px-2 py-2">
        {expanded && user ? (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-gray-400 truncate capitalize">{user.role.replaceAll('_', ' ')}</p>
            </div>
            <button onClick={logout} className="text-gray-400 hover:text-gray-600 p-1" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : null}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center gap-2 rounded-md text-xs text-gray-400 hover:text-gray-600 hover:bg-slate-50 transition-colors w-full',
            expanded ? 'px-2.5 py-1.5' : 'px-1.5 py-1.5 justify-center'
          )}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          {expanded ? <span>{sidebarCollapsed ? 'Expand' : 'Collapse'}</span> : null}
        </button>
      </div>
    </aside>
  );
};
