import { useState } from 'react';
import { Building2, Users, Bell, Lock, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

const MOCK_ADMINS: AdminUser[] = [
  { id: 'adm-001', name: 'Patricia Harrington', email: 'pharrington@meridiantech.com', role: 'Admin', lastLogin: '2026-03-22T09:00:00Z' },
  { id: 'adm-002', name: 'Gregory Walsh', email: 'gwalsh@meridiantech.com', role: 'HR Manager', lastLogin: '2026-03-21T14:22:00Z' },
  { id: 'adm-003', name: 'Diane Foster', email: 'dfoster@meridiantech.com', role: 'Viewer', lastLogin: '2026-03-18T10:05:00Z' },
];

type Tab = 'company' | 'users' | 'notifications' | 'security';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'users', label: 'Admin Users', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
];

const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [saved, setSaved] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: user?.company ?? 'Meridian Technology Solutions',
    ein: '47-2831920',
    address: '1840 Innovation Drive',
    city: 'Columbus',
    state: 'OH',
    zip: '43215',
    phone: '(614) 555-0200',
    website: 'www.meridiantech.com',
    contactName: 'Patricia Harrington',
    contactEmail: 'pharrington@meridiantech.com',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    invoiceDue: true,
    invoiceOverdue: true,
    enrollmentReminders: true,
    claimUpdates: false,
    monthlySummary: true,
    newEmployeeEnrolled: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your company profile and portal preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="w-48 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === 'company' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Company Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Company Name', key: 'name' },
                  { label: 'Employer Identification Number (EIN)', key: 'ein' },
                  { label: 'Street Address', key: 'address' },
                  { label: 'City', key: 'city' },
                  { label: 'State', key: 'state' },
                  { label: 'ZIP Code', key: 'zip' },
                  { label: 'Phone Number', key: 'phone' },
                  { label: 'Website', key: 'website' },
                  { label: 'Primary Contact Name', key: 'contactName' },
                  { label: 'Primary Contact Email', key: 'contactEmail' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={companyForm[key as keyof typeof companyForm]}
                      onChange={(e) => setCompanyForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Admin Users</h2>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  + Invite User
                </button>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Last Login</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_ADMINS.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-900">{admin.name}</p>
                        <p className="text-xs text-gray-400">{admin.email}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(admin.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button className="text-xs text-gray-400 hover:text-red-600 transition-colors">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {(
                  [
                    { key: 'invoiceDue', label: 'Invoice Due Reminders', desc: 'Receive email when an invoice is approaching its due date' },
                    { key: 'invoiceOverdue', label: 'Overdue Invoice Alerts', desc: 'Receive alerts when an invoice becomes overdue' },
                    { key: 'enrollmentReminders', label: 'Open Enrollment Reminders', desc: 'Notify employees and admins about enrollment deadlines' },
                    { key: 'claimUpdates', label: 'Claim Status Updates', desc: 'Receive updates when employee claims are processed' },
                    { key: 'monthlySummary', label: 'Monthly Summary Report', desc: 'Email summary of spend, enrollment, and claims at month end' },
                    { key: 'newEmployeeEnrolled', label: 'New Employee Enrolled', desc: 'Alert when a new employee completes enrollment' },
                  ] as const
                ).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
                        notifPrefs[key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          notifPrefs[key] ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <Lock className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">Multi-Factor Authentication is enabled for all admin users</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">Session Timeout</p>
                    <p className="text-xs text-gray-500 mt-0.5 mb-3">Auto-logout after inactivity</p>
                    <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                    </select>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">IP Allowlist</p>
                    <p className="text-xs text-gray-500 mt-0.5 mb-3">Restrict access to specific IP ranges</p>
                    <button className="text-sm text-blue-600 hover:underline">Configure →</button>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-1">Change Admin Password</p>
                  <p className="text-xs text-gray-500 mb-3">Password was last changed 42 days ago</p>
                  <button className="px-4 py-2 border border-gray-200 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
