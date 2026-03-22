import { useQuery } from '@tanstack/react-query';
import { Shield, Users, Calendar, TrendingUp, CheckCircle2, Info } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  carrier: string;
  type: string;
  enrolled: number;
  premium: string;
  monthlyTotal: string;
  deductible: string;
  outOfPocketMax: string;
  renewalDate: string;
  coverageIncludes: string[];
}

interface OpenEnrollment {
  startDate: string;
  endDate: string;
  pendingActions: number;
}

const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-001',
    name: 'BlueCare Plus PPO',
    carrier: 'Anthem Blue Cross Blue Shield',
    type: 'PPO',
    enrolled: 142,
    premium: '$520/member/mo',
    monthlyTotal: '$73,840/mo',
    deductible: '$500 individual / $1,000 family',
    outOfPocketMax: '$3,000 individual / $6,000 family',
    renewalDate: '2027-01-01',
    coverageIncludes: ['Primary Care', 'Specialist Visits', 'Emergency', 'Mental Health', 'Prescription (Tier 1–3)', 'Lab & Imaging', 'Telehealth'],
  },
  {
    id: 'plan-002',
    name: 'HealthSpring HMO',
    carrier: 'UnitedHealthcare',
    type: 'HMO',
    enrolled: 67,
    premium: '$380/member/mo',
    monthlyTotal: '$25,460/mo',
    deductible: '$1,000 individual / $2,000 family',
    outOfPocketMax: '$4,500 individual / $9,000 family',
    renewalDate: '2027-01-01',
    coverageIncludes: ['Primary Care', 'Specialist Visits (referral required)', 'Emergency', 'Prescription (Tier 1–2)', 'Lab & Imaging'],
  },
  {
    id: 'plan-003',
    name: 'Anthem HSA Bronze',
    carrier: 'Anthem',
    type: 'HDHP + HSA',
    enrolled: 22,
    premium: '$240/member/mo',
    monthlyTotal: '$5,280/mo',
    deductible: '$2,800 individual / $5,600 family',
    outOfPocketMax: '$7,000 individual / $14,000 family',
    renewalDate: '2027-01-01',
    coverageIncludes: ['Preventive Care (100%)', 'Emergency', 'Prescription (post-deductible)', 'Lab & Imaging (post-deductible)', 'HSA Eligible'],
  },
];

const MOCK_OPEN_ENROLLMENT: OpenEnrollment = {
  startDate: '2026-10-15',
  endDate: '2026-11-15',
  pendingActions: 16,
};

const MembershipsPage = () => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['employer-memberships'],
    queryFn: async (): Promise<Plan[]> => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_PLANS;
    },
  });

  const totalEnrolled = plans?.reduce((sum, p) => sum + p.enrolled, 0) ?? 0;
  const totalMonthly = '$104,580';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Memberships</h1>
        <p className="text-sm text-gray-500 mt-0.5">Active plans and coverage details for your workforce</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Enrolled</p>
            <p className="text-xl font-bold text-gray-900">{totalEnrolled}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Spend</p>
            <p className="text-xl font-bold text-gray-900">{totalMonthly}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Open Enrollment</p>
            <p className="text-xl font-bold text-gray-900">Oct 15, 2026</p>
          </div>
        </div>
      </div>

      {/* Open Enrollment Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800">Open Enrollment: Oct 15 – Nov 15, 2026</p>
          <p className="text-sm text-blue-700 mt-0.5">
            {MOCK_OPEN_ENROLLMENT.pendingActions} employees have not yet completed their benefits selection. Send reminders from the Employees page.
          </p>
        </div>
        <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
          Send Reminder
        </button>
      </div>

      {/* Plans */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                <div className="h-5 w-48 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-full bg-gray-100 rounded" />
              </div>
            ))
          : plans?.map((plan) => (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Plan header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{plan.type}</span>
                      </div>
                      <p className="text-sm text-gray-500">{plan.carrier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{plan.enrolled} enrolled</p>
                    <p className="text-sm text-gray-500">{plan.monthlyTotal}</p>
                  </div>
                </div>

                {/* Plan details */}
                <div className="px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Premium</p>
                    <p className="text-sm font-medium text-gray-900">{plan.premium}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Deductible</p>
                    <p className="text-sm font-medium text-gray-900">{plan.deductible}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Out-of-Pocket Max</p>
                    <p className="text-sm font-medium text-gray-900">{plan.outOfPocketMax}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Renewal Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(plan.renewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Coverage */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Coverage Includes</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.coverageIncludes.map((item) => (
                      <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs text-gray-600">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default MembershipsPage;
