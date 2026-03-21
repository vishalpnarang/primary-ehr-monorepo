import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
type AppointmentType = 'in-person' | 'telehealth';

interface Appointment {
  id: string;
  date: string;
  time: string;
  durationMin: number;
  provider: string;
  providerCredential: string;
  specialty: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  checklist: {
    intakeComplete: boolean;
    insuranceVerified: boolean;
    balanceDue: number;
  };
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_APPOINTMENTS: Record<string, Appointment> = {
  'APT-00001': {
    id: 'APT-00001',
    date: '2026-03-25',
    time: '10:30 AM',
    durationMin: 30,
    provider: 'Dr. Sarah Chen',
    providerCredential: 'MD',
    specialty: 'Family Medicine',
    type: 'telehealth',
    status: 'confirmed',
    reason: 'Annual Wellness Visit',
    location: {
      name: 'Primary Plus — Main Street',
      address: '1200 Main Street, Suite 300',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
    },
    checklist: {
      intakeComplete: false,
      insuranceVerified: true,
      balanceDue: 0,
    },
  },
  'APT-00002': {
    id: 'APT-00002',
    date: '2026-04-10',
    time: '2:00 PM',
    durationMin: 20,
    provider: 'Dr. Marcus Webb',
    providerCredential: 'DO',
    specialty: 'Internal Medicine',
    type: 'in-person',
    status: 'confirmed',
    reason: 'Follow-up: Hypertension Management',
    location: {
      name: 'Primary Plus — Northside',
      address: '870 Elm Avenue, Suite 101',
      city: 'Springfield',
      state: 'IL',
      zip: '62702',
    },
    checklist: {
      intakeComplete: true,
      insuranceVerified: true,
      balanceDue: 25,
    },
  },
};

const FALLBACK_APPOINTMENT: Appointment = {
  id: 'APT-00000',
  date: '2026-03-30',
  time: '9:00 AM',
  durationMin: 30,
  provider: 'Dr. Lisa Park',
  providerCredential: 'MD',
  specialty: 'Family Medicine',
  type: 'in-person',
  status: 'confirmed',
  reason: 'New Patient Visit',
  location: {
    name: 'Primary Plus — Downtown',
    address: '500 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
  },
  checklist: {
    intakeComplete: false,
    insuranceVerified: false,
    balanceDue: 50,
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', color: 'bg-slate-100 text-slate-600', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

interface ChecklistItemProps {
  label: string;
  done: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, done, actionLabel, onAction }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100' : 'bg-slate-100'}`}>
        {done
          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          : <AlertCircle className="w-3.5 h-3.5 text-slate-400" />}
      </div>
      <span className={`text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{label}</span>
    </div>
    {!done && actionLabel && onAction && (
      <button onClick={onAction} className="text-xs text-blue-600 font-medium hover:underline">
        {actionLabel}
      </button>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Cancel / Reschedule modal (lightweight)
// ---------------------------------------------------------------------------

type ModalMode = 'cancel' | 'reschedule' | null;

interface ActionModalProps {
  mode: ModalMode;
  appointmentId: string;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({ mode, appointmentId, onClose }) => {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');

  if (!mode) return null;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 text-lg">
            {mode === 'cancel' ? 'Cancel Appointment' : 'Reschedule Appointment'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {done ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-slate-800">
              {mode === 'cancel' ? 'Appointment cancelled.' : 'Reschedule request sent.'}
            </p>
            <p className="text-sm text-slate-500 mt-1">You will receive a confirmation email shortly.</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Done
            </button>
          </div>
        ) : mode === 'cancel' ? (
          <>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to cancel appointment <span className="font-mono font-medium">{appointmentId}</span>?
              Cancellations within 24 hours may incur a fee.
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Let us know why you're cancelling…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Keep Appointment
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Cancel Appointment'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-4">Select your preferred new date and we'll confirm with the clinic.</p>
            <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
            <input
              type="date"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Keep Current
              </button>
              <button
                onClick={handleConfirm}
                disabled={!newDate || loading}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> : 'Request Reschedule'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [modal, setModal] = useState<ModalMode>(null);

  const appt = (id && MOCK_APPOINTMENTS[id]) ? MOCK_APPOINTMENTS[id] : FALLBACK_APPOINTMENT;

  const formattedDate = new Date(`${appt.date}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const mapsQuery = encodeURIComponent(`${appt.location.address} ${appt.location.city} ${appt.location.state}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const addToCalendar = () => {
    const start = `${appt.date.replace(/-/g, '')}T${appt.time.replace(/[: ]/g, '')}00`;
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Appointment with ${appt.provider}`)}&dates=${start}/${start}&details=${encodeURIComponent(appt.reason)}`;
    window.open(url, '_blank');
  };

  const isTelehealth = appt.type === 'telehealth';
  const isActive = appt.status !== 'cancelled' && appt.status !== 'completed';

  return (
    <>
      {modal && <ActionModal mode={modal} appointmentId={appt.id} onClose={() => setModal(null)} />}

      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-5"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Appointments
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 font-mono mb-1">{appt.id}</p>
              <h1 className="text-xl font-bold text-slate-900">{appt.reason}</h1>
            </div>
            <StatusBadge status={appt.status} />
          </div>

          <div className="space-y-2.5 text-sm text-slate-700">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>{appt.time} &middot; {appt.durationMin} minutes</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              </div>
              <span>
                <span className="font-medium">{appt.provider}</span>, {appt.providerCredential}
                <span className="text-slate-400"> &middot; {appt.specialty}</span>
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              {isTelehealth
                ? <Video className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                : <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />}
              {isTelehealth
                ? <span className="text-blue-600 font-medium">Video Visit</span>
                : (
                  <div>
                    <p className="font-medium">{appt.location.name}</p>
                    <p className="text-slate-500">{appt.location.address}, {appt.location.city}, {appt.location.state} {appt.location.zip}</p>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs flex items-center gap-1 mt-0.5 hover:underline">
                      Get Directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Telehealth join */}
        {isTelehealth && isActive && (
          <div className="bg-blue-600 text-white rounded-2xl p-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">This is a video visit</p>
              <p className="text-blue-200 text-sm mt-0.5">Join from the comfort of home. Your provider will admit you at the scheduled time.</p>
            </div>
            <button
              onClick={() => navigate(`/appointments/${appt.id}/join`)}
              className="flex-shrink-0 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Video className="w-4 h-4" /> Join Video Visit
            </button>
          </div>
        )}

        {/* Pre-visit checklist */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-4">
          <h2 className="font-semibold text-slate-900 mb-1">Pre-visit Checklist</h2>
          <p className="text-xs text-slate-400 mb-3">Complete these before your visit</p>
          <div className="divide-y divide-slate-100">
            <ChecklistItem
              label="Intake form completed"
              done={appt.checklist.intakeComplete}
              actionLabel="Complete Now"
              onAction={() => navigate(`/intake/TOKEN-${appt.id}`)}
            />
            <ChecklistItem
              label="Insurance verified"
              done={appt.checklist.insuranceVerified}
              actionLabel="Update Insurance"
              onAction={() => navigate('/profile')}
            />
            <ChecklistItem
              label={appt.checklist.balanceDue === 0 ? 'No outstanding balance' : `Outstanding balance: $${appt.checklist.balanceDue}`}
              done={appt.checklist.balanceDue === 0}
              actionLabel="Pay Now"
              onAction={() => navigate('/billing/pay')}
            />
          </div>
        </div>

        {/* Actions */}
        {isActive && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setModal('cancel')}
              className="col-span-1 py-2.5 px-3 border border-red-200 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setModal('reschedule')}
              className="col-span-1 py-2.5 px-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Reschedule
            </button>
            <button
              onClick={addToCalendar}
              className="col-span-1 py-2.5 px-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
            {!isTelehealth && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-1 py-2.5 px-3 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5" /> Directions
              </a>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentDetailPage;
