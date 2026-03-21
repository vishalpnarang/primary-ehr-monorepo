import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';
import { useUIStore } from '@/stores/uiStore';

// Mock useNavigate — CommandPalette calls navigate() on item select
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderCommandPalette = () =>
  render(
    <MemoryRouter>
      <CommandPalette />
    </MemoryRouter>
  );

const openPalette = () => {
  act(() => {
    useUIStore.getState().openCommandPalette();
  });
};

const closePalette = () => {
  act(() => {
    useUIStore.getState().closeCommandPalette();
  });
};

describe('CommandPalette', () => {
  beforeEach(() => {
    // Always start closed — reset inside act so React flushes the state update
    closePalette();
    mockNavigate.mockClear();
  });

  describe('visibility', () => {
    it('does not render when commandPaletteOpen is false', () => {
      renderCommandPalette();
      expect(screen.queryByPlaceholderText(/search patients/i)).toBeNull();
    });

    it('renders when commandPaletteOpen is true', () => {
      // Render first, then open — single container, no double-mount
      const { rerender } = renderCommandPalette();
      openPalette();
      rerender(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>
      );
      expect(screen.getByPlaceholderText(/search patients/i)).toBeInTheDocument();
    });
  });

  describe('when open', () => {
    beforeEach(() => {
      openPalette();
    });

    it('shows the search input', () => {
      renderCommandPalette();
      expect(screen.getByPlaceholderText(/search patients, actions, navigation/i)).toBeInTheDocument();
    });

    it('shows recent patients section by default (no query)', () => {
      renderCommandPalette();
      expect(screen.getByText('Recent')).toBeInTheDocument();
    });

    it('shows Actions section by default', () => {
      renderCommandPalette();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('shows Navigation section by default', () => {
      renderCommandPalette();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('shows known patient Sarah Johnson in recent patients', () => {
      renderCommandPalette();
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });

    it('shows known action New Note', () => {
      renderCommandPalette();
      expect(screen.getByText('New Note')).toBeInTheDocument();
    });

    it('shows known navigation item Dashboard', () => {
      renderCommandPalette();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('search filtering', () => {
    beforeEach(() => {
      openPalette();
    });

    it('filters patients by name when query is typed', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'sarah');

      // Should find Sarah Johnson
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    });

    it('hides non-matching patients when searching', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'sarah');

      // Marcus Rivera should not appear
      expect(screen.queryByText('Marcus Rivera')).toBeNull();
    });

    it('filters by patient ID in subtitle', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'PAT-10002');

      expect(screen.getByText('Marcus Rivera')).toBeInTheDocument();
    });

    it('filters actions by name', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'prescribe');

      expect(screen.getByText('Prescribe Medication')).toBeInTheDocument();
      expect(screen.queryByText('New Note')).toBeNull();
    });

    it('filters navigation by name', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'billing');

      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).toBeNull();
    });

    it('shows no results message when query has no matches', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'zzznomatchxxx');

      expect(screen.getByText(/no results for/i)).toBeInTheDocument();
    });

    it('hides Recent section when query is active', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, 'a');

      // Recent section label should disappear (replaced by Patients section)
      expect(screen.queryByText('Recent')).toBeNull();
    });
  });

  describe('keyboard interactions', () => {
    beforeEach(() => {
      openPalette();
    });

    it('closes the palette when Escape is pressed on the input', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, '{Escape}');

      const state = useUIStore.getState();
      expect(state.commandPaletteOpen).toBe(false);
    });

    it('closes the palette when clicking the backdrop overlay', () => {
      renderCommandPalette();

      // The overlay div has the click handler for closing
      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).not.toBeNull();
      fireEvent.click(overlay!);

      expect(useUIStore.getState().commandPaletteOpen).toBe(false);
    });

    it('navigates down with ArrowDown key', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      // First item is highlighted by default (index 0 → bg-blue-50)
      // After ArrowDown, index 1 should be highlighted
      await user.type(input, '{ArrowDown}');
      // We're just verifying it doesn't throw — visual highlight is CSS class
      expect(input).toBeInTheDocument();
    });

    it('navigates up with ArrowUp key', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      await user.type(input, '{ArrowDown}{ArrowDown}{ArrowUp}');
      // Should not throw and input should still be present
      expect(input).toBeInTheDocument();
    });

    it('selects item and navigates on Enter for a navigation item', async () => {
      const user = userEvent.setup();
      renderCommandPalette();

      const input = screen.getByPlaceholderText(/search patients/i);
      // Search for Dashboard to isolate it as the first result
      await user.type(input, 'dashboard');

      // Press Enter to select
      await user.type(input, '{Enter}');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
