import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Check,
  AlertTriangle,
  Edit2,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  ClipboardList,
  FileText,
  Send,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { cn } from '@primus/ui/lib';

// ─── Types ────────────────────────────────────────────────────────────────────

type EligibilityStatus = 'verified' | 'unverified';
type FormStatus        = 'complete' | 'not-started';
type ConsentStatus     = 'signed' | 'unsigned';

interface CheckInPatient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  sex: string;
  phone: string;
  email: string;
  address: string;
  insurance: {
    payerName: string;
    memberId: string;
    groupNumber: string;
    planType: string;
    eligibility: EligibilityStatus;
  };
  outstandingBalance: number;
  intakeFormStatus: FormStatus;
  consentStatus: ConsentStatus;
  appointmentType: string;
  provider: string;
  scheduledTime: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CHECKIN_PATIENT: CheckInPatient = {
  id: 'PAT-10001',
  mrn: 'PAT-10001',
  firstName: 'Sarah',
  lastName: 'Johnson',
  dob: '06/14/1981',
  age: 44,
  sex: 'Female',
  phone: '(312) 555-0142',
  email: 'sarah.johnson@email.com',
  address: '847 W Wellington Ave, Apt 3B, Chicago, IL 60657',
  insurance: {
    payerName: 'Blue Cross Blue Shield',
    memberId: 'BCBS-4471029384',
    groupNumber: 'GRP-00284',
    planType: 'PPO',
    eligibility: 'verified',
  },
  outstandingBalance: 45.00,
  intakeFormStatus: 'not-started',
  consentStatus: 'signed',
  appointmentType: 'Follow-Up',
  provider: 'Dr. Emily Chen, MD',
  scheduledTime: '10:00 AM',
};

// ─── Patient Header ───────────────────────────────────────────────────────────

interface PatientHeaderProps {
  patient: CheckInPatient;
}

