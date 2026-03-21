import {
  TrendingUp,
  Users,
  Zap,
  Calendar,
  FlaskConical,
  CreditCard,
  Video,
  Smartphone,
  Inbox,
  BarChart3,
  Shield,
  Building2,
  FileText,
  Server,
  Database,
  Lock,
  Cloud,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Layers,
  Code2,
  Globe,
} from 'lucide-react';

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({
  id,
  dark,
  children,
  className = '',
}: {
  id: string;
  dark?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    id={id}
    className={`min-h-screen w-full flex flex-col justify-center px-6 py-20 snap-start ${
      dark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
        : 'bg-white text-slate-900'
    } ${className}`}
  >
    {children}
  </section>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
    {children}
  </span>
);

const SectionTitle = ({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) => (
  <h2
    className={`text-4xl md:text-5xl font-bold mb-4 ${dark ? 'text-white' : 'text-slate-900'}`}
  >
    {children}
  </h2>
);

const Divider = ({ dark }: { dark?: boolean }) => (
  <div
    className={`w-16 h-1 rounded-full mb-8 ${dark ? 'bg-blue-400' : 'bg-blue-600'}`}
  />
);

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
const HeroSection = () => (
  <Section id="hero" dark>
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">
          Thinkitive Technologies — Internal
        </span>
      </div>
      <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-4">
        Primus EHR
      </h1>
      <p className="text-2xl md:text-3xl text-blue-300 font-light mb-6">
        Modern EHR Platform for Primary Care
      </p>
      <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-10">
        A multi-tenant SaaS Electronic Health Record platform purpose-built for
        US primary care clinics. Replacing legacy EMRs — starting with legacy EHR
        at Primus Demo Clinic — then scaling to a full SaaS offering.
      </p>
      <div className="flex flex-wrap gap-4">
        {[
          { label: '268 Files', sub: 'codebase' },
          { label: '32,700 Lines', sub: 'of TypeScript/React' },
          { label: '31 Pages', sub: 'built' },
          { label: 'Phase 0', sub: 'UI complete' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 border border-white/10"
          >
            <div className="text-white font-bold text-lg">{s.label}</div>
            <div className="text-slate-400 text-xs">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-slate-500 text-sm">Scroll to explore ↓</div>
    </div>
  </Section>
);

// ─── 2. Market Opportunity ────────────────────────────────────────────────────
const MarketSection = () => (
  <Section id="market">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Market Opportunity</Badge>
      <SectionTitle>A $40B Market in Pain</SectionTitle>
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            stat: '$40B',
            label: 'US EHR Market Size',
            sub: 'Growing at 5.8% CAGR through 2030',
            color: 'bg-blue-50 border-blue-200',
            accent: 'text-blue-700',
          },
          {
            stat: '70%',
            label: 'Provider Burnout Rate',
            sub: 'Directly linked to poor EHR UX',
            color: 'bg-red-50 border-red-200',
            accent: 'text-red-700',
          },
          {
            stat: '2hrs',
            label: 'EHR Time Per Patient',
            sub: 'Providers spend 2hrs on docs for 1hr of care',
            color: 'bg-amber-50 border-amber-200',
            accent: 'text-amber-700',
          },
        ].map((item) => (
          <div
            key={item.stat}
            className={`border rounded-2xl p-6 ${item.color}`}
          >
            <div className={`text-5xl font-black mb-2 ${item.accent}`}>
              {item.stat}
            </div>
            <div className="font-semibold text-slate-800 mb-1">{item.label}</div>
            <div className="text-slate-500 text-sm">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4 text-lg">Legacy EHR Pain Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'legacy EHR — good but aging UI, limited customization',
            'athenahealth — complex, expensive, hard to implement',
            'Epic — built for hospitals, overkill for primary care',
            'No modern, primary-care-first, multi-tenant SaaS player',
            '15+ clicks to complete a basic SOAP note',
            'Zero keyboard-first design in any incumbent product',
          ].map((pain) => (
            <div key={pain} className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 shrink-0">✕</span>
              <span className="text-slate-700 text-sm">{pain}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

// ─── 3. Product Overview ──────────────────────────────────────────────────────
const ProductSection = () => (
  <Section id="product" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Product</Badge>
      <SectionTitle dark>What Primus Does</SectionTitle>
      <Divider dark />
      <p className="text-slate-300 text-lg max-w-2xl mb-10">
        A complete EHR platform: patient management, scheduling, clinical
        charting, e-prescribing, lab ordering, billing, telehealth, and patient
        portal — all in one keyboard-first interface.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Single-Screen Workflow',
            desc: 'Providers complete 90% of tasks without leaving the patient chart.',
            icon: Layers,
          },
          {
            title: 'Keyboard-First Design',
            desc: 'Every common action has a keyboard shortcut. Ctrl+K command palette.',
            icon: Code2,
          },
          {
            title: 'Multi-Tenant SaaS',
            desc: 'Full tenant isolation. Row-level security. One codebase, many clinics.',
            icon: Building2,
          },
          {
            title: '3-Click Rule',
            desc: 'No common action requires more than 3 clicks. Ruthlessly enforced.',
            icon: Zap,
          },
          {
            title: 'HIPAA-Native',
            desc: 'Audit logging, encryption at rest/transit, BAA-ready from day one.',
            icon: Shield,
          },
          {
            title: 'Modern Stack',
            desc: 'React 18 + Spring Boot 3 + PostgreSQL + Keycloak + AWS.',
            icon: Cloud,
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white/10 border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors"
          >
            <item.icon className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-bold text-white mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── 4. Feature Matrix ────────────────────────────────────────────────────────
const features = [
  { icon: Users, label: 'Patient Chart', desc: 'Full chart: problems, meds, allergies, history' },
  { icon: Calendar, label: 'Scheduling', desc: 'Day/week/month, multi-provider, color-coded' },
  { icon: FileText, label: 'SOAP Editor', desc: 'Smart phrases, templates, voice-ready structure' },
  { icon: Zap, label: 'e-Prescribing', desc: 'ScriptSure EPCS integration, formulary check' },
  { icon: FlaskConical, label: 'Labs', desc: 'Quest + HL7, results inbox, trend views' },
  { icon: CreditCard, label: 'Billing & RCM', desc: 'Availity clearinghouse, ERA, denials mgmt' },
  { icon: Video, label: 'Telehealth', desc: 'Amazon Chime SDK, HIPAA BAA, $0 idle cost' },
  { icon: Smartphone, label: 'Patient Portal', desc: 'Mobile-first, messaging, lab results, booking' },
  { icon: Inbox, label: 'Inbox', desc: 'Priority triage, tasks, referrals, results' },
  { icon: BarChart3, label: 'Dashboards', desc: 'HEDIS metrics, panel health, revenue reports' },
  { icon: Shield, label: 'HIPAA', desc: 'Audit logs, encryption, consent management' },
  { icon: Building2, label: 'Multi-Tenant', desc: 'Full isolation, RLS, per-tenant config' },
];

const FeaturesSection = () => (
  <Section id="features">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Features</Badge>
      <SectionTitle>12 Core Modules</SectionTitle>
      <Divider />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((f) => (
          <div
            key={f.label}
            className="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <f.icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="font-semibold text-slate-900 text-sm mb-1">{f.label}</div>
            <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── 5. Architecture ──────────────────────────────────────────────────────────
const ArchSection = () => (
  <Section id="architecture" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Architecture</Badge>
      <SectionTitle dark>Tech Stack</SectionTitle>
      <Divider dark />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stack layers */}
        <div className="space-y-3">
          {[
            { layer: 'Frontend', tech: 'React 18 + Vite + TypeScript', icon: Code2, color: 'bg-blue-500' },
            { layer: 'Styling', tech: 'Tailwind CSS + shadcn/ui', icon: Layers, color: 'bg-purple-500' },
            { layer: 'State', tech: 'Zustand + TanStack Query', icon: Zap, color: 'bg-yellow-500' },
            { layer: 'Backend', tech: 'Spring Boot 3 (Java 21)', icon: Server, color: 'bg-green-500' },
            { layer: 'Database', tech: 'PostgreSQL (Aurora Serverless)', icon: Database, color: 'bg-orange-500' },
            { layer: 'Auth', tech: 'Keycloak 24 on ECS Fargate', icon: Lock, color: 'bg-red-500' },
            { layer: 'Cloud', tech: 'AWS (ECS, RDS, S3, Chime)', icon: Cloud, color: 'bg-cyan-500' },
            { layer: 'IaC / CI/CD', tech: 'Terraform + GitHub Actions', icon: Globe, color: 'bg-slate-500' },
          ].map((item) => (
            <div key={item.layer} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/10">
              <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-slate-400 text-xs">{item.layer}</span>
                <div className="text-white text-sm font-medium">{item.tech}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div>
          <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-widest">Third-Party Integrations</h3>
          <div className="space-y-2">
            {[
              { name: 'ScriptSure', purpose: 'EPCS e-Prescribing' },
              { name: 'Availity', purpose: 'Claims clearinghouse' },
              { name: 'Quest Diagnostics', purpose: 'Lab ordering + HL7' },
              { name: 'Twilio', purpose: 'SMS notifications' },
              { name: 'Stripe', purpose: 'Patient payments' },
              { name: 'Amazon Chime SDK', purpose: 'HIPAA telehealth' },
              { name: 'Jitsi', purpose: 'Local dev video' },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5 border border-white/10">
                <span className="text-white text-sm font-medium">{i.name}</span>
                <span className="text-slate-400 text-xs">{i.purpose}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// ─── 6. Build Progress ────────────────────────────────────────────────────────
const ProgressSection = () => (
  <Section id="progress">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Build Progress</Badge>
      <SectionTitle>Where We Are Today</SectionTitle>
      <Divider />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { value: '268', label: 'Total Files', sub: 'in codebase' },
          { value: '32,700', label: 'Lines of Code', sub: 'TypeScript + TSX' },
          { value: '31', label: 'Pages Built', sub: 'all roles covered' },
          { value: '14', label: 'API Contracts', sub: 'spec complete' },
        ].map((s) => (
          <div key={s.label} className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="text-4xl font-black text-blue-700 mb-1">{s.value}</div>
            <div className="font-semibold text-slate-800 text-sm">{s.label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Phase 0 Deliverables (Complete)</h3>
          <div className="space-y-2">
            {[
              'Full React simulation — all 8 roles',
              'Mock login with role switcher',
              'Patient chart with all tabs',
              'SOAP editor with smart phrases',
              'Scheduling — day/week/month',
              'Billing & RCM full flow',
              'Patient portal (mobile-first)',
              'Inbox, Reports, Settings',
              'Multi-tenant admin (Super Admin)',
              'Command palette (Ctrl+K)',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Documentation Complete</h3>
          <div className="space-y-2">
            {[
              'Product Requirements Document (PRD)',
              'User Personas (all 8 roles)',
              'Feature Map (P0/P1/P2)',
              'User Flows (every workflow)',
              'Information Architecture',
              'Tech Stack decisions',
              'System Design',
              'Multi-Tenancy model',
              'Data Model (30+ tables)',
              'API Contracts (14 modules)',
              'Auth Strategy (Keycloak + RBAC)',
              'Design System + Component Library',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// ─── 7. Roadmap ───────────────────────────────────────────────────────────────
const phases = [
  { num: 0, name: 'UI Simulation', desc: 'Complete React UI — all roles, all flows', done: true, current: false },
  { num: 1, name: 'Auth + Tenants', desc: 'Keycloak, RBAC, tenant provisioning', done: false, current: true },
  { num: 2, name: 'Patient + Scheduling', desc: 'Real patient records, appointments', done: false, current: false },
  { num: 3, name: 'EHR Core', desc: 'Encounters, SOAP notes, medications, problem list', done: false, current: false },
  { num: 4, name: 'Orders + Labs', desc: 'Lab ordering, HL7, results inbox', done: false, current: false },
  { num: 5, name: 'e-Prescribing', desc: 'ScriptSure EPCS integration', done: false, current: false },
  { num: 6, name: 'Billing + RCM', desc: 'Claims, Availity ERA, Stripe', done: false, current: false },
  { num: 7, name: 'Telehealth', desc: 'Amazon Chime SDK integration', done: false, current: false },
  { num: 8, name: 'Notifications', desc: 'Twilio SMS, email, in-app', done: false, current: false },
  { num: 9, name: 'Analytics', desc: 'Reports, HEDIS dashboards', done: false, current: false },
  { num: 10, name: 'SaaS Hardening', desc: 'RLS, HIPAA audit, pen test, production deploy', done: false, current: false },
];

const RoadmapSection = () => (
  <Section id="roadmap" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Roadmap</Badge>
      <SectionTitle dark>10-Phase Build Plan</SectionTitle>
      <Divider dark />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {phases.map((phase) => (
          <div
            key={phase.num}
            className={`flex items-start gap-4 rounded-xl px-4 py-3 border transition-all ${
              phase.current
                ? 'bg-blue-600 border-blue-500 text-white'
                : phase.done
                ? 'bg-green-900/30 border-green-700/50 text-green-300'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                phase.current
                  ? 'bg-white/20 text-white'
                  : phase.done
                  ? 'bg-green-600 text-white'
                  : 'bg-white/10 text-slate-400'
              }`}
            >
              {phase.done ? '✓' : phase.num}
            </div>
            <div>
              <div className={`font-semibold text-sm ${phase.current ? 'text-white' : ''}`}>
                Phase {phase.num} — {phase.name}
                {phase.current && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <div className={`text-xs mt-0.5 ${phase.current ? 'text-blue-100' : 'text-slate-500'}`}>
                {phase.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── 8. Unit Economics ────────────────────────────────────────────────────────
const EconomicsSection = () => (
  <Section id="economics">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Unit Economics</Badge>
      <SectionTitle>Infrastructure Cost Model</SectionTitle>
      <Divider />
      <p className="text-slate-500 mb-8 text-sm font-semibold uppercase tracking-widest">
        INTERNAL — DO NOT SHARE WITH PROSPECTS
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            env: 'Development',
            cost: '$0 / month',
            highlight: false,
            items: [
              'Local Docker (all services)',
              'Jitsi for video',
              'Mock data only',
              'No cloud costs',
              'GitHub free tier',
            ],
          },
          {
            env: 'Demo / Staging',
            cost: '$75–90 / month',
            highlight: true,
            items: [
              'ECS Fargate (t3.small)',
              'RDS db.t3.micro (~$30)',
              'Keycloak on ECS (~$15)',
              'S3 + CloudFront (~$5)',
              'Chime: $0 (demo only)',
            ],
          },
          {
            env: 'Production (per tenant)',
            cost: '$400–600 / month',
            highlight: false,
            items: [
              'ECS Fargate (2 tasks)',
              'RDS Aurora Serverless',
              'ElastiCache Redis',
              'Chime: ~$0.0017/min',
              'Twilio, Stripe pass-through',
            ],
          },
        ].map((tier) => (
          <div
            key={tier.env}
            className={`rounded-2xl p-6 border ${
              tier.highlight
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-xs font-semibold uppercase tracking-widest mb-2 ${tier.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
              {tier.env}
            </div>
            <div className={`text-3xl font-black mb-4 ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
              {tier.cost}
            </div>
            <ul className="space-y-1.5">
              {tier.items.map((item) => (
                <li key={item} className={`text-sm flex items-center gap-2 ${tier.highlight ? 'text-blue-100' : 'text-slate-600'}`}>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <DollarSign className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900">Pricing model target:</span>
          <span className="text-amber-800 text-sm ml-1">
            Flat $1,500–2,500/month per clinic location. No per-user fees. 5–10x margin at scale.
            Break-even at 1 paying tenant.
          </span>
        </div>
      </div>
    </div>
  </Section>
);

// ─── 9. Go-to-Market ──────────────────────────────────────────────────────────
const GTMSection = () => (
  <Section id="gtm" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Go-to-Market</Badge>
      <SectionTitle dark>From One Clinic to Many</SectionTitle>
      <Divider dark />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-blue-400 font-semibold mb-4 text-sm uppercase tracking-widest">Phase 1 — First Client</h3>
          <div className="bg-white/10 border border-white/10 rounded-2xl p-6">
            <div className="text-2xl font-bold text-white mb-2">Primus Demo Clinic</div>
            <div className="text-slate-400 text-sm mb-4">3–4 clinic locations · USA · Primary Care</div>
            <div className="space-y-2">
              {[
                'Replacing legacy EHR systems',
                'Full deployment across all locations',
                'Thinkitive support team embedded',
                'Live feedback loop into product',
                'Case study + reference customer',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-blue-400 font-semibold mb-4 text-sm uppercase tracking-widest">Phase 2 — SaaS Expansion</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'SaaS Hardening', desc: 'RLS, audit logs, pen test, HIPAA BAA' },
              { step: '2', title: 'Self-serve onboarding', desc: 'Tenant provisioning in < 5 minutes' },
              { step: '3', title: 'Inbound via referrals', desc: 'Primus Demo Clinic → peer clinics' },
              { step: '4', title: 'Channel partnerships', desc: 'Billing companies, MSOs, GPOs' },
              { step: '5', title: 'Target: 10 tenants', desc: '$15K–25K MRR at Year 1 SaaS' },
            ].map((step) => (
              <div key={step.step} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {step.step}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{step.title}</div>
                  <div className="text-slate-400 text-xs">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// ─── 10. Team ─────────────────────────────────────────────────────────────────
const TeamSection = () => (
  <Section id="team">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Team</Badge>
      <SectionTitle>Thinkitive Technologies</SectionTitle>
      <Divider />
      <p className="text-slate-600 text-lg max-w-2xl mb-10">
        A proven healthcare technology team with deep domain expertise in EHR
        systems, HIPAA compliance, HL7/FHIR integrations, and scalable SaaS
        architecture.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Core Strengths</h3>
          <div className="space-y-2">
            {[
              'Healthcare software — 8+ years domain experience',
              'EHR integrations — HL7, FHIR, CCD, CCDA',
              'HIPAA compliance — BAA, audit logging, encryption',
              'Multi-tenant SaaS — PostgreSQL RLS, Keycloak',
              'React + Spring Boot — our primary stack',
              'AWS — ECS, RDS Aurora, Chime, S3',
            ].map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Why We're Building This</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            We've integrated with every major EHR — Epic, legacy EHR, athenahealth,
            Kareo. We know exactly what's broken. Primus is the EHR we always
            wished existed: modern, fast, keyboard-driven, and built for how
            primary care actually works.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Starting with a real client (Primus Demo Clinic) gives us battle-tested
            software from day one — not vaporware.
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center">
        <div className="text-2xl font-bold mb-2">Ready to Build the Future of Primary Care EHR</div>
        <div className="text-blue-200 text-sm">
          Phase 0 complete · Phase 1 starting · Primus Demo Clinic deployment target: Q3 2026
        </div>
      </div>
    </div>
  </Section>
);

// ─── Nav dots ─────────────────────────────────────────────────────────────────
const sections = [
  'hero', 'market', 'product', 'features', 'architecture',
  'progress', 'roadmap', 'economics', 'gtm', 'team',
];

const NavDots = () => (
  <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
    {sections.map((id) => (
      <a
        key={id}
        href={`#${id}`}
        className="w-2.5 h-2.5 rounded-full bg-slate-400/50 hover:bg-blue-500 transition-colors"
        title={id}
      />
    ))}
  </nav>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
const ManagementDeckPage = () => (
  <div className="h-screen overflow-y-scroll scroll-smooth snap-y snap-mandatory">
    <NavDots />
    <HeroSection />
    <MarketSection />
    <ProductSection />
    <FeaturesSection />
    <ArchSection />
    <ProgressSection />
    <RoadmapSection />
    <EconomicsSection />
    <GTMSection />
    <TeamSection />
  </div>
);

export default ManagementDeckPage;
