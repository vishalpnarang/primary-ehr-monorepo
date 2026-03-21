import { useState } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

interface CriticalAlertModalProps {
  open: boolean;
  patientName: string;
  title: string;
  value?: string;
  unit?: string;
  description: string;
  onAcknowledge: () => void;
}

export const CriticalAlertModal = ({
  open, patientName, title, value, unit, description, onAcknowledge,
}: CriticalAlertModalProps) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!open) return null;

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setTimeout(onAcknowledge, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-critical" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-critical w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-xl shadow-2xl border-2 border-red-300 overflow-hidden">
          {/* Red header */}
          <div className="bg-red-600 px-5 py-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">Critical Alert</span>
          </div>

          <div className="p-5">
            <p className="text-xs text-gray-500 mb-1">Patient: <strong className="text-gray-900">{patientName}</strong></p>
            <h2 className="text-base font-bold text-gray-900 mb-2">{title}</h2>

            {value ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3 text-center">
                <span className="text-3xl font-bold font-mono text-red-700">{value}</span>
                {unit ? <span className="text-sm text-red-500 ml-1">{unit}</span> : null}
              </div>
            ) : null}

            <p className="text-sm text-gray-600 mb-4">{description}</p>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Received: {new Date().toLocaleTimeString()}</span>
            </div>

            <button
              onClick={handleAcknowledge}
              disabled={acknowledged}
              className={`w-full py-3 rounded-lg text-sm font-bold transition-colors ${
                acknowledged
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {acknowledged ? 'Acknowledged — Logged' : 'I Acknowledge — Patient Notified'}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-2">
              This action will be logged in the audit trail with your name and timestamp.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
