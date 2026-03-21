import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, FlaskConical, ShieldCheck, Clock, Heart } from 'lucide-react';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </div>
);

interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
}

const TrustBadge: React.FC<TrustBadgeProps> = ({ icon, label }) => (
  <div className="flex items-center gap-2 text-slate-600 text-sm">
    <span className="text-blue-600">{icon}</span>
    <span>{label}</span>
  </div>
);

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Nav */}
      <header className="w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-600 tracking-tight">Primus Health</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            Primary Care, Simplified
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
            Welcome to{' '}
            <span className="text-blue-600">Primus Health</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-8">
            Your health, connected. Manage appointments, message your care team, and access
            your medical records — all in one secure place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Register as New Patient
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <TrustBadge icon={<ShieldCheck className="w-4 h-4" />} label="HIPAA Compliant" />
            <TrustBadge icon={<Clock className="w-4 h-4" />} label="24/7 Access" />
            <TrustBadge icon={<ShieldCheck className="w-4 h-4" />} label="Encrypted & Secure" />
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
            Everything you need, in one place
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Calendar className="w-7 h-7" />}
              title="Book Appointments"
              description="Schedule in-person or telehealth visits with your provider in just a few taps. View upcoming and past appointments anytime."
            />
            <FeatureCard
              icon={<MessageSquare className="w-7 h-7" />}
              title="Message Your Doctor"
              description="Send secure messages to your care team and get responses fast — no phone tag, no waiting on hold."
            />
            <FeatureCard
              icon={<FlaskConical className="w-7 h-7" />}
              title="View Lab Results"
              description="Access your lab results as soon as they're available, with plain-language explanations from your provider."
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} Primus Health by Thinkitive Technologies. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default WelcomePage;
