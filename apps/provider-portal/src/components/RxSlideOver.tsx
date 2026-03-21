import React, { useState } from 'react';
import {
  X,
  Search,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Send,
  Pill,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RxSlideOverProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface DrugOption {
  name: string;
  strengths: string[];
  forms: string[];
  commonSigs: string[];
  interactions?: string[];
}

const DRUG_CATALOG: DrugOption[] = [
  {
    name: 'Metformin',
    strengths: ['500 mg', '850 mg', '1000 mg'],
    forms: ['Tablet', 'Extended-Release Tablet'],
    commonSigs: ['Take 1 tablet twice daily with meals', 'Take 1 tablet once daily with dinner', 'Take 2 tablets twice daily with meals'],
  },
  {
    name: 'Lisinopril',
    strengths: ['2.5 mg', '5 mg', '10 mg', '20 mg', '40 mg'],
    forms: ['Tablet'],
    commonSigs: ['Take 1 tablet once daily', 'Take 1 tablet twice daily'],
  },
  {
    name: 'Atorvastatin',
    strengths: ['10 mg', '20 mg', '40 mg', '80 mg'],
    forms: ['Tablet'],
    commonSigs: ['Take 1 tablet once daily at bedtime', 'Take 1 tablet once daily'],
  },
  {
    name: 'Amlodipine',
    strengths: ['2.5 mg', '5 mg', '10 mg'],
    forms: ['Tablet'],
    commonSigs: ['Take 1 tablet once daily', 'Take 1 tablet once daily in the morning'],
  },
  {
    name: 'Omeprazole',
    strengths: ['10 mg', '20 mg', '40 mg'],
    forms: ['Capsule', 'Delayed-Release Capsule'],
    commonSigs: ['Take 1 capsule once daily before breakfast', 'Take 1 capsule twice daily before meals'],
  },
  {
    name: 'Levothyroxine',
    strengths: ['25 mcg', '50 mcg', '75 mcg', '100 mcg', '125 mcg', '150 mcg'],
    forms: ['Tablet'],
    commonSigs: ['Take 1 tablet once daily on empty stomach', 'Take 1 tablet once daily 30-60 min before breakfast'],
  },
  {
    name: 'Albuterol',
    strengths: ['2.5 mg/3 mL', '90 mcg/actuation'],
    forms: ['Inhalation Solution', 'HFA Inhaler'],
    commonSigs: ['Inhale 2 puffs every 4-6 hours as needed', 'Inhale 2 puffs before exercise'],
  },
  {
    name: 'Amoxicillin',
    strengths: ['250 mg', '500 mg', '875 mg'],
    forms: ['Capsule', 'Tablet', 'Liquid'],
    commonSigs: ['Take 1 capsule three times daily for 10 days', 'Take 1 tablet twice daily for 7 days'],
    interactions: ['Warfarin'],
  },
  {
    name: 'Gabapentin',
    strengths: ['100 mg', '300 mg', '400 mg', '600 mg', '800 mg'],
    forms: ['Capsule', 'Tablet'],
    commonSigs: ['Take 1 capsule three times daily', 'Take 1 capsule at bedtime'],
  },
  {
    name: 'Sertraline',
    strengths: ['25 mg', '50 mg', '100 mg'],
    forms: ['Tablet'],
    commonSigs: ['Take 1 tablet once daily in the morning', 'Take 1 tablet once daily with food'],
  },
];

const CURRENT_MEDS = ['Warfarin', 'Lisinopril', 'Atorvastatin'];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DrugSearchProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (drug: DrugOption) => void;
}

