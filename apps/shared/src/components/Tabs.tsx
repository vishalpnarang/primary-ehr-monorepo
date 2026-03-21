import React from 'react';
import { cn } from '../../lib/utils';

export interface TabItem {
  key: string;
  label: string;
  shortcut?: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeKey,
  onChange,
  className,
  variant = 'underline',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const enabledIdx = enabledTabs.findIndex((t) => t.key === tabs[index].key);

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      const next = (enabledIdx + dir + enabledTabs.length) % enabledTabs.length;
      onChange(enabledTabs[next].key);
    }
  };

  if (variant === 'pill') {
    return (
      <div
        role="tablist"
        className={cn('inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1', className)}
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={tab.key === activeKey}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            tabIndex={tab.key === activeKey ? 0 : -1}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              tab.key === activeKey
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-xs tabular-nums',
                tab.key === activeKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
              )}>
                {tab.count}
              </span>
            )}
            {tab.shortcut && (
              <kbd className="hidden sm:inline-block rounded border border-current px-1 py-px text-[10px] opacity-60">
                {tab.shortcut}
              </kbd>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Underline variant
  return (
    <div
      role="tablist"
      className={cn('flex border-b border-gray-200', className)}
    >
      {tabs.map((tab, idx) => (
        <button
          key={tab.key}
          role="tab"
          type="button"
          aria-selected={tab.key === activeKey}
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onChange(tab.key)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          tabIndex={tab.key === activeKey ? 0 : -1}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500',
            tab.key === activeKey
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            tab.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-xs tabular-nums',
              tab.key === activeKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            )}>
              {tab.count}
            </span>
          )}
          {tab.shortcut && (
            <kbd className="hidden sm:inline-block rounded border border-current px-1 py-px text-[10px] opacity-50">
              {tab.shortcut}
            </kbd>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
