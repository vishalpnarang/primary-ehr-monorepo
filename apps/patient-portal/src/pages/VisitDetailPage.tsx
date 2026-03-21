import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  User,
  FileText,
  Pill,
  ArrowRight,
  CalendarCheck,
  AlertTriangle,
  Stethoscope,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Diagnosis {
  icd10: string;
  description: string;
}

interface PrescribedMedication {
  name: string;
  dose: string;
  frequency: string;
  days?: number;
  refills?: number;
}

interface VisitSummary {
  id: string;
  date: string;
  provider: string;
  providerCredential: string;
  specialty: string;
  visitType: string;
  diagnoses: Diagnosis[];
  afterVisitSummary: string;
  followUpInstructions: string[];
  medicationsPrescribed: PrescribedMedication[];
  nextAppointment?: {
    date: string;
    time: string;
    reason: string;
  };
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_VISITS: Record<string, VisitSummary> = {
  'ENC-00101': {
    id: 'ENC-00101',
    date: '2026-02-14',
    provider: 'Dr. Sarah Chen',
    providerCredential: 'MD',
    specialty: 'Family Medicine',
    visitType: 'Office Visit — Established Patient',
    diagnoses: [
      { icd10: 'I10', description: 'Essential (primary) hypertension' },
      { icd10: 'E78.5', description: 'Hyperlipidemia, unspecified' },
    ],
    afterVisitSummary:
      'You were seen today for a follow-up of your hypertension and elevated cholesterol. Your blood pressure was 138/88 mmHg — slightly elevated. Your recent lipid panel showed LDL of 112 mg/dL. We discussed lifestyle modifications including the DASH diet, limiting sodium to less than 2,000 mg/day, and increasing cardiovascular exercise to at least 150 minutes per week. We adjusted your Lisinopril dose from 10mg to 20mg daily and will recheck your blood pressure in 6 weeks.',
    followUpInstructions: [
      'Monitor blood pressure at home — log readings twice daily for 2 weeks',
      'Follow low-sodium DASH diet',
      'Begin or continue moderate aerobic exercise 30 min/day, 5 days/week',
      'Return in 6 weeks for blood pressure recheck and labs',
      'Call or message if BP consistently above 160/100 or below 90/60',
      'Go to ER if you experience chest pain, shortness of breath, or severe headache',
    ],
    medicationsPrescribed: [
      { name: 'Lisinopril', dose: '20mg', frequency: 'Once daily', refills: 3 },
      { name: 'Atorvastatin', dose: '40mg', frequency: 'Once daily at bedtime', refills: 5 },
    ],
    nextAppointment: {
      date: '2026-03-28',
      time: '10:00 AM',
      reason: 'BP Recheck + Lab Review',
    },
  },
  'ENC-00087': {
    id: 'ENC-00087',
    date: '2025-11-05',
    provider: 'Dr. Sarah Chen',
    providerCredential: 'MD',
    specialty: 'Family Medicine',
    visitType: 'Annual Wellness Visit',
    diagnoses: [
      { icd10: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings' },
      { icd10: 'I10', description: 'Essential (primary) hypertension' },
    ],
    afterVisitSummary:
      'Thank you for coming in for your annual wellness visit. Overall your health is stable. We completed your preventive screenings, updated your vaccinations, and discussed health goals for the upcoming year. Your BMI is 27.4, blood pressure 134/86, and fasting glucose is 98 mg/dL. We will monitor your blood pressure and repeat metabolic labs in 3 months.',
    followUpInstructions: [
      'Schedule colonoscopy screening — due this year',
      'Flu vaccine administered today — no further action needed',
      'Return in 3 months for BP and metabolic panel recheck',
      'Complete health risk assessment online by your next visit',
    ],
    medicationsPrescribed: [],
    nextAppointment: {
      date: '2026-02-14',
      time: '2:00 PM',
      reason: 'BP + Metabolic Panel Follow-up',
    },
  },
};

const FALLBACK_VISIT: VisitSummary = {
  id: 'ENC-00000',
  date: '2026-01-15',
  provider: 'Dr. Marcus Webb',
  providerCredential: 'DO',
  specialty: 'Internal Medicine',
  visitType: 'Office Visit',
  diagnoses: [
    { icd10: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  ],
  afterVisitSummary: 'You were seen for an upper respiratory infection. Examination was consistent with a viral etiology. Antibiotics are not indicated. Rest, fluids, and OTC symptom management were recommended.',
  followUpInstructions: [
    'Rest and stay well hydrated',
    'Use OTC decongestants and throat lozenges as needed',
    'Return or call if fever exceeds 103°F or symptoms worsen after 7–10 days',
  ],
  medicationsPrescribed: [],
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-slate-400 mt-0.5 flex-shrink-0">{icon}</span>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const VisitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const visit = (id && MOCK_VISITS[id]) ? MOCK_VISITS[id] : FALLBACK_VISIT;

  const formattedDate = new Date(`${visit.date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate('/records')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-5"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Records
      </button>

      <div className="mb-5">
        <p className="text-xs text-slate-400 font-mono mb-1">{visit.id}</p>
        <h1 className="text-2xl font-bold text-slate-900">Visit Summary</h1>
      </div>

      <div className="space-y-4">
        {/* Visit info */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date" value={formattedDate} />
          <InfoRow icon={<User className="w-4 h-4" />} label="Provider" value={`${visit.provider}, ${visit.providerCredential} — ${visit.specialty}`} />
          <InfoRow icon={<Stethoscope className="w-4 h-4" />} label="Visit Type" value={visit.visitType} />
        </div>

        {/* Diagnoses */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" /> Diagnoses
          </h2>
          <div className="space-y-2">
            {visit.diagnoses.map((dx) => (
              <div key={dx.icd10} className="flex items-start gap-3 bg-slate-50 rounded-lg px-3 py-2.5">
                <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-0.5 flex-shrink-0">
                  {dx.icd10}
                </span>
                <span className="text-sm text-slate-800">{dx.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* After-visit summary */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> After-Visit Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{visit.afterVisitSummary}</p>
        </div>

        {/* Medications prescribed */}
        {visit.medicationsPrescribed.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-600" /> Medications Prescribed
            </h2>
            <div className="space-y-2">
              {visit.medicationsPrescribed.map((med, i) => (
                <div key={i} className="bg-slate-50 rounded-lg px-3 py-2.5 text-sm">
                  <p className="font-medium text-slate-800">{med.name} {med.dose}</p>
                  <p className="text-slate-500">{med.frequency}{med.refills !== undefined ? ` · ${med.refills} refills` : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up instructions */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-600" /> Follow-Up Instructions
          </h2>
          <ul className="space-y-2">
            {visit.followUpInstructions.map((instruction, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        {/* Next appointment */}
        {visit.nextAppointment && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h2 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" /> Next Appointment
            </h2>
            <p className="text-sm font-medium text-slate-800">
              {new Date(`${visit.nextAppointment.date}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })} &middot; {visit.nextAppointment.time}
            </p>
            <p className="text-sm text-slate-500">{visit.nextAppointment.reason}</p>
            <button
              onClick={() => navigate('/appointments')}
              className="mt-3 text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              View in Appointments <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitDetailPage;
