// ============================================================
// Primus EHR — Shared Type Definitions
// ============================================================

// --- Roles & Auth ---
export type UserRole =
  | 'super_admin'
  | 'tenant_admin'
  | 'practice_admin'
  | 'provider'
  | 'nurse'
  | 'front_desk'
  | 'billing'
  | 'patient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  providerId?: string;
  title?: string;
  specialty?: string;
  npi?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  npi: string;
  taxId: string;
  address: Address;
  phone: string;
  logo?: string;
  status: 'active' | 'inactive' | 'provisioning';
  locations: Location[];
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: Address;
  phone: string;
  fax?: string;
  rooms: Room[];
  hours: OperatingHours;
}

export interface Room {
  id: string;
  name: string;
  locationId: string;
  status: 'available' | 'occupied' | 'cleaning' | 'blocked';
  currentPatientId?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface OperatingHours {
  [day: string]: { open: string; close: string } | null;
}

// --- Patient ---
export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dob: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  gender?: string;
  pronouns?: string;
  phone: string;
  email?: string;
  address: Address;
  photo?: string;
  emergencyContact: EmergencyContact;
  insurance: Insurance;
  secondaryInsurance?: Insurance;
  allergies: Allergy[];
  riskFlags: RiskFlag[];
  primaryProviderId?: string;
  status: 'active' | 'inactive' | 'deceased';
  createdAt: string;
  lastVisitDate?: string;
}

