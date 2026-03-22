import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquare,
  FileText,
  CheckCircle2,
  Circle,
  XCircle,
  Stethoscope,
  Activity,
  DoorOpen,
  ClipboardList,
  Syringe,
  HeartPulse,
  UserCheck,
  DollarSign,
  ShieldAlert,
  Users,
  Building2,
  Server,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Link,
  UserCog,
  Pill,
  FlaskConical,
  Timer,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@primus/ui/types';
import { useProviderDashboard, useBillingDashboard } from '@/hooks/useApi';

// ─── Shared constants ──────────────────────────────────────────────────────

const TODAY = 'Thursday, March 19, 2026';
const LOCATION = 'Primus Think Health · Location A';

// ─── Micro-components ─────────────────────────────────────────────────────

interface CardProps {
  className?: string;
  children: React.ReactNode;
}
const Card: React.FC<CardProps> = ({ className, children }) => (
  <div className={cn('bg-white rounded-lg border border-slate-200 shadow-sm', className)}>
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  count?: number;
  action?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}
const CardHeader: React.FC<CardHeaderProps> = ({ title, count, action, onAction, children }) => (
  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
      {count !== undefined && (
        <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full leading-none">
          {count}
        </span>
      )}
    </div>
    <div className="flex items-center gap-2">
      {children}
      {action && (
        <button
          onClick={onAction}
          className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
        >
          {action} <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

// KPI strip card — very compact
interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  iconBg: string;
  alert?: boolean;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, sub, trend, icon, iconBg, alert }) => (
  <div className={cn(
    'bg-white rounded-lg border shadow-sm px-3 py-2 flex items-center gap-2.5',
    alert ? 'border-critical-500 ring-1 ring-critical-200' : 'border-slate-200',
  )}>
    <div className={cn('w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0', iconBg)}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide leading-none mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-900 leading-none">{value}</p>
      {sub && (
        <p className={cn(
          'text-[11px] mt-0.5 leading-none flex items-center gap-0.5',
          trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-critical-600' : 'text-gray-400',
        )}>
          {trend === 'up' && <ArrowUpRight className="w-2.5 h-2.5" />}
          {trend === 'down' && <ArrowDownRight className="w-2.5 h-2.5" />}
          {sub}
        </p>
      )}
    </div>
  </div>
);

// Appointment type pill
type ApptType = 'new_patient' | 'follow_up' | 'annual_wellness' | 'telehealth' | 'urgent' | 'procedure';
type ApptStatus = 'scheduled' | 'confirmed' | 'arrived' | 'in_room' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';

const TYPE_PILL: Record<ApptType, string> = {
  new_patient:     'bg-blue-100 text-blue-700',
  follow_up:       'bg-slate-100 text-slate-500',
  annual_wellness: 'bg-success-100 text-success-700',
  telehealth:      'bg-purple-100 text-purple-700',
  urgent:          'bg-critical-100 text-critical-700',
  procedure:       'bg-amber-100 text-amber-700',
};

const TYPE_LABEL: Record<ApptType, string> = {
  new_patient:     'NP',
  follow_up:       'F/U',
  annual_wellness: 'AWV',
  telehealth:      'TH',
  urgent:          'URG',
  procedure:       'PROC',
};

const STATUS_DOT: Record<ApptStatus, string> = {
  scheduled:   'bg-gray-400',
  confirmed:   'bg-blue-500',
  arrived:     'bg-warning-500',
  in_room:     'bg-purple-500',
  in_progress: 'bg-amber-500',
  completed:   'bg-success-500',
  no_show:     'bg-rose-500',
  cancelled:   'bg-gray-300',
};

const STATUS_LABEL: Record<ApptStatus, string> = {
  scheduled:   'Sched',
  confirmed:   'Conf',
  arrived:     'Arrived',
  in_room:     'In Rm',
  in_progress: 'Active',
  completed:   'Done',
  no_show:     'NS',
  cancelled:   'Canc',
};

interface ApptRowProps {
  time: string;
  name: string;
  type: ApptType;
  status: ApptStatus;
  reason: string;
  room?: string;
  extra?: React.ReactNode;
}
const ApptRow: React.FC<ApptRowProps> = ({ time, name, type, status, reason, room, extra }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0 group">
    <span className="text-[11px] font-mono font-semibold text-gray-600 w-10 flex-shrink-0">{time}</span>
    <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0', TYPE_PILL[type])}>
      {TYPE_LABEL[type]}
    </span>
    <span className="text-[11px] font-medium text-gray-900 truncate flex-1">{name}</span>
    {room && (
      <span className="text-[11px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded flex-shrink-0">{room}</span>
    )}
    {extra}
    <span className="flex items-center gap-1 flex-shrink-0">
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[status])} />
      <span className="text-[11px] text-gray-500">{STATUS_LABEL[status]}</span>
    </span>
    <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 flex-shrink-0" />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Provider
// ═══════════════════════════════════════════════════════════════════════════

interface ProviderAppt {
  id: string; time: string; name: string; type: ApptType; status: ApptStatus; reason: string; room?: string;
}

const PROVIDER_APPTS: ProviderAppt[] = [
  { id: 'A1', time: '08:00', name: 'Johnson, Robert',    type: 'annual_wellness', status: 'completed',   reason: 'Annual physical',          room: 'Rm 2' },
  { id: 'A2', time: '08:30', name: 'Rivera, Linda',      type: 'follow_up',       status: 'in_progress', reason: 'HTN medication review',     room: 'Rm 1' },
  { id: 'A3', time: '09:00', name: 'Chen, Marcus',       type: 'new_patient',     status: 'arrived',     reason: 'Establish care',            room: 'Rm 3' },
  { id: 'A4', time: '09:30', name: 'Thompson, Patricia', type: 'urgent',          status: 'confirmed',   reason: 'Chest pain evaluation' },
  { id: 'A5', time: '10:00', name: 'Williams, James',    type: 'follow_up',       status: 'confirmed',   reason: 'DM2 A1c follow-up' },
  { id: 'A6', time: '10:30', name: 'Martinez, Angela',   type: 'telehealth',      status: 'scheduled',   reason: 'Depression check-in' },
  { id: 'A7', time: '11:00', name: 'Baker, George',      type: 'procedure',       status: 'scheduled',   reason: 'Skin lesion removal' },
  { id: 'A8', time: '11:30', name: 'Nguyen, Kevin',      type: 'follow_up',       status: 'scheduled',   reason: 'Post-op wound check' },
  { id: 'A9', time: '13:00', name: 'Patel, Susan',       type: 'follow_up',       status: 'scheduled',   reason: 'Hypothyroidism — TSH recheck' },
  { id: 'A10',time: '13:30', name: 'Torres, Maria',      type: 'new_patient',     status: 'scheduled',   reason: 'Establish care — anxiety' },
  { id: 'A11',time: '14:00', name: 'Davis, William',     type: 'annual_wellness', status: 'scheduled',   reason: 'Medicare AWV' },
  { id: 'A12',time: '14:30', name: 'Clark, Jennifer',    type: 'urgent',          status: 'scheduled',   reason: 'Acute UTI symptoms' },
];

