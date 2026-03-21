import React, { useState } from 'react';
import {
  Activity,
  DollarSign,
  HeartPulse,
  UserCheck,
  ArrowRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportCategory = 'operational' | 'financial' | 'clinical' | 'provider';

interface ReportCard {
  id: ReportCategory;
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  highlight: string;
}

// ─── Report Category Cards ────────────────────────────────────────────────────

const REPORT_CARDS: ReportCard[] = [
  {
    id: 'operational',
    icon: <Activity className="w-6 h-6 text-blue-600" />,
    title: 'Operational',
    description: 'Patients seen, no-show rates, wait times, room utilization, and daily throughput metrics.',
    iconBg: 'bg-blue-50',
    highlight: '47 patients today',
  },
  {
    id: 'financial',
    icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
    title: 'Financial',
    description: 'Revenue trends, collections by payer, outstanding A/R, and charge-to-collection ratios.',
    iconBg: 'bg-emerald-50',
    highlight: '$48,200 this week',
  },
  {
    id: 'clinical',
    icon: <HeartPulse className="w-6 h-6 text-rose-600" />,
    title: 'Clinical Quality',
    description: 'HEDIS measure compliance, care gap closure rates, preventive care benchmarks, and quality scores.',
    iconBg: 'bg-rose-50',
    highlight: '78% HEDIS compliance',
  },
  {
    id: 'provider',
    icon: <UserCheck className="w-6 h-6 text-violet-600" />,
    title: 'Provider Productivity',
    description: 'Encounters per day by provider, E&M coding distribution, and wRVU performance.',
    iconBg: 'bg-violet-50',
    highlight: '18 avg encounters/day',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface BarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}

const Bar: React.FC<BarProps> = ({ label, value, max, color, suffix = '' }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-600 w-32 flex-shrink-0 truncate">{label}</span>
    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-gray-700 w-16 text-right flex-shrink-0">
      {value.toLocaleString()}{suffix}
    </span>
  </div>
);

interface HedisRowProps {
  measure: string;
  numerator: number;
  denominator: number;
  benchmark: number;
}
const HedisRow: React.FC<HedisRowProps> = ({ measure, numerator, denominator, benchmark }) => {
  const rate = Math.round((numerator / denominator) * 100);
  const gap = benchmark - rate;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 flex-1 min-w-0 truncate">{measure}</span>
      <div className="w-40 bg-gray-100 rounded-full h-2.5 overflow-hidden relative flex-shrink-0">
        <div
          className={`h-full rounded-full ${rate >= benchmark ? 'bg-emerald-500' : rate >= benchmark - 10 ? 'bg-amber-400' : 'bg-red-400'}`}
          style={{ width: `${rate}%` }}
        />
        {/* Benchmark line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-500 rounded"
          style={{ left: `${benchmark}%` }}
        />
      </div>
      <span className="text-xs font-bold w-10 text-right flex-shrink-0" style={{
        color: rate >= benchmark ? '#059669' : rate >= benchmark - 10 ? '#d97706' : '#dc2626'
      }}>
        {rate}%
      </span>
      <span className="text-xs text-gray-400 w-20 text-right flex-shrink-0">
        {gap > 0 ? <span className="text-amber-600">-{gap}% gap</span> : <span className="text-emerald-600">+{Math.abs(gap)}%</span>}
      </span>
    </div>
  );
};

// ─── Report Views ─────────────────────────────────────────────────────────────

const OperationalReport: React.FC = () => {
  const dailyData = [
    { day: 'Mon 3/16', seen: 44, noShow: 3 },
    { day: 'Tue 3/17', seen: 51, noShow: 4 },
    { day: 'Wed 3/18', seen: 48, noShow: 2 },
    { day: 'Thu 3/19', seen: 47, noShow: 5 },
    { day: 'Fri 3/20', seen: 39, noShow: 2 },
  ];
  const maxSeen = 60;

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Patients Seen Today', value: '47', sub: '+3 vs yesterday', icon: <Users className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50', trend: 'up' },
          { label: 'No-Show Rate (Week)', value: '8.3%', sub: '-1.2% vs last week', icon: <AlertCircle className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50', trend: 'down' },
          { label: 'Avg Wait Time', value: '14 min', sub: '+2 min vs last week', icon: <Clock className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-50', trend: 'up' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.bg}`}>{kpi.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${kpi.trend === 'up' && kpi.label.includes('Wait') ? 'text-red-600' : kpi.trend === 'up' ? 'text-emerald-600' : 'text-emerald-600'}`}>
              {kpi.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {kpi.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Daily patients chart */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Patients Seen — This Week</h3>
        <div className="space-y-3">
          {dailyData.map((d) => (
            <div key={d.day} className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">{d.day}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden relative">
                    <div
                      className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(d.seen / maxSeen) * 100}%` }}
                    >
                      <span className="text-[10px] font-bold text-white">{d.seen}</span>
                    </div>
                  </div>
                  {d.noShow > 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex-shrink-0">
                      {d.noShow} no-show
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-500">Patients seen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-500">No-shows</span>
          </div>
        </div>
      </div>

      {/* Provider utilization */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Provider Utilization Today</h3>
        <div className="space-y-3">
          <Bar label="Dr. Emily Chen" value={92} max={100} color="bg-emerald-500" suffix="%" />
          <Bar label="Dr. James Park" value={84} max={100} color="bg-blue-500" suffix="%" />
          <Bar label="NP. Rachel Moore" value={78} max={100} color="bg-violet-500" suffix="%" />
          <Bar label="PA. Kevin Torres" value={71} max={100} color="bg-amber-500" suffix="%" />
        </div>
      </div>
    </div>
  );
};

const FinancialReport: React.FC = () => {
  const weeklyRevenue = [
    { week: 'Feb W3', amount: 41200 },
    { week: 'Feb W4', amount: 38900 },
    { week: 'Mar W1', amount: 44100 },
    { week: 'Mar W2', amount: 45800 },
    { week: 'Mar W3', amount: 48200 },
  ];
  const maxRev = 55000;

  return (
    <div className="space-y-3">
      {/* Revenue Trend */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Revenue Trend — Last 5 Weeks</h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +17% 5-week trend
          </span>
        </div>
        <div className="flex items-end gap-3 h-32">
          {weeklyRevenue.map((w, i) => {
            const pct = (w.amount / maxRev) * 100;
            const isLast = i === weeklyRevenue.length - 1;
            return (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-gray-700">${(w.amount / 1000).toFixed(0)}k</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 ${isLast ? 'bg-emerald-500' : 'bg-blue-400'}`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 text-center">{w.week}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collections by payer */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Collections by Payer — March YTD</h3>
        <div className="space-y-3">
          <Bar label="Medicare"     value={38400} max={60000} color="bg-blue-500"   suffix="" />
          <Bar label="Aetna"        value={29800} max={60000} color="bg-indigo-500" suffix="" />
          <Bar label="UnitedHealth" value={24600} max={60000} color="bg-violet-500" suffix="" />
          <Bar label="BlueCross"    value={21100} max={60000} color="bg-cyan-500"   suffix="" />
          <Bar label="Cigna"        value={14300} max={60000} color="bg-emerald-500" suffix="" />
          <Bar label="Medicaid"     value={9800}  max={60000} color="bg-amber-500"  suffix="" />
          <Bar label="Self-pay"     value={6200}  max={60000} color="bg-gray-400"   suffix="" />
        </div>
        <p className="text-xs text-gray-400 mt-3">Values in USD. YTD = Jan 1 – Mar 19, 2026.</p>
      </div>

      {/* Outstanding AR */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Outstanding A/R by Age Bucket</h3>
        <div className="space-y-3">
          <Bar label="0–30 days"  value={84200} max={150000} color="bg-emerald-500" suffix="" />
          <Bar label="31–60 days" value={42100} max={150000} color="bg-amber-400"   suffix="" />
          <Bar label="61–90 days" value={18900} max={150000} color="bg-orange-400"  suffix="" />
          <Bar label="91–120 days" value={9400}  max={150000} color="bg-red-400"    suffix="" />
          <Bar label="120+ days"  value={4800}  max={150000} color="bg-red-600"     suffix="" />
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-gray-500">
          <span>Total outstanding A/R</span>
          <span className="font-bold text-gray-900">$159,400</span>
        </div>
      </div>
    </div>
  );
};

const ClinicalReport: React.FC = () => (
  <div className="space-y-3">
    {/* Care Gap Closure */}
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Care Gaps Closed (Month)', value: '142', sub: '68% closure rate', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: <HeartPulse className="w-5 h-5 text-emerald-600" /> },
        { label: 'Open Care Gaps', value: '67', sub: '32% still open', color: 'text-amber-600', bg: 'bg-amber-50', icon: <AlertCircle className="w-5 h-5 text-amber-500" /> },
        { label: 'Quality Score', value: '3.8 / 5', sub: 'Star Rating (CMS)', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Activity className="w-5 h-5 text-blue-500" /> },
      ].map((kpi) => (
        <div key={kpi.label} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.bg}`}>{kpi.icon}</div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          <p className={`text-xs font-medium mt-1 ${kpi.color}`}>{kpi.sub}</p>
        </div>
      ))}
    </div>

    {/* HEDIS measures */}
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-gray-900">HEDIS Measures — Current Performance</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> At/above benchmark</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Near benchmark</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Below benchmark</span>
          <span className="flex items-center gap-1"><span className="inline-block w-0.5 h-3 bg-slate-500 rounded" /> National benchmark</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">Benchmark line = national 50th percentile. Progress bar shows current rate.</p>
      <div className="space-y-3.5">
        <HedisRow measure="Colorectal Cancer Screening (COL-E)" numerator={142} denominator={180} benchmark={72} />
        <HedisRow measure="Breast Cancer Screening (BCS-E)"     numerator={88}  denominator={110} benchmark={77} />
        <HedisRow measure="Cervical Cancer Screening (CCS)"     numerator={76}  denominator={94}  benchmark={81} />
        <HedisRow measure="Diabetes Care — HbA1c Control (CDC)" numerator={61}  denominator={88}  benchmark={75} />
        <HedisRow measure="Controlling Blood Pressure (CBP)"    numerator={102} denominator={130} benchmark={74} />
        <HedisRow measure="Childhood Immunizations (CIS-E)"     numerator={48}  denominator={52}  benchmark={86} />
        <HedisRow measure="Annual Wellness Visit (AWV)"         numerator={210} denominator={290} benchmark={68} />
        <HedisRow measure="Tobacco Use Cessation (TUC)"         numerator={34}  denominator={58}  benchmark={62} />
        <HedisRow measure="Depression Screening (DSF-E)"        numerator={188} denominator={210} benchmark={84} />
      </div>
    </div>
  </div>
);

const ProviderReport: React.FC = () => {
  const providers = [
    { name: 'Dr. Emily Chen',    encounters: [18, 21, 19, 22, 20], cptMix: [12, 38, 30, 14, 6] },
    { name: 'Dr. James Park',    encounters: [16, 18, 17, 19, 18], cptMix: [8, 42, 32, 12, 6] },
    { name: 'NP. Rachel Moore',  encounters: [14, 16, 15, 17, 15], cptMix: [15, 50, 25, 8, 2] },
    { name: 'PA. Kevin Torres',  encounters: [12, 14, 13, 14, 12], cptMix: [20, 45, 28, 6, 1] },
  ];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const maxEnc = 25;

  return (
    <div className="space-y-3">
      {/* Encounters per day table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-gray-900">Encounters Per Day — This Week</h3>
          <p className="text-xs text-gray-500 mt-0.5">Mar 16–20, 2026</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Provider</th>
                {days.map((d) => (
                  <th key={d} className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{d}</th>
                ))}
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg/Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {providers.map((p) => {
                const total = p.encounters.reduce((s, v) => s + v, 0);
                return (
                  <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                    {p.encounters.map((enc, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold text-gray-800">{enc}</span>
                          <div className="w-8 bg-gray-100 rounded-full h-1.5">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(enc / maxEnc) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right font-bold text-gray-900">{total}</td>
                    <td className="px-5 py-3 text-right text-emerald-700 font-semibold">{(total / 5).toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* E&M coding distribution */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">E&amp;M Coding Distribution — March YTD</h3>
        <p className="text-xs text-gray-400 mb-4">Percentage of encounters per CPT level. Healthy mix: 99213 ~40%, 99214 ~35%.</p>
        <div className="space-y-4">
          {providers.map((p) => {
            const cptLabels = ['99212', '99213', '99214', '99215', '99395/6'];
            const cptColors = ['bg-slate-300', 'bg-blue-400', 'bg-violet-500', 'bg-rose-500', 'bg-emerald-500'];
            return (
              <div key={p.name}>
                <p className="text-xs font-medium text-gray-700 mb-1.5">{p.name}</p>
                <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
                  {p.cptMix.map((pct, i) => (
                    <div
                      key={i}
                      className={`${cptColors[i]} flex items-center justify-center transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                      title={`${cptLabels[i]}: ${pct}%`}
                    >
                      {pct >= 10 && <span className="text-[11px] font-bold text-white">{pct}%</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 flex-wrap">
          {['99212', '99213', '99214', '99215', '99395/6'].map((label, i) => {
            const colors = ['bg-slate-300', 'bg-blue-400', 'bg-violet-500', 'bg-rose-500', 'bg-emerald-500'];
            return (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${colors[i]}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReportsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory | null>(null);

  const activeCard = REPORT_CARDS.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Reports
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {activeCard ? activeCard.title : 'Reports'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeCard ? activeCard.description : 'Analytics and performance insights for your practice'}
            </p>
          </div>
        </div>
        {activeCategory && (
          <div className="flex items-center gap-2">
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>March 2026</option>
              <option>February 2026</option>
              <option>January 2026</option>
              <option>Q1 2026</option>
            </select>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Calendar className="w-4 h-4" />
              Custom Range
            </button>
          </div>
        )}
      </div>

      {/* Category cards grid */}
      {!activeCategory && (
        <div className="grid grid-cols-2 gap-5">
          {REPORT_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setActiveCategory(card.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg} group-hover:scale-105 transition-transform`}>
                  {card.icon}
                </div>
                <span className="text-xs font-medium text-gray-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                  {card.highlight}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{card.description}</p>
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:gap-2.5 transition-all"
                onClick={(e) => { e.stopPropagation(); setActiveCategory(card.id); }}
              >
                View Report <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Report content */}
      {activeCategory === 'operational' && <OperationalReport />}
      {activeCategory === 'financial'   && <FinancialReport />}
      {activeCategory === 'clinical'    && <ClinicalReport />}
      {activeCategory === 'provider'    && <ProviderReport />}
    </div>
  );
};

export default ReportsPage;
