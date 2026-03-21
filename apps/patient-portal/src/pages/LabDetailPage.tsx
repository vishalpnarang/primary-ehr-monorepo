import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FlaskConical, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { cn } from '@primus/ui/lib';

const MOCK_RESULTS = [
  { component: 'HbA1c', value: '7.4', unit: '%', range: '< 7.0', flag: 'high' as const },
  { component: 'Glucose, Fasting', value: '112', unit: 'mg/dL', range: '70 - 100', flag: 'high' as const },
  { component: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.6 - 1.2', flag: 'normal' as const },
  { component: 'BUN', value: '14', unit: 'mg/dL', range: '7 - 20', flag: 'normal' as const },
  { component: 'eGFR', value: '78', unit: 'mL/min', range: '> 60', flag: 'normal' as const },
  { component: 'Potassium', value: '4.2', unit: 'mEq/L', range: '3.5 - 5.0', flag: 'normal' as const },
  { component: 'Sodium', value: '140', unit: 'mEq/L', range: '136 - 145', flag: 'normal' as const },
  { component: 'Calcium', value: '9.4', unit: 'mg/dL', range: '8.5 - 10.5', flag: 'normal' as const },
];

const FLAG_STYLES = {
  normal: 'bg-teal-50 text-teal-700',
  high: 'bg-amber-50 text-amber-700',
  low: 'bg-blue-50 text-blue-700',
  critical: 'bg-red-50 text-red-700',
};

const LabDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/records/labs')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Lab Results
      </button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                <h1 className="text-base font-bold text-gray-900">Comprehensive Metabolic Panel + HbA1c</h1>
              </div>
              <p className="text-sm text-gray-500">March 15, 2026 · Ordered by Dr. Emily Chen</p>
              <p className="text-xs text-gray-400 mt-0.5">Lab: Quest Diagnostics · ID: LAB-{id ?? '20260315'}</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        </div>

        {/* Results table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Component</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Result</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Reference Range</th>
                <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_RESULTS.map((r) => (
                <tr key={r.component} className={cn(r.flag !== 'normal' ? 'bg-amber-50/30' : '')}>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{r.component}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn('text-sm font-bold font-mono', r.flag === 'high' ? 'text-amber-700' : r.flag === 'low' ? 'text-blue-700' : 'text-gray-900')}>
                      {r.value}
                      {r.flag === 'high' ? <TrendingUp className="w-3 h-3 inline ml-1" /> : null}
                      {r.flag === 'low' ? <TrendingDown className="w-3 h-3 inline ml-1" /> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{r.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 font-mono">{r.range}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('text-xs px-2 py-0.5 rounded font-medium capitalize', FLAG_STYLES[r.flag])}>
                      {r.flag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Provider note */}
        <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/30">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-1">Provider Note — Dr. Emily Chen</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your HbA1c has improved from 7.8% to 7.4% — that's progress. We're getting closer to our target of under 7.0%.
                Your kidney function (eGFR and creatinine) and electrolytes all look good. Let's continue the current medication regimen
                and recheck in 3 months. Keep up the diet and exercise changes — they're working.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabDetailPage;
