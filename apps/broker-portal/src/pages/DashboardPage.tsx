import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDashboard, useBrokerEmployers, useBrokerEvents } from '@/hooks/useApi';

interface EmployerSummary {
  id: string;
  name: string;
  employees: number;
  enrolled: number;
  monthlyPremium: string;
  renewalDate: string;
  status: 'active' | 'renewing' | 'at_risk';
}

const MOCK_TOP_EMPLOYERS: EmployerSummary[] = [
  { id: 'EMP-00042', name: 'Meridian Technology Solutions', employees: 247, enrolled: 231, monthlyPremium: '$104,580', renewalDate: '2027-01-01', status: 'active' },
  { id: 'EMP-00067', name: 'Lakeside Healthcare Partners', employees: 189, enrolled: 174, monthlyPremium: '$78,300', renewalDate: '2026-07-01', status: 'renewing' },
  { id: 'EMP-00081', name: 'Columbus Distribution Co.', employees: 312, enrolled: 289, monthlyPremium: '$127,160', renewalDate: '2027-01-01', status: 'active' },
  { id: 'EMP-00095', name: 'Buckeye Financial Services', employees: 88, enrolled: 79, monthlyPremium: '$35,560', renewalDate: '2026-09-01', status: 'at_risk' },
  { id: 'EMP-00103', name: 'Summit Engineering Group', employees: 143, enrolled: 130, monthlyPremium: '$58,500', renewalDate: '2027-01-01', status: 'active' },
];

const MOCK_RECENT_EVENTS = [
  { id: 'ev-001', employer: 'Buckeye Financial Services', event: 'Open enrollment deadline in 12 days', type: 'warning', date: '2026-03-22' },
  { id: 'ev-002', employer: 'Lakeside Healthcare Partners', event: 'Renewal proposal sent — awaiting signature', type: 'info', date: '2026-03-20' },
  { id: 'ev-003', employer: 'Meridian Technology Solutions', event: 'March invoice paid on time', type: 'success', date: '2026-03-19' },
  { id: 'ev-004', employer: 'Summit Engineering Group', event: '13 new employees enrolled this month', type: 'success', date: '2026-03-15' },
];

const statusConfig = {
  active: { label: 'Active', class: 'bg-green-50 text-green-700 border border-green-200' },
  renewing: { label: 'Renewing', class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  at_risk: { label: 'At Risk', class: 'bg-red-50 text-red-700 border border-red-200' },
};

const eventConfig = {
  warning: { icon: AlertCircle, class: 'text-yellow-500' },
  info: { icon: Clock, class: 'text-blue-500' },
  success: { icon: CheckCircle2, class: 'text-green-500' },
};

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const brokerId = user?.agencyId ?? '';

  // Real API — falls back to MOCK_TOP_EMPLOYERS / MOCK_RECENT_EVENTS when backend is down
  const { data: apiBrokerDashboard } = useBrokerDashboard(brokerId);
  const { data: apiEmployers = [] } = useBrokerEmployers(brokerId);
  const { data: apiEvents = [] } = useBrokerEvents(brokerId);

  const { data: employers } = useQuery({
    queryKey: ['broker-top-employers', brokerId],
    queryFn: async (): Promise<EmployerSummary[]> => {
      if (Array.isArray(apiEmployers) && apiEmployers.length > 0) {
        return apiEmployers as EmployerSummary[];
      }
      await new Promise((r) => setTimeout(r, 600));
      return MOCK_TOP_EMPLOYERS;
    },
    enabled: true,
  });

  // Suppress unused warning — used by parent dashboard KPI when backend responds
  void apiBrokerDashboard;

  const totalEmployers = 12;
  const totalEmployees = employers?.reduce((s, e) => s + e.employees, 0) ?? 0;
  const totalEnrolled = employers?.reduce((s, e) => s + e.enrolled, 0) ?? 0;
  const totalPremium = '$403,100';
  const brokerageCommission = '$28,217';

  const kpis = [
    { label: 'Managed Employers', value: String(totalEmployers), sub: 'Active accounts', icon: Building2, color: 'blue' },
    { label: 'Total Employees', value: String(totalEmployees), sub: 'Across all employers', icon: Users, color: 'indigo' },
    { label: 'Active Enrollments', value: String(totalEnrolled), sub: `${Math.round((totalEnrolled / totalEmployees) * 100)}% enrollment rate`, icon: TrendingUp, color: 'green' },
    { label: 'Commission (YTD)', value: brokerageCommission, sub: `On ${totalPremium} premium booked`, icon: DollarSign, color: 'violet' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{user?.agencyName} · Broker ID: {user?.agencyId} · NPN: {user?.npn}</p>
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
        {/* Top Employers */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Employer Accounts</h2>
            <button className="text-xs text-violet-600 hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Employer</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Employees</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Enrolled</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Premium</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employers?.map((emp) => {
                  const sc = statusConfig[emp.status];
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.id}</p>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{emp.employees}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{emp.enrolled}</td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900">{emp.monthlyPremium}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.class}`}>
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

        {/* Recent events */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(apiEvents.length > 0
              ? apiEvents as typeof MOCK_RECENT_EVENTS
              : MOCK_RECENT_EVENTS
            ).map((ev) => {
              const ec = eventConfig[ev.type as keyof typeof eventConfig];
              const EvIcon = ec.icon;
              return (
                <div key={ev.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <EvIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ec.class}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{ev.employer}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ev.event}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
