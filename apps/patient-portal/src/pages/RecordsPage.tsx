import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FlaskConical,
  Pill,
  Syringe,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Activity,
} from 'lucide-react';
import { useLabResults, useMedications } from '@/hooks/useApi';

const PATIENT_ID = 'PAT-10001';

// ─── Shared skeleton ─────────────────────────────────────────────────────────

const ListSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    ))}
  </div>
);

// ─── Visits View ─────────────────────────────────────────────────────────────

const FALLBACK_VISITS = [
  {
    id: 'ENC-00112',
    date: 'Mar 10, 2026',
    provider: 'Dr. Emily Chen, MD',
    type: 'Office Visit',
    diagnoses: ['Type 2 Diabetes Mellitus (E11.9)', 'Essential Hypertension (I10)'],
    notes: 'Patient presents for diabetes management follow-up. A1c ordered.',
  },
  {
    id: 'ENC-00108',
    date: 'Feb 12, 2026',
    provider: 'Dr. Emily Chen, MD',
    type: 'Follow-up',
    diagnoses: ['Type 2 Diabetes Mellitus (E11.9)', 'Hyperlipidemia (E78.5)'],
    notes: 'Lab results reviewed. Continue current medications.',
  },
  {
    id: 'ENC-00101',
    date: 'Jan 20, 2026',
    provider: 'Dr. Emily Chen, MD',
    type: 'Telehealth',
    diagnoses: ['Acute Upper Respiratory Infection (J06.9)'],
    notes: 'Patient seen via telehealth for respiratory symptoms.',
  },
  {
    id: 'ENC-00095',
    date: 'Dec 10, 2025',
    provider: 'Dr. Emily Chen, MD',
    type: 'Annual Physical',
    diagnoses: ['Z00.00 — General Adult Medical Examination'],
    notes: 'Annual physical completed. All vaccines up to date.',
  },
  {
    id: 'ENC-00088',
    date: 'Nov 5, 2025',
    provider: 'Dr. Emily Chen, MD',
    type: 'Office Visit',
    diagnoses: ['Essential Hypertension (I10)'],
    notes: 'Blood pressure elevated. Lisinopril dose adjusted.',
  },
];

