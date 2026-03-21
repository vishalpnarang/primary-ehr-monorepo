import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Lock, Shield } from 'lucide-react';

const SESSION_KEY = 'primus-internal-access';
const CORRECT_PASSWORD = 'primus2026';

const InternalGate = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setUnlocked(true);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setError(false);
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 600);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (unlocked) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={
          shake
            ? {
                animation: 'shake 0.5s ease-in-out',
              }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Access</h1>
          <p className="text-slate-500 text-sm mt-1 text-center">
            This area is restricted to Thinkitive Technologies staff.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Access Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Enter access password"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-400 focus:ring-red-200 bg-red-50'
                    : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'
                }`}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                Incorrect password. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Unlock Access
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Primus EHR — Thinkitive Technologies &copy; 2026
        </p>
      </div>

      {/* Shake keyframes via style tag */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          90% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default InternalGate;
