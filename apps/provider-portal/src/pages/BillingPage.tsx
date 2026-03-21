import { useState } from 'react';
import {
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimStatus = 'ready' | 'submitted' | 'accepted' | 'paid' | 'denied' | 'appealed';
type SubNav = 'dashboard' | 'charges' | 'claims' | 'era' | 'denials' | 'ar' | 'patient_balances';

interface Claim {
  id: string;
  patientName: string;
  patientId: string;
  dos: string;
  cptCode: string;
  cptDesc: string;
  charge: number;
  payer: string;
  payerId: string;
  status: ClaimStatus;
  submittedAt?: string;
  paidAmount?: number;
  denialReason?: string;
  daysOld: number;
}

interface DenialItem {
  id: string;
  patientName: string;
  dos: string;
  amount: number;
  payer: string;
  denialCode: string;
  denialReason: string;
  suggestedAction: string;
  daysOld: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CLAIMS: Claim[] = [
  { id: 'CLM-00001', patientName: 'Robert Johnson', patientId: 'PAT-00001', dos: '2026-03-18', cptCode: '99214', cptDesc: 'Office Visit, Mod Complexity', charge: 220, payer: 'Aetna', payerId: 'AETNA', status: 'submitted', submittedAt: '2026-03-18', daysOld: 1 },
  { id: 'CLM-00002', patientName: 'Maria Santos', patientId: 'PAT-00002', dos: '2026-03-18', cptCode: '99213', cptDesc: 'Office Visit, Low Complexity', charge: 160, payer: 'UnitedHealth', payerId: 'UHC', status: 'accepted', submittedAt: '2026-03-18', daysOld: 1 },
  { id: 'CLM-00003', patientName: 'David Kim', patientId: 'PAT-00003', dos: '2026-03-17', cptCode: '99215', cptDesc: 'Office Visit, High Complexity', charge: 290, payer: 'BlueCross', payerId: 'BCBS', status: 'paid', submittedAt: '2026-03-17', paidAmount: 248, daysOld: 2 },
  { id: 'CLM-00004', patientName: 'Linda Chen', patientId: 'PAT-00004', dos: '2026-03-17', cptCode: '99395', cptDesc: 'Preventive Visit, 18–39 yrs', charge: 310, payer: 'Cigna', payerId: 'CIGNA', status: 'denied', submittedAt: '2026-03-17', denialReason: 'CO-4 Procedure not covered', daysOld: 2 },
  { id: 'CLM-00005', patientName: 'Thomas Wright', patientId: 'PAT-00005', dos: '2026-03-14', cptCode: '99396', cptDesc: 'Preventive Visit, 40–64 yrs', charge: 330, payer: 'Medicare', payerId: 'MEDICARE', status: 'paid', submittedAt: '2026-03-15', paidAmount: 198, daysOld: 5 },
  { id: 'CLM-00006', patientName: 'Susan Park', patientId: 'PAT-00006', dos: '2026-03-14', cptCode: '99213', cptDesc: 'Office Visit, Low Complexity', charge: 160, payer: 'Medicaid', payerId: 'MEDICAID', status: 'submitted', submittedAt: '2026-03-15', daysOld: 4 },
  { id: 'CLM-00007', patientName: 'Nancy Williams', patientId: 'PAT-00007', dos: '2026-03-13', cptCode: '99214', cptDesc: 'Office Visit, Mod Complexity', charge: 220, payer: 'Aetna', payerId: 'AETNA', status: 'paid', submittedAt: '2026-03-14', paidAmount: 185, daysOld: 6 },
  { id: 'CLM-00008', patientName: 'James Miller', patientId: 'PAT-00008', dos: '2026-03-12', cptCode: '99215', cptDesc: 'Office Visit, High Complexity', charge: 290, payer: 'UnitedHealth', payerId: 'UHC', status: 'appealed', submittedAt: '2026-03-13', denialReason: 'CO-50 Non-covered service', daysOld: 7 },
  { id: 'CLM-00009', patientName: 'Carlos Rivera', patientId: 'PAT-00009', dos: '2026-03-11', cptCode: '99213', cptDesc: 'Office Visit, Low Complexity', charge: 160, payer: 'BlueCross', payerId: 'BCBS', status: 'ready', daysOld: 8 },
  { id: 'CLM-00010', patientName: 'Patricia Nguyen', patientId: 'PAT-00010', dos: '2026-03-10', cptCode: '99396', cptDesc: 'Preventive Visit, 40–64 yrs', charge: 330, payer: 'Medicare', payerId: 'MEDICARE', status: 'denied', submittedAt: '2026-03-11', denialReason: 'CO-97 Payment included in allowance', daysOld: 9 },
];

const MOCK_DENIALS: DenialItem[] = [
  { id: 'DEN-00001', patientName: 'Patricia Nguyen', dos: '2026-03-10', amount: 330, payer: 'Medicare', denialCode: 'CO-97', denialReason: 'Payment included in allowance for another service', suggestedAction: 'Unbundle codes or appeal with medical necessity documentation', daysOld: 9 },
  { id: 'DEN-00002', patientName: 'Linda Chen', dos: '2026-03-17', amount: 290, payer: 'Cigna', denialCode: 'CO-4', denialReason: 'Procedure code inconsistent with modifier', suggestedAction: 'Review modifier usage; resubmit with corrected modifier 25', daysOld: 2 },
  { id: 'DEN-00003', patientName: 'James Miller', dos: '2026-03-12', amount: 290, payer: 'UnitedHealth', denialCode: 'CO-50', denialReason: 'Non-covered service — patient plan exclusion', suggestedAction: 'Verify plan benefits; bill patient if excluded service', daysOld: 7 },
  { id: 'DEN-00004', patientName: 'Helen Brooks', dos: '2026-03-05', amount: 220, payer: 'Aetna', denialCode: 'CO-22', denialReason: 'Coordination of benefits — other insurance primary', suggestedAction: 'Verify primary insurance; resubmit to correct primary payer', daysOld: 14 },
  { id: 'DEN-00005', patientName: 'Frank Torres', dos: '2026-02-28', amount: 160, payer: 'BlueCross', denialCode: 'PR-1', denialReason: 'Deductible amount — patient responsibility', suggestedAction: 'Post as patient balance; send statement to patient', daysOld: 19 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClaimStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ready:     { label: 'Ready',     color: 'bg-slate-100 text-slate-700',   icon: <Clock className="w-3 h-3" /> },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700',     icon: <RefreshCw className="w-3 h-3" /> },
  accepted:  { label: 'Accepted',  color: 'bg-indigo-100 text-indigo-700', icon: <CheckCircle className="w-3 h-3" /> },
  paid:      { label: 'Paid',      color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
  denied:    { label: 'Denied',    color: 'bg-red-100 text-red-700',       icon: <XCircle className="w-3 h-3" /> },
  appealed:  { label: 'Appealed',  color: 'bg-amber-100 text-amber-700',   icon: <AlertTriangle className="w-3 h-3" /> },
};

const fmt = (n: number) => `$${n.toLocaleString()}`;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  up: boolean;
  positive: boolean;
  icon: React.ReactNode;
  iconBg: string;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, value, change, up, positive, icon, iconBg }) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      <span>{change} vs last week</span>
    </div>
  </div>
);

// ─── Views ────────────────────────────────────────────────────────────────────

const DashboardView: React.FC = () => {
  const dashClaims = MOCK_CLAIMS.slice(0, 10);
  const dashDenials = MOCK_DENIALS.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Clean Claim Rate"
          value="94.2%"
          change="+2.1%"
          up={true}
          positive={true}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <KpiCard
          label="Denial Rate"
          value="5.8%"
          change="-0.4%"
          up={false}
          positive={true}
          icon={<XCircle className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-50"
        />
        <KpiCard
          label="Days in A/R"
          value="32"
          change="+2 days"
          up={true}
          positive={false}
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <KpiCard
          label="Collections This Week"
          value="$48,200"
          change="+$3,100"
          up={true}
          positive={true}
          icon={<DollarSign className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-50"
        />
      </div>

      {/* Claim Queue */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Claim Queue</h3>
            <p className="text-xs text-gray-500 mt-0.5">Claims pending action or review</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">DOS</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">CPT</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Charge</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Payer</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashClaims.map((claim) => {
                const sc = STATUS_CONFIG[claim.status];
                return (
                  <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900">{claim.patientName}</p>
                      <p className="text-xs text-gray-400">{claim.id}</p>
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{claim.dos}</td>
                    <td className="px-3 py-2">
                      <p className="font-mono text-xs font-semibold text-gray-700">{claim.cptCode}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[140px]">{claim.cptDesc}</p>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">{fmt(claim.charge)}</td>
                    <td className="px-3 py-2 text-gray-600 text-sm">{claim.payer}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Denial Queue */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Denial Queue</h3>
            <p className="text-xs text-gray-500 mt-0.5">Requires appeal or correction</p>
          </div>
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
            {fmt(MOCK_DENIALS.reduce((s, d) => s + d.amount, 0))} at risk
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">DOS</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Denial Reason</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashDenials.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2">
                    <p className="font-medium text-gray-900">{d.patientName}</p>
                    <p className="text-xs text-gray-400">{d.payer}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{d.dos}</td>
                  <td className="px-3 py-2">
                    <p className="text-xs font-mono font-semibold text-red-600">{d.denialCode}</p>
                    <p className="text-xs text-gray-600 max-w-[200px] truncate">{d.denialReason}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-red-700">{fmt(d.amount)}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      d.daysOld > 14 ? 'bg-red-100 text-red-700' :
                      d.daysOld > 7 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {d.daysOld}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ClaimsView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');

  const filtered = statusFilter === 'all'
    ? MOCK_CLAIMS
    : MOCK_CLAIMS.filter((c) => c.status === statusFilter);

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-gray-900">All Claims</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
            {(['all', 'ready', 'submitted', 'accepted', 'paid', 'denied', 'appealed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-slate-50'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Claim ID</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">DOS</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">CPT</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Charge</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Paid</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Payer</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((claim) => {
              const sc = STATUS_CONFIG[claim.status];
              return (
                <tr key={claim.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{claim.id}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{claim.patientName}</td>
                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{claim.dos}</td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs font-semibold text-gray-700">{claim.cptCode}</span>
                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{claim.cptDesc}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{fmt(claim.charge)}</td>
                  <td className="px-3 py-2 text-right font-medium text-emerald-700">
                    {claim.paidAmount ? fmt(claim.paidAmount) : '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{claim.payer}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                      {sc.icon}
                      {sc.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DenialsView: React.FC = () => {
  const sorted = [...MOCK_DENIALS].sort((a, b) => b.amount - a.amount);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Denial Queue</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {sorted.length} denials · {fmt(sorted.reduce((s, d) => s + d.amount, 0))} total at risk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((d) => (
          <div key={d.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{d.denialCode}</span>
                  <span className="text-sm font-semibold text-gray-900">{d.patientName}</span>
                  <span className="text-xs text-gray-400">{d.payer} · {d.dos}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-auto ${
                    d.daysOld > 14 ? 'bg-red-100 text-red-700' :
                    d.daysOld > 7 ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {d.daysOld} days old
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Reason:</span> {d.denialReason}</p>
                <div className="flex items-start gap-1.5 mt-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded flex-1">{d.suggestedAction}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-red-700">{fmt(d.amount)}</p>
                <p className="text-xs text-gray-400 mt-0.5">at risk</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
              <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                Appeal
              </button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-gray-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors">
                Correct &amp; Resubmit
              </button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-gray-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors">
                Write Off
              </button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-gray-500 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors ml-auto">
                Bill Patient
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Charges View ─────────────────────────────────────────────────────────────

const MOCK_CHARGES = [
  { id: 'CHG-00001', date: '2026-03-21', patient: 'Robert Johnson',   patientId: 'PAT-00001', provider: 'Dr. Emily Chen',    cpt: '99214', icd: 'Z00.00, I10',     charge: 220, status: 'ready' },
  { id: 'CHG-00002', date: '2026-03-21', patient: 'Maria Santos',     patientId: 'PAT-00002', provider: 'Dr. Kevin Torres',  cpt: '99213', icd: 'J06.9',           charge: 160, status: 'ready' },
  { id: 'CHG-00003', date: '2026-03-21', patient: 'David Kim',        patientId: 'PAT-00003', provider: 'Dr. Emily Chen',    cpt: '99215', icd: 'E11.9, I10',      charge: 290, status: 'submitted' },
  { id: 'CHG-00004', date: '2026-03-20', patient: 'Linda Chen',       patientId: 'PAT-00004', provider: 'Dr. Kevin Torres',  cpt: '99395', icd: 'Z00.00',          charge: 310, status: 'submitted' },
  { id: 'CHG-00005', date: '2026-03-20', patient: 'Thomas Wright',    patientId: 'PAT-00005', provider: 'Dr. Emily Chen',    cpt: '99396', icd: 'Z00.00, E78.5',   charge: 330, status: 'ready' },
  { id: 'CHG-00006', date: '2026-03-20', patient: 'Susan Park',       patientId: 'PAT-00006', provider: 'Dr. Kevin Torres',  cpt: '99213', icd: 'M54.5',           charge: 160, status: 'ready' },
  { id: 'CHG-00007', date: '2026-03-19', patient: 'Nancy Williams',   patientId: 'PAT-00007', provider: 'Dr. Emily Chen',    cpt: '99214', icd: 'Z00.00, F41.1',   charge: 220, status: 'submitted' },
  { id: 'CHG-00008', date: '2026-03-19', patient: 'James Miller',     patientId: 'PAT-00008', provider: 'Dr. Kevin Torres',  cpt: '99215', icd: 'I25.10, E11.9',   charge: 290, status: 'ready' },
];

const ChargesView: React.FC = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const ready = MOCK_CHARGES.filter((c) => c.status === 'ready');

  const toggleAll = () => {
    if (selected.size === ready.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ready.map((c) => c.id)));
    }
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Charge Capture</h3>
          <p className="text-xs text-gray-500 mt-0.5">{ready.length} charges ready to submit</p>
        </div>
        <button
          disabled={selected.size === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Submit All {selected.size > 0 && `(${selected.size})`}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === ready.length && ready.length > 0}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Provider</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">CPT</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">ICD-10</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Charge</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_CHARGES.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5">
                    {c.status === 'ready' && (
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggle(c.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{c.date}</td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-gray-900 text-[11px]">{c.patient}</p>
                    <p className="text-[10px] text-gray-400">{c.patientId}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{c.provider}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-700">{c.cpt}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-500 font-mono">{c.icd}</td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900 text-sm">{fmt(c.charge)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.status === 'ready' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.status === 'ready' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {c.status === 'ready' ? 'Ready' : 'Submitted'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={6} className="px-4 py-2.5 text-xs font-semibold text-gray-600">Total ({MOCK_CHARGES.length} charges)</td>
                <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(MOCK_CHARGES.reduce((s, c) => s + c.charge, 0))}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── ERA View ─────────────────────────────────────────────────────────────────

const MOCK_ERA = [
  { id: 'ERA-00001', paymentDate: '2026-03-20', payer: 'Aetna',       checkEft: 'EFT-8812345', amount: 4850, claims: 12, exceptions: 0, status: 'auto_posted' },
  { id: 'ERA-00002', paymentDate: '2026-03-19', payer: 'UnitedHealth', checkEft: 'EFT-7723419', amount: 7120, claims: 18, exceptions: 2, status: 'needs_review' },
  { id: 'ERA-00003', paymentDate: '2026-03-18', payer: 'BlueCross',    checkEft: 'CHK-5501882', amount: 3390, claims: 9,  exceptions: 0, status: 'auto_posted' },
  { id: 'ERA-00004', paymentDate: '2026-03-17', payer: 'Medicare',     checkEft: 'EFT-9934821', amount: 9240, claims: 24, exceptions: 1, status: 'needs_review' },
  { id: 'ERA-00005', paymentDate: '2026-03-14', payer: 'Cigna',        checkEft: 'EFT-6612008', amount: 2760, claims: 7,  exceptions: 0, status: 'auto_posted' },
];

const ERAView: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Electronic Remittance Advice</h3>
        <p className="text-xs text-gray-500 mt-0.5">835 files from payers — posting and reconciliation</p>
      </div>
      <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50">
        <Download className="w-3.5 h-3.5" />
        Download 835
      </button>
    </div>

    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Payment Date</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Payer</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Check / EFT #</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Claims</th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Exceptions</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_ERA.map((era) => (
              <tr key={era.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{era.paymentDate}</td>
                <td className="px-3 py-3 font-medium text-gray-900 text-sm">{era.payer}</td>
                <td className="px-3 py-3 font-mono text-xs text-gray-500">{era.checkEft}</td>
                <td className="px-3 py-3 text-right font-semibold text-emerald-700">{fmt(era.amount)}</td>
                <td className="px-3 py-3 text-center text-sm text-gray-700">{era.claims}</td>
                <td className="px-3 py-3 text-center">
                  <span className={`text-xs font-medium ${era.exceptions > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {era.exceptions > 0 ? era.exceptions : '—'}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    era.status === 'auto_posted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {era.status === 'auto_posted'
                      ? <><CheckCircle className="w-3 h-3" />Auto-Posted</>
                      : <><AlertTriangle className="w-3 h-3" />Needs Review</>
                    }
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap">
                    View Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── A/R View ─────────────────────────────────────────────────────────────────

const MOCK_AR_PAYERS = [
  { payer: 'Aetna',        b0_30: 4200,  b31_60: 1800,  b61_90: 620,   b90plus: 0,    total: 6620 },
  { payer: 'UnitedHealth', b0_30: 7800,  b31_60: 3200,  b61_90: 1100,  b90plus: 450,  total: 12550 },
  { payer: 'BlueCross',    b0_30: 3100,  b31_60: 980,   b61_90: 0,     b90plus: 0,    total: 4080 },
  { payer: 'Medicare',     b0_30: 9500,  b31_60: 4800,  b61_90: 2200,  b90plus: 890,  total: 17390 },
  { payer: 'Cigna',        b0_30: 2400,  b31_60: 760,   b61_90: 310,   b90plus: 120,  total: 3590 },
];

const ARView: React.FC = () => {
  const totals = MOCK_AR_PAYERS.reduce(
    (acc, p) => ({
      b0_30: acc.b0_30 + p.b0_30,
      b31_60: acc.b31_60 + p.b31_60,
      b61_90: acc.b61_60 + p.b61_90,
      b90plus: acc.b90plus + p.b90plus,
      total: acc.total + p.total,
      b61_60: acc.b61_60 + p.b61_90,
    }),
    { b0_30: 0, b31_60: 0, b61_90: 0, b90plus: 0, total: 0, b61_60: 0 }
  );

  const buckets = [
    { label: '0–30 Days',  value: totals.b0_30,  color: 'bg-emerald-50 border-emerald-200 text-emerald-700', dot: 'bg-emerald-500' },
    { label: '31–60 Days', value: totals.b31_60, color: 'bg-amber-50 border-amber-200 text-amber-700',       dot: 'bg-amber-500' },
    { label: '61–90 Days', value: totals.b61_60, color: 'bg-orange-50 border-orange-200 text-orange-700',    dot: 'bg-orange-500' },
    { label: '90+ Days',   value: totals.b90plus, color: 'bg-red-50 border-red-200 text-red-700',            dot: 'bg-red-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Aging Buckets */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {buckets.map((b) => (
          <div key={b.label} className={`rounded-lg border p-4 ${b.color}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${b.dot}`} />
              <p className="text-xs font-medium">{b.label}</p>
            </div>
            <p className="text-2xl font-bold">{fmt(b.value)}</p>
          </div>
        ))}
      </div>

      {/* Payer Breakdown */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-gray-900">A/R Aging by Payer</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Payer</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-emerald-600 uppercase tracking-wide">0–30</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-amber-600 uppercase tracking-wide">31–60</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-orange-600 uppercase tracking-wide">61–90</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-red-600 uppercase tracking-wide">90+</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_AR_PAYERS.map((p) => (
                <tr key={p.payer} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-900">{p.payer}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{fmt(p.b0_30)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{fmt(p.b31_60)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-700">{p.b61_90 ? fmt(p.b61_90) : '—'}</td>
                  <td className="px-3 py-2.5 text-right text-red-600 font-medium">{p.b90plus ? fmt(p.b90plus) : '—'}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{fmt(p.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td className="px-4 py-2.5 text-xs font-semibold text-gray-600">Grand Total</td>
                <td className="px-3 py-2.5 text-right font-bold text-emerald-700">{fmt(totals.b0_30)}</td>
                <td className="px-3 py-2.5 text-right font-bold text-amber-700">{fmt(totals.b31_60)}</td>
                <td className="px-3 py-2.5 text-right font-bold text-orange-700">{fmt(totals.b61_60)}</td>
                <td className="px-3 py-2.5 text-right font-bold text-red-700">{fmt(totals.b90plus)}</td>
                <td className="px-3 py-2.5 text-right font-bold text-gray-900">{fmt(totals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Patient Balances View ─────────────────────────────────────────────────────

const MOCK_PATIENT_BALANCES = [
  { id: 'PAT-00001', name: 'Robert Johnson',   totalCharge: 440,  insurancePaid: 352,  patientResp: 88,  balance: 88,  lastPayment: '2026-02-14' },
  { id: 'PAT-00002', name: 'Maria Santos',     totalCharge: 320,  insurancePaid: 256,  patientResp: 64,  balance: 0,   lastPayment: '2026-03-10' },
  { id: 'PAT-00003', name: 'David Kim',        totalCharge: 580,  insurancePaid: 434,  patientResp: 146, balance: 146, lastPayment: '2026-01-28' },
  { id: 'PAT-00004', name: 'Linda Chen',       totalCharge: 310,  insurancePaid: 0,    patientResp: 310, balance: 310, lastPayment: 'Never' },
  { id: 'PAT-00005', name: 'Thomas Wright',    totalCharge: 660,  insurancePaid: 528,  patientResp: 132, balance: 75,  lastPayment: '2026-03-01' },
  { id: 'PAT-00006', name: 'Susan Park',       totalCharge: 160,  insurancePaid: 128,  patientResp: 32,  balance: 32,  lastPayment: '2026-02-20' },
  { id: 'PAT-00007', name: 'Nancy Williams',   totalCharge: 220,  insurancePaid: 176,  patientResp: 44,  balance: 0,   lastPayment: '2026-03-15' },
  { id: 'PAT-00008', name: 'James Miller',     totalCharge: 580,  insurancePaid: 290,  patientResp: 290, balance: 290, lastPayment: '2026-01-05' },
];

const PatientBalancesView: React.FC = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Patient Balances</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {MOCK_PATIENT_BALANCES.filter((p) => p.balance > 0).length} patients with outstanding balances ·&nbsp;
          {fmt(MOCK_PATIENT_BALANCES.reduce((s, p) => s + p.balance, 0))} total
        </p>
      </div>
      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        Send All Statements
      </button>
    </div>

    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Total Charge</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Ins. Paid</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Patient Resp.</th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Last Payment</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_PATIENT_BALANCES.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-gray-900 text-[11px]">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.id}</p>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-700">{fmt(p.totalCharge)}</td>
                <td className="px-3 py-2.5 text-right text-emerald-700">{p.insurancePaid ? fmt(p.insurancePaid) : '—'}</td>
                <td className="px-3 py-2.5 text-right text-gray-700">{fmt(p.patientResp)}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`font-semibold ${p.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {p.balance > 0 ? fmt(p.balance) : 'Paid'}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-500">{p.lastPayment}</td>
                <td className="px-3 py-2.5">
                  {p.balance > 0 && (
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap px-2 py-1 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
                      Send Statement
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SUB_NAV: { key: SubNav; label: string }[] = [
  { key: 'dashboard',       label: 'Dashboard' },
  { key: 'charges',         label: 'Charges' },
  { key: 'claims',          label: 'Claims' },
  { key: 'era',             label: 'ERA' },
  { key: 'denials',         label: 'Denials' },
  { key: 'ar',              label: 'A/R' },
  { key: 'patient_balances', label: 'Patient Balances' },
];

const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SubNav>('dashboard');

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Billing &amp; RCM</h1>
          <p className="text-sm text-gray-500 mt-0.5">Claims management, denials, and revenue cycle</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {SUB_NAV.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {label}
            {key === 'denials' && (
              <span className="ml-1.5 text-xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                {MOCK_DENIALS.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'claims' && <ClaimsView />}
      {activeTab === 'denials' && <DenialsView />}
      {activeTab === 'charges' && <ChargesView />}
      {activeTab === 'era' && <ERAView />}
      {activeTab === 'ar' && <ARView />}
      {activeTab === 'patient_balances' && <PatientBalancesView />}
    </div>
  );
};

export default BillingPage;
