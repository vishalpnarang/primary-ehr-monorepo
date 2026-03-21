import React, { useState } from 'react';
import { useInboxItems, useInboxCounts } from '@/hooks/useApi';
import {
  FlaskConical,
  MessageSquare,
  Pill,
  Shield,
  CheckSquare,
  ChevronRight,
  ArchiveX,
  CheckCheck,
  X,
  AlertCircle,
  Clock,
  User,
  FileText,
  ArrowLeft,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type InboxType = 'lab_result' | 'message' | 'refill' | 'prior_auth' | 'task';
type Priority = 'critical' | 'high' | 'normal';
type Status = 'unread' | 'read' | 'actioned' | 'archived';

interface InboxItem {
  id: string;
  type: InboxType;
  title: string;
  subtitle: string;
  patientName: string;
  patientId: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  detail: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: InboxItem[] = [
  {
    id: 'INB-001',
    type: 'lab_result',
    title: 'Critical: Potassium 6.8 mEq/L',
    subtitle: 'BMP Panel — Quest Diagnostics',
    patientName: 'Robert Johnson',
    patientId: 'PAT-00001',
    priority: 'critical',
    status: 'unread',
    createdAt: '2026-03-19T12:10:00Z',
    detail: 'Potassium critically elevated at 6.8 mEq/L (ref 3.5–5.0). BUN 28, Creatinine 1.4, eGFR 52. Sodium 138, CO2 22, Chloride 101, Glucose 114. Immediate clinical review required.',
  },
  {
    id: 'INB-002',
    type: 'lab_result',
    title: 'HbA1c 9.2% — Needs Review',
    subtitle: 'Hemoglobin A1c — LabCorp',
    patientName: 'Maria Santos',
    patientId: 'PAT-00002',
    priority: 'high',
    status: 'unread',
    createdAt: '2026-03-19T10:45:00Z',
    detail: 'HbA1c 9.2% (prev 8.7%, 3 months ago). Patient is on Metformin 1000mg BID + Glipizide 5mg daily. Consider intensification of diabetes management. Fasting glucose 218 mg/dL.',
  },
  {
    id: 'INB-003',
    type: 'message',
    title: 'Question about Lisinopril side effects',
    subtitle: 'Patient Portal Message',
    patientName: 'David Kim',
    patientId: 'PAT-00003',
    priority: 'normal',
    status: 'unread',
    createdAt: '2026-03-19T09:30:00Z',
    detail: '"Dr. Chen, I started the Lisinopril 10mg you prescribed last week and I\'ve been having a persistent dry cough for the past 3 days. It\'s keeping me up at night. Should I stop taking it? Is there an alternative? — David Kim"',
  },
  {
    id: 'INB-004',
    type: 'refill',
    title: 'Refill Request: Atorvastatin 40mg',
    subtitle: 'CVS Pharmacy — e-Refill Request',
    patientName: 'Linda Chen',
    patientId: 'PAT-00004',
    priority: 'normal',
    status: 'unread',
    createdAt: '2026-03-19T08:15:00Z',
    detail: 'Atorvastatin 40mg #90, 3 refills. Last prescribed 2025-12-15. Last LDL: 88 mg/dL (on target). No recent lipid panel in 12 months — consider ordering labs with refill. Pharmacy: CVS #4521, 123 Main St.',
  },
  {
    id: 'INB-005',
    type: 'prior_auth',
    title: 'PA Required: Dupixent 300mg',
    subtitle: 'Aetna — Prior Authorization Request',
    patientName: 'Thomas Wright',
    patientId: 'PAT-00005',
    priority: 'high',
    status: 'unread',
    createdAt: '2026-03-18T16:00:00Z',
    detail: 'Dupilumab (Dupixent) 300mg SQ q2w for moderate-to-severe atopic dermatitis. Aetna requires documentation of: (1) failure of 2 topical steroids, (2) dermatology consult note, (3) ICD-10 L20.89. Step therapy documents attached. Deadline: 2026-03-26.',
  },
  {
    id: 'INB-006',
    type: 'task',
    title: 'Complete FMLA paperwork',
    subtitle: 'Assigned by Maria Garcia — Due today',
    patientName: 'Susan Park',
    patientId: 'PAT-00006',
    priority: 'high',
    status: 'unread',
    createdAt: '2026-03-18T14:30:00Z',
    detail: 'Patient Susan Park requires FMLA certification for intermittent leave due to Crohn\'s disease (K50.10). Employer: Acme Corp. Forms uploaded to patient documents. Patient last seen 2026-02-28. Condition onset: 2022-03. Duration: Ongoing, expected 12 months.',
  },
  {
    id: 'INB-007',
    type: 'lab_result',
    title: 'TSH 0.02 — Hyperthyroid',
    subtitle: 'Thyroid Panel — Quest Diagnostics',
    patientName: 'Nancy Williams',
    patientId: 'PAT-00007',
    priority: 'high',
    status: 'read',
    createdAt: '2026-03-18T11:20:00Z',
    detail: 'TSH suppressed at 0.02 mIU/L (ref 0.4–4.0). Free T4 2.4 ng/dL (elevated). Free T3 6.8 pg/mL (elevated). Patient on Levothyroxine 125mcg — likely over-replacement. Consider dose reduction. Last thyroid labs: 6 months ago.',
  },
  {
    id: 'INB-008',
    type: 'message',
    title: 'Referral status inquiry — Cardiology',
    subtitle: 'Nurse Message from Sarah Thompson',
    patientName: 'James Miller',
    patientId: 'PAT-00008',
    priority: 'normal',
    status: 'read',
    createdAt: '2026-03-18T10:00:00Z',
    detail: '"Dr. Chen — James Miller called asking about his cardiology referral sent 2 weeks ago. He says he hasn\'t heard from Dr. Harrison\'s office. Can you follow up? Referral ID: REF-00043. — Sarah T."',
  },
  {
    id: 'INB-009',
    type: 'refill',
    title: 'Refill Request: Metformin 500mg',
    subtitle: 'Walgreens — e-Refill Request',
    patientName: 'Carlos Rivera',
    patientId: 'PAT-00009',
    priority: 'normal',
    status: 'read',
    createdAt: '2026-03-18T09:00:00Z',
    detail: 'Metformin HCl 500mg #60, 3 refills remaining. Last HbA1c: 7.1% (3 months ago, well controlled). No contraindications. eGFR 68 (adequate for Metformin). Safe to refill. Pharmacy: Walgreens #8821.',
  },
  {
    id: 'INB-010',
    type: 'prior_auth',
    title: 'PA Approved: Ozempic 0.5mg',
    subtitle: 'UnitedHealth — Authorization Approved',
    patientName: 'Patricia Nguyen',
    patientId: 'PAT-00010',
    priority: 'normal',
    status: 'actioned',
    createdAt: '2026-03-17T15:00:00Z',
    detail: 'Prior authorization APPROVED for Semaglutide (Ozempic) 0.5mg weekly. Auth #: UHC-2026-881234. Valid: 2026-03-17 to 2027-03-17. Qty: 4 pens/fill, 12 fills/year. Prescribe and notify patient to pick up at pharmacy.',
  },
  {
    id: 'INB-011',
    type: 'task',
    title: 'Review discharge summary — St. Mary\'s',
    subtitle: 'Care Coordination Task',
    patientName: 'George Anderson',
    patientId: 'PAT-00011',
    priority: 'normal',
    status: 'read',
    createdAt: '2026-03-17T13:00:00Z',
    detail: 'George Anderson was discharged from St. Mary\'s Hospital on 2026-03-16 following a 3-day admission for cellulitis (L03.115). Discharge summary attached. Continuing IV antibiotics changed to oral Cephalexin 500mg QID x 7 days. Follow-up requested within 7 days.',
  },
  {
    id: 'INB-012',
    type: 'lab_result',
    title: 'Lipid Panel — LDL 187 mg/dL',
    subtitle: 'Fasting Lipid Panel — LabCorp',
    patientName: 'Helen Brooks',
    patientId: 'PAT-00012',
    priority: 'normal',
    status: 'actioned',
    createdAt: '2026-03-17T10:30:00Z',
    detail: 'LDL 187 mg/dL (elevated), HDL 42 mg/dL, Triglycerides 210 mg/dL, Total Cholesterol 271 mg/dL. Patient not currently on a statin. 10-year ASCVD risk: 14.2%. Consider initiating statin therapy per ACC/AHA guidelines.',
  },
  {
    id: 'INB-013',
    type: 'refill',
    title: 'Refill Request: Amlodipine 10mg',
    subtitle: 'Rite Aid — e-Refill Request',
    patientName: 'Frank Torres',
    patientId: 'PAT-00013',
    priority: 'normal',
    status: 'actioned',
    createdAt: '2026-03-16T16:00:00Z',
    detail: 'Amlodipine besylate 10mg #30, 2 refills remaining. BP at last visit: 128/76 mmHg (well controlled on current dose). Safe to refill. Last BP check: 2026-02-10. Next visit due in 3 months.',
  },
  {
    id: 'INB-014',
    type: 'message',
    title: 'Lab results discussion request',
    subtitle: 'Patient Portal Message',
    patientName: 'Betty Cooper',
    patientId: 'PAT-00014',
    priority: 'normal',
    status: 'actioned',
    createdAt: '2026-03-16T11:00:00Z',
    detail: '"Hello Dr. Chen, I received a notification that my lab results are ready but I don\'t fully understand some of the values. Could we schedule a brief phone call or telehealth visit to discuss them? I\'m particularly worried about the kidney function numbers. — Betty Cooper"',
  },
  {
    id: 'INB-015',
    type: 'task',
    title: 'Quality measure: Annual wellness visits',
    subtitle: 'HEDIS Gap — 12 patients overdue',
    patientName: 'Multiple patients',
    patientId: '',
    priority: 'normal',
    status: 'read',
    createdAt: '2026-03-15T09:00:00Z',
    detail: '12 patients attributed to Dr. Chen are overdue for their Annual Wellness Visit (AWV) per CMS HEDIS requirements. Outreach recommended. Patients: Johnson R, Williams N, Martinez J, Davis S, Wilson T, Brown K, Taylor M, Anderson G, Thomas B, Jackson L, Harris P, White C. Contact list attached.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

type FilterTab = 'all' | InboxType;

const TAB_LABELS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'lab_result', label: 'Labs' },
  { key: 'message', label: 'Messages' },
  { key: 'refill', label: 'Refills' },
  { key: 'prior_auth', label: 'Prior Auth' },
  { key: 'task', label: 'Tasks' },
];

function getTypeIcon(type: InboxType) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'lab_result':  return <FlaskConical className={cls} />;
    case 'message':     return <MessageSquare className={cls} />;
    case 'refill':      return <Pill className={cls} />;
    case 'prior_auth':  return <Shield className={cls} />;
    case 'task':        return <CheckSquare className={cls} />;
  }
}

