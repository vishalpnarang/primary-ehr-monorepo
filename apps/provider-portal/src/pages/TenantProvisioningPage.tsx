import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Server, Plug2, CheckCircle,
  ChevronRight, Globe, Shield, Database, Mail,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: 'Organization' },
  { num: 2, label: 'Technical Setup' },
  { num: 3, label: 'Integrations' },
  { num: 4, label: 'Review & Provision' },
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const MODULES = [
  'Scheduling', 'Patient Registration', 'EHR / Charting', 'e-Prescribing',
  'Lab Orders', 'Billing & RCM', 'Patient Portal', 'Telehealth',
  'Inbox & Messaging', 'Reports & Analytics',
];

// ─── Stepper bar ─────────────────────────────────────────────────────────────

const Stepper = ({ current }: { current: number }) => (
  <div className="flex items-center gap-0 mb-6">
    {STEPS.map((s, i) => (
      <div key={s.num} className="flex items-center flex-1">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
            current > s.num ? 'bg-emerald-500 text-white' :
            current === s.num ? 'bg-blue-600 text-white' :
            'bg-slate-200 text-slate-500'
          )}>
            {current > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
          </div>
          <span className={cn(
            'text-xs font-medium whitespace-nowrap hidden sm:block',
            current >= s.num ? 'text-gray-900' : 'text-gray-400'
          )}>{s.label}</span>
        </div>
        {i < STEPS.length - 1 ? (
          <div className={cn('flex-1 h-px mx-3', current > s.num ? 'bg-emerald-400' : 'bg-slate-200')} />
        ) : null}
      </div>
    ))}
  </div>
);

// ─── Form field helper ───────────────────────────────────────────────────────

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}{required ? <span className="text-red-500 ml-0.5">*</span> : null}
    </label>
    {children}
  </div>
);

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// ─── Main component ──────────────────────────────────────────────────────────

const TenantProvisioningPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 — Org
  const [orgName, setOrgName] = useState('');
  const [orgNpi, setOrgNpi] = useState('');
  const [orgTaxId, setOrgTaxId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgCity, setOrgCity] = useState('');
  const [orgState, setOrgState] = useState('');
  const [orgZip, setOrgZip] = useState('');

  // Step 2 — Technical
  const [subdomain, setSubdomain] = useState('');
  const [dataRegion, setDataRegion] = useState('us-east-1');
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set(MODULES));

  // Step 3 — Integrations
  const [questKey, setQuestKey] = useState('');
  const [surescriptsKey, setSurescriptsKey] = useState('');
  const [availityKey, setAvailityKey] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [stripeKey, setStripeKey] = useState('');
  const [usePlatformTwilio, setUsePlatformTwilio] = useState(true);
  const [usePlatformStripe, setUsePlatformStripe] = useState(true);

  // Provisioning
  const [provisioning, setProvisioning] = useState(false);
  const [provisioningStep, setProvisioningStep] = useState(0);
  const [done, setDone] = useState(false);

  const toggleModule = (m: string) =>
    setEnabledModules((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });

  const canProceed = () => {
    if (step === 1) return orgName && orgNpi && adminEmail;
    if (step === 2) return subdomain;
    return true;
  };

  const handleProvision = () => {
    setProvisioning(true);
    const provSteps = ['Creating Keycloak realm...', 'Provisioning database schema...', 'Creating admin user...', 'Sending welcome email...'];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setProvisioningStep(i);
      if (i >= provSteps.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 800);
      }
    }, 1200);
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tenant Provisioned</h2>
        <p className="text-sm text-gray-500 mb-2">{orgName} is ready at <strong>{subdomain}.primusehr.com</strong></p>
        <p className="text-xs text-gray-400 mb-6">Welcome email sent to {adminEmail}</p>
        <div className="flex justify-center gap-3">
          <button onClick={() => navigate('/settings')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Back to Settings
          </button>
          <button onClick={() => { setDone(false); setProvisioning(false); setStep(1); setProvisioningStep(0); setOrgName(''); setSubdomain(''); setAdminEmail(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            Provision Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/settings')} className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-400">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">New Tenant</h1>
          <p className="text-xs text-gray-500">Provision a new clinic organization</p>
        </div>
      </div>

      <Stepper current={step} />

      {/* Step 1 — Organization */}
      {step === 1 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Organization Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Practice Name" required>
              <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g., Sunrise Family Medicine" className={inputCls} />
            </Field>
            <Field label="Group NPI" required>
              <input value={orgNpi} onChange={(e) => setOrgNpi(e.target.value)} placeholder="10-digit NPI" className={cn(inputCls, 'font-mono')} maxLength={10} />
            </Field>
            <Field label="Tax ID (EIN)">
              <input value={orgTaxId} onChange={(e) => setOrgTaxId(e.target.value)} placeholder="XX-XXXXXXX" className={cn(inputCls, 'font-mono')} />
            </Field>
            <Field label="Primary Admin Email" required>
              <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@clinic.com" type="email" className={inputCls} />
            </Field>
            <Field label="Phone">
              <input value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} placeholder="(555) 000-0000" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <Field label="Address">
              <input value={orgAddress} onChange={(e) => setOrgAddress(e.target.value)} placeholder="Street address" className={inputCls} />
            </Field>
            <Field label="City">
              <input value={orgCity} onChange={(e) => setOrgCity(e.target.value)} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="State">
                <select value={orgState} onChange={(e) => setOrgState(e.target.value)} className={inputCls}>
                  <option value="">—</option>
                  {US_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="ZIP">
                <input value={orgZip} onChange={(e) => setOrgZip(e.target.value)} className={cn(inputCls, 'font-mono')} maxLength={5} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Technical Setup */}
      {step === 2 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Technical Setup</h2>
          </div>
          <Field label="Subdomain" required>
            <div className="flex items-center gap-0">
              <input value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="clinic-name" className={cn(inputCls, 'rounded-r-none border-r-0 font-mono')} />
              <span className="bg-slate-50 border border-slate-200 rounded-r-lg px-3 py-2 text-sm text-gray-500 whitespace-nowrap">.primusehr.com</span>
            </div>
          </Field>
          <Field label="Data Region">
            <div className="flex gap-3">
              {[{ v: 'us-east-1', l: 'US East (Virginia)' }, { v: 'us-west-2', l: 'US West (Oregon)' }].map(r => (
                <button key={r.v} onClick={() => setDataRegion(r.v)} className={cn('flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors', dataRegion === r.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-gray-600 hover:bg-slate-50')}>
                  <Database className="w-4 h-4" />
                  {r.l}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Feature Set">
            <p className="text-xs text-gray-400 mb-2">Select which modules to enable for this tenant</p>
            <div className="grid grid-cols-2 gap-2">
              {MODULES.map(m => (
                <button key={m} onClick={() => toggleModule(m)} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors text-left', enabledModules.has(m) ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-gray-500 hover:bg-slate-50')}>
                  <div className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0', enabledModules.has(m) ? 'bg-blue-600 border-blue-600' : 'border-slate-300')}>
                    {enabledModules.has(m) ? <CheckCircle className="w-3 h-3 text-white" /> : null}
                  </div>
                  {m}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {/* Step 3 — Integrations */}
      {step === 3 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Plug2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Integration Credentials</h2>
          </div>
          <p className="text-xs text-gray-400">Enter API keys for third-party integrations. Leave blank to configure later.</p>
          <div className="space-y-3">
            <Field label="Quest Diagnostics API Key">
              <input value={questKey} onChange={(e) => setQuestKey(e.target.value)} placeholder="quest_api_key_..." className={cn(inputCls, 'font-mono text-xs')} />
            </Field>
            <Field label="ScriptSure / Surescripts Credentials">
              <input value={surescriptsKey} onChange={(e) => setSurescriptsKey(e.target.value)} placeholder="surescripts_..." className={cn(inputCls, 'font-mono text-xs')} />
            </Field>
            <Field label="Availity Clearinghouse API Key">
              <input value={availityKey} onChange={(e) => setAvailityKey(e.target.value)} placeholder="availity_..." className={cn(inputCls, 'font-mono text-xs')} />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Twilio SMS</label>
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="checkbox" checked={usePlatformTwilio} onChange={() => setUsePlatformTwilio(!usePlatformTwilio)} className="rounded" />
                  Use platform shared
                </label>
              </div>
              {!usePlatformTwilio ? (
                <input value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} placeholder="Twilio Account SID" className={cn(inputCls, 'font-mono text-xs')} />
              ) : (
                <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">Using platform Twilio account</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-700">Stripe Payments</label>
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input type="checkbox" checked={usePlatformStripe} onChange={() => setUsePlatformStripe(!usePlatformStripe)} className="rounded" />
                  Use platform shared
                </label>
              </div>
              {!usePlatformStripe ? (
                <input value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} placeholder="sk_live_..." className={cn(inputCls, 'font-mono text-xs')} />
              ) : (
                <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">Using platform Stripe account</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — Review & Provision */}
      {step === 4 && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" /> Review Configuration
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div><span className="text-gray-400 uppercase font-medium">Practice Name</span><p className="text-gray-900 font-medium mt-0.5">{orgName || '—'}</p></div>
              <div><span className="text-gray-400 uppercase font-medium">NPI</span><p className="text-gray-900 font-mono font-medium mt-0.5">{orgNpi || '—'}</p></div>
              <div><span className="text-gray-400 uppercase font-medium">Tax ID</span><p className="text-gray-900 font-mono font-medium mt-0.5">{orgTaxId || '—'}</p></div>
              <div><span className="text-gray-400 uppercase font-medium">Admin Email</span><p className="text-gray-900 font-medium mt-0.5">{adminEmail || '—'}</p></div>
              <div><span className="text-gray-400 uppercase font-medium">Subdomain</span><p className="text-blue-600 font-mono font-medium mt-0.5">{subdomain || '—'}.primusehr.com</p></div>
              <div><span className="text-gray-400 uppercase font-medium">Data Region</span><p className="text-gray-900 font-medium mt-0.5">{dataRegion === 'us-east-1' ? 'US East (Virginia)' : 'US West (Oregon)'}</p></div>
              <div className="col-span-2"><span className="text-gray-400 uppercase font-medium">Enabled Modules</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {[...enabledModules].map(m => <span key={m} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{m}</span>)}
                </div>
              </div>
              <div className="col-span-2"><span className="text-gray-400 uppercase font-medium">Integrations</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {questKey ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Quest Labs</span> : null}
                  {surescriptsKey ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">ScriptSure</span> : null}
                  {availityKey ? <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Availity</span> : null}
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Twilio {usePlatformTwilio ? '(shared)' : ''}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Stripe {usePlatformStripe ? '(shared)' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Provisioning progress */}
          {provisioning && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Provisioning...</h3>
              <div className="space-y-2">
                {['Creating Keycloak realm with default roles', 'Provisioning database schema', 'Creating Tenant Admin user', 'Sending welcome email'].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    {provisioningStep > i ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : provisioningStep === i ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span className={cn('text-xs', provisioningStep > i ? 'text-emerald-600 font-medium' : provisioningStep === i ? 'text-blue-600 font-medium' : 'text-gray-400')}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 bg-white border border-slate-200 hover:bg-slate-50')}
        >
          Back
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className={cn('px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1', canProceed() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : !provisioning ? (
          <button onClick={handleProvision} className="px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Provision Tenant
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TenantProvisioningPage;
