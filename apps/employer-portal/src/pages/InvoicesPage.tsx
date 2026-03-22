import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  period: string;
  dueDate: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  items: { description: string; count: number; unitPrice: string; total: string }[];
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-0312',
    period: 'March 2026',
    dueDate: '2026-03-31',
    amount: '$104,580.00',
    status: 'pending',
    items: [
      { description: 'BlueCare Plus PPO (142 members)', count: 142, unitPrice: '$520.00', total: '$73,840.00' },
      { description: 'HealthSpring HMO (67 members)', count: 67, unitPrice: '$380.00', total: '$25,460.00' },
      { description: 'Anthem HSA Bronze (22 members)', count: 22, unitPrice: '$240.00', total: '$5,280.00' },
    ],
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-0212',
    period: 'February 2026',
    dueDate: '2026-02-28',
    amount: '$102,440.00',
    status: 'paid',
    paidDate: '2026-02-25',
    items: [
      { description: 'BlueCare Plus PPO (138 members)', count: 138, unitPrice: '$520.00', total: '$71,760.00' },
      { description: 'HealthSpring HMO (67 members)', count: 67, unitPrice: '$380.00', total: '$25,460.00' },
      { description: 'Anthem HSA Bronze (22 members)', count: 22, unitPrice: '$240.00', total: '$5,280.00' },
    ],
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2026-0112',
    period: 'January 2026',
    dueDate: '2026-01-31',
    amount: '$99,260.00',
    status: 'paid',
    paidDate: '2026-01-29',
    items: [
      { description: 'BlueCare Plus PPO (134 members)', count: 134, unitPrice: '$520.00', total: '$69,680.00' },
      { description: 'HealthSpring HMO (64 members)', count: 64, unitPrice: '$380.00', total: '$24,320.00' },
      { description: 'Anthem HSA Bronze (22 members)', count: 22, unitPrice: '$240.00', total: '$5,280.00' },
    ],
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2025-1212',
    period: 'December 2025',
    dueDate: '2025-12-31',
    amount: '$97,020.00',
    status: 'paid',
    paidDate: '2025-12-30',
    items: [
      { description: 'BlueCare Plus PPO (130 members)', count: 130, unitPrice: '$520.00', total: '$67,600.00' },
      { description: 'HealthSpring HMO (63 members)', count: 63, unitPrice: '$380.00', total: '$23,940.00' },
      { description: 'Anthem HSA Bronze (22 members)', count: 22, unitPrice: '$240.00', total: '$5,280.00' },
    ],
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INV-2025-1112',
    period: 'November 2025',
    dueDate: '2025-11-15',
    amount: '$6,840.00',
    status: 'overdue',
    items: [
      { description: 'Late enrollment adjustment — Q4 2025', count: 18, unitPrice: '$380.00', total: '$6,840.00' },
    ],
  },
];

const statusConfig = {
  paid: { label: 'Paid', icon: CheckCircle2, class: 'bg-green-50 text-green-700 border border-green-200' },
  pending: { label: 'Pending', icon: Clock, class: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  overdue: { label: 'Overdue', icon: AlertCircle, class: 'bg-red-50 text-red-700 border border-red-200' },
};

const InvoicesPage = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['employer-invoices'],
    queryFn: async (): Promise<Invoice[]> => {
      await new Promise((r) => setTimeout(r, 500));
      return MOCK_INVOICES;
    },
  });

  const totals = {
    paid: invoices?.filter((i) => i.status === 'paid').length ?? 0,
    pending: invoices?.filter((i) => i.status === 'pending').length ?? 0,
    overdue: invoices?.filter((i) => i.status === 'overdue').length ?? 0,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totals.paid} paid · {totals.pending} pending · {totals.overdue} overdue
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          Export All
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Paid YTD</p>
          <p className="text-2xl font-bold text-green-800 mt-1">$201,700</p>
          <p className="text-xs text-green-600 mt-0.5">{totals.paid} invoices</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
          <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">$104,580</p>
          <p className="text-xs text-yellow-600 mt-0.5">Due Mar 31, 2026</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Overdue</p>
          <p className="text-2xl font-bold text-red-800 mt-1">$6,840</p>
          <p className="text-xs text-red-600 mt-0.5">Action required</p>
        </div>
      </div>

      {/* Invoice list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
            ))
          : invoices?.map((invoice) => {
              const sc = statusConfig[invoice.status];
              const StatusIcon = sc.icon;
              const isOpen = expanded === invoice.id;

              return (
                <div key={invoice.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors">
                  <button
                    onClick={() => setExpanded(isOpen ? null : invoice.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">{invoice.period}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{invoice.amount}</p>
                        <p className="text-xs text-gray-400">
                          {invoice.status === 'paid'
                            ? `Paid ${new Date(invoice.paidDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                            : `Due ${new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.class}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase tracking-wide">
                            <th className="text-left pb-2">Description</th>
                            <th className="text-right pb-2">Count</th>
                            <th className="text-right pb-2">Unit Price</th>
                            <th className="text-right pb-2">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {invoice.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2 text-gray-700">{item.description}</td>
                              <td className="py-2 text-right text-gray-600">{item.count}</td>
                              <td className="py-2 text-right text-gray-600">{item.unitPrice}</td>
                              <td className="py-2 text-right font-medium text-gray-900">{item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                        <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                          <Download className="w-3.5 h-3.5" />
                          Download PDF
                        </button>
                        {invoice.status !== 'paid' && (
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Pay Now
                          </button>
                        )}
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

export default InvoicesPage;
