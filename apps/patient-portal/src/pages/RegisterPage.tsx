import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, Heart, User, MapPin, FileText } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Step1Data {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
}

interface Step2Data {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  ecName: string;
  ecRelationship: string;
  ecPhone: string;
}

interface Step3Data {
  insuranceName: string;
  memberId: string;
  groupNumber: string;
  hipaaConsent: boolean;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total, labels }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {Array.from({ length: total }).map((_, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400',
              ].join(' ')}
            >
              {done ? <Check className="w-4 h-4" /> : step}
            </div>
            <span className={`mt-1 text-xs hidden sm:block ${active ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
              {labels[i]}
            </span>
          </div>
          {step < total && (
            <div className={`w-12 sm:w-20 h-0.5 mb-4 mx-1 transition-colors ${done ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

const Field: React.FC<FieldProps> = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const inputClass =
  'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

// ---------------------------------------------------------------------------
// Step 1: Personal Info
// ---------------------------------------------------------------------------

interface Step1Props {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const set = (key: keyof Step1Data) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [key]: e.target.value });

  const valid = data.firstName && data.lastName && data.email && data.phone && data.dob;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" required>
          <input className={inputClass} placeholder="Jane" value={data.firstName} onChange={set('firstName')} />
        </Field>
        <Field label="Last Name" required>
          <input className={inputClass} placeholder="Doe" value={data.lastName} onChange={set('lastName')} />
        </Field>
      </div>
      <Field label="Email Address" required>
        <input className={inputClass} type="email" placeholder="jane.doe@email.com" value={data.email} onChange={set('email')} />
      </Field>
      <Field label="Phone Number" required hint="Used for appointment reminders via SMS">
        <input className={inputClass} type="tel" placeholder="(555) 000-0000" value={data.phone} onChange={set('phone')} />
      </Field>
      <Field label="Date of Birth" required>
        <input className={inputClass} type="date" value={data.dob} onChange={set('dob')} />
      </Field>
      <button
        onClick={onNext}
        disabled={!valid}
        className="w-full mt-2 py-3 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step 2: Address + Emergency Contact
// ---------------------------------------------------------------------------

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

interface Step2Props {
  data: Step2Data;
  onChange: (d: Step2Data) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2: React.FC<Step2Props> = ({ data, onChange, onNext, onBack }) => {
  const set = (key: keyof Step2Data) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [key]: e.target.value });

  const valid = data.addressLine1 && data.city && data.state && data.zip && data.ecName && data.ecPhone;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Home Address
        </p>
        <div className="space-y-3">
          <Field label="Street Address" required>
            <input className={inputClass} placeholder="123 Main St" value={data.addressLine1} onChange={set('addressLine1')} />
          </Field>
          <Field label="Apt / Suite">
            <input className={inputClass} placeholder="Apt 4B" value={data.addressLine2} onChange={set('addressLine2')} />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="City" required>
              <input className={inputClass} placeholder="Springfield" value={data.city} onChange={set('city')} />
            </Field>
            <Field label="State" required>
              <select className={inputClass} value={data.state} onChange={set('state')}>
                <option value="">State</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP" required>
              <input className={inputClass} placeholder="62701" value={data.zip} onChange={set('zip')} />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" /> Emergency Contact
        </p>
        <div className="space-y-3">
          <Field label="Full Name" required>
            <input className={inputClass} placeholder="John Doe" value={data.ecName} onChange={set('ecName')} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Relationship">
              <select className={inputClass} value={data.ecRelationship} onChange={set('ecRelationship')}>
                <option value="">Select…</option>
                {['Spouse','Partner','Parent','Sibling','Child','Friend','Other'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Phone Number" required>
              <input className={inputClass} type="tel" placeholder="(555) 000-0000" value={data.ecPhone} onChange={set('ecPhone')} />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Step 3: Insurance + HIPAA
// ---------------------------------------------------------------------------

interface Step3Props {
  data: Step3Data;
  onChange: (d: Step3Data) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

const Step3: React.FC<Step3Props> = ({ data, onChange, onSubmit, onBack, loading }) => {
  const set = (key: keyof Omit<Step3Data, 'hipaaConsent'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...data, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Insurance (Optional)
        </p>
        <div className="space-y-3">
          <Field label="Insurance Company">
            <input className={inputClass} placeholder="e.g. Blue Cross Blue Shield" value={data.insuranceName} onChange={set('insuranceName')} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Member ID">
              <input className={inputClass} placeholder="ABC123456" value={data.memberId} onChange={set('memberId')} />
            </Field>
            <Field label="Group Number">
              <input className={inputClass} placeholder="G-78901" value={data.groupNumber} onChange={set('groupNumber')} />
            </Field>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 leading-relaxed max-h-36 overflow-y-auto">
        <p className="font-semibold text-slate-800 mb-1">HIPAA Notice of Privacy Practices</p>
        <p>
          This notice describes how medical information about you may be used and disclosed and how you can get access
          to this information. Your health information may be used to provide treatment, obtain payment, and support
          healthcare operations. We are required by law to maintain the privacy of your protected health information
          and to provide you with notice of our legal duties and privacy practices.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.hipaaConsent}
          onChange={(e) => onChange({ ...data, hipaaConsent: e.target.checked })}
          className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
        />
        <span className="text-sm text-slate-700">
          I have read and agree to the{' '}
          <span className="text-blue-600 underline cursor-pointer">HIPAA Notice of Privacy Practices</span>.
          <span className="text-red-500 ml-0.5">*</span>
        </span>
      </label>

      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!data.hipaaConsent || loading}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>Create Account <Check className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Success
// ---------------------------------------------------------------------------

const SuccessBanner: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
      <Check className="w-8 h-8 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
    <p className="text-slate-500 mb-6">
      Check your email for a verification link, then sign in to access your patient portal.
    </p>
    <button
      onClick={onLogin}
      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
    >
      Go to Sign In
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({ firstName: '', lastName: '', email: '', phone: '', dob: '' });
  const [step2, setStep2] = useState<Step2Data>({ addressLine1: '', addressLine2: '', city: '', state: '', zip: '', ecName: '', ecRelationship: '', ecPhone: '' });
  const [step3, setStep3] = useState<Step3Data>({ insuranceName: '', memberId: '', groupNumber: '', hipaaConsent: false });

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1500);
  };

  const stepLabels = ['Personal Info', 'Address', 'Insurance'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-start px-4 py-8">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 self-start sm:self-center">
        <Heart className="w-6 h-6 text-blue-600" />
        <span className="text-xl font-bold text-blue-600">Primus Health</span>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        {done ? (
          <SuccessBanner onLogin={() => navigate('/login')} />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
              <p className="text-sm text-slate-500 mt-1">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-blue-600 font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </div>

            <StepIndicator current={step} total={3} labels={stepLabels} />

            {step === 1 && <Step1 data={step1} onChange={setStep1} onNext={() => setStep(2)} />}
            {step === 2 && <Step2 data={step2} onChange={setStep2} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && (
              <Step3
                data={step3}
                onChange={setStep3}
                onSubmit={handleSubmit}
                onBack={() => setStep(2)}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