interface InboxItem { patient: string; detail: string; time?: string; }
interface InboxGroup {
  label: string; count: number; bg: string; textColor: string;
  icon: React.ReactNode; items: InboxItem[];
}

const INBOX_GROUPS: InboxGroup[] = [
  {
    label: 'Critical Labs', count: 2,
    bg: 'bg-critical-100', textColor: 'text-critical-700',
    icon: <AlertTriangle className="w-3 h-3 text-critical-500" />,
    items: [
      { patient: 'Johnson, R.', detail: 'K+ 6.2 mEq/L — CRIT HIGH', time: '8:14a' },
      { patient: 'Chen, M.',    detail: 'INR 4.8 — CRIT HIGH (warfarin)', time: '7:52a' },
    ],
  },
  {
    label: 'PA Requests', count: 3,
    bg: 'bg-warning-100', textColor: 'text-warning-700',
    icon: <FileText className="w-3 h-3 text-warning-500" />,
    items: [
      { patient: 'Rivera, L.',   detail: 'Adalimumab (Humira) — Aetna', time: 'yest' },
      { patient: 'Baker, G.',    detail: 'Jardiance 10mg — BCBS', time: 'yest' },
      { patient: 'Williams, J.', detail: 'MRI Lumbar Spine — UHC', time: '3/17' },
    ],
  },
  {
    label: 'Messages', count: 4,
    bg: 'bg-blue-100', textColor: 'text-blue-700',
    icon: <MessageSquare className="w-3 h-3 text-blue-500" />,
    items: [
      { patient: 'Thompson, P.', detail: 'Q re: Metformin side effects', time: '9:01a' },
      { patient: 'Williams, J.', detail: 'Requesting work note 3/18', time: '8:45a' },
      { patient: 'Martinez, A.', detail: 'Sertraline — feeling worse', time: '8:20a' },
    ],
  },
  {
    label: 'Refills', count: 6,
    bg: 'bg-gray-100', textColor: 'text-gray-600',
    icon: <Pill className="w-3 h-3 text-gray-400" />,
    items: [
      { patient: 'Martinez, A.', detail: 'Sertraline 50mg ×30 — CVS', time: '8:05a' },
      { patient: 'Baker, G.',    detail: 'Lisinopril 10mg ×90 — Walg.', time: '7:44a' },
      { patient: 'Patel, S.',    detail: 'Levothyroxine 75mcg ×90', time: '7:30a' },
    ],
  },
];

interface CareGapRow { name: string; id: string; gaps: string[]; }

const CARE_GAPS: CareGapRow[] = [
  { name: 'Johnson, R.',    id: 'PAT-00101', gaps: ['A1c overdue 14mo', 'CRC screen due'] },
  { name: 'Rivera, L.',     id: 'PAT-00102', gaps: ['Mammogram due', 'Flu vax'] },
  { name: 'Thompson, P.',   id: 'PAT-00104', gaps: ['BP target unmet', 'Statin not on file'] },
  { name: 'Williams, J.',   id: 'PAT-00105', gaps: ['Eye exam 18mo overdue', 'Foot exam due'] },
  { name: 'Martinez, A.',   id: 'PAT-00106', gaps: ['PHQ-9 due (depression)'] },
];

// ─── Provider Dashboard ────────────────────────────────────────────────────

