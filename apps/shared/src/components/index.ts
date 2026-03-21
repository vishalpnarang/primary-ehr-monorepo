// ============================================================
// Primus EHR — Shared Component Library
// ============================================================

// Primitives
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, StatusColor } from './StatusBadge';

export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize, SpinnerColor } from './Spinner';

// Clinical Badges
export { AllergyBadge } from './AllergyBadge';
export type { AllergyBadgeProps } from './AllergyBadge';

export { RiskBadge } from './RiskBadge';
export type { RiskBadgeProps } from './RiskBadge';

// Data Display
export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize, AvatarStatus } from './Avatar';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStateAction } from './EmptyState';

export { Alert } from './Alert';
export type { AlertProps, AlertSeverity, AlertAction } from './Alert';

export { StatCard } from './StatCard';
export type { StatCardProps } from './StatCard';

export { Timeline } from './Timeline';
export type { TimelineProps, TimelineEventType } from './Timeline';

export { DataTable } from './DataTable';
export type { DataTableProps, ColumnDef } from './DataTable';

// Overlays & Dialogs
export { Modal } from './Modal';
export type { ModalProps, ModalSize } from './Modal';

export { SlideOver } from './SlideOver';
export type { SlideOverProps, SlideOverSize } from './SlideOver';

// Toast
export { ToastProvider, useToast } from './Toast';
export type { ToastItem, ToastSeverity, ToastAction } from './Toast';

// Form Controls
export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Tabs } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

// Layout & Page-level
export { PatientHeader } from './PatientHeader';
export type { PatientHeaderProps, PatientHeaderAction } from './PatientHeader';

export { PageHeader } from './PageHeader';
export type { PageHeaderProps, Breadcrumb } from './PageHeader';
