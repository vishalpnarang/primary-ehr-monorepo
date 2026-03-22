import type { Tenant, Location, SmartPhrase } from '../../types';

export const mockTenant: Tenant = {
  id: 'TEN-00001',
  name: 'Primus Think',
  subdomain: 'primusdemo',
  npi: '1578234901',
  taxId: '36-4891234',
  address: {
    line1: '900 N Michigan Ave',
    line2: 'Suite 1200',
    city: 'Chicago',
    state: 'IL',
    zip: '60611',
  },
  phone: '(312) 555-8000',
  status: 'active',
  locations: [], // populated separately below
  createdAt: '2024-01-15T09:00:00Z',
};

export const mockLocations: Location[] = [
  {
    id: 'LOC-00001',
    name: 'Primus Think — Gold Coast',
    address: {
      line1: '900 N Michigan Ave',
      line2: 'Suite 1200',
      city: 'Chicago',
      state: 'IL',
      zip: '60611',
    },
    phone: '(312) 555-8001',
    fax: '(312) 555-8002',
    rooms: [
      {
        id: 'ROOM-001',
        name: 'Exam Room 1',
        locationId: 'LOC-00001',
        status: 'available',
      },
      {
        id: 'ROOM-002',
        name: 'Exam Room 2',
        locationId: 'LOC-00001',
        status: 'occupied',
        currentPatientId: 'PAT-10006',
      },
      {
        id: 'ROOM-003',
        name: 'Exam Room 3',
        locationId: 'LOC-00001',
        status: 'cleaning',
      },
      {
        id: 'ROOM-004',
        name: 'Exam Room 4',
        locationId: 'LOC-00001',
        status: 'available',
      },
      {
        id: 'ROOM-005',
        name: 'Procedure Room',
        locationId: 'LOC-00001',
        status: 'available',
      },
      {
        id: 'ROOM-006',
        name: 'Telehealth Suite',
        locationId: 'LOC-00001',
        status: 'occupied',
        currentPatientId: 'PAT-10005',
      },
    ],
    hours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: null,
    },
  },
  {
    id: 'LOC-00002',
    name: 'Primus Think — Lincoln Park',
    address: {
      line1: '2001 N Halsted St',
      line2: 'Suite 300',
      city: 'Chicago',
      state: 'IL',
      zip: '60614',
    },
    phone: '(773) 555-8010',
    fax: '(773) 555-8011',
    rooms: [
      {
        id: 'ROOM-201',
        name: 'Exam Room 1',
        locationId: 'LOC-00002',
        status: 'available',
      },
      {
        id: 'ROOM-202',
        name: 'Exam Room 2',
        locationId: 'LOC-00002',
        status: 'available',
      },
      {
        id: 'ROOM-203',
        name: 'Exam Room 3',
        locationId: 'LOC-00002',
        status: 'blocked',
      },
      {
        id: 'ROOM-204',
        name: 'Lab Draw Room',
        locationId: 'LOC-00002',
        status: 'available',
      },
    ],
    hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '16:00' },
      saturday: null,
      sunday: null,
    },
  },
];

// ─── Smart Phrases ────────────────────────────────────────────────────────────