const DrugSearch: React.FC<DrugSearchProps> = ({ value, onChange, onSelect }) => {
  const [open, setOpen] = useState(false);

  const filtered = value.length >= 1
    ? DRUG_CATALOG.filter((d) => d.name.toLowerCase().includes(value.toLowerCase()))
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search drug name..."
          className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((drug) => (
            <li key={drug.name}>
              <button
                type="button"
                onMouseDown={() => { onSelect(drug); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-800 hover:bg-blue-50 flex items-center gap-2"
              >
                <Pill size={14} className="text-slate-400 shrink-0" />
                {drug.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface SigChipsProps {
  options: string[];
  selected: string;
  onSelect: (sig: string) => void;
  freeText: string;
  onFreeTextChange: (val: string) => void;
}

const SigChips: React.FC<SigChipsProps> = ({ options, selected, onSelect, freeText, onFreeTextChange }) => (
  <div className="space-y-2">
    <label className="block text-xs font-medium text-slate-600">Directions (SIG)</label>
    <div className="flex flex-wrap gap-1.5">
      {options.map((sig) => (
        <button
          key={sig}
          type="button"
          onClick={() => onSelect(selected === sig ? '' : sig)}
          className={cn(
            'text-xs px-2.5 py-1 rounded-full border transition-colors',
            selected === sig
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
          )}
        >
          {sig}
        </button>
      ))}
    </div>
    <input
      type="text"
      value={freeText}
      onChange={(e) => onFreeTextChange(e.target.value)}
      placeholder="Or type custom directions..."
      className="w-full px-3 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

interface InteractionBannerProps {
  hasInteraction: boolean;
  drugs: string[];
}

const InteractionBanner: React.FC<InteractionBannerProps> = ({ hasInteraction, drugs }) => {
  if (!hasInteraction) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-green-50 border border-green-200">
        <CheckCircle2 size={15} className="text-green-600 shrink-0" />
        <span className="text-xs text-green-700 font-medium">No drug interactions found</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-amber-50 border border-amber-200">
      <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-amber-800 font-semibold">Potential interaction detected</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Interacts with: <strong>{drugs.join(', ')}</strong>. Review before prescribing.
        </p>
      </div>
    </div>
  );
};

// ─── Prescription Form ────────────────────────────────────────────────────────

interface RxFormState {
  searchQuery: string;
  selectedDrug: DrugOption | null;
  strength: string;
  form: string;
  sig: string;
  sigFreeText: string;
  quantity: string;
  daysSupply: string;
  refills: string;
  pharmacy: string;
}

const INITIAL_STATE: RxFormState = {
  searchQuery: '',
  selectedDrug: null,
  strength: '',
  form: '',
  sig: '',
  sigFreeText: '',
  quantity: '',
  daysSupply: '',
  refills: '0',
  pharmacy: 'CVS Pharmacy #4821',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const RxSlideOver: React.FC<RxSlideOverProps> = ({ open, onClose, patientName, patientId }) => {
  const [form, setForm] = useState<RxFormState>(INITIAL_STATE);
  const [sent, setSent] = useState(false);

  const set = <K extends keyof RxFormState>(key: K, value: RxFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleDrugSelect = (drug: DrugOption) => {
    setForm((prev) => ({
      ...prev,
      searchQuery: drug.name,
      selectedDrug: drug,
      strength: drug.strengths[0] ?? '',
      form: drug.forms[0] ?? '',
      sig: '',
      sigFreeText: '',
    }));
  };

  const interactingDrugs = form.selectedDrug?.interactions?.filter((i) =>
    CURRENT_MEDS.some((m) => m.toLowerCase() === i.toLowerCase())
  ) ?? [];
  const hasInteraction = interactingDrugs.length > 0;

  const canSend =
    !!form.selectedDrug && !!form.strength && !!form.form &&
    (!!form.sig || !!form.sigFreeText) && !!form.quantity && !!form.daysSupply;

  const handleSend = () => {
    if (!canSend) return;
    setSent(true);
  };

  const handleClose = () => {
    setForm(INITIAL_STATE);
    setSent(false);
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
        aria-label={`New Prescription — ${patientName}`}
        className="relative z-10 flex flex-col bg-white shadow-xl h-full w-full sm:w-[420px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Pill size={18} className="text-blue-600 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 truncate">New Prescription</h2>
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
            <SuccessState
              drugName={form.selectedDrug?.name ?? ''}
              strength={form.strength}
              pharmacy={form.pharmacy}
              onNew={() => { setForm(INITIAL_STATE); setSent(false); }}
            />
          ) : (
            <>
              {/* Drug Search */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Drug Name</label>
                <DrugSearch
                  value={form.searchQuery}
                  onChange={(v) => set('searchQuery', v)}
                  onSelect={handleDrugSelect}
                />
              </div>

              {form.selectedDrug && (
                <>
                  {/* Strength + Form */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Strength</label>
                      <div className="relative">
                        <select
                          value={form.strength}
                          onChange={(e) => set('strength', e.target.value)}
                          className="w-full appearance-none rounded-md border border-slate-200 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {form.selectedDrug.strengths.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Dosage Form</label>
                      <div className="relative">
                        <select
                          value={form.form}
                          onChange={(e) => set('form', e.target.value)}
                          className="w-full appearance-none rounded-md border border-slate-200 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {form.selectedDrug.forms.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* SIG */}
                  <SigChips
                    options={form.selectedDrug.commonSigs}
                    selected={form.sig}
                    onSelect={(s) => set('sig', s)}
                    freeText={form.sigFreeText}
                    onFreeTextChange={(v) => set('sigFreeText', v)}
                  />

                  {/* Quantity + Days Supply */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={form.quantity}
                        onChange={(e) => set('quantity', e.target.value)}
                        placeholder="30"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Days Supply</label>
                      <input
                        type="number"
                        min="1"
                        value={form.daysSupply}
                        onChange={(e) => set('daysSupply', e.target.value)}
                        placeholder="30"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Refills */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Refills &nbsp;
                      <span className="text-slate-400 font-normal">({form.refills} refills)</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={11}
                      value={parseInt(form.refills)}
                      onChange={(e) => set('refills', e.target.value)}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                      <span>0</span>
                      <span>11</span>
                    </div>
                  </div>

                  {/* Pharmacy */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Pharmacy</label>
                    <input
                      type="text"
                      value={form.pharmacy}
                      onChange={(e) => set('pharmacy', e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Patient's preferred pharmacy</p>
                  </div>

                  {/* Interaction check */}
                  <InteractionBanner hasInteraction={hasInteraction} drugs={interactingDrugs} />
                </>
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
              onClick={handleSend}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-colors',
                canSend
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              <Send size={15} />
              Send to Pharmacy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Success State ────────────────────────────────────────────────────────────

interface SuccessStateProps {
  drugName: string;
  strength: string;
  pharmacy: string;
  onNew: () => void;
}

const SuccessState: React.FC<SuccessStateProps> = ({ drugName, strength, pharmacy, onNew }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
      <CheckCircle2 size={36} className="text-green-600" />
    </div>
    <div>
      <h3 className="text-base font-semibold text-slate-900">Prescription Sent</h3>
      <p className="text-sm text-slate-600 mt-1">
        <strong>{drugName} {strength}</strong> has been sent to{' '}
        <strong>{pharmacy}</strong>.
      </p>
    </div>
    <button
      type="button"
      onClick={onNew}
      className="mt-2 px-4 py-2 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
    >
      Write another prescription
    </button>
  </div>
);

export default RxSlideOver;
