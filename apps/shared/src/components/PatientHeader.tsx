import React from 'react';
import { FileText, Pill, FlaskConical, MessageCircle, CalendarPlus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar } from './Avatar';
import { AllergyBadge } from './AllergyBadge';
import { RiskBadge } from './RiskBadge';
import { Button } from './Button';
import { formatDate } from '../../lib/utils';
import type { PatientSummary } from '../../types';

export interface PatientHeaderAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface PatientHeaderProps {
  patient: PatientSummary;
  onNewNote?: () => void;
  onPrescribe?: () => void;
  onOrder?: () => void;
  onMessage?: () => void;
  onSchedule?: () => void;
  extraActions?: PatientHeaderAction[];
  className?: string;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient,
  onNewNote,
  onPrescribe,
  onOrder,
  onMessage,
  onSchedule,
  extraActions = [],
  className,
}) => {
  const displayName = patient.preferredName
    ? `${patient.firstName} "${patient.preferredName}" ${patient.lastName}`
    : `${patient.firstName} ${patient.lastName}`;

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2',
        className
      )}
      aria-label="Patient header"
    >
      <div className="flex items-center gap-3 min-w-0 flex-wrap">
        {/* Avatar */}
        <Avatar
          src={patient.photo}
          firstName={patient.firstName}
          lastName={patient.lastName}
          size="md"
          className="shrink-0"
        />

        {/* Patient identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-bold text-gray-900 truncate">{displayName}</h1>
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
              {patient.mrn}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-500">
            <span>DOB: {formatDate(patient.dob)}</span>
            <span aria-hidden="true">·</span>
            <span>Age {patient.age}</span>
            <span aria-hidden="true">·</span>
            <span>{patient.sex}</span>
            {patient.insurance && (
              <>
                <span aria-hidden="true">·</span>
                <span className={cn(
                  'font-medium',
                  patient.insurance.verified ? 'text-green-600' : 'text-amber-600'
                )}>
                  {patient.insurance.payerName}
                  {patient.insurance.verified ? ' ✓' : ' (unverified)'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Allergies */}
        {patient.allergies.length > 0 && (
          <div
            className="flex items-center gap-1 flex-wrap shrink-0 max-w-xs"
            aria-label="Allergies"
          >
            {patient.allergies.slice(0, 3).map((allergy) => (
              <AllergyBadge key={allergy.id} allergy={allergy} />
            ))}
            {patient.allergies.length > 3 && (
              <span className="text-xs text-red-700 font-medium bg-red-50 rounded-full px-2 py-0.5">
                +{patient.allergies.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Risk flags */}
        {patient.riskFlags.length > 0 && (
          <div
            className="flex items-center gap-1 flex-wrap shrink-0 max-w-xs"
            aria-label="Risk flags"
          >
            {patient.riskFlags.map((flag, idx) => (
              <RiskBadge key={idx} flag={flag} />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0 flex-wrap">
          {onNewNote && (
            <Button variant="primary" size="sm" leftIcon={<FileText size={14} />} onClick={onNewNote}>
              New Note
            </Button>
          )}
          {onPrescribe && (
            <Button variant="secondary" size="sm" leftIcon={<Pill size={14} />} onClick={onPrescribe}>
              Prescribe
            </Button>
          )}
          {onOrder && (
            <Button variant="secondary" size="sm" leftIcon={<FlaskConical size={14} />} onClick={onOrder}>
              Order
            </Button>
          )}
          {onMessage && (
            <Button variant="ghost" size="sm" leftIcon={<MessageCircle size={14} />} onClick={onMessage}>
              Message
            </Button>
          )}
          {onSchedule && (
            <Button variant="ghost" size="sm" leftIcon={<CalendarPlus size={14} />} onClick={onSchedule}>
              Schedule
            </Button>
          )}
          {extraActions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant ?? 'ghost'}
              size="sm"
              leftIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
