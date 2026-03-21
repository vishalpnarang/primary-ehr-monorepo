import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  X,
  CheckCircle2,
  FileText,
  Pill,
  AlertTriangle,
  Heart,
  Users,
  Activity,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
}

interface Allergy {
  id: string;
  substance: string;
  reaction: string;
}

// ---------------------------------------------------------------------------
// Mock initial data
// ---------------------------------------------------------------------------

const INITIAL_MEDICATIONS: Medication[] = [
  { id: 'm1', name: 'Lisinopril', dose: '10mg', frequency: 'Once daily' },
  { id: 'm2', name: 'Atorvastatin', dose: '40mg', frequency: 'Once daily at bedtime' },
];

const INITIAL_ALLERGIES: Allergy[] = [
  { id: 'a1', substance: 'Penicillin', reaction: 'Rash, hives' },
];

const NEW_CONDITIONS = [
  'Diabetes (Type 2)',
  'Hypertension',
  'Asthma or COPD',
  'Heart disease',
  'Depression or Anxiety',
  'Cancer (any type)',
  'Kidney disease',
  'Thyroid disorder',
];

const FAMILY_CONDITIONS = [
  'Heart disease',
  'Diabetes',
  'Cancer',
  'Hypertension',
  'Mental health disorders',
  'Stroke',
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const inputClass =
  'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

const selectClass = inputClass;

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ icon, title, children }) => (
  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
    <h2 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
      <span className="text-blue-600">{icon}</span>
      {title}
    </h2>
    {children}
  </div>
);

// Medications list
interface MedicationsEditorProps {
  items: Medication[];
  onChange: (items: Medication[]) => void;
}

