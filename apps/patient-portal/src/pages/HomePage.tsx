import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Video,
  MapPin,
  X,
  FlaskConical,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Clock,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUpcomingAppointments, useBalance, useMessageThreads } from '@/hooks/useApi';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Skeleton loader for cards
const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
    <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: upcomingAppts = [], isLoading: loadingAppts } = useUpcomingAppointments();
  const { data: balanceData, isLoading: loadingBalance } = useBalance();
  const { data: apiThreads = [] } = useMessageThreads();

  // Derive values — fall back to sensible defaults when API data is absent
  const nextAppt = upcomingAppts[0];
  // loadingLabs used below for the lab card skeleton — keep consistent with real hook later
  const loadingLabs = false;
  const newLabs: { testName: string } | undefined = undefined;
  const outstandingBalance = (balanceData as { balance?: number } | null)?.balance ?? 45;
  const unreadCount = (apiThreads as Array<{ unread?: boolean }>).filter((t) => t.unread).length;

  const formatApptDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: String(d.getDate()),
      label: d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    };
  };

  const quickActions = [
    {
      label: 'Book Appointment',
      icon: Calendar,
      to: '/appointments/new',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      label: 'Send Message',
      icon: MessageSquare,
      to: '/messages',
      color: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
    },
    {
      label: 'View Records',
      icon: FlaskConical,
      to: '/records',
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
  ];

  const recentActivity = [
    {
      text: 'Lab results from Quest Diagnostics received',
      time: '2 days ago',
      icon: FlaskConical,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      text: 'Appointment confirmed with Dr. Chen',
      time: '5 days ago',
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      text: 'New message from your care team',
      time: '5 days ago',
      icon: MessageSquare,
      color: 'text-violet-600 bg-violet-50',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header greeting */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 sm:p-6 text-white">
        <p className="text-blue-200 text-sm font-medium">{getGreeting()},</p>
        <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-blue-100 text-sm mt-1">Welcome to your Primus Health patient portal</p>
      </div>

      {/* Upcoming Appointment Card */}
      {loadingAppts ? (
        <CardSkeleton />
      ) : nextAppt ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Upcoming Appointment
              </span>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    {formatApptDate(nextAppt.date).label}
                  </span>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="text-sm sm:text-base font-semibold text-gray-700">
                    {nextAppt.startTime?.slice(0, 5) ?? '2:00 PM'}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {nextAppt.providerName ?? 'Dr. Emily Chen, MD'}
                </p>
                <p className="text-sm text-gray-500">{nextAppt.appointmentType}</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                  {nextAppt.isVirtual ? (
                    <Video className="w-3.5 h-3.5 text-blue-500" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  <span className="truncate">
                    {nextAppt.isVirtual ? 'Video Visit' : (nextAppt.locationName ?? 'Primus Think — Dublin, OH')}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {formatApptDate(nextAppt.date).month}
                  </span>
                  <span className="text-white text-lg sm:text-xl font-bold leading-tight">
                    {formatApptDate(nextAppt.date).day}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {nextAppt.isVirtual ? (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <Video className="w-3.5 h-3.5" />
                  Join Telehealth
                </button>
              ) : (
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                  Get Directions
                </button>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                Reschedule
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
          <Calendar className="w-9 h-9 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">No upcoming appointments</p>
          <button
            onClick={() => navigate('/appointments/new')}
            className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calendar className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      )}

      {/* New Results + Messages Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* New Lab Result */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">New Result</p>
            <span className="ml-auto w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
          </div>
          {loadingLabs ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {newLabs?.testName ?? 'Comprehensive Metabolic Panel'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 flex-shrink-0" />
                Ready to view
              </p>
            </>
          )}
          <button
            onClick={() => navigate('/records/labs')}
            className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            View Results <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Unread Message */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Message</p>
            {(unreadCount ?? 1) > 0 && (
              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900">Dr. Emily Chen</p>
          <p className="text-xs text-gray-500 mt-0.5">Mar 18</p>
          <p className="text-xs text-gray-600 mt-2 line-clamp-2 italic">
            "Your A1c results came back. Your level is 6.8%, which shows improvement from last quarter..."
          </p>
          <button
            onClick={() => navigate('/messages')}
            className="mt-4 w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            View Message <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Outstanding Balance */}
      {!loadingBalance && outstandingBalance > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide truncate">
                  Outstanding Balance
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-amber-900 mt-0.5">
                ${outstandingBalance.toFixed(2)}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">Due from visit on Mar 10, 2026</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/billing/pay')}
            className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors"
          >
            Pay Now
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map(({ label, icon: Icon, to, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl text-sm font-medium transition-colors ${color}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">{item.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
