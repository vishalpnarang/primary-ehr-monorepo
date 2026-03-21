import type { Encounter } from '../../types';

export const mockEncounters: Encounter[] = [
  {
    id: 'ENC-00001',
    patientId: 'PAT-10001',
    providerId: 'PRV-00001',
    providerName: 'Dr. Emily Chen, MD',
    appointmentId: 'APT-00002',
    date: '2026-03-19T09:00:00Z',
    type: 'office_visit',
    status: 'signed',
    chiefComplaint: 'Follow-up for Type 2 diabetes management and blood pressure review',
    hpiText:
      'Ms. Johnson is a 44-year-old female with a history of Type 2 diabetes mellitus (diagnosed 2015) and essential hypertension presenting for a 3-month follow-up. She reports overall stable blood glucose readings with home glucometer averaging 130–150 mg/dL fasting. She has been adherent to metformin 1000 mg twice daily and lisinopril 10 mg daily. She denies polyuria, polydipsia, or blurry vision. Reports mild fatigue in the afternoons. Blood pressure at home has been running 130–140/80–88 mmHg. She checks her feet daily and last saw an ophthalmologist 8 months ago. HbA1c obtained today is 7.4% (down from 7.9% 3 months ago). LDL 98 mg/dL on atorvastatin 40 mg.',
    ros: {
      constitutional: {
        reviewed: true,
        positive: ['fatigue'],
        negative: ['fever', 'chills', 'weight loss', 'night sweats'],
      },
      cardiovascular: {
        reviewed: true,
        positive: [],
        negative: ['chest pain', 'palpitations', 'edema', 'orthopnea'],
      },
      respiratory: {
        reviewed: true,
        positive: [],
        negative: ['cough', 'dyspnea', 'wheezing'],
      },
      endocrine: {
        reviewed: true,
        positive: [],
        negative: ['polyuria', 'polydipsia', 'heat/cold intolerance'],
      },
      neurological: {
        reviewed: true,
        positive: [],
        negative: ['headache', 'dizziness', 'numbness', 'tingling'],
      },
      musculoskeletal: {
        reviewed: true,
        positive: [],
        negative: ['joint pain', 'muscle weakness'],
      },
      ophthalmologic: {
        reviewed: true,
        positive: [],
        negative: ['blurred vision', 'vision loss', 'eye pain'],
      },
    },
    examination:
      'VITAL SIGNS: BP 136/82 mmHg (right arm, seated), HR 74 bpm, RR 16/min, Temp 98.4°F, O2 Sat 98% RA, Weight 172 lbs, Height 5\'4", BMI 29.5.\n\nGENERAL: Well-appearing, well-nourished female in no acute distress. Alert and oriented x3.\n\nHEAD/NECK: Normocephalic, atraumatic. No thyromegaly or lymphadenopathy.\n\nCARDIOVASCULAR: Regular rate and rhythm. No murmurs, rubs, or gallops. No JVD. Peripheral pulses 2+ bilaterally.\n\nRESPIRATORY: Clear to auscultation bilaterally. No wheezes, rales, or rhonchi.\n\nABDOMEN: Soft, non-tender, non-distended. No organomegaly.\n\nEXTREMITIES: No pitting edema. Feet: skin intact, no ulcerations, dorsalis pedis pulses palpable bilaterally. Monofilament testing: intact bilaterally.\n\nNEUROLOGICAL: Cranial nerves II–XII grossly intact. Reflexes 2+ bilaterally.',
    assessmentPlan: [
      {
        id: 'AP-001',
        diagnosis: 'Type 2 diabetes mellitus without complications',
        icdCode: 'E11.9',
        plan:
          'HbA1c improved to 7.4% — continue current regimen. Reinforce dietary adherence and exercise 150 min/week. Order repeat HbA1c, CMP, and urine microalbumin in 3 months. Referral to ophthalmology for annual diabetic eye exam overdue. Continue metformin 1000 mg BID.',
        orders: ['HbA1c', 'CMP', 'Urine microalbumin/creatinine ratio'],
        medications: ['Metformin 1000 mg PO BID'],
        referrals: ['Ophthalmology — diabetic eye exam'],
      },
      {
        id: 'AP-002',
        diagnosis: 'Essential hypertension',
        icdCode: 'I10',
        plan:
          'BP 136/82 — slightly above goal of <130/80 for diabetic patients. Increase lisinopril to 20 mg daily. Reinforce sodium restriction <2 g/day, DASH diet. Recheck BP in 4 weeks. Order BMP to monitor renal function and potassium after dose increase.',
        orders: ['BMP in 4 weeks'],
        medications: ['Lisinopril 20 mg PO daily (increased from 10 mg)'],
        referrals: [],
      },
      {
        id: 'AP-003',
        diagnosis: 'Hyperlipidemia',
        icdCode: 'E78.5',
        plan: 'LDL 98 mg/dL — at goal for diabetic patient. Continue atorvastatin 40 mg daily. Recheck lipid panel annually.',
        orders: ['Lipid panel in 12 months'],
        medications: ['Atorvastatin 40 mg PO daily'],
        referrals: [],
      },
    ],
    emCode: '99214',
    emLevel: 'Level 4',
    signedAt: '2026-03-19T09:52:00Z',
    signedBy: 'Dr. Emily Chen, MD',
    lastAutoSaved: '2026-03-19T09:50:00Z',
  },
  {
    id: 'ENC-00002',
    patientId: 'PAT-10002',
    providerId: 'PRV-00001',
    providerName: 'Dr. Emily Chen, MD',
    appointmentId: 'APT-00006',
    date: '2026-02-12T10:00:00Z',
    type: 'office_visit',
    status: 'signed',
    chiefComplaint: 'COPD exacerbation — increased dyspnea and sputum production',
    hpiText:
      'Mr. Rivera is a 62-year-old male with severe COPD (GOLD Stage III) and systolic heart failure (EF 40%) presenting with a 5-day history of worsening dyspnea, increased cough, and change in sputum from clear to yellow-green. He has used his albuterol rescue inhaler 6–8 times per day over the past 3 days (baseline 1–2 times/day). He denies fever. He had a similar exacerbation 4 months ago requiring a course of prednisone and azithromycin. He is adherent to tiotropium, salmeterol/fluticasone, and furosemide. SpO2 at home has been 89–91% on 2L NC. Denies chest pain. Notes 2+ pitting edema in bilateral lower extremities, worse than usual.',
    ros: {
      constitutional: {
        reviewed: true,
        positive: [],
        negative: ['fever', 'chills', 'weight loss'],
      },
      cardiovascular: {
        reviewed: true,
        positive: ['edema'],
        negative: ['chest pain', 'palpitations', 'orthopnea'],
      },
      respiratory: {
        reviewed: true,
        positive: ['dyspnea', 'productive cough', 'wheezing'],
        negative: ['hemoptysis', 'pleuritic chest pain'],
      },
    },
    examination:
      'VITAL SIGNS: BP 148/90 mmHg, HR 92 bpm, RR 22/min, Temp 99.1°F, O2 Sat 91% on 2L NC.\n\nGENERAL: Elderly male in mild-moderate respiratory distress, using accessory muscles.\n\nRESPIRATORY: Barrel-shaped chest. Decreased air entry bilaterally at bases. Diffuse expiratory wheezes. Prolonged expiratory phase.\n\nCARDIOVASCULAR: RRR. S3 gallop present. JVD to 10 cm. 2+ pitting edema to knees bilaterally.',
    assessmentPlan: [
      {
        id: 'AP-004',
        diagnosis: 'Acute exacerbation of chronic obstructive pulmonary disease',
        icdCode: 'J44.1',
        plan:
          'Moderate COPD exacerbation. Prescribing prednisone 40 mg PO x5 days, azithromycin 250 mg PO x5 days. Continue all inhaled medications. Add ipratropium nebulizers TID. Order CXR stat. Order BMP, CBC. Pulse oximetry monitoring. Return in 5 days or sooner if worsening.',
        orders: ['CXR PA and Lateral', 'BMP', 'CBC with differential', 'Spirometry in 4 weeks'],
        medications: [
          'Prednisone 40 mg PO daily x5 days',
          'Azithromycin 250 mg PO daily x5 days',
          'Ipratropium 0.5 mg nebulizer TID x7 days',
        ],
        referrals: ['Pulmonology — COPD management'],
      },
      {
        id: 'AP-005',
        diagnosis: 'Systolic heart failure, chronic, reduced ejection fraction',
        icdCode: 'I50.20',
        plan:
          'Volume overload with worsening edema. Increase furosemide to 80 mg PO BID for 5 days then return to 40 mg daily. Daily weights — call if gain >3 lbs in 48 hours. Sodium restriction <2 g/day. BMP to monitor renal function and electrolytes.',
        orders: ['BMP', 'BNP level', 'Echocardiogram in 6 weeks'],
        medications: ['Furosemide 80 mg PO BID x5 days, then resume 40 mg daily'],
        referrals: [],
      },
    ],
    emCode: '99215',
    emLevel: 'Level 5',
    signedAt: '2026-02-12T11:05:00Z',
    signedBy: 'Dr. Emily Chen, MD',
    lastAutoSaved: '2026-02-12T11:00:00Z',
  },
  {
    id: 'ENC-00003',
    patientId: 'PAT-10005',
    providerId: 'PRV-00001',
    providerName: 'Dr. Emily Chen, MD',
    date: '2025-12-15T11:30:00Z',
    type: 'telehealth',
    status: 'signed',
    chiefComplaint: 'Anxiety — worsening symptoms, medication adjustment',
    hpiText:
      'Ms. Williams is a 27-year-old female with generalized anxiety disorder and episodic migraines presenting via telehealth for medication management. She reports increased anxiety over the past 3 weeks, primarily work-related stress. She is on sertraline 50 mg daily (started 4 months ago) with partial response. She describes racing thoughts, difficulty concentrating, and initial insomnia. Denies suicidal ideation. Also reports 2–3 migraines per month, lasting 8–12 hours, responding to sumatriptan 50 mg. She is not on migraine prophylaxis.',
    ros: {
      psychiatric: {
        reviewed: true,
        positive: ['anxiety', 'insomnia', 'difficulty concentrating'],
        negative: ['suicidal ideation', 'homicidal ideation', 'hallucinations', 'depression'],
      },
      neurological: {
        reviewed: true,
        positive: ['headache'],
        negative: ['dizziness', 'weakness', 'vision changes'],
      },
    },
    examination:
      'TELEHEALTH VISIT — Physical exam limited.\n\nGENERAL: Well-appearing female, appears somewhat anxious. Alert, coherent.\n\nPSYCH: Speech normal rate/rhythm. Thought process linear and goal-directed. Mood described as "anxious." Affect congruent. No psychomotor agitation noted on video.',
    assessmentPlan: [
      {
        id: 'AP-006',
        diagnosis: 'Generalized anxiety disorder',
        icdCode: 'F41.1',
        plan:
          'Partial response to sertraline 50 mg. Increase sertraline to 100 mg daily. Discussed importance of slow titration. Patient education on medication side effects. Recommend cognitive behavioral therapy referral. Recheck in 4 weeks via telehealth.',
        orders: [],
        medications: ['Sertraline 100 mg PO daily (increased from 50 mg)'],
        referrals: ['Psychology — CBT for GAD'],
      },
      {
        id: 'AP-007',
        diagnosis: 'Migraine without aura',
        icdCode: 'G43.009',
        plan:
          'Migraines 2–3/month — meets criteria for prophylaxis. Starting propranolol 40 mg BID for migraine prevention. Continue sumatriptan 50 mg PRN for acute attacks. Migraine diary to track frequency and triggers. Limit caffeine and maintain sleep hygiene.',
        orders: ['EKG before starting propranolol'],
        medications: [
          'Propranolol 40 mg PO BID',
          'Sumatriptan 50 mg PO PRN migraine (max 2/day)',
        ],
        referrals: [],
      },
    ],
    emCode: '99214',
    emLevel: 'Level 4',
    signedAt: '2025-12-15T12:20:00Z',
    signedBy: 'Dr. Emily Chen, MD',
    lastAutoSaved: '2025-12-15T12:18:00Z',
  },
  {
    id: 'ENC-00004',
    patientId: 'PAT-10009',
    providerId: 'PRV-00001',
    providerName: 'Dr. Emily Chen, MD',
    date: '2026-02-20T11:00:00Z',
    type: 'office_visit',
    status: 'signed',
    chiefComplaint: 'Breast cancer survivorship — annual follow-up, fatigue',
    hpiText:
      "Ms. O'Brien is a 66-year-old female with a history of invasive ductal carcinoma of the right breast (Stage IIB, ER+/PR+/HER2-), diagnosed in 2019, s/p lumpectomy, adjuvant chemotherapy, and radiation, currently on anastrozole 1 mg daily (year 6 of 10). She presents for annual survivorship follow-up. She reports persistent fatigue (6/10 severity), arthralgias in hands and wrists (common anastrozole side effect), and occasional hot flashes. She completed mammography 3 months ago showing no evidence of recurrence. Last bone density scan (2024) showed osteopenia. She denies new lumps, skin changes, or bone pain.",
    ros: {
      constitutional: {
        reviewed: true,
        positive: ['fatigue', 'hot flashes'],
        negative: ['fever', 'night sweats', 'weight loss'],
      },
      musculoskeletal: {
        reviewed: true,
        positive: ['arthralgias', 'joint stiffness'],
        negative: ['muscle weakness', 'bone pain'],
      },
      oncologic: {
        reviewed: true,
        positive: [],
        negative: ['new masses', 'lymphadenopathy', 'nipple discharge'],
      },
    },
    examination:
      "VITAL SIGNS: BP 122/74, HR 68, RR 14, Temp 98.2°F, O2 Sat 99%, Weight 158 lbs, BMI 27.1.\n\nGENERAL: Well-appearing older female. Alert and oriented x3. No acute distress.\n\nBREAST: Right breast — lumpectomy scar well-healed, no new masses or skin changes. Left breast — no masses or discharge. No axillary lymphadenopathy bilaterally.\n\nMUSCULOSKELETAL: Mild bilateral hand/wrist tenderness to palpation without swelling. ROM preserved.\n\nLYMPH NODES: No cervical, supraclavicular, or inguinal lymphadenopathy.",
    assessmentPlan: [
      {
        id: 'AP-008',
        diagnosis: 'Personal history of malignant neoplasm of breast',
        icdCode: 'Z85.3',
        plan:
          'Survivorship visit — stable. Continue anastrozole 1 mg daily, year 6 of 10. Mammography current (3 months ago, NED). Annual oncology follow-up with Dr. Simmons at Northwestern. Arthralgia likely anastrozole-related — trial of acetaminophen 500 mg TID PRN. Physical activity encouraged.',
        orders: ['CBC', 'CMP', 'Vitamin D 25-OH level'],
        medications: ['Anastrozole 1 mg PO daily', 'Acetaminophen 500 mg PO TID PRN arthralgia'],
        referrals: [],
      },
      {
        id: 'AP-009',
        diagnosis: 'Osteopenia',
        icdCode: 'M85.80',
        plan:
          'Osteopenia on anastrozole — high-risk patient. Calcium 1200 mg + Vitamin D 1000 IU supplementation. Weight-bearing exercise. Repeat DEXA scan in 1 year. Discuss bisphosphonate therapy if worsens.',
        orders: ['DEXA scan in 12 months'],
        medications: [
          'Calcium carbonate 600 mg + Vitamin D3 400 IU PO BID',
        ],
        referrals: [],
      },
    ],
    emCode: '99215',
    emLevel: 'Level 5',
    signedAt: '2026-02-20T12:10:00Z',
    signedBy: 'Dr. Emily Chen, MD',
    lastAutoSaved: '2026-02-20T12:08:00Z',
  },
  {
    id: 'ENC-00005',
    patientId: 'PAT-10004',
    providerId: 'PRV-00001',
    providerName: 'Dr. Emily Chen, MD',
    date: '2026-02-28T13:00:00Z',
    type: 'office_visit',
    status: 'signed',
    chiefComplaint: 'Atrial fibrillation follow-up, INR monitoring, CKD management',
    hpiText:
      'Mr. Thompson is a 70-year-old male with permanent atrial fibrillation (on warfarin), CKD Stage 3 (eGFR 42), and longstanding hypertension presenting for 3-month follow-up. INR today is 2.8 (therapeutic range 2–3). He reports no bleeding episodes, no neurological symptoms, and no palpitations. He is adherent to metoprolol succinate 50 mg daily, warfarin 5 mg daily (Mon/Wed/Fri), and amlodipine 10 mg daily. BP has been well-controlled at home 125–135/70–78. He notes mild ankle swelling by end of day. Creatinine last check was 1.8 mg/dL. He has an upcoming nephrology appointment next month.',
    ros: {
      cardiovascular: {
        reviewed: true,
        positive: ['ankle edema'],
        negative: ['chest pain', 'palpitations', 'syncope', 'orthopnea'],
      },
      neurological: {
        reviewed: true,
        positive: [],
        negative: ['headache', 'weakness', 'speech difficulty', 'vision changes'],
      },
      hematologic: {
        reviewed: true,
        positive: [],
        negative: ['easy bruising', 'unusual bleeding', 'blood in stool', 'hematuria'],
      },
    },
    examination:
      'VITAL SIGNS: BP 128/76, HR 74 bpm (irregular), RR 16, Temp 98.0°F, O2 Sat 97%, Weight 188 lbs.\n\nGENERAL: Elderly male in no acute distress. Alert and oriented x3.\n\nCARDIOVASCULAR: Irregularly irregular rhythm. No murmurs. Mild bilateral ankle edema (1+).\n\nRESPIRATORY: Clear to auscultation bilaterally.\n\nABDOMEN: Soft, non-tender. No organomegaly.',
    assessmentPlan: [
      {
        id: 'AP-010',
        diagnosis: 'Permanent atrial fibrillation',
        icdCode: 'I48.21',
        plan:
          'INR 2.8 — therapeutic. Continue warfarin 5 mg daily (Mon/Wed/Fri). Continue metoprolol succinate 50 mg daily for rate control. HR 74 at rest — adequate rate control. No dose changes. Repeat INR in 4 weeks.',
        orders: ['INR in 4 weeks'],
        medications: [
          'Warfarin 5 mg PO daily (Mon/Wed/Fri)',
          'Metoprolol succinate 50 mg PO daily',
        ],
        referrals: [],
      },
      {
        id: 'AP-011',
        diagnosis: 'Chronic kidney disease, stage 3, unspecified',
        icdCode: 'N18.3',
        plan:
          'CKD Stage 3 — stable, eGFR 42. Nephrology follow-up scheduled. Avoid NSAIDs. Low-sodium, low-protein diet counseling. Order BMP to monitor renal function and electrolytes. Ensure warfarin monitoring accounts for renal clearance.',
        orders: ['BMP', 'Urine protein/creatinine ratio', 'CBC'],
        medications: [],
        referrals: ['Nephrology — CKD management (appointment next month)'],
      },
    ],
    emCode: '99214',
    emLevel: 'Level 4',
    signedAt: '2026-02-28T14:02:00Z',
    signedBy: 'Dr. Emily Chen, MD',
    lastAutoSaved: '2026-02-28T14:00:00Z',
  },
];

export const getEncounterById = (id: string): Encounter | undefined =>
  mockEncounters.find((e) => e.id === id);

export const getEncountersByPatient = (patientId: string): Encounter[] =>
  mockEncounters.filter((e) => e.patientId === patientId);
