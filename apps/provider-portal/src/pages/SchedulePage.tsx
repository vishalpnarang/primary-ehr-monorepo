import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTodaysAppointments } from '@/hooks/useApi';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MapPin,
  Clock,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Types ───────────────────────────────────────────────────────────────────

type AppointmentType =
  | 'new_patient'
  | 'follow_up'
  | 'annual_wellness'
  | 'telehealth'
  | 'urgent'
  | 'blocked';

type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'arrived'
  | 'in_room'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled';

type CalendarView = 'day' | 'week' | 'month';

interface ScheduleAppointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  room?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  duration: number;  // minutes
  reason: string;
  telehealth: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TODAY = '2026-03-19';

const MOCK_APPOINTMENTS: ScheduleAppointment[] = [
  {
    id: 'APT-00001', patientId: 'PAT-10010', patientName: 'Michael Brown',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 1',
    type: 'new_patient', status: 'completed', date: TODAY,
    startTime: '08:00', endTime: '09:00', duration: 60,
    reason: 'New patient intake — annual wellness', telehealth: false,
  },
  {
    id: 'APT-00013', patientId: 'PAT-10005', patientName: 'Aisha Williams',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 3',
    type: 'follow_up', status: 'no_show', date: TODAY,
    startTime: '08:30', endTime: '09:00', duration: 30,
    reason: 'Migraine follow-up', telehealth: false,
  },
  {
    id: 'APT-00002', patientId: 'PAT-10001', patientName: 'Sarah Johnson',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 2',
    type: 'follow_up', status: 'completed', date: TODAY,
    startTime: '09:00', endTime: '09:30', duration: 30,
    reason: 'Diabetes management — HbA1c review', telehealth: false,
  },
  {
    id: 'APT-00003', patientId: 'PAT-10006', patientName: 'Robert Martinez',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 3',
    type: 'follow_up', status: 'in_progress', date: TODAY,
    startTime: '09:30', endTime: '10:00', duration: 30,
    reason: 'Blood pressure check — medication refill', telehealth: false,
  },
  {
    id: 'APT-00004', patientId: 'PAT-10005', patientName: 'Aisha Williams',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen',
    type: 'telehealth', status: 'in_room', date: TODAY,
    startTime: '10:00', endTime: '10:30', duration: 30,
    reason: 'Anxiety follow-up — medication management', telehealth: true,
  },
  {
    id: 'APT-00005', patientId: 'PAT-10008', patientName: 'William Park',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 1',
    type: 'follow_up', status: 'arrived', date: TODAY,
    startTime: '10:30', endTime: '11:00', duration: 30,
    reason: 'Type 1 diabetes management — CGM review', telehealth: false,
  },
  {
    id: 'APT-00006', patientId: 'PAT-10002', patientName: 'Marcus Rivera',
    providerId: 'PRV-00002', providerName: 'Dr. James Wilson', room: 'Room 2',
    type: 'follow_up', status: 'confirmed', date: TODAY,
    startTime: '11:00', endTime: '11:30', duration: 30,
    reason: 'COPD management — spirometry results', telehealth: false,
  },
  {
    id: 'APT-00007', patientId: 'PAT-10007', patientName: 'Emma Davis',
    providerId: 'PRV-00002', providerName: 'Dr. James Wilson', room: 'Room 3',
    type: 'follow_up', status: 'confirmed', date: TODAY,
    startTime: '11:30', endTime: '12:00', duration: 30,
    reason: 'Asthma check-up — allergy management', telehealth: false,
  },
  {
    id: 'APT-BLOCK', patientId: '', patientName: '',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen',
    type: 'blocked', status: 'cancelled', date: TODAY,
    startTime: '12:00', endTime: '13:00', duration: 60,
    reason: 'Lunch break', telehealth: false,
  },
  {
    id: 'APT-00008', patientId: 'PAT-10003', patientName: 'Linda Chen',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 1',
    type: 'follow_up', status: 'scheduled', date: TODAY,
    startTime: '13:00', endTime: '13:30', duration: 30,
    reason: 'OB follow-up — gestational diabetes monitoring', telehealth: false,
  },
  {
    id: 'APT-00009', patientId: 'PAT-10004', patientName: 'James Thompson',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 2',
    type: 'annual_wellness', status: 'scheduled', date: TODAY,
    startTime: '13:30', endTime: '14:30', duration: 60,
    reason: 'Annual wellness exam — preventive care', telehealth: false,
  },
  {
    id: 'APT-00010', patientId: 'PAT-10009', patientName: "Catherine O'Brien",
    providerId: 'PRV-00002', providerName: 'Dr. James Wilson',
    type: 'telehealth', status: 'scheduled', date: TODAY,
    startTime: '14:00', endTime: '15:00', duration: 60,
    reason: 'Annual wellness exam — breast cancer survivorship', telehealth: true,
  },
  {
    id: 'APT-00011', patientId: 'PAT-10001', patientName: 'Sarah Johnson',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen', room: 'Room 3',
    type: 'urgent', status: 'scheduled', date: TODAY,
    startTime: '15:00', endTime: '15:30', duration: 30,
    reason: 'Chest pain — shortness of breath (same-day urgent)', telehealth: false,
  },
  {
    id: 'APT-00012', patientId: 'PAT-10006', patientName: 'Robert Martinez',
    providerId: 'PRV-00001', providerName: 'Dr. Emily Chen',
    type: 'telehealth', status: 'scheduled', date: TODAY,
    startTime: '15:30', endTime: '16:00', duration: 30,
    reason: 'Medication refill request — hypertension follow-up', telehealth: true,
  },
  {
    id: 'APT-00015', patientId: 'PAT-10008', patientName: 'William Park',
    providerId: 'PRV-00002', providerName: 'Dr. James Wilson', room: 'Room 1',
    type: 'annual_wellness', status: 'scheduled', date: TODAY,
    startTime: '16:30', endTime: '17:00', duration: 30,
    reason: 'Annual wellness exam', telehealth: false,
  },
];

