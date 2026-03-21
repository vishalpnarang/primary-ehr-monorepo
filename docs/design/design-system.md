# Design System — Primus EHR

**Design philosophy:** Clinical-grade clarity. Every pixel earns its place. Clinicians work 10–12 hour shifts — the UI must reduce cognitive load, not add to it. Modern, clean, fast-feeling. Not a form-heavy legacy EHR aesthetic.

---

## Color Palette

### Brand colors

```css
/* Primary — Primus blue. Trust, clarity, healthcare. */
--primus-blue-50:  #EFF6FF;
--primus-blue-100: #DBEAFE;
--primus-blue-200: #BFDBFE;
--primus-blue-300: #93C5FD;
--primus-blue-400: #60A5FA;
--primus-blue-500: #3B82F6;   /* Primary action */
--primus-blue-600: #2563EB;   /* Hover */
--primus-blue-700: #1D4ED8;   /* Active / pressed */
--primus-blue-800: #1E40AF;
--primus-blue-900: #1E3A8A;

/* Sidebar background */
--primus-navy:     #1A1F36;   /* Dark navy sidebar */
--primus-navy-hover: #252B47;
--primus-navy-active: #2F3866;
```

### Clinical severity palette (WCAG AA compliant — never color alone)

```css
/* Critical — life-threatening alerts, critical lab values */
--critical-50:  #FEF2F2;
--critical-100: #FEE2E2;
--critical-500: #EF4444;
--critical-600: #DC2626;   /* Use for alert borders and icons */
--critical-700: #B91C1C;

/* Warning — abnormal labs, overdue care gaps, action needed */
--warning-50:  #FFFBEB;
--warning-100: #FEF3C7;
--warning-500: #F59E0B;
--warning-600: #D97706;   /* Use for warning borders and icons */
--warning-700: #B45309;

/* Success — normal values, completed actions, verified */
--success-50:  #F0FDF4;
--success-100: #DCFCE7;
--success-500: #22C55E;
--success-600: #16A34A;   /* Use for success borders and icons */

/* Info — informational, FYI notifications */
--info-50:  #EFF6FF;
--info-500: #3B82F6;
--info-600: #2563EB;

/* Neutral — secondary text, inactive, historical */
--neutral-50:  #F9FAFB;
--neutral-100: #F3F4F6;
--neutral-200: #E5E7EB;
--neutral-300: #D1D5DB;
--neutral-400: #9CA3AF;
--neutral-500: #6B7280;
--neutral-600: #4B5563;
--neutral-700: #374151;
--neutral-800: #1F2937;
--neutral-900: #111827;
```

### Semantic color mapping

