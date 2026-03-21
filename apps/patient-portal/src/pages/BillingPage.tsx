import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  Plus,
  DollarSign,
  Phone,
  FileText,
} from 'lucide-react';
import { billingApi } from '@primus/ui/mocks/api';

const PATIENT_ID = 'PAT-10001';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Statement {
  id: string;
  date: string;
  description: string;
  amount: number;
  insurancePaid: number;
  patientResponsibility: number;
  status: 'paid' | 'unpaid' | 'processing';
  dueDate?: string;
}

// ─── Fallback mock data ─────────────────────────────────────────────────────

const FALLBACK_STATEMENTS: Statement[] = [
  { id: 'STMT-2026-03', date: 'Mar 10, 2026', description: 'Office Visit — Diabetes Management', amount: 220.00, insurancePaid: 175.00, patientResponsibility: 45.00, status: 'unpaid', dueDate: 'Apr 10, 2026' },
  { id: 'STMT-2026-02', date: 'Feb 12, 2026', description: 'Follow-up Visit', amount: 180.00, insurancePaid: 148.00, patientResponsibility: 32.00, status: 'paid' },
  { id: 'STMT-2026-01', date: 'Jan 20, 2026', description: 'Telehealth Visit', amount: 150.00, insurancePaid: 120.00, patientResponsibility: 30.00, status: 'paid' },
  { id: 'STMT-2025-12', date: 'Dec 10, 2025', description: 'Annual Physical', amount: 350.00, insurancePaid: 350.00, patientResponsibility: 0.00, status: 'paid' },
  { id: 'STMT-2025-11', date: 'Nov 5, 2025', description: 'Office Visit — Hypertension', amount: 190.00, insurancePaid: 155.00, patientResponsibility: 35.00, status: 'paid' },
];

const FALLBACK_PAYMENTS = [
  { date: 'Feb 14, 2026', description: 'Payment — Follow-up Visit (Feb 12)', amount: 32.00, method: 'Visa ••••4521', reference: 'PAY-8841' },
  { date: 'Jan 25, 2026', description: 'Payment — Telehealth Visit (Jan 20)', amount: 30.00, method: 'Visa ••••4521', reference: 'PAY-8712' },
  { date: 'Dec 18, 2025', description: 'Payment — Office Visit (Nov 5)', amount: 35.00, method: 'Visa ••••4521', reference: 'PAY-8550' },
];

// ─── Skeleton ───────────────────────────────────────────────────────────────

const StatementSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="h-5 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Status Badge ────────────────────────────────────────────────────────────