const VisitsView: React.FC = () => {
  const { data: encounters, isLoading } = useQuery({
    queryKey: ['encounters', PATIENT_ID],
    queryFn: () => encounterApi.getByPatient(PATIENT_ID),
  });

  const visits = encounters && encounters.length > 0
    ? encounters.map((e: any) => ({
        id: e.id,
        date: new Date(e.date ?? e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        provider: e.providerName ?? 'Dr. Emily Chen, MD',
        type: e.type ?? e.visitType ?? 'Office Visit',
        diagnoses: e.diagnoses ?? [],
        notes: e.chiefComplaint ?? e.notes ?? '',
      }))
    : FALLBACK_VISITS;

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-3 sm:space-y-4">
      {visits.map((v) => (
        <div key={v.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900">{v.date}</span>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  {v.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{v.provider}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Summary</span>
              <span className="sm:hidden">Download</span>
            </button>
          </div>
          {v.diagnoses.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Diagnoses</p>
              <div className="flex flex-col gap-1">
                {v.diagnoses.map((d: string) => (
                  <p key={d} className="text-sm text-gray-700">
                    • {d}
                  </p>
                ))}
              </div>
            </div>
          )}
          {v.notes && (
            <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-100 pt-3">{v.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Labs View ───────────────────────────────────────────────────────────────

interface LabResult {
  id: string;
  date: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  trend: 'up' | 'down' | 'stable';
  orderedBy: string;
}

const FALLBACK_LABS: LabResult[] = [
  { id: 'LAB-0042', date: 'Mar 18, 2026', testName: 'Hemoglobin A1c', value: '6.8', unit: '%', referenceRange: '< 5.7 (normal), 5.7–6.4 (prediabetes)', status: 'abnormal', trend: 'down', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0041', date: 'Mar 18, 2026', testName: 'Fasting Glucose', value: '98', unit: 'mg/dL', referenceRange: '70–99 mg/dL', status: 'normal', trend: 'down', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0040', date: 'Mar 18, 2026', testName: 'LDL Cholesterol', value: '112', unit: 'mg/dL', referenceRange: '< 100 mg/dL (optimal)', status: 'abnormal', trend: 'stable', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0039', date: 'Mar 18, 2026', testName: 'HDL Cholesterol', value: '52', unit: 'mg/dL', referenceRange: '> 40 mg/dL (men)', status: 'normal', trend: 'up', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0038', date: 'Mar 18, 2026', testName: 'Creatinine', value: '1.0', unit: 'mg/dL', referenceRange: '0.7–1.2 mg/dL', status: 'normal', trend: 'stable', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0037', date: 'Mar 18, 2026', testName: 'eGFR', value: '78', unit: 'mL/min/1.73m²', referenceRange: '≥ 60 mL/min/1.73m²', status: 'normal', trend: 'stable', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0035', date: 'Dec 10, 2025', testName: 'Hemoglobin A1c', value: '7.2', unit: '%', referenceRange: '< 5.7 (normal)', status: 'abnormal', trend: 'up', orderedBy: 'Dr. Emily Chen' },
  { id: 'LAB-0034', date: 'Dec 10, 2025', testName: 'LDL Cholesterol', value: '128', unit: 'mg/dL', referenceRange: '< 100 mg/dL (optimal)', status: 'abnormal', trend: 'up', orderedBy: 'Dr. Emily Chen' },
];

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable'; status: 'normal' | 'abnormal' | 'critical' }> = ({ trend, status }) => {
  if (trend === 'up')
    return <TrendingUp className={`w-4 h-4 ${status === 'normal' ? 'text-teal-500' : 'text-red-400'}`} />;
  if (trend === 'down')
    return <TrendingDown className={`w-4 h-4 ${status === 'normal' ? 'text-teal-500' : 'text-amber-500'}`} />;
  return <Minus className="w-4 h-4 text-gray-400" />;
};

const LabsView: React.FC = () => {
  const { data: apiLabs, isLoading } = useQuery({
    queryKey: ['labs', PATIENT_ID],
    queryFn: () => clinicalApi.getLabResults(PATIENT_ID),
  });

  const labResults: LabResult[] = apiLabs && apiLabs.length > 0
    ? apiLabs.map((l: any) => ({
        id: l.id,
        date: new Date(l.resultDate ?? l.orderedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        testName: l.testName,
        value: String(l.value ?? l.result ?? '—'),
        unit: l.unit ?? '',
        referenceRange: l.referenceRange ?? '—',
        status: (l.flag === 'H' || l.flag === 'L' ? 'abnormal' : 'normal') as LabResult['status'],
        trend: 'stable' as const,
        orderedBy: l.orderedBy ?? 'Dr. Emily Chen',
      }))
    : FALLBACK_LABS;

  if (isLoading) return <ListSkeleton />;

  const grouped = labResults.reduce<Record<string, LabResult[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  const abnormalCount = labResults.filter((r) => r.status !== 'normal').length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Summary banner */}
      {abnormalCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{abnormalCount} result{abnormalCount > 1 ? 's' : ''}</span> outside normal range. Review with your provider.
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([date, results]) => (
        <div key={date}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{date}</h3>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{results.length} result{results.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {results.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${
                  r.status === 'critical'
                    ? 'border-red-300 bg-red-50/30'
                    : r.status === 'abnormal'
                    ? 'border-amber-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{r.testName}</p>
                      {r.status === 'abnormal' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Abnormal
                        </span>
                      )}
                      {r.status === 'critical' && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Critical
                        </span>
                      )}
                      {r.status === 'normal' && (
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Normal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Ref: {r.referenceRange}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Ordered by {r.orderedBy}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TrendIcon trend={r.trend} status={r.status} />
                    <span
                      className={`text-lg font-bold ${
                        r.status === 'normal'
                          ? 'text-teal-700'
                          : r.status === 'abnormal'
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {r.value}
                    </span>
                    <span className="text-xs text-gray-500">{r.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Medications View ────────────────────────────────────────────────────────

const FALLBACK_MEDS = [
  { id: 'MED-001', name: 'Metformin HCl', dose: '1000 mg', frequency: 'Twice daily with meals', prescriber: 'Dr. Emily Chen, MD', startDate: 'Jan 15, 2024', refillsLeft: 3, active: true },
  { id: 'MED-002', name: 'Lisinopril', dose: '10 mg', frequency: 'Once daily in the morning', prescriber: 'Dr. Emily Chen, MD', startDate: 'Nov 5, 2025', refillsLeft: 5, active: true },
  { id: 'MED-003', name: 'Atorvastatin', dose: '40 mg', frequency: 'Once daily at bedtime', prescriber: 'Dr. Emily Chen, MD', startDate: 'Mar 10, 2025', refillsLeft: 2, active: true },
  { id: 'MED-004', name: 'Aspirin', dose: '81 mg', frequency: 'Once daily', prescriber: 'Dr. Emily Chen, MD', startDate: 'Jan 15, 2024', refillsLeft: 0, active: true },
];

const MedicationsView: React.FC = () => {
  const { data: apiMeds, isLoading } = useQuery({
    queryKey: ['medications', PATIENT_ID],
    queryFn: () => clinicalApi.getMedications(PATIENT_ID),
  });

  const medications = apiMeds && apiMeds.length > 0
    ? apiMeds.map((m: any) => ({
        id: m.id,
        name: m.name,
        dose: m.dose ?? m.strength ?? '',
        frequency: m.frequency ?? m.sig ?? '',
        prescriber: m.prescribedBy ?? 'Dr. Emily Chen, MD',
        startDate: m.startDate
          ? new Date(m.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—',
        refillsLeft: m.refillsRemaining ?? m.refills ?? 0,
        active: m.status === 'active',
      }))
    : FALLBACK_MEDS;

  if (isLoading) return <ListSkeleton />;

  const activeMeds = medications.filter((m) => m.active);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 py-1">
        <CheckCircle className="w-4 h-4 text-teal-600" />
        <p className="text-sm font-medium text-gray-700">{activeMeds.length} active medication{activeMeds.length !== 1 ? 's' : ''}</p>
      </div>
      {medications.map((med) => (
        <div key={med.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{med.name}</p>
              <p className="text-sm text-blue-700 font-medium mt-0.5">
                {med.dose}{med.dose && med.frequency ? ' — ' : ''}{med.frequency}
              </p>
            </div>
            {med.refillsLeft === 0 ? (
              <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-medium flex-shrink-0">
                No refills left
              </span>
            ) : (
              <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-medium flex-shrink-0">
                {med.refillsLeft} refill{med.refillsLeft !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
            <span>Prescribed by: {med.prescriber}</span>
            <span>Started: {med.startDate}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
              Request Refill
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-700 font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Immunizations View ──────────────────────────────────────────────────────

const FALLBACK_IMMUNIZATIONS = [
  { name: 'Influenza Vaccine', date: 'Oct 2, 2025', nextDue: 'Oct 2026', status: 'current' },
  { name: 'COVID-19 (Updated 2025)', date: 'Sep 15, 2025', nextDue: 'Sep 2026', status: 'current' },
  { name: 'Tdap', date: 'Dec 10, 2022', nextDue: 'Dec 2032', status: 'current' },
  { name: 'Pneumococcal (PPSV23)', date: 'Dec 10, 2022', nextDue: 'Dec 2032', status: 'current' },
  { name: 'Hepatitis B (Series)', date: 'Mar 5, 2020', nextDue: null, status: 'complete' },
  { name: 'Hepatitis A (Series)', date: 'Jan 14, 2020', nextDue: null, status: 'complete' },
];

const ImmunizationsView: React.FC = () => {
  const { data: apiImms, isLoading } = useQuery({
    queryKey: ['immunizations'],
    queryFn: () => clinicalApi.getImmunizations(),
  });

  const immunizations = apiImms && apiImms.length > 0
    ? apiImms.map((imm: any) => ({
        name: imm.vaccineName ?? imm.name,
        date: imm.administeredDate
          ? new Date(imm.administeredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : imm.date ?? '—',
        nextDue: imm.nextDueDate
          ? new Date(imm.nextDueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : null,
        status: imm.status ?? 'current',
      }))
    : FALLBACK_IMMUNIZATIONS;

  if (isLoading) return <ListSkeleton />;

  const currentCount = immunizations.filter((i) => i.status === 'current').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 py-1">
        <CheckCircle className="w-4 h-4 text-teal-600" />
        <p className="text-sm font-medium text-gray-700">{currentCount} vaccine{currentCount !== 1 ? 's' : ''} current</p>
      </div>
      {immunizations.map((imm) => (
        <div
          key={imm.name}
          className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 sm:px-5 py-3.5 flex items-center gap-3 sm:gap-4"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Syringe className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{imm.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">Given: {imm.date}</p>
            {imm.nextDue && (
              <p className="text-xs text-amber-600 mt-0.5">Next due: {imm.nextDue}</p>
            )}
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
              imm.status === 'current' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {imm.status === 'current' ? 'Current' : 'Complete'}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

type RecordsSection = 'overview' | 'visits' | 'labs' | 'medications' | 'immunizations';

const sectionTitles: Record<RecordsSection, string> = {
  overview: 'Health Records',
  visits: 'Visit Records',
  labs: 'Lab Results',
  medications: 'Medications',
  immunizations: 'Immunizations',
};

const sectionCards = [
  {
    id: 'visits' as RecordsSection,
    label: 'Visit Records',
    description: '5 visits on record',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'labs' as RecordsSection,
    label: 'Lab Results',
    description: '8 results — 1 new',
    icon: FlaskConical,
    color: 'bg-purple-50 text-purple-600',
    iconBg: 'bg-purple-50',
    badge: 'New',
  },
  {
    id: 'medications' as RecordsSection,
    label: 'Medications',
    description: '4 active medications',
    icon: Pill,
    color: 'bg-amber-50 text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    id: 'immunizations' as RecordsSection,
    label: 'Immunizations',
    description: '6 vaccines on record',
    icon: Syringe,
    color: 'bg-teal-50 text-teal-600',
    iconBg: 'bg-teal-50',
  },
];

// Sub-nav tabs for non-overview sections
const SUB_TABS: Array<{ id: RecordsSection; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'visits', label: 'Visits', icon: FileText },
  { id: 'labs', label: 'Labs', icon: Activity },
  { id: 'medications', label: 'Meds', icon: Pill },
  { id: 'immunizations', label: 'Vaccines', icon: Syringe },
];

const RecordsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeSection = location.pathname.split('/').pop();
  const initialSection: RecordsSection =
    routeSection === 'visits' || routeSection === 'labs' || routeSection === 'medications' || routeSection === 'immunizations'
      ? routeSection
      : 'overview';

  const [section, setSection] = useState<RecordsSection>(initialSection);

  const handleNav = (s: RecordsSection) => {
    setSection(s);
    navigate(`/records${s === 'overview' ? '' : `/${s}`}`);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {section !== 'overview' && (
          <button
            onClick={() => handleNav('overview')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Back to overview"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{sectionTitles[section]}</h1>
          {section === 'overview' && (
            <p className="text-sm text-gray-500 mt-0.5">Your complete health history</p>
          )}
        </div>
      </div>

      {/* Overview grid */}
      {section === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {sectionCards.map(({ id, label, description, icon: Icon, color, badge }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 text-left hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {badge && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-blue-600 font-medium group-hover:gap-2 transition-all">
                View records <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Sub-section tab bar */}
      {section !== 'overview' && (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {SUB_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                section === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-views */}
      {section === 'visits' && <VisitsView />}
      {section === 'labs' && <LabsView />}
      {section === 'medications' && <MedicationsView />}
      {section === 'immunizations' && <ImmunizationsView />}
    </div>
  );
};

export default RecordsPage;
