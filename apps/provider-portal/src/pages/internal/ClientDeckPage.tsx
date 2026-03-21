import {
  Users,
  Calendar,
  FileText,
  Smartphone,
  CreditCard,
  Inbox,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Star,
  Heart,
  Send,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Section = ({
  id,
  dark,
  blue,
  children,
  className = '',
}: {
  id: string;
  dark?: boolean;
  blue?: boolean;
  children: React.ReactNode;
  className?: string;
}) => {
  const bg = blue
    ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white'
    : dark
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
    : 'bg-white text-slate-900';
  return (
    <section
      id={id}
      className={`min-h-screen w-full flex flex-col justify-center px-6 py-20 snap-start ${bg} ${className}`}
    >
      {children}
    </section>
  );
};

const Badge = ({ children, light }: { children: React.ReactNode; light?: boolean }) => (
  <span
    className={`inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest mb-4 ${
      light ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
    }`}
  >
    {children}
  </span>
);

const SectionTitle = ({
  children,
  light,
}: {
  children: React.ReactNode;
  light?: boolean;
}) => (
  <h2
    className={`text-4xl md:text-5xl font-bold mb-4 leading-tight ${
      light ? 'text-white' : 'text-slate-900'
    }`}
  >
    {children}
  </h2>
);

const Divider = ({ light }: { light?: boolean }) => (
  <div className={`w-16 h-1 rounded-full mb-8 ${light ? 'bg-white/40' : 'bg-blue-600'}`} />
);

// ─── 1. Hero ──────────────────────────────────────────────────────────────────
const HeroSection = () => (
  <Section id="hero" blue>
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <span className="text-blue-200 text-sm font-medium">Primus EHR</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-6">
        The EHR Your Providers<br />
        <span className="text-blue-200">Will Actually Love.</span>
      </h1>
      <p className="text-blue-100 text-xl max-w-2xl leading-relaxed mb-10">
        A modern, keyboard-first Electronic Health Record platform built
        specifically for primary care — so your team spends less time clicking
        and more time caring.
      </p>
      <div className="flex flex-wrap gap-6 mb-12">
        {[
          { icon: Zap, label: '3-Click Rule', sub: 'Every common action in 3 clicks or fewer' },
          { icon: Clock, label: 'Save 2hrs/day', sub: 'Per provider, on average' },
          { icon: Shield, label: 'HIPAA Native', sub: 'Compliance built in from day one' },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <f.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">{f.label}</div>
              <div className="text-blue-200 text-xs">{f.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <a
        href="#demo"
        className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
      >
        Request a Demo <ArrowRight className="w-4 h-4" />
      </a>
      <div className="mt-12 text-blue-300 text-sm">Scroll to learn more ↓</div>
    </div>
  </Section>
);

// ─── 2. The Problem ───────────────────────────────────────────────────────────
const ProblemSection = () => (
  <Section id="problem">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>The Problem</Badge>
      <SectionTitle>Your EHR is Burning Out Your Team</SectionTitle>
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          {
            stat: '70%',
            label: 'of physicians report burnout',
            sub: 'The #1 cited cause: EHR documentation burden',
            color: 'text-red-600',
            bg: 'bg-red-50 border-red-100',
          },
          {
            stat: '2 hrs',
            label: 'of EHR time per hour of care',
            sub: "For every hour with a patient, there's 2 hours of charting",
            color: 'text-orange-600',
            bg: 'bg-orange-50 border-orange-100',
          },
          {
            stat: '45%',
            label: 'of providers consider leaving medicine',
            sub: 'Directly attributable to administrative burden',
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-100',
          },
        ].map((s) => (
          <div key={s.stat} className={`rounded-2xl border p-6 ${s.bg}`}>
            <div className={`text-5xl font-black mb-2 ${s.color}`}>{s.stat}</div>
            <div className="font-semibold text-slate-800 mb-1 text-sm">{s.label}</div>
            <div className="text-slate-500 text-xs leading-relaxed">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900 mb-4">What providers say about legacy EHRs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            '"I spend more time clicking than talking to patients."',
            '"It takes 15 steps just to order a common lab."',
            '"The UI hasn\'t changed since 2008."',
            '"I stay 2 hours late just to finish my charts."',
            '"There\'s no keyboard navigation — everything is mouse."',
            '"Alert fatigue is so bad I ignore everything now."',
          ].map((quote) => (
            <div key={quote} className="flex items-start gap-3 text-sm text-slate-600 italic">
              <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              {quote}
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

// ─── 3. Solution ──────────────────────────────────────────────────────────────
const SolutionSection = () => (
  <Section id="solution" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge light>How Primus Solves It</Badge>
      <SectionTitle light>Designed for the Way Providers Actually Work</SectionTitle>
      <Divider light />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            icon: Zap,
            title: 'Single-Screen Workflow',
            desc: 'Everything a provider needs — chart, notes, orders, meds, messages — on one screen. No tab-switching, no hunting.',
            highlight: '90% of tasks without leaving the patient chart.',
          },
          {
            icon: Clock,
            title: '3-Click Rule',
            desc: "We've obsessively optimized every workflow. No common clinical action requires more than 3 clicks.",
            highlight: 'Enforced in every feature, every release.',
          },
          {
            icon: FileText,
            title: 'Keyboard-First Design',
            desc: 'Command palette (Ctrl+K), keyboard shortcuts for everything, smart phrase expansion with the . prefix.',
            highlight: 'Fastest charting of any primary care EHR.',
          },
          {
            icon: Shield,
            title: 'Zero Alert Fatigue',
            desc: 'Interruptive modals only for life-threatening situations. Max 5 alerts per provider per day. Everything else is ambient.',
            highlight: 'Alerts you actually respond to.',
          },
        ].map((item) => (
          <div key={item.title} className="bg-white/10 border border-white/10 rounded-2xl p-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm mb-3 leading-relaxed">{item.desc}</p>
            <div className="text-blue-400 text-xs font-semibold">{item.highlight}</div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── 4. Feature Tour ──────────────────────────────────────────────────────────
const tourFeatures = [
  {
    icon: Users,
    title: 'Smart Patient Chart',
    desc: 'See everything at a glance. Active problems, medications, allergies, vitals, and upcoming appointments — all in the sticky header. Every tab loads instantly.',
    tags: ['Problem List', 'Medications', 'Allergies', 'Vitals', 'Timeline'],
  },
  {
    icon: FileText,
    title: 'SOAP Notes — Reimagined',
    desc: 'Smart phrases expand with a . prefix. Templates for common visit types. Three-column layout with AI-assisted structured data extraction. Sign with one click.',
    tags: ['Smart Phrases', 'Templates', 'AI Assist', 'One-click Sign'],
  },
  {
    icon: Calendar,
    title: 'Intelligent Scheduling',
    desc: 'Day, week, and month views. Multi-provider, multi-room. Color-coded by appointment type. Drag-to-reschedule. Automated reminders via SMS.',
    tags: ['Multi-provider', 'Color-coded', 'SMS Reminders', 'Drag & Drop'],
  },
  {
    icon: Smartphone,
    title: 'Patient Portal — Mobile First',
    desc: 'Patients access their chart, lab results, and messages from any device. Book appointments, request refills, and join telehealth visits from one place.',
    tags: ['Mobile-first', 'Lab Results', 'Telehealth', 'Messaging'],
  },
  {
    icon: CreditCard,
    title: 'Billing & Revenue Cycle',
    desc: 'End-to-end RCM. Automated claim submission via Availity. ERA posting, denial management, and real-time eligibility verification.',
    tags: ['Auto Claims', 'ERA Posting', 'Denials', 'Eligibility'],
  },
  {
    icon: Inbox,
    title: 'Priority Inbox',
    desc: 'Lab results, messages, referrals, and tasks — all in one place. Smart priority triage so urgent items surface automatically. Team-based workflows.',
    tags: ['Priority Triage', 'Lab Results', 'Referrals', 'Team Tasks'],
  },
];

const FeaturesSection = () => (
  <Section id="features">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Features</Badge>
      <SectionTitle>A Complete Platform, Not a Collection of Tools</SectionTitle>
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tourFeatures.map((f) => (
          <div
            key={f.title}
            className="border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                <f.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-3">{f.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {f.tags.map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── 5. Comparison ────────────────────────────────────────────────────────────
const compRows = [
  { feature: 'Cloud-native architecture', primus: true, elation: false, athena: false, epic: false },
  { feature: 'Keyboard-first design', primus: true, elation: false, athena: false, epic: false },
  { feature: 'Modern UI (post-2020)', primus: true, elation: false, athena: false, epic: false },
  { feature: 'Primary care focused', primus: true, elation: true, athena: false, epic: false },
  { feature: 'Flat monthly pricing', primus: true, elation: false, athena: false, epic: false },
  { feature: 'No per-user fees', primus: true, elation: false, athena: false, epic: false },
  { feature: 'Integrated telehealth', primus: true, elation: false, athena: true, epic: true },
  { feature: 'Patient portal included', primus: true, elation: true, athena: true, epic: true },
  { feature: '< 5 week onboarding', primus: true, elation: false, athena: false, epic: false },
  { feature: 'No long-term contracts', primus: true, elation: false, athena: false, epic: false },
];

const Check = ({ val }: { val: boolean }) =>
  val ? (
    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
  ) : (
    <X className="w-5 h-5 text-slate-300 mx-auto" />
  );

const ComparisonSection = () => (
  <Section id="comparison" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge light>Comparison</Badge>
      <SectionTitle light>How Primus Stacks Up</SectionTitle>
      <Divider light />
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-4 text-slate-400 font-medium w-1/2">Feature</th>
              <th className="px-4 py-4 text-blue-400 font-bold text-center">Primus</th>
              <th className="px-4 py-4 text-slate-500 font-medium text-center">Elation</th>
              <th className="px-4 py-4 text-slate-500 font-medium text-center">athena</th>
              <th className="px-4 py-4 text-slate-500 font-medium text-center">Epic</th>
            </tr>
          </thead>
          <tbody>
            {compRows.map((row, i) => (
              <tr
                key={row.feature}
                className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/5' : ''}`}
              >
                <td className="px-4 py-3 text-slate-300">{row.feature}</td>
                <td className="px-4 py-3"><Check val={row.primus} /></td>
                <td className="px-4 py-3"><Check val={row.elation} /></td>
                <td className="px-4 py-3"><Check val={row.athena} /></td>
                <td className="px-4 py-3"><Check val={row.epic} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </Section>
);

// ─── 6. Security & Compliance ─────────────────────────────────────────────────
const SecuritySection = () => (
  <Section id="security">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Security & Compliance</Badge>
      <SectionTitle>Built for Healthcare from the Ground Up</SectionTitle>
      <Divider />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'HIPAA Compliant', sub: 'BAA available, audit logging throughout', icon: Shield },
          { label: 'SOC 2 Ready', sub: 'Controls built into every layer', icon: CheckCircle },
          { label: 'WCAG 2.1 AA', sub: 'Accessible for all users', icon: Users },
          { label: 'Encryption Everywhere', sub: 'At rest (AES-256) and in transit (TLS 1.3)', icon: Shield },
          { label: 'Role-Based Access', sub: '8 distinct roles, granular permissions', icon: Users },
          { label: 'Audit Logging', sub: 'Every PHI access logged and reportable', icon: FileText },
        ].map((item) => (
          <div key={item.label} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <item.icon className="w-4 h-4 text-green-600" />
            </div>
            <div className="font-semibold text-slate-900 text-sm mb-1">{item.label}</div>
            <div className="text-slate-500 text-xs leading-relaxed">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
        <Shield className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-green-900 mb-1">Your data stays yours</div>
          <div className="text-green-800 text-sm">
            Full data portability. Export your patient data at any time in standard formats (CCDA, HL7 FHIR).
            No lock-in. No hostage data.
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// ─── 7. Implementation ────────────────────────────────────────────────────────
const ImplementationSection = () => (
  <Section id="implementation" dark>
    <div className="max-w-5xl mx-auto w-full">
      <Badge light>Implementation</Badge>
      <SectionTitle light>Go Live in 4–6 Weeks</SectionTitle>
      <Divider light />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          {[
            { week: 'Week 1', title: 'Onboarding & Setup', desc: 'Tenant provisioning, user accounts, role configuration, branding.' },
            { week: 'Week 2', title: 'Data Migration', desc: 'Patient demographics, problem lists, medications, and history from your current EHR.' },
            { week: 'Week 3', title: 'Workflow Configuration', desc: 'Visit types, scheduling templates, smart phrases, billing codes.' },
            { week: 'Week 4', title: 'Training', desc: 'Role-specific training for providers, front desk, billing, and nursing staff.' },
            { week: 'Weeks 5–6', title: 'Parallel Run & Go-Live', desc: 'Shadowed go-live with your dedicated Thinkitive support team on-site.' },
          ].map((step) => (
            <div key={step.week} className="flex gap-4">
              <div className="w-20 text-blue-400 font-semibold text-xs pt-0.5 shrink-0">{step.week}</div>
              <div className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-white font-semibold text-sm mb-0.5">{step.title}</div>
                <div className="text-slate-400 text-xs leading-relaxed">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-blue-600 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">What's Included</h3>
            <div className="space-y-2">
              {[
                'Dedicated implementation manager',
                'Data migration from your current EHR',
                'Custom workflow configuration',
                'Role-specific staff training',
                'On-site go-live support',
                '30-day post-go-live hypercare',
                '24/7 support after go-live',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                  <CheckCircle className="w-4 h-4 text-blue-300 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
            <div className="text-white font-bold mb-2">Ongoing Support</div>
            <div className="text-slate-400 text-sm leading-relaxed">
              Monthly product updates, regular check-ins with your customer success manager,
              and a direct line to our engineering team for feature requests.
            </div>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// ─── 8. Pricing ───────────────────────────────────────────────────────────────
const PricingSection = () => (
  <Section id="pricing">
    <div className="max-w-5xl mx-auto w-full">
      <Badge>Pricing</Badge>
      <SectionTitle>Simple, Transparent Pricing</SectionTitle>
      <Divider />
      <p className="text-slate-600 text-lg max-w-xl mb-10">
        One flat monthly fee per location. No per-user charges. No hidden fees.
        No long-term contracts.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            name: 'Starter',
            price: 'Contact Us',
            sub: 'Small clinic · 1–2 providers',
            highlight: false,
            features: [
              'All core EHR features',
              'Patient portal',
              'Scheduling',
              'Basic billing',
              'Email support',
            ],
          },
          {
            name: 'Practice',
            price: 'Contact Us',
            sub: 'Growing practice · 3–8 providers',
            highlight: true,
            features: [
              'Everything in Starter',
              'Full RCM & billing',
              'Telehealth included',
              'Advanced reporting',
              'Dedicated CSM',
              'Phone + email support',
            ],
          },
          {
            name: 'Enterprise',
            price: 'Contact Us',
            sub: 'Multi-location · 8+ providers',
            highlight: false,
            features: [
              'Everything in Practice',
              'Multi-location management',
              'Custom integrations',
              'SLA guarantees',
              'On-site training',
              '24/7 support',
            ],
          },
        ].map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl p-6 border ${
              tier.highlight
                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${tier.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
              {tier.name}
            </div>
            <div className={`text-2xl font-black mb-0.5 ${tier.highlight ? 'text-white' : 'text-slate-900'}`}>
              {tier.price}
            </div>
            <div className={`text-xs mb-5 ${tier.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
              {tier.sub}
            </div>
            <ul className="space-y-2">
              {tier.features.map((f) => (
                <li key={f} className={`flex items-center gap-2 text-sm ${tier.highlight ? 'text-blue-100' : 'text-slate-700'}`}>
                  <CheckCircle className={`w-4 h-4 shrink-0 ${tier.highlight ? 'text-blue-200' : 'text-green-500'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {[
          'No per-user fees',
          'No long-term contracts',
          'Cancel anytime',
          'Data portability guaranteed',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-slate-600 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {item}
          </div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── 9. Demo CTA ──────────────────────────────────────────────────────────────
const DemoSection = () => (
  <Section id="demo" blue>
    <div className="max-w-4xl mx-auto w-full">
      <Badge light>Get Started</Badge>
      <SectionTitle light>See Primus in Action</SectionTitle>
      <Divider light />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-blue-100 text-lg leading-relaxed mb-6">
            Schedule a personalized 30-minute demo. We'll walk through your
            specific workflows, answer every question, and show you exactly how
            Primus would work for your clinic.
          </p>
          <div className="space-y-3">
            {[
              'Live demo tailored to your specialty',
              'See your existing workflows replicated',
              'Meet your implementation team',
              'Get a custom pricing proposal',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-blue-100 text-sm">
                <ArrowRight className="w-4 h-4 text-blue-300 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-slate-900 mb-5 text-lg">Request a Demo</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Dr. Jane Smith"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Clinic Name</label>
              <input
                type="text"
                placeholder="Primary Care Associates"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Work Email</label>
              <input
                type="email"
                placeholder="jane@primarycareassociates.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                placeholder="(555) 234-5678"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 text-sm"
              />
            </div>
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Request Demo
            </button>
            <p className="text-slate-400 text-xs text-center">
              We'll reach out within 1 business day. No spam, ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

// ─── Nav dots ──────────────────────────────────────────────────────────────────
const sectionIds = [
  'hero', 'problem', 'solution', 'features', 'comparison',
  'security', 'implementation', 'pricing', 'demo',
];

const NavDots = () => (
  <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
    {sectionIds.map((id) => (
      <a
        key={id}
        href={`#${id}`}
        className="w-2.5 h-2.5 rounded-full bg-slate-400/50 hover:bg-blue-500 transition-colors"
        title={id}
      />
    ))}
  </nav>
);

// ─── Root ──────────────────────────────────────────────────────────────────────
const ClientDeckPage = () => (
  <div className="h-screen overflow-y-scroll scroll-smooth snap-y snap-mandatory">
    <NavDots />
    <HeroSection />
    <ProblemSection />
    <SolutionSection />
    <FeaturesSection />
    <ComparisonSection />
    <SecuritySection />
    <ImplementationSection />
    <PricingSection />
    <DemoSection />
  </div>
);

export default ClientDeckPage;
