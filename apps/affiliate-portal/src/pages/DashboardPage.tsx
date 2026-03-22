import { useQuery } from '@tanstack/react-query';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface ReferralStat {
  month: string;
  referred: number;
  converted: number;
  commission: string;
}

const MOCK_STATS: ReferralStat[] = [
  { month: 'Oct 2025', referred: 8, converted: 6, commission: '$720' },
  { month: 'Nov 2025', referred: 11, converted: 9, commission: '$1,080' },
  { month: 'Dec 2025', referred: 7, converted: 5, commission: '$600' },
  { month: 'Jan 2026', referred: 14, converted: 11, commission: '$1,320' },
  { month: 'Feb 2026', referred: 12, converted: 10, commission: '$1,200' },
  { month: 'Mar 2026', referred: 9, converted: 7, commission: '$840' },
];

const MOCK_RECENT_REFERRALS = [
  { id: 'REF-9021', name: 'Olivia M. Carter', status: 'converted', date: '2026-03-20', commission: '$120' },
  { id: 'REF-9020', name: 'Benjamin T. Flores', status: 'pending', date: '2026-03-18', commission: '$120' },
  { id: 'REF-9019', name: 'Hannah R. Simmons', status: 'converted', date: '2026-03-15', commission: '$120' },
  { id: 'REF-9018', name: 'Derek L. Washington', status: 'converted', date: '2026-03-12', commission: '$120' },
  { id: 'REF-9017', name: 'Priya K. Sharma', status: 'pending', date: '2026-03-10', commission: '$120' },
];

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  const { data: stats } = useQuery({
    queryKey: ['affiliate-stats'],
    queryFn: async (): Promise<ReferralStat[]> => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_STATS;
    },
  });

  const totalReferred = stats?.reduce((s, r) => s + r.referred, 0) ?? 0;
  const totalConverted = stats?.reduce((s, r) => s + r.converted, 0) ?? 0;
  const conversionRate = totalReferred > 0 ? Math.round((totalConverted / totalReferred) * 100) : 0;
  const totalCommission = '$5,760';

  const kpis = [
    { label: 'Referred Patients', value: String(totalReferred), sub: 'Last 6 months', icon: Users, color: 'blue' },
    { label: 'Converted', value: String(totalConverted), sub: `${conversionRate}% conversion rate`, icon: TrendingUp, color: 'green' },
    { label: 'Active Referrals', value: '2', sub: 'Awaiting conversion', icon: Activity, color: 'yellow' },
    { label: 'Commission Earned', value: totalCommission, sub: 'Last 6 months', icon: DollarSign, color: 'purple' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user?.organization} · Affiliate ID: {user?.organizationId}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[kpi.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly trend table */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Monthly Referral Performance</h2>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left pb-3">Month</th>
                  <th className="text-right pb-3">Referred</th>
                  <th className="text-right pb-3">Converted</th>
                  <th className="text-right pb-3">Rate</th>
                  <th className="text-right pb-3">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.map((row) => {
                  const rate = row.referred > 0 ? Math.round((row.converted / row.referred) * 100) : 0;
                  return (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-gray-800">{row.month}</td>
                      <td className="py-2.5 text-right text-gray-600">{row.referred}</td>
                      <td className="py-2.5 text-right text-gray-600">{row.converted}</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-xs font-medium ${rate >= 75 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {rate}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">{row.commission}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent referrals */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Referrals</h2>
            <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_RECENT_REFERRALS.map((ref) => (
              <div key={ref.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {ref.status === 'converted'
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    : <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ref.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(ref.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ref.id}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{ref.commission}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