| Use case | Light mode | Dark mode |
|----------|------------|-----------|
| Page background | `neutral-50` (#F9FAFB) | `#0D1117` |
| Card / panel background | `white` | `#161B22` |
| Sidebar | `primus-navy` | `primus-navy` (unchanged) |
| Primary text | `neutral-900` | `#E6EDF3` |
| Secondary text | `neutral-600` | `neutral-400` |
| Border | `neutral-200` | `#30363D` |
| Input background | `white` | `#0D1117` |
| Active nav item | `primus-blue-600` | `primus-blue-500` |
| Hover state | `neutral-100` | `#21262D` |

### Appointment type colors (schedule calendar)

| Type | Color | Hex |
|------|-------|-----|
| New Patient | Blue | `#3B82F6` |
| Follow-up | Green | `#22C55E` |
| Annual Wellness | Teal | `#14B8A6` |
| Telehealth | Purple | `#8B5CF6` |
| Urgent / Same-day | Orange | `#F97316` |
| Blocked / Admin | Gray | `#9CA3AF` |

### Appointment status colors

| Status | Color | Hex |
|--------|-------|-----|
| Scheduled | Blue outline | `#DBEAFE` bg / `#2563EB` border |
| Confirmed | Blue solid | `#3B82F6` |
| Arrived | Yellow | `#FEF3C7` bg / `#D97706` border |
| In Room | Green | `#DCFCE7` bg / `#16A34A` border |
| In Progress | Green solid | `#22C55E` |
| Seen / Complete | Gray | `#F3F4F6` bg / `#6B7280` border |
| No Show | Red | `#FEE2E2` bg / `#DC2626` border |
| Cancelled | Dark gray | `#E5E7EB` bg / strikethrough text |

---

## Typography

### Font families

```css
/* Primary UI font — clean, high legibility at small sizes */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Monospace — MRNs, DOBs, lab values, dosages, CPT/ICD-10 codes */
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

**Why JetBrains Mono for clinical values:** Prevents digit misread errors (0 vs O, 1 vs l). Lab values, medication dosages, and patient IDs must use monospace to meet clinical documentation standards.

### Type scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 11px | 1.5 | 400 | Timestamps, metadata, badges |
| `text-sm` | 13px | 1.5 | 400 | Secondary content, table rows, form help text |
| `text-base` | 14px | 1.5 | 400 | **Default body text — all clinical data** |
| `text-md` | 15px | 1.5 | 500 | Emphasized body, selected states |
| `text-lg` | 17px | 1.4 | 600 | Section headers, card titles |
| `text-xl` | 20px | 1.3 | 700 | Page headers |
| `text-2xl` | 24px | 1.2 | 700 | Dashboard metric numbers |
| `text-3xl` | 30px | 1.2 | 800 | Hero numbers (KPI cards) |

**Note:** 14px is the minimum for clinical data display. Never use 12px or smaller for any patient health data.

### Font weight usage

| Weight | Token | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text, secondary content |
| 500 | `font-medium` | Navigation labels, form labels |
| 600 | `font-semibold` | Card headers, selected states, emphasis |
| 700 | `font-bold` | Page titles, critical alerts, KPI values |

---

## Spacing System

Primus uses an **8px base grid** (Tailwind's default 4px incremented to be consistent at 8px multiples for major spacing).

| Token | Size | Usage |
|-------|------|-------|
| `spacing-1` | 4px | Tight gaps between related elements |
| `spacing-2` | 8px | Internal component padding, icon gaps |
| `spacing-3` | 12px | Small component padding |
| `spacing-4` | 16px | Standard component padding, list item padding |
| `spacing-5` | 20px | Medium spacing |
| `spacing-6` | 24px | Card padding, section gaps |
| `spacing-8` | 32px | Section spacing, large gaps |
| `spacing-10` | 40px | Between major sections |
| `spacing-12` | 48px | Page-level spacing |
| `spacing-16` | 64px | Header height, major layout spacing |

---

## Layout and Breakpoints

### Breakpoints

| Name | Min Width | Target device |
|------|-----------|---------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Small desktop |
| `xl` | 1280px | Standard desktop (primary target) |
| `2xl` | 1536px | Large desktop / dual monitor |

### Provider portal layout

```
Provider portal is desktop-first. Minimum supported resolution: 1280×720.
Target: 1440×900 or larger.

┌──────────────────────────────────────────────────────┐
│ [64px sidebar] + [flex-grow content area]            │
│ Sidebar expands to 240px on hover/pin                │
│ Content area: max-width none — uses all available    │
└──────────────────────────────────────────────────────┘
```

### Patient portal layout

```
Patient portal is mobile-first. Must work at 375px (iPhone SE).

sm: Single column, bottom nav
md+: Two column layout available, side nav
```

### Patient chart two-panel layout

```
xl (1280px+): Left nav 320px fixed + content flex-grow
lg (1024px):  Left nav 240px fixed + content flex-grow
md (768px):   Left nav collapses to icon-only bar
sm (640px):   Left nav hidden — hamburger menu
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Small elements (badges, tags) |
| `rounded` | 6px | Buttons, inputs, small cards |
| `rounded-md` | 8px | Cards, panels, modals |
| `rounded-lg` | 12px | Larger cards, drawers |
| `rounded-xl` | 16px | Full-page modals, feature cards |
| `rounded-full` | 9999px | Avatars, circular badges |

---

## Shadow System

```css
/* Elevation 1 — subtle card separation */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* Elevation 2 — cards, panels */
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Elevation 3 — dropdowns, tooltips */
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Elevation 4 — modals, drawers */
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Elevation 5 — command palette, popovers */
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

---

## Iconography

**Icon library:** `lucide-react` — consistent, clean, healthcare-appropriate  
**Icon sizes:**

| Size | Pixels | Usage |
|------|--------|-------|
| `xs` | 12px | Inline text indicators |
| `sm` | 14px | Button icons, list item icons |
| `md` | 16px | Navigation icons, card icons (default) |
| `lg` | 20px | Header icons, prominent actions |
| `xl` | 24px | Large action buttons |
| `2xl` | 32px | Empty state illustrations |

**Always pair icons with labels** for accessibility — never icon-only for primary actions.

---

## Clinical Data Display Rules

### Lab values
```
Normal:    Black text, neutral background
Low:       Warning amber (#D97706) + ↓ icon
High:      Warning amber (#D97706) + ↑ icon
Critical:  Critical red (#DC2626) + ▲ icon + bold weight
Pending:   Gray text, italic
```

### Vital sign trending
```
Improving: Success green + ↓ arrow (for BP, weight goals)
Worsening: Warning amber + ↑ arrow
Stable:    Neutral gray + → arrow
No data:   Em dash (—) in neutral-400
```

### Alert severity icons (never color alone)
```
● Critical (filled red circle)
▲ Warning (filled amber triangle)
■ Info (filled blue square)
○ Normal / resolved (outlined circle in neutral)
```

---

## Accessibility Standards (WCAG 2.1 AA)

**Required for patient portal (legal — HHS 2024 rule, deadline May 11, 2026)**  
**Recommended for provider portal**

### Color contrast minimums
- Normal text (< 18px): **4.5:1** contrast ratio
- Large text (≥ 18px or ≥ 14px bold): **3:1** contrast ratio
- UI components and graphical objects: **3:1** contrast ratio

### All interactive elements must:
- Be focusable via keyboard (Tab key)
- Have visible focus indicator (2px outline, `primus-blue-500`)
- Have ARIA label or visible text label
- Support Escape to close/cancel
- Support Enter or Space to activate

### Screen reader requirements
- All images: `alt` attribute (descriptive or empty if decorative)
- All form inputs: `<label>` associated via `htmlFor` or `aria-label`
- All icons: `aria-hidden="true"` with sibling text label
- Dynamic content: `aria-live` regions for notifications and status updates
- Modals: focus trapped inside, `aria-modal`, return focus on close
- Tables: proper `<th scope>`, `<caption>` for data tables

### No strobing content
- No animations > 3 flashes per second
- All animations must respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Animation and Motion

**Principle:** Purposeful motion only. Animation communicates state change, not decoration.

| Motion | Duration | Easing | Usage |
|--------|----------|--------|-------|
| Fade in/out | 150ms | `ease-in-out` | Tooltips, popovers |
| Slide in from right | 250ms | `ease-out` | Side panels, drawers |
| Slide down | 200ms | `ease-out` | Dropdowns, accordions |
| Scale in | 150ms | `ease-out` | Modal open |
| Skeleton pulse | 1.5s | `ease-in-out` | Loading states |

---

## Dark Mode

Dark mode is **user-preference only** — never forced. Toggle in user profile settings.

```css
/* Use CSS custom properties + Tailwind dark variant */
.dark {
  --bg-page:     #0D1117;
  --bg-card:     #161B22;
  --bg-input:    #0D1117;
  --text-primary:   #E6EDF3;
  --text-secondary: #8B949E;
  --border:      #30363D;
}
```

Additional shift-length features (user-configurable in settings):
- **Font size adjustment:** `Ctrl+=` to increase, `Ctrl+-` to decrease (12–20px range)
- **Reduced motion mode:** System setting respected
- **High contrast mode:** System setting respected

---

## Component States

Every interactive component must implement all states:

| State | Description |
|-------|-------------|
| Default | Normal resting state |
| Hover | Mouse over — subtle background change |
| Focus | Keyboard focus — visible 2px outline |
| Active / Pressed | Mouse down — slightly darker |
| Disabled | 40% opacity, `not-allowed` cursor, not focusable |
| Loading | Spinner or skeleton, disabled pointer events |
| Error | Red border, error message below, error icon |
| Success | Green border or checkmark confirmation |

---

## Z-Index Scale

```css
--z-base:       0;       /* Normal flow */
--z-raised:     10;      /* Cards, raised content */
--z-sticky:     100;     /* Sticky headers */
--z-sidebar:    200;     /* Sidebar navigation */
--z-dropdown:   300;     /* Dropdown menus */
--z-drawer:     400;     /* Side drawers (Rx, orders) */
--z-overlay:    500;     /* Modal backdrop */
--z-modal:      600;     /* Modal content */
--z-toast:      700;     /* Toast notifications */
--z-command:    800;     /* Command palette */
--z-critical:   900;     /* Critical alerts (cannot be covered) */
```