export interface PatientSummary {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dob: string;
  age: number;
  sex: string;
  photo?: string;
  allergies: Allergy[];
  insurance: InsuranceSummary;
  riskFlags: RiskFlag[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Insurance {
  payerName: string;
  payerId: string;
  memberId: string;
  groupNumber: string;
  planType: string;
  copay?: number;
  cardFrontUrl?: string;
  cardBackUrl?: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface InsuranceSummary {
  payerName: string;
  memberId: string;
  verified: boolean;
}

export interface Allergy {
  id: string;
  substance: string;
  reaction?: string;
  severity: 'mild' | 'moderate' | 'severe' | 'unknown';
  type: 'drug' | 'food' | 'environmental';
  onsetDate?: string;
}

export interface RiskFlag {
  type: 'high-risk' | 'care-gap' | 'outstanding-balance' | 'dnr' | 'fall-risk';
  label: string;
  severity: 'critical' | 'warning' | 'info';
}

// --- Appointments ---
export type AppointmentType =
  | 'new_patient'
  | 'follow_up'
  | 'annual_wellness'
  | 'telehealth'
  | 'urgent'
  | 'procedure'
  | 'blocked';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'arrived'
  | 'in_room'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  providerId: string;
  providerName: string;
  locationId: string;
  roomId?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  reason?: string;
  notes?: string;
  intakeCompleted: boolean;
  insuranceVerified: boolean;
  balance?: number;
  telehealth: boolean;
}

// --- Encounters ---
export interface Encounter {
  id: string;
  patientId: string;
  providerId: string;
  providerName: string;
  appointmentId?: string;
  date: string;
  type: 'office_visit' | 'telehealth' | 'phone' | 'procedure';
  status: 'draft' | 'in_progress' | 'signed' | 'addendum';
  chiefComplaint: string;
  hpiText: string;
  ros: RosData;
  examination: string;
  assessmentPlan: AssessmentPlanItem[];
  emCode?: string;
  emLevel?: string;
  signedAt?: string;
  signedBy?: string;
  lastAutoSaved?: string;
}

export interface AssessmentPlanItem {
  id: string;
  diagnosis: string;
  icdCode: string;
  plan: string;
  orders: string[];
  medications: string[];
  referrals: string[];
}

export interface RosData {
  [system: string]: {
    reviewed: boolean;
    positive: string[];
    negative: string[];
    notes?: string;
  };
}

// --- Vitals ---
export interface VitalSigns {
  id?: string;
  patientId?: string;
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

// --- Problems ---
export interface Problem {
  id: string;
  patientId: string;
  description: string;
  icdCode: string;
  status: 'active' | 'resolved' | 'inactive';
  onsetDate: string;
  resolvedDate?: string;
  addedBy: string;
  addedAt: string;
}

// --- Medications ---
export interface Medication {
  id: string;
  patientId: string;
  drugName: string;
  genericName?: string;
  strength: string;
  dosageForm: string;
  directions: string;
  quantity: number;
  refills: number;
  prescribedBy: string;
  prescribedAt: string;
  pharmacy?: string;
  status: 'active' | 'discontinued' | 'completed';
  startDate: string;
  endDate?: string;
  isControlled: boolean;
  schedule?: string;
}

// --- Labs ---
export interface LabOrder {
  id: string;
  patientId: string;
  providerId: string;
  tests: LabTest[];
  facility: string;
  priority: 'routine' | 'stat';
  status: 'pending' | 'collected' | 'in_progress' | 'resulted' | 'reviewed';
  orderedAt: string;
  resultedAt?: string;
  indication?: string;
}

export interface LabTest {
  name: string;
  loincCode?: string;
  status: 'pending' | 'resulted';
}

export interface LabResult {
  id: string;
  patientId: string;
  orderId: string;
  testName: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical-low' | 'critical-high' | 'pending';
  loincCode?: string;
  resultDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// --- Immunizations ---
export interface Immunization {
  id: string;
  patientId: string;
  vaccineName: string;
  cvxCode: string;
  doseNumber?: number;
  doseInSeries?: number;
  administeredDate: string;
  administeredBy?: string;
  site?: string;
  lotNumber?: string;
  manufacturer?: string;
  expirationDate?: string;
}

// --- Referrals ---
export interface Referral {
  id: string;
  patientId: string;
  referringProviderId: string;
  specialty: string;
  referredTo?: string;
  urgency: 'routine' | 'urgent' | 'emergent';
  reason: string;
  clinicalNotes?: string;
  status: 'draft' | 'sent' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  scheduledDate?: string;
}

// --- Billing ---
export interface Claim {
  id: string;
  patientId: string;
  patientName: string;
  encounterId: string;
  providerId: string;
  providerName: string;
  dateOfService: string;
  cptCodes: CptCode[];
  icdCodes: string[];
  payerName: string;
  payerId: string;
  totalCharge: number;
  allowedAmount?: number;
  paidAmount?: number;
  patientResponsibility?: number;
  status: 'ready' | 'submitted' | 'accepted' | 'paid' | 'denied' | 'appealed';
  submittedAt?: string;
  paidAt?: string;
  denialReason?: string;
  denialCode?: string;
}

export interface CptCode {
  code: string;
  description: string;
  modifier?: string;
  units: number;
  charge: number;
}

export interface BillingKpi {
  cleanClaimRate: number;
  cleanClaimChange: number;
  denialRate: number;
  denialChange: number;
  daysInAr: number;
  daysInArChange: number;
  collectionsThisWeek: number;
  collectionsChange: number;
}

// --- Messages ---
export interface Message {
  id: string;
  threadId: string;
  from: { id: string; name: string; role: string };
  to: { id: string; name: string; role: string };
  subject: string;
  body: string;
  sentAt: string;
  readAt?: string;
  category: 'patient' | 'team' | 'system';
  priority: 'normal' | 'urgent';
  attachments?: Attachment[];
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: { id: string; name: string; role: string }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  category: 'patient' | 'team' | 'system';
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// --- Inbox ---
export type InboxItemType = 'lab_result' | 'message' | 'refill' | 'prior_auth' | 'task';

export interface InboxItem {
  id: string;
  type: InboxItemType;
  title: string;
  subtitle: string;
  patientId?: string;
  patientName?: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'unread' | 'read' | 'actioned' | 'archived';
  createdAt: string;
  dueAt?: string;
  assignedTo?: string;
}

// --- Documents ---
export interface Document {
  id: string;
  patientId: string;
  name: string;
  type: 'external_record' | 'imaging' | 'consent' | 'insurance_card' | 'lab_report' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  size: number;
  mimeType: string;
  url: string;
}

// --- Care Gaps ---
export interface CareGap {
  id: string;
  patientId: string;
  measure: string;
  description: string;
  lastDate?: string;
  dueDate?: string;
  status: 'open' | 'closed' | 'declined';
  priority: 'high' | 'medium' | 'low';
}

// --- Timeline ---
export interface TimelineEvent {
  id: string;
  type: 'encounter' | 'lab' | 'order' | 'referral' | 'message' | 'medication' | 'immunization';
  date: string;
  title: string;
  subtitle?: string;
  badge?: string;
  status?: 'normal' | 'abnormal' | 'critical' | 'pending';
  icon?: string;
}

// --- Smart Phrases ---
export interface SmartPhrase {
  trigger: string;
  expansion: string;
  category?: string;
}

// --- Tasks ---
export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  patientId?: string;
  patientName?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueAt?: string;
  createdAt: string;
}

// --- Notifications ---
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// --- Reports ---
export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: 'operational' | 'financial' | 'clinical' | 'provider';
  icon: string;
}

// --- Audit Log ---
export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  tenantId: string;
  timestamp: string;
  ipAddress: string;
  details?: string;
}
