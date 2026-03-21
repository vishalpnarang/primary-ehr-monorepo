import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  Plus,
  X,
  Save,
  FileSignature,
  Check,
  Clock,
  Download,
  AlertTriangle,
  Pill,
  FlaskConical,
  ArrowUpRight,
  CheckSquare,
  Square,
  Activity,
  ClipboardList,
  Heart,
  Users,
  Scissors,
  ShieldCheck,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Types ────────────────────────────────────────────────────────────────────

type NoteStatus = 'draft' | 'signed';
type SectionKey =
  | 'cc'
  | 'subjective'
  | 'allergies'
  | 'drug-intolerances'
  | 'medications'
  | 'pmh'
  | 'surgical'
  | 'family'
  | 'social'
  | 'screening'
  | 'assessment'
  | 'plan'
  | 'vitals'
  | 'ros'
  | 'orders'
  | 'careplan'
  | 'followup'
  | 'instructions';

interface Allergy {
  id: string;
  substance: string;
  reaction: string;
  severity: 'severe' | 'moderate' | 'mild';
}

interface Medication {
  id: string;
  name: string;
  strength: string;
  directions: string;
}

interface DrugIntolerance {
  id: string;
  substance: string;
  reaction: string;
}

interface ProblemEntry {
  id: string;
  description: string;
  icdCode: string;
  onset: string;
}

interface PmhEntry {
  id: string;
  condition: string;
  onset: string;
  status: string;
}

interface SurgicalEntry {
  id: string;
  procedure: string;
  date: string;
  notes: string;
}

interface FamilyEntry {
  id: string;
  relation: string;
  condition: string;
}

interface RosSystemState {
  reviewed: boolean;
  positives: string[];
}

interface VitalsState {
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  spo2: string;
  weight: string;
  height: string;
  bmi: string;
}