const MedicationsEditor: React.FC<MedicationsEditorProps> = ({ items, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Medication, 'id'>>({ name: '', dose: '', frequency: '' });

  const addMed = () => {
    if (!draft.name) return;
    onChange([...items, { id: `m${Date.now()}`, ...draft }]);
    setDraft({ name: '', dose: '', frequency: '' });
    setAdding(false);
  };

  const remove = (id: string) => onChange(items.filter((m) => m.id !== id));

  return (
    <div className="space-y-2">
      {items.length === 0 && !adding && (
        <p className="text-sm text-slate-400 italic">No medications on file</p>
      )}
      {items.map((m) => (
        <div key={m.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
          <div>
            <span className="font-medium text-slate-800">{m.name}</span>
            <span className="text-slate-500"> — {m.dose}, {m.frequency}</span>
          </div>
          <button onClick={() => remove(m.id)} className="text-slate-400 hover:text-red-500 transition-colors ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {adding && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <input className={inputClass} placeholder="Medication name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="Dose (e.g. 10mg)" value={draft.dose} onChange={(e) => setDraft({ ...draft, dose: e.target.value })} />
            <input className={inputClass} placeholder="Frequency" value={draft.frequency} onChange={(e) => setDraft({ ...draft, frequency: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-1.5 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={addMed} disabled={!draft.name} className="flex-1 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40">Add</button>
          </div>
        </div>
      )}
      {!adding && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      )}
    </div>
  );
};

// Allergies list
interface AllergiesEditorProps {
  items: Allergy[];
  onChange: (items: Allergy[]) => void;
}

const AllergiesEditor: React.FC<AllergiesEditorProps> = ({ items, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Allergy, 'id'>>({ substance: '', reaction: '' });

  const addAllergy = () => {
    if (!draft.substance) return;
    onChange([...items, { id: `a${Date.now()}`, ...draft }]);
    setDraft({ substance: '', reaction: '' });
    setAdding(false);
  };

  const remove = (id: string) => onChange(items.filter((a) => a.id !== id));

  return (
    <div className="space-y-2">
      {items.length === 0 && !adding && (
        <p className="text-sm text-slate-400 italic">No known allergies</p>
      )}
      {items.map((a) => (
        <div key={a.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-sm">
          <div>
            <span className="font-medium text-red-700">{a.substance}</span>
            {a.reaction && <span className="text-red-500"> — {a.reaction}</span>}
          </div>
          <button onClick={() => remove(a.id)} className="text-red-300 hover:text-red-600 transition-colors ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      {adding && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
          <input className={inputClass} placeholder="Substance (e.g. Penicillin)" value={draft.substance} onChange={(e) => setDraft({ ...draft, substance: e.target.value })} />
          <input className={inputClass} placeholder="Reaction (e.g. Rash, hives)" value={draft.reaction} onChange={(e) => setDraft({ ...draft, reaction: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 py-1.5 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={addAllergy} disabled={!draft.substance} className="flex-1 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40">Add</button>
          </div>
        </div>
      )}
      {!adding && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
          <Plus className="w-4 h-4" /> Add Allergy
        </button>
      )}
    </div>
  );
};

// Checkbox grid
interface CheckboxGridProps {
  options: string[];
  checked: Set<string>;
  onChange: (s: Set<string>) => void;
}

const CheckboxGrid: React.FC<CheckboxGridProps> = ({ options, checked, onChange }) => {
  const toggle = (opt: string) => {
    const next = new Set(checked);
    if (next.has(opt)) next.delete(opt); else next.add(opt);
    onChange(next);
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={checked.has(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          {opt}
        </label>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const IntakeFormPage: React.FC = () => {
  const { formToken } = useParams<{ formToken: string }>();
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [allergies, setAllergies] = useState<Allergy[]>(INITIAL_ALLERGIES);
  const [newConditions, setNewConditions] = useState<Set<string>>(new Set());
  const [familyConditions, setFamilyConditions] = useState<Set<string>>(new Set());
  const [smokingStatus, setSmokingStatus] = useState('');
  const [alcoholUse, setAlcoholUse] = useState('');
  const [exerciseFreq, setExerciseFreq] = useState('');
  const [consentName, setConsentName] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  const canSubmit = chiefComplaint.trim() && consentAgreed && consentName.trim();

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Intake Form Submitted</h1>
        <p className="text-slate-500 mb-6">
          Your care team has received your intake form and will review it before your visit.
        </p>
        <button
          onClick={() => navigate('/appointments')}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <p className="text-xs text-slate-400 font-mono mb-1">{formToken}</p>
        <h1 className="text-2xl font-bold text-slate-900">Pre-Visit Intake Form</h1>
        <p className="text-sm text-slate-500 mt-1">
          Please complete this form before your appointment. It helps your provider prepare.
        </p>
      </div>

      <div className="space-y-4">
        {/* Chief complaint */}
        <Section icon={<FileText className="w-4 h-4" />} title="Reason for Visit">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            What is the main reason for your visit today?<span className="text-red-500">*</span>
          </label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Describe your symptoms or reason for visit…"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
          />
        </Section>

        {/* Medications */}
        <Section icon={<Pill className="w-4 h-4" />} title="Current Medications">
          <p className="text-xs text-slate-400 mb-3">Review your medication list and add or remove as needed</p>
          <MedicationsEditor items={medications} onChange={setMedications} />
        </Section>

        {/* Allergies */}
        <Section icon={<AlertTriangle className="w-4 h-4" />} title="Allergies">
          <p className="text-xs text-slate-400 mb-3">Review your allergy list and add or remove as needed</p>
          <AllergiesEditor items={allergies} onChange={setAllergies} />
        </Section>

        {/* Health history updates */}
        <Section icon={<Heart className="w-4 h-4" />} title="Health History Updates">
          <p className="text-xs text-slate-400 mb-3">Have you been diagnosed with any new conditions since your last visit?</p>
          <CheckboxGrid options={NEW_CONDITIONS} checked={newConditions} onChange={setNewConditions} />
        </Section>

        {/* Family history */}
        <Section icon={<Users className="w-4 h-4" />} title="Family History Updates">
          <p className="text-xs text-slate-400 mb-3">Do any immediate family members have a history of the following?</p>
          <CheckboxGrid options={FAMILY_CONDITIONS} checked={familyConditions} onChange={setFamilyConditions} />
        </Section>

        {/* Social history */}
        <Section icon={<Activity className="w-4 h-4" />} title="Social History">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tobacco / Smoking Status</label>
              <select className={selectClass} value={smokingStatus} onChange={(e) => setSmokingStatus(e.target.value)}>
                <option value="">Select…</option>
                <option>Never smoked</option>
                <option>Former smoker (quit &gt;12 months ago)</option>
                <option>Current smoker — less than 1 pack/day</option>
                <option>Current smoker — 1+ packs/day</option>
                <option>Vaping / e-cigarettes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alcohol Use</label>
              <select className={selectClass} value={alcoholUse} onChange={(e) => setAlcoholUse(e.target.value)}>
                <option value="">Select…</option>
                <option>None</option>
                <option>Occasional (1–2 drinks/week)</option>
                <option>Moderate (3–7 drinks/week)</option>
                <option>Heavy (8+ drinks/week)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Exercise Frequency</label>
              <select className={selectClass} value={exerciseFreq} onChange={(e) => setExerciseFreq(e.target.value)}>
                <option value="">Select…</option>
                <option>Sedentary (little to no exercise)</option>
                <option>Light (1–2 days/week)</option>
                <option>Moderate (3–4 days/week)</option>
                <option>Active (5+ days/week)</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Consent */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-3">Digital Consent &amp; Signature</h2>
          <p className="text-sm text-slate-500 mb-4">
            By signing below, you confirm that the information provided is accurate and consent to the use of this
            information to support your care.
          </p>
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-sm text-slate-700">
              I confirm the information above is accurate to the best of my knowledge, and I consent to its use in
              my care.
              <span className="text-red-500 ml-0.5">*</span>
            </span>
          </label>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name (signature)<span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="Type your full legal name"
              value={consentName}
              onChange={(e) => setConsentName(e.target.value)}
              style={{ fontFamily: 'cursive' }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><CheckCircle2 className="w-5 h-5" /> Submit Intake Form</>}
        </button>
      </div>
    </div>
  );
};

export default IntakeFormPage;
