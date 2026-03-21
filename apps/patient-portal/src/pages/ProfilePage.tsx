import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Bell,
  LogOut,
  Edit3,
  Save,
  X,
  CheckCircle,
  MessageSquare,
  Smartphone,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

// ─── Toggle Switch ─────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, label, description, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
        <Icon className={`w-4 h-4 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
        enabled ? 'bg-blue-600' : 'bg-gray-300'
      }`}
      aria-pressed={enabled}
      aria-label={label}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
);

// ─── Read-only field row ────────────────────────────────────────────────────

const InfoRow: React.FC<{ icon: React.FC<{ className?: string }>; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 break-words">{value}</p>
    </div>
  </div>
);

// ─── Text input ────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

// ─── Section shell ─────────────────────────────────────────────────────────

const Section: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  editLabel?: string;
  editing?: boolean;
  onToggleEdit?: () => void;
  children: React.ReactNode;
}> = ({ icon: Icon, title, editLabel, editing, onToggleEdit, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-5 sm:px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {onToggleEdit && (
        <button
          onClick={onToggleEdit}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {editing ? (
            <><X className="w-3.5 h-3.5" /> Cancel</>
          ) : (
            <><Edit3 className="w-3.5 h-3.5" /> {editLabel ?? 'Edit'}</>
          )}
        </button>
      )}
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </div>
);

// ─── Main Page ──────────────────────────────────────────────────────────────

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [editingDemo, setEditingDemo] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState(false);

  const [demoForm, setDemoForm] = useState({
    firstName:   user?.firstName    ?? 'Robert',
    lastName:    user?.lastName     ?? 'Johnson',
    dateOfBirth: user?.dateOfBirth  ?? '1968-04-12',
    gender:      user?.gender       ?? 'Male',
    phone:       user?.phone        ?? '(614) 555-0182',
    email:       user?.email        ?? 'robert.johnson@email.com',
    street:      user?.address?.street ?? '4821 Maple Grove Drive',
    city:        user?.address?.city   ?? 'Columbus',
    state:       user?.address?.state  ?? 'OH',
    zip:         user?.address?.zip    ?? '43215',
  });

  const [insuranceForm, setInsuranceForm] = useState({
    payer:       user?.insurance?.payer       ?? 'Anthem Blue Cross Blue Shield',
    memberId:    user?.insurance?.memberId    ?? 'ANT-88201045',
    groupNumber: user?.insurance?.groupNumber ?? 'GRP-774312',
    planName:    user?.insurance?.planName    ?? 'BlueCare Plus PPO',
  });

  const [emergencyForm, setEmergencyForm] = useState({
    name:         'Sandra Johnson',
    relationship: 'Spouse',
    phone:        '(614) 555-0197',
    email:        'sandra.johnson@email.com',
  });

  const [notifications, setNotifications] = useState({
    sms:                  true,
    email:                true,
    portal:               true,
    appointmentReminders: true,
    labResults:           true,
    billing:              false,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = `${demoForm.firstName[0] ?? ''}${demoForm.lastName[0] ?? ''}`;

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl sm:text-2xl font-bold">{initials}</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {demoForm.firstName} {demoForm.lastName}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{demoForm.email}</p>
          <p className="text-xs text-gray-400 mt-1">Patient ID: {user?.id ?? 'PAT-00001'}</p>
        </div>
      </div>

      {/* Personal Information */}
      <Section
        icon={User}
        title="Personal Information"
        editing={editingDemo}
        onToggleEdit={() => setEditingDemo(!editingDemo)}
      >
        {editingDemo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" value={demoForm.firstName} onChange={(v) => setDemoForm({ ...demoForm, firstName: v })} />
              <Field label="Last Name"  value={demoForm.lastName}  onChange={(v) => setDemoForm({ ...demoForm, lastName: v })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date of Birth" type="date" value={demoForm.dateOfBirth} onChange={(v) => setDemoForm({ ...demoForm, dateOfBirth: v })} />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender</label>
                <select
                  value={demoForm.gender}
                  onChange={(e) => setDemoForm({ ...demoForm, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <Field label="Phone" type="tel" value={demoForm.phone} onChange={(v) => setDemoForm({ ...demoForm, phone: v })} />
            <Field label="Email" type="email" value={demoForm.email} onChange={(v) => setDemoForm({ ...demoForm, email: v })} />
            <Field label="Street Address" value={demoForm.street} onChange={(v) => setDemoForm({ ...demoForm, street: v })} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Field label="City" value={demoForm.city} onChange={(v) => setDemoForm({ ...demoForm, city: v })} />
              </div>
              <Field label="State" value={demoForm.state} onChange={(v) => setDemoForm({ ...demoForm, state: v })} />
              <Field label="ZIP" value={demoForm.zip} onChange={(v) => setDemoForm({ ...demoForm, zip: v })} />
            </div>
            <button
              onClick={() => setEditingDemo(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow icon={User}     label="Full Name"     value={`${demoForm.firstName} ${demoForm.lastName}`} />
            <InfoRow icon={Calendar} label="Date of Birth" value={`${demoForm.dateOfBirth} (Age 57)`} />
            <InfoRow icon={User}     label="Gender"        value={demoForm.gender} />
            <InfoRow icon={Phone}    label="Phone"         value={demoForm.phone} />
            <InfoRow icon={Mail}     label="Email"         value={demoForm.email} />
            <InfoRow icon={MapPin}   label="Address"       value={`${demoForm.street}, ${demoForm.city}, ${demoForm.state} ${demoForm.zip}`} />
          </div>
        )}
      </Section>

      {/* Insurance */}
      <Section
        icon={Shield}
        title="Insurance Information"
        editing={editingInsurance}
        onToggleEdit={() => setEditingInsurance(!editingInsurance)}
      >
        {editingInsurance ? (
          <div className="space-y-4">
            {(
              [
                { key: 'payer',       label: 'Insurance Payer' },
                { key: 'planName',    label: 'Plan Name' },
                { key: 'memberId',    label: 'Member ID' },
                { key: 'groupNumber', label: 'Group Number' },
              ] as const
            ).map(({ key, label }) => (
              <Field
                key={key}
                label={label}
                value={insuranceForm[key]}
                onChange={(v) => setInsuranceForm({ ...insuranceForm, [key]: v })}
              />
            ))}
            <button
              onClick={() => setEditingInsurance(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Insurance Info
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Payer',        value: insuranceForm.payer },
              { label: 'Plan',         value: insuranceForm.planName },
              { label: 'Member ID',    value: insuranceForm.memberId },
              { label: 'Group Number', value: insuranceForm.groupNumber },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Emergency Contact */}
      <Section
        icon={Heart}
        title="Emergency Contact"
        editing={editingEmergency}
        onToggleEdit={() => setEditingEmergency(!editingEmergency)}
      >
        {editingEmergency ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name"     value={emergencyForm.name}         onChange={(v) => setEmergencyForm({ ...emergencyForm, name: v })} />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Relationship</label>
                <select
                  value={emergencyForm.relationship}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Spouse</option>
                  <option>Parent</option>
                  <option>Child</option>
                  <option>Sibling</option>
                  <option>Friend</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <Field label="Phone"  type="tel"   value={emergencyForm.phone} onChange={(v) => setEmergencyForm({ ...emergencyForm, phone: v })} />
            <Field label="Email"  type="email" value={emergencyForm.email} onChange={(v) => setEmergencyForm({ ...emergencyForm, email: v })} />
            <button
              onClick={() => setEditingEmergency(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Emergency Contact
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow icon={User}  label="Name"         value={`${emergencyForm.name} (${emergencyForm.relationship})`} />
            <InfoRow icon={Phone} label="Phone"        value={emergencyForm.phone} />
            <InfoRow icon={Mail}  label="Email"        value={emergencyForm.email} />
            <div className="flex items-start gap-3 mt-1 pt-3 border-t border-gray-100">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500">
                This contact will be notified only in case of a medical emergency at the clinic's discretion.
              </p>
            </div>
          </div>
        )}
      </Section>

      {/* Notification Preferences */}
      <Section icon={Bell} title="Notification Preferences">
        <div className="divide-y divide-gray-100">
          <ToggleSwitch
            enabled={notifications.sms}
            onChange={(v) => setNotifications({ ...notifications, sms: v })}
            label="SMS Notifications"
            description={`Text messages to ${demoForm.phone}`}
            icon={Smartphone}
          />
          <ToggleSwitch
            enabled={notifications.email}
            onChange={(v) => setNotifications({ ...notifications, email: v })}
            label="Email Notifications"
            description={`Emails to ${demoForm.email}`}
            icon={Mail}
          />
          <ToggleSwitch
            enabled={notifications.portal}
            onChange={(v) => setNotifications({ ...notifications, portal: v })}
            label="Portal Notifications"
            description="In-app alerts and badges"
            icon={Bell}
          />
          <ToggleSwitch
            enabled={notifications.appointmentReminders}
            onChange={(v) => setNotifications({ ...notifications, appointmentReminders: v })}
            label="Appointment Reminders"
            description="24h and 1h before your appointment"
            icon={Calendar}
          />
          <ToggleSwitch
            enabled={notifications.labResults}
            onChange={(v) => setNotifications({ ...notifications, labResults: v })}
            label="Lab Results Ready"
            description="Alert when new results are available"
            icon={CheckCircle}
          />
          <ToggleSwitch
            enabled={notifications.billing}
            onChange={(v) => setNotifications({ ...notifications, billing: v })}
            label="Billing Statements"
            description="New statements and payment confirmations"
            icon={MessageSquare}
          />
        </div>
      </Section>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      <div className="text-center text-xs text-gray-400">
        Primus Health Patient Portal · Version 0.1.0
      </div>
    </div>
  );
};

export default ProfilePage;
