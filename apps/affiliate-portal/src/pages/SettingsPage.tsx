import { useState } from 'react';
import { User, FileText, Bell, Save, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

type Tab = 'profile' | 'agreements' | 'notifications';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'agreements', label: 'Agreements', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const MOCK_AGREEMENTS = [
  { id: 'agr-001', name: 'Affiliate Partnership Agreement', signed: '2024-09-15', expires: '2026-09-14', status: 'active' },
  { id: 'agr-002', name: 'HIPAA Business Associate Agreement (BAA)', signed: '2024-09-15', expires: 'Perpetual', status: 'active' },
  { id: 'agr-003', name: 'Commission Schedule — FY2026', signed: '2025-12-20', expires: '2026-12-31', status: 'active' },
];

const SettingsPage = () => {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    organization: user?.organization ?? '',
    npi: 'N/A',
    taxId: '82-4719302',
    bankAccount: 'Chase Business ···4821',
    routingNumber: '···9200',
  });

  const [notifPrefs, setNotifPrefs] = useState({
    newReferralConfirm: true,
    referralConverted: true,
    paymentProcessed: true,
    monthlyStatement: true,
    agreementExpiring: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your affiliate profile, agreements, and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Tab nav */}
        <nav className="w-44 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    activeTab === id
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
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

        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Affiliate Profile</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'First Name', key: 'firstName' },
                  { label: 'Last Name', key: 'lastName' },
                  { label: 'Email', key: 'email' },
                  { label: 'Phone', key: 'phone' },
                  { label: 'Organization Name', key: 'organization' },
                  { label: 'NPI (if applicable)', key: 'npi' },
                  { label: 'Tax ID / EIN', key: 'taxId' },
                  { label: 'Bank Account', key: 'bankAccount' },
                  { label: 'Routing Number', key: 'routingNumber' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={profileForm[key as keyof typeof profileForm]}
                      onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'agreements' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Agreements & Documents</h2>
                <p className="text-xs text-gray-400 mt-0.5">All agreements are stored securely and digitally signed</p>
              </div>
              <div className="divide-y divide-gray-100">
                {MOCK_AGREEMENTS.map((agr) => (
                  <div key={agr.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{agr.name}</p>
                        <p className="text-xs text-gray-400">
                          Signed: {new Date(agr.signed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' · '}Expires: {agr.expires}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                      <button className="text-xs text-blue-600 hover:underline">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {(
                  [
                    { key: 'newReferralConfirm', label: 'Referral Confirmation', desc: 'Email confirmation when a referral is successfully submitted' },
                    { key: 'referralConverted', label: 'Patient Enrolled Alert', desc: 'Notify when a referred patient completes enrollment' },
                    { key: 'paymentProcessed', label: 'Payment Processed', desc: 'Alert when commission payment is deposited to your bank' },
                    { key: 'monthlyStatement', label: 'Monthly Statement', desc: 'Monthly summary of referrals, conversions, and commissions' },
                    { key: 'agreementExpiring', label: 'Agreement Expiry Warning', desc: 'Notify 60 days before any agreement expires' },
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
                        notifPrefs[key] ? 'bg-emerald-600' : 'bg-gray-200'
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
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saved ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
