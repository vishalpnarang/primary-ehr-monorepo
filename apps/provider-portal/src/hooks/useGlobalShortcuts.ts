import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';

/**
 * Global keyboard shortcuts — Tier 1 (always active)
 * Ctrl+K → Command palette
 * Ctrl+1-7 → Sidebar navigation
 * Ctrl+N → New note (if in patient context)
 * Ctrl+P → Patient search
 */
export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      switch (e.key) {
        case 'k':
        case 'K':
          e.preventDefault();
          useUIStore.getState().commandPaletteOpen
            ? useUIStore.getState().closeCommandPalette()
            : useUIStore.getState().openCommandPalette();
          break;
        case '1':
          if (!isInput) { e.preventDefault(); navigate('/dashboard'); }
          break;
        case '2':
          if (!isInput) { e.preventDefault(); navigate('/schedule'); }
          break;
        case '3':
          if (!isInput) { e.preventDefault(); navigate('/patients'); }
          break;
        case '4':
          if (!isInput) { e.preventDefault(); navigate('/inbox'); }
          break;
        case '5':
          if (!isInput) { e.preventDefault(); navigate('/billing'); }
          break;
        case '6':
          if (!isInput) { e.preventDefault(); navigate('/reports'); }
          break;
        case '7':
          if (!isInput) { e.preventDefault(); navigate('/settings'); }
          break;
        case 'p':
        case 'P':
          if (!isInput) {
            e.preventDefault();
            navigate('/patients');
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location]);
}