const statusBadge = (status: Statement['status']) => {
  const map = {
    paid:       { bg: 'bg-teal-50 text-teal-700',   icon: CheckCircle, label: 'Paid' },
    unpaid:     { bg: 'bg-amber-100 text-amber-700', icon: AlertCircle, label: 'Unpaid' },
    processing: { bg: 'bg-blue-100 text-blue-700',   icon: Clock,       label: 'Processing' },
  };
  const { bg, icon: Icon, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${bg}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const BillingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'statements' | 'payments'>('statements');

  const { data: balanceData, isLoading: loadingBalance } = useQuery({
    queryKey: ['balance', PATIENT_ID],
    queryFn: () => billingApi.getPatientBalance(PATIENT_ID),
  });

  // Always use fallback statements for display — the shared billing API returns provider-facing claims data
  const statements = FALLBACK_STATEMENTS;
  const payments = FALLBACK_PAYMENTS;

  const outstandingBalance = balanceData?.balance && balanceData.balance > 0
    ? balanceData.balance
    : statements.filter((s) => s.status === 'unpaid').reduce((sum, s) => sum + s.patientResponsibility, 0);

  const totalPaid = statements.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.patientResponsibility, 0);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your statements and payments</p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Outstanding Balance — spans 2 cols on sm+ */}
        <div className="sm:col-span-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-amber-100 text-sm font-medium">Outstanding Balance</p>
              {loadingBalance ? (
                <div className="h-10 bg-amber-400/40 rounded w-28 mt-1 animate-pulse" />
              ) : (
                <p className="text-3xl sm:text-4xl font-bold mt-1">${outstandingBalance.toFixed(2)}</p>
              )}
              <p className="text-amber-200 text-xs mt-1">Due by Apr 10, 2026</p>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          {outstandingBalance > 0 && (
            <button
              onClick={() => navigate('/billing/pay')}
              className="mt-5 w-full bg-white text-amber-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay ${outstandingBalance.toFixed(2)} Now
            </button>
          )}
        </div>

        {/* Payment method on file */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Payment on File</p>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Visa ••••4521</p>
              <p className="text-xs text-gray-500">Expires 09/28</p>
            </div>
          </div>
          <button className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            Add payment method
          </button>
        </div>
      </div>

      {/* YTD summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Paid This Year</p>
          <p className="text-lg font-bold text-teal-700">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-400 mb-1">Total Statements</p>
          <p className="text-lg font-bold text-gray-900">{statements.length}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-700">Billing Questions?</p>
            <a href="tel:+16145550100" className="text-xs text-blue-600 underline">(614) 555-0100</a>
          </div>
        </div>
      </div>

      {/* Insurance on file */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 sm:px-5 py-3.5 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-blue-900 truncate">
            Anthem Blue Cross Blue Shield — BlueCare Plus PPO
          </p>
          <p className="text-xs text-blue-600 truncate">Member ID: ANT-88201045 · Group: GRP-774312</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('statements')}
          className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'statements' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Statements ({statements.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'payments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Payment History
        </button>
      </div>

      {/* Statements */}
      {activeTab === 'statements' && (
        <div className="space-y-3">
          {statements.map((stmt) => (
            <div key={stmt.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{stmt.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stmt.date}</p>
                  {stmt.status === 'unpaid' && stmt.dueDate && (
                    <p className="text-xs text-amber-600 mt-0.5">Due: {stmt.dueDate}</p>
                  )}
                </div>
                {statusBadge(stmt.status)}
              </div>

              {/* Cost breakdown */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2 px-1">
                  <p className="text-xs text-gray-400 leading-tight">Total Charge</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">${stmt.amount.toFixed(2)}</p>
                </div>
                <div className="bg-teal-50 rounded-lg py-2 px-1">
                  <p className="text-xs text-gray-400 leading-tight">Insurance</p>
                  <p className="text-sm font-semibold text-teal-700 mt-0.5">${stmt.insurancePaid.toFixed(2)}</p>
                </div>
                <div className={`rounded-lg py-2 px-1 ${stmt.status === 'unpaid' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                  <p className="text-xs text-gray-400 leading-tight">You Owe</p>
                  <p className={`text-sm font-bold mt-0.5 ${stmt.status === 'unpaid' ? 'text-amber-700' : 'text-gray-700'}`}>
                    ${stmt.patientResponsibility.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {stmt.status === 'unpaid' && (
                  <button
                    onClick={() => navigate('/billing/pay')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Pay ${stmt.patientResponsibility.toFixed(2)}
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors ml-auto">
                  <FileText className="w-3.5 h-3.5" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment History — mobile-friendly card list instead of table */}
      {activeTab === 'payments' && (
        <div className="space-y-3">
          {/* Desktop table — hidden on mobile */}
          <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Description</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Reference</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.reference} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{p.date}</td>
                    <td className="px-5 py-4 text-gray-600 text-xs max-w-[180px] truncate">{p.description}</td>
                    <td className="px-5 py-4 text-gray-500">{p.method}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">{p.reference}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-teal-700">${p.amount.toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {payments.map((p) => (
              <div key={p.reference} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{p.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.date}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400">{p.method}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{p.reference}</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-teal-700 flex-shrink-0">${p.amount.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-xs text-teal-700 font-medium">Payment confirmed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
