import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarPinned: boolean;
  commandPaletteOpen: boolean;
  theme: 'light' | 'dark';
  fontSize: number;
  toggleSidebar: () => void;
  pinSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarPinned: true,
      commandPaletteOpen: false,
      theme: 'light',
      fontSize: 14,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      pinSidebar: () => set((s) => ({ sidebarPinned: !s.sidebarPinned })),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'primus-ui-prefs',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarPinned: state.sidebarPinned,
        theme: state.theme,
        fontSize: state.fontSize,
      }),
    }
  )
);