const PROVIDERS = [
  { id: 'all', name: 'All Providers' },
  { id: 'PRV-00001', name: 'Dr. Emily Chen' },
  { id: 'PRV-00002', name: 'Dr. James Wilson' },
  { id: 'PRV-00003', name: 'Dr. Maria Garcia' },
];

// ─── Config maps ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<AppointmentType, { label: string; color: string; bg: string; border: string; dot: string }> = {
  new_patient:     { label: 'New Patient',      color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-300',  dot: 'bg-blue-500' },
  follow_up:       { label: 'Follow-up',        color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-300', dot: 'bg-green-500' },
  annual_wellness: { label: 'Annual Wellness',  color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-300',  dot: 'bg-teal-500' },
  telehealth:      { label: 'Telehealth',       color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300',dot: 'bg-purple-500' },
  urgent:          { label: 'Urgent',           color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300',dot: 'bg-orange-500' },
  blocked:         { label: 'Blocked',          color: 'text-gray-500',   bg: 'bg-gray-100',  border: 'border-gray-300',  dot: 'bg-gray-400' },
};

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; classes: string }> = {
  scheduled:   { label: 'Scheduled',   classes: 'bg-white text-blue-600 border border-blue-300' },
  confirmed:   { label: 'Confirmed',   classes: 'bg-blue-500 text-white' },
  arrived:     { label: 'Arrived',     classes: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
  in_room:     { label: 'In Room',     classes: 'bg-green-100 text-green-800 border border-green-300' },
  in_progress: { label: 'In Progress', classes: 'bg-green-500 text-white' },
  completed:   { label: 'Completed',   classes: 'bg-slate-100 text-slate-500' },
  no_show:     { label: 'No Show',     classes: 'bg-red-100 text-red-700 border border-red-300' },
  cancelled:   { label: 'Cancelled',   classes: 'bg-gray-100 text-gray-400' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function getWeekDates(dateStr: string): string[] {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow + (dow === 0 ? -6 : 1));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day.toISOString().slice(0, 10);
  });
}

function getMonthGrid(dateStr: string): (string | null)[][] {
  const d = new Date(dateStr + 'T12:00:00');
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon-start
  const cells: (string | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(year, month, i + 1);
      return day.toISOString().slice(0, 10);
    }),
  ];
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7).concat(Array(7).fill(null)).slice(0, 7));
  }
  return weeks;
}