export const mockSmartPhrases: SmartPhrase[] = [
  {
    trigger: '.hpi',
    expansion:
      '[Patient name] is a [age]-year-old [sex] with a history of [conditions] presenting with [chief complaint] for [duration]. The symptoms are [character, severity, location, radiation, aggravating/relieving factors]. Associated symptoms include [list]. Denies [relevant negatives].',
    category: 'History',
  },
  {
    trigger: '.ros',
    expansion:
      'CONSTITUTIONAL: Denies fever, chills, weight loss, fatigue.\nCARDIOVASCULAR: Denies chest pain, palpitations, edema, orthopnea.\nRESPIRATORY: Denies cough, dyspnea, wheezing, hemoptysis.\nGASTROINTESTINAL: Denies nausea, vomiting, diarrhea, constipation, abdominal pain.\nGENITOURINARY: Denies dysuria, frequency, hematuria.\nMUSCULOSKELETAL: Denies joint pain, muscle weakness, back pain.\nNEUROLOGICAL: Denies headache, dizziness, weakness, numbness.\nPSYCHIATRIC: Denies depression, anxiety, SI/HI.',
    category: 'Review of Systems',
  },
  {
    trigger: '.pe',
    expansion:
      'GENERAL: Well-appearing, well-nourished [sex] in no acute distress. Alert and oriented x3.\nHEAD/NECK: Normocephalic, atraumatic. No thyromegaly or lymphadenopathy.\nCARDIOVASCULAR: Regular rate and rhythm. No murmurs, rubs, or gallops.\nRESPIRATORY: Clear to auscultation bilaterally. No wheezes, rales, or rhonchi.\nABDOMEN: Soft, non-tender, non-distended. Normal bowel sounds. No organomegaly.\nEXTREMITIES: No clubbing, cyanosis, or edema.\nNEUROLOGICAL: Cranial nerves II–XII grossly intact. Reflexes 2+ bilaterally.',
    category: 'Physical Exam',
  },
  {
    trigger: '.dm',
    expansion:
      'Type [1/2] diabetes mellitus, [controlled/uncontrolled]. HbA1c [value]% ([date]). On [medication list]. SMBG [frequency]. Denies polyuria, polydipsia, blurry vision. Feet examined — skin intact, sensation intact to monofilament bilaterally. Last ophthalmology visit [date]. Last nephropathy screen [date].',
    category: 'Chronic Disease',
  },
  {
    trigger: '.htn',
    expansion:
      'Essential hypertension, [controlled/uncontrolled]. BP today [value]. Home readings per patient averaging [value]. On [medication list]. Adherent with medication. Low-sodium diet counseled. Denies chest pain, headache, vision changes. Renal function [stable/pending].',
    category: 'Chronic Disease',
  },
  {
    trigger: '.fu',
    expansion:
      'Patient returns for [interval] follow-up for [conditions]. Overall [stable/improved/worsening]. [Key interval history]. Lab results reviewed. Current medications reviewed and reconciled. [Specific management changes]. Patient verbalized understanding of plan. Return to clinic in [interval] or sooner for [warning signs]. Questions answered.',
    category: 'Follow-Up',
  },
  {
    trigger: '.avs',
    expansion:
      'AFTER VISIT SUMMARY\n\nYou were seen today for: [reason]\nYour provider: [name]\n\nDiagnoses: [list]\n\nMedication changes:\n- [New/changed/discontinued medications]\n\nOrders placed: [lab/imaging orders]\n\nNext steps:\n- [Instructions]\n\nReturn to clinic: [date/timeframe]\nCall us at [phone] if: [warning signs]\n\nEmergency: Call 911 or go to nearest ER.',
    category: 'Patient Communication',
  },
  {
    trigger: '.soap',
    expansion:
      'SUBJECTIVE:\n[Chief complaint and HPI]\n\nOBJECTIVE:\nVitals: BP [value], HR [value], RR [value], Temp [value], O2 Sat [value]%, Weight [value] lbs\n[Physical exam findings]\n\nLabs: [relevant results]\n\nASSESSMENT:\n1. [Diagnosis] — [ICD-10 code]\n\nPLAN:\n1. [Plan item]',
    category: 'Note Templates',
  },
  {
    trigger: '.med',
    expansion:
      '[Drug name] [strength] [dosage form] — [route] [frequency] — Qty [quantity], [refills] refill(s). Indication: [indication]. Patient counseled on side effects including [common side effects]. Drug interactions reviewed.',
    category: 'Medications',
  },
  {
    trigger: '.ref',
    expansion:
      'Referral to [specialty] — [provider/practice name]\nUrgency: [routine/urgent/emergent]\nReason: [clinical indication]\nClinical summary: [brief history, relevant labs/imaging]\nPlease evaluate and manage [specific request].\nPatient contact: [phone]\nInsurance: [payer]\nThank you for seeing this patient.',
    category: 'Referrals',
  },
];

// Merge locations into tenant
export const mockTenantWithLocations: Tenant = {
  ...mockTenant,
  locations: mockLocations,
};