interface DiagnosisEntry {
  id: string;
  icdCode: string;
  diagnosis: string;
  plan: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_NAV: { key: SectionKey; label: string }[] = [
  { key: 'cc', label: 'Chief Complaint' },
  { key: 'subjective', label: 'Subjective' },
  { key: 'allergies', label: 'Allergies' },
  { key: 'drug-intolerances', label: 'Drug Intolerances' },
  { key: 'medications', label: 'Medications' },
  { key: 'pmh', label: 'Past Medical Hx' },
  { key: 'surgical', label: 'Surgical History' },
  { key: 'family', label: 'Family History' },
  { key: 'social', label: 'Social History' },
  { key: 'screening', label: 'Screening' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'plan', label: 'Plan' },
  { key: 'vitals', label: 'Vitals' },
  { key: 'ros', label: 'ROS' },
  { key: 'orders', label: 'Orders' },
  { key: 'careplan', label: 'Care Plan' },
  { key: 'followup', label: 'Follow Up' },
  { key: 'instructions', label: 'Instructions' },
];

const ROS_SYSTEMS: { label: string; key: string; positives: string[] }[] = [
  { label: 'Constitutional', key: 'constitutional', positives: ['fatigue', 'fever', 'chills', 'weight loss', 'night sweats', 'increased thirst'] },
  { label: 'HEENT', key: 'heent', positives: ['headache', 'blurred vision', 'ear pain', 'sore throat', 'nasal congestion'] },
  { label: 'Cardiovascular', key: 'cardiovascular', positives: ['chest pain', 'palpitations', 'edema', 'dyspnea on exertion'] },
  { label: 'Respiratory', key: 'respiratory', positives: ['cough', 'dyspnea', 'wheezing', 'hemoptysis'] },
  { label: 'Gastrointestinal', key: 'gastrointestinal', positives: ['nausea', 'vomiting', 'abdominal pain', 'diarrhea', 'constipation'] },
  { label: 'Genitourinary', key: 'genitourinary', positives: ['polyuria', 'dysuria', 'frequency', 'urgency', 'hematuria'] },
  { label: 'Musculoskeletal', key: 'musculoskeletal', positives: ['joint pain', 'back pain', 'muscle weakness', 'swelling'] },
  { label: 'Neurological', key: 'neurological', positives: ['headache', 'dizziness', 'numbness', 'tingling', 'weakness'] },
  { label: 'Psychiatric', key: 'psychiatric', positives: ['anxiety', 'depression', 'insomnia', 'mood changes'] },
  { label: 'Endocrine', key: 'endocrine', positives: ['polyuria', 'polydipsia', 'heat intolerance', 'excessive sweating'] },
];

const SMART_PHRASES: Record<string, string> = {
  '.hpidb': 'Patient presents with [duration]-day history of [symptom]. Onset was [onset]. Quality: [quality]. Associated with [associated symptoms]. Severity [1-10]/10.',
  '.hpihtn': 'Patient presents for hypertension follow-up. Home BP readings averaging [BP]. Currently on [medications]. Adherent to [diet/exercise]. Denies headache, visual changes, chest pain.',
  '.rosall': 'Constitutional: No fever, chills, or weight loss. HEENT: No headache or visual changes. CV: No chest pain or palpitations. Resp: No cough or dyspnea. GI: No nausea or abdominal pain.',
};

// ─── Inline Mock Data ─────────────────────────────────────────────────────────

const MOCK_PATIENT = {
  id: 'PAT-10001',
  firstName: 'Sarah',
  lastName: 'Johnson',
  sex: 'Female',
  dob: '1981-05-15',
  age: 44,
  mrn: 'PAT-10001',
  provider: 'Dr. Emily Chen, MD',
};

const MOCK_ALLERGIES: Allergy[] = [
  { id: 'a1', substance: 'Penicillin', reaction: 'Anaphylaxis', severity: 'severe' },
  { id: 'a2', substance: 'Sulfa Drugs', reaction: 'Rash, Hives', severity: 'moderate' },
  { id: 'a3', substance: 'Latex', reaction: 'Contact dermatitis', severity: 'mild' },
];

const MOCK_MEDICATIONS: Medication[] = [
  { id: 'm1', name: 'Lisinopril', strength: '20mg', directions: 'Take 1 tab PO daily' },
  { id: 'm2', name: 'Metformin', strength: '1000mg', directions: 'Take 1 tab PO BID with meals' },
  { id: 'm3', name: 'Atorvastatin', strength: '40mg', directions: 'Take 1 tab PO at bedtime' },
  { id: 'm4', name: 'Omeprazole', strength: '20mg', directions: 'Take 1 cap PO daily before breakfast' },
];

const MOCK_DRUG_INTOLERANCES: DrugIntolerance[] = [];

const MOCK_PROBLEMS: ProblemEntry[] = [
  { id: 'p1', description: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', onset: '2020' },
  { id: 'p2', description: 'Essential Hypertension', icdCode: 'I10', onset: '2019' },
  { id: 'p3', description: 'Hyperlipidemia', icdCode: 'E78.5', onset: '2021' },
  { id: 'p4', description: 'GERD', icdCode: 'K21.9', onset: '2022' },
];

const MOCK_PMH: PmhEntry[] = [
  { id: 'pmh1', condition: 'Type 2 Diabetes', onset: '2020', status: 'Active' },
  { id: 'pmh2', condition: 'Essential Hypertension', onset: '2019', status: 'Active' },
];

const MOCK_SURGICAL: SurgicalEntry[] = [
  { id: 's1', procedure: 'Cesarean Section', date: '06/2015', notes: 'Uncomplicated' },
  { id: 's2', procedure: 'Appendectomy', date: '03/2008', notes: 'Laparoscopic, no complications' },
];

const MOCK_FAMILY: FamilyEntry[] = [
  { id: 'f1', relation: 'Father', condition: 'Hypertension' },
  { id: 'f2', relation: 'Mother', condition: 'Type 2 Diabetes' },
];

const INITIAL_DIAGNOSES: DiagnosisEntry[] = [
  { id: 'dx-001', icdCode: 'E11.9', diagnosis: 'Type 2 Diabetes Mellitus', plan: 'Continue metformin 1000mg BID. Order HbA1c. Discussed diet and exercise.' },
  { id: 'dx-002', icdCode: 'I10', diagnosis: 'Essential Hypertension', plan: 'BP 142/88 today, above target. Increase lisinopril to 20mg daily. Recheck in 4 weeks.' },
];

const INITIAL_ROS: Record<string, RosSystemState> = {
  constitutional: { reviewed: true, positives: ['fatigue', 'increased thirst'] },
  heent: { reviewed: false, positives: [] },
  cardiovascular: { reviewed: true, positives: [] },
  respiratory: { reviewed: true, positives: [] },
  gastrointestinal: { reviewed: false, positives: [] },
  genitourinary: { reviewed: true, positives: ['polyuria'] },
  musculoskeletal: { reviewed: false, positives: [] },
  neurological: { reviewed: true, positives: [] },
  psychiatric: { reviewed: false, positives: [] },
  endocrine: { reviewed: true, positives: ['polyuria', 'polydipsia'] },
};

const INITIAL_VITALS: VitalsState = {
  bp: '142/88',
  hr: '78',
  rr: '16',
  temp: '98.6',
  spo2: '98',
  weight: '187',
  height: '65',
  bmi: '31.1',
};

const SEVERITY_STYLES: Record<string, string> = {
  severe: 'bg-rose-50 text-rose-600 border-critical-100',
  moderate: 'bg-warning-50 text-warning-700 border-warning-100',
  mild: 'bg-slate-100 text-slate-500 border-slate-200',
};

// ─── Left Sidebar: Clinical Data ──────────────────────────────────────────────

interface ClinicalSidebarProps {
  allergies: Allergy[];
  medications: Medication[];
  drugIntolerances: DrugIntolerance[];
  problems: ProblemEntry[];
}

const ClinicalSidebar: React.FC<ClinicalSidebarProps> = ({
  allergies,
  medications,
  drugIntolerances,
  problems,
}) => (
  <aside className="w-[240px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-y-auto scrollbar-thin">
    {/* Allergies */}
    <div className="border-b border-slate-100">
      <div className="flex items-center justify-between px-3 py-2 bg-critical-50/60">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-critical-600" />
          <span className="text-[10px] font-semibold text-critical-700 uppercase tracking-wide">Allergies</span>
        </div>
        <span className="text-[11px] bg-critical-100 text-critical-700 px-1.5 py-0.5 rounded-full font-semibold">{allergies.length}</span>
      </div>
      <ul className="px-3 py-2 space-y-1.5">
        {allergies.map((a) => (
          <li key={a.id} className="flex items-start gap-1.5">
            <span className={cn('mt-0.5 inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', a.severity === 'severe' ? 'bg-rose-500' : a.severity === 'moderate' ? 'bg-warning-500' : 'bg-gray-400')} />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-900 leading-tight">{a.substance}</p>
              <p className={cn('text-[11px] font-medium capitalize', a.severity === 'severe' ? 'text-critical-600' : a.severity === 'moderate' ? 'text-warning-600' : 'text-gray-400')}>{a.severity}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* Medications */}
    <div className="border-b border-slate-100">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <Pill className="w-3 h-3 text-blue-600" />
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Medications</span>
        </div>
        <span className="text-[11px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">{medications.length}</span>
      </div>
      <ul className="px-3 py-2 space-y-1.5">
        {medications.map((m) => (
          <li key={m.id} className="min-w-0">
            <p className="text-[11px] font-medium text-gray-900 leading-tight truncate">{m.name}</p>
            <p className="text-[11px] text-gray-400">{m.strength}</p>
          </li>
        ))}
      </ul>
    </div>

    {/* Drug Intolerances */}
    <div className="border-b border-slate-100">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-warning-600" />
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Drug Intol.</span>
        </div>
      </div>
      {drugIntolerances.length === 0 ? (
        <p className="px-3 py-2 text-[10px] text-gray-400 italic">No records</p>
      ) : (
        <ul className="px-3 py-2 space-y-1">
          {drugIntolerances.map((d) => (
            <li key={d.id} className="text-[11px] text-gray-700">{d.substance}</li>
          ))}
        </ul>
      )}
    </div>

    {/* Problem List */}
    <div className="border-b border-slate-100">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <ClipboardList className="w-3 h-3 text-blue-600" />
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Problem List</span>
        </div>
        <span className="text-[11px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-semibold">{problems.length}</span>
      </div>
      <ul className="px-3 py-2 space-y-1.5">
        {problems.map((p) => (
          <li key={p.id} className="min-w-0">
            <p className="text-[11px] font-medium text-gray-900 leading-tight">{p.description}</p>
            <p className="text-[11px] text-gray-400 font-mono">{p.onset} · {p.icdCode}</p>
          </li>
        ))}
      </ul>
    </div>

    {/* Family Hx */}
    <div className="border-b border-slate-100">
      <div className="px-3 py-2 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <Users className="w-3 h-3 text-gray-500" />
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Family Hx</span>
        </div>
      </div>
      <ul className="px-3 py-2 space-y-1">
        {MOCK_FAMILY.map((f) => (
          <li key={f.id} className="text-[11px] text-gray-700">
            <span className="text-gray-400">{f.relation}: </span>{f.condition}
          </li>
        ))}
      </ul>
    </div>

    {/* Surgical Hx */}
    <div>
      <div className="px-3 py-2 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <Scissors className="w-3 h-3 text-gray-500" />
          <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wide">Surgical Hx</span>
        </div>
      </div>
      <ul className="px-3 py-2 space-y-1.5">
        {MOCK_SURGICAL.map((s) => (
          <li key={s.id} className="min-w-0">
            <p className="text-[11px] font-medium text-gray-900 leading-tight">{s.procedure}</p>
            <p className="text-[11px] text-gray-400">{s.date}</p>
          </li>
        ))}
      </ul>
    </div>
  </aside>
);

// ─── Right Sidebar: Section Nav ───────────────────────────────────────────────

interface SectionNavProps {
  activeSection: SectionKey;
  onNavigate: (key: SectionKey) => void;
}

const SectionNav: React.FC<SectionNavProps> = ({ activeSection, onNavigate }) => (
  <aside className="w-[160px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col">
    <div className="px-3 py-2 border-b border-slate-100">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Sections</p>
    </div>
    <nav className="flex-1 overflow-y-auto scrollbar-thin py-1">
      {SECTION_NAV.map((s) => (
        <button
          key={s.key}
          onClick={() => onNavigate(s.key)}
          className={cn(
            'w-full text-left px-3 py-1.5 text-[11px] transition-colors leading-tight',
            activeSection === s.key
              ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-500'
              : 'text-gray-500 hover:bg-slate-50 hover:text-gray-800'
          )}
        >
          {s.label}
        </button>
      ))}
    </nav>
  </aside>
);

// ─── Chip Component ───────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  onRemove?: () => void;
  variant?: 'default' | 'critical' | 'warning';
}

const Chip: React.FC<ChipProps> = ({ label, onRemove, variant = 'default' }) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
    variant === 'critical' && 'bg-rose-50 text-rose-600 border-critical-100',
    variant === 'warning' && 'bg-warning-50 text-warning-700 border-warning-100',
    variant === 'default' && 'bg-gray-100 text-gray-700 border-slate-200',
  )}>
    {label}
    {onRemove !== undefined && (
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity" aria-label={`Remove ${label}`}>
        <X className="w-2.5 h-2.5" />
      </button>
    )}
  </span>
);

