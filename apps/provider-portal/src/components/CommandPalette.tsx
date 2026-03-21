import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  FileText,
  Pill,
  ClipboardList,
  MessageSquare,
  Calendar,
  Home,
  Users,
  Bell,
  DollarSign,
  BarChart3,
  Settings,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';
import { useUIStore } from '@/stores/uiStore';

interface CommandItem {
  id: string;
  type: 'patient' | 'action' | 'navigation';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href?: string;
  shortcut?: string;
  onSelect?: () => void;
}

const recentPatients: CommandItem[] = [
  { id: 'r1', type: 'patient', title: 'Sarah Johnson', subtitle: 'PAT-10001 · 45F · Type 2 Diabetes', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10001' },
  { id: 'r2', type: 'patient', title: 'Marcus Rivera', subtitle: 'PAT-10002 · 62M · COPD, Heart Failure', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10002' },
  { id: 'r3', type: 'patient', title: 'Linda Chen', subtitle: 'PAT-10003 · 38F · Pregnancy', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10003' },
];

const allPatients: CommandItem[] = [
  ...recentPatients,
  { id: 'p4', type: 'patient', title: 'James Thompson', subtitle: 'PAT-10004 · 71M · Atrial Fibrillation', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10004' },
  { id: 'p5', type: 'patient', title: 'Aisha Williams', subtitle: 'PAT-10005 · 28F · Anxiety, Migraine', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10005' },
  { id: 'p6', type: 'patient', title: 'Robert Martinez', subtitle: 'PAT-10006 · 55M · Hypertension', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10006' },
  { id: 'p7', type: 'patient', title: 'Emma Davis', subtitle: 'PAT-10007 · 8F · Asthma', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10007' },
  { id: 'p8', type: 'patient', title: 'William Park', subtitle: 'PAT-10008 · 49M · Type 1 Diabetes', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10008' },
  { id: 'p9', type: 'patient', title: 'Catherine O\'Brien', subtitle: 'PAT-10009 · 67F · Breast Cancer Survivor', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10009' },
  { id: 'p10', type: 'patient', title: 'Michael Brown', subtitle: 'PAT-10010 · 33M · Healthy', icon: <User className="w-4 h-4" />, href: '/patients/PAT-10010' },
];

const actions: CommandItem[] = [
  { id: 'a1', type: 'action', title: 'New Note', subtitle: 'Create a new encounter note', icon: <FileText className="w-4 h-4" />, shortcut: 'N' },
  { id: 'a2', type: 'action', title: 'Prescribe Medication', subtitle: 'Write a new prescription', icon: <Pill className="w-4 h-4" />, shortcut: 'Shift+R' },
  { id: 'a3', type: 'action', title: 'Order Lab', subtitle: 'Create a new lab order', icon: <ClipboardList className="w-4 h-4" />, shortcut: 'O' },
  { id: 'a4', type: 'action', title: 'Send Message', subtitle: 'Send a secure message', icon: <MessageSquare className="w-4 h-4" />, shortcut: 'G' },
  { id: 'a5', type: 'action', title: 'Schedule Appointment', subtitle: 'Book a new appointment', icon: <Calendar className="w-4 h-4" />, shortcut: 'A' },
];

const navigation: CommandItem[] = [
  { id: 'n1', type: 'navigation', title: 'Dashboard', icon: <Home className="w-4 h-4" />, href: '/dashboard', shortcut: 'Ctrl+1' },
  { id: 'n2', type: 'navigation', title: 'Schedule', icon: <Calendar className="w-4 h-4" />, href: '/schedule', shortcut: 'Ctrl+2' },
  { id: 'n3', type: 'navigation', title: 'Patients', icon: <Users className="w-4 h-4" />, href: '/patients', shortcut: 'Ctrl+3' },
  { id: 'n4', type: 'navigation', title: 'Inbox', icon: <Bell className="w-4 h-4" />, href: '/inbox', shortcut: 'Ctrl+4' },
  { id: 'n5', type: 'navigation', title: 'Billing', icon: <DollarSign className="w-4 h-4" />, href: '/billing', shortcut: 'Ctrl+5' },
  { id: 'n6', type: 'navigation', title: 'Reports', icon: <BarChart3 className="w-4 h-4" />, href: '/reports', shortcut: 'Ctrl+6' },
  { id: 'n7', type: 'navigation', title: 'Settings', icon: <Settings className="w-4 h-4" />, href: '/settings', shortcut: 'Ctrl+7' },
];

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const items = useMemo(() => {
    if (!query.trim()) {
      return {
        recent: recentPatients,
        actions,
        navigation,
        patients: [],
      };
    }

    const q = query.toLowerCase();
    return {
      recent: [],
      patients: allPatients.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
      ),
      actions: actions.filter(
        (a) => a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))
      ),
      navigation: navigation.filter((n) => n.title.toLowerCase().includes(q)),
    };
  }, [query]);
  const allItems = [...items.recent, ...items.patients, ...items.actions, ...items.navigation];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Global Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (commandPaletteOpen) {
          closeCommandPalette();
        } else {
          useUIStore.getState().openCommandPalette();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, closeCommandPalette]);

  const handleSelect = (item: CommandItem) => {
    closeCommandPalette();
    if (item.href) {
      navigate(item.href);
    } else if (item.onSelect) {
      item.onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (allItems[selectedIndex]) handleSelect(allItems[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        closeCommandPalette();
        break;
    }
  };

  if (!commandPaletteOpen) return null;

  let itemIndex = 0;
  const renderSection = (title: string, sectionItems: CommandItem[], icon?: React.ReactNode) => {
    if (sectionItems.length === 0) return null;
    return (
      <div>
        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          {icon}
          {title}
        </div>
        {sectionItems.map((item) => {
          const currentIndex = itemIndex++;
          return (
            <button
              key={item.id}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                currentIndex === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(currentIndex)}
            >
              <span className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                item.type === 'patient' ? 'bg-blue-100 text-blue-600' :
                item.type === 'action' ? 'bg-emerald-100 text-emerald-600' :
                'bg-gray-100 text-gray-600'
              )}>
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                )}
              </div>
              {item.shortcut && (
                <kbd className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-mono flex-shrink-0">
                  {item.shortcut}
                </kbd>
              )}
              <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-command animate-fade-in"
        onClick={closeCommandPalette}
      />

      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-command animate-scale-in">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search patients, actions, navigation..."
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400"
              autoComplete="off"
            />
            <kbd className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[400px] overflow-y-auto scrollbar-thin py-2">
            {allItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No results for "{query}"
              </div>
            ) : (
              <>
                {renderSection('Recent', items.recent, <Clock className="w-3 h-3" />)}
                {renderSection('Patients', items.patients)}
                {renderSection('Actions', items.actions)}
                {renderSection('Navigation', items.navigation)}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 px-1 rounded">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 px-1 rounded">↵</kbd> select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-gray-100 px-1 rounded">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
