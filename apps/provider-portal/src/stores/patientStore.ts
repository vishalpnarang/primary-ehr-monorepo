import { create } from 'zustand';
import type { PatientSummary } from '@primus/ui/types';

interface PatientTab {
  patient: PatientSummary;
  activeSection: string;
}

interface PatientState {
  openTabs: PatientTab[];
  activeTabIndex: number;
  activePatient: PatientSummary | null;
  openPatientChart: (patient: PatientSummary) => void;
  closePatientTab: (patientId: string) => void;
  setActiveTab: (index: number) => void;
  setActiveSection: (section: string) => void;
  cycleTab: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  openTabs: [],
  activeTabIndex: -1,
  activePatient: null,

  openPatientChart: (patient) => {
    const { openTabs } = get();
    const existingIndex = openTabs.findIndex((t) => t.patient.id === patient.id);
    if (existingIndex >= 0) {
      set({ activeTabIndex: existingIndex, activePatient: patient });
      return;
    }
    if (openTabs.length >= 5) {
      const newTabs = [...openTabs.slice(1), { patient, activeSection: 'summary' }];
      set({ openTabs: newTabs, activeTabIndex: newTabs.length - 1, activePatient: patient });
    } else {
      const newTabs = [...openTabs, { patient, activeSection: 'summary' }];
      set({ openTabs: newTabs, activeTabIndex: newTabs.length - 1, activePatient: patient });
    }
  },

  closePatientTab: (patientId) => {
    const { openTabs, activeTabIndex } = get();
    const newTabs = openTabs.filter((t) => t.patient.id !== patientId);
    const newIndex = Math.min(activeTabIndex, newTabs.length - 1);
    set({
      openTabs: newTabs,
      activeTabIndex: newIndex,
      activePatient: newIndex >= 0 ? newTabs[newIndex].patient : null,
    });
  },

  setActiveTab: (index) => {
    const { openTabs } = get();
    if (index >= 0 && index < openTabs.length) {
      set({ activeTabIndex: index, activePatient: openTabs[index].patient });
    }
  },

  setActiveSection: (section) => {
    const { openTabs, activeTabIndex } = get();
    if (activeTabIndex >= 0) {
      const newTabs = [...openTabs];
      newTabs[activeTabIndex] = { ...newTabs[activeTabIndex], activeSection: section };
      set({ openTabs: newTabs });
    }
  },

  cycleTab: () => {
    const { openTabs, activeTabIndex } = get();
    if (openTabs.length <= 1) return;
    const nextIndex = (activeTabIndex + 1) % openTabs.length;
    set({ activeTabIndex: nextIndex, activePatient: openTabs[nextIndex].patient });
  },
}));
