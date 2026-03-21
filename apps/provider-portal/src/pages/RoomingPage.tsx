import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  User,
  DoorOpen,
  Activity,
  MessageSquare,
  Pill,
  ShieldAlert,
  AlertCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENT = {
  id: 'PAT-10001',
  name: 'Sarah Johnson',
  dob: '06/14/1981',
  age: 44,
  appointmentId: 'APT-20045',
  appointmentType: 'Follow-up',
  provider: 'Dr. Emily Chen',
  scheduledTime: '10:30 AM',
  chiefComplaint: 'Patient reports persistent fatigue over the past 3 weeks, worsening with exertion. Also notes occasional shortness of breath when climbing stairs.',
};

const MOCK_ROOMS = ['Room 1', 'Room 2', 'Room 3', 'Room 4', 'Procedure Room'];

const MOCK_MEDICATIONS: { id: string; name: string; dose: string; frequency: string }[] = [
  { id: 'MED-001', name: 'Metformin', dose: '1000 mg', frequency: 'Twice daily with meals' },
  { id: 'MED-002', name: 'Lisinopril', dose: '10 mg', frequency: 'Once daily' },
  { id: 'MED-003', name: 'Atorvastatin', dose: '40 mg', frequency: 'Once daily at bedtime' },
  { id: 'MED-004', name: 'Amlodipine', dose: '5 mg', frequency: 'Once daily' },
];

const MOCK_ALLERGIES: { id: string; substance: string; reaction: string; severity: string }[] = [
  { id: 'ALG-001', substance: 'Penicillin', reaction: 'Hives, anaphylaxis', severity: 'Severe' },
  { id: 'ALG-002', substance: 'Sulfonamides', reaction: 'Rash', severity: 'Moderate' },
];

const MOCK_CARE_GAPS: { id: string; measure: string; description: string; dueDate: string }[] = [
  { id: 'CG-001', measure: 'HbA1c', description: 'HbA1c check overdue (last: 8 months ago)', dueDate: '2026-03-01' },
  { id: 'CG-002', measure: 'Mammogram', description: 'Annual mammogram not on record for 2025', dueDate: '2026-01-01' },
  { id: 'CG-003', measure: 'Diabetic Eye Exam', description: 'Annual dilated eye exam due', dueDate: '2026-02-01' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  completed: boolean;
  active: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ step, icon, title, completed, active }) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold transition-colors',
        completed
          ? 'bg-green-500 text-white'
          : active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-200 text-slate-500'
      )}
    >
      {completed ? <Check size={16} /> : step}
    </div>
    <div className="flex items-center gap-2 flex-1">
      <span className={cn('text-slate-500', active && 'text-blue-600', completed && 'text-green-600')}>
        {icon}
      </span>
      <h3
        className={cn(
          'text-sm font-semibold',
          completed ? 'text-green-700' : active ? 'text-slate-900' : 'text-slate-400'
        )}
      >
        {title}
      </h3>
      {completed && (
        <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={13} /> Done
        </span>
      )}
    </div>
  </div>
);

interface SectionWrapperProps {
  children: React.ReactNode;
  active: boolean;
  completed: boolean;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, active, completed }) => (
  <div
    className={cn(
      'border rounded-lg p-5 transition-all',
      completed
        ? 'border-green-200 bg-green-50/40'
        : active
        ? 'border-blue-200 bg-white shadow-sm'
        : 'border-slate-100 bg-slate-50 opacity-60 pointer-events-none select-none'
    )}
  >
    {children}
  </div>
);

// ─── Vitals Form ──────────────────────────────────────────────────────────────

interface VitalsState {
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  o2Saturation: string;
  weightLbs: string;
  heightFt: string;
  heightIn: string;
  painScale: number | null;
  respiratoryRate: string;
}

const VitalsForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [v, setV] = useState<VitalsState>({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    o2Saturation: '',
    weightLbs: '',
    heightFt: '',
    heightIn: '',
    painScale: null,
    respiratoryRate: '',
  });

  const bmi = (() => {
    const weight = parseFloat(v.weightLbs);
    const heightInches = parseFloat(v.heightFt) * 12 + parseFloat(v.heightIn);
    if (weight > 0 && heightInches > 0) {
      return Math.round((703 * weight) / (heightInches * heightInches) * 10) / 10;
    }
    return null;
  })();

  const isComplete =
    v.systolic && v.diastolic && v.heartRate && v.temperature &&
    v.o2Saturation && v.weightLbs && v.heightFt && v.heightIn &&
    v.painScale !== null && v.respiratoryRate;

  const field = (
    label: string,
    key: keyof VitalsState,
    placeholder: string,
    unit?: string
  ) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={v[key] as string}
          onChange={(e) => setV((prev) => ({ ...prev, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {unit && <span className="text-xs text-slate-500 whitespace-nowrap">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* BP */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Blood Pressure</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={v.systolic}
            onChange={(e) => setV((p) => ({ ...p, systolic: e.target.value }))}
            placeholder="120"
            className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400 font-bold">/</span>
          <input
            type="number"
            value={v.diastolic}
            onChange={(e) => setV((p) => ({ ...p, diastolic: e.target.value }))}
            placeholder="80"
            className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500 whitespace-nowrap">mmHg</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Heart Rate', 'heartRate', '72', 'bpm')}
        {field('Temperature', 'temperature', '98.6', '°F')}
        {field('O2 Saturation', 'o2Saturation', '98', '%')}
        {field('Respiratory Rate', 'respiratoryRate', '16', '/min')}
      </div>

      {/* Height / Weight / BMI */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1">Height</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={v.heightFt}
              onChange={(e) => setV((p) => ({ ...p, heightFt: e.target.value }))}
              placeholder="5"
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-500">ft</span>
            <input
              type="number"
              value={v.heightIn}
              onChange={(e) => setV((p) => ({ ...p, heightIn: e.target.value }))}
              placeholder="6"
              className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-500">in</span>
          </div>
        </div>
        {field('Weight', 'weightLbs', '155', 'lbs')}
      </div>

      {bmi !== null && (
        <div className="flex items-center gap-2 bg-blue-50 rounded-md px-3 py-2 text-sm">
          <span className="text-slate-600">BMI:</span>
          <span
            className={cn(
              'font-semibold',
              bmi < 18.5 ? 'text-amber-600' :
              bmi < 25 ? 'text-green-600' :
              bmi < 30 ? 'text-amber-600' : 'text-red-600'
            )}
          >
            {bmi}
          </span>
          <span className="text-slate-500 text-xs">
            ({bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'})
          </span>
        </div>
      )}

      {/* Pain Scale */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">
          Pain Scale — {v.painScale !== null ? `${v.painScale}/10` : 'Select'}
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setV((p) => ({ ...p, painScale: i }))}
              className={cn(
                'w-9 h-9 rounded-md text-sm font-medium border transition-colors',
                v.painScale === i
                  ? i === 0
                    ? 'bg-green-500 border-green-500 text-white'
                    : i <= 3
                    ? 'bg-yellow-400 border-yellow-400 text-white'
                    : i <= 6
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-red-600 border-red-600 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-blue-50'
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!isComplete}
        onClick={onComplete}
        className={cn(
          'w-full rounded-md py-2 text-sm font-medium transition-colors',
          isComplete
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        )}
      >
        Save Vitals
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const RoomingPage: React.FC = () => {
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState(MOCK_PATIENT.chiefComplaint);
  const [medChecked, setMedChecked] = useState<Record<string, boolean>>({});
  const [allergyConfirmed, setAllergyConfirmed] = useState(false);
  const [careGapDeclined, setCareGapDeclined] = useState<Record<string, boolean>>({});
  const [careGapAcknowledged, setCareGapAcknowledged] = useState(false);
  const [notified, setNotified] = useState(false);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPct = Math.round((completedCount / TOTAL_STEPS) * 100);
  const allDone = completedCount === TOTAL_STEPS;

  const markDone = (step: number) =>
    setCompleted((prev) => ({ ...prev, [step]: true }));

  const activeStep = (() => {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (!completed[i]) return i;
    }
    return TOTAL_STEPS + 1;
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Patient Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">{MOCK_PATIENT.name}</h1>
              <span className="text-xs bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded">
                {MOCK_PATIENT.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              DOB: {MOCK_PATIENT.dob} &nbsp;·&nbsp; Age {MOCK_PATIENT.age} &nbsp;·&nbsp;
              {MOCK_PATIENT.appointmentType} with {MOCK_PATIENT.provider} at {MOCK_PATIENT.scheduledTime}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Rooming Progress</p>
            <p className="text-sm font-semibold text-slate-800">{completedCount}/{TOTAL_STEPS} completed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-2">
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Step 1: Confirm Identity */}
        <SectionWrapper active={activeStep === 1} completed={!!completed[1]}>
          <SectionHeader
            step={1}
            icon={<User size={16} />}
            title="Confirm Identity"
            completed={!!completed[1]}
            active={activeStep === 1}
          />
          {!completed[1] && (
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={identityConfirmed}
                onChange={(e) => {
                  setIdentityConfirmed(e.target.checked);
                  if (e.target.checked) markDone(1);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                Patient identity confirmed — name{' '}
                <strong className="font-semibold">{MOCK_PATIENT.name}</strong> and DOB{' '}
                <strong className="font-semibold">{MOCK_PATIENT.dob}</strong> verbally verified.
              </span>
            </label>
          )}
        </SectionWrapper>

        {/* Step 2: Room Assignment */}
        <SectionWrapper active={activeStep === 2} completed={!!completed[2]}>
          <SectionHeader
            step={2}
            icon={<DoorOpen size={16} />}
            title="Room Assignment"
            completed={!!completed[2]}
            active={activeStep === 2}
          />
          {!completed[2] && (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-600">Select available room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Choose a room —</option>
                {MOCK_ROOMS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedRoom}
                onClick={() => markDone(2)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  selectedRoom
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                Assign Room
              </button>
            </div>
          )}
          {completed[2] && (
            <p className="text-sm text-green-700 font-medium">Assigned to {selectedRoom}</p>
          )}
        </SectionWrapper>

        {/* Step 3: Vitals */}
        <SectionWrapper active={activeStep === 3} completed={!!completed[3]}>
          <SectionHeader
            step={3}
            icon={<Activity size={16} />}
            title="Record Vitals"
            completed={!!completed[3]}
            active={activeStep === 3}
          />
          {!completed[3] && <VitalsForm onComplete={() => markDone(3)} />}
        </SectionWrapper>

        {/* Step 4: Chief Complaint */}
        <SectionWrapper active={activeStep === 4} completed={!!completed[4]}>
          <SectionHeader
            step={4}
            icon={<MessageSquare size={16} />}
            title="Review Chief Complaint"
            completed={!!completed[4]}
            active={activeStep === 4}
          />
          {!completed[4] && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">From patient intake — edit if needed:</p>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                type="button"
                onClick={() => markDone(4)}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Confirm Chief Complaint
              </button>
            </div>
          )}
        </SectionWrapper>

        {/* Step 5: Medication Reconciliation */}
        <SectionWrapper active={activeStep === 5} completed={!!completed[5]}>
          <SectionHeader
            step={5}
            icon={<Pill size={16} />}
            title="Medication Reconciliation"
            completed={!!completed[5]}
            active={activeStep === 5}
          />
          {!completed[5] && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Confirm each medication is current and patient is taking as directed:</p>
              <ul className="space-y-2">
                {MOCK_MEDICATIONS.map((med) => (
                  <li key={med.id}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!medChecked[med.id]}
                        onChange={(e) =>
                          setMedChecked((prev) => ({ ...prev, [med.id]: e.target.checked }))
                        }
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">
                        <span className="font-medium text-slate-800">{med.name}</span>{' '}
                        <span className="text-slate-500">{med.dose} — {med.frequency}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={Object.values(medChecked).filter(Boolean).length < MOCK_MEDICATIONS.length}
                onClick={() => markDone(5)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  Object.values(medChecked).filter(Boolean).length >= MOCK_MEDICATIONS.length
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                )}
              >
                Confirm All Medications
              </button>
            </div>
          )}
        </SectionWrapper>

        {/* Step 6: Allergy Confirmation */}
        <SectionWrapper active={activeStep === 6} completed={!!completed[6]}>
          <SectionHeader
            step={6}
            icon={<ShieldAlert size={16} />}
            title="Allergy Confirmation"
            completed={!!completed[6]}
            active={activeStep === 6}
          />
          {!completed[6] && (
            <div className="space-y-3">
              <ul className="space-y-2">
                {MOCK_ALLERGIES.map((allergy) => (
                  <li
                    key={allergy.id}
                    className="flex items-start gap-3 p-2.5 rounded-md bg-red-50 border border-red-100"
                  >
                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{allergy.substance}</p>
                      <p className="text-xs text-red-600">
                        {allergy.reaction} &nbsp;·&nbsp;
                        <span className="font-medium">{allergy.severity}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allergyConfirmed}
                  onChange={(e) => {
                    setAllergyConfirmed(e.target.checked);
                    if (e.target.checked) markDone(6);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  I have verbally confirmed the above allergies with the patient.
                </span>
              </label>
            </div>
          )}
        </SectionWrapper>

        {/* Step 7: Care Gaps Review */}
        <SectionWrapper active={activeStep === 7} completed={!!completed[7]}>
          <SectionHeader
            step={7}
            icon={<AlertCircle size={16} />}
            title="Care Gaps Review"
            completed={!!completed[7]}
            active={activeStep === 7}
          />
          {!completed[7] && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Review open care gaps with patient. Mark declined if patient refuses.
              </p>
              <ul className="space-y-3">
                {MOCK_CARE_GAPS.map((gap) => (
                  <li
                    key={gap.id}
                    className={cn(
                      'flex items-start justify-between gap-3 p-3 rounded-md border',
                      careGapDeclined[gap.id]
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : 'border-amber-200 bg-amber-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{gap.measure}</p>
                      <p className="text-xs text-slate-500">{gap.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCareGapDeclined((prev) => ({ ...prev, [gap.id]: !prev[gap.id] }))
                      }
                      className={cn(
                        'shrink-0 text-xs px-2.5 py-1 rounded-full font-medium border transition-colors',
                        careGapDeclined[gap.id]
                          ? 'bg-slate-200 text-slate-600 border-slate-300'
                          : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-100'
                      )}
                    >
                      {careGapDeclined[gap.id] ? 'Undo' : 'Patient Declined'}
                    </button>
                  </li>
                ))}
              </ul>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={careGapAcknowledged}
                  onChange={(e) => {
                    setCareGapAcknowledged(e.target.checked);
                    if (e.target.checked) markDone(7);
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Care gaps reviewed with patient.</span>
              </label>
            </div>
          )}
        </SectionWrapper>

        {/* Notify Provider */}
        <div className="pt-2">
          {!notified ? (
            <button
              type="button"
              disabled={!allDone}
              onClick={() => setNotified(true)}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-lg py-3 text-base font-semibold transition-all',
                allDone
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              <Bell size={18} />
              Notify Provider
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-3 rounded-lg py-4 bg-green-50 border border-green-200">
              <CheckCircle2 size={22} className="text-green-600" />
              <span className="text-green-800 font-semibold text-base">
                Provider notified — Patient ready in {selectedRoom}
              </span>
            </div>
          )}
          {!allDone && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Complete all {TOTAL_STEPS} steps to notify provider
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default RoomingPage;
