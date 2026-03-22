import React, { useState } from 'react';
import { useOrganization, useLocations, useUsers, useRbacRoles, useRbacFeatures, useAppointmentTypes } from '@/hooks/useApi';
import {
  Building2,
  MapPin,
  Users,
  ShieldCheck,
  Stethoscope,
  CreditCard,
  DollarSign,
  Plug2,
  FileText,
  Calendar,
  Globe,
  Layers,
  ClipboardList,
  Flag,
  Upload,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  ChevronRight,
  Mail,
  Phone,
  Download,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@primus/ui/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingSection =
  | 'organization' | 'locations' | 'users' | 'roles' | 'providers'
  | 'payers' | 'fee_schedule' | 'integrations' | 'templates' | 'appointment_types'
  | 'tenants' | 'platform' | 'audit_log' | 'feature_flags';

interface NavItem {
  key: SettingSection;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { key: 'organization',      label: 'Organization',       icon: <Building2 className="w-4 h-4" />,   roles: ['tenant_admin', 'practice_admin'] },
  { key: 'locations',         label: 'Locations',          icon: <MapPin className="w-4 h-4" />,      roles: ['tenant_admin', 'practice_admin'] },
  { key: 'users',             label: 'Users',              icon: <Users className="w-4 h-4" />,       roles: ['tenant_admin', 'practice_admin'] },
  { key: 'roles',             label: 'Roles & Permissions', icon: <ShieldCheck className="w-4 h-4" />, roles: ['tenant_admin'] },
  { key: 'providers',         label: 'Providers',          icon: <Stethoscope className="w-4 h-4" />, roles: ['tenant_admin', 'practice_admin'] },
  { key: 'payers',            label: 'Payers',             icon: <CreditCard className="w-4 h-4" />,  roles: ['tenant_admin', 'practice_admin'] },
  { key: 'fee_schedule',      label: 'Fee Schedule',       icon: <DollarSign className="w-4 h-4" />,  roles: ['tenant_admin'] },
  { key: 'integrations',      label: 'Integrations',       icon: <Plug2 className="w-4 h-4" />,       roles: ['tenant_admin'] },
  { key: 'templates',         label: 'Templates',          icon: <FileText className="w-4 h-4" />,    roles: ['tenant_admin', 'practice_admin'] },
  { key: 'appointment_types', label: 'Appointment Types',  icon: <Calendar className="w-4 h-4" />,    roles: ['tenant_admin', 'practice_admin'] },
  { key: 'tenants',           label: 'Tenants',            icon: <Globe className="w-4 h-4" />,       roles: ['super_admin'] },
  { key: 'platform',          label: 'Platform',           icon: <Layers className="w-4 h-4" />,      roles: ['super_admin'] },
  { key: 'audit_log',         label: 'Audit Log',          icon: <ClipboardList className="w-4 h-4" />, roles: ['super_admin'] },
  { key: 'feature_flags',     label: 'Feature Flags',      icon: <Flag className="w-4 h-4" />,        roles: ['super_admin'] },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS = [
  { id: 'USR-00002', name: 'James Wilson',    email: 'james.wilson@primusdemo.com',    role: 'Tenant Admin',    status: 'active',   lastLogin: '2026-03-19 09:12' },
  { id: 'USR-00003', name: 'Maria Garcia',    email: 'maria.garcia@primusdemo.com',    role: 'Practice Admin',  status: 'active',   lastLogin: '2026-03-19 08:45' },
  { id: 'USR-00004', name: 'Emily Chen',      email: 'emily.chen@primusdemo.com',      role: 'Provider',        status: 'active',   lastLogin: '2026-03-19 07:30' },
  { id: 'USR-00005', name: 'Sarah Thompson',  email: 'sarah.thompson@primusdemo.com',  role: 'Nurse / MA',      status: 'active',   lastLogin: '2026-03-18 16:00' },
  { id: 'USR-00006', name: 'David Kim',       email: 'david.kim@primusdemo.com',       role: 'Front Desk',      status: 'active',   lastLogin: '2026-03-19 07:50' },
  { id: 'USR-00007', name: 'Lisa Patel',      email: 'lisa.patel@primusdemo.com',      role: 'Billing Staff',   status: 'active',   lastLogin: '2026-03-18 14:22' },
  { id: 'USR-00008', name: 'Kevin Torres',    email: 'kevin.torres@primusdemo.com',    role: 'Provider',        status: 'active',   lastLogin: '2026-03-17 17:10' },
  { id: 'USR-00009', name: 'Rachel Moore',    email: 'rachel.moore@primusdemo.com',    role: 'Nurse / MA',      status: 'active',   lastLogin: '2026-03-18 08:00' },
  { id: 'USR-00010', name: 'Tom Bradley',     email: 'tom.bradley@primusdemo.com',     role: 'Front Desk',      status: 'inactive', lastLogin: '2026-02-28 12:00' },
  { id: 'USR-00011', name: 'Amanda Foster',   email: 'amanda.foster@primusdemo.com',   role: 'Billing Staff',   status: 'pending',  lastLogin: 'Never' },
];

const MOCK_LOCATIONS = [
  {
    id: 'LOC-00001',
    name: 'Primus Think — Downtown',
    address: '250 W 57th St, Suite 801, New York, NY 10107',
    phone: '(212) 555-0100',
    fax: '(212) 555-0101',
    rooms: ['Exam 1', 'Exam 2', 'Exam 3', 'Exam 4', 'Lab Draw', 'Procedure'],
    active: true,
  },
  {
    id: 'LOC-00002',
    name: 'Primus Think — Midtown',
    address: '420 Lexington Ave, Suite 300, New York, NY 10170',
    phone: '(212) 555-0200',
    fax: '(212) 555-0201',
    rooms: ['Exam A', 'Exam B', 'Exam C', 'Telehealth Room'],
    active: true,
  },
  {
    id: 'LOC-00003',
    name: 'Primus Think — Uptown',
    address: '2880 Broadway, Suite 201, New York, NY 10025',
    phone: '(212) 555-0300',
    fax: '(212) 555-0301',
    rooms: ['Room 1', 'Room 2', 'Room 3'],
    active: false,
  },
];

const MOCK_TENANTS = [
  { id: 'TEN-00001', name: 'Primus Think', subdomain: 'primusdemo', locations: 3, users: 11, status: 'active',       createdAt: '2025-10-01' },
  { id: 'TEN-00002', name: 'Riverside Family Medicine',  subdomain: 'riverside',   locations: 2, users: 8,  status: 'active',       createdAt: '2026-01-15' },
  { id: 'TEN-00003', name: 'Lakewood Internal Medicine', subdomain: 'lakewood',    locations: 1, users: 5,  status: 'provisioning', createdAt: '2026-03-10' },
  { id: 'TEN-00004', name: 'Sunrise Health Partners',    subdomain: 'sunrise',     locations: 4, users: 22, status: 'active',       createdAt: '2025-12-01' },
  { id: 'TEN-00005', name: 'Valley Primary Care',        subdomain: 'valley',      locations: 1, users: 3,  status: 'inactive',     createdAt: '2026-02-20' },
];

const MOCK_AUDIT = [
  { id: 'AUD-001', user: 'Emily Chen',    action: 'Viewed patient chart',   resource: 'Patient PAT-00001',     ip: '192.168.1.45', ts: '2026-03-19 13:55:02' },
  { id: 'AUD-002', user: 'David Kim',     action: 'Scheduled appointment',  resource: 'Appointment APT-00234', ip: '192.168.1.12', ts: '2026-03-19 13:42:18' },
  { id: 'AUD-003', user: 'Maria Garcia',  action: 'Invited user',           resource: 'User amanda.foster',    ip: '10.0.0.8',     ts: '2026-03-19 11:20:44' },
  { id: 'AUD-004', user: 'Emily Chen',    action: 'Signed encounter note',  resource: 'Encounter ENC-00088',   ip: '192.168.1.45', ts: '2026-03-19 10:14:33' },
  { id: 'AUD-005', user: 'Lisa Patel',    action: 'Submitted claim',        resource: 'Claim CLM-00001',       ip: '192.168.1.67', ts: '2026-03-19 09:58:10' },
  { id: 'AUD-006', user: 'Sarah Thompson', action: 'Recorded vitals',       resource: 'Patient PAT-00008',     ip: '192.168.1.30', ts: '2026-03-19 09:30:05' },
  { id: 'AUD-007', user: 'James Wilson',  action: 'Updated org settings',   resource: 'Organization TEN-00001', ip: '10.0.0.5',    ts: '2026-03-19 08:10:22' },
];

const MOCK_FLAGS = [
  { key: 'telehealth',          label: 'Telehealth (Jitsi)',          enabled: true,  env: 'all' },
  { key: 'eprescribing',        label: 'E-Prescribing (EPCS)',        enabled: true,  env: 'prod' },
  { key: 'labs_integration',    label: 'Lab Integration (Quest)',     enabled: false, env: 'all' },
  { key: 'patient_portal',      label: 'Patient Portal',              enabled: true,  env: 'all' },
  { key: 'stripe_payments',     label: 'Stripe Payments',             enabled: false, env: 'prod' },
  { key: 'ai_suggestions',      label: 'AI Clinical Suggestions',     enabled: false, env: 'beta' },
  { key: 'hedis_dashboard',     label: 'HEDIS Dashboard',             enabled: true,  env: 'all' },
  { key: 'multi_tenant_switch', label: 'Multi-tenant Switcher',       enabled: true,  env: 'super_admin' },
];

// ─── Section Views ────────────────────────────────────────────────────────────

const OrganizationView: React.FC = () => {
  const [saved, setSaved] = useState(false);
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-5">Practice Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Practice Name</label>
            <input
              type="text"
              defaultValue="Primus Think"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Group NPI</label>
            <input
              type="text"
              defaultValue="1234567890"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Tax ID (EIN)</label>
            <input
              type="text"
              defaultValue="12-3456789"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Main Phone</label>
            <input
              type="tel"
              defaultValue="(212) 555-0100"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Address Line 1</label>
            <input
              type="text"
              defaultValue="250 W 57th St, Suite 801"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
            <input
              type="text"
              defaultValue="New York"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">State</label>
              <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>NY</option>
                <option>NJ</option>
                <option>CT</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">ZIP Code</label>
              <input
                type="text"
                defaultValue="10107"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Practice Logo</h3>
        <p className="text-xs text-gray-500 mb-4">
          Shown on patient-facing documents and reports. PNG or SVG, max 2 MB.
        </p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            PP
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
            <Upload className="w-4 h-4" />
            Upload Logo
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          className={`px-5 py-2.5 text-white text-sm font-medium rounded-lg transition-colors ${
            saved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
        <button className="px-5 py-2.5 bg-white border border-slate-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Discard
        </button>
      </div>
    </div>
  );
};

const LocationsView: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{MOCK_LOCATIONS.length} locations configured</p>
      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Add Location
      </button>
    </div>
    {MOCK_LOCATIONS.map((loc) => (
      <div key={loc.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">{loc.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                loc.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {loc.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {loc.address}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{loc.phone}</span>
              <span>Fax: {loc.fax}</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-700 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-gray-500 mr-1">Rooms:</span>
          {loc.rooms.map((room) => (
            <span key={room} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{room}</span>
          ))}
          <button className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Edit <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    ))}
  </div>
);

const UsersView: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Mail className="w-4 h-4" />
          Invite User
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                      {u.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : u.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.status === 'active' && <CheckCircle className="w-3 h-3" />}
                    {u.status === 'inactive' && <XCircle className="w-3 h-3" />}
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.lastLogin}</td>
                <td className="px-4 py-3">
                  <button className="text-gray-400 hover:text-gray-700 p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">No users match your search.</div>
        )}
      </div>
    </div>
  );
};

const TenantsView: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">{MOCK_TENANTS.length} tenants registered</p>
      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Provision Tenant
      </button>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tenant</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Subdomain</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Locations</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Users</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_TENANTS.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 font-mono">{t.id}</p>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-blue-600">{t.subdomain}.primus.app</td>
              <td className="px-4 py-3 text-center font-semibold text-gray-700">{t.locations}</td>
              <td className="px-4 py-3 text-center font-semibold text-gray-700">{t.users}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  t.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700'
                    : t.status === 'provisioning'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{t.createdAt}</td>
              <td className="px-4 py-3">
                <button className="text-gray-400 hover:text-gray-700 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AuditLogView: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search audit log..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option>All users</option>
        {MOCK_USERS.map((u) => <option key={u.id}>{u.name}</option>)}
      </select>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Timestamp</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Action</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Resource</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">IP</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_AUDIT.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{entry.ts}</td>
              <td className="px-4 py-3 font-medium text-gray-900 text-sm">{entry.user}</td>
              <td className="px-4 py-3 text-gray-700 text-sm">{entry.action}</td>
              <td className="px-4 py-3 text-xs font-mono text-blue-600">{entry.resource}</td>
              <td className="px-4 py-3 text-xs font-mono text-gray-400">{entry.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-400 text-center">
      Showing last 50 entries. Audit logs retained for 7 years per HIPAA requirements.
    </p>
  </div>
);

const FeatureFlagsView: React.FC = () => {
  const { data: apiFeatures } = useRbacFeatures();
  // If API returns feature flags, map them; otherwise fall back to mock
  const apiMappedFlags = (apiFeatures as { key?: string; name: string; enabled: boolean; env?: string }[] | undefined)
    ?.map((f) => ({ key: f.key ?? f.name, label: f.name, enabled: f.enabled, env: f.env ?? 'all' }));
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const resolvedFlags = apiMappedFlags ?? flags;
  const toggle = (key: string) =>
    setFlags((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)));

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-2">
        <Flag className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          Feature flags affect all tenants and users immediately. Changes are logged in the audit trail. Use with caution in production.
        </p>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        {resolvedFlags.map((flag) => (
          <div key={flag.key} className="flex items-center justify-between px-5 py-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{flag.label}</p>
                <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  {flag.env}
                </span>
              </div>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{flag.key}</p>
            </div>
            <button
              onClick={() => toggle(flag.key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                flag.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={flag.enabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  flag.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Roles & Permissions View ─────────────────────────────────────────────────

const ROLES_DATA = [
  {
    name: 'Tenant Admin',    description: 'Full access to all clinic settings and data', users: 1,
    perms: { Dashboard: true,  Scheduling: true,  Patients: true,  Inbox: true,  Billing: true,  Reports: true,  Settings: true },
  },
  {
    name: 'Practice Admin',  description: 'Daily operations, scheduling, and staff management', users: 2,
    perms: { Dashboard: true,  Scheduling: true,  Patients: true,  Inbox: true,  Billing: true,  Reports: true,  Settings: false },
  },
  {
    name: 'Provider',        description: 'Clinical charting, prescribing, and order management', users: 2,
    perms: { Dashboard: true,  Scheduling: true,  Patients: true,  Inbox: true,  Billing: false, Reports: false, Settings: false },
  },
  {
    name: 'Nurse / MA',      description: 'Rooming, vitals, clinical support tasks', users: 2,
    perms: { Dashboard: true,  Scheduling: false, Patients: true,  Inbox: true,  Billing: false, Reports: false, Settings: false },
  },
  {
    name: 'Front Desk',      description: 'Scheduling, check-in, and patient registration', users: 2,
    perms: { Dashboard: true,  Scheduling: true,  Patients: true,  Inbox: false, Billing: false, Reports: false, Settings: false },
  },
  {
    name: 'Billing Staff',   description: 'Claims management, ERA posting, and RCM tasks', users: 2,
    perms: { Dashboard: true,  Scheduling: false, Patients: false, Inbox: false, Billing: true,  Reports: true,  Settings: false },
  },
];

const MODULES = ['Dashboard', 'Scheduling', 'Patients', 'Inbox', 'Billing', 'Reports', 'Settings'] as const;

const RolesView: React.FC = () => {
  const { data: apiRoles } = useRbacRoles();
  // Map API roles to the shape used by the table; fall back to mock
  const resolvedRoles = (apiRoles as { name: string; description?: string; userCount?: number }[] | undefined)
    ?.map((r) => ({
      name: r.name,
      description: r.description ?? '',
      users: r.userCount ?? 0,
      perms: ROLES_DATA.find((d) => d.name === r.name)?.perms ?? {
        Dashboard: true, Scheduling: false, Patients: false,
        Inbox: false, Billing: false, Reports: false, Settings: false,
      },
    })) ?? ROLES_DATA;

  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{resolvedRoles.length} roles configured</p>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Role
        </button>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Users</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resolvedRoles.map((role) => (
              <React.Fragment key={role.name}>
                <tr
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === role.name ? null : role.name)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${expanded === role.name ? 'rotate-90' : ''}`} />
                      <span className="font-medium text-gray-900 text-sm">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{role.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{role.users}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-700 p-1" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {expanded === role.name && (
                  <tr>
                    <td colSpan={4} className="px-5 pb-4 pt-2 bg-slate-50">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Module Permissions</p>
                      <div className="grid grid-cols-7 gap-3">
                        {MODULES.map((mod) => (
                          <label key={mod} className="flex flex-col items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={role.perms[mod]}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="text-[10px] text-gray-600 font-medium">{mod}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Providers View ───────────────────────────────────────────────────────────

const MOCK_PROVIDERS_LIST = [
  { id: 'PRV-00001', name: 'Dr. Emily Chen',   npi: '1234567890', dea: 'BC1234567', specialty: 'Internal Medicine',   licenseState: 'NY', status: 'active' },
  { id: 'PRV-00002', name: 'Dr. Kevin Torres', npi: '0987654321', dea: 'BT9876543', specialty: 'Family Medicine',      licenseState: 'NY', status: 'active' },
  { id: 'PRV-00003', name: 'Dr. Rachel Moore', npi: '1122334455', dea: 'BR1122334', specialty: 'Preventive Medicine',  licenseState: 'NY', status: 'inactive' },
];

const ProvidersView: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">{MOCK_PROVIDERS_LIST.length} providers on file</p>
      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Add Provider
      </button>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">NPI</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">DEA</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Specialty</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">License State</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_PROVIDERS_LIST.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400 font-mono">{p.id}</p>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.npi}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.dea}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{p.specialty}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{p.licenseState}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {p.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="text-gray-400 hover:text-gray-700 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Payers View ──────────────────────────────────────────────────────────────

const MOCK_PAYERS_LIST = [
  { id: 'PAY-001', name: 'Aetna',           payerId: 'AETNA',    ediId: '60054', type: 'Commercial', eraEnrolled: true,  status: 'active' },
  { id: 'PAY-002', name: 'UnitedHealth',    payerId: 'UHC',      ediId: '87726', type: 'Commercial', eraEnrolled: true,  status: 'active' },
  { id: 'PAY-003', name: 'BlueCross BCBS',  payerId: 'BCBS-NY',  ediId: '00956', type: 'Commercial', eraEnrolled: true,  status: 'active' },
  { id: 'PAY-004', name: 'Medicare',        payerId: 'MEDICARE', ediId: '00590', type: 'Medicare',   eraEnrolled: true,  status: 'active' },
  { id: 'PAY-005', name: 'Medicaid NY',     payerId: 'MDCD-NY',  ediId: '13162', type: 'Medicaid',   eraEnrolled: false, status: 'active' },
  { id: 'PAY-006', name: 'Cigna',           payerId: 'CIGNA',    ediId: '62308', type: 'Commercial', eraEnrolled: false, status: 'inactive' },
];

const PayersView: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">{MOCK_PAYERS_LIST.length} payers configured</p>
      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Add Payer
      </button>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payer Name</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Payer ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">EDI ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">ERA Enrolled</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_PAYERS_LIST.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-blue-600">{p.payerId}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.ediId}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.type === 'Medicare'   ? 'bg-blue-100 text-blue-700' :
                  p.type === 'Medicaid'   ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{p.type}</span>
              </td>
              <td className="px-4 py-3 text-center">
                {p.eraEnrolled
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                  : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                }
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="text-gray-400 hover:text-gray-700 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Fee Schedule View ────────────────────────────────────────────────────────

const MOCK_FEE_SCHEDULE = [
  { cpt: '99211', desc: 'Office Visit, Minimal Complexity',         fee: 80,  medicare: 22.45,  bluecross: 64.00 },
  { cpt: '99212', desc: 'Office Visit, Low Complexity (brief)',     fee: 120, medicare: 46.37,  bluecross: 96.00 },
  { cpt: '99213', desc: 'Office Visit, Low Complexity',            fee: 160, medicare: 76.60,  bluecross: 128.00 },
  { cpt: '99214', desc: 'Office Visit, Moderate Complexity',       fee: 220, medicare: 114.49, bluecross: 176.00 },
  { cpt: '99215', desc: 'Office Visit, High Complexity',           fee: 290, medicare: 145.31, bluecross: 232.00 },
  { cpt: '99381', desc: 'Preventive Visit, New Patient, <1 yr',    fee: 200, medicare: 0,      bluecross: 160.00 },
  { cpt: '99385', desc: 'Preventive Visit, New Patient, 18–39 yr', fee: 260, medicare: 0,      bluecross: 208.00 },
  { cpt: '99386', desc: 'Preventive Visit, New Patient, 40–64 yr', fee: 290, medicare: 0,      bluecross: 232.00 },
  { cpt: '99395', desc: 'Preventive Visit, Est. Patient, 18–39 yr',fee: 310, medicare: 0,      bluecross: 248.00 },
  { cpt: '99396', desc: 'Preventive Visit, Est. Patient, 40–64 yr',fee: 330, medicare: 0,      bluecross: 264.00 },
];

const fmtFee = (n: number) => n > 0 ? `$${n.toFixed(2)}` : '—';

const FeeScheduleView: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">{MOCK_FEE_SCHEDULE.length} CPT codes configured</p>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add CPT
        </button>
      </div>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">CPT Code</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Description</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Default Fee</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Medicare Rate</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Blue Cross Rate</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MOCK_FEE_SCHEDULE.map((row) => (
            <tr key={row.cpt} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono text-sm font-bold text-blue-600">{row.cpt}</td>
              <td className="px-4 py-3 text-xs text-gray-700">{row.desc}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtFee(row.fee)}</td>
              <td className="px-4 py-3 text-right text-gray-600">{fmtFee(row.medicare)}</td>
              <td className="px-4 py-3 text-right text-gray-600">{fmtFee(row.bluecross)}</td>
              <td className="px-4 py-3">
                <button className="text-gray-400 hover:text-gray-700 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Integrations View ────────────────────────────────────────────────────────

const INTEGRATIONS_DATA = [
  {
    name: 'Quest Diagnostics',  category: 'Lab Orders', status: 'connected',
    lastSync: '2026-03-21 06:00', credential: 'Account ID: QD-88210',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    name: 'ScriptSure EPCS',    category: 'E-Prescribing', status: 'connected',
    lastSync: '2026-03-21 09:14', credential: 'Site ID: SS-4412',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    name: 'Availity',           category: 'Clearinghouse', status: 'connected',
    lastSync: '2026-03-21 08:30', credential: 'Trading Partner: AVL-99341',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    name: 'Twilio SMS',         category: 'Notifications', status: 'connected',
    lastSync: '2026-03-21 07:45', credential: 'Account SID: AC••••••••3f81',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    name: 'Stripe',             category: 'Payments', status: 'not_configured',
    lastSync: 'Never', credential: 'API key not configured',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

const IntegrationsView: React.FC = () => (
  <div className="space-y-3">
    <p className="text-xs text-gray-500">{INTEGRATIONS_DATA.filter((i) => i.status === 'connected').length} of {INTEGRATIONS_DATA.length} integrations connected</p>
    <div className="grid grid-cols-1 gap-3">
      {INTEGRATIONS_DATA.map((intg) => (
        <div key={intg.name} className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${intg.color}`}>
                <Plug2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{intg.name}</p>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{intg.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{intg.credential}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  intg.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {intg.status === 'connected' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {intg.status === 'connected' ? 'Connected' : 'Not Configured'}
                </span>
                <p className="text-[10px] text-gray-400 mt-1 text-right">Last sync: {intg.lastSync}</p>
              </div>
              <button className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                intg.status === 'connected'
                  ? 'border-slate-200 text-gray-600 hover:bg-slate-50'
                  : 'border-blue-300 bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {intg.status === 'connected' ? 'Configure' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Templates View ───────────────────────────────────────────────────────────

const MOCK_TEMPLATES = [
  { id: 'TPL-001', name: 'SOAP Note — General',        type: 'SOAP',     specialty: 'Primary Care',   createdBy: 'Dr. Emily Chen' },
  { id: 'TPL-002', name: 'Annual Wellness Visit',      type: 'H&P',      specialty: 'Preventive',     createdBy: 'Dr. Kevin Torres' },
  { id: 'TPL-003', name: 'Hypertension Follow-up',     type: 'Progress', specialty: 'Cardiology',     createdBy: 'Dr. Emily Chen' },
  { id: 'TPL-004', name: 'Diabetes Management Note',   type: 'Progress', specialty: 'Endocrinology',  createdBy: 'Dr. Kevin Torres' },
  { id: 'TPL-005', name: 'New Patient H&P',            type: 'H&P',      specialty: 'Primary Care',   createdBy: 'Dr. Emily Chen' },
];

const MOCK_SMART_PHRASES = [
  { trigger: '.ros',    expansion: 'Systems reviewed: Constitutional, HEENT, Cardiovascular, Respiratory, GI, Musculoskeletal, Neurological — all negative except as noted.', category: 'Review of Systems' },
  { trigger: '.norm',   expansion: 'Examination is within normal limits. Vital signs stable. Patient is alert and oriented.',                                                   category: 'Physical Exam' },
  { trigger: '.htn',    expansion: 'Blood pressure management discussed. Patient counseled on low-sodium diet, regular exercise, and medication compliance.',                    category: 'Counseling' },
  { trigger: '.dm2',    expansion: 'Type 2 diabetes mellitus. Last HbA1c reviewed. Patient counseled on glucose monitoring, foot care, and dietary modifications.',            category: 'Counseling' },
  { trigger: '.fu2w',   expansion: 'Follow up in 2 weeks or sooner if symptoms worsen. Patient instructed to call with any concerns.',                                          category: 'Follow-up' },
  { trigger: '.fu1m',   expansion: 'Return to clinic in 1 month for reassessment. Lab results to be reviewed at next visit.',                                                   category: 'Follow-up' },
  { trigger: '.reflab', expansion: 'Laboratory work ordered. Patient instructed to fast for 12 hours prior. Quest Diagnostics requisition provided.',                           category: 'Orders' },
  { trigger: '.nka',    expansion: 'No known allergies to medications, foods, or environmental agents.',                                                                        category: 'Allergies' },
];

const TYPE_COLORS: Record<string, string> = {
  SOAP: 'bg-blue-100 text-blue-700',
  'H&P': 'bg-purple-100 text-purple-700',
  Progress: 'bg-emerald-100 text-emerald-700',
};

const TemplatesView: React.FC = () => (
  <div className="space-y-6">
    {/* Note Templates */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Note Templates</h3>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Template
        </button>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Template Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Specialty</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Created By</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_TEMPLATES.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-2.5 font-medium text-gray-900 text-sm">{t.name}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[t.type] ?? 'bg-gray-100 text-gray-700'}`}>{t.type}</span>
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{t.specialty}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{t.createdBy}</td>
                <td className="px-4 py-2.5">
                  <button className="text-gray-400 hover:text-gray-700 p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Smart Phrases */}
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Smart Phrases</h3>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          New Phrase
        </button>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden divide-y divide-gray-50">
        {MOCK_SMART_PHRASES.map((sp) => (
          <div key={sp.trigger} className="flex items-start gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-0.5 flex-shrink-0">{sp.trigger}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 line-clamp-2">{sp.expansion}</p>
              <span className="text-[10px] text-gray-400 mt-1 inline-block">{sp.category}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-700 p-1 flex-shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Appointment Types View ───────────────────────────────────────────────────

const MOCK_APT_TYPES = [
  { id: 'AT-001', name: 'Office Visit',              duration: 20, color: '#3B82F6', selfSchedule: true,  status: 'active' },
  { id: 'AT-002', name: 'Annual Wellness Exam',      duration: 60, color: '#10B981', selfSchedule: true,  status: 'active' },
  { id: 'AT-003', name: 'Follow-up',                 duration: 15, color: '#8B5CF6', selfSchedule: true,  status: 'active' },
  { id: 'AT-004', name: 'New Patient Consultation',  duration: 45, color: '#F59E0B', selfSchedule: false, status: 'active' },
  { id: 'AT-005', name: 'Telehealth Visit',          duration: 20, color: '#06B6D4', selfSchedule: true,  status: 'active' },
  { id: 'AT-006', name: 'Urgent Care / Same-day',   duration: 30, color: '#EF4444', selfSchedule: false, status: 'inactive' },
];

const AppointmentTypesView: React.FC = () => {
  const { data: apiApptTypes } = useAppointmentTypes();
  const resolvedApptTypes = (apiApptTypes as typeof MOCK_APT_TYPES | undefined) ?? MOCK_APT_TYPES;
  return (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">{resolvedApptTypes.length} appointment types</p>
      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="w-4 h-4" />
        Add Type
      </button>
    </div>
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type Name</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Color</th>
            <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Self-Schedule</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {resolvedApptTypes.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-medium text-gray-900">{t.name}</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">{t.duration} min</td>
              <td className="px-4 py-3 text-center">
                <span
                  className="inline-block w-5 h-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: t.color }}
                  title={t.color}
                />
              </td>
              <td className="px-4 py-3 text-center">
                {t.selfSchedule
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                  : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />
                }
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {t.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button className="text-gray-400 hover:text-gray-700 p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

// ─── Platform View (Super Admin) ──────────────────────────────────────────────

const SERVICES = [
  { name: 'Auth Service (Keycloak)', status: 'operational' },
  { name: 'API Gateway',             status: 'operational' },
  { name: 'Background Worker',       status: 'degraded'    },
  { name: 'PostgreSQL (Primary)',    status: 'operational' },
  { name: 'Redis Cache',             status: 'operational' },
];

const HEALTH_CARDS = [
  { label: 'API Uptime',      value: '99.97%', sub: 'Last 30 days',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'DB Connections',  value: '24 / 100', sub: 'Active / Max',  color: 'text-blue-600',    bg: 'bg-blue-50' },
  { label: 'Queue Depth',     value: '142',    sub: 'Jobs pending',     color: 'text-amber-600',   bg: 'bg-amber-50' },
  { label: 'Error Rate',      value: '0.03%',  sub: 'Last 1 hour',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const PlatformView: React.FC = () => (
  <div className="space-y-6">
    {/* Health Cards */}
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {HEALTH_CARDS.map((card) => (
        <div key={card.label} className={`rounded-lg border border-slate-200 p-4 ${card.bg}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>

    {/* Service Status */}
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-gray-900">Service Status</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {SERVICES.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between px-5 py-3">
            <p className="text-sm text-gray-800 font-medium">{svc.name}</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                svc.status === 'operational' ? 'bg-emerald-500' :
                svc.status === 'degraded'    ? 'bg-amber-500'   :
                'bg-red-500'
              }`} />
              <span className={`text-xs font-medium capitalize ${
                svc.status === 'operational' ? 'text-emerald-600' :
                svc.status === 'degraded'    ? 'text-amber-600'   :
                'text-red-600'
              }`}>{svc.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3">
      <button className="px-4 py-2 bg-white border border-slate-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
        Force Cache Flush
      </button>
      <button className="px-4 py-2 bg-white border border-slate-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
        Drain Job Queue
      </button>
      <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors ml-auto">
        Enable Maintenance Mode
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const role: UserRole = user?.role ?? 'tenant_admin';

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const defaultSection = visibleNav[0]?.key ?? 'organization';
  const [activeSection, setActiveSection] = useState<SettingSection>(defaultSection);

  const activeNavItem = NAV_ITEMS.find((n) => n.key === activeSection);

  const renderContent = () => {
    switch (activeSection) {
      case 'organization':  return <OrganizationView />;
      case 'locations':     return <LocationsView />;
      case 'users':         return <UsersView />;
      case 'tenants':       return <TenantsView />;
      case 'audit_log':     return <AuditLogView />;
      case 'feature_flags': return <FeatureFlagsView />;
      case 'roles':            return <RolesView />;
      case 'providers':        return <ProvidersView />;
      case 'payers':           return <PayersView />;
      case 'fee_schedule':     return <FeeScheduleView />;
      case 'integrations':     return <IntegrationsView />;
      case 'templates':        return <TemplatesView />;
      case 'appointment_types': return <AppointmentTypesView />;
      case 'platform':         return <PlatformView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Left sidebar nav */}
      <aside className="w-56 flex-shrink-0">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-6">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {role === 'super_admin' ? 'Platform Admin' : 'Clinic Settings'}
            </p>
          </div>
          <nav className="py-1">
            {visibleNav.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${
                  activeSection === item.key
                    ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
                }`}
              >
                <span className={activeSection === item.key ? 'text-blue-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          {user && (
            <div className="border-t border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-gray-400 capitalize">
                    {user.role.replaceAll('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{activeNavItem?.icon}</span>
            <h1 className="text-xl font-semibold text-gray-900">{activeNavItem?.label}</h1>
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default SettingsPage;
