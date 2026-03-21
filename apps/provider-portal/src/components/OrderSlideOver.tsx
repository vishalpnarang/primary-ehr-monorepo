import React, { useState } from 'react';
import {
  X,
  Search,
  FlaskConical,
  Scan,
  Users,
  Star,
  Trash2,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderSlideOverProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  orderType?: 'lab' | 'imaging' | 'referral';
}

type TabKey = 'lab' | 'imaging' | 'referral';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LAB_FAVORITES = [
  { code: 'CBC', name: 'CBC', full: 'Complete Blood Count' },
  { code: 'BMP', name: 'BMP', full: 'Basic Metabolic Panel' },
  { code: 'CMP', name: 'CMP', full: 'Comprehensive Metabolic Panel' },
  { code: 'HBA1C', name: 'HbA1c', full: 'Hemoglobin A1c' },
  { code: 'LIPID', name: 'Lipid Panel', full: 'Lipid Panel' },
  { code: 'TSH', name: 'TSH', full: 'Thyroid Stimulating Hormone' },
  { code: 'UA', name: 'Urinalysis', full: 'Urinalysis with Reflex' },
  { code: 'VITD', name: 'Vitamin D', full: 'Vitamin D, 25-Hydroxy' },
];

const IMAGING_MODALITIES = ['X-Ray', 'CT', 'MRI', 'Ultrasound', 'Nuclear Medicine', 'PET Scan', 'Fluoroscopy'];

const IMAGING_BODY_PARTS: Record<string, string[]> = {
  'X-Ray': ['Chest (PA & Lateral)', 'Abdomen', 'Left Hand', 'Right Hand', 'Left Foot', 'Right Foot', 'Lumbar Spine', 'Cervical Spine', 'Pelvis', 'Knee (Left)', 'Knee (Right)'],
  'CT': ['Chest w/o contrast', 'Chest w/ contrast', 'Abdomen/Pelvis w/o contrast', 'Abdomen/Pelvis w/ contrast', 'Head w/o contrast', 'Head w/ contrast', 'Spine - Lumbar', 'Spine - Cervical'],
  'MRI': ['Brain w/o contrast', 'Brain w/ contrast', 'Lumbar Spine w/o contrast', 'Cervical Spine w/o contrast', 'Right Knee', 'Left Knee', 'Right Shoulder', 'Left Shoulder'],
  'Ultrasound': ['Abdomen Complete', 'Pelvis', 'Thyroid', 'Venous Duplex - Lower Extremity', 'Arterial Duplex - Lower Extremity', 'Renal/Bladder', 'Soft Tissue'],
  'Nuclear Medicine': ['Bone Scan', 'Thyroid Scan', 'V/Q Scan'],
  'PET Scan': ['PET/CT - Whole Body', 'PET/CT - Head/Neck'],
  'Fluoroscopy': ['Upper GI Series', 'Barium Enema', 'Swallowing Study'],
};

const SPECIALTIES = [
  'Cardiology', 'Endocrinology', 'Gastroenterology', 'Neurology', 'Nephrology',
  'Oncology', 'Ophthalmology', 'Orthopedics', 'Pulmonology', 'Rheumatology',
  'Urology', 'Dermatology', 'Hematology', 'Infectious Disease', 'Psychiatry',
  'Physical Therapy', 'Occupational Therapy', 'Vascular Surgery', 'General Surgery',
];

const ICD10_SUGGESTIONS = [
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism' },
  { code: 'N18.3', description: 'Chronic kidney disease, stage 3' },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'K21.0', description: 'Gastro-esophageal reflux disease with esophagitis' },
  { code: 'J44.1', description: 'COPD with acute exacerbation' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface TabBarProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'lab', label: 'Lab', icon: <FlaskConical size={14} /> },
  { key: 'imaging', label: 'Imaging', icon: <Scan size={14} /> },
  { key: 'referral', label: 'Referral', icon: <Users size={14} /> },
];

