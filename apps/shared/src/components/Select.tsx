import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  searchable = false,
  loading = false,
  disabled = false,
  required,
  className,
  id: externalId,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const generatedId = React.useId();
  const id = externalId ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = searchable && query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.sublabel?.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open, searchable]);

  const handleSelect = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div ref={containerRef} className={cn('w-full space-y-1', className)} onKeyDown={handleKeyDown}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true"> *</span>}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled || loading}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required}
          aria-invalid={Boolean(error)}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'w-full flex items-center justify-between rounded-md border bg-white px-3 h-9 text-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-blue-500',
            error ? 'border-red-400' : 'border-gray-300',
            (disabled || loading) && 'bg-gray-50 text-gray-400 cursor-not-allowed',
            !selected && 'text-gray-400'
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          {loading
            ? <Loader2 size={16} className="animate-spin text-gray-400 shrink-0" />
            : <ChevronDown size={16} className={cn('text-gray-400 shrink-0 transition-transform', open && 'rotate-180')} />
          }
        </button>

        {open && !disabled && (
          <div
            role="listbox"
            aria-label={label}
            className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto"
          >
            {searchable && (
              <div className="sticky top-0 border-b border-gray-100 bg-white px-2 py-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full rounded border border-gray-200 py-1.5 pl-8 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-400">No options found</div>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={opt.value === value}
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 cursor-pointer text-sm',
                    opt.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-50',
                    opt.value === value && 'bg-blue-50 font-medium'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && <div className="text-xs text-gray-400 truncate">{opt.sublabel}</div>}
                  </div>
                  {opt.value === value && <Check size={14} className="text-blue-600 shrink-0" />}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
