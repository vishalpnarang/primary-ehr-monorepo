import { useQuery } from '@tanstack/react-query';
import { DollarSign, Download, CheckCircle2, Clock, Calendar } from 'lucide-react';

interface Payment {
  id: string;
  period: string;
  paidDate: string | null;
  referrals: number;
  converted: number;
  ratePerConversion: string;
  amount: string;
  status: 'paid' | 'processing' | 'upcoming';
  method: string;
}

const MOCK_PAYMENTS: Payment[] = [
  { id: 'PAY-0312', period: 'March 2026', paidDate: null, referrals: 9, converted: 7, ratePerConversion: '$120', amount: '$840', status: 'upcoming', method: 'ACH — Chase Business ···4821' },
  { id: 'PAY-0212', period: 'February 2026', paidDate: '2026-03-05', referrals: 12, converted: 10, ratePerConversion: '$120', amount: '$1,200', status: 'paid', method: 'ACH — Chase Business ···4821' },
  { id: 'PAY-0112', period: 'January 2026', paidDate: '2026-02-05', referrals: 14, converted: 11, ratePerConversion: '$120', amount: '$1,320', status: 'paid', method: 'ACH — Chase Business ···4821' },
  { id: 'PAY-1225', period: 'December 2025', paidDate: '2026-01-06', referrals: 7, converted: 5, ratePerConversion: '$120', amount: '$600', status: 'paid', method: 'ACH — Chase Business ···4821' },
  { id: 'PAY-1125', period: 'November 2025', paidDate: '2025-12-04', referrals: 11, converted: 9, ratePerConversion: '$120', amount: '$1,080', status: 'paid', method: 'ACH — Chase Business ···4821' },
  { id: 'PAY-1025', period: 'October 2025', paidDate: '2025-11-05', referrals: 8, converted: 6, ratePerConversion: '$120', amount: '$720', status: 'paid', method: 'ACH — Chase Business ···4821' },
];

const statusConfig = {
  paid: { label: 'Paid', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border border-green-200' },
  processing: { label: 'Processing', icon: Clock, class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  upcoming: { label: 'Upcoming', icon: Calendar, class: 'bg-gray-50 text-gray-600 border border-gray-200' },
};

const PaymentsPage = () => {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['affiliate-payments'],
    queryFn: async (): Promise<Payment[]> => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_PAYMENTS;
    },
  });

  const totalPaid = payments?.filter((p) => p.status === 'paid').reduce((sum) => sum, 0);
  const paidAmount = '$4,920';
  const upcoming = payments?.find((p) => p.status === 'upcoming');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments & Commissions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Commission paid at $120 per successfully enrolled referral</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Earned (6 mo)</p>
            <p className="text-xl font-bold text-gray-900">{paidAmount}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Payments Received</p>
            <p className="text-xl font-bold text-gray-900">{totalPaid ?? 0} months</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Next Payment</p>
            <p className="text-xl font-bold text-gray-900">{upcoming?.amount ?? '—'}</p>
            <p className="text-xs text-gray-400">Est. Apr 5, 2026</p>
          </div>
        </div>
      </div>

      {/* Payment list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Payment History</h2>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Period</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Referrals</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Converted</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Rate</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments?.map((pay) => {
                  const sc = statusConfig[pay.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={pay.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{pay.period}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{pay.referrals}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{pay.converted}</td>
                      <td className="px-5 py-3 text-right text-gray-500">{pay.ratePerConversion}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900">{pay.amount}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs">
                        {pay.paidDate
                          ? new Date(pay.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Est. Apr 5, 2026'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
