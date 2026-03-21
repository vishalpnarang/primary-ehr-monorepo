import { useState } from 'react';
import {
  Terminal,
  Users,
  Play,
  Globe,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Server,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

interface CodeBlockProps {
  code: string;
  lang?: string;
}

// ─── Code block with copy button ──────────────────────────────────────────────
const CodeBlock = ({ code, lang = 'bash' }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-700 my-3">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2 border-b border-slate-700">
        <span className="text-slate-400 text-xs font-mono">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-slate-900 text-slate-100 px-4 py-4 overflow-x-auto text-sm font-mono leading-relaxed whitespace-pre">
        {code}
      </pre>
    </div>
  );
};

// ─── Collapsible section ──────────────────────────────────────────────────────
const Collapsible = ({ title, defaultOpen = false, children }: CollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="font-semibold text-slate-900">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>
      {open && <div className="px-5 py-4 bg-white">{children}</div>}
    </div>
  );
};

// ─── Step list ────────────────────────────────────────────────────────────────
const StepList = ({ steps }: { steps: { title: string; desc: string }[] }) => (
  <ol className="space-y-3">
    {steps.map((step, i) => (
      <li key={i} className="flex items-start gap-3">
        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
          {i + 1}
        </div>
        <div>
          <div className="font-semibold text-slate-900 text-sm">{step.title}</div>
          <div className="text-slate-600 text-sm leading-relaxed">{step.desc}</div>
        </div>
      </li>
    ))}
  </ol>
);

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
      <Icon className="w-5 h-5 text-blue-600" />
    </div>
    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
  </div>
);

// ─── 1. Quick Start ───────────────────────────────────────────────────────────
const QuickStart = () => (
  <section id="quickstart" className="mb-12">
    <SectionHeader icon={Terminal} title="Quick Start" />
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
      <p className="text-blue-800 text-sm font-medium">
        4 commands to run the full Primus stack locally.
      </p>
    </div>
    <CodeBlock
      code={`# 1. Clone and install
git clone https://github.com/thinkitive/primus-ehr.git
cd primus-ehr && npm install

# 2. Start the provider portal (port 5173)
cd apps/provider-portal && npm run dev

# 3. Start the patient portal (port 5174)
cd apps/patient-portal && npm run dev

# 4. (Optional) Start mock API server (port 3001)
cd apps/mock-api && npm run dev`}
    />
    <p className="text-slate-500 text-sm">
      No backend required for Phase 0. All data is served from mock JSON files.
    </p>
  </section>
);

// ─── 2. Login Credentials ─────────────────────────────────────────────────────
const credentials = [
  { email: 'superadmin@thinkitive.com', password: 'Admin@1234', role: 'Super Admin', test: 'Tenant management, global settings' },
  { email: 'admin@primusdemo.com', password: 'Admin@1234', role: 'Tenant Admin', test: 'Org settings, user management, billing' },
  { email: 'manager@primusdemo.com', password: 'Admin@1234', role: 'Practice Admin', test: 'Staff schedules, daily ops, reports' },
  { email: 'dr.smith@primusdemo.com', password: 'Doctor@1234', role: 'Provider (MD)', test: 'Patient chart, SOAP notes, orders, Rx' },
  { email: 'nurse.jones@primusdemo.com', password: 'Nurse@1234', role: 'Nurse / MA', test: 'Rooming, vitals, medication reconciliation' },
  { email: 'frontdesk@primusdemo.com', password: 'Desk@1234', role: 'Front Desk', test: 'Scheduling, check-in, patient registration' },
  { email: 'billing@primusdemo.com', password: 'Billing@1234', role: 'Billing Staff', test: 'Claims, ERA, denials, RCM dashboard' },
  { email: 'patient@example.com', password: 'Patient@1234', role: 'Patient', test: 'Patient portal — labs, messages, booking' },
];

