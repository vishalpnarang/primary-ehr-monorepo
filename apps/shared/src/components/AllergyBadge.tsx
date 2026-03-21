import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Allergy } from '../../types';

export interface AllergyBadgeProps {
  allergy: Allergy;
  className?: string;
}

const severityLabel: Record<Allergy['severity'], string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  unknown: 'Unknown',
};

const severityColor: Record<Allergy['severity'], string> = {
  mild: 'text-yellow-700',
  moderate: 'text-orange-700',
  severe: 'text-red-700',
  unknown: 'text-gray-600',
};

export const AllergyBadge: React.FC<AllergyBadgeProps> = ({ allergy, className }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={`Allergy: ${allergy.substance}, severity: ${severityLabel[allergy.severity]}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800',
          'hover:bg-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
          'transition-colors cursor-pointer',
          className
        )}
      >
        <AlertTriangle size={10} className="shrink-0" aria-hidden="true" />
        {allergy.substance}
      </button>

      {expanded && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 bottom-full left-0 mb-1 w-52 rounded-md border border-red-200',
            'bg-white shadow-lg p-3 text-xs'
          )}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className="font-semibold text-gray-900">{allergy.substance}</span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={12} />
            </button>
          </div>
          <div className="space-y-0.5 text-gray-600">
            <div>
              <span className="font-medium">Severity: </span>
              <span className={severityColor[allergy.severity]}>
                {severityLabel[allergy.severity]}
              </span>
            </div>
            {allergy.reaction && (
              <div>
                <span className="font-medium">Reaction: </span>
                {allergy.reaction}
              </div>
            )}
            <div>
              <span className="font-medium">Type: </span>
              {allergy.type}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllergyBadge;
