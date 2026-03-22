import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePatient, usePatientTimeline } from '@/hooks/useApi';
import {
  FileText, AlertTriangle, FlaskConical,
  ChevronRight, Plus, MessageSquare, Calendar,
  TrendingUp, TrendingDown, AlertCircle,
  Shield, Phone, X, CheckSquare, Edit3, Printer,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const patient = {
  id: 'PAT-10001', mrn: 'PAT-10001', firstName: 'Sarah', lastName: 'Johnson',
  dob: '1981-05-15', age: 44, sex: 'Female', phone: '(555) 234-5678',
  provider: 'Dr. Emily Chen',
  insurance: { payerName: 'Blue Cross Blue Shield', memberId: 'BCB-9283746', verified: true },
  allergies: [
    { id: 'a1', substance: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' as const },
    { id: 'a2', substance: 'Sulfa Drugs', reaction: 'Rash, Hives', severity: 'moderate' as const },
    { id: 'a3', substance: 'Latex', reaction: 'Contact dermatitis', severity: 'mild' as const },
  ],
  riskFlags: [
    { type: 'high-risk' as const, label: 'High Risk', severity: 'critical' as const },
    { type: 'care-gap' as const, label: 'Care Gap', severity: 'warning' as const },
  ],
};

const medications = [
  { id: '1', name: 'Metformin', strength: '1000mg', directions: 'Take 1 tab PO BID with meals', date: '01-05-2026' },
  { id: '2', name: 'Lisinopril', strength: '20mg', directions: 'Take 1 tab PO daily', date: '02-15-2026' },
  { id: '3', name: 'Atorvastatin', strength: '40mg', directions: 'Take 1 tab PO at bedtime', date: '11-20-2025' },
  { id: '4', name: 'Metoprolol Succinate', strength: '50mg', directions: 'Take 1 tab PO daily', date: '09-15-2025' },
  { id: '5', name: 'Aspirin', strength: '81mg', directions: 'Take 1 tab PO daily', date: '09-15-2025' },
  { id: '6', name: 'Jardiance', strength: '25mg', directions: 'Take 1 tab PO daily AM', date: '01-10-2026' },
  { id: '7', name: 'Ozempic', strength: '1mg', directions: 'Inject 1mg SQ weekly', date: '12-01-2025' },
  { id: '8', name: 'Vitamin D3', strength: '2000 IU', directions: 'Take 1 cap PO daily', date: '10-05-2025' },
];

const problems = [
  { id: '1', description: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', onset: '2020' },
  { id: '2', description: 'Essential Hypertension', icdCode: 'I10', onset: '2019' },
  { id: '3', description: 'Hyperlipidemia', icdCode: 'E78.5', onset: '2021' },
  { id: '4', description: 'Obesity, BMI 32.9', icdCode: 'E66.01', onset: '2020' },
  { id: '5', description: 'Vitamin D Deficiency', icdCode: 'E55.9', onset: '2022' },
];

const encounterDetails = [
  { id: '1', title: 'H&P Complete Note', codes: 'E11.9 — T2DM, I10 — HTN', date: 'Mar 19, 2026 at 2:30 PM' },
  { id: '2', title: 'SOAP Note', codes: 'E11.9 — T2DM, I10 — HTN', date: 'Feb 15, 2026 at 10:00 AM' },
  { id: '3', title: 'Progress Note', codes: 'I10 — Essential hypertension', date: 'Jan 10, 2026 at 9:30 AM' },
  { id: '4', title: 'Follow-Up Note', codes: 'E11.9 — T2DM', date: 'Dec 1, 2025 at 2:00 PM' },
  { id: '5', title: 'SOAP Note', codes: 'J06.9 — URI', date: 'Oct 20, 2025 at 11:00 AM' },
];

const familyHistory = [
  { relation: 'Father', condition: 'Hypertension', age: 'Age 45' },
  { relation: 'Mother', condition: 'Type 2 Diabetes', age: 'Age 52' },
  { relation: 'M. Grandmother', condition: 'Breast Cancer', age: 'Age 63' },
  { relation: 'Brother', condition: 'Asthma', age: 'Age 12' },
  { relation: 'P. Grandfather', condition: 'Coronary Artery Disease', age: 'Age 58' },
];

const previousVisits = [
  { date: '19 Mar', title: 'Follow-Up', details: 'Thu, 2:00 PM-3:00 PM · In-Person', status: 'In Progress' },
  { date: '15 Feb', title: 'Follow-Up', details: 'Mon, 10:00 AM-11:00 AM · In-Person', status: 'Completed' },
  { date: '10 Jan', title: 'Annual Wellness', details: 'Fri, 9:00 AM-10:00 AM · In-Person', status: 'Completed' },
  { date: '01 Dec', title: 'Sick Visit', details: 'Wed, 2:00 PM-2:30 PM · In-Person', status: 'Completed' },
  { date: '20 Oct', title: 'Follow-Up', details: 'Mon, 3:00 PM-3:30 PM · Video', status: 'Completed' },
];

const invoices = [
  { id: 'INV-20260319-001', type: 'Office Visit', date: '03-19-2026', total: 185, due: 45 },
  { id: 'INV-20260215-002', type: 'Lab Work', date: '02-15-2026', total: 250, due: 25 },
];

const pastMedical = [
  { condition: 'Type 2 Diabetes', onset: '2020', status: 'Active' },
  { condition: 'Essential Hypertension', onset: '2019', status: 'Active' },
  { condition: 'Hyperlipidemia', onset: '2021', status: 'Active' },
  { condition: 'Obesity', onset: '2020', status: 'Active' },
];

const pastSurgical = [
  { procedure: 'Cesarean Section', date: '06/2015', notes: 'Uncomplicated' },
  { procedure: 'Appendectomy', date: '03/2008', notes: 'Laparoscopic, no complications' },
  { procedure: 'Tonsillectomy', date: '1995', notes: 'Childhood' },
];

const labResults = [
  { id: '1', lab: 'APEX DIAGNOSTICS', provider: 'Dr. Annette Black', date: '03/15/2026', status: 'Completed' },
  { id: '2', lab: 'HEALTHFIRST LABS', provider: 'Dr. Annette Black', date: '03/15/2026', status: 'Completed' },
  { id: '3', lab: 'PRIMECARE LABORATORY', provider: 'Dr. Annette Black', date: '03/12/2026', status: 'Completed' },
  { id: '4', lab: 'MEDLIFE DIAGNOSTICS', provider: 'Dr. Annette Black', date: '03/10/2026', status: 'Pending' },
  { id: '5', lab: 'CITYPATH LABS', provider: 'Dr. Smith', date: '03/08/2026', status: 'Completed' },
  { id: '6', lab: 'PRECISION DIAGNOSTICS', provider: 'Dr. Annette Black', date: '03/05/2026', status: 'Completed' },
  { id: '7', lab: 'CAREPLUS LABORATORY', provider: 'Dr. Annette Black', date: '03/01/2026', status: 'Completed' },
  { id: '8', lab: 'VITALCHECK LABS', provider: 'Dr. Annette Black', date: '02/25/2026', status: 'Completed' },
];

const tasks = [
  { id: '1', title: 'Review Lab Results', priority: 'Urgent', category: 'Individual', status: 'Open', due: '03/20/2026', assignTo: 'Dr. Chen', assignBy: 'System' },
  { id: '2', title: 'Follow up on Cardiology Referral', priority: 'Regular', category: 'Self', status: 'Open', due: '03/25/2026', assignTo: 'Dr. Chen', assignBy: 'Dr. Chen' },
  { id: '3', title: 'Update Medication List', priority: 'Regular', category: 'Group', status: 'Open', due: '03/22/2026', assignTo: 'S. Thompson', assignBy: 'Dr. Chen' },
  { id: '4', title: 'Schedule Diabetic Eye Exam', priority: 'Urgent', category: 'Group', status: 'Open', due: '03/18/2026', assignTo: 'D. Kim', assignBy: 'Dr. Chen' },
];

const patientMessages = [
  { id: '1', from: 'Sarah Johnson', preview: 'My BP has been higher this week, 145/90...', date: 'Mar 18', unread: true },
  { id: '2', from: 'Dr. Chen', preview: 'Lab results look improved. Continue current...', date: 'Mar 16', unread: false },
  { id: '3', from: 'S. Thompson, RN', preview: 'Patient called about metformin side effects...', date: 'Mar 14', unread: false },
];

const careGaps = [
  { id: '1', measure: 'HbA1c above target', description: 'Last: 7.8% on 3/15/26 — target < 7.0%', priority: 'high' },
  { id: '2', measure: 'Mammogram overdue', description: 'Last screening: 14 months ago', priority: 'medium' },
  { id: '3', measure: 'Diabetic eye exam', description: 'Referred 12/15/25, not yet completed', priority: 'medium' },
];

// ─── Card Component ──────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
  onAdd?: () => void;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxH?: string;
}

const Card: React.FC<CardProps> = ({ title, count, onViewAll, onAdd, headerExtra, children, className, maxH = 'max-h-[260px]' }) => (
  <div className={cn('bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col', className)}>
    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-shrink-0">
      <div className="flex items-center gap-1.5">
        <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
        {count !== undefined && (
          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">{count}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {headerExtra}
        {onViewAll && (
          <button onClick={onViewAll} className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">View All</button>
        )}
        {onAdd && (
          <button onClick={onAdd} className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
    <div className={cn('overflow-y-auto scrollbar-thin flex-1', maxH)}>{children}</div>
  </div>
);

// ─── Inline Detail Drawer ────────────────────────────────────────────────────
// Renders as a right-side panel within the page content area — no modal overlay.

const InlineDetailDrawer: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="absolute inset-y-0 right-0 w-[480px] bg-white border-l border-slate-200 shadow-xl z-30 flex flex-col animate-slide-in-right">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 flex-shrink-0">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded" aria-label="Close">
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
    <div className="overflow-y-auto flex-1 p-4">{children}</div>
  </div>
);

// ─── Action Panel (Right Side) ───────────────────────────────────────────────

type APTab = 'labs' | 'tasks' | 'messages';

const ActionPanel: React.FC<{ collapsed: boolean; toggle: () => void }> = ({ collapsed, toggle }) => {
  const [tab, setTab] = useState<APTab>('labs');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  if (collapsed) {
    return (
      <div className="w-10 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col items-center py-3 gap-2.5">
        <button onClick={toggle} className="p-1 rounded hover:bg-gray-100 text-gray-400"><ChevronRight className="w-4 h-4 rotate-180" /></button>
        <button onClick={() => { toggle(); setTab('labs'); }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><FlaskConical className="w-4 h-4" /></button>
        <button onClick={() => { toggle(); setTab('tasks'); }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><CheckSquare className="w-4 h-4" /></button>
        <button onClick={() => { toggle(); setTab('messages'); }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"><MessageSquare className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <div className="w-[310px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <span className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">Action Panel</span>
        <button onClick={toggle} className="p-1 rounded hover:bg-gray-100 text-gray-400"><ChevronRight className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-0.5 px-3 pt-2 pb-1">
        {(['labs', 'tasks', 'messages'] as APTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'px-3 py-1 text-[11px] font-medium rounded transition-colors capitalize',
            tab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tab === 'labs' && (
          <div className="divide-y divide-gray-50">
            {labResults.map((l) => (
              <div key={l.id} className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-gray-900">{l.lab}</p>
                  <span className={cn('text-[11px] px-1.5 py-0.5 rounded font-medium', l.status === 'Completed' ? 'bg-emerald-50/80 text-emerald-600' : 'bg-amber-50/80 text-amber-600')}>{l.status}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{l.provider} · {l.date}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'tasks' && (
          <div className="divide-y divide-gray-50">
            {tasks.map((t) => (
              <div key={t.id}>
                <div
                  className={cn('px-3 py-2.5 cursor-pointer', expandedTask === t.id ? 'bg-amber-50 border-l-2 border-amber-400' : 'hover:bg-slate-50')}
                  onClick={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                >
                  <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn('text-[11px] px-1.5 py-0.5 rounded font-medium', t.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500')}>{t.priority}</span>
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5"><span className="w-1 h-1 bg-emerald-500 rounded-full" />{t.status}</span>
                    <span className="text-[11px] text-gray-400">{t.due}</span>
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    <button className="text-emerald-500 hover:text-emerald-700"><CheckSquare className="w-3.5 h-3.5" /></button>
                    <button className="text-blue-500 hover:text-blue-700"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {expandedTask === t.id && (
                  <div className="px-3 py-2 bg-white border-l-2 border-amber-400 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div><span className="text-gray-400 uppercase font-medium">Category</span><p className="text-gray-700 mt-0.5">{t.category}</p></div>
                      <div><span className="text-gray-400 uppercase font-medium">Priority</span><p className={cn('mt-0.5 font-medium', t.priority === 'Urgent' ? 'text-red-600' : 'text-gray-700')}>{t.priority}</p></div>
                      <div><span className="text-gray-400 uppercase font-medium">Status</span><p className="text-emerald-600 mt-0.5 font-medium">{t.status}</p></div>
                      <div><span className="text-gray-400 uppercase font-medium">Due Date</span><p className="text-gray-700 mt-0.5">{t.due}</p></div>
                      <div><span className="text-gray-400 uppercase font-medium">Assign To</span><p className="text-gray-700 mt-0.5">{t.assignTo}</p></div>
                      <div><span className="text-gray-400 uppercase font-medium">Created By</span><p className="text-gray-700 mt-0.5">{t.assignBy}</p></div>
                    </div>
                    <p className="text-[11px] text-gray-400 uppercase font-medium mt-2">Note</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">Review and action required per clinical protocol.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'messages' && (
          <div className="divide-y divide-gray-50">
            {patientMessages.map((m) => (
              <div key={m.id} className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className={cn('text-[11px]', m.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>{m.from}</p>
                  <span className="text-[11px] text-gray-400">{m.date}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{m.preview}</p>
                {m.unread && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-0.5" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const PatientChartPage: React.FC = () => {
  const { patientId } = useParams();
  // Real API data (falls back to inline mock if backend is down)
  const { data: apiPatient } = usePatient(patientId ?? '');
  const { data: apiTimeline } = usePatientTimeline(patientId ?? '');
  const [headerTab, setHeaderTab] = useState<string>('home');
  const [subTab, setSubTab] = useState<string>('facesheet');
  const [viewAll, setViewAll] = useState<string | null>(null);
  const [apCollapsed, setApCollapsed] = useState(false);
  // Notes tab state
  const [activeNoteFilter, setActiveNoteFilter] = useState('All');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  // Medication tab state
  const [showDiscMeds, setShowDiscMeds] = useState(false);

  return (
    <div className="-m-4 flex flex-col h-[calc(100vh-2rem)]">
      {/* ── Patient Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">SJ</div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{patient.sex}</span>
            <span className="text-xs text-gray-500">{patient.age} Yrs</span>
            <span className="text-[10px] text-gray-400"><Calendar className="w-3 h-3 inline" /> {patient.dob}</span>
            <span className="text-[10px] text-gray-400"><Phone className="w-3 h-3 inline" /> {patient.phone}</span>
            <span className="text-[10px] text-gray-500">Provider: <strong>{patient.provider}</strong> <Edit3 className="w-3 h-3 inline text-gray-400 cursor-pointer" /></span>
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            {patient.riskFlags.map((f, i) => (
              <span key={i} className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1', f.severity === 'critical' ? 'bg-rose-50 text-rose-600 border border-red-200' : 'bg-amber-50/80 text-amber-600 border border-amber-200')}>
                <AlertTriangle className="w-3 h-3" /> {f.label}
              </span>
            ))}
            <span className="text-[10px] text-gray-400 flex items-center gap-1 ml-1"><Shield className="w-3 h-3" /> {patient.insurance.payerName} <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex gap-0">
            {[{k:'home',l:'Home'},{k:'notes',l:'Notes'},{k:'medication',l:'Medication'},{k:'orders',l:'Orders'},{k:'referrals',l:'Referrals'}].map((t) => (
              <button key={t.k} onClick={() => setHeaderTab(t.k)} className={cn('px-3 py-1.5 text-xs font-medium border-b-2', headerTab === t.k ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700')}>{t.l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {headerTab === 'home' && (
              <div className="flex gap-0.5">
                {[{k:'facesheet',l:'Face Sheet'},{k:'questionnaires',l:'Questionnaires'},{k:'demographics',l:'Demographics'}].map((t) => (
                  <button key={t.k} onClick={() => setSubTab(t.k)} className={cn('px-2 py-1 text-[10px] font-medium rounded', subTab === t.k ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-100')}>{t.l}</button>
                ))}
              </div>
            )}
            <button className="flex items-center gap-1 text-[10px] border border-slate-200 px-2 py-1.5 rounded font-medium text-gray-700 hover:bg-slate-50"><Printer className="w-3 h-3" /> Print Facesheet</button>
            <div className="flex bg-blue-600 text-white rounded">
              <button className="px-2 py-1.5 text-[10px] font-medium hover:bg-blue-700 rounded-l border-r border-blue-500"><ChevronRight className="w-3 h-3 rotate-180" /></button>
              <button className="px-2.5 py-1.5 text-[10px] font-medium hover:bg-blue-700 rounded-r flex items-center gap-1"><Calendar className="w-3 h-3" /> Upcoming</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content + Action Panel ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-50">
          {headerTab === 'home' && subTab === 'facesheet' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 auto-rows-min">

              {/* Medications */}
              <Card title="Medications" count={medications.length} onViewAll={() => setViewAll('medications')} onAdd={() => {}}
                headerExtra={<button className="text-[11px] bg-teal-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium hover:bg-teal-700"><Edit3 className="w-2.5 h-2.5" /> e-Prescribe</button>}>
                <div className="divide-y divide-gray-50">
                  {medications.map((m) => (
                    <div key={m.id} className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                      <div className="min-w-0"><span className="text-[11px] font-semibold text-gray-900">{m.name}</span> <span className="text-[11px] text-gray-500">{m.strength}</span><p className="text-[11px] text-gray-400 truncate">{m.directions}</p></div>
                      <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">{m.date}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Problem List */}
              <Card title="Problem List" count={problems.length} onViewAll={() => setViewAll('problems')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {problems.map((p) => (
                    <div key={p.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-[11px] font-medium text-gray-900">{p.description} <span className="text-gray-400 font-mono text-[11px]">{p.icdCode}</span></p>
                        <span className="text-[11px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0">Active</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5"><Calendar className="w-2.5 h-2.5 inline" /> {p.onset}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Encounter Details */}
              <Card title="Encounter Details" onViewAll={() => setViewAll('encounters')}>
                <div className="divide-y divide-gray-50">
                  {encounterDetails.map((e) => (
                    <div key={e.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center justify-between"><p className="text-[11px] font-medium text-gray-900">{e.title}</p><span className="text-[11px] text-gray-400">{e.date.split(' at')[0]}</span></div>
                      <p className="text-[11px] text-gray-400">{e.codes}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Care Gaps */}
              <Card title="Care Gaps" count={careGaps.length} className="border-amber-200">
                <div className="divide-y divide-gray-50">
                  {careGaps.map((g) => (
                    <div key={g.id} className="px-3 py-2 hover:bg-amber-50/50 cursor-pointer">
                      <div className="flex items-center gap-1.5"><AlertCircle className={cn('w-3 h-3', g.priority === 'high' ? 'text-red-500' : 'text-amber-500')} /><p className="text-[11px] font-medium text-gray-900">{g.measure}</p></div>
                      <p className="text-[11px] text-gray-500 mt-0.5 ml-[18px]">{g.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Allergies */}
              <Card title="Allergies" count={patient.allergies.length} onViewAll={() => setViewAll('allergies')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {patient.allergies.map((a) => (
                    <div key={a.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center justify-between"><p className="text-[11px] font-medium text-gray-900">{a.substance}</p>
                        <span className={cn('text-[11px] px-1.5 py-0.5 rounded font-medium', a.severity === 'severe' ? 'bg-rose-50 text-rose-600' : a.severity === 'moderate' ? 'bg-amber-50/80 text-amber-600' : 'bg-slate-100 text-slate-600')}>{a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{a.reaction}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Family History */}
              <Card title="Family History" onViewAll={() => setViewAll('family')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {familyHistory.map((f, i) => (
                    <div key={i} className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer"><p className="text-[11px] font-medium text-gray-900">{f.condition}</p><p className="text-[11px] text-gray-400">{f.relation} · {f.age}</p></div>
                  ))}
                </div>
              </Card>

              {/* Previous Visits */}
              <Card title="Previous Visits" onViewAll={() => setViewAll('visits')}>
                <div className="divide-y divide-gray-50">
                  {previousVisits.map((v, i) => (
                    <div key={i} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center justify-between"><p className="text-[11px] font-medium text-gray-900">{v.date} · {v.title}</p>
                        <span className={cn('text-[11px] px-1.5 py-0.5 rounded font-medium', v.status === 'Completed' ? 'bg-emerald-50/80 text-emerald-600' : v.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-600')}>{v.status}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{v.details}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Invoices */}
              <Card title="Invoices Overdue" onViewAll={() => setViewAll('invoices')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center justify-between"><span className="text-[10px] text-blue-600 font-medium font-mono">{inv.id}</span><span className="text-[11px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{inv.type}</span></div>
                      <div className="flex items-center gap-3 mt-1 text-[11px]"><span className="text-gray-500">Total: <strong>${inv.total}</strong></span><span className="text-red-600 font-medium">Due: ${inv.due}</span><span className="text-gray-400 ml-auto">{inv.date}</span></div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Past Medical History */}
              <Card title="Past Medical History" onViewAll={() => setViewAll('pmh')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {pastMedical.map((h, i) => (
                    <div key={i} className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                      <div><p className="text-[11px] font-medium text-gray-900">{h.condition}</p><p className="text-[11px] text-gray-400">Onset: {h.onset}</p></div>
                      <span className={cn('text-[11px] px-1.5 py-0.5 rounded font-medium', h.status === 'Active' ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500')}>{h.status}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Past Surgical History */}
              <Card title="Past Surgical History" onViewAll={() => setViewAll('psh')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {pastSurgical.map((s, i) => (
                    <div key={i} className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer"><p className="text-[11px] font-medium text-gray-900">{s.procedure}</p><p className="text-[11px] text-gray-400">{s.date} · {s.notes}</p></div>
                  ))}
                </div>
              </Card>

              {/* Health Measurements */}
              <Card title="Health Measurements" onViewAll={() => setViewAll('vitals')} onAdd={() => {}}>
                <div className="px-3 py-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { l: 'Weight', v: '198 lbs', t: 'down', c: 'text-emerald-600' },
                      { l: 'Height', v: "5'5\"", t: null, c: 'text-gray-900' },
                      { l: 'BP', v: '142/88', t: 'up', c: 'text-red-600' },
                      { l: 'HR', v: '78 bpm', t: null, c: 'text-gray-900' },
                      { l: 'Temp', v: '98.6°F', t: null, c: 'text-gray-900' },
                      { l: 'O2', v: '97%', t: null, c: 'text-gray-900' },
                      { l: 'BMI', v: '32.9', t: 'down', c: 'text-amber-600' },
                      { l: 'Pain', v: '2/10', t: null, c: 'text-gray-900' },
                      { l: 'RR', v: '16', t: null, c: 'text-gray-900' },
                    ].map((v) => (
                      <div key={v.l} className="text-center py-0.5">
                        <p className="text-[10px] text-gray-400 uppercase">{v.l}</p>
                        <p className={cn('text-[11px] font-bold font-mono', v.c)}>
                          {v.v}{v.t === 'up' && <TrendingUp className="w-2.5 h-2.5 inline ml-0.5 text-red-500" />}{v.t === 'down' && <TrendingDown className="w-2.5 h-2.5 inline ml-0.5 text-emerald-500" />}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-1 border-t border-slate-100 pt-1">Mar 19, 2026 · Sarah Thompson, RN</p>
                </div>
              </Card>

              {/* Immunizations */}
              <Card title="Immunizations" onViewAll={() => setViewAll('immunizations')} onAdd={() => {}}>
                <div className="divide-y divide-gray-50">
                  {[
                    { n: 'Influenza (2025-2026)', d: 'Jan 20, 2026' },
                    { n: 'COVID-19 Updated 2025', d: 'Oct 15, 2025' },
                    { n: 'Shingrix (Dose 2/2)', d: 'Jun 22, 2024' },
                    { n: 'Tdap', d: 'Jun 10, 2023' },
                    { n: 'PCV15', d: 'Mar 12, 2024' },
                  ].map((im, i) => (
                    <div key={i} className="px-3 py-1.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between"><p className="text-[11px] text-gray-900">{im.n}</p><span className="text-[11px] text-gray-400">{im.d}</span></div>
                  ))}
                </div>
              </Card>

            </div>
          )}

          {/* ── Notes Tab ── */}
          {headerTab === 'notes' && (() => {
            const notesMock = [
              { id: 'N001', date: 'Mar 19, 2026', time: '2:30 PM', type: 'H&P', provider: 'Dr. Emily Chen', chief: 'Annual wellness visit — diabetes & hypertension management', icd: ['E11.9', 'I10'], status: 'Signed', preview: 'HPI: Patient presents for follow-up of Type 2 DM and HTN. Reports improved glucose readings. No chest pain, shortness of breath, or palpitations. Adherent to medications. A/P: Continue current regimen, recheck HbA1c in 3 months.' },
              { id: 'N002', date: 'Feb 15, 2026', time: '10:00 AM', type: 'SOAP', provider: 'Dr. Emily Chen', chief: 'Follow-up diabetes and hypertension', icd: ['E11.9', 'I10'], status: 'Signed', preview: 'S: Patient reports fatigue and occasional dizziness when standing. O: BP 148/92. A: Hypertension suboptimally controlled. P: Increase Lisinopril to 20mg, follow up in 4 weeks.' },
              { id: 'N003', date: 'Jan 10, 2026', time: '9:30 AM', type: 'Progress', provider: 'Dr. Emily Chen', chief: 'Hypertension check', icd: ['I10'], status: 'Signed', preview: 'Patient doing well on Lisinopril 10mg. BP today 138/86. Continue current management. Labs ordered for BMP.' },
              { id: 'N004', date: 'Dec 01, 2025', time: '2:00 PM', type: 'Follow-Up', provider: 'Dr. Emily Chen', chief: 'Diabetes follow-up, HbA1c review', icd: ['E11.9'], status: 'Signed', preview: 'HbA1c 7.8% — above target of 7.0%. Adding Jardiance 10mg. Dietitian referral placed. Recheck labs in 3 months.' },
              { id: 'N005', date: 'Oct 20, 2025', time: '11:00 AM', type: 'SOAP', provider: 'Dr. Emily Chen', chief: 'Upper respiratory infection', icd: ['J06.9'], status: 'Signed', preview: 'Patient presents with sore throat, nasal congestion x 5 days. No fever. Viral URI — supportive care, rest, fluids. Return if no improvement in 7 days.' },
              { id: 'N006', date: 'Sep 05, 2025', time: '3:00 PM', type: 'Progress', provider: 'Dr. Emily Chen', chief: 'Routine check — medication refills', icd: ['E11.9', 'E78.5'], status: 'Draft', preview: 'Patient requests refills for Metformin and Atorvastatin. Lipids last checked Mar 2025 — LDL 112. Continue Atorvastatin 40mg.' },
            ];
            const noteFilters = ['All', 'SOAP', 'H&P', 'Progress', 'Follow-Up'];
            const filteredNotes = activeNoteFilter === 'All' ? notesMock : notesMock.filter((n) => n.type === activeNoteFilter);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {noteFilters.map((f) => (
                      <button key={f} onClick={() => setActiveNoteFilter(f)} className={cn('px-2.5 py-1 text-[11px] font-medium rounded transition-colors', activeNoteFilter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-slate-200 hover:bg-slate-50')}>{f}</button>
                    ))}
                  </div>
                  <button className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-medium rounded hover:bg-blue-700"><Plus className="w-3 h-3" /> New Note</button>
                </div>
                <div className="space-y-1.5">
                  {filteredNotes.map((n) => (
                    <div key={n.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                      <div className="flex items-start justify-between px-3 py-2.5 cursor-pointer hover:bg-slate-50" onClick={() => setExpandedNote(expandedNote === n.id ? null : n.id)}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">{n.type}</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-900 truncate">{n.chief}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{n.date} at {n.time} · {n.provider}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          <div className="flex gap-1">
                            {n.icd.map((code) => <span key={code} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded">{code}</span>)}
                          </div>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', n.status === 'Signed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>{n.status}</span>
                          <ChevronRight className={cn('w-3.5 h-3.5 text-gray-400 transition-transform', expandedNote === n.id && 'rotate-90')} />
                        </div>
                      </div>
                      {expandedNote === n.id && (
                        <div className="px-3 pb-3 border-t border-slate-100 bg-slate-50/50">
                          <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">{n.preview}</p>
                          <div className="flex gap-2 mt-2">
                            <button className="text-[10px] text-blue-600 font-medium hover:underline">View Full Note</button>
                            <button className="text-[10px] text-gray-500 font-medium hover:underline flex items-center gap-0.5"><Printer className="w-3 h-3" /> Print</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Medication Tab ── */}
          {headerTab === 'medication' && (() => {
            const activeMeds = [
              { id: 'm1', name: 'Metformin', strength: '1000mg', directions: 'Take 1 tab PO BID with meals', prescriber: 'Dr. Emily Chen', startDate: '01/05/2026', refills: 3, pharmacy: 'CVS Pharmacy #4821', interaction: false },
              { id: 'm2', name: 'Lisinopril', strength: '20mg', directions: 'Take 1 tab PO daily', prescriber: 'Dr. Emily Chen', startDate: '02/15/2026', refills: 5, pharmacy: 'CVS Pharmacy #4821', interaction: false },
              { id: 'm3', name: 'Atorvastatin', strength: '40mg', directions: 'Take 1 tab PO at bedtime', prescriber: 'Dr. Emily Chen', startDate: '11/20/2025', refills: 2, pharmacy: 'Walgreens #3345', interaction: false },
              { id: 'm4', name: 'Metoprolol Succinate', strength: '50mg', directions: 'Take 1 tab PO daily', prescriber: 'Dr. Emily Chen', startDate: '09/15/2025', refills: 4, pharmacy: 'CVS Pharmacy #4821', interaction: false },
              { id: 'm5', name: 'Aspirin', strength: '81mg', directions: 'Take 1 tab PO daily', prescriber: 'Dr. Emily Chen', startDate: '09/15/2025', refills: 11, pharmacy: 'CVS Pharmacy #4821', interaction: false },
              { id: 'm6', name: 'Jardiance', strength: '25mg', directions: 'Take 1 tab PO daily AM', prescriber: 'Dr. Emily Chen', startDate: '01/10/2026', refills: 2, pharmacy: 'Walgreens #3345', interaction: true },
              { id: 'm7', name: 'Ozempic', strength: '1mg/dose', directions: 'Inject 1mg SQ weekly', prescriber: 'Dr. Emily Chen', startDate: '12/01/2025', refills: 1, pharmacy: 'CVS Specialty', interaction: true },
              { id: 'm8', name: 'Vitamin D3', strength: '2000 IU', directions: 'Take 1 cap PO daily', prescriber: 'Dr. Emily Chen', startDate: '10/05/2025', refills: 6, pharmacy: 'CVS Pharmacy #4821', interaction: false },
            ];
            const discMeds = [
              { id: 'dm1', name: 'Glipizide', strength: '5mg', directions: 'Take 1 tab PO daily', prescriber: 'Dr. Emily Chen', endDate: '01/05/2026', reason: 'Switched to Jardiance' },
              { id: 'dm2', name: 'Amlodipine', strength: '5mg', directions: 'Take 1 tab PO daily', prescriber: 'Dr. Emily Chen', endDate: '11/20/2025', reason: 'Replaced with Metoprolol' },
            ];
            const hasInteraction = activeMeds.some((m) => m.interaction);
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-700">Active Medications</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">{activeMeds.length}</span>
                    {hasInteraction && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"><AlertTriangle className="w-3 h-3" /> Drug Interaction Warning</span>
                    )}
                  </div>
                  <button className="flex items-center gap-1 px-2.5 py-1 bg-teal-600 text-white text-[11px] font-medium rounded hover:bg-teal-700"><Edit3 className="w-3 h-3" /> e-Prescribe</button>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Drug / Strength', 'Directions', 'Prescriber', 'Start Date', 'Refills', 'Pharmacy', ''].map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeMeds.map((m) => (
                        <tr key={m.id} className={cn('hover:bg-slate-50', m.interaction && 'bg-amber-50/30')}>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              {m.interaction && <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                              <span className="text-[11px] font-semibold text-gray-900">{m.name}</span>
                              <span className="text-[11px] text-gray-500">{m.strength}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-[11px] text-gray-600 max-w-[180px]">{m.directions}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-600">{m.prescriber}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-500">{m.startDate}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-700 font-medium">{m.refills}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-500">{m.pharmacy}</td>
                          <td className="px-3 py-2">
                            <button className="text-[10px] text-blue-600 font-medium hover:text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded hover:bg-blue-50">Refill</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 text-left" onClick={() => setShowDiscMeds(!showDiscMeds)}>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Discontinued Medications</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">{discMeds.length}</span>
                    </div>
                    <ChevronRight className={cn('w-3.5 h-3.5 text-gray-400 transition-transform', showDiscMeds && 'rotate-90')} />
                  </button>
                  {showDiscMeds && (
                    <table className="w-full border-t border-slate-100">
                      <tbody className="divide-y divide-slate-100">
                        {discMeds.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="px-3 py-2"><span className="text-[11px] font-medium text-gray-500 line-through">{m.name}</span> <span className="text-[11px] text-gray-400">{m.strength}</span></td>
                            <td className="px-3 py-2 text-[11px] text-gray-400">{m.directions}</td>
                            <td className="px-3 py-2 text-[11px] text-gray-400">Ended {m.endDate}</td>
                            <td className="px-3 py-2 text-[11px] text-gray-400 italic">{m.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Orders Tab ── */}
          {headerTab === 'orders' && (() => {
            const activeOrders = [
              { id: 'ORD-001', type: 'Lab', description: 'HbA1c, Comprehensive Metabolic Panel', orderedBy: 'Dr. Emily Chen', date: '03/19/2026', priority: 'Routine', status: 'Pending' },
              { id: 'ORD-002', type: 'Lab', description: 'Lipid Panel, Urine Microalbumin', orderedBy: 'Dr. Emily Chen', date: '03/19/2026', priority: 'Routine', status: 'Pending' },
              { id: 'ORD-003', type: 'Imaging', description: 'Chest X-Ray — PA and Lateral', orderedBy: 'Dr. Emily Chen', date: '03/15/2026', priority: 'Routine', status: 'Scheduled' },
              { id: 'ORD-004', type: 'Referral', description: 'Endocrinology — T2DM management', orderedBy: 'Dr. Emily Chen', date: '03/12/2026', priority: 'Urgent', status: 'Sent' },
            ];
            const completedOrders = [
              { id: 'ORD-010', type: 'Lab', description: 'CBC with Differential', orderedBy: 'Dr. Emily Chen', date: '02/15/2026', priority: 'Routine', status: 'Completed' },
              { id: 'ORD-011', type: 'Lab', description: 'TSH, Free T4', orderedBy: 'Dr. Emily Chen', date: '02/15/2026', priority: 'Routine', status: 'Completed' },
              { id: 'ORD-012', type: 'Imaging', description: 'Abdominal Ultrasound — RUQ', orderedBy: 'Dr. Emily Chen', date: '01/10/2026', priority: 'Routine', status: 'Completed' },
              { id: 'ORD-013', type: 'Referral', description: 'Ophthalmology — Diabetic eye exam', orderedBy: 'Dr. Emily Chen', date: '12/01/2025', priority: 'Routine', status: 'Completed' },
            ];
            const typeColor: Record<string, string> = { Lab: 'bg-blue-50 text-blue-600', Imaging: 'bg-purple-50 text-purple-600', Referral: 'bg-teal-50 text-teal-600' };
            const ordStatusColor: Record<string, string> = { Pending: 'bg-amber-50 text-amber-600', Scheduled: 'bg-blue-50 text-blue-700', Sent: 'bg-indigo-50 text-indigo-600', Completed: 'bg-emerald-50 text-emerald-600' };
            const renderOrdersTable = (orders: typeof activeOrders) => (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Order ID', 'Type', 'Description', 'Ordered By', 'Date', 'Priority', 'Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50 cursor-pointer">
                        <td className="px-3 py-2 text-[10px] font-mono text-gray-500">{o.id}</td>
                        <td className="px-3 py-2"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', typeColor[o.type])}>{o.type}</span></td>
                        <td className="px-3 py-2 text-[11px] text-gray-900 font-medium">{o.description}</td>
                        <td className="px-3 py-2 text-[11px] text-gray-500">{o.orderedBy}</td>
                        <td className="px-3 py-2 text-[11px] text-gray-500">{o.date}</td>
                        <td className="px-3 py-2"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', o.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600')}>{o.priority}</span></td>
                        <td className="px-3 py-2"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', ordStatusColor[o.status])}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-700">Active / Pending Orders <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">{activeOrders.length}</span></span>
                  <button className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-medium rounded hover:bg-blue-700"><Plus className="w-3 h-3" /> New Order</button>
                </div>
                {renderOrdersTable(activeOrders)}
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Completed Orders <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">{completedOrders.length}</span></p>
                {renderOrdersTable(completedOrders)}
              </div>
            );
          })()}

          {/* ── Referrals Tab ── */}
          {headerTab === 'referrals' && (() => {
            const activeReferrals = [
              { id: 'REF-001', specialty: 'Endocrinology', referredTo: 'Dr. Michael Torres, MD', reason: 'Complex T2DM — suboptimal glycemic control on oral agents + GLP-1', urgency: 'Urgent', date: '03/12/2026', status: 'Sent' },
              { id: 'REF-002', specialty: 'Cardiology', referredTo: 'Dr. Patricia Walsh, MD', reason: 'Hypertension — medication-resistant, r/o secondary causes', urgency: 'Routine', date: '03/05/2026', status: 'Scheduled' },
              { id: 'REF-003', specialty: 'Ophthalmology', referredTo: 'Vision Care Associates', reason: 'Annual diabetic retinal exam — due per HEDIS measure', urgency: 'Routine', date: '12/01/2025', status: 'Sent' },
            ];
            const completedReferrals = [
              { id: 'REF-010', specialty: 'Nutrition', referredTo: 'Healthways Dietitian Group', reason: 'Medical nutrition therapy — weight management & T2DM', urgency: 'Routine', date: '09/15/2025', status: 'Completed' },
              { id: 'REF-011', specialty: 'Dermatology', referredTo: 'Dr. Sandra Lee, MD', reason: 'Acanthosis nigricans — evaluation', urgency: 'Routine', date: '08/10/2025', status: 'Completed' },
            ];
            const refUrgencyColor: Record<string, string> = { Urgent: 'bg-rose-50 text-rose-600', Routine: 'bg-slate-100 text-slate-600' };
            const refStatusColor: Record<string, string> = { Draft: 'bg-gray-100 text-gray-600', Sent: 'bg-indigo-50 text-indigo-600', Scheduled: 'bg-blue-50 text-blue-700', Completed: 'bg-emerald-50 text-emerald-600' };
            const renderReferralsTable = (refs: typeof activeReferrals) => (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {['Specialty', 'Referred To', 'Reason', 'Urgency', 'Date', 'Status'].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {refs.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 cursor-pointer">
                        <td className="px-3 py-2 text-[11px] font-semibold text-gray-900">{r.specialty}</td>
                        <td className="px-3 py-2 text-[11px] text-gray-600">{r.referredTo}</td>
                        <td className="px-3 py-2 text-[11px] text-gray-600 max-w-[240px]">{r.reason}</td>
                        <td className="px-3 py-2"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', refUrgencyColor[r.urgency])}>{r.urgency}</span></td>
                        <td className="px-3 py-2 text-[11px] text-gray-500">{r.date}</td>
                        <td className="px-3 py-2"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', refStatusColor[r.status])}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-700">Active Referrals <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">{activeReferrals.length}</span></span>
                  <button className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-medium rounded hover:bg-blue-700"><Plus className="w-3 h-3" /> New Referral</button>
                </div>
                {renderReferralsTable(activeReferrals)}
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Completed Referrals <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">{completedReferrals.length}</span></p>
                {renderReferralsTable(completedReferrals)}
              </div>
            );
          })()}

          {/* ── Questionnaires Sub-Tab ── */}
          {headerTab === 'home' && subTab === 'questionnaires' && (() => {
            const questionnaires = [
              { id: 'Q001', name: 'PHQ-9 — Depression Screening', description: 'Patient Health Questionnaire — 9 item', lastCompleted: 'Mar 10, 2026', score: '8 / 27', interpretation: 'Mild depression', status: 'Completed' },
              { id: 'Q002', name: 'GAD-7 — Anxiety Screening', description: 'Generalized Anxiety Disorder — 7 item', lastCompleted: 'Mar 10, 2026', score: '5 / 21', interpretation: 'Mild anxiety', status: 'Completed' },
              { id: 'Q003', name: 'SDOH Screening — AHC', description: 'Social Determinants of Health — CMMI AHC', lastCompleted: 'Jan 20, 2026', score: null, interpretation: '2 unmet needs identified', status: 'Completed' },
              { id: 'Q004', name: 'AUDIT-C — Alcohol Use', description: 'Alcohol Use Disorders Identification Test', lastCompleted: null, score: null, interpretation: null, status: 'Pending' },
              { id: 'Q005', name: 'Fall Risk Assessment', description: 'Morse Fall Scale for community settings', lastCompleted: null, score: null, interpretation: null, status: 'Not Sent' },
              { id: 'Q006', name: 'CAGE Questionnaire', description: 'Substance use disorder screening', lastCompleted: null, score: null, interpretation: null, status: 'Not Sent' },
            ];
            const qStatusColor: Record<string, string> = { Completed: 'bg-emerald-50 text-emerald-600', Pending: 'bg-amber-50 text-amber-600', 'Not Sent': 'bg-slate-100 text-slate-500' };
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-700">Intake Questionnaires &amp; Screenings</span>
                  <button className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[11px] font-medium rounded hover:bg-blue-700"><Plus className="w-3 h-3" /> Send Questionnaire</button>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        {['Questionnaire', 'Description', 'Last Completed', 'Score', 'Interpretation', 'Status'].map((h) => (
                          <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {questionnaires.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50 cursor-pointer">
                          <td className="px-3 py-2 text-[11px] font-semibold text-gray-900">{q.name}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-500">{q.description}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-500">{q.lastCompleted ?? <span className="text-gray-300">—</span>}</td>
                          <td className="px-3 py-2 text-[11px] font-mono text-gray-700">{q.score ?? <span className="text-gray-300">—</span>}</td>
                          <td className="px-3 py-2 text-[11px] text-gray-600">{q.interpretation ?? <span className="text-gray-300">—</span>}</td>
                          <td className="px-3 py-2"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', qStatusColor[q.status])}>{q.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* ── Demographics Sub-Tab ── */}
          {headerTab === 'home' && subTab === 'demographics' && (
            <div className="space-y-2.5 max-w-4xl">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h3>
                  <button className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:underline"><Edit3 className="w-3 h-3" /> Edit</button>
                </div>
                <div className="px-3 py-3 grid grid-cols-3 gap-x-6 gap-y-3">
                  {[
                    { label: 'Address', value: '2847 Maple Ridge Dr, Columbus, OH 43215' },
                    { label: 'City / State / ZIP', value: 'Columbus, OH 43215' },
                    { label: 'County', value: 'Franklin County' },
                    { label: 'Home Phone', value: '(555) 234-5678' },
                    { label: 'Mobile Phone', value: '(555) 234-5678' },
                    { label: 'Email', value: 'sarah.johnson@email.com' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{f.label}</p>
                      <p className="text-[11px] text-gray-800 mt-0.5 font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">Emergency Contact</h3>
                  <button className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:underline"><Edit3 className="w-3 h-3" /> Edit</button>
                </div>
                <div className="px-3 py-3 grid grid-cols-4 gap-x-6 gap-y-3">
                  {[
                    { label: 'Name', value: 'Robert Johnson' },
                    { label: 'Relationship', value: 'Spouse' },
                    { label: 'Phone', value: '(555) 876-5432' },
                    { label: 'Email', value: 'robert.johnson@email.com' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{f.label}</p>
                      <p className="text-[11px] text-gray-800 mt-0.5 font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demographics */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">Demographics</h3>
                  <button className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:underline"><Edit3 className="w-3 h-3" /> Edit</button>
                </div>
                <div className="px-3 py-3 grid grid-cols-4 gap-x-6 gap-y-3">
                  {[
                    { label: 'Date of Birth', value: '05/15/1981' },
                    { label: 'Age', value: '44 years' },
                    { label: 'Sex', value: 'Female' },
                    { label: 'Gender Identity', value: 'Female (cisgender)' },
                    { label: 'Race', value: 'White / Caucasian' },
                    { label: 'Ethnicity', value: 'Not Hispanic or Latino' },
                    { label: 'Preferred Language', value: 'English' },
                    { label: 'Marital Status', value: 'Married' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{f.label}</p>
                      <p className="text-[11px] text-gray-800 mt-0.5 font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">Insurance</h3>
                  <button className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:underline"><Plus className="w-3 h-3" /> Add Insurance</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { order: 'Primary', payer: 'Blue Cross Blue Shield', plan: 'BlueCare PPO 2500', memberId: 'BCB-9283746', group: 'GRP-44812', copay: '$25 PCP / $50 Specialist', verified: true },
                    { order: 'Secondary', payer: 'Medicare Part B', plan: 'Traditional Medicare', memberId: '1EG4-TE5-MK72', group: '—', copay: '20% after deductible', verified: false },
                  ].map((ins) => (
                    <div key={ins.order} className="px-3 py-3 grid grid-cols-4 gap-x-6 gap-y-2">
                      <div className="col-span-4 flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{ins.order}</span>
                        {ins.verified && <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified</span>}
                      </div>
                      {[
                        { label: 'Payer', value: ins.payer },
                        { label: 'Plan', value: ins.plan },
                        { label: 'Member ID', value: ins.memberId },
                        { label: 'Group #', value: ins.group },
                        { label: 'Copay', value: ins.copay },
                      ].map((f) => (
                        <div key={f.label}>
                          <p className="text-[10px] text-gray-400 uppercase font-medium">{f.label}</p>
                          <p className="text-[11px] text-gray-800 mt-0.5 font-medium">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantor */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <h3 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wide">Guarantor</h3>
                  <button className="flex items-center gap-1 text-[10px] text-blue-600 font-medium hover:underline"><Edit3 className="w-3 h-3" /> Edit</button>
                </div>
                <div className="px-3 py-3 grid grid-cols-4 gap-x-6 gap-y-3">
                  {[
                    { label: 'Name', value: 'Sarah Johnson (Self)' },
                    { label: 'Relationship', value: 'Self' },
                    { label: 'Phone', value: '(555) 234-5678' },
                    { label: 'Address', value: '2847 Maple Ridge Dr, Columbus, OH 43215' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{f.label}</p>
                      <p className="text-[11px] text-gray-800 mt-0.5 font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Panel - hidden on mobile */}
        <div className="hidden lg:block">
          <ActionPanel collapsed={apCollapsed} toggle={() => setApCollapsed(!apCollapsed)} />
        </div>

        {/* Inline Detail Drawer — slides in over the content area, no modal overlay */}
        {viewAll === 'medications' && (
          <InlineDetailDrawer title="All Medications" onClose={() => setViewAll(null)}>
            <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Medication</th><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Strength</th><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Directions</th><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Date</th></tr></thead>
              <tbody className="divide-y">{medications.map((m) => (<tr key={m.id} className="hover:bg-slate-50"><td className="px-3 py-2 font-medium">{m.name}</td><td className="px-3 py-2 font-mono text-gray-600">{m.strength}</td><td className="px-3 py-2 text-gray-600">{m.directions}</td><td className="px-3 py-2 text-gray-400">{m.date}</td></tr>))}</tbody></table>
          </InlineDetailDrawer>
        )}
        {viewAll === 'problems' && (
          <InlineDetailDrawer title="Problem List" onClose={() => setViewAll(null)}>
            <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Problem</th><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">ICD-10</th><th className="text-left px-3 py-2 text-xs font-medium text-gray-500">Onset</th></tr></thead>
              <tbody className="divide-y">{problems.map((p) => (<tr key={p.id} className="hover:bg-slate-50"><td className="px-3 py-2 font-medium">{p.description}</td><td className="px-3 py-2 font-mono text-gray-600">{p.icdCode}</td><td className="px-3 py-2 text-gray-400">{p.onset}</td></tr>))}</tbody></table>
          </InlineDetailDrawer>
        )}
        {viewAll && !['medications', 'problems'].includes(viewAll) && (
          <InlineDetailDrawer title={viewAll.charAt(0).toUpperCase() + viewAll.slice(1)} onClose={() => setViewAll(null)}>
            <p className="text-sm text-gray-500 text-center py-8">Full detailed view for {viewAll}</p>
          </InlineDetailDrawer>
        )}
      </div>
    </div>
  );
};

export default PatientChartPage;
