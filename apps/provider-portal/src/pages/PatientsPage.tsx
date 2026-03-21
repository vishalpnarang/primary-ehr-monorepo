import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Clock,
  ChevronRight,
  X,
  User,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Types ───────────────────────────────────────────────────────────────────

type PatientStatus = 'active' | 'inactive' | 'deceased';

interface MockPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  insurance: {
    payerName: string;
    planType: string;
    verified: boolean;
  };
  status: PatientStatus;
  lastVisitDate?: string;
  primaryProvider: string;
  hasHighRisk: boolean;
  hasCareGap: boolean;
  hasBalance: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS: MockPatient[] = [
  {
    id: 'PAT-10001', mrn: 'MRN-10001',
    firstName: 'Sarah', lastName: 'Johnson',
    dob: '1981-06-14', age: 44, sex: 'Female',
    phone: '(312) 555-0142', email: 'sarah.johnson@email.com',
    insurance: { payerName: 'Blue Cross Blue Shield', planType: 'PPO', verified: true },
    status: 'active', lastVisitDate: '2026-01-08', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: true, hasCareGap: true, hasBalance: false,
  },
  {
    id: 'PAT-10002', mrn: 'MRN-10002',
    firstName: 'Marcus', lastName: 'Rivera',
    dob: '1964-02-28', age: 62, sex: 'Male',
    phone: '(773) 555-0274', email: 'marcus.rivera@email.com',
    insurance: { payerName: 'Medicare', planType: 'Medicare Part B', verified: true },
    status: 'active', lastVisitDate: '2026-02-12', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: true, hasCareGap: true, hasBalance: false,
  },
  {
    id: 'PAT-10003', mrn: 'MRN-10003',
    firstName: 'Linda', lastName: 'Chen',
    dob: '1988-09-03', age: 37, sex: 'Female',
    phone: '(312) 555-0388', email: 'linda.chen@email.com',
    insurance: { payerName: 'Aetna', planType: 'HMO', verified: true },
    status: 'active', lastVisitDate: '2026-03-05', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: true, hasCareGap: false, hasBalance: false,
  },
  {
    id: 'PAT-10004', mrn: 'MRN-10004',
    firstName: 'James', lastName: 'Thompson',
    dob: '1955-11-17', age: 70, sex: 'Male',
    phone: '(847) 555-0417', email: 'james.thompson@email.com',
    insurance: { payerName: 'UnitedHealthcare', planType: 'Medicare Advantage', verified: true },
    status: 'active', lastVisitDate: '2026-02-28', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: true, hasCareGap: false, hasBalance: true,
  },
  {
    id: 'PAT-10005', mrn: 'MRN-10005',
    firstName: 'Aisha', lastName: 'Williams',
    dob: '1998-04-22', age: 27, sex: 'Female',
    phone: '(312) 555-0522', email: 'aisha.williams@email.com',
    insurance: { payerName: 'Cigna', planType: 'PPO', verified: true },
    status: 'active', lastVisitDate: '2025-12-15', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: false, hasCareGap: true, hasBalance: false,
  },
  {
    id: 'PAT-10006', mrn: 'MRN-10006',
    firstName: 'Robert', lastName: 'Martinez',
    dob: '1971-08-05', age: 54, sex: 'Male',
    phone: '(708) 555-0611', email: 'robert.martinez@email.com',
    insurance: { payerName: 'Blue Cross Blue Shield', planType: 'HMO', verified: true },
    status: 'active', lastVisitDate: '2026-01-22', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: false, hasCareGap: false, hasBalance: true,
  },
  {
    id: 'PAT-10007', mrn: 'MRN-10007',
    firstName: 'Emma', lastName: 'Davis',
    dob: '2018-02-14', age: 8, sex: 'Female',
    phone: '(312) 555-0712',
    insurance: { payerName: 'Aetna', planType: 'HMO', verified: true },
    status: 'active', lastVisitDate: '2026-02-01', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: true, hasCareGap: false, hasBalance: false,
  },
  {
    id: 'PAT-10008', mrn: 'MRN-10008',
    firstName: 'William', lastName: 'Park',
    dob: '1977-12-09', age: 48, sex: 'Male',
    phone: '(847) 555-0812', email: 'william.park@email.com',
    insurance: { payerName: 'Blue Cross Blue Shield', planType: 'PPO', verified: true },
    status: 'active', lastVisitDate: '2026-03-10', primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: true, hasCareGap: true, hasBalance: false,
  },
  {
    id: 'PAT-10009', mrn: 'MRN-10009',
    firstName: 'Catherine', lastName: "O'Brien",
    dob: '1959-03-27', age: 66, sex: 'Female',
    phone: '(312) 555-0912', email: 'catherine.obrien@email.com',
    insurance: { payerName: 'Medicare', planType: 'Medicare Part B', verified: true },
    status: 'active', lastVisitDate: '2026-02-20', primaryProvider: 'Dr. James Wilson',
    hasHighRisk: true, hasCareGap: true, hasBalance: false,
  },
  {
    id: 'PAT-10010', mrn: 'MRN-10010',
    firstName: 'Michael', lastName: 'Brown',
    dob: '1993-07-11', age: 32, sex: 'Male',
    phone: '(312) 555-1012', email: 'michael.brown@email.com',
    insurance: { payerName: 'Self-Pay', planType: 'Self-Pay', verified: true },
    status: 'active', lastVisitDate: undefined, primaryProvider: 'Dr. Emily Chen',
    hasHighRisk: false, hasCareGap: false, hasBalance: false,
  },
];

