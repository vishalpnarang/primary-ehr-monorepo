import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Download, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerCommissions } from '@/hooks/useApi';

interface CommissionRecord {
  id: string;
  period: string;
  paidDate: string | null;
  employers: { name: string; premium: string; commission: string }[];
  totalPremium: string;
  totalCommission: string;
  commissionRate: string;
  status: 'paid' | 'processing' | 'upcoming';
}

const MOCK_COMMISSIONS: CommissionRecord[] = [
  {
    id: 'COM-0326',
    period: 'March 2026',
    paidDate: null,
    employers: [
      { name: 'Meridian Technology Solutions', premium: '$104,580', commission: '$3,137' },
      { name: 'Lakeside Healthcare Partners', premium: '$78,300', commission: '$2,349' },
      { name: 'Columbus Distribution Co.', premium: '$127,160', commission: '$3,815' },
      { name: 'Buckeye Financial Services', premium: '$35,560', commission: '$1,067' },
      { name: 'Summit Engineering Group', premium: '$58,500', commission: '$1,755' },
    ],
    totalPremium: '$404,100',
    totalCommission: '$12,123',
    commissionRate: '3%',
    status: 'upcoming',
  },
  {
    id: 'COM-0226',
    period: 'February 2026',
    paidDate: '2026-03-07',
    employers: [
      { name: 'Meridian Technology Solutions', premium: '$102,440', commission: '$3,073' },
      { name: 'Lakeside Healthcare Partners', premium: '$76,760', commission: '$2,303' },
      { name: 'Columbus Distribution Co.', premium: '$125,220', commission: '$3,757' },
      { name: 'Buckeye Financial Services', premium: '$35,560', commission: '$1,067' },
      { name: 'Summit Engineering Group', premium: '$57,460', commission: '$1,724' },
    ],
    totalPremium: '$397,440',
    totalCommission: '$11,923',
    commissionRate: '3%',
    status: 'paid',
  },
  {
    id: 'COM-0126',
    period: 'January 2026',
    paidDate: '2026-02-06',
    employers: [
      { name: 'Meridian Technology Solutions', premium: '$99,260', commission: '$2,978' },
      { name: 'Lakeside Healthcare Partners', premium: '$74,100', commission: '$2,223' },
      { name: 'Columbus Distribution Co.', premium: '$121,680', commission: '$3,650' },
      { name: 'Buckeye Financial Services', premium: '$35,560', commission: '$1,067' },
      { name: 'Summit Engineering Group', premium: '$55,380', commission: '$1,661' },
    ],
    totalPremium: '$385,980',
    totalCommission: '$11,579',
    commissionRate: '3%',
    status: 'paid',
  },
];

const statusConfig = {
  paid: { label: 'Paid', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border border-green-200' },
  processing: { label: 'Processing', icon: Clock, class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  upcoming: { label: 'Upcoming', icon: Calendar, class: 'bg-gray-50 text-gray-600 border border-gray-200' },
};

const CommissionsPage = () => {
  const [expanded, setExpanded] = useState<string | null>('COM-0326');

  const user = useAuthStore((s) => s.user);
  const brokerId = user?.agencyId ?? '';

  // Real API — falls back to MOCK_COMMISSIONS when backend is down
  const { data: apiCommissions, isLoading: apiLoading } = useBrokerCommissions(brokerId);

  const { data: commissions, isLoading } = useQuery({
    queryKey: ['broker-commissions', brokerId],
    queryFn: async (): Promise<CommissionRecord[]> => {
      if (Array.isArray(apiCommissions) && apiCommissions.length > 0) {
        return apiCommissions as CommissionRecord[];
      }
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_COMMISSIONS;
    },
    enabled: !apiLoading,
  });

  const ytdTotal = '$35,625';
  const ytdPremium = '$1,187,520';
  const avgRate = '3.0%';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Commission tracking and payment history</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Commission YTD</p>
            <p className="text-xl font-bold text-gray-900">{ytdTotal}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Premium Booked YTD</p>
            <p className="text-xl font-bold text-gray-900">{ytdPremium}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Rate</p>
            <p className="text-xl font-bold text-gray-900">{avgRate}</p>
            <p className="text-xs text-gray-400">of gross premium</p>
          </div>
        </div>
      </div>

      {/* Commission records */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse h-20" />
            ))
          : commissions?.map((com) => {
              const sc = statusConfig[com.status];
              const StatusIcon = sc.icon;
              const isOpen = expanded === com.id;

              return (
                <div key={com.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                  <button
                    onClick={() => setExpanded(isOpen ? null : com.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{com.period}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.class}`}>
                          <StatusIcon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {com.status === 'paid'
                          ? `Paid ${new Date(com.paidDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : 'Est. payment: Apr 7, 2026'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{com.totalCommission}</p>
                      <p className="text-xs text-gray-400">on {com.totalPremium} premium · {com.commissionRate}</p>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase tracking-wide">
                            <th className="text-left pb-2">Employer</th>
                            <th className="text-right pb-2">Premium</th>
                            <th className="text-right pb-2">Commission ({com.commissionRate})</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {com.employers.map((emp) => (
                            <tr key={emp.name}>
                              <td className="py-2 text-gray-700">{emp.name}</td>
                              <td className="py-2 text-right text-gray-600">{emp.premium}</td>
                              <td className="py-2 text-right font-medium text-gray-900">{emp.commission}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300">
                            <td className="pt-2 font-semibold text-gray-900">Total</td>
                            <td className="pt-2 text-right font-semibold text-gray-900">{com.totalPremium}</td>
                            <td className="pt-2 text-right font-bold text-violet-700">{com.totalCommission}</td>
                          </tr>
                        </tfoot>
                      </table>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
                        <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                          <Download className="w-3.5 h-3.5" />
                          Download Statement
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default CommissionsPage;