const CredentialsSection = () => (
  <section id="credentials" className="mb-12">
    <SectionHeader icon={Users} title="Login Credentials" />
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Email</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Password</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">Role</th>
            <th className="text-left px-4 py-3 font-semibold text-slate-700">What to Test</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map((cred, i) => (
            <tr key={cred.email} className={`border-b border-slate-100 ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
              <td className="px-4 py-3 font-mono text-xs text-blue-700">{cred.email}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{cred.password}</td>
              <td className="px-4 py-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {cred.role}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs">{cred.test}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="text-slate-500 text-xs mt-2">
      All users belong to tenant: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">TEN-00001</span> (Primus Demo Clinic). Super Admin can switch tenants from the top nav.
    </p>
  </section>
);

// ─── 3. Demo Flows ────────────────────────────────────────────────────────────
const demoFlowA = [
  { title: 'Log in as Provider', desc: 'Use dr.smith@primusdemo.com / Doctor@1234 at localhost:5173' },
  { title: 'Review the Dashboard', desc: 'Check today\'s appointments, pending tasks, and inbox alerts' },
  { title: 'Open a Patient Chart', desc: 'Click on "Sarah Johnson" in today\'s schedule. Observe sticky header with allergies and risk flags.' },
  { title: 'Try the Command Palette', desc: 'Press Ctrl+K. Search for a patient by name. Navigate directly to their chart.' },
  { title: 'Start a New Encounter', desc: 'Click "New Encounter" or press Ctrl+N. Select visit type: Office Visit – Established.' },
  { title: 'Document Vitals', desc: 'Enter BP 128/82, HR 74, Temp 98.6°F, Weight 165 lbs, O2 Sat 98%.' },
  { title: 'Write a SOAP Note', desc: 'In the Assessment field, type .hyp and watch the smart phrase expand to a hypertension template.' },
  { title: 'Add a Diagnosis', desc: 'Search ICD-10 "I10" (Essential hypertension). Add to problem list.' },
  { title: 'Order a Lab', desc: 'Click Orders → Lab → search "BMP". Select Basic Metabolic Panel, route to Quest.' },
  { title: 'Sign the Encounter', desc: 'Click Sign & Lock. Observe the encounter moves to Signed status and triggers billing workflow.' },
];

const demoFlowB = [
  { title: 'Log in as Front Desk', desc: 'Use frontdesk@primusdemo.com / Desk@1234' },
  { title: 'Review Today\'s Schedule', desc: 'Navigate to Schedule. View the day grid with all providers.' },
  { title: 'Register a New Patient', desc: 'Click New Patient. Fill demographics, insurance, and emergency contact.' },
  { title: 'Book an Appointment', desc: 'On the schedule, click an open slot. Select patient, visit type, and provider.' },
  { title: 'Check-in a Patient', desc: 'Click the 9am appointment → Check In. Verify insurance, collect copay placeholder.' },
  { title: 'Print Superbill', desc: 'From the checked-in appointment, click Print Superbill.' },
  { title: 'Add a Task', desc: 'Create a task for the provider: "Patient requesting referral for cardiology."' },
];

const demoFlowC = [
  { title: 'Open Patient Portal', desc: 'Navigate to localhost:5174. Log in as patient@example.com / Patient@1234' },
  { title: 'View Lab Results', desc: 'Click "My Health" → Lab Results. Review BMP from last visit with trend indicators.' },
  { title: 'Send a Message', desc: 'Click Messages → New Message. Send a question to Dr. Smith about medication.' },
  { title: 'Book an Appointment', desc: 'Click Schedule Appointment. Select provider, visit type, and preferred time.' },
  { title: 'Join Telehealth', desc: 'From the upcoming appointment card, click Join Video Visit (Jitsi in dev, Chime in prod).' },
];

const demoFlowD = [
  { title: 'Log in as Billing Staff', desc: 'Use billing@primusdemo.com / Billing@1234' },
  { title: 'Review Claim Queue', desc: 'Navigate to Billing → Claims. Review claims pending submission.' },
  { title: 'Post an ERA', desc: 'Click ERA Posting → Upload ERA file. Watch automated posting against open claims.' },
  { title: 'Work a Denial', desc: 'In Denials tab, open a CO-4 denial. Add corrected procedure code and resubmit.' },
];

const demoFlowE = [
  { title: 'Log in as Tenant Admin', desc: 'Use admin@primusdemo.com / Admin@1234' },
  { title: 'Manage Users', desc: 'Settings → Users → Add User. Create a new provider with Provider role.' },
  { title: 'Configure Locations', desc: 'Settings → Locations. View all 3 clinic locations with their tax IDs and NPIs.' },
  { title: 'Review Reports', desc: 'Reports → Provider Productivity. Review encounters per provider, avg visit duration.' },
  { title: 'Switch to Super Admin', desc: 'Log out. Log in as superadmin@thinkitive.com. View tenant management dashboard.' },
];

const DemoFlows = () => (
  <section id="demo-flows" className="mb-12">
    <SectionHeader icon={Play} title="Demo Flows" />
    <Collapsible title="Flow A — Provider Workflow (10 steps)" defaultOpen>
      <StepList steps={demoFlowA} />
    </Collapsible>
    <Collapsible title="Flow B — Front Desk Workflow (7 steps)">
      <StepList steps={demoFlowB} />
    </Collapsible>
    <Collapsible title="Flow C — Patient Portal (5 steps)">
      <StepList steps={demoFlowC} />
    </Collapsible>
    <Collapsible title="Flow D — Billing & RCM (4 steps)">
      <StepList steps={demoFlowD} />
    </Collapsible>
    <Collapsible title="Flow E — Admin & Tenant Management (5 steps)">
      <StepList steps={demoFlowE} />
    </Collapsible>
  </section>
);

// ─── 4. API Testing ───────────────────────────────────────────────────────────
const ApiTesting = () => (
  <section id="api-testing" className="mb-12">
    <SectionHeader icon={Terminal} title="API Testing" />
    <p className="text-slate-600 text-sm mb-4">
      Phase 0 uses mock data only. These examples show the API contract for when
      the Spring Boot backend is live (Phase 2+).
    </p>
    <Collapsible title="Generate Access Token (Keycloak)">
      <CodeBlock
        code={`curl -X POST http://localhost:8080/realms/primus/protocol/openid-connect/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=password" \\
  -d "client_id=primus-provider-portal" \\
  -d "username=dr.smith@primusdemo.com" \\
  -d "password=Doctor@1234"

# Response: { "access_token": "eyJ...", "expires_in": 3600 }`}
      />
    </Collapsible>
    <Collapsible title="Get Patient List">
      <CodeBlock
        code={`curl -X GET http://localhost:8090/api/v1/patients \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "X-Tenant-ID: TEN-00001"

# Query params: ?page=0&size=20&search=johnson&status=active`}
      />
    </Collapsible>
    <Collapsible title="Get Patient Chart">
      <CodeBlock
        code={`curl -X GET http://localhost:8090/api/v1/patients/PAT-00001/chart \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "X-Tenant-ID: TEN-00001"

# Returns: demographics, problems, medications, allergies, encounters`}
      />
    </Collapsible>
    <Collapsible title="Create Encounter">
      <CodeBlock
        code={`curl -X POST http://localhost:8090/api/v1/encounters \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "X-Tenant-ID: TEN-00001" \\
  -H "Content-Type: application/json" \\
  -d '{
    "patientId": "PAT-00001",
    "providerId": "PRV-00001",
    "appointmentId": "APT-00001",
    "visitType": "OFFICE_VISIT_ESTABLISHED",
    "scheduledAt": "2026-03-21T14:00:00Z"
  }'`}
      />
    </Collapsible>
    <Collapsible title="Submit Claim">
      <CodeBlock
        code={`curl -X POST http://localhost:8090/api/v1/billing/claims \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "X-Tenant-ID: TEN-00001" \\
  -H "Content-Type: application/json" \\
  -d '{
    "encounterId": "ENC-00001",
    "diagnoses": ["I10", "Z00.00"],
    "procedures": [{ "code": "99213", "modifier": null, "units": 1 }],
    "clearinghouse": "AVAILITY"
  }'`}
      />
    </Collapsible>
  </section>
);

// ─── 5. Key URLs ──────────────────────────────────────────────────────────────
const services = [
  { name: 'Provider Portal', url: 'http://localhost:5173', desc: 'Main EHR interface (React + Vite)', port: '5173' },
  { name: 'Patient Portal', url: 'http://localhost:5174', desc: 'Patient-facing portal (React + Vite)', port: '5174' },
  { name: 'Backend API', url: 'http://localhost:8090', desc: 'Spring Boot REST API (Phase 2+)', port: '8090' },
  { name: 'Keycloak Admin', url: 'http://localhost:8080', desc: 'Identity & access management', port: '8080' },
  { name: 'Jitsi Meet', url: 'http://localhost:8443', desc: 'Local video for telehealth dev', port: '8443' },
  { name: 'API Docs (Swagger)', url: 'http://localhost:8090/swagger-ui.html', desc: 'OpenAPI spec browser', port: '8090' },
];

const KeyUrls = () => (
  <section id="key-urls" className="mb-12">
    <SectionHeader icon={Globe} title="Key URLs" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {services.map((svc) => (
        <div key={svc.name} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-900 text-sm">{svc.name}</span>
            </div>
            <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-0.5 rounded">
              :{svc.port}
            </span>
          </div>
          <a
            href={svc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-xs font-mono hover:underline block mb-1"
          >
            {svc.url}
          </a>
          <p className="text-slate-500 text-xs">{svc.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── 6. Troubleshooting ───────────────────────────────────────────────────────
const faqs = [
  {
    q: 'Provider portal shows blank page on load',
    a: 'Check that Node 20+ is installed. Run `npm install` in both the root and `apps/provider-portal`. Delete node_modules and reinstall if the issue persists.',
  },
  {
    q: 'Port 5173 already in use',
    a: 'Run `lsof -ti:5173 | xargs kill -9` to free the port, then restart the dev server.',
  },
  {
    q: 'Mock data not loading / empty lists',
    a: 'Ensure you\'re logged in with a valid mock user. Check `apps/provider-portal/src/mocks/` — all mock data is in JSON files there.',
  },
  {
    q: 'Command palette (Ctrl+K) not opening',
    a: 'Make sure focus is on the main app window, not a modal or input field. Try clicking the app background first.',
  },
  {
    q: 'Role switcher not showing expected role',
    a: 'The role switcher is in the top-right user menu. If it\'s missing, clear sessionStorage and log in again.',
  },
  {
    q: 'Telehealth join button not working',
    a: 'In Phase 0, the join button opens a placeholder. For local video testing, start Jitsi with `docker-compose up jitsi` from the infra directory.',
  },
  {
    q: 'TypeScript errors on npm run build',
    a: 'Run `npm run type-check` to see all errors. Most are from unused imports. Run `npm run lint:fix` to auto-fix safe issues.',
  },
  {
    q: 'Tailwind styles not applying',
    a: 'Ensure `tailwind.config.js` includes `./src/**/*.{ts,tsx}` in the content array. Restart the dev server after config changes.',
  },
];

const Troubleshooting = () => (
  <section id="troubleshooting" className="mb-12">
    <SectionHeader icon={AlertTriangle} title="Troubleshooting" />
    <div className="space-y-3">
      {faqs.map((faq) => (
        <Collapsible key={faq.q} title={faq.q}>
          <p className="text-slate-700 text-sm leading-relaxed">{faq.a}</p>
        </Collapsible>
      ))}
    </div>
  </section>
);

// ─── Page nav (sticky sidebar) ────────────────────────────────────────────────
const navItems = [
  { id: 'quickstart', label: 'Quick Start' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'demo-flows', label: 'Demo Flows' },
  { id: 'api-testing', label: 'API Testing' },
  { id: 'key-urls', label: 'Key URLs' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
const DemoGuidePage = () => (
  <div className="min-h-screen bg-white">
    {/* Top bar */}
    <div className="sticky top-0 z-40 bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-700">
      <div className="flex items-center gap-3">
        <Terminal className="w-5 h-5 text-blue-400" />
        <span className="font-bold text-sm">Primus EHR — Demo &amp; Testing Guide</span>
        <span className="bg-blue-600 text-xs px-2 py-0.5 rounded font-semibold">Internal</span>
      </div>
      <span className="text-slate-400 text-xs">Phase 0 · UI Simulation</span>
    </div>

    <div className="flex max-w-6xl mx-auto">
      {/* Sidebar nav */}
      <nav className="hidden md:block w-52 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto py-8 px-4 border-r border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Contents</p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className="block text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-1 px-6 md:px-10 py-10 min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Demo &amp; Testing Guide</h1>
          <p className="text-slate-600 leading-relaxed">
            Everything you need to run, demo, and test the Primus EHR provider portal.
            All flows use mock data — no backend required in Phase 0.
          </p>
        </div>
        <QuickStart />
        <CredentialsSection />
        <DemoFlows />
        <ApiTesting />
        <KeyUrls />
        <Troubleshooting />
      </main>
    </div>
  </div>
);

export default DemoGuidePage;