function formatDateDisplay(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatMonthYear(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long',
  });
}

const DAY_HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7–18
const GRID_START = 7 * 60;  // 7:00 AM in minutes
const GRID_END   = 18 * 60; // 6:00 PM in minutes
const GRID_TOTAL = GRID_END - GRID_START;

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ApptCardProps {
  appt: ScheduleAppointment;
  onClick: (appt: ScheduleAppointment) => void;
  compact?: boolean;
}

const ApptCard: React.FC<ApptCardProps> = ({ appt, onClick, compact = false }) => {
  const tc = TYPE_CONFIG[appt.type];
  const sc = STATUS_CONFIG[appt.status];
  const isCancelled = appt.status === 'cancelled';
  const isBlocked = appt.type === 'blocked';

  if (isBlocked) {
    return (
      <div className="h-full w-full bg-gray-100 border border-slate-200 rounded flex items-center px-3">
        <span className="text-xs text-gray-500 font-medium">{appt.reason}</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick(appt)}
      className={cn(
        'h-full w-full text-left rounded-md border-l-[3px] px-2.5 py-1.5 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 overflow-hidden',
        tc.bg, tc.border,
        isCancelled && 'opacity-50',
      )}
    >
      <div className={cn('flex items-start gap-1.5', isCancelled && 'line-through decoration-gray-400')}>
        <div className={cn('w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0', tc.dot)} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-semibold truncate', tc.color, isCancelled && 'line-through')}>
            {appt.patientName}
          </p>
          {!compact && (
            <>
              <p className="text-xs text-gray-500 truncate">{appt.reason}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', sc.classes)}>
                  {sc.label}
                </span>
                <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border', tc.bg, tc.color, tc.border)}>
                  {tc.label}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                {appt.telehealth ? (
                  <span className="flex items-center gap-1 text-[10px] text-purple-600">
                    <Video className="w-3 h-3" /> Telehealth
                  </span>
                ) : appt.room ? (
                  <span className="flex items-center gap-1 text-[10px] text-gray-500">
                    <MapPin className="w-3 h-3" /> {appt.room}
                  </span>
                ) : null}
                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                  <User className="w-3 h-3" /> {appt.providerName.replace('Dr. ', '')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Day View ────────────────────────────────────────────────────────────────

interface DayViewProps {
  appointments: ScheduleAppointment[];
  onApptClick: (appt: ScheduleAppointment) => void;
}

const DayView: React.FC<DayViewProps> = ({ appointments, onApptClick }) => {
  const SLOT_HEIGHT = 64; // px per 60-min slot

  const positioned = useMemo(() => {
    return appointments.map((a) => {
      const start = parseTime(a.startTime);
      const end = parseTime(a.endTime);
      const top = ((start - GRID_START) / 60) * SLOT_HEIGHT;
      const height = Math.max(((end - start) / 60) * SLOT_HEIGHT, 28);
      return { appt: a, top, height };
    });
  }, [appointments]);

  return (
    <div className="flex overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      {/* Time gutter */}
      <div className="w-16 flex-shrink-0 select-none">
        {DAY_HOURS.map((h) => (
          <div
            key={h}
            className="flex items-start justify-end pr-3"
            style={{ height: SLOT_HEIGHT }}
          >
            <span className="text-xs text-gray-400 -translate-y-2">
              {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 relative border-l border-slate-200">
        {/* Hour lines */}
        {DAY_HOURS.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-slate-100"
            style={{ top: ((h - 7) * SLOT_HEIGHT) }}
          />
        ))}
        {/* Half-hour lines */}
        {DAY_HOURS.map((h) => (
          <div
            key={`${h}-half`}
            className="absolute left-0 right-0 border-t border-dashed border-gray-50"
            style={{ top: ((h - 7) * SLOT_HEIGHT) + SLOT_HEIGHT / 2 }}
          />
        ))}

        {/* Grid height container */}
        <div style={{ height: DAY_HOURS.length * SLOT_HEIGHT, position: 'relative' }}>
          {positioned.map(({ appt, top, height }) => (
            <div
              key={appt.id}
              className="absolute left-2 right-2"
              style={{ top, height }}
            >
              <ApptCard appt={appt} onClick={onApptClick} compact={height < 52} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Week View ────────────────────────────────────────────────────────────────

interface WeekViewProps {
  currentDate: string;
  allAppointments: ScheduleAppointment[];
  onApptClick: (appt: ScheduleAppointment) => void;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeekView: React.FC<WeekViewProps> = ({ currentDate, allAppointments, onApptClick }) => {
  const weekDates = getWeekDates(currentDate);
  const SLOT_HEIGHT = 48;

  return (
    <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
      {/* Day headers */}
      <div className="flex border-b border-slate-200 sticky top-0 bg-white z-10">
        <div className="w-14 flex-shrink-0" />
        {weekDates.map((date, i) => {
          const isToday = date === TODAY;
          const dayNum = new Date(date + 'T12:00:00').getDate();
          return (
            <div key={date} className="flex-1 py-2 text-center border-l border-slate-100">
              <p className={cn('text-xs font-medium', isToday ? 'text-blue-600' : 'text-gray-500')}>
                {WEEK_DAYS[i]}
              </p>
              <p className={cn(
                'text-sm font-semibold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto',
                isToday ? 'bg-blue-600 text-white' : 'text-gray-800',
              )}>
                {dayNum}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex">
        {/* Time gutter */}
        <div className="w-14 flex-shrink-0">
          {DAY_HOURS.map((h) => (
            <div key={h} className="flex items-start justify-end pr-2" style={{ height: SLOT_HEIGHT }}>
              <span className="text-[10px] text-gray-400 -translate-y-1.5">
                {h > 12 ? `${h - 12}p` : h === 12 ? '12p' : `${h}a`}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date) => {
          const dayAppts = allAppointments.filter((a) => a.date === date);
          return (
            <div key={date} className="flex-1 border-l border-slate-100 relative">
              {DAY_HOURS.map((h) => (
                <div key={h} className="border-t border-slate-100" style={{ height: SLOT_HEIGHT }} />
              ))}
              <div className="absolute inset-0" style={{ height: DAY_HOURS.length * SLOT_HEIGHT }}>
                {dayAppts.map((appt) => {
                  const start = parseTime(appt.startTime);
                  const end = parseTime(appt.endTime);
                  const top = ((start - GRID_START) / 60) * SLOT_HEIGHT;
                  const height = Math.max(((end - start) / 60) * SLOT_HEIGHT, 20);
                  const tc = TYPE_CONFIG[appt.type];
                  return (
                    <button
                      key={appt.id}
                      onClick={() => onApptClick(appt)}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded text-left px-1 py-0.5 overflow-hidden hover:shadow-md transition-shadow focus:outline-none focus:ring-1 focus:ring-blue-400',
                        tc.bg, tc.border, 'border-l-2',
                      )}
                      style={{ top, height }}
                    >
                      <p className={cn('text-[10px] font-semibold truncate leading-tight', tc.color)}>
                        {appt.type === 'blocked' ? appt.reason : appt.patientName}
                      </p>
                      {height > 30 && (
                        <p className="text-[11px] text-gray-500 truncate">
                          {formatTime(appt.startTime)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Month View ──────────────────────────────────────────────────────────────

interface MonthViewProps {
  currentDate: string;
  allAppointments: ScheduleAppointment[];
  onDayClick: (date: string) => void;
}

const MONTH_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MonthView: React.FC<MonthViewProps> = ({ currentDate, allAppointments, onDayClick }) => {
  const weeks = getMonthGrid(currentDate);
  const currentMonth = new Date(currentDate + 'T12:00:00').getMonth();

  const countByDate = useMemo(() => {
    const counts: Record<string, { total: number; byType: Partial<Record<AppointmentType, number>> }> = {};
    allAppointments.forEach((a) => {
      if (!counts[a.date]) counts[a.date] = { total: 0, byType: {} };
      counts[a.date].total++;
      counts[a.date].byType[a.type] = (counts[a.date].byType[a.type] ?? 0) + 1;
    });
    return counts;
  }, [allAppointments]);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {MONTH_DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-slate-100">
          {week.map((date, di) => {
            if (!date) {
              return <div key={di} className="h-24 bg-slate-50 border-r border-slate-100" />;
            }
            const isToday = date === TODAY;
            const isCurrentMonth = new Date(date + 'T12:00:00').getMonth() === currentMonth;
            const dayNum = new Date(date + 'T12:00:00').getDate();
            const info = countByDate[date];
            const typeEntries = info ? Object.entries(info.byType) as [AppointmentType, number][] : [];

            return (
              <button
                key={date}
                onClick={() => onDayClick(date)}
                className={cn(
                  'h-24 border-r border-slate-100 p-1.5 text-left hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-50',
                  !isCurrentMonth && 'opacity-40',
                )}
              >
                <span className={cn(
                  'text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center',
                  isToday ? 'bg-blue-600 text-white' : 'text-gray-700',
                )}>
                  {dayNum}
                </span>
                {typeEntries.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {typeEntries.slice(0, 3).map(([type, count]) => {
                      const tc = TYPE_CONFIG[type];
                      return (
                        <div key={type} className={cn('flex items-center gap-1 rounded px-1 py-0.5', tc.bg)}>
                          <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', tc.dot)} />
                          <span className={cn('text-[10px] font-medium truncate', tc.color)}>
                            {count} {tc.label}
                          </span>
                        </div>
                      );
                    })}
                    {typeEntries.length > 3 && (
                      <p className="text-[10px] text-gray-400 pl-1">+{typeEntries.length - 3} more</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── Appointment Detail Slide-over ───────────────────────────────────────────

interface ApptDetailProps {
  appt: ScheduleAppointment | null;
  onClose: () => void;
  onOpenChart: (patientId: string) => void;
  onStartEncounter: (patientId: string) => void;
}

const ApptDetail: React.FC<ApptDetailProps> = ({ appt, onClose, onOpenChart, onStartEncounter }) => {
  if (!appt) return null;
  const tc = TYPE_CONFIG[appt.type];
  const sc = STATUS_CONFIG[appt.status];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[400]" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-[410] flex flex-col animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={cn('px-4 py-3 border-b border-slate-100', tc.bg)}>
          <div className="flex items-start justify-between">
            <div>
              <p className={cn('text-xs font-semibold uppercase tracking-wide', tc.color)}>{tc.label}</p>
              <h2 className="text-base font-semibold text-gray-900 mt-0.5">{appt.patientName}</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {formatTime(appt.startTime)} – {formatTime(appt.endTime)} &middot; {appt.duration} min
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 mt-0.5 rounded hover:bg-white/60">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', sc.classes)}>
              {sc.label}
            </span>
            {appt.telehealth && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                <Video className="w-3 h-3" /> Telehealth
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Reason for Visit</p>
            <p className="text-sm text-gray-700">{appt.reason}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Provider</p>
              <p className="text-sm text-gray-700">{appt.providerName}</p>
            </div>
            {appt.room && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Room</p>
                <p className="text-sm text-gray-700">{appt.room}</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Date</p>
              <p className="text-sm text-gray-700">{new Date(appt.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Duration</p>
              <p className="text-sm text-gray-700">{appt.duration} minutes</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {appt.patientId && (
          <div className="px-4 py-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => onOpenChart(appt.patientId)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Open Patient Chart
            </button>
            <button
              onClick={() => onStartEncounter(appt.patientId)}
              className="w-full border border-slate-200 hover:bg-slate-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Start Encounter
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Legend ──────────────────────────────────────────────────────────────────

const Legend: React.FC = () => (
  <div className="flex items-center gap-4 flex-wrap">
    {(Object.entries(TYPE_CONFIG) as [AppointmentType, typeof TYPE_CONFIG[AppointmentType]][]).map(([type, cfg]) => (
      <div key={type} className="flex items-center gap-1.5">
        <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
        <span className="text-xs text-gray-500">{cfg.label}</span>
      </div>
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<CalendarView>('day');
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedAppt, setSelectedAppt] = useState<ScheduleAppointment | null>(null);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

  // Fetch from real API; fall back to inline mock data if backend is unavailable
  const { data: apiAppointments } = useTodaysAppointments();
  const allAppointments: ScheduleAppointment[] = (apiAppointments as ScheduleAppointment[] | undefined) ?? MOCK_APPOINTMENTS;

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((a) => {
      if (selectedProvider !== 'all' && a.providerId !== selectedProvider) return false;
      return true;
    });
  }, [allAppointments, selectedProvider]);

  const dayAppointments = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.date === currentDate)
      .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
  }, [filteredAppointments, currentDate]);

  const navigate_ = (dir: -1 | 1) => {
    if (view === 'day') setCurrentDate((d) => addDays(d, dir));
    else if (view === 'week') setCurrentDate((d) => addDays(d, dir * 7));
    else setCurrentDate((d) => {
      const nd = new Date(d + 'T12:00:00');
      nd.setMonth(nd.getMonth() + dir);
      return nd.toISOString().slice(0, 10);
    });
  };

  const headerLabel = useMemo(() => {
    if (view === 'day') return formatDateDisplay(currentDate);
    if (view === 'week') {
      const dates = getWeekDates(currentDate);
      const s = new Date(dates[0] + 'T12:00:00');
      const e = new Date(dates[6] + 'T12:00:00');
      return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return formatMonthYear(currentDate);
  }, [view, currentDate]);

  const selectedProviderName = PROVIDERS.find((p) => p.id === selectedProvider)?.name ?? 'All Providers';

  const statsToday = useMemo(() => {
    const total = dayAppointments.filter((a) => a.type !== 'blocked').length;
    const completed = dayAppointments.filter((a) => a.status === 'completed').length;
    const inProgress = dayAppointments.filter((a) => ['in_progress', 'in_room', 'arrived'].includes(a.status)).length;
    const remaining = dayAppointments.filter((a) => ['scheduled', 'confirmed'].includes(a.status)).length;
    return { total, completed, inProgress, remaining };
  }, [dayAppointments]);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Schedule</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thursday, March 19, 2026</p>
        </div>
        <button
          onClick={() => navigate('/schedule/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Stats bar (day view only) */}
      {view === 'day' && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Total', value: statsToday.total, color: 'text-gray-800' },
            { label: 'Completed', value: statsToday.completed, color: 'text-gray-500' },
            { label: 'Active', value: statsToday.inProgress, color: 'text-green-600' },
            { label: 'Remaining', value: statsToday.remaining, color: 'text-blue-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={cn('text-xl font-bold mt-0.5', s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 mb-0 flex items-center gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center bg-gray-100 rounded-md p-0.5">
          {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-all capitalize focus:outline-none',
                view === v
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate_(-1)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(TODAY)}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
          >
            Today
          </button>
          <button
            onClick={() => navigate_(1)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date label */}
        <span className="text-sm font-medium text-gray-700 flex-1">{headerLabel}</span>

        {/* Provider filter */}
        <div className="relative">
          <button
            onClick={() => setProviderDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-md text-sm text-gray-700 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <User className="w-4 h-4 text-gray-400" />
            <span className="max-w-[140px] truncate">{selectedProviderName}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {providerDropdownOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg z-dropdown animate-slide-down">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProvider(p.id); setProviderDropdownOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors first:rounded-t-lg last:rounded-b-lg',
                    selectedProvider === p.id ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700',
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="hidden xl:flex">
          <Legend />
        </div>
      </div>

      {/* Calendar body */}
      <div className="bg-white rounded-lg border border-slate-200 mt-2 overflow-hidden">
        {view === 'day' && (
          <DayView appointments={dayAppointments} onApptClick={setSelectedAppt} />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            allAppointments={filteredAppointments}
            onApptClick={setSelectedAppt}
          />
        )}
        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            allAppointments={filteredAppointments}
            onDayClick={(date) => { setCurrentDate(date); setView('day'); }}
          />
        )}
      </div>

      {/* Appointment detail panel */}
      <ApptDetail
        appt={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        onOpenChart={(patientId) => {
          setSelectedAppt(null);
          navigate(`/patients/${patientId}`);
        }}
        onStartEncounter={(patientId) => {
          setSelectedAppt(null);
          navigate(`/patients/${patientId}/encounters/new`);
        }}
      />
    </div>
  );
};

export default SchedulePage;
