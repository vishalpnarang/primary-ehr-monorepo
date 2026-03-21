import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  X,
  RefreshCw,
  ChevronRight,
  User,
  CheckCircle,
  Phone,
} from 'lucide-react';
import { appointmentApi } from '@primus/ui/mocks/api';

const PATIENT_ID = 'PAT-10001';

type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled' | 'pending' | 'no_show' | 'checked_in' | 'scheduled';

const STATUS_CONFIG: Record<string, { bg: string; label: string }> = {
  confirmed:  { bg: 'bg-blue-100 text-blue-700',   label: 'Confirmed' },
  scheduled:  { bg: 'bg-blue-100 text-blue-700',   label: 'Scheduled' },
  completed:  { bg: 'bg-slate-100 text-slate-600', label: 'Completed' },
  cancelled:  { bg: 'bg-red-100 text-red-700',     label: 'Cancelled' },
  pending:    { bg: 'bg-amber-100 text-amber-700', label: 'Pending' },
  no_show:    { bg: 'bg-red-100 text-red-700',     label: 'No Show' },
  checked_in: { bg: 'bg-teal-100 text-teal-700',   label: 'Checked In' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { bg: 'bg-gray-100 text-gray-600', label: status };
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${cfg.bg}`}>
      {cfg.label}
    </span>
  );
};

// Skeleton card
const ApptSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-14 bg-gray-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  </div>
);

interface ApptCardProps {
  appt: {
    id: string;
    date: string;
    startTime?: string;
    providerName?: string;
    provider?: string;
    appointmentType?: string;
    type?: string;
    locationName?: string;
    location?: string;
    isVirtual?: boolean;
    isTelehealth?: boolean;
    status: string;
  };
  upcoming?: boolean;
}

const ApptCard: React.FC<ApptCardProps> = ({ appt, upcoming }) => {
  const navigate = useNavigate();

  const dateObj = new Date(appt.date);
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const dayLabel = dateObj.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const time = appt.startTime
    ? new Date(`2000-01-01T${appt.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '2:00 PM';

  const providerName = appt.providerName ?? appt.provider ?? 'Dr. Emily Chen, MD';
  const visitType = appt.appointmentType ?? appt.type ?? 'Office Visit';
  const location = appt.isVirtual || appt.isTelehealth
    ? 'Video Visit'
    : (appt.locationName ?? appt.location ?? 'Primus Demo Clinic — Dublin, OH');
  const isVirtual = appt.isVirtual || appt.isTelehealth;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Date badge */}
        <div
          className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 py-1.5 ${
            upcoming ? 'bg-blue-600' : 'bg-slate-100'
          }`}
        >
          <span className={`text-xs font-semibold leading-none ${upcoming ? 'text-blue-200' : 'text-slate-500'}`}>
            {month}
          </span>
          <span className={`text-xl font-bold leading-tight mt-0.5 ${upcoming ? 'text-white' : 'text-slate-700'}`}>
            {day}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-900 text-sm leading-snug pr-1">{visitType}</p>
            <StatusBadge status={appt.status} />
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate">{providerName}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{dayLabel} at {time}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {isVirtual ? (
                <Video className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              ) : (
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Actions for upcoming */}
          {upcoming && (
            <div className="flex flex-wrap gap-2 mt-3">
              {isVirtual ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  <Video className="w-3.5 h-3.5" />
                  Join Telehealth
                </button>
              ) : (
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  Get Directions
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Reschedule
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          )}

          {/* Actions for completed past */}
          {!upcoming && appt.status === 'completed' && (
            <div className="flex flex-wrap gap-2 mt-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                View Summary
              </button>
              <button
                onClick={() => navigate('/appointments/new')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Book Follow-up
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: upcoming = [], isLoading: loadingUp } = useQuery({
    queryKey: ['appointments', 'upcoming', PATIENT_ID],
    queryFn: () => appointmentApi.getUpcoming(PATIENT_ID),
  });

  const { data: past = [], isLoading: loadingPast } = useQuery({
    queryKey: ['appointments', 'past', PATIENT_ID],
    queryFn: () => appointmentApi.getPast(PATIENT_ID),
  });

  // Fallback mock data when shared API returns no patient-specific results
  const fallbackUpcoming = [
    {
      id: 'APT-00042',
      date: '2026-03-24',
      startTime: '14:00',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Follow-up Visit',
      locationName: 'Primus Demo Clinic — Dublin, OH',
      isVirtual: false,
      status: 'confirmed',
    },
    {
      id: 'APT-00043',
      date: '2026-04-07',
      startTime: '10:30',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Annual Wellness Visit',
      locationName: 'Primus Demo Clinic — Dublin, OH',
      isVirtual: false,
      status: 'confirmed',
    },
    {
      id: 'APT-00044',
      date: '2026-04-15',
      startTime: '15:15',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Telehealth — Medication Review',
      locationName: 'Video Visit',
      isVirtual: true,
      status: 'pending',
    },
  ];

  const fallbackPast = [
    {
      id: 'APT-00038',
      date: '2026-03-10',
      startTime: '11:00',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Office Visit — Diabetes Management',
      locationName: 'Primus Demo Clinic — Dublin, OH',
      isVirtual: false,
      status: 'completed',
    },
    {
      id: 'APT-00034',
      date: '2026-02-12',
      startTime: '09:00',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Follow-up — Lab Results',
      locationName: 'Primus Demo Clinic — Dublin, OH',
      isVirtual: false,
      status: 'completed',
    },
    {
      id: 'APT-00031',
      date: '2026-01-20',
      startTime: '14:30',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Telehealth — Urgent Care',
      locationName: 'Video Visit',
      isVirtual: true,
      status: 'completed',
    },
    {
      id: 'APT-00028',
      date: '2025-12-10',
      startTime: '10:00',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Annual Physical',
      locationName: 'Primus Demo Clinic — Dublin, OH',
      isVirtual: false,
      status: 'completed',
    },
    {
      id: 'APT-00024',
      date: '2025-11-05',
      startTime: '13:00',
      providerName: 'Dr. Emily Chen, MD',
      appointmentType: 'Office Visit — Hypertension',
      locationName: 'Primus Demo Clinic — Dublin, OH',
      isVirtual: false,
      status: 'completed',
    },
  ];

  const displayUpcoming = upcoming.length > 0 ? upcoming : fallbackUpcoming;
  const displayPast = past.length > 0 ? past : fallbackPast;
  const isLoading = tab === 'upcoming' ? loadingUp : loadingPast;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your upcoming and past visits</p>
        </div>
        <button
          onClick={() => navigate('/appointments/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Book Appointment</span>
          <span className="sm:hidden">Book</span>
        </button>
      </div>

      {/* Need help banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
        <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p className="text-xs text-blue-700">
          Need to reschedule urgently?{' '}
          <a href="tel:+16145550100" className="font-semibold underline">
            Call (614) 555-0100
          </a>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('upcoming')}
          className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming ({displayUpcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Past ({displayPast.length})
        </button>
      </div>

      {/* Appointment list */}
      {(() => {
        if (isLoading) {
          return (
            <div className="space-y-3 sm:space-y-4">
              <ApptSkeleton />
              <ApptSkeleton />
              <ApptSkeleton />
            </div>
          );
        }

        if (tab === 'upcoming') {
          if (displayUpcoming.length > 0) {
            return (
              <div className="space-y-3 sm:space-y-4">
                {displayUpcoming.map((appt) => (
                  <ApptCard key={appt.id} appt={appt as any} upcoming />
                ))}
              </div>
            );
          }
          return (
            <div className="text-center py-14 sm:py-16">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No upcoming appointments</p>
              <p className="text-sm text-gray-400 mt-1">Schedule your next visit with Dr. Chen</p>
              <button
                onClick={() => navigate('/appointments/new')}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Book an Appointment
              </button>
            </div>
          );
        }

        if (displayPast.length > 0) {
          return (
            <div className="space-y-3 sm:space-y-4">
              {displayPast.map((appt) => (
                <ApptCard key={appt.id} appt={appt as any} />
              ))}
            </div>
          );
        }

        return (
          <div className="text-center py-14 sm:py-16">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No past appointments on record</p>
          </div>
        );
      })()}

      {/* View full history */}
      {!isLoading && tab === 'past' && displayPast.length > 0 && (
        <button className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
          View full visit history <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AppointmentsPage;