const PatientHeaderBar: React.FC<PatientHeaderProps> = ({ patient }) => (
  <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 mb-6 sticky top-0 z-10">
    <div className="max-w-2xl mx-auto flex items-center gap-4">
      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-bold">
          {patient.firstName[0]}{patient.lastName[0]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-semibold text-gray-900">
            {patient.firstName} {patient.lastName}
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-sm text-gray-500">{patient.sex}</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-sm text-gray-500">DOB: {patient.dob} ({patient.age} yrs)</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="font-mono text-xs text-gray-400">{patient.mrn}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">{patient.appointmentType}</span>
          <span className="text-gray-300 text-[10px]">·</span>
          <span className="text-xs text-gray-400">{patient.provider}</span>
          <span className="text-gray-300 text-[10px]">·</span>
          <span className="text-xs font-medium text-blue-600">{patient.scheduledTime}</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── Section Block ────────────────────────────────────────────────────────────

interface SectionBlockProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  statusBadge?: React.ReactNode;
}

const SectionBlock: React.FC<SectionBlockProps> = ({ icon, title, children, action, statusBadge }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <span className="text-blue-600">{icon}</span>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {statusBadge}
      </div>
      {action}
    </div>
    <div className="px-4 py-4">{children}</div>
  </div>
);

// ─── Read-only Demographic Row ────────────────────────────────────────────────

interface DemoRowProps {
  label: string;
  value: string;
}

const DemoRow: React.FC<DemoRowProps> = ({ label, value }) => (
  <div className="flex items-start gap-2 py-1.5 border-b border-slate-50 last:border-0">
    <span className="w-28 flex-shrink-0 text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm text-gray-800">{value}</span>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusPillProps {
  verified: boolean;
  trueLabel?: string;
  falseLabel?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({
  verified,
  trueLabel = 'Verified',
  falseLabel = 'Unverified',
}) => (
  <span className={cn(
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
    verified
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-amber-50 text-amber-700 border-amber-200',
  )}>
    {verified
      ? <Check className="w-3 h-3" />
      : <AlertTriangle className="w-3 h-3" />}
    {verified ? trueLabel : falseLabel}
  </span>
);

// ─── 1. Demographics Section ──────────────────────────────────────────────────

interface DemographicsSectionProps {
  patient: CheckInPatient;
}

const DemographicsSection: React.FC<DemographicsSectionProps> = ({ patient }) => (
  <SectionBlock
    icon={<UserCheck className="w-4 h-4" />}
    title="Demographics"
    action={
      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all">
        <Edit2 className="w-3 h-3" />
        Edit
      </button>
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
      <div>
        <DemoRow label="Full Name" value={`${patient.firstName} ${patient.lastName}`} />
        <DemoRow label="Date of Birth" value={`${patient.dob} (${patient.age} yrs)`} />
        <DemoRow label="Sex" value={patient.sex} />
        <DemoRow label="MRN" value={patient.mrn} />
      </div>
      <div>
        <DemoRow label="Phone" value={patient.phone} />
        <DemoRow label="Email" value={patient.email} />
        <DemoRow label="Address" value={patient.address} />
      </div>
    </div>
  </SectionBlock>
);

// ─── 2. Insurance Section ─────────────────────────────────────────────────────

interface InsuranceSectionProps {
  insurance: CheckInPatient['insurance'];
  onVerify: () => void;
}

const InsuranceSection: React.FC<InsuranceSectionProps> = ({ insurance, onVerify }) => (
  <SectionBlock
    icon={insurance.eligibility === 'verified'
      ? <ShieldCheck className="w-4 h-4" />
      : <ShieldAlert className="w-4 h-4 text-amber-500" />
    }
    title="Insurance"
    statusBadge={
      <StatusPill verified={insurance.eligibility === 'verified'} />
    }
    action={
      insurance.eligibility === 'unverified' ? (
        <button
          onClick={onVerify}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
        >
          <ShieldCheck className="w-3 h-3" />
          Verify Now
        </button>
      ) : undefined
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
      <div>
        <DemoRow label="Payer"      value={insurance.payerName} />
        <DemoRow label="Plan Type"  value={insurance.planType} />
      </div>
      <div>
        <DemoRow label="Member ID"  value={insurance.memberId} />
        <DemoRow label="Group #"    value={insurance.groupNumber} />
      </div>
    </div>
    {insurance.eligibility === 'verified' && (
      <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
        <Check className="w-3.5 h-3.5" />
        <span>Eligibility verified today — active coverage confirmed</span>
      </div>
    )}
    {insurance.eligibility === 'unverified' && (
      <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Eligibility has not been verified. Click "Verify Now" to check with the payer.</span>
      </div>
    )}
  </SectionBlock>
);

// ─── 3. Outstanding Balance Section ──────────────────────────────────────────

interface BalanceSectionProps {
  balance: number;
  onCollect: () => void;
  collected: boolean;
}

const BalanceSection: React.FC<BalanceSectionProps> = ({ balance, onCollect, collected }) => (
  <SectionBlock
    icon={<DollarSign className="w-4 h-4" />}
    title="Outstanding Balance"
    action={
      collected ? (
        <StatusPill verified trueLabel="Collected" />
      ) : balance > 0 ? (
        <button
          onClick={onCollect}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <CreditCard className="w-3 h-3" />
          Collect Payment
        </button>
      ) : undefined
    }
  >
    {collected ? (
      <div className="flex items-center gap-2 text-sm text-green-700">
        <Check className="w-4 h-4 text-green-600" />
        <span>$45.00 collected — receipt sent</span>
      </div>
    ) : balance > 0 ? (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">
            ${balance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Due before or at time of visit</p>
        </div>
        <div className="text-right text-xs text-gray-400 space-y-0.5">
          <p>Co-pay: $30.00</p>
          <p>Previous balance: $15.00</p>
        </div>
      </div>
    ) : (
      <p className="text-sm text-green-700 flex items-center gap-1.5">
        <Check className="w-4 h-4 text-green-600" />
        No outstanding balance
      </p>
    )}
  </SectionBlock>
);

// ─── 4. Intake Form Section ───────────────────────────────────────────────────

interface IntakeSectionProps {
  status: FormStatus;
  onSendLink: () => void;
  linkSent: boolean;
}

const IntakeSection: React.FC<IntakeSectionProps> = ({ status, onSendLink, linkSent }) => (
  <SectionBlock
    icon={<ClipboardList className="w-4 h-4" />}
    title="Intake Form"
    statusBadge={
      <StatusPill
        verified={status === 'complete'}
        trueLabel="Complete"
        falseLabel="Not Started"
      />
    }
    action={
      status === 'not-started' && !linkSent ? (
        <button
          onClick={onSendLink}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Send className="w-3 h-3" />
          Send Link
        </button>
      ) : undefined
    }
  >
    {status === 'complete' ? (
      <div className="space-y-1">
        {['Medical history', 'Current medications', 'Social history', 'Review of systems'].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
    ) : linkSent ? (
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <Send className="w-4 h-4 text-blue-500" />
        <span>Link sent to {MOCK_CHECKIN_PATIENT.email} and {MOCK_CHECKIN_PATIENT.phone}</span>
      </div>
    ) : (
      <p className="text-sm text-gray-500">
        Patient has not completed the pre-visit intake form.
        Send a link via email or SMS to collect information before the visit.
      </p>
    )}
  </SectionBlock>
);

// ─── 5. Consent Forms Section ─────────────────────────────────────────────────

interface ConsentSectionProps {
  status: ConsentStatus;
  onSendSignature: () => void;
  signatureSent: boolean;
}

const ConsentSection: React.FC<ConsentSectionProps> = ({ status, onSendSignature, signatureSent }) => (
  <SectionBlock
    icon={<FileText className="w-4 h-4" />}
    title="Consent Forms"
    statusBadge={
      <StatusPill
        verified={status === 'signed'}
        trueLabel="Signed"
        falseLabel="Unsigned"
      />
    }
    action={
      status === 'unsigned' && !signatureSent ? (
        <button
          onClick={onSendSignature}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          <Send className="w-3 h-3" />
          Send for Signature
        </button>
      ) : undefined
    }
  >
    {status === 'signed' ? (
      <div className="space-y-1">
        {['HIPAA Notice of Privacy Practices', 'Treatment Consent', 'Financial Responsibility Agreement'].map((doc) => (
          <div key={doc} className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            {doc}
          </div>
        ))}
        <p className="text-xs text-gray-400 mt-2">All forms signed on 03/20/2026 via patient portal</p>
      </div>
    ) : signatureSent ? (
      <div className="flex items-center gap-2 text-sm text-blue-700">
        <Send className="w-4 h-4 text-blue-500" />
        <span>Signature request sent to patient portal</span>
      </div>
    ) : (
      <div className="space-y-1.5">
        {['HIPAA Notice of Privacy Practices', 'Treatment Consent', 'Financial Responsibility Agreement'].map((doc) => (
          <div key={doc} className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            {doc} — <span className="text-amber-600 font-medium">Unsigned</span>
          </div>
        ))}
      </div>
    )}
  </SectionBlock>
);

// ─── Check-In Complete State ──────────────────────────────────────────────────

interface CheckInCompleteProps {
  patientName: string;
}

const CheckInComplete: React.FC<CheckInCompleteProps> = ({ patientName }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-green-200 rounded-xl shadow-sm">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
      <Check className="w-8 h-8 text-green-600" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900 mb-1">Patient Checked In</h2>
    <p className="text-sm text-green-700 font-medium mb-1">{patientName}</p>
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-semibold text-green-700 mt-2">
      <Check className="w-3.5 h-3.5" />
      Status changed to Arrived
    </span>
    <p className="text-xs text-gray-400 mt-4">
      The care team has been notified. Room will be assigned shortly.
    </p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const patient = MOCK_CHECKIN_PATIENT;

  const [eligibility, setEligibility]     = useState<EligibilityStatus>(patient.insurance.eligibility);
  const [balanceCollected, setBalanceCollected] = useState(false);
  const [intakeLinkSent, setIntakeLinkSent]     = useState(false);
  const [signatureSent, setSignatureSent]       = useState(false);
  const [checkedIn, setCheckedIn]               = useState(false);

  const handleVerifyEligibility = () => setEligibility('verified');
  const handleCollectPayment    = () => setBalanceCollected(true);
  const handleSendIntakeLink    = () => setIntakeLinkSent(true);
  const handleSendSignature     = () => setSignatureSent(true);

  const canCheckIn = eligibility === 'verified';

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
        <button onClick={() => navigate('/schedule')} className="hover:text-blue-600 transition-colors font-medium">
          Schedule
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium">Check-In</span>
      </nav>

      {/* Patient header */}
      <PatientHeaderBar patient={patient} />

      {checkedIn ? (
        <CheckInComplete patientName={`${patient.firstName} ${patient.lastName}`} />
      ) : (
        <div className="space-y-4">
          {/* 1 — Demographics */}
          <DemographicsSection patient={patient} />

          {/* 2 — Insurance */}
          <InsuranceSection
            insurance={{ ...patient.insurance, eligibility }}
            onVerify={handleVerifyEligibility}
          />

          {/* 3 — Outstanding Balance */}
          <BalanceSection
            balance={patient.outstandingBalance}
            onCollect={handleCollectPayment}
            collected={balanceCollected}
          />

          {/* 4 — Intake Form */}
          <IntakeSection
            status={patient.intakeFormStatus}
            onSendLink={handleSendIntakeLink}
            linkSent={intakeLinkSent}
          />

          {/* 5 — Consent Forms */}
          <ConsentSection
            status={patient.consentStatus}
            onSendSignature={handleSendSignature}
            signatureSent={signatureSent}
          />

          {/* Complete Check-In */}
          <div className="pt-2">
            {!canCheckIn && (
              <div className="flex items-center gap-2 px-3 py-2.5 mb-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-700">
                  Insurance eligibility must be verified before completing check-in.
                </span>
              </div>
            )}
            <button
              onClick={() => canCheckIn && setCheckedIn(true)}
              disabled={!canCheckIn}
              className={cn(
                'w-full py-3 rounded-xl text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                canCheckIn
                  ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              Complete Check-In
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