const RECENT_PATIENT_IDS = ['PAT-10008', 'PAT-10001', 'PAT-10003', 'PAT-10006', 'PAT-10004'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDob(dob: string): string {
  return new Date(dob + 'T12:00:00').toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
  });
}

function formatLastVisit(date: string | undefined): string {
  if (!date) return '—';
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-amber-100 text-amber-700',
  ];
  const index = parseInt(id.replace(/\D/g, ''), 10) % colors.length;
  return colors[index];
}

function matchesSearch(patient: MockPatient, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    patient.firstName.toLowerCase().includes(q) ||
    patient.lastName.toLowerCase().includes(q) ||
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(q) ||
    patient.mrn.toLowerCase().includes(q) ||
    patient.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
    patient.dob.includes(q) ||
    (patient.email?.toLowerCase().includes(q) ?? false)
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

interface PatientAvatarProps {
  patient: MockPatient;
  size?: 'sm' | 'md';
}

const PatientAvatar: React.FC<PatientAvatarProps> = ({ patient, size = 'md' }) => {
  const colorClass = getAvatarColor(patient.id);
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm';
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', colorClass, sizeClass)}>
      {getInitials(patient.firstName, patient.lastName)}
    </div>
  );
};

// ─── Risk Flags ───────────────────────────────────────────────────────────────

