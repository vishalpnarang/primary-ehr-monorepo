import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, Users, CheckCircle2, Clock, AlertCircle, Plus, Phone, Mail } from 'lucide-react';

interface ManagedEmployer {
  id: string;
  name: string;
  industry: string;
  city: string;
  state: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  totalEmployees: number;
  enrolled: number;
  activePlans: string[];
  monthlyPremium: string;
  renewalDate: string;
  status: 'active' | 'renewing' | 'at_risk';
  sinceYear: number;
}

const MOCK_EMPLOYERS: ManagedEmployer[] = [
  {
    id: 'EMP-00042', name: 'Meridian Technology Solutions', industry: 'Technology', city: 'Columbus', state: 'OH',
    contactName: 'Patricia Harrington', contactEmail: 'pharrington@meridiantech.com', contactPhone: '(614) 555-0291',
    totalEmployees: 247, enrolled: 231, activePlans: ['BlueCare Plus PPO', 'HealthSpring HMO', 'Anthem HSA Bronze'],
    monthlyPremium: '$104,580', renewalDate: '2027-01-01', status: 'active', sinceYear: 2021,
  },
  {
    id: 'EMP-00067', name: 'Lakeside Healthcare Partners', industry: 'Healthcare', city: 'Cleveland', state: 'OH',
    contactName: 'Norman Bradley', contactEmail: 'nbradley@lakesidehp.com', contactPhone: '(216) 555-0182',
    totalEmployees: 189, enrolled: 174, activePlans: ['BlueCare Plus PPO', 'HealthSpring HMO'],
    monthlyPremium: '$78,300', renewalDate: '2026-07-01', status: 'renewing', sinceYear: 2022,
  },
  {
    id: 'EMP-00081', name: 'Columbus Distribution Co.', industry: 'Logistics', city: 'Columbus', state: 'OH',
    contactName: 'Tamara Nguyen', contactEmail: 'tnguyen@columbusdc.com', contactPhone: '(614) 555-0444',
    totalEmployees: 312, enrolled: 289, activePlans: ['BlueCare Plus PPO', 'Anthem HSA Bronze'],
    monthlyPremium: '$127,160', renewalDate: '2027-01-01', status: 'active', sinceYear: 2020,
  },
  {
    id: 'EMP-00095', name: 'Buckeye Financial Services', industry: 'Finance', city: 'Dayton', state: 'OH',
    contactName: 'Jerome Whitfield', contactEmail: 'jwhitfield@buckeyefin.com', contactPhone: '(937) 555-0219',
    totalEmployees: 88, enrolled: 79, activePlans: ['HealthSpring HMO'],
    monthlyPremium: '$35,560', renewalDate: '2026-09-01', status: 'at_risk', sinceYear: 2023,
  },
  {
    id: 'EMP-00103', name: 'Summit Engineering Group', industry: 'Engineering', city: 'Cincinnati', state: 'OH',
    contactName: 'Alicia Monroe', contactEmail: 'amonroe@summiteng.com', contactPhone: '(513) 555-0337',
    totalEmployees: 143, enrolled: 130, activePlans: ['BlueCare Plus PPO', 'Anthem HSA Bronze'],
    monthlyPremium: '$58,500', renewalDate: '2027-01-01', status: 'active', sinceYear: 2022,
  },
];

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border border-green-200' },
  renewing: { label: 'Up for Renewal', icon: Clock, class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  at_risk: { label: 'At Risk', icon: AlertCircle, class: 'bg-red-50 text-red-700 border border-red-200' },
};

const EmployersPage = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: employers, isLoading } = useQuery({
    queryKey: ['broker-employers'],
    queryFn: async (): Promise<ManagedEmployer[]> => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_EMPLOYERS;
    },
  });

  const filtered = (employers ?? []).filter(
    (e) =>
      search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.industry.toLowerCase().includes(search.toLowerCase()) ||
      e.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {employers?.length ?? 0} managed accounts · {employers?.filter((e) => e.status === 'at_risk').length ?? 0} at risk
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Employer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, industry, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Employer cards */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse h-20" />
            ))
          : filtered.map((emp) => {
              const sc = statusConfig[emp.status];
              const StatusIcon = sc.icon;
              const isOpen = expanded === emp.id;

              return (
                <div key={emp.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                  <button
                    onClick={() => setExpanded(isOpen ? null : emp.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left"
                  >
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{emp.industry} · {emp.city}, {emp.state} · Client since {emp.sinceYear}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900">{emp.monthlyPremium}<span className="font-normal text-gray-400 text-xs">/mo</span></p>
                      <p className="text-xs text-gray-400">{emp.enrolled}/{emp.totalEmployees} enrolled</p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Primary Contact</p>
                        <p className="text-sm font-medium text-gray-900">{emp.contactName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <a href={`mailto:${emp.contactEmail}`} className="text-xs text-blue-600 hover:underline">{emp.contactEmail}</a>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{emp.contactPhone}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Active Plans</p>
                        <div className="flex flex-col gap-1">
                          {emp.activePlans.map((plan) => (
                            <span key={plan} className="text-xs text-gray-700">{plan}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Renewal Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(emp.renewalDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {Math.ceil((new Date(emp.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))} months away
                        </p>
                      </div>
                      <div className="col-span-2 lg:col-span-3 flex items-center gap-2 pt-2">
                        <button className="px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors">
                          View Full Account
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors">
                          Send Renewal Proposal
                        </button>
                        <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors">
                          <Users className="w-3.5 h-3.5 inline mr-1" />
                          View Employees
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default EmployersPage;
