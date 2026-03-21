import { Outlet } from 'react-router-dom';
import { cn } from '@primus/ui/lib';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { useUIStore } from '@/stores/uiStore';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';

export const AppShell = () => {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  useGlobalShortcuts();

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg-page)] flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main
        className={cn(
          'flex-1 flex flex-col overflow-hidden transition-all duration-200 ml-0',
          sidebarCollapsed ? 'md:ml-[52px]' : 'md:ml-56'
        )}
      >
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  );
};