const TabBar: React.FC<TabBarProps> = ({ active, onChange }) => (
  <div className="flex rounded-lg bg-slate-100 p-1 gap-1">
    {TABS.map((tab) => (
      <button
        key={tab.key}
        type="button"
        onClick={() => onChange(tab.key)}
        className={cn(
          'flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
          active === tab.key
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);

interface SelectedTestsListProps {
  tests: string[];
  onRemove: (test: string) => void;
}

const SelectedTestsList: React.FC<SelectedTestsListProps> = ({ tests, onRemove }) => {
  if (tests.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-slate-600">Selected ({tests.length})</p>
      <ul className="space-y-1">
        {tests.map((test) => (
          <li
            key={test}
            className="flex items-center justify-between gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-1.5"
          >
            <span className="text-xs text-blue-800 font-medium">{test}</span>
            <button
              type="button"
              onClick={() => onRemove(test)}
              aria-label={`Remove ${test}`}
              className="text-blue-400 hover:text-red-500 transition-colors shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface PriorityToggleProps {
  value: 'routine' | 'stat';
  onChange: (v: 'routine' | 'stat') => void;
}

const PriorityToggle: React.FC<PriorityToggleProps> = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
    <div className="flex rounded-md border border-slate-200 overflow-hidden w-fit">
      {(['routine', 'stat'] as const).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            'px-4 py-1.5 text-xs font-medium capitalize transition-colors',
            value === p
              ? p === 'stat'
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50'
          )}
        >
          {p === 'stat' ? 'STAT' : 'Routine'}
        </button>
      ))}
    </div>
  </div>
);

interface ICD10SearchProps {
  value: string;
  onChange: (v: string) => void;
}

const ICD10Search: React.FC<ICD10SearchProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const filtered = value.length >= 1
    ? ICD10_SUGGESTIONS.filter(
        (d) =>
          d.description.toLowerCase().includes(value.toLowerCase()) ||
          d.code.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-600 mb-1.5">Clinical Indication (ICD-10)</label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search diagnosis or ICD-10 code..."
          className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filtered.map((d) => (
            <li key={d.code}>
              <button
                type="button"
                onMouseDown={() => { onChange(`${d.code} — ${d.description}`); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50"
              >
                <span className="font-mono font-semibold text-blue-700">{d.code}</span>
                <span className="text-slate-600 ml-2">{d.description}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ─── Lab Tab ──────────────────────────────────────────────────────────────────

interface LabState {
  facility: string;
  testSearch: string;
  selectedTests: string[];
  priority: 'routine' | 'stat';
  indication: string;
}

const LabTab: React.FC<{
  state: LabState;
  setState: React.Dispatch<React.SetStateAction<LabState>>;
}> = ({ state, setState }) => {
  const set = <K extends keyof LabState>(key: K, value: LabState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const toggleTest = (name: string) => {
    setState((prev) => ({
      ...prev,
      selectedTests: prev.selectedTests.includes(name)
        ? prev.selectedTests.filter((t) => t !== name)
        : [...prev.selectedTests, name],
    }));
  };

  const filteredSearch = state.testSearch
    ? LAB_FAVORITES.filter(
        (t) =>
          t.name.toLowerCase().includes(state.testSearch.toLowerCase()) ||
          t.full.toLowerCase().includes(state.testSearch.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-5">
      {/* Facility */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Lab Facility</label>
        <select
          value={state.facility}
          onChange={(e) => set('facility', e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Quest Diagnostics">Quest Diagnostics</option>
          <option value="LabCorp">LabCorp</option>
          <option value="In-House">In-House Lab</option>
        </select>
      </div>

      {/* Favorites */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Star size={13} className="text-amber-500" />
          <span className="text-xs font-medium text-slate-600">Common Tests</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LAB_FAVORITES.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => toggleTest(t.full)}
              title={t.full}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                state.selectedTests.includes(t.full)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Test search */}
      <div className="relative">
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Search Test</label>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={state.testSearch}
            onChange={(e) => set('testSearch', e.target.value)}
            placeholder="e.g. Ferritin, BNP..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {filteredSearch.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-36 overflow-y-auto">
            {filteredSearch.map((t) => (
              <li key={t.code}>
                <button
                  type="button"
                  onMouseDown={() => {
                    toggleTest(t.full);
                    set('testSearch', '');
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-slate-700"
                >
                  {t.full}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected tests */}
      <SelectedTestsList
        tests={state.selectedTests}
        onRemove={(t) => setState((prev) => ({ ...prev, selectedTests: prev.selectedTests.filter((x) => x !== t) }))}
      />

      {/* Priority */}
      <PriorityToggle value={state.priority} onChange={(v) => set('priority', v)} />

      {/* Indication */}
      <ICD10Search value={state.indication} onChange={(v) => set('indication', v)} />
    </div>
  );
};

// ─── Imaging Tab ──────────────────────────────────────────────────────────────

interface ImagingState {
  modality: string;
  bodyPart: string;
  clinicalReason: string;
  priority: 'routine' | 'stat';
}

const ImagingTab: React.FC<{
  state: ImagingState;
  setState: React.Dispatch<React.SetStateAction<ImagingState>>;
}> = ({ state, setState }) => {
  const set = <K extends keyof ImagingState>(key: K, value: ImagingState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const bodyParts = state.modality ? (IMAGING_BODY_PARTS[state.modality] ?? []) : [];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Modality</label>
        <div className="flex flex-wrap gap-1.5">
          {IMAGING_MODALITIES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setState((prev) => ({ ...prev, modality: m, bodyPart: '' }))}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md border transition-colors',
                state.modality === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {state.modality && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Body Part / Study</label>
          <select
            value={state.bodyPart}
            onChange={(e) => set('bodyPart', e.target.value)}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select —</option>
            {bodyParts.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Clinical Reason</label>
        <textarea
          value={state.clinicalReason}
          onChange={(e) => set('clinicalReason', e.target.value)}
          rows={3}
          placeholder="Describe the clinical indication for this study..."
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <PriorityToggle value={state.priority} onChange={(v) => set('priority', v)} />
    </div>
  );
};

// ─── Referral Tab ─────────────────────────────────────────────────────────────

interface ReferralState {
  specialty: string;
  referredTo: string;
  urgency: 'routine' | 'urgent' | 'emergent';
  clinicalReason: string;
}

const ReferralTab: React.FC<{
  state: ReferralState;
  setState: React.Dispatch<React.SetStateAction<ReferralState>>;
}> = ({ state, setState }) => {
  const set = <K extends keyof ReferralState>(key: K, value: ReferralState[K]) =>
    setState((prev) => ({ ...prev, [key]: value }));

  const URGENCIES = [
    { value: 'routine', label: 'Routine', color: 'bg-blue-600' },
    { value: 'urgent', label: 'Urgent', color: 'bg-amber-500' },
    { value: 'emergent', label: 'Emergent', color: 'bg-red-600' },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Specialty</label>
        <select
          value={state.specialty}
          onChange={(e) => set('specialty', e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">— Select specialty —</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Referred To (optional)</label>
        <input
          type="text"
          value={state.referredTo}
          onChange={(e) => set('referredTo', e.target.value)}
          placeholder="Specific provider or group..."
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Urgency</label>
        <div className="flex rounded-md border border-slate-200 overflow-hidden w-fit">
          {URGENCIES.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => set('urgency', u.value)}
              className={cn(
                'px-4 py-1.5 text-xs font-medium transition-colors',
                state.urgency === u.value
                  ? `${u.color} text-white`
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Clinical Reason</label>
        <textarea
          value={state.clinicalReason}
          onChange={(e) => set('clinicalReason', e.target.value)}
          rows={4}
          placeholder="Clinical indication, relevant history, specific questions for consultant..."
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
};

// ─── Success State ────────────────────────────────────────────────────────────

interface OrderSuccessProps {
  tab: TabKey;
  onNew: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ tab, onNew }) => {
  const labels: Record<TabKey, string> = {
    lab: 'Lab order',
    imaging: 'Imaging order',
    referral: 'Referral',
  };
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-green-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{labels[tab]} Sent</h3>
        <p className="text-sm text-slate-600 mt-1">
          Order has been placed and is pending processing.
        </p>
      </div>
      <button
        type="button"
        onClick={onNew}
        className="mt-2 px-4 py-2 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
      >
        Place another order
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const OrderSlideOver: React.FC<OrderSlideOverProps> = ({
  open,
  onClose,
  patientName,
  patientId,
  orderType = 'lab',
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(orderType);
  const [sent, setSent] = useState(false);

  const [labState, setLabState] = useState<LabState>({
    facility: 'Quest Diagnostics',
    testSearch: '',
    selectedTests: [],
    priority: 'routine',
    indication: '',
  });

  const [imagingState, setImagingState] = useState<ImagingState>({
    modality: '',
    bodyPart: '',
    clinicalReason: '',
    priority: 'routine',
  });

  const [referralState, setReferralState] = useState<ReferralState>({
    specialty: '',
    referredTo: '',
    urgency: 'routine',
    clinicalReason: '',
  });

  const canSend = (() => {
    if (activeTab === 'lab') return labState.selectedTests.length > 0 && !!labState.indication;
    if (activeTab === 'imaging') return !!imagingState.modality && !!imagingState.bodyPart && !!imagingState.clinicalReason;
    if (activeTab === 'referral') return !!referralState.specialty && !!referralState.clinicalReason;
    return false;
  })();

  const sendLabel: Record<TabKey, string> = {
    lab: 'Send Order',
    imaging: 'Send Order',
    referral: 'Send Referral',
  };

  const tabIcon: Record<TabKey, React.ReactNode> = {
    lab: <FlaskConical size={18} className="text-blue-600" />,
    imaging: <Scan size={18} className="text-blue-600" />,
    referral: <Users size={18} className="text-blue-600" />,
  };

  const handleClose = () => {
    setActiveTab(orderType);
    setSent(false);
    setLabState({ facility: 'Quest Diagnostics', testSearch: '', selectedTests: [], priority: 'routine', indication: '' });
    setImagingState({ modality: '', bodyPart: '', clinicalReason: '', priority: 'routine' });
    setReferralState({ specialty: '', referredTo: '', urgency: 'routine', clinicalReason: '' });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`New Order — ${patientName}`}
        className="relative z-10 flex flex-col bg-white shadow-xl h-full w-full sm:w-[420px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {tabIcon[activeTab]}
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">New Order</h2>
              <p className="text-xs text-slate-500 truncate">{patientName} &nbsp;·&nbsp; {patientId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close panel"
            className="shrink-0 rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {sent ? (
            <OrderSuccess
              tab={activeTab}
              onNew={() => setSent(false)}
            />
          ) : (
            <>
              {/* Tab Bar */}
              <TabBar
                active={activeTab}
                onChange={(tab) => { setActiveTab(tab); }}
              />

              {/* Tab Content */}
              {activeTab === 'lab' && (
                <LabTab state={labState} setState={setLabState} />
              )}
              {activeTab === 'imaging' && (
                <ImagingTab state={imagingState} setState={setImagingState} />
              )}
              {activeTab === 'referral' && (
                <ReferralTab state={referralState} setState={setReferralState} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="shrink-0 border-t border-slate-100 px-5 py-4 bg-slate-50">
            <button
              type="button"
              disabled={!canSend}
              onClick={() => setSent(true)}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-colors',
                canSend
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              <Send size={15} />
              {sendLabel[activeTab]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSlideOver;