const PatientFlags: React.FC<{ patient: MockPatient }> = ({ patient }) => (
  <div className="flex items-center gap-1">
    {patient.hasHighRisk && (
      <span title="High Risk" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-600 border border-red-200">
        <AlertTriangle className="w-2.5 h-2.5" />
        High Risk
      </span>
    )}
    {patient.hasCareGap && (
      <span title="Care Gap" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
        <Clock className="w-2.5 h-2.5" />
        Care Gap
      </span>
    )}
    {patient.hasBalance && (
      <span title="Outstanding Balance" className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
        $ Balance
      </span>
    )}
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: PatientStatus }> = ({ status }) => {
  const config: Record<PatientStatus, { label: string; classes: string; icon: React.ReactNode }> = {
    active:   { label: 'Active',   classes: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle className="w-3 h-3" /> },
    inactive: { label: 'Inactive', classes: 'bg-slate-100 text-slate-500 border-slate-200',    icon: <XCircle className="w-3 h-3" /> },
    deceased: { label: 'Deceased', classes: 'bg-gray-100 text-gray-400 border-slate-200',    icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', c.classes)}>
      {c.icon}
      {c.label}
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TableSkeleton: React.FC = () => (
  <div className="animate-pulse">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-2.5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-36" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
        <div className="w-24 h-3 bg-gray-100 rounded" />
        <div className="w-20 h-3 bg-gray-100 rounded" />
        <div className="w-28 h-3 bg-gray-100 rounded" />
        <div className="w-32 h-3 bg-gray-100 rounded" />
        <div className="w-16 h-3 bg-gray-100 rounded" />
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptySearch: React.FC<{ query: string; onClear: () => void }> = ({ query, onClear }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Search className="w-5 h-5 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-700">No patients found</p>
    <p className="text-xs text-gray-400 mt-1">
      No results for <span className="font-medium text-gray-600">"{query}"</span>
    </p>
    <button
      onClick={onClear}
      className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
    >
      Clear search
    </button>
  </div>
);

// ─── Column sort types ────────────────────────────────────────────────────────

type SortField = 'name' | 'dob' | 'lastVisit';
type SortDir = 'asc' | 'desc';

// ─── Sort Icon ────────────────────────────────────────────────────────────────

interface SortIconProps {
  field: SortField;
  sortField: SortField;
}

const SortIcon: React.FC<SortIconProps> = ({ field, sortField }) => (
  <ArrowUpDown
    className={cn(
      'w-3 h-3 ml-1 inline-block transition-colors',
      sortField === field ? 'text-blue-600' : 'text-gray-300',
    )}
  />
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Simulate a brief loading flash when search changes
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.length === 1) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 300);
    }
  }, []);

  const recentPatients = useMemo(
    () => RECENT_PATIENT_IDS.map((id) => MOCK_PATIENTS.find((p) => p.id === id)).filter(Boolean) as MockPatient[],
    [],
  );

  const filteredPatients = useMemo(() => {
    let result = MOCK_PATIENTS.filter((p) => matchesSearch(p, searchQuery));
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      else if (sortField === 'dob') cmp = a.dob.localeCompare(b.dob);
      else if (sortField === 'lastVisit') cmp = (a.lastVisitDate ?? '').localeCompare(b.lastVisitDate ?? '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [searchQuery, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const showSearch = searchQuery.trim().length > 0;
  const showRecent = !showSearch;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{MOCK_PATIENTS.length} patients in practice</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus className="w-4 h-4" />
          New Patient
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name, MRN, date of birth, or phone..."
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
          aria-label="Search patients"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recent patients */}
      {showRecent && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent Patients</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {recentPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 group"
              >
                <PatientAvatar patient={patient} size="sm" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 whitespace-nowrap">
                    {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{patient.mrn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patient table */}
      <div className="bg-white rounded-lg border border-slate-200 flex-1 overflow-hidden flex flex-col">
        {/* Table header */}
        <div className="border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {showSearch ? (
              <>{filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''} for "{searchQuery}"</>
            ) : (
              <>All patients</>
            )}
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr] gap-x-4 px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-gray-500 uppercase tracking-wide select-none">
          <button onClick={() => toggleSort('name')} className="flex items-center text-left hover:text-gray-700 focus:outline-none">
            Patient <SortIcon field="name" sortField={sortField} />
          </button>
          <span>MRN</span>
          <button onClick={() => toggleSort('dob')} className="flex items-center text-left hover:text-gray-700 focus:outline-none">
            DOB / Age <SortIcon field="dob" sortField={sortField} />
          </button>
          <span className="hidden lg:block">Phone</span>
          <span className="hidden xl:block">Insurance</span>
          <button onClick={() => toggleSort('lastVisit')} className="flex items-center text-left hover:text-gray-700 focus:outline-none hidden md:flex">
            Last Visit <SortIcon field="lastVisit" sortField={sortField} />
          </button>
          <span>Status</span>
        </div>

        {/* Table body */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {isLoading ? (
            <TableSkeleton />
          ) : filteredPatients.length === 0 ? (
            <EmptySearch query={searchQuery} onClear={() => setSearchQuery('')} />
          ) : (
            filteredPatients.map((patient) => (
              <PatientRow
                key={patient.id}
                patient={patient}
                onClick={() => navigate(`/patients/${patient.id}`)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {!isLoading && filteredPatients.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Showing {filteredPatients.length} of {MOCK_PATIENTS.length} patients
            </span>
            <span className="text-xs text-gray-400">
              Sorted by {sortField === 'name' ? 'name' : sortField === 'dob' ? 'date of birth' : 'last visit'} ({sortDir})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Patient Row ──────────────────────────────────────────────────────────────

interface PatientRowProps {
  patient: MockPatient;
  onClick: () => void;
}

const PatientRow: React.FC<PatientRowProps> = ({ patient, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr_1fr] gap-x-4 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:bg-blue-50 group"
      aria-label={`Open chart for ${patient.firstName} ${patient.lastName}`}
    >
      {/* Patient name + avatar + flags */}
      <div className="flex items-center gap-3 min-w-0">
        <PatientAvatar patient={patient} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 truncate">
              {patient.lastName}, {patient.firstName}
              {patient.preferredName && (
                <span className="text-gray-400 font-normal ml-1">"{patient.preferredName}"</span>
              )}
            </p>
            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-500">{patient.sex}</span>
            <PatientFlags patient={patient} />
          </div>
        </div>
      </div>

      {/* MRN */}
      <div className="flex items-center">
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
          {patient.mrn}
        </span>
      </div>

      {/* DOB + Age */}
      <div className="flex items-center">
        <div>
          <p className="text-sm text-gray-700">{formatDob(patient.dob)}</p>
          <p className="text-xs text-gray-400">{patient.age} yr old</p>
        </div>
      </div>

      {/* Phone */}
      <div className="hidden lg:flex items-center">
        <span className="text-sm text-gray-600">{patient.phone}</span>
      </div>

      {/* Insurance */}
      <div className="hidden xl:flex items-center gap-1.5 min-w-0">
        {patient.insurance.verified ? (
          <Shield className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        ) : (
          <Shield className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm text-gray-700 truncate">{patient.insurance.payerName}</p>
          <p className="text-xs text-gray-400">{patient.insurance.planType}</p>
        </div>
      </div>

      {/* Last Visit */}
      <div className="hidden md:flex items-center">
        <span className={cn(
          'text-sm',
          patient.lastVisitDate ? 'text-gray-600' : 'text-gray-300',
        )}>
          {formatLastVisit(patient.lastVisitDate)}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <StatusBadge status={patient.status} />
      </div>
    </button>
  );
};

export default PatientsPage;