function getTypeColor(type: InboxType): string {
  switch (type) {
    case 'lab_result':  return 'bg-violet-100 text-violet-600';
    case 'message':     return 'bg-blue-100 text-blue-600';
    case 'refill':      return 'bg-emerald-100 text-emerald-600';
    case 'prior_auth':  return 'bg-amber-100 text-amber-600';
    case 'task':        return 'bg-slate-100 text-slate-600';
  }
}

function getPriorityDot(priority: Priority) {
  switch (priority) {
    case 'critical': return <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 ring-2 ring-red-200" title="Critical" />;
    case 'high':     return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" title="High" />;
    case 'normal':   return <span className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" title="Normal" />;
  }
}

function relativeTime(iso: string): string {
  const now = new Date('2026-03-19T14:00:00Z').getTime();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return 'Yesterday';
  return `${diffD}d ago`;
}

function countByType(items: InboxItem[], type: InboxType): number {
  return items.filter((i) => i.type === type && i.status === 'unread').length;
}

// ─── Component ────────────────────────────────────────────────────────────────

const InboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [items, setItems] = useState<InboxItem[]>(MOCK_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // API hooks — use API data if available, fall back to inline mock
  const { data: apiInboxItems } = useInboxItems();
  const { data: apiCounts } = useInboxCounts();

  const filtered = activeTab === 'all'
    ? items.filter((i) => i.status !== 'archived')
    : items.filter((i) => i.type === activeTab && i.status !== 'archived');

  const selectedItem = items.find((i) => i.id === selectedId) ?? null;

  const handleSelect = (item: InboxItem) => {
    setSelectedId(item.id);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id && i.status === 'unread' ? { ...i, status: 'read' } : i))
    );
  };

  const toggleBulkSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const markAllRead = () => {
    setItems((prev) =>
      prev.map((i) =>
        filtered.some((f) => f.id === i.id) && i.status === 'unread'
          ? { ...i, status: 'read' }
          : i
      )
    );
  };

  const archiveSelected = () => {
    if (selected.size === 0) return;
    setItems((prev) =>
      prev.map((i) => (selected.has(i.id) ? { ...i, status: 'archived' } : i))
    );
    setSelected(new Set());
    if (selectedId && selected.has(selectedId)) setSelectedId(null);
  };

  const archiveSingle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'archived' } : i)));
    if (selectedId === id) setSelectedId(null);
  };

  // Merge API inbox items into local state once on first successful fetch
  React.useEffect(() => {
    if (apiInboxItems?.content && Array.isArray(apiInboxItems.content) && apiInboxItems.content.length > 0) {
      setItems(apiInboxItems.content as InboxItem[]);
    }
  }, [apiInboxItems]);

  const unreadCount = (tab: FilterTab) => {
    // Prefer API counts when available, fall back to local computation
    if (apiCounts) {
      if (tab === 'all') return (apiCounts as Record<string, number>).total ?? items.filter((i) => i.status === 'unread').length;
      return (apiCounts as Record<string, number>)[tab] ?? countByType(items, tab as InboxType);
    }
    if (tab === 'all') return items.filter((i) => i.status === 'unread').length;
    return countByType(items, tab as InboxType);
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col -m-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.filter((i) => i.status === 'unread').length} unread items requiring attention
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-sm text-gray-500">{selected.size} selected</span>
          )}
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
          <button
            onClick={archiveSelected}
            disabled={selected.size === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArchiveX className="w-4 h-4" />
            Archive ({selected.size})
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 mb-0">
        {TAB_LABELS.map(({ key, label }) => {
          const count = unreadCount(key);
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSelectedId(null); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0 mt-0 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
        {/* List panel */}
        <div className={`${selectedItem ? 'w-[380px] flex-shrink-0' : 'flex-1'} border-r border-slate-200 overflow-y-auto`}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <CheckCheck className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">All caught up!</p>
              <p className="text-xs text-gray-400 mt-1">No items in this category</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors group ${
                  selectedId === item.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                } ${item.status === 'unread' ? 'bg-white' : 'bg-slate-50/50'}`}
              >
                {/* Bulk checkbox */}
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={(e) => { e.stopPropagation(); toggleBulkSelect(item.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                />
                {/* Priority dot */}
                <div className="mt-1.5">{getPriorityDot(item.priority)}</div>
                {/* Type icon */}
                <div className={`mt-0.5 w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug truncate ${item.status === 'unread' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {item.title}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-0.5">
                      {relativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{item.subtitle}</p>
                  {item.patientName && item.patientName !== 'Multiple patients' && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.patientName}</span>
                    </div>
                  )}
                </div>
                {/* Status badge */}
                {item.status === 'actioned' && (
                  <span className="mt-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 rounded flex-shrink-0">
                    Done
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selectedItem ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Detail header */}
            <div className="flex items-start justify-between px-4 py-3 border-b border-slate-200 bg-white">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="mt-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(selectedItem.type)}`}>
                  {getTypeIcon(selectedItem.type)}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedItem.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => archiveSingle(selectedItem.id)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Archive"
                >
                  <ArchiveX className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Meta info */}
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <strong className="text-gray-700">{selectedItem.patientName}</strong>
                {selectedItem.patientId && <span className="text-gray-400">· {selectedItem.patientId}</span>}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {relativeTime(selectedItem.createdAt)}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                selectedItem.priority === 'critical' ? 'bg-red-100 text-red-700' :
                selectedItem.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {selectedItem.priority === 'critical' && <AlertCircle className="w-3 h-3" />}
                {selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)} Priority
              </span>
            </div>

            {/* Detail body */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="bg-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Details</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedItem.detail}
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedItem.type === 'lab_result' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Review &amp; Sign
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Message Patient
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Order Follow-up
                    </button>
                  </>
                )}
                {selectedItem.type === 'message' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Reply
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Schedule Visit
                    </button>
                  </>
                )}
                {selectedItem.type === 'refill' && (
                  <>
                    <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                      Approve Refill
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Deny with Note
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Request Visit
                    </button>
                  </>
                )}
                {selectedItem.type === 'prior_auth' && (
                  <>
                    <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
                      Submit PA
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Upload Documents
                    </button>
                  </>
                )}
                {selectedItem.type === 'task' && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Mark Complete
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Reassign
                    </button>
                  </>
                )}
                <button
                  onClick={() => archiveSingle(selectedItem.id)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-500 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">Select an item to view details</p>
            <p className="text-xs text-gray-400 mt-1">Click any inbox item on the left</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
