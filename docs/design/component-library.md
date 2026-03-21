# Component Library — Primus EHR

All shared components live in `apps/shared/src/components/`. Every component exports from `@primus/ui`.

**Component guidelines:**
- Built on **shadcn/ui** primitives (Radix UI under the hood)
- Styled with **Tailwind CSS** utility classes
- All components must implement all states (default, hover, focus, disabled, loading, error)
- All interactive components must be keyboard accessible
- TypeScript interfaces exported alongside component

---

## Layout Components

### AppShell

Root layout wrapper for the provider portal. Manages sidebar + content area layout.

```typescript
interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}
```

**Behavior:**
- Sidebar collapses to 64px icon-only on small screens
- Content area scrolls independently of sidebar
- Sidebar state (collapsed/expanded) persisted in localStorage

---

### Sidebar

Left navigation sidebar for the provider portal.

```typescript
interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

interface SidebarItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;              // Notification count
  shortcut?: string;           // e.g., "Ctrl+1"
  roles?: UserRole[];          // Only show for these roles
  children?: SidebarItem[];   // Sub-items
}
```

**Behavior:**
- Active item highlighted with 3px left border accent in `primus-blue-600`
- Badge shows unread count (capped at 99+)
- Keyboard: `Ctrl+1` through `Ctrl+7` navigate to sections

---

### PageHeader

Consistent page header with title, breadcrumbs, and actions.

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  backHref?: string;
}
```

---

### SplitPanel

Two-column layout for patient chart (left nav + content).

```typescript
interface SplitPanelProps {
  left: React.ReactNode;       // 320px fixed width
  right: React.ReactNode;      // flex-grow
  leftWidth?: number;          // Default 320
}
```

---

### SlideOver

Right-side drawer for Rx, orders, messages — never navigates away from current screen.

```typescript
interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';  // 400 / 560 / 720px
  footer?: React.ReactNode;
}
```

**Behavior:**
- Slides in from right with 250ms ease-out animation
- Escape key closes
- Backdrop click closes (configurable)
- Focus trapped inside when open
- Content area scrolls independently

---

## Navigation Components

### CommandPalette

Global search overlay triggered by `Ctrl+K`. The most important single component in the provider portal.

```typescript
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}
```

**Sections:**
1. **Recent** — last 5 opened patients
2. **Patients** — search results from patient search
3. **Actions** — context-aware actions (New Note, Prescribe, Order, Schedule)
4. **Navigation** — all sidebar routes with their shortcuts

**Keyboard behavior:**
- `↑ ↓` — navigate results
- `Enter` — select highlighted result
- `Escape` — close
- Text input shows fuzzy-matched results with character highlighting

---

### TabNav

Horizontal tab navigation for patient chart sections (when used as tab bar instead of side nav).

```typescript
interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabKey: string) => void;
}

