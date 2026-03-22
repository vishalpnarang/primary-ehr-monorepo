import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, CheckCircle2, Clock, XCircle, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAffiliatePatients } from '@/hooks/useApi';

interface ReferredPatient {
  id: string;
  referralId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  referredOn: string;
  status: 'converted' | 'pending' | 'declined';
  plan: string;
  primaryCareProvider: string;
  commission: string;
}

const MOCK_PATIENTS: ReferredPatient[] = [
  { id: 'PAT-07821', referralId: 'REF-9021', firstName: 'Olivia', lastName: 'Carter', dateOfBirth: '1991-08-14', referredOn: '2026-03-10', status: 'converted', plan: 'BlueCare Plus PPO', primaryCareProvider: 'Dr. Anita Patel', commission: '$120' },
  { id: 'PAT-07819', referralId: 'REF-9020', firstName: 'Benjamin', lastName: 'Flores', dateOfBirth: '1985-02-27', referredOn: '2026-03-08', status: 'pending', plan: '—', primaryCareProvider: '—', commission: '$120' },
  { id: 'PAT-07801', referralId: 'REF-9019', firstName: 'Hannah', lastName: 'Simmons', dateOfBirth: '1978-11-03', referredOn: '2026-03-01', status: 'converted', plan: 'HealthSpring HMO', primaryCareProvider: 'Dr. James Liu', commission: '$120' },
  { id: 'PAT-07792', referralId: 'REF-9018', firstName: 'Derek', lastName: 'Washington', dateOfBirth: '1993-06-19', referredOn: '2026-02-22', status: 'converted', plan: 'BlueCare Plus PPO', primaryCareProvider: 'Dr. Anita Patel', commission: '$120' },
  { id: 'PAT-07788', referralId: 'REF-9017', firstName: 'Priya', lastName: 'Sharma', dateOfBirth: '2001-04-08', referredOn: '2026-02-18', status: 'pending', plan: '—', primaryCareProvider: '—', commission: '$120' },
  { id: 'PAT-07771', referralId: 'REF-9014', firstName: 'Carlos', lastName: 'Mendez', dateOfBirth: '1967-09-30', referredOn: '2026-02-10', status: 'converted', plan: 'Anthem HSA Bronze', primaryCareProvider: 'Dr. Rachel Green', commission: '$120' },
  { id: 'PAT-07760', referralId: 'REF-9011', firstName: 'Jasmine', lastName: 'O\'Brien', dateOfBirth: '1988-01-15', referredOn: '2026-01-28', status: 'declined', plan: '—', primaryCareProvider: '—', commission: '$0' },
];

const statusConfig = {
  converted: { label: 'Enrolled', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border border-green-200' },
  pending: { label: 'Pending', icon: Clock, class: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  declined: { label: 'Declined', icon: XCircle, class: 'bg-gray-50 text-gray-500 border border-gray-200' },
};

const PatientsPage = () => {
  const [search, setSearch] = useState('');

  const user = useAuthStore((s) => s.user);
  const affiliateId = user?.organizationId ?? '';

  // Real API — falls back to MOCK_PATIENTS when backend is down
  const { data: apiPatients, isLoading: apiLoading } = useAffiliatePatients(affiliateId);

  const { data: patients, isLoading } = useQuery({
    queryKey: ['affiliate-patients', affiliateId],
    queryFn: async (): Promise<ReferredPatient[]> => {
      if (Array.isArray(apiPatients) && apiPatients.length > 0) {
        return apiPatients as ReferredPatient[];
      }
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_PATIENTS;
    },
    enabled: !apiLoading,
  });

  const filtered = (patients ?? []).filter(
    (p) =>
      search === '' ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.referralId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Referred Patients</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Read-only view — patient clinical data is protected by HIPAA.
        </p>
      </div>

      {/* HIPAA notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
        <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          You can view referral status and commission information only. Full medical records are accessible exclusively by the patient's care team.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or referral ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="p-12 text-center text-gray-400 text-sm">No patients match your search.</div>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Referral</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Date of Birth</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Referred On</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Plan</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const sc = statusConfig[p.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{p.referralId}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                            {p.firstName[0]}{p.lastName[0]}
                          </div>
                          <span className="font-medium text-gray-900">{p.firstName} {p.lastName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(p.referredOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.plan}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{p.commission}</td>
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

export default PatientsPage;
