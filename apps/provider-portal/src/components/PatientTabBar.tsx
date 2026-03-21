import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@primus/ui/lib';
import { usePatientStore } from '@/stores/patientStore';

export const PatientTabBar = () => {
  const { openTabs, activeTabIndex, setActiveTab, closePatientTab } = usePatientStore();
  const navigate = useNavigate();

  if (openTabs.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200 flex items-center gap-0 px-2 overflow-x-auto scrollbar-thin">
      {openTabs.map((tab, index) => {
        const isActive = index === activeTabIndex;
        const initials = `${tab.patient.firstName[0]}${tab.patient.lastName[0]}`;
        return (
          <div
            key={tab.patient.id}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 cursor-pointer border-b-2 transition-colors text-xs font-medium whitespace-nowrap group',
              isActive
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
            )}
            onClick={() => {
              setActiveTab(index);
              navigate(`/patients/${tab.patient.id}`);
            }}
          >
            <span className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0',
              isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            )}>
              {initials}
            </span>
            <span className="max-w-[100px] truncate">
              {tab.patient.lastName}, {tab.patient.firstName[0]}.
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closePatientTab(tab.patient.id);
              }}
              className="p-0.5 rounded hover:bg-slate-200 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Close tab"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
      <div className="flex-1" />
      <span className="text-[9px] text-gray-400 px-2 flex-shrink-0">
        {openTabs.length}/5 charts · Ctrl+Tab to cycle
      </span>
    </div>
  );
};
