import React, { useState } from 'react';
import {
  Stethoscope, FlaskConical, ClipboardList, ArrowUpRight,
  MessageCircle, Pill, Shield, Circle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../../lib/utils';
import type { TimelineEvent } from '../../types';

export type TimelineEventType = TimelineEvent['type'];

export interface TimelineProps {
  events: TimelineEvent[];
  filterTypes?: TimelineEventType[];
  className?: string;
}

const typeConfig: Record<
  TimelineEventType,
  { icon: React.FC<{ size?: number; className?: string }>; bg: string; label: string }
> = {
  encounter:    { icon: Stethoscope,   bg: 'bg-blue-100 text-blue-600',   label: 'Encounter' },
  lab:          { icon: FlaskConical,  bg: 'bg-purple-100 text-purple-600', label: 'Lab' },
  order:        { icon: ClipboardList, bg: 'bg-teal-100 text-teal-600',   label: 'Order' },
  referral:     { icon: ArrowUpRight,  bg: 'bg-orange-100 text-orange-600', label: 'Referral' },
  message:      { icon: MessageCircle, bg: 'bg-gray-100 text-gray-600',   label: 'Message' },
  medication:   { icon: Pill,          bg: 'bg-green-100 text-green-600', label: 'Medication' },
  immunization: { icon: Shield,        bg: 'bg-indigo-100 text-indigo-600', label: 'Immunization' },
};

const statusColorMap: Record<NonNullable<TimelineEvent['status']>, 'blue' | 'red' | 'yellow' | 'gray'> = {
  normal:   'blue',
  abnormal: 'yellow',
  critical: 'red',
  pending:  'gray',
};

const ALL_TYPES: TimelineEventType[] = ['encounter', 'lab', 'order', 'referral', 'message', 'medication', 'immunization'];

export const Timeline: React.FC<TimelineProps> = ({ events, filterTypes, className }) => {
  const [activeFilter, setActiveFilter] = useState<TimelineEventType | null>(null);
  const availableTypes = filterTypes ?? ALL_TYPES;

  const filtered = activeFilter
    ? events.filter((e) => e.type === activeFilter)
    : events;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter timeline by type">
        <button
          onClick={() => setActiveFilter(null)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            activeFilter === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          All
        </button>
        {availableTypes.map((type) => {
          const cfg = typeConfig[type];
          return (
            <button
              key={type}
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                activeFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Events */}
      {sorted.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-8">No events to display</div>
      ) : (
        <ol className="relative space-y-0">
          {sorted.map((event, idx) => {
            const cfg = typeConfig[event.type] ?? { icon: Circle, bg: 'bg-gray-100 text-gray-500', label: event.type };
            const { icon: Icon } = cfg;
            const isLast = idx === sorted.length - 1;

            return (
              <li key={event.id} className="flex gap-4 relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" aria-hidden="true" />
                )}
                {/* Icon */}
                <div className={cn('mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0', cfg.bg)}>
                  <Icon size={16} aria-hidden="true" />
                </div>
                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      {event.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">{event.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {event.badge && (
                        <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{event.badge}</span>
                      )}
                      {event.status && event.status !== 'normal' && (
                        <StatusBadge
                          status={event.status}
                          color={statusColorMap[event.status]}
                          dot
                        />
                      )}
                    </div>
                  </div>
                  <time className="text-xs text-gray-400 mt-1 block" dateTime={event.date}>
                    {formatDate(event.date)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default Timeline;
