import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, UserPlus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useEmployees } from '@/hooks/useApi';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  plan: string;
  status: 'active' | 'pending' | 'terminated';
  hireDate: string;
  dependents: number;
  premium: string;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'EMP-00101', firstName: 'Marcus', lastName: 'Williams', email: 'mwilliams@meridiantech.com', department: 'Engineering', plan: 'BlueCare Plus PPO', status: 'active', hireDate: '2022-06-01', dependents: 2, premium: '$520/mo' },
  { id: 'EMP-00102', firstName: 'Sarah', lastName: 'Nguyen', email: 'snguyen@meridiantech.com', department: 'Product', plan: 'BlueCare Plus PPO', status: 'active', hireDate: '2021-03-15', dependents: 1, premium: '$520/mo' },
  { id: 'EMP-00103', firstName: 'David', lastName: 'Okafor', email: 'dokafor@meridiantech.com', department: 'Sales', plan: 'HealthSpring HMO', status: 'active', hireDate: '2023-01-10', dependents: 0, premium: '$380/mo' },
  { id: 'EMP-00104', firstName: 'Jennifer', lastName: 'Martinez', email: 'jmartinez@meridiantech.com', department: 'HR', plan: 'BlueCare Plus PPO', status: 'active', hireDate: '2020-08-22', dependents: 3, premium: '$520/mo' },
  { id: 'EMP-00105', firstName: 'Robert', lastName: 'Chen', email: 'rchen@meridiantech.com', department: 'Finance', plan: 'Anthem HSA Bronze', status: 'active', hireDate: '2022-11-01', dependents: 0, premium: '$240/mo' },
  { id: 'EMP-00106', firstName: 'Amara', lastName: 'Johnson', email: 'ajohnson@meridiantech.com', department: 'Engineering', plan: 'HealthSpring HMO', status: 'active', hireDate: '2023-07-05', dependents: 1, premium: '$380/mo' },
  { id: 'EMP-00107', firstName: 'Thomas', lastName: 'Rivera', email: 'trivera@meridiantech.com', department: 'Operations', plan: 'BlueCare Plus PPO', status: 'pending', hireDate: '2026-03-15', dependents: 0, premium: '$520/mo' },
  { id: 'EMP-00108', firstName: 'Lisa', lastName: 'Thompson', email: 'lthompson@meridiantech.com', department: 'Marketing', plan: 'Anthem HSA Bronze', status: 'active', hireDate: '2021-09-12', dependents: 2, premium: '$240/mo' },
  { id: 'EMP-00109', firstName: 'Kevin', lastName: 'Patel', email: 'kpatel@meridiantech.com', department: 'Engineering', plan: 'BlueCare Plus PPO', status: 'active', hireDate: '2023-04-18', dependents: 1, premium: '$520/mo' },
  { id: 'EMP-00110', firstName: 'James', lastName: 'Patterson', email: 'jpatterson@meridiantech.com', department: 'Sales', plan: 'HealthSpring HMO', status: 'terminated', hireDate: '2019-02-28', dependents: 0, premium: '—' },
];

const statusConfig = {
  active: { label: 'Active', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border border-green-200' },
  pending: { label: 'Pending', icon: Clock, class: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  terminated: { label: 'Terminated', icon: XCircle, class: 'bg-red-50 text-red-700 border border-red-200' },
};

const EmployeesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'terminated'>('all');

  const user = useAuthStore((s) => s.user);
  const companyId = user?.companyId ?? '';

  // Real API — falls back to MOCK_EMPLOYEES when backend is down
  const { data: apiEmployees, isLoading: apiLoading } = useEmployees(companyId);

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employer-employees', companyId],
    queryFn: async (): Promise<Employee[]> => {
      if (Array.isArray(apiEmployees) && apiEmployees.length > 0) {
        return apiEmployees as Employee[];
      }
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_EMPLOYEES;
    },
    enabled: !apiLoading,
  });

  const filtered = (employees ?? []).filter((emp) => {
    const matchesSearch =
      search === '' ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {employees?.length ?? 0} total · {employees?.filter((e) => e.status === 'active').length ?? 0} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-2" />
          {(['all', 'active', 'pending', 'terminated'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">No employees match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Dependents</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Premium</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Hire Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((emp) => {
                  const sc = statusConfig[emp.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-gray-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{emp.plan}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{emp.dependents}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{emp.premium}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(emp.hireDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