const ProviderDashboard: React.FC = () => {
  const { data: apiData } = useProviderDashboard();
  const navigate = useNavigate();

  // KPI counts — use API data when available, fall back to inline mock derivations
  const completed = apiData?.completedAppointments ?? PROVIDER_APPTS.filter((a) => a.status === 'completed').length;
  const inRoom    = apiData?.inRoomCount         ?? PROVIDER_APPTS.filter((a) => a.status === 'in_room' || a.status === 'in_progress').length;
  const noShows   = apiData?.noShowCount         ?? PROVIDER_APPTS.filter((a) => a.status === 'no_show').length;
  const totalAppts = apiData?.todayAppointmentsTotal ?? PROVIDER_APPTS.length;
  const totalGaps = CARE_GAPS.reduce((n, g) => n + g.gaps.length, 0);
  const remaining = Math.max(0, totalAppts - completed);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Patients Today"  value={totalAppts}            sub="on schedule"                            icon={<Calendar    className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
        <KpiCard label="Completed"       value={completed}             sub={`${remaining} remaining`}               icon={<CheckCircle2 className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50" />
        <KpiCard label="In Room / Active" value={inRoom}              sub="currently occupied"                      icon={<DoorOpen    className="w-3.5 h-3.5 text-purple-600"  />} iconBg="bg-purple-50"  />
        <KpiCard label="No Shows"        value={noShows}              sub="today"                                   icon={<XCircle     className="w-3.5 h-3.5 text-critical-600" />} iconBg="bg-critical-50" alert={noShows > 0} />
      </div>

      {/* Main Grid: 3 cols */}
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">

        {/* Col 1: Schedule */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader title="Today's Schedule" count={PROVIDER_APPTS.length} action="Full schedule" onAction={() => navigate('/schedule')} />
          <div className="overflow-y-auto flex-1">
            {PROVIDER_APPTS.map((a) => (
              <ApptRow key={a.id} time={a.time} name={a.name} type={a.type} status={a.status} reason={a.reason} room={a.room} />
            ))}
          </div>
        </Card>

        {/* Col 2: Priority Inbox */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader title="Priority Inbox" count={INBOX_GROUPS.reduce((n, g) => n + g.count, 0)} action="Open inbox" onAction={() => navigate('/inbox')} />
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {INBOX_GROUPS.map((group) => (
              <div key={group.label} className="px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    {group.icon}
                    <span className="text-[10px] font-semibold text-gray-700">{group.label}</span>
                  </div>
                  <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded-full', group.bg, group.textColor)}>
                    {group.count}
                  </span>
                </div>
                <div className="space-y-1">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-gray-100 rounded px-2 py-1 cursor-pointer transition-colors"
                    >
                      <span className="text-[10px] font-semibold text-gray-700 w-20 flex-shrink-0 truncate">{item.patient}</span>
                      <span className="text-[10px] text-gray-500 flex-1 truncate">{item.detail}</span>
                      {item.time && <span className="text-[11px] text-gray-400 flex-shrink-0">{item.time}</span>}
                    </div>
                  ))}
                  {group.count > group.items.length && (
                    <p className="text-[11px] text-blue-600 pl-2 cursor-pointer hover:underline">
                      +{group.count - group.items.length} more
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Col 3: Care Gaps */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader title="Care Gaps — Today" count={totalGaps} action="All gaps" onAction={() => navigate('/patients')} />
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {CARE_GAPS.map((row) => (
              <div key={row.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[11px] font-semibold text-gray-800">{row.name}</span>
                  <span className="text-[11px] text-gray-400">{row.id}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {row.gaps.map((gap, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-0.5 text-[11px] bg-warning-50 text-warning-700 border border-warning-200 px-1.5 py-0.5 rounded font-medium"
                    >
                      <AlertCircle className="w-2 h-2" />
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Nurse
// ═══════════════════════════════════════════════════════════════════════════

type RoomStatus = 'empty' | 'ready' | 'occupied' | 'cleaning';
interface RoomCard { id: string; name: string; status: RoomStatus; patient?: string; provider?: string; since?: string; vitals?: string; }

const ROOM_STATUS_CFG: Record<RoomStatus, { label: string; bg: string; border: string; dot: string; text: string }> = {
  empty:    { label: 'EMPTY',    bg: 'bg-slate-50',     border: 'border-slate-200',    dot: 'bg-gray-300',     text: 'text-gray-400' },
  ready:    { label: 'READY',    bg: 'bg-success-50',  border: 'border-success-200', dot: 'bg-success-500',  text: 'text-success-700' },
  occupied: { label: 'OCCUPIED', bg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-500',   text: 'text-blue-700' },
  cleaning: { label: 'CLEANING', bg: 'bg-warning-50',  border: 'border-warning-200', dot: 'bg-warning-500',  text: 'text-warning-700' },
};

const ROOMS: RoomCard[] = [
  { id: 'R1', name: 'Room 1', status: 'occupied', patient: 'Rivera, Linda',   provider: 'Dr. Chen', since: '09:12', vitals: 'BP 158/94 · HR 82' },
  { id: 'R2', name: 'Room 2', status: 'ready' },
  { id: 'R3', name: 'Room 3', status: 'occupied', patient: 'Chen, Marcus',    provider: 'Dr. Chen', since: '09:04', vitals: 'Pending' },
  { id: 'R4', name: 'Room 4', status: 'occupied', patient: 'Johnson, Robert', provider: 'Dr. Chen', since: '08:05', vitals: 'BP 122/76 · HR 68' },
  { id: 'R5', name: 'Room 5', status: 'cleaning' },
  { id: 'R6', name: 'Room 6', status: 'empty' },
];

type TaskType = 'vitals' | 'room' | 'injection' | 'education' | 'form' | 'lab';
interface NurseTask { id: string; type: TaskType; patient: string; time: string; detail: string; done: boolean; priority: 'high' | 'normal'; }

const TASK_ICON: Record<TaskType, React.ReactNode> = {
  vitals:    <HeartPulse className="w-3 h-3" />,
  room:      <DoorOpen   className="w-3 h-3" />,
  injection: <Syringe    className="w-3 h-3" />,
  education: <FileText   className="w-3 h-3" />,
  form:      <ClipboardList className="w-3 h-3" />,
  lab:       <FlaskConical  className="w-3 h-3" />,
};

const NURSE_TASKS: NurseTask[] = [
  { id: 'T1', type: 'room',      patient: 'Johnson, R.',  time: '08:30', detail: 'Room patient — Rm 2',           done: true,  priority: 'normal' },
  { id: 'T2', type: 'vitals',    patient: 'Rivera, L.',   time: '09:00', detail: 'Vitals + BP recheck in 15 min', done: true,  priority: 'high'   },
  { id: 'T3', type: 'room',      patient: 'Chen, Marcus', time: '09:00', detail: 'Room patient, collect HPI',      done: false, priority: 'high'   },
  { id: 'T4', type: 'vitals',    patient: 'Thompson, P.', time: '09:30', detail: 'Vitals + 12-lead EKG ordered',  done: false, priority: 'high'   },
  { id: 'T5', type: 'lab',       patient: 'Thompson, P.', time: '09:30', detail: 'Draw CBC, BMP stat',            done: false, priority: 'high'   },
  { id: 'T6', type: 'injection', patient: 'Williams, J.', time: '10:00', detail: 'Flu vaccine IM — deltoid',      done: false, priority: 'normal' },
  { id: 'T7', type: 'education', patient: 'Martinez, A.', time: '10:30', detail: 'Print discharge instructions',  done: false, priority: 'normal' },
  { id: 'T8', type: 'form',      patient: 'Baker, George',time: '11:00', detail: 'Obtain procedure consent form', done: false, priority: 'normal' },
];

// ─── Nurse Dashboard ────────────────────────────────────────────────────────

const NurseDashboard: React.FC = () => {
  const done = NURSE_TASKS.filter((t) => t.done).length;
  const occupied = ROOMS.filter((r) => r.status === 'occupied').length;

  return (
    <div className="flex flex-col gap-2">
      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Occupied Rooms"  value={`${occupied}/6`} sub="in use now"         icon={<DoorOpen     className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
        <KpiCard label="Ready for MD"    value={ROOMS.filter((r) => r.status === 'ready').length}   sub="rooms prepped"    icon={<CheckCircle2 className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50" />
        <KpiCard label="Tasks Complete"  value={`${done}/${NURSE_TASKS.length}`}           sub="today"            icon={<ClipboardList className="w-3.5 h-3.5 text-amber-600"  />} iconBg="bg-amber-50"   />
        <KpiCard label="Patients Roomed" value={5}                                         sub="total today"      icon={<Activity     className="w-3.5 h-3.5 text-teal-600"   />} iconBg="bg-teal-50"    />
      </div>

      {/* Main 2-col */}
      <div className="grid grid-cols-2 gap-2">
        {/* Room Status Board */}
        <Card>
          <CardHeader title="Room Status Board" count={ROOMS.length} />
          <div className="p-2 grid grid-cols-3 gap-2">
            {ROOMS.map((room) => {
              const cfg = ROOM_STATUS_CFG[room.status];
              return (
                <div key={room.id} className={cn('rounded-md border p-2 cursor-pointer hover:shadow-sm transition-shadow', cfg.bg, cfg.border)}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-gray-700">{room.name}</span>
                    <span className={cn('flex items-center gap-0.5 text-[11px] font-bold', cfg.text)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>
                  {room.patient ? (
                    <>
                      <p className="text-[10px] font-medium text-gray-800 truncate">{room.patient}</p>
                      <p className="text-[11px] text-gray-500 truncate">{room.provider} · {room.since}</p>
                      {room.vitals && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{room.vitals}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Task Queue */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader title="Task Queue" count={NURSE_TASKS.filter((t) => !t.done).length} action="All tasks" />
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {NURSE_TASKS.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer',
                  task.done && 'opacity-40',
                )}
              >
                <button className="flex-shrink-0">
                  {task.done
                    ? <CheckCircle2 className="w-4 h-4 text-success-500" />
                    : <Circle className="w-4 h-4 text-gray-300 hover:text-blue-400" />}
                </button>
                <span className={cn(
                  'flex items-center gap-1 flex-shrink-0',
                  task.priority === 'high' ? 'text-critical-500' : 'text-gray-400',
                )}>
                  {TASK_ICON[task.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={cn('text-[11px] font-semibold', task.done ? 'line-through text-gray-400' : 'text-gray-800')}>
                      {task.patient}
                    </span>
                    <span className="text-[11px] text-gray-400">·</span>
                    <span className="text-[11px] text-gray-400 font-mono">{task.time}</span>
                    {task.priority === 'high' && !task.done && (
                      <span className="text-[10px] bg-critical-100 text-critical-700 px-1 py-0.5 rounded font-bold">STAT</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 truncate">{task.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Front Desk
// ═══════════════════════════════════════════════════════════════════════════

interface FDAppt {
  id: string; time: string; name: string; type: ApptType; status: ApptStatus;
  insVerified: boolean; balance: number; intakeDone: boolean;
}

const FD_APPTS: FDAppt[] = [
  { id: 'A1', time: '08:00', name: 'Johnson, Robert',    type: 'annual_wellness', status: 'completed',   insVerified: true,  balance: 0,   intakeDone: true  },
  { id: 'A2', time: '08:30', name: 'Rivera, Linda',      type: 'follow_up',       status: 'in_progress', insVerified: false, balance: 45,  intakeDone: true  },
  { id: 'A3', time: '09:00', name: 'Chen, Marcus',       type: 'new_patient',     status: 'arrived',     insVerified: true,  balance: 150, intakeDone: false },
  { id: 'A4', time: '09:30', name: 'Thompson, Patricia', type: 'urgent',          status: 'confirmed',   insVerified: true,  balance: 0,   intakeDone: true  },
  { id: 'A5', time: '10:00', name: 'Williams, James',    type: 'follow_up',       status: 'confirmed',   insVerified: true,  balance: 25,  intakeDone: true  },
  { id: 'A6', time: '10:30', name: 'Martinez, Angela',   type: 'telehealth',      status: 'scheduled',   insVerified: false, balance: 0,   intakeDone: false },
  { id: 'A7', time: '11:00', name: 'Baker, George',      type: 'procedure',       status: 'scheduled',   insVerified: true,  balance: 0,   intakeDone: true  },
  { id: 'A8', time: '14:00', name: 'Patel, Susan',       type: 'follow_up',       status: 'scheduled',   insVerified: false, balance: 75,  intakeDone: false },
];

interface CheckInItem {
  name: string; time: string; issues: string[]; balance: number; type: ApptType;
}

const CHECKIN_QUEUE: CheckInItem[] = [
  { name: 'Rivera, Linda',    time: '08:30', issues: ['Ins. unverified', 'Balance $45'],              balance: 45,  type: 'follow_up' },
  { name: 'Chen, Marcus',     time: '09:00', issues: ['New patient — consent forms', 'Photo ID req'], balance: 150, type: 'new_patient' },
  { name: 'Williams, James',  time: '10:00', issues: ['Balance $25'],                                 balance: 25,  type: 'follow_up' },
  { name: 'Martinez, Angela', time: '10:30', issues: ['Ins. unverified', 'Intake incomplete'],        balance: 0,   type: 'telehealth' },
  { name: 'Patel, Susan',     time: '14:00', issues: ['Ins. unverified', 'Balance $75'],              balance: 75,  type: 'follow_up' },
];

// ─── Front Desk Dashboard ───────────────────────────────────────────────────

const FrontDeskDashboard: React.FC = () => {
  const checkedIn = FD_APPTS.filter((a) => ['arrived', 'in_room', 'in_progress', 'completed'].includes(a.status)).length;
  const totalBal  = CHECKIN_QUEUE.reduce((n, q) => n + q.balance, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        <KpiCard label="Scheduled Today"   value={FD_APPTS.length}      sub="appointments"           icon={<Calendar    className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
        <KpiCard label="Checked In"        value={checkedIn}            sub={`of ${FD_APPTS.length}`} icon={<UserCheck   className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50" />
        <KpiCard label="Needs Attention"   value={CHECKIN_QUEUE.length} sub="action required"         icon={<AlertCircle className="w-3.5 h-3.5 text-warning-600" />} iconBg="bg-warning-50" alert />
        <KpiCard label="Outstanding Bal."  value={`$${totalBal}`}       sub={`${CHECKIN_QUEUE.filter((q) => q.balance > 0).length} patients`} icon={<DollarSign  className="w-3.5 h-3.5 text-amber-600"   />} iconBg="bg-amber-50"   />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {/* Schedule — 3 cols */}
        <Card className="col-span-3 flex flex-col overflow-hidden">
          <CardHeader title="Today's Schedule" count={FD_APPTS.length} action="Full schedule" />
          <div className="overflow-y-auto flex-1">
            {FD_APPTS.map((a) => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0 group">
                <span className="text-[11px] font-mono font-semibold text-gray-600 w-10 flex-shrink-0">{a.time}</span>
                <span className={cn('text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0', TYPE_PILL[a.type])}>
                  {TYPE_LABEL[a.type]}
                </span>
                <span className="text-[11px] font-medium text-gray-900 truncate flex-1">{a.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!a.insVerified && (
                    <span className="text-[10px] bg-warning-100 text-warning-700 px-1 py-0.5 rounded font-bold">INS</span>
                  )}
                  {a.balance > 0 && (
                    <span className="text-[10px] bg-critical-100 text-critical-700 px-1 py-0.5 rounded font-bold">${a.balance}</span>
                  )}
                  {!a.intakeDone && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold">INTAKE</span>
                  )}
                </div>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <span className={cn('w-1.5 h-1.5 rounded-full', STATUS_DOT[a.status])} />
                  <span className="text-[11px] text-gray-500">{STATUS_LABEL[a.status]}</span>
                </span>
                <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </Card>

        {/* Check-In Queue — 2 cols */}
        <Card className="col-span-2 flex flex-col overflow-hidden">
          <CardHeader title="Check-In Queue" count={CHECKIN_QUEUE.length} />
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {CHECKIN_QUEUE.map((item, i) => (
              <div key={i} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-gray-900">{item.name}</span>
                  <span className="text-[11px] font-mono text-gray-400">{item.time}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {item.issues.map((issue, j) => (
                    <span key={j} className="inline-flex items-center gap-0.5 text-[11px] bg-warning-50 text-warning-700 border border-warning-200 px-1.5 py-0.5 rounded">
                      <AlertCircle className="w-2 h-2" />
                      {issue}
                    </span>
                  ))}
                </div>
                <button className="w-full text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded transition-colors flex items-center justify-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Check In
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Billing
// ═══════════════════════════════════════════════════════════════════════════

interface ClaimRow {
  id: string; patient: string; dos: string; payer: string; amount: string;
  cpt: string; status: 'ready' | 'submitted' | 'accepted';
}
interface DenialRow {
  id: string; patient: string; dos: string; payer: string; amount: string; reason: string; code: string;
}

const CLAIM_QUEUE: ClaimRow[] = [
  { id: 'CLM-10441', patient: 'Johnson, R.',  dos: '03/19', payer: 'Aetna',    amount: '$285', cpt: '99214', status: 'ready'     },
  { id: 'CLM-10442', patient: 'Rivera, L.',   dos: '03/19', payer: 'BCBS',     amount: '$198', cpt: '99213', status: 'ready'     },
  { id: 'CLM-10443', patient: 'Chen, M.',     dos: '03/19', payer: 'UHC',      amount: '$340', cpt: '99205', status: 'ready'     },
  { id: 'CLM-10444', patient: 'Torres, M.',   dos: '03/19', payer: 'Cigna',    amount: '$175', cpt: '99213', status: 'ready'     },
  { id: 'CLM-10440', patient: 'Thompson, P.', dos: '03/18', payer: 'Medicare', amount: '$212', cpt: '99213', status: 'submitted' },
  { id: 'CLM-10439', patient: 'Williams, J.', dos: '03/18', payer: 'Cigna',    amount: '$175', cpt: '99212', status: 'accepted'  },
  { id: 'CLM-10438', patient: 'Baker, G.',    dos: '03/18', payer: 'BCBS',     amount: '$420', cpt: '11401', status: 'submitted' },
];

const DENIAL_QUEUE: DenialRow[] = [
  { id: 'CLM-10397', patient: 'Baker, G.',    dos: '03/12', payer: 'Aetna',  amount: '$195', reason: 'Prior auth required',    code: 'CO-15' },
  { id: 'CLM-10381', patient: 'Patel, S.',    dos: '03/10', payer: 'BCBS',   amount: '$285', reason: 'Duplicate claim',        code: 'CO-18' },
  { id: 'CLM-10372', patient: 'Martinez, A.', dos: '03/08', payer: 'UHC',    amount: '$145', reason: 'Service not covered',    code: 'CO-96' },
  { id: 'CLM-10365', patient: 'Torres, M.',   dos: '03/07', payer: 'Humana', amount: '$320', reason: 'Timely filing exceeded', code: 'CO-29' },
  { id: 'CLM-10350', patient: 'Davis, W.',    dos: '03/05', payer: 'Aetna',  amount: '$240', reason: 'Non-covered service',    code: 'CO-96' },
];

const CLAIM_STATUS_STYLE: Record<ClaimRow['status'], string> = {
  ready:     'bg-blue-100 text-blue-700',
  submitted: 'bg-warning-100 text-warning-700',
  accepted:  'bg-success-100 text-success-700',
};

// ─── Billing Dashboard ──────────────────────────────────────────────────────

const BillingDashboard: React.FC = () => {
  const { data: apiData } = useBillingDashboard();

  // KPI values — use API data when available, fall back to inline mock literals
  const cleanClaimRate   = apiData?.cleanClaimRate   != null ? `${apiData.cleanClaimRate}%` : '94.2%';
  const denialRate       = apiData?.denialRate       != null ? `${apiData.denialRate}%`     : '5.8%';
  const daysInAR         = apiData?.daysInAR         ?? 32;
  const collectionsPerWk = apiData?.collectionsPerWk != null ? `$${apiData.collectionsPerWk}` : '$48.2k';

  return (
  <div className="flex flex-col gap-2">
    <div className="grid grid-cols-4 gap-2">
      <KpiCard label="Clean Claim Rate"  value={cleanClaimRate}   trend="up"   sub="+1.3% vs last mo"  icon={<CheckCircle2  className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50" />
      <KpiCard label="Denial Rate"       value={denialRate}       trend="down" sub="-0.4% vs last mo"  icon={<XCircle       className="w-3.5 h-3.5 text-critical-600" />} iconBg="bg-critical-50" alert />
      <KpiCard label="Days in A/R"       value={daysInAR}         trend="down" sub="target ≤30"         icon={<Clock         className="w-3.5 h-3.5 text-warning-600" />} iconBg="bg-warning-50" />
      <KpiCard label="Collections / Wk"  value={collectionsPerWk} trend="up"  sub="+8.2% vs last wk"  icon={<DollarSign    className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
    </div>

    <div className="grid grid-cols-2 gap-2">
      {/* Claim Queue */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader title="Claim Queue" count={47}>
          <button className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-0.5 rounded transition-colors">
            Submit All Ready
          </button>
        </CardHeader>
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
              <tr>
                {['ID', 'Patient', 'DOS', 'Payer', 'CPT', 'Amt', 'Status', ''].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {CLAIM_QUEUE.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-2 py-1.5 text-[11px] font-mono text-gray-400 whitespace-nowrap">{c.id}</td>
                  <td className="px-2 py-1.5 text-[10px] font-medium text-gray-800 whitespace-nowrap">{c.patient}</td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-500 whitespace-nowrap">{c.dos}</td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-500 whitespace-nowrap">{c.payer}</td>
                  <td className="px-2 py-1.5 text-[11px] font-mono text-gray-600 whitespace-nowrap">{c.cpt}</td>
                  <td className="px-2 py-1.5 text-[10px] font-semibold text-gray-800 whitespace-nowrap">{c.amount}</td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize', CLAIM_STATUS_STYLE[c.status])}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <button className="text-[11px] text-blue-600 hover:underline font-medium">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Denial Queue */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader title="Denial Queue" count={12}>
          <button className="text-[10px] bg-critical-600 hover:bg-critical-700 text-white font-semibold px-2 py-0.5 rounded transition-colors">
            Bulk Appeal
          </button>
        </CardHeader>
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
              <tr>
                {['ID', 'Patient', 'DOS', 'Payer', 'Amt', 'Reason', 'Code', ''].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DENIAL_QUEUE.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-2 py-1.5 text-[11px] font-mono text-gray-400 whitespace-nowrap">{d.id}</td>
                  <td className="px-2 py-1.5 text-[10px] font-medium text-gray-800 whitespace-nowrap">{d.patient}</td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-500 whitespace-nowrap">{d.dos}</td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-500 whitespace-nowrap">{d.payer}</td>
                  <td className="px-2 py-1.5 text-[10px] font-semibold text-gray-800 whitespace-nowrap">{d.amount}</td>
                  <td className="px-2 py-1.5 text-[10px] text-critical-700 max-w-[120px] truncate">{d.reason}</td>
                  <td className="px-2 py-1.5 text-[11px] font-mono text-gray-600 whitespace-nowrap">{d.code}</td>
                  <td className="px-2 py-1.5">
                    <button className="text-[11px] text-critical-600 hover:underline font-medium">Appeal</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Practice Admin
// ═══════════════════════════════════════════════════════════════════════════

interface StaffTask { assignee: string; role: string; task: string; priority: 'high' | 'medium' | 'low'; due: string; }

const STAFF_TASKS: StaffTask[] = [
  { assignee: 'Sarah Thompson', role: 'RN',         task: 'Complete OSHA annual training (overdue)',        priority: 'high',   due: 'TODAY'  },
  { assignee: 'David Kim',      role: 'Front Desk',  task: 'Call 4 unconfirmed appointments for tomorrow',   priority: 'high',   due: 'TODAY'  },
  { assignee: 'Lisa Patel',     role: 'Billing',     task: 'Post 22 EOBs from Aetna batch 3/19',            priority: 'high',   due: 'TODAY'  },
  { assignee: 'Front Desk',     role: 'Team',        task: 'Update 8 patients with missing demographics',    priority: 'medium', due: '3/21'   },
  { assignee: 'Sarah Thompson', role: 'RN',          task: 'Restock exam rooms — supplies low',             priority: 'low',    due: '3/22'   },
  { assignee: 'Maria Garcia',   role: 'Practice Admin', task: 'Finalize April provider schedule template',  priority: 'medium', due: '3/25'   },
];

const PRIORITY_STYLE: Record<'high' | 'medium' | 'low', string> = {
  high:   'bg-critical-100 text-critical-700',
  medium: 'bg-warning-100 text-warning-700',
  low:    'bg-slate-100 text-slate-500',
};

const QUICK_ACTIONS = [
  { label: 'Add New Patient',         icon: <Users          className="w-3.5 h-3.5" /> },
  { label: 'Schedule Appointment',    icon: <Calendar       className="w-3.5 h-3.5" /> },
  { label: 'Eligibility Check',       icon: <ShieldAlert    className="w-3.5 h-3.5" /> },
  { label: 'Day-End Report',          icon: <BarChart3      className="w-3.5 h-3.5" /> },
  { label: 'Broadcast Message',       icon: <MessageSquare  className="w-3.5 h-3.5" /> },
  { label: 'Provider Schedules',      icon: <UserCog        className="w-3.5 h-3.5" /> },
];

// ─── Practice Admin Dashboard ───────────────────────────────────────────────

const PracticeAdminDashboard: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className="grid grid-cols-4 gap-2">
      <KpiCard label="Patients Seen"    value={14}       sub="of 26 scheduled"           icon={<UserCheck  className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
      <KpiCard label="No-Shows"         value={2}        trend="down" sub="7.7% rate"    icon={<XCircle   className="w-3.5 h-3.5 text-critical-600" />} iconBg="bg-critical-50" alert />
      <KpiCard label="Avg Wait Time"    value="14 min"   trend="up"   sub="on target"    icon={<Timer     className="w-3.5 h-3.5 text-success-600"  />} iconBg="bg-success-50"  />
      <KpiCard label="Revenue Today"    value="$8,640"   trend="up"   sub="+12% vs yest" icon={<DollarSign className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50"  />
    </div>

    <div className="grid grid-cols-3 gap-2">
      {/* Staff Tasks */}
      <Card className="col-span-2 flex flex-col overflow-hidden">
        <CardHeader title="Staff Task List" count={STAFF_TASKS.length} action="All tasks" />
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {STAFF_TASKS.map((task, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[11px] font-semibold text-gray-700">{task.assignee}</span>
                  <span className="text-[11px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">{task.role}</span>
                </div>
                <p className="text-[10px] text-gray-600 truncate">{task.task}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] text-gray-400 font-mono">{task.due}</span>
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize', PRIORITY_STYLE[task.priority])}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-2 flex flex-col gap-1">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-[11px] text-gray-700 hover:text-blue-700 font-medium transition-all text-left"
            >
              <span className="text-blue-500 flex-shrink-0">{action.icon}</span>
              {action.label}
              <ChevronRight className="w-3 h-3 ml-auto text-gray-300" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Tenant Admin
// ═══════════════════════════════════════════════════════════════════════════

interface ActivityRow { name: string; role: string; action: string; time: string; initials: string; }

const ACTIVITY: ActivityRow[] = [
  { name: 'Dr. Emily Chen',  role: 'Provider',    action: 'Signed encounter ENC-04821',            time: '9:14a', initials: 'EC' },
  { name: 'Sarah Thompson',  role: 'Nurse',        action: 'Recorded vitals for PAT-00103',         time: '9:02a', initials: 'ST' },
  { name: 'David Kim',       role: 'Front Desk',   action: 'Checked in Marcus Chen',                time: '8:58a', initials: 'DK' },
  { name: 'Lisa Patel',      role: 'Billing',      action: 'Submitted 14 claims to Aetna',          time: '8:45a', initials: 'LP' },
  { name: 'Dr. Emily Chen',  role: 'Provider',     action: 'Ordered lab — Comprehensive Metabolic', time: '8:32a', initials: 'EC' },
  { name: 'Maria Garcia',    role: 'Prac. Admin',  action: 'Updated schedule template for April',   time: '8:20a', initials: 'MG' },
  { name: 'Dr. James Park',  role: 'Provider',     action: 'Closed 3 encounters from yesterday',    time: '8:05a', initials: 'JP' },
];

interface ComplianceAlert { severity: 'high' | 'medium' | 'low'; message: string; action: string; }

const COMPLIANCE_ALERTS: ComplianceAlert[] = [
  { severity: 'high',   message: '3 providers missing HIPAA training (due 3/31)', action: 'Assign Training' },
  { severity: 'medium', message: 'DEA registration — Dr. Chen expires in 45 days', action: 'Renew DEA' },
  { severity: 'low',    message: '12 patient records missing signed consent forms', action: 'Review Records' },
];

const COMPLIANCE_STYLE: Record<'high' | 'medium' | 'low', { card: string; btn: string; icon: string }> = {
  high:   { card: 'bg-critical-50 border-critical-200', btn: 'bg-critical-600 hover:bg-critical-700 text-white', icon: 'text-critical-500' },
  medium: { card: 'bg-warning-50 border-warning-200',   btn: 'bg-warning-600 hover:bg-warning-700 text-white',   icon: 'text-warning-500'  },
  low:    { card: 'bg-slate-50 border-slate-200',          btn: 'bg-gray-200 hover:bg-gray-300 text-gray-700',     icon: 'text-gray-400'     },
};

// ─── Tenant Admin Dashboard ─────────────────────────────────────────────────

const TenantAdminDashboard: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className="grid grid-cols-4 gap-2">
      <KpiCard label="Active Patients"    value="2,847" trend="up"   sub="+34 this mo"        icon={<Users       className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
      <KpiCard label="Active Providers"   value={4}     sub="2 locations"                      icon={<Stethoscope className="w-3.5 h-3.5 text-teal-600"    />} iconBg="bg-teal-50"    />
      <KpiCard label="Encounters / Mo"    value={487}   trend="up"   sub="+11% vs last mo"     icon={<Activity    className="w-3.5 h-3.5 text-amber-600"   />} iconBg="bg-amber-50"   />
      <KpiCard label="Monthly Revenue"    value="$94.2k" trend="up"  sub="+8.4% vs last mo"    icon={<DollarSign  className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50"  />
    </div>

    <div className="grid grid-cols-3 gap-2">
      {/* Audit Activity */}
      <Card className="col-span-2 flex flex-col overflow-hidden">
        <CardHeader title="Recent Activity" action="Audit log" />
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-700 flex-shrink-0">
                {a.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-800">{a.name}</span>
                  <span className="text-[11px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">{a.role}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{a.action}</p>
              </div>
              <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader title="Compliance" count={COMPLIANCE_ALERTS.length} />
        <div className="p-2 flex flex-col gap-2">
          {COMPLIANCE_ALERTS.map((alert, i) => {
            const cfg = COMPLIANCE_STYLE[alert.severity];
            return (
              <div key={i} className={cn('rounded-md border p-2', cfg.card)}>
                <div className="flex items-start gap-1.5 mb-1.5">
                  <ShieldAlert className={cn('w-3 h-3 flex-shrink-0 mt-0.5', cfg.icon)} />
                  <p className="text-[10px] text-gray-700 leading-relaxed">{alert.message}</p>
                </div>
                <button className={cn('text-[11px] font-semibold px-2 py-1 rounded transition-colors', cfg.btn)}>
                  {alert.action}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// DATA — Super Admin
// ═══════════════════════════════════════════════════════════════════════════

interface TenantRow {
  id: string; name: string; subdomain: string; providers: number; patients: number;
  enc: number; status: 'active' | 'inactive' | 'provisioning'; plan: 'starter' | 'pro' | 'enterprise'; lastActive: string;
}

const TENANTS: TenantRow[] = [
  { id: 'TEN-00001', name: 'Primus Think Health',     subdomain: 'primusdemo', providers: 4, patients: 2847, enc: 487, status: 'active',       plan: 'pro',        lastActive: '2 min ago'  },
  { id: 'TEN-00002', name: 'Riverside Family Clinic', subdomain: 'riverside',   providers: 2, patients: 1204, enc: 218, status: 'active',       plan: 'starter',    lastActive: '18 min ago' },
  { id: 'TEN-00003', name: 'Lakeview Medical Group',  subdomain: 'lakeview',    providers: 8, patients: 5620, enc: 941, status: 'active',       plan: 'enterprise', lastActive: '5 min ago'  },
  { id: 'TEN-00004', name: 'Summit Primary Care',     subdomain: 'summit',      providers: 3, patients: 1870, enc: 312, status: 'active',       plan: 'pro',        lastActive: '1 hr ago'   },
  { id: 'TEN-00005', name: 'Eastside Wellness',       subdomain: 'eastside',    providers: 1, patients: 0,    enc: 0,   status: 'provisioning', plan: 'starter',    lastActive: 'Never'      },
];

const TENANT_STATUS_STYLE: Record<TenantRow['status'], string> = {
  active:       'bg-success-100 text-success-700',
  inactive:     'bg-slate-100 text-slate-500',
  provisioning: 'bg-blue-100 text-blue-700',
};

const PLAN_STYLE: Record<TenantRow['plan'], string> = {
  starter:    'bg-slate-100 text-slate-500',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

interface ServiceRow { name: string; status: 'healthy' | 'degraded' | 'down'; latency: string; uptime: string; }

const SERVICES: ServiceRow[] = [
  { name: 'API Gateway',           status: 'healthy',  latency: '42ms',  uptime: '99.99%' },
  { name: 'Auth (Keycloak)',       status: 'healthy',  latency: '18ms',  uptime: '99.97%' },
  { name: 'Database Cluster',      status: 'healthy',  latency: '5ms',   uptime: '100%'   },
  { name: 'Availity Clearinghouse',status: 'degraded', latency: '840ms', uptime: '98.2%'  },
  { name: 'ScriptSure EPCS',       status: 'healthy',  latency: '210ms', uptime: '99.8%'  },
  { name: 'Twilio SMS',            status: 'healthy',  latency: '65ms',  uptime: '99.9%'  },
  { name: 'Amazon Chime SDK',      status: 'healthy',  latency: '88ms',  uptime: '99.95%' },
];

const SVC_DOT: Record<ServiceRow['status'], string> = {
  healthy:  'bg-success-500',
  degraded: 'bg-warning-500',
  down:     'bg-rose-500',
};
const SVC_TEXT: Record<ServiceRow['status'], string> = {
  healthy:  'text-success-600',
  degraded: 'text-warning-600',
  down:     'text-critical-600',
};

// ─── Super Admin Dashboard ──────────────────────────────────────────────────

const SuperAdminDashboard: React.FC = () => (
  <div className="flex flex-col gap-2">
    <div className="grid grid-cols-4 gap-2">
      <KpiCard label="Total Tenants"     value={TENANTS.length}                                                  sub={`${TENANTS.filter((t) => t.status === 'active').length} active`}    icon={<Building2     className="w-3.5 h-3.5 text-blue-600"  />} iconBg="bg-blue-50"  />
      <KpiCard label="Active Users (30d)" value="342"             trend="up"   sub="+28 vs last mo"              icon={<Users         className="w-3.5 h-3.5 text-teal-600"    />} iconBg="bg-teal-50"    />
      <KpiCard label="API Uptime (30d)"  value="99.94%"           trend="up"   sub="30-day avg"                  icon={<Server        className="w-3.5 h-3.5 text-success-600" />} iconBg="bg-success-50"  />
      <KpiCard label="Error Rate (24h)"  value="0.08%"            trend="up"   sub="-0.02% vs yest"              icon={<AlertTriangle className="w-3.5 h-3.5 text-warning-600" />} iconBg="bg-warning-50"  />
    </div>

    <div className="grid grid-cols-3 gap-2">
      {/* Tenant Table */}
      <Card className="col-span-2 flex flex-col overflow-hidden">
        <CardHeader title="Tenant Registry" count={TENANTS.length}>
          <button className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-0.5 rounded transition-colors flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Provision
          </button>
        </CardHeader>
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100">
              <tr>
                {['Tenant', 'Plan', 'Providers', 'Patients', 'Enc/Mo', 'Status', 'Last Active'].map((h) => (
                  <th key={h} className="px-2 py-1.5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {TENANTS.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                  <td className="px-2 py-1.5">
                    <p className="text-[11px] font-semibold text-gray-800 whitespace-nowrap">{t.name}</p>
                    <p className="text-[11px] font-mono text-gray-400">{t.subdomain}.primus.health</p>
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize', PLAN_STYLE[t.plan])}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-[10px] text-gray-600">{t.providers}</td>
                  <td className="px-2 py-1.5 text-[10px] text-gray-600">{t.patients.toLocaleString()}</td>
                  <td className="px-2 py-1.5 text-[10px] text-gray-600">{t.enc}</td>
                  <td className="px-2 py-1.5">
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize', TENANT_STATUS_STYLE[t.status])}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-[11px] text-gray-400 whitespace-nowrap">{t.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Health */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader title="System Health">
          <button className="text-[10px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5">
            <Link className="w-3 h-3" /> Status page
          </button>
        </CardHeader>
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {SERVICES.map((svc, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50">
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', SVC_DOT[svc.status])} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-800 truncate">{svc.name}</p>
                <p className="text-[11px] text-gray-400">{svc.uptime} up</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={cn('text-[10px] font-semibold', SVC_TEXT[svc.status])}>{svc.status}</p>
                <p className={cn('text-[11px]', svc.status === 'degraded' ? 'text-warning-600 font-semibold' : 'text-gray-400')}>
                  {svc.latency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Page Header — compact role-aware strip
// ═══════════════════════════════════════════════════════════════════════════

const ROLE_META: Record<UserRole, { prefix: string; subtitle: string }> = {
  provider:       { prefix: 'Dr.',       subtitle: 'Clinical overview' },
  nurse:          { prefix: '',          subtitle: 'Patient workload'  },
  front_desk:     { prefix: '',          subtitle: 'Schedule & check-in' },
  billing:        { prefix: '',          subtitle: 'Claims & collections' },
  practice_admin: { prefix: '',          subtitle: 'Operations overview' },
  tenant_admin:   { prefix: '',          subtitle: 'Clinic analytics' },
  super_admin:    { prefix: '',          subtitle: 'Platform overview' },
  patient:        { prefix: '',          subtitle: '' },
};

interface PageHeaderProps { firstName: string; role: UserRole; }

const PageHeader: React.FC<PageHeaderProps> = ({ firstName, role }) => {
  const meta = ROLE_META[role] ?? { prefix: '', subtitle: '' };
  return (
    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <h1 className="text-sm font-bold text-gray-900">
          {meta.prefix ? `${meta.prefix} ${firstName}` : firstName}
        </h1>
        {meta.subtitle && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-500">{meta.subtitle}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-gray-400">{TODAY}</span>
        <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
          {LOCATION}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT — DashboardPage
// ═══════════════════════════════════════════════════════════════════════════

const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[11px] text-gray-400">Loading dashboard…</p>
      </div>
    );
  }

  const dashboard = (() => {
    switch (user.role) {
      case 'provider':       return <ProviderDashboard />;
      case 'nurse':          return <NurseDashboard />;
      case 'front_desk':     return <FrontDeskDashboard />;
      case 'billing':        return <BillingDashboard />;
      case 'practice_admin': return <PracticeAdminDashboard />;
      case 'tenant_admin':   return <TenantAdminDashboard />;
      case 'super_admin':    return <SuperAdminDashboard />;
      default:               return (
        <Card className="p-12 text-center">
          <p className="text-[11px] text-gray-400">No dashboard available for this role.</p>
        </Card>
      );
    }
  })();

  return (
    <div className="animate-fade-in flex flex-col h-full">
      <PageHeader firstName={user.firstName} role={user.role} />
      {dashboard}
    </div>
  );
};

export default DashboardPage;