interface Tab {
  key: string;
  label: string;
  shortcut?: string;
  badge?: number;
}
```

---

## Data Display Components

### DataTable

Sortable, filterable table for lists (patients, claims, lab results, etc.).

```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  empty?: EmptyStateProps;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pagination?: PaginationProps;
  sortable?: boolean;
  defaultSort?: SortConfig;
}

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number | string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}
```

**Features:**
- Column sorting (click header)
- Row click handler
- Checkbox selection with bulk actions
- Loading skeleton (shows 5 skeleton rows)
- Empty state slot
- Sticky header when table scrolls

---

### StatCard

KPI metric card for dashboards.

```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    good?: 'up' | 'down';   // Which direction is positive
  };
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'neutral';
  loading?: boolean;
}
```

---

### Timeline

Clinical event timeline (patient chart).

```typescript
interface TimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  filters?: TimelineFilter[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

interface TimelineEvent {
  id: string;
  type: 'encounter' | 'lab' | 'order' | 'referral' | 'message' | 'medication';
  date: string;
  title: string;
  subtitle?: string;
  badge?: string;
  status?: 'normal' | 'abnormal' | 'critical' | 'pending';
  onClick?: () => void;
}
```

---

### Sparkline

Mini trend chart for vitals and lab values.

```typescript
interface SparklineProps {
  data: { date: string; value: number }[];
  color?: string;
  width?: number;
  height?: number;
  showLastValue?: boolean;
  trend?: 'up' | 'down' | 'stable';
}
```

---

### VitalSigns

Displays current vitals with trend indicators.

```typescript
interface VitalSignsProps {
  vitals: VitalSigns;
  showTrend?: boolean;
  compact?: boolean;
}

interface VitalSigns {
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  o2Saturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  painScale?: number;
  respiratoryRate?: number;
  recordedAt: string;
  recordedBy?: string;
}
```

---

### LabResult

Single lab result display with reference range and abnormal flagging.

```typescript
interface LabResultProps {
  result: LabResultItem;
  showTrend?: boolean;
  previousValue?: number;
  compact?: boolean;
}

interface LabResultItem {
  testName: string;
  value: number | string;
  unit: string;
  referenceRange?: string;
  status: 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high' | 'pending';
  loincCode?: string;
  resultDate: string;
}
```

**Display rules:**
- Normal: black text on white
- Low: amber + ↓ icon
- High: amber + ↑ icon
- Critical: red + ▲ icon + bold + pulse animation for 3s

---

### PatientHeader

The sticky patient header — the most frequently viewed component in the provider portal.

```typescript
interface PatientHeaderProps {
  patient: PatientSummary;
  onNewNote?: () => void;
  onPrescribe?: () => void;
  onOrder?: () => void;
  onMessage?: () => void;
  onSchedule?: () => void;
  className?: string;
}

interface PatientSummary {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  sex: string;
  photo?: string;
  allergies: Allergy[];
  insurance: InsuranceSummary;
  riskFlags: RiskFlag[];
  preferredName?: string;
}

interface RiskFlag {
  type: 'high-risk' | 'care-gap' | 'outstanding-balance' | 'dnr' | 'fall-risk';
  label: string;
  severity: 'critical' | 'warning' | 'info';
}
```

**Layout:**
```
[Photo 48px] [Name + DOB + Age + MRN]  |  [Allergies pills]  |  [Insurance]  |  [Risk badges]  |  [Actions]
```

---

## Form Components

### Input

Text input with label, helper text, error state.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  monospace?: boolean;          // For MRN, DOB, lab values
}
```

---

### Select

Searchable dropdown select.

```typescript
interface SelectProps {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  searchable?: boolean;
  placeholder?: string;
  error?: string;
  required?: boolean;
  loading?: boolean;
}

interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
  group?: string;
}
```

---

### DatePicker

Calendar date picker with keyboard navigation.

```typescript
interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  error?: string;
  required?: boolean;
  format?: string;               // Default 'MM/DD/YYYY'
}
```

---

### SmartPhraseInput

Rich text input with `.xxx` smart phrase expansion for note documentation.

```typescript
interface SmartPhraseInputProps {
  value: string;
  onChange: (value: string) => void;
  phrases?: SmartPhrase[];         // Org + provider specific phrases
  label?: string;
  placeholder?: string;
  minHeight?: number;
  onPhraseLookup?: (prefix: string) => Promise<SmartPhrase[]>;
}

interface SmartPhrase {
  trigger: string;    // e.g., 'hpi'
  expansion: string;  // e.g., 'Patient presents with...'
  category?: string;
}
```

**Behavior:**
- User types `.hpi` → suggestion popover appears → Tab or Enter expands
- Cursor placed at first editable field in expanded template
- `Ctrl+Z` collapses expansion back to trigger

---

### RosChecklist

Review of Systems structured entry.

```typescript
interface RosChecklistProps {
  value: RosData;
  onChange: (value: RosData) => void;
  systems?: string[];              // Which systems to show
}

interface RosData {
  [system: string]: {
    reviewed: boolean;
    positive: string[];
    negative: string[];
    notes?: string;
  };
}
```

---

### VitalsForm

Rooming workflow vitals entry form.

```typescript
interface VitalsFormProps {
  patientId: string;
  onSave: (vitals: VitalSigns) => void;
  previousVitals?: VitalSigns;
  compact?: boolean;
}
```

**Behavior:**
- BMI auto-calculates from height + weight
- Out-of-range values flag automatically (e.g., O2 < 90% → warning)
- Tab through fields in clinical order (BP → HR → Temp → O2 → Weight → Height)

---

## Feedback Components

### Alert (Banner)

Inline alert for page-level notifications.

```typescript
interface AlertProps {
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: AlertAction[];
  dismissible?: boolean;
  onDismiss?: () => void;
}
```

---

### Toast

Bottom-right temporary notification.

```typescript
interface ToastProps {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;             // Default 4000ms
  action?: { label: string; onClick: () => void };
  persistent?: boolean;          // Don't auto-dismiss
}
```

**Rules:**
- Max 3 stacked at once — older ones push up and fade
- `Escape` closes focused toast
- Hover pauses auto-dismiss timer

---

### Modal

Accessible modal dialog.

```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;   // Default true
  preventClose?: boolean;          // For critical alerts
}
```

**WCAG requirements:**
- Focus trapped inside modal
- `aria-modal="true"` on dialog element
- `aria-labelledby` pointing to title
- Returns focus to trigger element on close

---

### CriticalAlert

Tier-1 interruptive alert for life-threatening events (critical lab values). Cannot be dismissed with Escape alone — requires explicit acknowledgment.

```typescript
interface CriticalAlertProps {
  title: string;
  description: string;
  patientName: string;
  value?: string;
  unit?: string;
  acknowledgeLabel?: string;      // "I Acknowledge — Patient Notified"
  onAcknowledge: () => void;      // Called with timestamp + user
}
```

---

### Skeleton

Loading placeholder that matches the shape of the content it's replacing.

```typescript
interface SkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'avatar' | 'custom';
  rows?: number;                   // For text/table variants
  className?: string;
  children?: React.ReactNode;      // For custom skeletons
}
```

---

### EmptyState

Purposeful empty state for lists and views.

```typescript
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## Clinical Badge Components

### AllergyBadge

```typescript
interface AllergyBadgeProps {
  allergy: Allergy;
  onClick?: () => void;
}

interface Allergy {
  substance: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe' | 'unknown';
}
```

**Display:** Red pill badge; clicking expands full allergy details

---

### RiskBadge

```typescript
interface RiskBadgeProps {
  type: 'high-risk' | 'care-gap' | 'outstanding-balance' | 'dnr' | 'fall-risk';
  label?: string;
}
```

---

### StatusBadge

General purpose status indicator.

```typescript
interface StatusBadgeProps {
  status: string;
  color?: 'red' | 'yellow' | 'green' | 'blue' | 'gray' | 'purple' | 'orange';
  dot?: boolean;
}
```

---

## Keyboard Shortcuts Reference

Implemented via a global `useKeyboardShortcuts` hook.

```typescript
// Tier 1 — Always active
Ctrl+K          → Open command palette
Ctrl+N          → New note (current patient context)
Ctrl+P          → Patient search focus
Ctrl+Enter      → Sign/submit current form
Ctrl+/          → Show shortcut reference overlay
Ctrl+.          → Open notification center
Ctrl+1..7       → Navigate sidebar sections
Ctrl+Tab        → Cycle open patient tabs
Ctrl+W          → Close current patient tab
Ctrl+=          → Increase font size
Ctrl+-          → Decrease font size

// Tier 2 — Chart context (not in text input)
S               → Summary tab
E               → Encounters tab
M               → Medications tab
P               → Problems tab
O               → Orders tab
V               → Vitals tab
L               → Labs tab
I               → Immunizations tab
R               → Referrals tab
B               → Billing tab
N               → New note
Shift+R         → New prescription (R is Referrals in tier 2)
G               → Send message

// Tier 3 — Form context
Tab             → Next field
Shift+Tab       → Previous field
.               → Smart phrase trigger (in note inputs)
Alt+1..9        → Select from numbered dropdown list
↑ ↓             → Navigate dropdown/autocomplete options
Escape          → Cancel/close current panel
```
