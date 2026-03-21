import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ChevronLeft, CheckCircle, Video, MapPin } from 'lucide-react';

const providers = [
  { id: 'PRV-00001', name: 'Dr. Emily Chen, MD', specialty: 'Internal Medicine', available: true },
  { id: 'PRV-00002', name: 'Dr. Marcus Williams, MD', specialty: 'Internal Medicine', available: true },
  { id: 'PRV-00003', name: 'Sarah Park, NP', specialty: 'Family Medicine', available: false },
];

const visitTypes = [
  { id: 'follow-up', label: 'Follow-up Visit', duration: '20 min' },
  { id: 'annual', label: 'Annual Wellness Visit', duration: '45 min' },
  { id: 'sick', label: 'Sick Visit', duration: '15 min' },
  { id: 'telehealth', label: 'Telehealth Visit', duration: '20 min', icon: Video },
  { id: 'lab-review', label: 'Lab Results Review', duration: '15 min' },
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '1:00 PM', '1:30 PM', '2:00 PM',
  '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
];

const NewAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState('PRV-00001');
  const [selectedType, setSelectedType] = useState('follow-up');
  const [selectedDate, setSelectedDate] = useState('2026-04-22');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => navigate('/appointments'), 2500);
  };

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Appointment Requested!</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">
          Your request has been sent to the clinic. You'll receive a confirmation shortly.
        </p>
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6 text-left w-full max-w-sm">
          <p className="text-sm font-semibold text-gray-900">
            {providers.find((p) => p.id === selectedProvider)?.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {visitTypes.find((t) => t.id === selectedType)?.label}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {selectedDate} at {selectedTime}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Redirecting to appointments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/appointments'))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-xs text-gray-400">Step {step} of 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primus-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1 — Provider + Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Select a Provider</h2>
            <div className="space-y-3">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => p.available && setSelectedProvider(p.id)}
                  disabled={!p.available}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-left ${
                    selectedProvider === p.id
                      ? 'border-primus-600 bg-primus-50'
                      : p.available
                      ? 'border-gray-200 hover:border-gray-300 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="w-10 h-10 bg-primus-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primus-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.specialty}</p>
                  </div>
                  {!p.available && <span className="ml-auto text-xs text-gray-400">Unavailable</span>}
                  {selectedProvider === p.id && p.available && (
                    <CheckCircle className="ml-auto w-5 h-5 text-primus-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Visit Type</h2>
            <div className="space-y-2">
              {visitTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors text-left ${
                    selectedType === t.id
                      ? 'border-primus-600 bg-primus-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {t.icon ? (
                    <t.icon className="w-4 h-4 text-primus-500" />
                  ) : (
                    <MapPin className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-800 flex-1">{t.label}</span>
                  <span className="text-xs text-gray-400">{t.duration}</span>
                  {selectedType === t.id && <CheckCircle className="w-4 h-4 text-primus-600" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full bg-primus-600 hover:bg-primus-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2 — Date & Time */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Select Date</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min="2026-03-20"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primus-500"
            />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Available Times{' '}
              <span className="text-xs font-normal text-gray-400">— {selectedDate}</span>
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-colors ${
                    selectedTime === t
                      ? 'border-primus-600 bg-primus-600 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-primus-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full bg-primus-600 hover:bg-primus-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Reason for Visit (Optional)</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your reason for visiting or any symptoms..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primus-500 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Appointment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Provider</span>
                <span className="font-medium text-gray-900">
                  {providers.find((p) => p.id === selectedProvider)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Visit Type</span>
                <span className="font-medium text-gray-900">
                  {visitTypes.find((t) => t.id === selectedType)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{selectedTime}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-primus-600 hover:bg-primus-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm Appointment Request
          </button>
        </div>
      )}
    </div>
  );
};

export default NewAppointmentPage;
