import { useQuery } from '@tanstack/react-query';
import {
  Users,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface KPI {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'invoice' | 'claim' | 'termination';
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'action_required';
}

const MOCK_KPIS: KPI[] = [
  {
    label: 'Total Employees',
    value: '247',
    change: '+12 this quarter',
    trend: 'up',
    icon: Users,
    color: 'blue',
  },
  {
    label: 'Active Memberships',
    value: '231',
    change: '93.5% enrollment rate',
    trend: 'up',
    icon: CreditCard,
    color: 'green',
  },
  {
    label: 'Outstanding Invoices',
    value: '3',
    change: '$18,420 due',
    trend: 'down',
    icon: FileText,
    color: 'orange',
  },
  {
    label: 'Total Spend YTD',
    value: '$142,880',
    change: '+8.2% vs last year',
    trend: 'neutral',
    icon: DollarSign,
    color: 'purple',
  },
];

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: 'act-001',
    type: 'enrollment',
    description: 'Marcus T. Williams enrolled in BlueCare Plus PPO',
    timestamp: '2026-03-22T09:14:00Z',
    status: 'completed',
  },
  {
    id: 'act-002',
    type: 'invoice',
    description: 'Invoice #INV-2026-0312 payment due Mar 31',
    timestamp: '2026-03-22T08:30:00Z',
    status: 'action_required',
  },
  {
    id: 'act-003',
    type: 'claim',
    description: 'Claim submitted for Sarah K. Nguyen — $1,240',
    timestamp: '2026-03-21T16:45:00Z',
    status: 'pending',
  },
  {
    id: 'act-004',
    type: 'termination',
    description: 'Coverage terminated for James R. Patterson (voluntarily left)',
    timestamp: '2026-03-21T11:00:00Z',
    status: 'completed',
  },
  {
    id: 'act-005',
    type: 'enrollment',
    description: 'Open enrollment reminder sent to 16 employees',
    timestamp: '2026-03-20T09:00:00Z',
    status: 'completed',
  },
];

const PLAN_BREAKDOWN = [
  { plan: 'BlueCare Plus PPO', enrolled: 142, premium: '$520/mo', total: '$73,840/mo' },
  { plan: 'HealthSpring HMO', enrolled: 67, premium: '$380/mo', total: '$25,460/mo' },
  { plan: 'Anthem HSA Bronze', enrolled: 22, premium: '$240/mo', total: '$5,280/mo' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  green: 'bg-green-50 text-green-700 border-green-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
};

const iconColorMap: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
};

const statusConfig = {
  completed: { icon: CheckCircle2, class: 'text-green-600', label: 'Completed' },
  pending: { icon: Clock, class: 'text-yellow-600', label: 'Pending' },
  action_required: { icon: AlertCircle, class: 'text-red-600', label: 'Action Required' },
};

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  const { data: kpis, isLoading } = useQuery({
    queryKey: ['employer-kpis'],
    queryFn: async (): Promise<KPI[]> => {
      await new Promise((r) => setTimeout(r, 600));
      return MOCK_KPIS;
    },
  });

  const { data: activities } = useQuery({
    queryKey: ['employer-activities'],
    queryFn: async (): Promise<RecentActivity[]> => {
      await new Promise((r) => setTimeout(r, 400));
      return MOCK_ACTIVITIES;
    },
  });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{today} · {user?.company}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            ))
          : kpis?.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${colorMap[kpi.color]}`}>
                      <Icon className={`w-4 h-4 ${iconColorMap[kpi.color]}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {kpi.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    <p className="text-xs text-gray-500">{kpi.change}</p>
                  </div>
                </div>
              );
            })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Plan Breakdown */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Plan Enrollment Breakdown</h2>
            <p className="text-xs text-gray-500 mt-0.5">Current billing period — March 2026</p>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left pb-3">Plan</th>
                  <th className="text-right pb-3">Enrolled</th>
                  <th className="text-right pb-3">Premium/Employee</th>
                  <th className="text-right pb-3">Monthly Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PLAN_BREAKDOWN.map((row) => (
                  <tr key={row.plan} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-800">{row.plan}</td>
                    <td className="py-3 text-right text-gray-600">{row.enrolled}</td>
                    <td className="py-3 text-right text-gray-600">{row.premium}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td className="pt-3 font-semibold text-gray-900">Total</td>
                  <td className="pt-3 text-right font-semibold text-gray-900">231</td>
                  <td className="pt-3" />
                  <td className="pt-3 text-right font-bold text-blue-700">$104,580/mo</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activities?.map((activity) => {
              const sc = statusConfig[activity.status];
              const StatusIcon = sc.icon;
              return (
                <div key={activity.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${sc.class}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