// ─── Section Header ───────────────────────────────────────────────────────────

interface NoteSection {
  id: SectionKey;
  label: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const NoteSectionBlock: React.FC<NoteSection> = ({ id, label, actions, children }) => (
  <div id={`section-${id}`} className="scroll-mt-2">
    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
      <h3 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">{label}</h3>
      {actions !== undefined && <div className="flex items-center gap-1">{actions}</div>}
    </div>
    {children}
  </div>
);

// ─── Import + Add Actions ─────────────────────────────────────────────────────

const ImportAddActions: React.FC<{ onImport?: () => void; onAdd?: () => void }> = ({ onImport, onAdd }) => (
  <div className="flex items-center gap-1">
    <button
      onClick={onImport}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
    >
      <Download className="w-2.5 h-2.5" />
      Import
    </button>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
    >
      <Plus className="w-2.5 h-2.5" />
      Add
    </button>
  </div>
);

// ─── ROS Section ──────────────────────────────────────────────────────────────

interface RosSectionProps {
  rosState: Record<string, RosSystemState>;
  onChange: (key: string, field: 'reviewed' | 'positives', value: boolean | string[]) => void;
  onMarkAllNegative: () => void;
}

const RosSection: React.FC<RosSectionProps> = ({ rosState, onChange, onMarkAllNegative }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <NoteSectionBlock
      id="ros"
      label="Review of Systems"
      actions={
        <button
          onClick={onMarkAllNegative}
          className="text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
        >
          All negative
        </button>
      }
    >
      <div className="space-y-0.5">
        {ROS_SYSTEMS.map((sys) => {
          const state = rosState[sys.key] ?? { reviewed: false, positives: [] };
          const isExpanded = expanded === sys.key;
          return (
            <div key={sys.key} className="border border-slate-100 rounded overflow-hidden">
              <div
                className={cn(
                  'flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors',
                  state.reviewed ? 'bg-success-50/40' : ''
                )}
                onClick={() => setExpanded(isExpanded ? null : sys.key)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onChange(sys.key, 'reviewed', !state.reviewed); }}
                  className="flex-shrink-0"
                  aria-label={`Mark ${sys.label} reviewed`}
                >
                  {state.reviewed
                    ? <CheckSquare className="w-3.5 h-3.5 text-success-600" />
                    : <Square className="w-3.5 h-3.5 text-gray-300" />}
                </button>
                <span className="text-[11px] font-medium text-gray-700 w-28 flex-shrink-0">{sys.label}</span>
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                  {state.reviewed && state.positives.length === 0 && (
                    <span className="text-[10px] text-gray-400 italic">All negative</span>
                  )}
                  {state.positives.map((p) => (
                    <span key={p} className="inline-flex items-center gap-0.5 px-1.5 py-0 bg-warning-100 text-warning-700 rounded-full text-[11px] font-medium border border-warning-200">
                      {p}
                      <button onClick={(e) => { e.stopPropagation(); onChange(sys.key, 'positives', state.positives.filter((x) => x !== p)); }}>
                        <X className="w-2 h-2" />
                      </button>
                    </span>
                  ))}
                </div>
                <ChevronDown className={cn('w-3 h-3 text-gray-300 flex-shrink-0 transition-transform', isExpanded && 'rotate-180')} />
              </div>
              {isExpanded && (
                <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap gap-1">
                    {sys.positives.map((finding) => {
                      const active = state.positives.includes(finding);
                      return (
                        <button
                          key={finding}
                          onClick={() => {
                            const next = active
                              ? state.positives.filter((x) => x !== finding)
                              : [...state.positives, finding];
                            onChange(sys.key, 'positives', next);
                            if (!state.reviewed) onChange(sys.key, 'reviewed', true);
                          }}
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors',
                            active
                              ? 'bg-warning-100 text-warning-700 border-warning-300'
                              : 'bg-white text-gray-500 border-slate-200 hover:border-blue-300 hover:text-blue-700'
                          )}
                        >
                          {finding}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </NoteSectionBlock>
  );
};

// ─── Vitals Grid ──────────────────────────────────────────────────────────────

interface VitalsGridProps {
  vitals: VitalsState;
  onChange: (field: keyof VitalsState, value: string) => void;
}

const VITALS_FIELDS: { key: keyof VitalsState; label: string; unit: string; placeholder: string }[] = [
  { key: 'bp', label: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80' },
  { key: 'hr', label: 'Heart Rate', unit: 'bpm', placeholder: '72' },
  { key: 'rr', label: 'Resp Rate', unit: '/min', placeholder: '16' },
  { key: 'temp', label: 'Temperature', unit: '°F', placeholder: '98.6' },
  { key: 'spo2', label: 'SpO2', unit: '%', placeholder: '99' },
  { key: 'weight', label: 'Weight', unit: 'lbs', placeholder: '160' },
  { key: 'height', label: 'Height', unit: 'in', placeholder: '66' },
  { key: 'bmi', label: 'BMI', unit: 'kg/m²', placeholder: '25.0' },
];

const VitalsGrid: React.FC<VitalsGridProps> = ({ vitals, onChange }) => (
  <div className="grid grid-cols-4 gap-2">
    {VITALS_FIELDS.map((f) => (
      <div key={f.key} className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{f.label}</label>
        <div className="flex items-baseline gap-1">
          <input
            type="text"
            value={vitals[f.key]}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full text-[13px] font-semibold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-300 focus:ring-0 p-0"
          />
          <span className="text-[11px] text-gray-400 flex-shrink-0">{f.unit}</span>
        </div>
      </div>
    ))}
  </div>
);

// ─── Assessment & Plan ────────────────────────────────────────────────────────

interface AssessmentPlanProps {
  diagnoses: DiagnosisEntry[];
  onDxChange: (id: string, field: keyof DiagnosisEntry, value: string) => void;
  onDxRemove: (id: string) => void;
  onDxAdd: () => void;
}

const AssessmentPlan: React.FC<AssessmentPlanProps> = ({ diagnoses, onDxChange, onDxRemove, onDxAdd }) => (
  <div className="space-y-2">
    {diagnoses.map((dx, i) => (
      <div key={dx.id} className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {i + 1}
          </span>
          <input
            value={dx.icdCode}
            onChange={(e) => onDxChange(dx.id, 'icdCode', e.target.value)}
            placeholder="ICD-10"
            className="w-20 text-[10px] font-mono border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          />
          <input
            value={dx.diagnosis}
            onChange={(e) => onDxChange(dx.id, 'diagnosis', e.target.value)}
            placeholder="Diagnosis..."
            className="flex-1 text-[11px] font-medium border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          />
          <button onClick={() => onDxRemove(dx.id)} className="text-gray-300 hover:text-critical-500 transition-colors" aria-label="Remove">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-3 py-2 space-y-2">
          <textarea
            value={dx.plan}
            onChange={(e) => onDxChange(dx.id, 'plan', e.target.value)}
            placeholder="Enter management plan..."
            rows={2}
            className="w-full text-[11px] border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none placeholder:text-gray-300"
          />
          <div className="flex items-center gap-1.5">
            <button className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors">
              <FlaskConical className="w-3 h-3" /> Order Lab
            </button>
            <button className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-success-600 bg-success-50 hover:bg-success-100 border border-success-100 rounded transition-colors">
              <Pill className="w-3 h-3" /> Prescribe
            </button>
            <button className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded transition-colors">
              <ArrowUpRight className="w-3 h-3" /> Refer
            </button>
          </div>
        </div>
      </div>
    ))}
    <button
      onClick={onDxAdd}
      className="flex items-center gap-1.5 w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-[11px] font-medium text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
    >
      <Plus className="w-3.5 h-3.5" /> Add Diagnosis
    </button>
  </div>
);

// ─── Top Note Toolbar ─────────────────────────────────────────────────────────

const NoteToolbar: React.FC = () => {
  const tabs = ['Notes', 'Rx', 'Orders', 'Meds Hx', 'Reports', 'Forms'];
  const [active, setActive] = useState('Notes');

  return (
    <div className="flex items-center gap-0 border-b border-slate-200 bg-white px-3">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActive(t)}
          className={cn(
            'px-3 py-2 text-[11px] font-medium border-b-2 transition-colors whitespace-nowrap',
            active === t
              ? 'border-blue-500 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

// ─── Template Selector Bar ────────────────────────────────────────────────────

const TemplateBar: React.FC = () => (
  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
    <DropdownButton label="SOAP Note" />
    <DropdownButton label="Shared Templates" />
    <DropdownButton label="Select Template" />
    <div className="flex-1" />
    <span className="text-[10px] text-gray-400">Mar 19, 2026 · Dr. Emily Chen, MD</span>
  </div>
);

const DropdownButton: React.FC<{ label: string }> = ({ label }) => (
  <button className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-gray-300 transition-colors">
    {label}
    <ChevronDown className="w-3 h-3 text-gray-400" />
  </button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const NewEncounterPage: React.FC = () => {
  const navigate = useNavigate();
  const { patientId } = useParams<{ patientId: string }>();

  // Note state
  const [status, setStatus] = useState<NoteStatus>('draft');
  const [chiefComplaint, setChiefComplaint] = useState('Fatigue and increased thirst — 3 week duration');
  const [subjective, setSubjective] = useState(
    'Ms. Johnson is a 44-year-old female with a history of Type 2 diabetes mellitus presenting for follow-up. She reports fatigue over the past 3 weeks along with increased thirst and urinary frequency. Home glucose readings averaging 150–170 mg/dL fasting. She has been adherent to metformin.'
  );
  const [assessment, setAssessment] = useState('Patient presents with suboptimally controlled T2DM and hypertension above target. BP 142/88 today despite current therapy.');
  const [plan, setPlan] = useState('');
  const [socialHistory, setSocialHistory] = useState('');
  const [carePlan, setCarePlan] = useState('');
  const [followUp, setFollowUp] = useState('Return to clinic in 4 weeks for BP recheck and medication titration.');
  const [instructions, setInstructions] = useState('');
  const [orders, setOrders] = useState('');

  // Chips state (mirrors left sidebar but editable in note)
  const [noteAllergies, setNoteAllergies] = useState<Allergy[]>(MOCK_ALLERGIES);
  const [noteMedications, setNoteMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [noteDrugIntolerances, setNoteDrugIntolerances] = useState<DrugIntolerance[]>(MOCK_DRUG_INTOLERANCES);

  // PMH / collapsible sections
  const [pmh, setPmh] = useState<PmhEntry[]>(MOCK_PMH);
  const [surgical, setSurgical] = useState<SurgicalEntry[]>(MOCK_SURGICAL);
  const [familyHx, setFamilyHx] = useState<FamilyEntry[]>(MOCK_FAMILY);
  const [screening, setScreening] = useState('Mammogram overdue (last 14 months ago). Diabetic eye exam referred, not completed.');

  // Diagnoses
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>(INITIAL_DIAGNOSES);

  // Vitals
  const [vitals, setVitals] = useState<VitalsState>(INITIAL_VITALS);

  // ROS
  const [rosState, setRosState] = useState<Record<string, RosSystemState>>(INITIAL_ROS);

  // Active section for right nav
  const [activeSection, setActiveSection] = useState<SectionKey>('cc');

  // Auto-save
  const [autoSaveLabel, setAutoSaveLabel] = useState('Auto-saved 2s ago');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smart phrases
  const [showSmartPhrase, setShowSmartPhrase] = useState(false);
  const [smartPhraseQuery, setSmartPhraseQuery] = useState('');

  const triggerAutoSave = useCallback(() => {
    setAutoSaveLabel('Saving...');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const now = new Date();
      setAutoSaveLabel(`Auto-saved ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 1200);
  }, []);

  useEffect(() => {
    triggerAutoSave();
  }, [chiefComplaint, subjective, assessment, plan, diagnoses, vitals, rosState, triggerAutoSave]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+Enter → sign
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSign();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Section scroll
  const handleNavClick = (key: SectionKey) => {
    setActiveSection(key);
    const el = document.getElementById(`section-${key}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Smart phrases in subjective
  const handleSubjectiveChange = (value: string) => {
    const dotMatch = value.match(/\.([\w]*)$/);
    if (dotMatch) {
      setSmartPhraseQuery(dotMatch[0]);
      setShowSmartPhrase(true);
    } else {
      setShowSmartPhrase(false);
      setSmartPhraseQuery('');
    }
    setSubjective(value);
  };

  const applySmartPhrase = (trigger: string) => {
    const expansion = SMART_PHRASES[trigger] ?? '';
    setSubjective((prev) => prev.replace(/\.\w*$/, expansion));
    setShowSmartPhrase(false);
    setSmartPhraseQuery('');
  };

  const matchingPhrases = Object.entries(SMART_PHRASES).filter(([key]) => key.startsWith(smartPhraseQuery));

  // ROS handlers
  const handleRosChange = (key: string, field: 'reviewed' | 'positives', value: boolean | string[]) => {
    setRosState((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? { reviewed: false, positives: [] }), [field]: value },
    }));
  };

  const handleMarkAllNegative = () => {
    const all: Record<string, RosSystemState> = {};
    ROS_SYSTEMS.forEach((s) => { all[s.key] = { reviewed: true, positives: [] }; });
    setRosState(all);
  };

  // Vitals handler
  const handleVitalsChange = (field: keyof VitalsState, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  // Diagnosis handlers
  const handleDxChange = (id: string, field: keyof DiagnosisEntry, value: string) => {
    setDiagnoses((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };
  const handleDxRemove = (id: string) => {
    setDiagnoses((prev) => prev.filter((d) => d.id !== id));
  };
  const handleDxAdd = () => {
    setDiagnoses((prev) => [...prev, { id: `dx-${Date.now()}`, icdCode: '', diagnosis: '', plan: '' }]);
  };

  // Note actions
  const handleSign = () => {
    setStatus('signed');
    setAutoSaveLabel('Signed');
  };
  const handleSaveDraft = () => {
    setStatus('draft');
    triggerAutoSave();
  };
  const handleCancel = () => {
    navigate(patientId ? `/patients/${patientId}` : '/patients');
  };

  // Derived
  const allergyChipVariant = (severity: Allergy['severity']): ChipProps['variant'] =>
    severity === 'severe' ? 'critical' : severity === 'moderate' ? 'warning' : 'default';

  return (
    <div className="-m-4 flex flex-col" style={{ height: 'calc(100vh - 2rem)' }}>
      {/* ── Patient Header ── */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-bold">
                {MOCK_PATIENT.firstName[0]}{MOCK_PATIENT.lastName[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {MOCK_PATIENT.firstName} {MOCK_PATIENT.lastName}
                </span>
                <span className="text-[10px] text-gray-400">·</span>
                <span className="text-[11px] text-gray-500">{MOCK_PATIENT.sex}</span>
                <span className="text-[10px] text-gray-400">·</span>
                <span className="text-[11px] text-gray-500">
                  DOB: {new Date(MOCK_PATIENT.dob).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ({MOCK_PATIENT.age} yrs)
                </span>
                <span className="text-[10px] text-gray-400">·</span>
                <span className="text-[11px] font-mono text-gray-400">{MOCK_PATIENT.mrn}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {MOCK_ALLERGIES.map((a) => (
                  <span key={a.id} className={cn('text-[11px] px-1.5 py-0 rounded-full font-medium border', SEVERITY_STYLES[a.severity])}>
                    {a.substance}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              <span className={cn(autoSaveLabel === 'Saving...' && 'text-warning-600')}>{autoSaveLabel}</span>
            </div>
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
              status === 'draft'
                ? 'bg-warning-50 text-warning-700 border-warning-200'
                : 'bg-emerald-50/80 text-emerald-600 border-success-100'
            )}>
              {status === 'signed' && <Check className="w-2.5 h-2.5" />}
              {status.toUpperCase()}
            </span>
          </div>
        </div>
        <NoteToolbar />
      </header>

      {/* ── Three-Column Layout ── */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <ClinicalSidebar
          allergies={noteAllergies}
          medications={noteMedications}
          drugIntolerances={noteDrugIntolerances}
          problems={MOCK_PROBLEMS}
        />

        {/* Center: SOAP Note Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-page)]">
          <TemplateBar />

          {/* Scrollable note body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5">

            {/* Chief Complaint */}
            <NoteSectionBlock id="cc" label="Chief Complaint (CC)">
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Type chief complaint..."
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* Subjective */}
            <NoteSectionBlock id="subjective" label="Subjective">
              <div className="relative">
                <textarea
                  value={subjective}
                  onChange={(e) => handleSubjectiveChange(e.target.value)}
                  placeholder="Enter subjective notes as bullet points... (type . for smart phrases)"
                  rows={4}
                  className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y placeholder:text-gray-300 bg-white leading-relaxed"
                />
                {showSmartPhrase && matchingPhrases.length > 0 && (
                  <div className="absolute z-dropdown left-0 mt-1 w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-slide-down">
                    <div className="px-2 py-1.5 bg-slate-50 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Smart Phrases</p>
                    </div>
                    {matchingPhrases.map(([trigger, expansion]) => (
                      <button
                        key={trigger}
                        onClick={() => applySmartPhrase(trigger)}
                        className="w-full flex items-start gap-2 px-3 py-2 hover:bg-blue-50 transition-colors text-left"
                      >
                        <code className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1 py-0 rounded flex-shrink-0">{trigger}</code>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{expansion.substring(0, 70)}…</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  {Object.keys(SMART_PHRASES).map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => applySmartPhrase(trigger)}
                      className="text-[11px] font-mono text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded transition-colors"
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>
            </NoteSectionBlock>

            {/* Allergies (chips) */}
            <NoteSectionBlock
              id="allergies"
              label="Allergies"
              actions={
                <>
                  <button
                    onClick={() => setNoteAllergies([])}
                    className="text-[10px] text-gray-400 hover:text-critical-600 transition-colors px-1.5 py-0.5 rounded"
                  >
                    × Clear
                  </button>
                  <button className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Plus className="w-2.5 h-2.5" /> Add
                  </button>
                </>
              }
            >
              <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                {noteAllergies.length === 0 ? (
                  <span className="text-[10px] text-gray-300 italic">No allergies on file</span>
                ) : (
                  noteAllergies.map((a) => (
                    <Chip
                      key={a.id}
                      label={`${a.substance} — ${a.reaction}`}
                      variant={allergyChipVariant(a.severity)}
                      onRemove={() => setNoteAllergies((prev) => prev.filter((x) => x.id !== a.id))}
                    />
                  ))
                )}
              </div>
            </NoteSectionBlock>

            {/* Drug Intolerances (chips) */}
            <NoteSectionBlock
              id="drug-intolerances"
              label="Drug Intolerances"
              actions={
                <>
                  <button
                    onClick={() => setNoteDrugIntolerances([])}
                    className="text-[10px] text-gray-400 hover:text-critical-600 transition-colors px-1.5 py-0.5 rounded"
                  >
                    × Clear
                  </button>
                  <button className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Plus className="w-2.5 h-2.5" /> Add
                  </button>
                </>
              }
            >
              <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                {noteDrugIntolerances.length === 0 ? (
                  <span className="text-[10px] text-gray-300 italic">No drug intolerances on file</span>
                ) : (
                  noteDrugIntolerances.map((d) => (
                    <Chip
                      key={d.id}
                      label={d.substance}
                      variant="warning"
                      onRemove={() => setNoteDrugIntolerances((prev) => prev.filter((x) => x.id !== d.id))}
                    />
                  ))
                )}
              </div>
            </NoteSectionBlock>

            {/* Medications (chips) */}
            <NoteSectionBlock
              id="medications"
              label="Medications"
              actions={
                <>
                  <button
                    onClick={() => setNoteMedications([])}
                    className="text-[10px] text-gray-400 hover:text-critical-600 transition-colors px-1.5 py-0.5 rounded"
                  >
                    × Clear
                  </button>
                  <button className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Plus className="w-2.5 h-2.5" /> Add
                  </button>
                </>
              }
            >
              <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                {noteMedications.length === 0 ? (
                  <span className="text-[10px] text-gray-300 italic">No medications on file</span>
                ) : (
                  noteMedications.map((m) => (
                    <Chip
                      key={m.id}
                      label={`${m.name} ${m.strength}`}
                      variant="default"
                      onRemove={() => setNoteMedications((prev) => prev.filter((x) => x.id !== m.id))}
                    />
                  ))
                )}
              </div>
            </NoteSectionBlock>

            {/* Past Medical History */}
            <NoteSectionBlock
              id="pmh"
              label="Past Medical History"
              actions={<ImportAddActions onImport={() => {}} onAdd={() => {}} />}
            >
              {pmh.length === 0 ? (
                <p className="text-[10px] text-gray-300 italic">No records</p>
              ) : (
                <div className="space-y-1">
                  {pmh.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 text-[11px] text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <span>{entry.condition}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400">{entry.onset}</span>
                      <span className={cn('ml-auto text-[11px] px-1.5 py-0 rounded-full font-medium', entry.status === 'Active' ? 'bg-emerald-50/80 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
                        {entry.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </NoteSectionBlock>

            {/* Surgical History */}
            <NoteSectionBlock
              id="surgical"
              label="Surgical History"
              actions={<ImportAddActions onImport={() => {}} onAdd={() => {}} />}
            >
              {surgical.length === 0 ? (
                <p className="text-[10px] text-gray-300 italic">No records</p>
              ) : (
                <div className="space-y-1">
                  {surgical.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 text-[11px] text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <span>{entry.procedure}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-400">{entry.date}</span>
                      <span className="text-gray-400 ml-auto text-[10px]">{entry.notes}</span>
                    </div>
                  ))}
                </div>
              )}
            </NoteSectionBlock>

            {/* Family History */}
            <NoteSectionBlock
              id="family"
              label="Family History"
              actions={<ImportAddActions onImport={() => {}} onAdd={() => {}} />}
            >
              {familyHx.length === 0 ? (
                <p className="text-[10px] text-gray-300 italic">No records</p>
              ) : (
                <div className="space-y-1">
                  {familyHx.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 text-[11px] text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <span className="text-gray-500">{entry.relation}:</span>
                      <span>{entry.condition}</span>
                    </div>
                  ))}
                </div>
              )}
            </NoteSectionBlock>

            {/* Social History */}
            <NoteSectionBlock
              id="social"
              label="Social History"
              actions={<ImportAddActions onImport={() => {}} onAdd={() => {}} />}
            >
              <textarea
                value={socialHistory}
                onChange={(e) => setSocialHistory(e.target.value)}
                placeholder="Non-smoker. Occasional alcohol (1–2 drinks/week). No illicit drug use. Married, works as office manager..."
                rows={2}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* Screening */}
            <NoteSectionBlock
              id="screening"
              label="Screening / Health Maintenance"
              actions={<ImportAddActions onImport={() => {}} onAdd={() => {}} />}
            >
              <textarea
                value={screening}
                onChange={(e) => setScreening(e.target.value)}
                placeholder="Screening and preventive care notes..."
                rows={2}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* ── Clinical Divider ── */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest whitespace-nowrap">Clinical Sections</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Assessment */}
            <NoteSectionBlock id="assessment" label="Assessment">
              <textarea
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="Enter clinical assessment..."
                rows={3}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* Plan (with per-diagnosis blocks) */}
            <NoteSectionBlock id="plan" label="Plan">
              <AssessmentPlan
                diagnoses={diagnoses}
                onDxChange={handleDxChange}
                onDxRemove={handleDxRemove}
                onDxAdd={handleDxAdd}
              />
              <textarea
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Additional plan notes..."
                rows={2}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 mt-3 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* Vitals */}
            <NoteSectionBlock id="vitals" label="Vitals">
              <VitalsGrid vitals={vitals} onChange={handleVitalsChange} />
            </NoteSectionBlock>

            {/* ROS */}
            <RosSection
              rosState={rosState}
              onChange={handleRosChange}
              onMarkAllNegative={handleMarkAllNegative}
            />

            {/* Orders */}
            <NoteSectionBlock
              id="orders"
              label="Orders"
              actions={
                <button className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Plus className="w-2.5 h-2.5" /> Add Order
                </button>
              }
            >
              <textarea
                value={orders}
                onChange={(e) => setOrders(e.target.value)}
                placeholder="HbA1c, CMP, lipid panel, urine microalbumin..."
                rows={3}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y placeholder:text-gray-300 bg-white"
              />
              {/* Quick-add order buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['HbA1c', 'CMP', 'Lipid Panel', 'CBC', 'UA', 'EKG', 'Chest X-Ray'].map((ord) => (
                  <button
                    key={ord}
                    onClick={() => setOrders((prev) => prev ? `${prev}, ${ord}` : ord)}
                    className="px-2 py-0.5 text-[10px] font-medium border border-slate-200 rounded-full text-gray-500 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors bg-white"
                  >
                    + {ord}
                  </button>
                ))}
              </div>
            </NoteSectionBlock>

            {/* Care Plan */}
            <NoteSectionBlock id="careplan" label="Care Plan">
              <textarea
                value={carePlan}
                onChange={(e) => setCarePlan(e.target.value)}
                placeholder="Long-term care plan, goals, and coordination notes..."
                rows={3}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* Follow Up */}
            <NoteSectionBlock id="followup" label="Follow Up">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Return in 4 weeks for BP recheck..."
                  className="flex-1 text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-300 bg-white"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {['1 week', '2 weeks', '4 weeks', '3 months', '6 months', '1 year'].map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setFollowUp(`Return to clinic in ${fw}`)}
                    className="px-2 py-0.5 text-[10px] font-medium border border-slate-200 rounded-full text-gray-500 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors bg-white"
                  >
                    {fw}
                  </button>
                ))}
              </div>
            </NoteSectionBlock>

            {/* Patient Instructions */}
            <NoteSectionBlock id="instructions" label="Patient Instructions">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions for the patient: diet, activity, medication changes, warning signs to watch for..."
                rows={3}
                className="w-full text-[11px] border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-y placeholder:text-gray-300 bg-white"
              />
            </NoteSectionBlock>

            {/* Bottom spacer for footer */}
            <div className="h-4" />
          </div>

          {/* ── Footer Actions ── */}
          <div className="flex-shrink-0 bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3">
            <button
              onClick={handleCancel}
              className="text-[11px] text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-[11px] font-medium text-gray-700 hover:bg-slate-50 hover:border-gray-400 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save as Draft
              </button>
              <button
                onClick={handleSign}
                disabled={status === 'signed'}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all',
                  status === 'signed'
                    ? 'bg-success-600 text-white cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                )}
              >
                {status === 'signed' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Note Signed
                  </>
                ) : (
                  <>
                    <FileSignature className="w-3.5 h-3.5" />
                    Save &amp; Sign
                    <span className="ml-1 text-[11px] font-normal opacity-60 hidden sm:inline">⌘↵</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Section Nav */}
        <SectionNav activeSection={activeSection} onNavigate={handleNavClick} />
      </div>
    </div>
  );
};

export default NewEncounterPage;
