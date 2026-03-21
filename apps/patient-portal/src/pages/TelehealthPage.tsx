import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Settings,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SessionState = 'setup' | 'waiting' | 'connected' | 'ended';

interface DeviceStatus {
  cameraOk: boolean;
  micOk: boolean;
  checking: boolean;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface DeviceCheckRowProps {
  label: string;
  ok: boolean;
  checking: boolean;
}

const DeviceCheckRow: React.FC<DeviceCheckRowProps> = ({ label, ok, checking }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-700">{label}</span>
    {checking ? (
      <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
    ) : ok ? (
      <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
        <CheckCircle2 className="w-4 h-4" /> Ready
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
        <AlertCircle className="w-4 h-4" /> Not detected
      </span>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Setup / Device check screen
// ---------------------------------------------------------------------------

interface SetupScreenProps {
  devices: DeviceStatus;
  onJoin: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ devices, onJoin }) => {
  const allReady = devices.cameraOk && devices.micOk && !devices.checking;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-3xl mx-auto w-full">
      {/* Camera preview */}
      <div className="flex-1">
        <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
          {/* Mock camera feed */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          <div className="relative z-10 flex flex-col items-center gap-2 text-slate-400">
            <Video className="w-10 h-10" />
            <span className="text-sm">Camera Preview</span>
          </div>
          {/* Mic indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-full">
            <Mic className="w-3.5 h-3.5 text-green-400" />
            <div className="flex gap-0.5">
              {[2, 4, 3, 5, 2].map((h, i) => (
                <div key={i} className="w-0.5 bg-green-400 rounded-full animate-pulse" style={{ height: `${h * 3}px`, animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device check panel */}
      <div className="lg:w-72 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-slate-900 mb-0.5">Device Check</h2>
          <p className="text-xs text-slate-500">Make sure your camera and microphone are working</p>
        </div>

        <div>
          <DeviceCheckRow label="Camera" ok={devices.cameraOk} checking={devices.checking} />
          <DeviceCheckRow label="Microphone" ok={devices.micOk} checking={devices.checking} />
          <DeviceCheckRow label="Network" ok={true} checking={false} />
        </div>

        {!devices.checking && !allReady && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
            One or more devices could not be detected. Please check your browser permissions and try again.
          </div>
        )}

        <button
          onClick={onJoin}
          disabled={!allReady}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Video className="w-4 h-4" /> Join Visit
        </button>

        <button className="w-full py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" /> Audio &amp; Video Settings
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Waiting room screen
// ---------------------------------------------------------------------------

interface WaitingRoomProps {
  providerName: string;
  waitSeconds: number;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ providerName, waitSeconds }) => {
  const mins = Math.floor(waitSeconds / 60);
  const secs = waitSeconds % 60;

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full py-12">
      {/* Animated pulse ring */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-50" />
        <div className="relative w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center">
          <Video className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">You're in the waiting room</h2>
      <p className="text-slate-500 text-sm mb-6">
        Waiting for <span className="font-semibold text-slate-700">{providerName}</span> to admit you…
      </p>

      {/* Wait time */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 mb-6 flex items-center gap-3">
        <Clock className="w-5 h-5 text-slate-400" />
        <div className="text-left">
          <p className="text-xs text-slate-500">Time in waiting room</p>
          <p className="text-lg font-semibold text-slate-800 font-mono">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-500">
        <p>Please keep this window open and stay nearby.</p>
        <p>Make sure your camera and microphone are on.</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Connected / video call screen
// ---------------------------------------------------------------------------

interface ConnectedScreenProps {
  providerName: string;
  onEnd: () => void;
}

const ConnectedScreen: React.FC<ConnectedScreenProps> = ({ providerName, onEnd }) => {
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full max-w-3xl mx-auto'}`}>
      {/* Video area */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        {/* Provider video (mock) */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-slate-300">
              {providerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-sm">{providerName}</span>
          </div>
        </div>

        {/* Self view PiP */}
        <div className="absolute bottom-3 right-3 w-28 sm:w-36 aspect-video bg-slate-800 rounded-xl border-2 border-slate-600 overflow-hidden flex items-center justify-center">
          {cameraOff
            ? <VideoOff className="w-6 h-6 text-slate-400" />
            : <span className="text-xs text-slate-400">You</span>}
        </div>

        {/* Timer badge */}
        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-mono px-3 py-1.5 rounded-full">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        {/* Connected badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-600/80 text-white text-xs px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
          Connected
        </div>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="absolute bottom-3 left-3 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-5">
        <button
          onClick={() => setMuted((m) => !m)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button
          onClick={onEnd}
          className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCameraOff((c) => !c)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${cameraOff ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          aria-label={cameraOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 mt-3">
        This visit is not recorded. All communication is encrypted and HIPAA-compliant.
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Ended screen
// ---------------------------------------------------------------------------

const EndedScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => (
  <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full py-12">
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
      <CheckCircle2 className="w-8 h-8 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Visit Ended</h2>
    <p className="text-slate-500 text-sm mb-6">
      Your visit has ended. An after-visit summary will be available in your health records within 24 hours.
    </p>
    <button onClick={onDone} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
      Back to Appointments
    </button>
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const TelehealthPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [waitSeconds, setWaitSeconds] = useState(0);
  const [devices, setDevices] = useState<DeviceStatus>({ cameraOk: false, micOk: false, checking: true });

  const providerName = 'Dr. Sarah Chen';

  // Simulate device check
  useEffect(() => {
    const t = setTimeout(() => {
      setDevices({ cameraOk: true, micOk: true, checking: false });
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  // Simulate provider admitting patient after 8s in waiting room
  useEffect(() => {
    if (sessionState !== 'waiting') return;
    const t = setInterval(() => setWaitSeconds((s) => s + 1), 1000);
    const admit = setTimeout(() => setSessionState('connected'), 8000);
    return () => {
      clearInterval(t);
      clearTimeout(admit);
    };
  }, [sessionState]);

  const handleJoin = () => setSessionState('waiting');
  const handleEnd = () => setSessionState('ended');

  const title: Record<SessionState, string> = {
    setup: 'Prepare for Your Visit',
    waiting: 'Waiting Room',
    connected: 'In Progress',
    ended: 'Visit Complete',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        {sessionState !== 'connected' && (
          <button
            onClick={() => navigate(`/appointments/${id}`)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <p className="text-xs text-slate-400 font-mono">{id}</p>
          <h1 className="font-semibold text-slate-900">{title[sessionState]}</h1>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Secure &amp; Encrypted
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {sessionState === 'setup' && <SetupScreen devices={devices} onJoin={handleJoin} />}
        {sessionState === 'waiting' && <WaitingRoom providerName={providerName} waitSeconds={waitSeconds} />}
        {sessionState === 'connected' && <ConnectedScreen providerName={providerName} onEnd={handleEnd} />}
        {sessionState === 'ended' && <EndedScreen onDone={() => navigate('/appointments')} />}
      </main>
    </div>
  );
};

export default TelehealthPage;
