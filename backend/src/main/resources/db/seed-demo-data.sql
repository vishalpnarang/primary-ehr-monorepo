-- =============================================================================
-- Primus EHR — Demo Seed Data
-- =============================================================================
-- Purpose : Populate a fresh demo environment for Primus Demo Clinic.
-- Audience : Developers, QA, sales demos.
-- Run after: All Liquibase migrations have been applied.
-- Safety   : Every INSERT uses ON CONFLICT DO NOTHING so the script is
--            idempotent and safe to re-run.
-- Dates    : ALL dates are relative to CURRENT_DATE — the demo is always fresh.
-- UUIDs    : Fixed UUIDs are used for cross-referencing; gen_random_uuid() is
--            used only where no cross-reference is needed.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. TENANT
-- ---------------------------------------------------------------------------
INSERT INTO tenants (uuid, name, subdomain, npi, tax_id, phone, fax,
                     address_line1, city, state, zip, status,
                     created_by, modified_by)
VALUES ('10000000-0000-0000-0000-000000000001',
        'Primus Demo Clinic',
        'primusdemo',
        '1234567890',
        '47-1234567',
        '(212) 555-0100',
        '(212) 555-0101',
        '250 W 57th St, Suite 100',
        'New York',
        'NY',
        '10107',
        'ACTIVE',
        'system', 'system')
ON CONFLICT (subdomain) DO NOTHING;

-- Capture the tenant pk for use throughout this script
DO $$
DECLARE
  v_tenant_id BIGINT;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants WHERE subdomain = 'primusdemo';

-- ---------------------------------------------------------------------------
-- 2. LOCATIONS
-- ---------------------------------------------------------------------------
INSERT INTO locations (uuid, tenant_id, name, address_line1, city, state, zip,
                       phone, fax, active, created_by, modified_by)
VALUES
  ('20000000-0000-0000-0000-000000000001',
   v_tenant_id, 'Primus Demo Clinic Downtown',
   '250 W 57th St', 'New York', 'NY', '10107',
   '(212) 555-0110', '(212) 555-0111', true, 'system', 'system'),
  ('20000000-0000-0000-0000-000000000002',
   v_tenant_id, 'Primus Demo Clinic Midtown',
   '420 Lexington Ave', 'New York', 'NY', '10170',
   '(212) 555-0120', '(212) 555-0121', true, 'system', 'system')
ON CONFLICT (uuid) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. ROOMS
-- ---------------------------------------------------------------------------
DECLARE
  v_loc_downtown BIGINT;
  v_loc_midtown  BIGINT;
BEGIN
  SELECT id INTO v_loc_downtown FROM locations WHERE uuid = '20000000-0000-0000-0000-000000000001';
  SELECT id INTO v_loc_midtown  FROM locations WHERE uuid = '20000000-0000-0000-0000-000000000002';

  INSERT INTO rooms (uuid, tenant_id, location_id, name, status, created_by, modified_by)
  VALUES
    ('30000000-0000-0000-0000-000000000001', v_tenant_id, v_loc_downtown, 'Exam 1',         'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000002', v_tenant_id, v_loc_downtown, 'Exam 2',         'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000003', v_tenant_id, v_loc_downtown, 'Exam 3',         'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000004', v_tenant_id, v_loc_downtown, 'Exam 4',         'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000005', v_tenant_id, v_loc_downtown, 'Procedure Room', 'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000006', v_tenant_id, v_loc_midtown,  'Exam A',         'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000007', v_tenant_id, v_loc_midtown,  'Exam B',         'AVAILABLE', 'system', 'system'),
    ('30000000-0000-0000-0000-000000000008', v_tenant_id, v_loc_midtown,  'Exam C',         'AVAILABLE', 'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. USERS  (keycloak_user_id matches Keycloak realm UUIDs below)
-- ---------------------------------------------------------------------------
  INSERT INTO users (uuid, tenant_id, keycloak_user_id, email, first_name, last_name,
                     role, title, specialty, npi, phone, status, created_by, modified_by)
  VALUES
    -- Super Admin (no tenant affiliation)
    ('40000000-0000-0000-0000-000000000001',
     NULL,
     'kc-00000000-0000-0000-0000-000000000001',
     'alex.morgan@thinkitive.com',
     'Alex', 'Morgan', 'super_admin', NULL, NULL, NULL,
     '(614) 555-0001', 'ACTIVE', 'system', 'system'),

    -- Tenant Admin
    ('40000000-0000-0000-0000-000000000002',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000002',
     'james.wilson@primusdemo.com',
     'James', 'Wilson', 'tenant_admin', NULL, NULL, NULL,
     '(212) 555-0200', 'ACTIVE', 'system', 'system'),

    -- Practice Admin
    ('40000000-0000-0000-0000-000000000003',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000003',
     'maria.garcia@primusdemo.com',
     'Maria', 'Garcia', 'practice_admin', NULL, NULL, NULL,
     '(212) 555-0201', 'ACTIVE', 'system', 'system'),

    -- Provider: Dr. Emily Chen
    ('40000000-0000-0000-0000-000000000004',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000004',
     'emily.chen@primusdemo.com',
     'Emily', 'Chen', 'provider', 'MD', 'Internal Medicine', '1234567890',
     '(212) 555-0202', 'ACTIVE', 'system', 'system'),

    -- Provider: Dr. Kevin Torres
    ('40000000-0000-0000-0000-000000000005',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000005',
     'kevin.torres@primusdemo.com',
     'Kevin', 'Torres', 'provider', 'MD', 'Family Medicine', '9876543210',
     '(212) 555-0203', 'ACTIVE', 'system', 'system'),

    -- Nurse
    ('40000000-0000-0000-0000-000000000006',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000006',
     'sarah.thompson@primusdemo.com',
     'Sarah', 'Thompson', 'nurse', 'RN', NULL, NULL,
     '(212) 555-0204', 'ACTIVE', 'system', 'system'),

    -- Front Desk
    ('40000000-0000-0000-0000-000000000007',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000007',
     'david.kim@primusdemo.com',
     'David', 'Kim', 'front_desk', NULL, NULL, NULL,
     '(212) 555-0205', 'ACTIVE', 'system', 'system'),

    -- Billing
    ('40000000-0000-0000-0000-000000000008',
     v_tenant_id,
     'kc-00000000-0000-0000-0000-000000000008',
     'lisa.patel@primusdemo.com',
     'Lisa', 'Patel', 'billing', NULL, NULL, NULL,
     '(212) 555-0206', 'ACTIVE', 'system', 'system')
  ON CONFLICT (keycloak_user_id) DO NOTHING;

-- Capture provider PKs
DECLARE
  v_provider_chen    BIGINT;
  v_provider_torres  BIGINT;
  v_nurse            BIGINT;
  v_front_desk       BIGINT;
  v_billing          BIGINT;
  v_room_exam1       BIGINT;
  v_room_exam2       BIGINT;
  v_room_exam3       BIGINT;
  v_room_examA       BIGINT;
  v_room_examB       BIGINT;
BEGIN
  SELECT id INTO v_provider_chen   FROM users WHERE uuid = '40000000-0000-0000-0000-000000000004';
  SELECT id INTO v_provider_torres FROM users WHERE uuid = '40000000-0000-0000-0000-000000000005';
  SELECT id INTO v_nurse           FROM users WHERE uuid = '40000000-0000-0000-0000-000000000006';
  SELECT id INTO v_front_desk      FROM users WHERE uuid = '40000000-0000-0000-0000-000000000007';
  SELECT id INTO v_billing         FROM users WHERE uuid = '40000000-0000-0000-0000-000000000008';
  SELECT id INTO v_room_exam1      FROM rooms WHERE uuid = '30000000-0000-0000-0000-000000000001';
  SELECT id INTO v_room_exam2      FROM rooms WHERE uuid = '30000000-0000-0000-0000-000000000002';
  SELECT id INTO v_room_exam3      FROM rooms WHERE uuid = '30000000-0000-0000-0000-000000000003';
  SELECT id INTO v_room_examA      FROM rooms WHERE uuid = '30000000-0000-0000-0000-000000000006';
  SELECT id INTO v_room_examB      FROM rooms WHERE uuid = '30000000-0000-0000-0000-000000000007';

-- ---------------------------------------------------------------------------
-- 5. PATIENTS  (10)
-- ---------------------------------------------------------------------------
  INSERT INTO patients (uuid, tenant_id, mrn, first_name, last_name, dob, sex,
                        phone, email, address_line1, city, state, zip,
                        emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
                        primary_provider_id, status, created_by, modified_by)
  VALUES
    -- 1. Sarah Johnson — 44F, T2DM + HTN
    ('50000000-0000-0000-0000-000000000001',
     v_tenant_id, 'PAT-10001', 'Sarah', 'Johnson',
     CURRENT_DATE - INTERVAL '44 years', 'female',
     '(646) 555-1001', 'sarah.johnson@email.com',
     '312 W 86th St', 'New York', 'NY', '10024',
     'Michael Johnson', 'Spouse', '(646) 555-1002',
     v_provider_chen, 'ACTIVE', 'system', 'system'),

    -- 2. Marcus Rivera — 62M, COPD + CHF
    ('50000000-0000-0000-0000-000000000002',
     v_tenant_id, 'PAT-10002', 'Marcus', 'Rivera',
     CURRENT_DATE - INTERVAL '62 years', 'male',
     '(347) 555-1003', 'marcus.rivera@email.com',
     '88 Bleecker St', 'New York', 'NY', '10012',
     'Carmen Rivera', 'Spouse', '(347) 555-1004',
     v_provider_chen, 'ACTIVE', 'system', 'system'),

    -- 3. Linda Chen — 38F, Pregnancy (G2P1)
    ('50000000-0000-0000-0000-000000000003',
     v_tenant_id, 'PAT-10003', 'Linda', 'Chen',
     CURRENT_DATE - INTERVAL '38 years', 'female',
     '(718) 555-1005', 'linda.chen@email.com',
     '45 Park Ave', 'New York', 'NY', '10016',
     'Wei Chen', 'Spouse', '(718) 555-1006',
     v_provider_chen, 'ACTIVE', 'system', 'system'),

    -- 4. James Thompson — 71M, AFib + CKD
    ('50000000-0000-0000-0000-000000000004',
     v_tenant_id, 'PAT-10004', 'James', 'Thompson',
     CURRENT_DATE - INTERVAL '71 years', 'male',
     '(212) 555-1007', 'james.thompson@email.com',
     '201 E 79th St', 'New York', 'NY', '10075',
     'Patricia Thompson', 'Daughter', '(212) 555-1008',
     v_provider_torres, 'ACTIVE', 'system', 'system'),

    -- 5. Aisha Williams — 28F, Anxiety + Migraine
    ('50000000-0000-0000-0000-000000000005',
     v_tenant_id, 'PAT-10005', 'Aisha', 'Williams',
     CURRENT_DATE - INTERVAL '28 years', 'female',
     '(917) 555-1009', 'aisha.williams@email.com',
     '520 W 145th St', 'New York', 'NY', '10031',
     'Darnell Williams', 'Brother', '(917) 555-1010',
     v_provider_torres, 'ACTIVE', 'system', 'system'),

    -- 6. Robert Martinez — 55M, HTN + HLD
    ('50000000-0000-0000-0000-000000000006',
     v_tenant_id, 'PAT-10006', 'Robert', 'Martinez',
     CURRENT_DATE - INTERVAL '55 years', 'male',
     '(646) 555-1011', 'robert.martinez@email.com',
     '730 Riverside Dr', 'New York', 'NY', '10031',
     'Elena Martinez', 'Spouse', '(646) 555-1012',
     v_provider_torres, 'ACTIVE', 'system', 'system'),

    -- 7. Emma Davis — 8F, Asthma
    ('50000000-0000-0000-0000-000000000007',
     v_tenant_id, 'PAT-10007', 'Emma', 'Davis',
     CURRENT_DATE - INTERVAL '8 years', 'female',
     '(212) 555-1013', 'parent.davis@email.com',
     '118 Joralemon St', 'Brooklyn', 'NY', '11201',
     'Lisa Davis', 'Mother', '(212) 555-1014',
     v_provider_chen, 'ACTIVE', 'system', 'system'),

    -- 8. William Park — 49M, T1DM
    ('50000000-0000-0000-0000-000000000008',
     v_tenant_id, 'PAT-10008', 'William', 'Park',
     CURRENT_DATE - INTERVAL '49 years', 'male',
     '(718) 555-1015', 'william.park@email.com',
     '62 Montague St', 'Brooklyn', 'NY', '11201',
     'Ji-Yeon Park', 'Spouse', '(718) 555-1016',
     v_provider_chen, 'ACTIVE', 'system', 'system'),

    -- 9. Catherine O'Brien — 67F, Breast Cancer Survivor
    ('50000000-0000-0000-0000-000000000009',
     v_tenant_id, 'PAT-10009', 'Catherine', 'O''Brien',
     CURRENT_DATE - INTERVAL '67 years', 'female',
     '(212) 555-1017', 'catherine.obrien@email.com',
     '400 E 67th St', 'New York', 'NY', '10065',
     'Patrick O''Brien', 'Spouse', '(212) 555-1018',
     v_provider_torres, 'ACTIVE', 'system', 'system'),

    -- 10. Michael Brown — 33M, Healthy / Annual Wellness
    ('50000000-0000-0000-0000-000000000010',
     v_tenant_id, 'PAT-10010', 'Michael', 'Brown',
     CURRENT_DATE - INTERVAL '33 years', 'male',
     '(347) 555-1019', 'michael.brown@email.com',
     '239 Flatbush Ave', 'Brooklyn', 'NY', '11217',
     'Angela Brown', 'Mother', '(347) 555-1020',
     v_provider_torres, 'ACTIVE', 'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

-- Capture patient PKs
DECLARE
  v_pat1  BIGINT; v_pat2  BIGINT; v_pat3  BIGINT; v_pat4  BIGINT; v_pat5  BIGINT;
  v_pat6  BIGINT; v_pat7  BIGINT; v_pat8  BIGINT; v_pat9  BIGINT; v_pat10 BIGINT;
BEGIN
  SELECT id INTO v_pat1  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000001';
  SELECT id INTO v_pat2  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000002';
  SELECT id INTO v_pat3  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000003';
  SELECT id INTO v_pat4  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000004';
  SELECT id INTO v_pat5  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000005';
  SELECT id INTO v_pat6  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000006';
  SELECT id INTO v_pat7  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000007';
  SELECT id INTO v_pat8  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000008';
  SELECT id INTO v_pat9  FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000009';
  SELECT id INTO v_pat10 FROM patients WHERE uuid = '50000000-0000-0000-0000-000000000010';

-- ---------------------------------------------------------------------------
-- 6. PATIENT INSURANCE
-- ---------------------------------------------------------------------------
  INSERT INTO patient_insurances (tenant_id, patient_id, payer_name, payer_id,
                                  member_id, group_number, plan_type, copay,
                                  is_primary, verified, verified_at,
                                  created_by, modified_by)
  VALUES
    (v_tenant_id, v_pat1,  'Blue Cross Blue Shield', 'BCBS-NY',  'XYZ123456789', 'GRP-88001', 'PPO',  30.00, true, true,  now() - INTERVAL '7 days', 'system', 'system'),
    (v_tenant_id, v_pat2,  'Medicare',               'MCR-00001', 'MCA-962730014', 'MCR-PART-B', 'Medicare', 20.00, true, true, now() - INTERVAL '14 days', 'system', 'system'),
    (v_tenant_id, v_pat3,  'Aetna',                  'AETNA-001', 'W234567890',   'GRP-55212', 'HMO',  25.00, true, true,  now() - INTERVAL '3 days', 'system', 'system'),
    (v_tenant_id, v_pat4,  'UnitedHealthcare',       'UHC-00001', 'UHC-80012345', 'GRP-77003', 'PPO',  40.00, true, true,  now() - INTERVAL '21 days', 'system', 'system'),
    (v_tenant_id, v_pat5,  'Cigna',                  'CGN-00001', 'CGN-55501234', 'GRP-66012', 'EPO',  35.00, true, true,  now() - INTERVAL '5 days', 'system', 'system'),
    (v_tenant_id, v_pat6,  'Blue Cross Blue Shield', 'BCBS-NY',  'XYZ987654321', 'GRP-88001', 'PPO',  30.00, true, true,  now() - INTERVAL '10 days', 'system', 'system'),
    (v_tenant_id, v_pat7,  'Aetna',                  'AETNA-001', 'W908070605',   'GRP-55212', 'HMO',  25.00, true, true,  now() - INTERVAL '2 days', 'system', 'system'),
    (v_tenant_id, v_pat8,  'Blue Cross Blue Shield', 'BCBS-NY',  'XYZ111222333', 'GRP-88001', 'PPO',  30.00, true, true,  now() - INTERVAL '30 days', 'system', 'system'),
    (v_tenant_id, v_pat9,  'Medicare',               'MCR-00001', 'MCA-774400123', 'MCR-PART-B', 'Medicare', 20.00, true, true, now() - INTERVAL '60 days', 'system', 'system'),
    (v_tenant_id, v_pat10, 'Self-Pay',               'SELF',      'SELF',          NULL,        'Self-Pay', 0.00, true, true, now(), 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 7. ALLERGIES
-- ---------------------------------------------------------------------------
  INSERT INTO allergies (tenant_id, patient_id, substance, reaction, severity, type,
                         onset_date, created_by, modified_by)
  VALUES
    -- Sarah Johnson: Penicillin (severe), Sulfa (moderate)
    (v_tenant_id, v_pat1, 'Penicillin',       'Anaphylaxis, urticaria',    'severe',   'drug', CURRENT_DATE - INTERVAL '15 years', 'system', 'system'),
    (v_tenant_id, v_pat1, 'Sulfonamides',     'Rash, pruritus',            'moderate', 'drug', CURRENT_DATE - INTERVAL '8 years',  'system', 'system'),
    -- Marcus Rivera: Aspirin
    (v_tenant_id, v_pat2, 'Aspirin',          'Bronchospasm',              'severe',   'drug', CURRENT_DATE - INTERVAL '20 years', 'system', 'system'),
    -- Linda Chen: Shellfish
    (v_tenant_id, v_pat3, 'Shellfish',        'Urticaria, throat tightness','moderate','food', CURRENT_DATE - INTERVAL '10 years', 'system', 'system'),
    -- James Thompson: Contrast dye
    (v_tenant_id, v_pat4, 'Iodinated contrast','Nausea, flushing',          'mild',    'drug', CURRENT_DATE - INTERVAL '5 years',  'system', 'system'),
    -- Aisha Williams: NKDA (no allergy record needed — absence implies NKDA in UI)
    -- Robert Martinez: Codeine
    (v_tenant_id, v_pat6, 'Codeine',          'Nausea, vomiting',          'moderate', 'drug', CURRENT_DATE - INTERVAL '12 years', 'system', 'system'),
    -- Emma Davis: Peanuts, Cat dander
    (v_tenant_id, v_pat7, 'Peanuts',          'Urticaria, angioedema',     'severe',   'food', CURRENT_DATE - INTERVAL '4 years',  'system', 'system'),
    (v_tenant_id, v_pat7, 'Cat dander',       'Rhinitis, conjunctivitis',  'moderate', 'environmental', CURRENT_DATE - INTERVAL '3 years', 'system', 'system'),
    -- William Park: Latex
    (v_tenant_id, v_pat8, 'Latex',            'Contact dermatitis',        'mild',     'environmental', CURRENT_DATE - INTERVAL '10 years', 'system', 'system'),
    -- Catherine O'Brien: Tamoxifen
    (v_tenant_id, v_pat9, 'Tamoxifen',        'Hot flashes, DVT history',  'moderate', 'drug', CURRENT_DATE - INTERVAL '7 years', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 8. PROBLEMS (2-3 per patient with ICD-10)
-- ---------------------------------------------------------------------------
  INSERT INTO problems (tenant_id, patient_id, description, icd_code, status,
                        onset_date, added_by, added_at, created_by, modified_by)
  VALUES
    -- Sarah Johnson: T2DM + HTN + Obesity
    (v_tenant_id, v_pat1, 'Type 2 Diabetes Mellitus',                     'E11.9',  'ACTIVE', CURRENT_DATE - INTERVAL '8 years',  'Dr. Emily Chen', now() - INTERVAL '8 years',  'system', 'system'),
    (v_tenant_id, v_pat1, 'Essential Hypertension',                        'I10',    'ACTIVE', CURRENT_DATE - INTERVAL '8 years',  'Dr. Emily Chen', now() - INTERVAL '8 years',  'system', 'system'),
    (v_tenant_id, v_pat1, 'Obesity, BMI 31.4',                            'E66.09', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years',  'Dr. Emily Chen', now() - INTERVAL '5 years',  'system', 'system'),
    -- Marcus Rivera: COPD + CHF + CKD
    (v_tenant_id, v_pat2, 'Chronic Obstructive Pulmonary Disease',         'J44.1',  'ACTIVE', CURRENT_DATE - INTERVAL '12 years', 'Dr. Emily Chen', now() - INTERVAL '12 years', 'system', 'system'),
    (v_tenant_id, v_pat2, 'Chronic Heart Failure, reduced ejection fraction','I50.20','ACTIVE', CURRENT_DATE - INTERVAL '6 years',  'Dr. Emily Chen', now() - INTERVAL '6 years',  'system', 'system'),
    (v_tenant_id, v_pat2, 'Chronic Kidney Disease, Stage 3',               'N18.3',  'ACTIVE', CURRENT_DATE - INTERVAL '4 years',  'Dr. Emily Chen', now() - INTERVAL '4 years',  'system', 'system'),
    -- Linda Chen: Pregnancy, Gestational HTN
    (v_tenant_id, v_pat3, 'Pregnancy, 24 weeks gestation (G2P1)',          'O09.529','ACTIVE', CURRENT_DATE - INTERVAL '24 weeks', 'Dr. Emily Chen', now() - INTERVAL '24 weeks', 'system', 'system'),
    (v_tenant_id, v_pat3, 'Gestational Hypertension',                      'O13.9',  'ACTIVE', CURRENT_DATE - INTERVAL '4 weeks',  'Dr. Emily Chen', now() - INTERVAL '4 weeks',  'system', 'system'),
    -- James Thompson: AFib + CKD + HTN
    (v_tenant_id, v_pat4, 'Atrial Fibrillation, persistent',               'I48.11', 'ACTIVE', CURRENT_DATE - INTERVAL '10 years', 'Dr. Kevin Torres', now() - INTERVAL '10 years','system', 'system'),
    (v_tenant_id, v_pat4, 'Chronic Kidney Disease, Stage 3b',              'N18.32', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years',  'Dr. Kevin Torres', now() - INTERVAL '5 years', 'system', 'system'),
    (v_tenant_id, v_pat4, 'Essential Hypertension',                        'I10',    'ACTIVE', CURRENT_DATE - INTERVAL '15 years', 'Dr. Kevin Torres', now() - INTERVAL '15 years','system', 'system'),
    -- Aisha Williams: Anxiety + Migraine
    (v_tenant_id, v_pat5, 'Generalized Anxiety Disorder',                  'F41.1',  'ACTIVE', CURRENT_DATE - INTERVAL '5 years',  'Dr. Kevin Torres', now() - INTERVAL '5 years', 'system', 'system'),
    (v_tenant_id, v_pat5, 'Migraine without aura, episodic',               'G43.009','ACTIVE', CURRENT_DATE - INTERVAL '7 years',  'Dr. Kevin Torres', now() - INTERVAL '7 years', 'system', 'system'),
    -- Robert Martinez: HTN + HLD
    (v_tenant_id, v_pat6, 'Essential Hypertension',                        'I10',    'ACTIVE', CURRENT_DATE - INTERVAL '10 years', 'Dr. Kevin Torres', now() - INTERVAL '10 years','system', 'system'),
    (v_tenant_id, v_pat6, 'Hyperlipidemia, mixed',                         'E78.5',  'ACTIVE', CURRENT_DATE - INTERVAL '8 years',  'Dr. Kevin Torres', now() - INTERVAL '8 years', 'system', 'system'),
    (v_tenant_id, v_pat6, 'Overweight, BMI 28.1',                          'E66.09', 'ACTIVE', CURRENT_DATE - INTERVAL '3 years',  'Dr. Kevin Torres', now() - INTERVAL '3 years', 'system', 'system'),
    -- Emma Davis: Asthma
    (v_tenant_id, v_pat7, 'Asthma, mild persistent',                       'J45.20', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years',  'Dr. Emily Chen', now() - INTERVAL '5 years', 'system', 'system'),
    (v_tenant_id, v_pat7, 'Allergic rhinitis due to pollen',               'J30.1',  'ACTIVE', CURRENT_DATE - INTERVAL '4 years',  'Dr. Emily Chen', now() - INTERVAL '4 years', 'system', 'system'),
    -- William Park: T1DM + Peripheral Neuropathy
    (v_tenant_id, v_pat8, 'Type 1 Diabetes Mellitus',                     'E10.9',  'ACTIVE', CURRENT_DATE - INTERVAL '22 years', 'Dr. Emily Chen', now() - INTERVAL '22 years', 'system', 'system'),
    (v_tenant_id, v_pat8, 'Diabetic peripheral neuropathy',                'E10.40', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years',  'Dr. Emily Chen', now() - INTERVAL '5 years',  'system', 'system'),
    (v_tenant_id, v_pat8, 'Essential Hypertension',                        'I10',    'ACTIVE', CURRENT_DATE - INTERVAL '3 years',  'Dr. Emily Chen', now() - INTERVAL '3 years',  'system', 'system'),
    -- Catherine O'Brien: Breast Cancer Survivor + Osteoporosis
    (v_tenant_id, v_pat9, 'Personal history of breast cancer (in remission)','Z85.3', 'ACTIVE', CURRENT_DATE - INTERVAL '7 years',  'Dr. Kevin Torres', now() - INTERVAL '7 years', 'system', 'system'),
    (v_tenant_id, v_pat9, 'Osteoporosis without current pathological fracture','M81.0','ACTIVE', CURRENT_DATE - INTERVAL '3 years',  'Dr. Kevin Torres', now() - INTERVAL '3 years', 'system', 'system'),
    -- Michael Brown: No chronic conditions
    (v_tenant_id, v_pat10,'Seasonal allergic rhinitis',                    'J30.1',  'ACTIVE', CURRENT_DATE - INTERVAL '2 years',  'Dr. Kevin Torres', now() - INTERVAL '2 years', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 9. MEDICATIONS
-- ---------------------------------------------------------------------------
  INSERT INTO medications (tenant_id, patient_id, drug_name, generic_name, strength,
                           dosage_form, directions, quantity, refills,
                           prescribed_by, prescribed_at, pharmacy, status,
                           start_date, is_controlled, created_by, modified_by)
  VALUES
    -- Sarah Johnson
    (v_tenant_id, v_pat1, 'Glucophage',    'Metformin HCl',      '1000 mg', 'tablet', 'Take 1 tablet by mouth twice daily with meals', 60, 5, 'Dr. Emily Chen, MD', now() - INTERVAL '6 months', 'CVS Pharmacy - 86th & Broadway', 'ACTIVE', CURRENT_DATE - INTERVAL '6 months', false, 'system', 'system'),
    (v_tenant_id, v_pat1, 'Zestril',       'Lisinopril',          '20 mg',  'tablet', 'Take 1 tablet by mouth once daily', 30, 5, 'Dr. Emily Chen, MD', now() - INTERVAL '6 months', 'CVS Pharmacy - 86th & Broadway', 'ACTIVE', CURRENT_DATE - INTERVAL '6 months', false, 'system', 'system'),
    (v_tenant_id, v_pat1, 'Lipitor',       'Atorvastatin calcium', '40 mg', 'tablet', 'Take 1 tablet by mouth once daily at bedtime', 30, 5, 'Dr. Emily Chen, MD', now() - INTERVAL '1 year',  'CVS Pharmacy - 86th & Broadway', 'ACTIVE', CURRENT_DATE - INTERVAL '1 year', false, 'system', 'system'),
    (v_tenant_id, v_pat1, 'Jardiance',     'Empagliflozin',       '25 mg',  'tablet', 'Take 1 tablet by mouth once daily in the morning', 30, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '3 months', 'CVS Pharmacy - 86th & Broadway', 'ACTIVE', CURRENT_DATE - INTERVAL '3 months', false, 'system', 'system'),
    (v_tenant_id, v_pat1, 'Ozempic',       'Semaglutide',         '1 mg/dose','injection', 'Inject 1 mg subcutaneously once weekly', 4, 2, 'Dr. Emily Chen, MD', now() - INTERVAL '3 months', 'CVS Pharmacy - 86th & Broadway', 'ACTIVE', CURRENT_DATE - INTERVAL '3 months', false, 'system', 'system'),
    -- Marcus Rivera
    (v_tenant_id, v_pat2, 'Proventil HFA', 'Albuterol sulfate',   '90 mcg/actuation', 'inhaler', 'Inhale 2 puffs every 4-6 hours as needed for shortness of breath', 1, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '1 year', 'Walgreens - Canal St', 'ACTIVE', CURRENT_DATE - INTERVAL '1 year', false, 'system', 'system'),
    (v_tenant_id, v_pat2, 'Symbicort',     'Budesonide/Formoterol','160/4.5 mcg','inhaler', 'Inhale 2 puffs twice daily — morning and evening', 1, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '8 months', 'Walgreens - Canal St', 'ACTIVE', CURRENT_DATE - INTERVAL '8 months', false, 'system', 'system'),
    (v_tenant_id, v_pat2, 'Zestril',       'Lisinopril',          '10 mg',  'tablet', 'Take 1 tablet by mouth once daily', 30, 5, 'Dr. Emily Chen, MD', now() - INTERVAL '6 years', 'Walgreens - Canal St', 'ACTIVE', CURRENT_DATE - INTERVAL '6 years', false, 'system', 'system'),
    (v_tenant_id, v_pat2, 'Lasix',         'Furosemide',          '40 mg',  'tablet', 'Take 1 tablet by mouth once daily in the morning', 30, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '5 years', 'Walgreens - Canal St', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years', false, 'system', 'system'),
    -- James Thompson
    (v_tenant_id, v_pat4, 'Eliquis',       'Apixaban',            '5 mg',   'tablet', 'Take 1 tablet by mouth twice daily', 60, 3, 'Dr. Kevin Torres, MD', now() - INTERVAL '10 years', 'Rite Aid - E 86th', 'ACTIVE', CURRENT_DATE - INTERVAL '10 years', false, 'system', 'system'),
    (v_tenant_id, v_pat4, 'Coreg',         'Carvedilol',          '12.5 mg','tablet', 'Take 1 tablet by mouth twice daily with food', 60, 3, 'Dr. Kevin Torres, MD', now() - INTERVAL '5 years', 'Rite Aid - E 86th', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years', false, 'system', 'system'),
    -- Aisha Williams
    (v_tenant_id, v_pat5, 'Lexapro',       'Escitalopram oxalate', '10 mg', 'tablet', 'Take 1 tablet by mouth once daily', 30, 5, 'Dr. Kevin Torres, MD', now() - INTERVAL '4 years', 'CVS Pharmacy - 145th St', 'ACTIVE', CURRENT_DATE - INTERVAL '4 years', false, 'system', 'system'),
    (v_tenant_id, v_pat5, 'Topamax',       'Topiramate',           '50 mg', 'tablet', 'Take 1 tablet by mouth twice daily for migraine prevention', 60, 3, 'Dr. Kevin Torres, MD', now() - INTERVAL '2 years', 'CVS Pharmacy - 145th St', 'ACTIVE', CURRENT_DATE - INTERVAL '2 years', false, 'system', 'system'),
    (v_tenant_id, v_pat5, 'Imitrex',       'Sumatriptan succinate','50 mg', 'tablet', 'Take 1-2 tablets at migraine onset; may repeat in 2 hrs; max 200mg/day', 9, 3, 'Dr. Kevin Torres, MD', now() - INTERVAL '2 years', 'CVS Pharmacy - 145th St', 'ACTIVE', CURRENT_DATE - INTERVAL '2 years', false, 'system', 'system'),
    -- Robert Martinez
    (v_tenant_id, v_pat6, 'Norvasc',       'Amlodipine besylate',  '10 mg', 'tablet', 'Take 1 tablet by mouth once daily', 30, 5, 'Dr. Kevin Torres, MD', now() - INTERVAL '9 years', 'Duane Reade - Riverside', 'ACTIVE', CURRENT_DATE - INTERVAL '9 years', false, 'system', 'system'),
    (v_tenant_id, v_pat6, 'Crestor',       'Rosuvastatin calcium', '20 mg', 'tablet', 'Take 1 tablet by mouth once daily at bedtime', 30, 5, 'Dr. Kevin Torres, MD', now() - INTERVAL '8 years', 'Duane Reade - Riverside', 'ACTIVE', CURRENT_DATE - INTERVAL '8 years', false, 'system', 'system'),
    -- Emma Davis
    (v_tenant_id, v_pat7, 'Qvar RediHaler','Beclomethasone dipropionate','80 mcg/actuation','inhaler','Inhale 1 puff twice daily for maintenance', 1, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '4 years', 'CVS Pharmacy - Montague St', 'ACTIVE', CURRENT_DATE - INTERVAL '4 years', false, 'system', 'system'),
    (v_tenant_id, v_pat7, 'Proventil HFA', 'Albuterol sulfate',   '90 mcg/actuation','inhaler','Inhale 2 puffs every 4-6 hours as needed for wheezing', 1, 2, 'Dr. Emily Chen, MD', now() - INTERVAL '5 years', 'CVS Pharmacy - Montague St', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years', false, 'system', 'system'),
    -- William Park
    (v_tenant_id, v_pat8, 'Lantus',        'Insulin glargine',    '100 units/mL','injection','Inject 24 units subcutaneously at bedtime', 10, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '22 years', 'Walgreens - Flatbush', 'ACTIVE', CURRENT_DATE - INTERVAL '22 years', false, 'system', 'system'),
    (v_tenant_id, v_pat8, 'Humalog',       'Insulin lispro',      '100 units/mL','injection','Inject per sliding scale subcutaneously with meals', 10, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '22 years', 'Walgreens - Flatbush', 'ACTIVE', CURRENT_DATE - INTERVAL '22 years', false, 'system', 'system'),
    (v_tenant_id, v_pat8, 'Lyrica',        'Pregabalin',           '75 mg', 'capsule','Take 1 capsule by mouth twice daily for neuropathic pain', 60, 3, 'Dr. Emily Chen, MD', now() - INTERVAL '5 years', 'Walgreens - Flatbush', 'ACTIVE', CURRENT_DATE - INTERVAL '5 years', false, 'system', 'system'),
    -- Catherine O'Brien
    (v_tenant_id, v_pat9, 'Prolia',        'Denosumab',            '60 mg/mL','injection','Inject 60 mg subcutaneously once every 6 months', 1, 1, 'Dr. Kevin Torres, MD', now() - INTERVAL '3 years', 'Rite Aid - E 67th', 'ACTIVE', CURRENT_DATE - INTERVAL '3 years', false, 'system', 'system'),
    (v_tenant_id, v_pat9, 'Arimidex',      'Anastrozole',          '1 mg',  'tablet','Take 1 tablet by mouth once daily', 30, 5, 'Dr. Kevin Torres, MD', now() - INTERVAL '7 years', 'Rite Aid - E 67th', 'ACTIVE', CURRENT_DATE - INTERVAL '7 years', false, 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 10. APPOINTMENTS — TODAY (15)
--     Spread 08:00–17:00 across Dr. Chen and Dr. Torres
-- ---------------------------------------------------------------------------
  INSERT INTO appointments (uuid, tenant_id, patient_id, provider_id, location_id,
                            room_id, type, status, date, start_time, end_time,
                            duration, reason, telehealth, intake_completed,
                            insurance_verified, created_by, modified_by)
  VALUES
    -- Dr. Emily Chen — Downtown
    ('60000000-0000-0000-0000-000000000001',
     v_tenant_id, v_pat2, v_provider_chen, v_loc_downtown,
     v_room_exam1, 'follow_up', 'completed', CURRENT_DATE,
     '08:00', '08:30', 30,
     'COPD follow-up — review spirometry results and adjust Symbicort dosage',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000002',
     v_tenant_id, v_pat1, v_provider_chen, v_loc_downtown,
     v_room_exam2, 'follow_up', 'completed', CURRENT_DATE,
     '08:30', '09:00', 30,
     'Diabetes management — A1c results review, medication adjustment',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000003',
     v_tenant_id, v_pat8, v_provider_chen, v_loc_downtown,
     v_room_exam1, 'follow_up', 'completed', CURRENT_DATE,
     '09:00', '09:30', 30,
     'T1DM — pump settings review, CGM data download',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000004',
     v_tenant_id, v_pat3, v_provider_chen, v_loc_downtown,
     v_room_exam3, 'follow_up', 'in_progress', CURRENT_DATE,
     '09:30', '10:00', 30,
     'OB follow-up — 24 week visit, BP monitoring, anatomy scan results',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000005',
     v_tenant_id, v_pat7, v_provider_chen, v_loc_downtown,
     NULL, 'follow_up', 'in_room', CURRENT_DATE,
     '10:00', '10:30', 30,
     'Asthma — seasonal exacerbation, peak flow review',
     false, true, true, 'system', 'system'),

    -- Lunch break block — no patient
    ('60000000-0000-0000-0000-000000000006',
     v_tenant_id, v_pat1, v_provider_chen, v_loc_downtown,
     NULL, 'follow_up', 'no_show', CURRENT_DATE,
     '11:00', '11:30', 30,
     'HTN — medication refill, blood pressure check',
     false, false, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000007',
     v_tenant_id, v_pat10, v_provider_chen, v_loc_downtown,
     NULL, 'annual_wellness', 'arrived', CURRENT_DATE,
     '13:30', '14:00', 30,
     'Annual wellness visit — 33M, preventive screening',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000008',
     v_tenant_id, v_pat3, v_provider_chen, v_loc_downtown,
     NULL, 'telehealth', 'confirmed', CURRENT_DATE,
     '14:30', '15:00', 30,
     'Telehealth — gestational HTN check-in, BP log review',
     true, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000009',
     v_tenant_id, v_pat8, v_provider_chen, v_loc_downtown,
     NULL, 'new_patient', 'scheduled', CURRENT_DATE,
     '15:30', '16:15', 45,
     'New patient — referred from endocrinology for primary care co-management',
     false, false, false, 'system', 'system'),

    -- Dr. Kevin Torres — Midtown
    ('60000000-0000-0000-0000-000000000010',
     v_tenant_id, v_pat4, v_provider_torres, v_loc_midtown,
     v_room_examA, 'follow_up', 'completed', CURRENT_DATE,
     '08:00', '08:45', 45,
     'AFib — anticoagulation management, INR results',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000011',
     v_tenant_id, v_pat5, v_provider_torres, v_loc_midtown,
     v_room_examB, 'follow_up', 'completed', CURRENT_DATE,
     '08:45', '09:15', 30,
     'Anxiety follow-up — Lexapro response, GAD-7 score',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000012',
     v_tenant_id, v_pat6, v_provider_torres, v_loc_midtown,
     v_room_examA, 'follow_up', 'in_progress', CURRENT_DATE,
     '09:30', '10:00', 30,
     'HTN/HLD — home BP log review, lipid panel results',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000013',
     v_tenant_id, v_pat9, v_provider_torres, v_loc_midtown,
     NULL, 'follow_up', 'arrived', CURRENT_DATE,
     '10:30', '11:00', 30,
     'Oncology survivorship — annual surveillance, bone density follow-up',
     false, true, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000014',
     v_tenant_id, v_pat5, v_provider_torres, v_loc_midtown,
     NULL, 'urgent', 'scheduled', CURRENT_DATE,
     '14:00', '14:30', 30,
     'Urgent — severe migraine episode, evaluate for status migrainosus',
     false, false, true, 'system', 'system'),

    ('60000000-0000-0000-0000-000000000015',
     v_tenant_id, v_pat10, v_provider_torres, v_loc_midtown,
     NULL, 'new_patient', 'confirmed', CURRENT_DATE,
     '15:00', '15:45', 45,
     'New patient — annual physical, wants primary care physician',
     false, false, false, 'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 11. APPOINTMENTS — PAST 30 DAYS (20 completed)
-- ---------------------------------------------------------------------------
  INSERT INTO appointments (tenant_id, patient_id, provider_id, location_id,
                            type, status, date, start_time, end_time, duration,
                            reason, intake_completed, insurance_verified,
                            created_by, modified_by)
  VALUES
    (v_tenant_id, v_pat1,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '1 day',   '09:00', '09:30', 30, 'Diabetes + HTN follow-up',             true, true, 'system', 'system'),
    (v_tenant_id, v_pat2,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '2 days',  '10:00', '10:30', 30, 'COPD exacerbation — acute visit',      true, true, 'system', 'system'),
    (v_tenant_id, v_pat4,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '3 days',  '08:30', '09:15', 45, 'AFib, rate control, Eliquis dosing',   true, true, 'system', 'system'),
    (v_tenant_id, v_pat5,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '5 days',  '11:00', '11:30', 30, 'Anxiety — medication check',           true, true, 'system', 'system'),
    (v_tenant_id, v_pat6,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '7 days',  '09:30', '10:00', 30, 'HTN — blood pressure elevated',        true, true, 'system', 'system'),
    (v_tenant_id, v_pat8,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '7 days',  '13:00', '13:30', 30, 'T1DM — A1c target review',             true, true, 'system', 'system'),
    (v_tenant_id, v_pat9,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '10 days', '10:00', '10:30', 30, 'Survivorship — side effects review',   true, true, 'system', 'system'),
    (v_tenant_id, v_pat3,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '10 days', '14:00', '14:30', 30, 'OB — 20 week visit',                   true, true, 'system', 'system'),
    (v_tenant_id, v_pat7,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '12 days', '09:00', '09:30', 30, 'Asthma — spring pollen season',        true, true, 'system', 'system'),
    (v_tenant_id, v_pat1,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '14 days', '08:30', '09:00', 30, 'Ozempic titration — first month',      true, true, 'system', 'system'),
    (v_tenant_id, v_pat2,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '14 days', '11:30', '12:00', 30, 'CHF — weight monitoring',              true, true, 'system', 'system'),
    (v_tenant_id, v_pat4,  v_provider_torres, v_loc_midtown,  'telehealth',     'completed', CURRENT_DATE - INTERVAL '17 days', '15:00', '15:30', 30, 'Telehealth — CKD diet counseling',     true, true, 'system', 'system'),
    (v_tenant_id, v_pat5,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '18 days', '10:30', '11:00', 30, 'Migraine — Imitrex effectiveness',     true, true, 'system', 'system'),
    (v_tenant_id, v_pat6,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '21 days', '09:00', '09:30', 30, 'Lipid panel results — statin review',  true, true, 'system', 'system'),
    (v_tenant_id, v_pat10, v_provider_torres, v_loc_midtown,  'annual_wellness','completed', CURRENT_DATE - INTERVAL '21 days', '14:00', '14:45', 45, 'Annual wellness — 33M preventive',     true, true, 'system', 'system'),
    (v_tenant_id, v_pat8,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '21 days', '08:00', '08:30', 30, 'Neuropathy — Lyrica dose assessment',  true, true, 'system', 'system'),
    (v_tenant_id, v_pat9,  v_provider_torres, v_loc_midtown,  'follow_up',      'completed', CURRENT_DATE - INTERVAL '24 days', '11:00', '11:30', 30, 'Denosumab injection visit',            true, true, 'system', 'system'),
    (v_tenant_id, v_pat3,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '25 days', '13:30', '14:00', 30, 'OB — 16 week visit',                   true, true, 'system', 'system'),
    (v_tenant_id, v_pat7,  v_provider_chen,   v_loc_downtown, 'urgent',         'completed', CURRENT_DATE - INTERVAL '28 days', '15:00', '15:30', 30, 'Acute asthma attack — same-day',       true, true, 'system', 'system'),
    (v_tenant_id, v_pat1,  v_provider_chen,   v_loc_downtown, 'follow_up',      'completed', CURRENT_DATE - INTERVAL '30 days', '09:30', '10:00', 30, 'Initial Ozempic consult + Rx',         true, true, 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 12. ENCOUNTERS (5 — using today's appointments for cross-reference)
-- ---------------------------------------------------------------------------
DECLARE
  v_apt1_id   BIGINT;  -- apt 001: Marcus Rivera, Chen, today, completed
  v_apt2_id   BIGINT;  -- apt 002: Sarah Johnson, Chen, today, completed
  v_apt10_id  BIGINT;  -- apt 010: James Thompson, Torres, today, completed
  v_enc1      BIGINT;
  v_enc2      BIGINT;
  v_enc3      BIGINT;
  v_enc4      BIGINT;
  v_enc5      BIGINT;
BEGIN
  SELECT id INTO v_apt1_id  FROM appointments WHERE uuid = '60000000-0000-0000-0000-000000000001';
  SELECT id INTO v_apt2_id  FROM appointments WHERE uuid = '60000000-0000-0000-0000-000000000002';
  SELECT id INTO v_apt10_id FROM appointments WHERE uuid = '60000000-0000-0000-0000-000000000010';

  -- Signed encounter 1: Marcus Rivera, 3 days ago (COPD exacerbation)
  INSERT INTO encounters (uuid, tenant_id, patient_id, provider_id, date, type, status,
                          chief_complaint, hpi_text, examination, em_code, em_level,
                          signed_at, signed_by, created_by, modified_by)
  VALUES ('70000000-0000-0000-0000-000000000001',
          v_tenant_id, v_pat2, v_provider_chen,
          CURRENT_DATE - INTERVAL '3 days',
          'follow_up', 'SIGNED',
          'Increased shortness of breath and productive cough x 3 days',
          'Mr. Rivera is a 62-year-old male with known COPD (GOLD Stage III) and CHF (EF 35%) presenting with worsening dyspnea and productive cough with yellow sputum over the past 3 days. He reports using his rescue inhaler (albuterol) 6-8 times per day, up from his baseline of 1-2 times. He denies fever, chills, or chest pain. He has been adherent with his Symbicort. Review of his home weight log shows a 2 lb weight gain over the past week.',
          'General: Mild respiratory distress, speaking in short sentences. Respiratory: Decreased breath sounds bilaterally at bases, expiratory wheezing diffusely, prolonged expiratory phase. Cardiac: Regular rate and rhythm, 1+ pitting edema bilateral ankles. O2 sat 93% on room air.',
          'Z99.81', 4,
          now() - INTERVAL '3 days', 'Dr. Emily Chen, MD',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

  SELECT id INTO v_enc1 FROM encounters WHERE uuid = '70000000-0000-0000-0000-000000000001';

  -- Assessment/Plans for encounter 1
  INSERT INTO assessment_plans (tenant_id, encounter_id, diagnosis, icd_code, plan, sort_order, created_by, modified_by)
  VALUES
    (v_tenant_id, v_enc1, 'COPD Exacerbation, Acute', 'J44.1',
     'Increase Symbicort to 2 puffs BID for 2 weeks; add oral prednisone 40 mg daily x 5 days; albuterol nebulization in office today; chest X-ray ordered to rule out pneumonia; follow up in 1 week or sooner if worsening; O2 sat target >94%.',
     1, 'system', 'system'),
    (v_tenant_id, v_enc1, 'Chronic Heart Failure — volume overload', 'I50.20',
     'Increase furosemide to 80 mg daily for 5 days, then return to 40 mg; daily weight monitoring; strict fluid restriction 1.5L/day; will order BNP and CMP; return to clinic in 1 week.',
     2, 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Signed encounter 2: Sarah Johnson, 1 week ago (Diabetes management)
  INSERT INTO encounters (uuid, tenant_id, patient_id, provider_id, date, type, status,
                          chief_complaint, hpi_text, examination, em_code, em_level,
                          signed_at, signed_by, created_by, modified_by)
  VALUES ('70000000-0000-0000-0000-000000000002',
          v_tenant_id, v_pat1, v_provider_chen,
          CURRENT_DATE - INTERVAL '7 days',
          'follow_up', 'SIGNED',
          'Diabetes management — A1c results and Ozempic one-month check',
          'Ms. Johnson is a 44-year-old female with T2DM, HTN, and obesity presenting for A1c review. She was started on Ozempic 0.5 mg weekly one month ago and is tolerating it well with mild nausea for the first two weeks that has since resolved. She reports improved appetite control and has lost 4 lbs. Home glucose logs show fasting BG 110-130, post-meal 140-165. She is adherent with all medications. BP at home ranging 125-135/80-85.',
          'BP 128/82 mmHg, HR 72 bpm. BMI 31.1 (down from 31.4). Abdomen: obese, soft, non-tender. No edema. Alert and oriented x3, in no acute distress.',
          'Z79.84', 3,
          now() - INTERVAL '7 days', 'Dr. Emily Chen, MD',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

  SELECT id INTO v_enc2 FROM encounters WHERE uuid = '70000000-0000-0000-0000-000000000002';

  INSERT INTO assessment_plans (tenant_id, encounter_id, diagnosis, icd_code, plan, sort_order, created_by, modified_by)
  VALUES
    (v_tenant_id, v_enc2, 'Type 2 Diabetes Mellitus — improving', 'E11.9',
     'A1c 7.4% (down from 8.1%). Continue all diabetes medications. Increase Ozempic to 1 mg weekly. Continue CGM. Repeat A1c in 3 months. Refer to diabetes education for carbohydrate counting refresher. Ophthalmology referral for annual diabetic eye exam.',
     1, 'system', 'system'),
    (v_tenant_id, v_enc2, 'Essential Hypertension — controlled', 'I10',
     'BP well controlled on current regimen. Continue Lisinopril 20 mg. Patient to continue home BP log. Goal <130/80.',
     2, 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Signed encounter 3: James Thompson, 5 days ago (AFib management)
  INSERT INTO encounters (uuid, tenant_id, patient_id, provider_id, date, type, status,
                          chief_complaint, hpi_text, examination, em_code, em_level,
                          signed_at, signed_by, created_by, modified_by)
  VALUES ('70000000-0000-0000-0000-000000000003',
          v_tenant_id, v_pat4, v_provider_torres,
          CURRENT_DATE - INTERVAL '5 days',
          'follow_up', 'SIGNED',
          'AFib rate control check and CKD lab review',
          'Mr. Thompson is a 71-year-old male with persistent AFib, CKD Stage 3b, and HTN presenting for quarterly follow-up. He has been on Eliquis 5 mg BID and Carvedilol 12.5 mg BID. He reports occasional palpitations but no syncope, pre-syncope, chest pain, or stroke symptoms. CMP from last week shows Cr 2.1 (stable), eGFR 38, K+ 4.8. CHA2DS2-VASc score 5 — anticoagulation appropriate.',
          'BP 138/86 mmHg, HR 74 bpm, irregular. O2 sat 97%. Lungs clear. No edema. Alert and oriented x3.',
          'I48.11', 4,
          now() - INTERVAL '5 days', 'Dr. Kevin Torres, MD',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

  SELECT id INTO v_enc3 FROM encounters WHERE uuid = '70000000-0000-0000-0000-000000000003';

  INSERT INTO assessment_plans (tenant_id, encounter_id, diagnosis, icd_code, plan, sort_order, created_by, modified_by)
  VALUES
    (v_tenant_id, v_enc3, 'Atrial Fibrillation — rate controlled', 'I48.11',
     'Adequate ventricular rate control. Continue Carvedilol 12.5 mg BID. Continue Eliquis 5 mg BID — dose appropriate given CrCl > 25. Schedule 24-hr Holter in 3 months. Echo ordered.',
     1, 'system', 'system'),
    (v_tenant_id, v_enc3, 'CKD Stage 3b — stable', 'N18.32',
     'Cr 2.1, eGFR 38 — stable. Continue current medications. Renal diet counseling reinforced. Nephrology consult if eGFR falls below 30. Repeat CMP in 3 months.',
     2, 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Draft encounter: Sarah Johnson, TODAY (from completed morning apt)
  INSERT INTO encounters (uuid, tenant_id, patient_id, provider_id, appointment_id, date,
                          type, status, chief_complaint, hpi_text,
                          created_by, modified_by)
  VALUES ('70000000-0000-0000-0000-000000000004',
          v_tenant_id, v_pat1, v_provider_chen, v_apt2_id,
          CURRENT_DATE,
          'follow_up', 'OPEN',
          'Diabetes follow-up — A1c recheck, Ozempic 1mg titration response',
          'Ms. Johnson returns for follow-up after Ozempic titration to 1 mg. Reports continued weight loss — down 8 lbs total. Nausea minimal. Blood sugars improved.',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

  -- Draft encounter: Marcus Rivera, TODAY (from completed morning apt)
  INSERT INTO encounters (uuid, tenant_id, patient_id, provider_id, appointment_id, date,
                          type, status, chief_complaint, hpi_text,
                          created_by, modified_by)
  VALUES ('70000000-0000-0000-0000-000000000005',
          v_tenant_id, v_pat2, v_provider_chen, v_apt1_id,
          CURRENT_DATE,
          'follow_up', 'OPEN',
          'COPD — spirometry review, steroid course complete',
          'Mr. Rivera completed his prednisone course. Shortness of breath significantly improved. Using albuterol 2x/day. Weight back to baseline.',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

  SELECT id INTO v_enc4 FROM encounters WHERE uuid = '70000000-0000-0000-0000-000000000004';
  SELECT id INTO v_enc5 FROM encounters WHERE uuid = '70000000-0000-0000-0000-000000000005';

-- ---------------------------------------------------------------------------
-- 13. VITAL SIGNS (for today's seen patients — enc4 and enc5 + standalone)
-- ---------------------------------------------------------------------------
  INSERT INTO vital_signs (tenant_id, patient_id, encounter_id,
                           systolic, diastolic, heart_rate, temperature,
                           o2_saturation, weight, height, bmi, pain_scale,
                           respiratory_rate, recorded_at, recorded_by,
                           created_by, modified_by)
  VALUES
    -- Sarah Johnson (enc4 — today)
    (v_tenant_id, v_pat1, v_enc4,
     126, 80, 70, 98.4, 98, 196.0, 65.0, 32.6, 0, 16,
     CURRENT_DATE + TIME '09:15:00', 'Sarah Thompson, RN', 'system', 'system'),

    -- Marcus Rivera (enc5 — today)
    (v_tenant_id, v_pat2, v_enc5,
     132, 84, 88, 98.2, 95, 218.0, 70.0, 31.3, 2, 20,
     CURRENT_DATE + TIME '08:15:00', 'Sarah Thompson, RN', 'system', 'system'),

    -- James Thompson (enc3 — 5 days ago)
    (v_tenant_id, v_pat4, v_enc3,
     138, 86, 74, 98.6, 97, 182.0, 69.0, 26.9, 1, 16,
     CURRENT_DATE - INTERVAL '5 days' + TIME '08:45:00', 'Sarah Thompson, RN', 'system', 'system'),

    -- Linda Chen — today's in_progress apt (no encounter yet)
    (v_tenant_id, v_pat3, NULL,
     118, 76, 82, 98.2, 99, 148.0, 63.0, 26.2, 0, 18,
     CURRENT_DATE + TIME '09:45:00', 'Sarah Thompson, RN', 'system', 'system'),

    -- Emma Davis — today, in_room
    (v_tenant_id, v_pat7, NULL,
     96, 62, 108, 98.8, 96, 62.0, 50.0, 17.2, 3, 22,
     CURRENT_DATE + TIME '10:10:00', 'Sarah Thompson, RN', 'system', 'system'),

    -- William Park — enc4 linked above; additional standalone from 7 days ago
    (v_tenant_id, v_pat8, NULL,
     134, 82, 76, 98.4, 98, 174.0, 70.0, 25.0, 0, 16,
     CURRENT_DATE - INTERVAL '7 days' + TIME '13:15:00', 'Sarah Thompson, RN', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 14. LAB ORDERS AND RESULTS (10 results)
-- ---------------------------------------------------------------------------
DECLARE
  v_lo1 BIGINT; v_lo2 BIGINT; v_lo3 BIGINT; v_lo4 BIGINT; v_lo5 BIGINT;
BEGIN
  -- Lab order 1: Sarah Johnson — Metabolic panel (3 days ago, resulted)
  INSERT INTO lab_orders (uuid, tenant_id, patient_id, provider_id, facility,
                          priority, status, ordered_at, resulted_at, indication,
                          created_by, modified_by)
  VALUES ('80000000-0000-0000-0000-000000000001',
          v_tenant_id, v_pat1, v_provider_chen, 'Quest Diagnostics',
          'ROUTINE', 'RESULTED',
          now() - INTERVAL '5 days', now() - INTERVAL '3 days',
          'T2DM monitoring — quarterly labs',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_lo1 FROM lab_orders WHERE uuid = '80000000-0000-0000-0000-000000000001';

  INSERT INTO lab_results (tenant_id, order_id, patient_id, test_name, value, unit,
                           reference_range, status, loinc_code, result_date,
                           reviewed_by, reviewed_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_lo1, v_pat1, 'Hemoglobin A1c',            '7.4',  '%',     '< 5.7',        'FINAL', '4548-4',  now() - INTERVAL '3 days', 'Dr. Emily Chen, MD', now() - INTERVAL '2 days', 'system', 'system'),
    (v_tenant_id, v_lo1, v_pat1, 'Glucose, Fasting',          '112',  'mg/dL', '70-99',         'FINAL', '1558-6',  now() - INTERVAL '3 days', 'Dr. Emily Chen, MD', now() - INTERVAL '2 days', 'system', 'system'),
    (v_tenant_id, v_lo1, v_pat1, 'eGFR',                      '72',   'mL/min/1.73m2','> 60',  'FINAL', '62238-1', now() - INTERVAL '3 days', 'Dr. Emily Chen, MD', now() - INTERVAL '2 days', 'system', 'system'),
    (v_tenant_id, v_lo1, v_pat1, 'Potassium',                 '4.2',  'mEq/L', '3.5-5.1',      'FINAL', '2823-3',  now() - INTERVAL '3 days', 'Dr. Emily Chen, MD', now() - INTERVAL '2 days', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Lab order 2: Sarah Johnson — Lipid Panel (10 days ago)
  INSERT INTO lab_orders (uuid, tenant_id, patient_id, provider_id, facility,
                          priority, status, ordered_at, resulted_at, indication,
                          created_by, modified_by)
  VALUES ('80000000-0000-0000-0000-000000000002',
          v_tenant_id, v_pat1, v_provider_chen, 'Quest Diagnostics',
          'ROUTINE', 'RESULTED',
          now() - INTERVAL '14 days', now() - INTERVAL '10 days',
          'Annual lipid monitoring on statin therapy',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_lo2 FROM lab_orders WHERE uuid = '80000000-0000-0000-0000-000000000002';

  INSERT INTO lab_results (tenant_id, order_id, patient_id, test_name, value, unit,
                           reference_range, status, loinc_code, result_date,
                           reviewed_by, reviewed_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_lo2, v_pat1, 'LDL Cholesterol',           '142',  'mg/dL', '< 100',         'FINAL', '2089-1',  now() - INTERVAL '10 days', 'Dr. Emily Chen, MD', now() - INTERVAL '9 days', 'system', 'system'),
    (v_tenant_id, v_lo2, v_pat1, 'HDL Cholesterol',           '48',   'mg/dL', '> 50',          'FINAL', '2085-9',  now() - INTERVAL '10 days', 'Dr. Emily Chen, MD', now() - INTERVAL '9 days', 'system', 'system'),
    (v_tenant_id, v_lo2, v_pat1, 'Triglycerides',             '186',  'mg/dL', '< 150',         'FINAL', '2571-8',  now() - INTERVAL '10 days', 'Dr. Emily Chen, MD', now() - INTERVAL '9 days', 'system', 'system'),
    (v_tenant_id, v_lo2, v_pat1, 'Total Cholesterol',         '228',  'mg/dL', '< 200',         'FINAL', '2093-3',  now() - INTERVAL '10 days', 'Dr. Emily Chen, MD', now() - INTERVAL '9 days', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Lab order 3: Marcus Rivera — BNP + CMP (ordered 3 days ago, pending)
  INSERT INTO lab_orders (uuid, tenant_id, patient_id, provider_id, facility,
                          priority, status, ordered_at, resulted_at, indication,
                          created_by, modified_by)
  VALUES ('80000000-0000-0000-0000-000000000003',
          v_tenant_id, v_pat2, v_provider_chen, 'Quest Diagnostics',
          'STAT', 'PENDING',
          now() - INTERVAL '3 days', NULL,
          'CHF evaluation — COPD exacerbation',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_lo3 FROM lab_orders WHERE uuid = '80000000-0000-0000-0000-000000000003';

  -- Lab order 4: James Thompson — CMP (5 days ago, resulted)
  INSERT INTO lab_orders (uuid, tenant_id, patient_id, provider_id, facility,
                          priority, status, ordered_at, resulted_at, indication,
                          created_by, modified_by)
  VALUES ('80000000-0000-0000-0000-000000000004',
          v_tenant_id, v_pat4, v_provider_torres, 'Quest Diagnostics',
          'ROUTINE', 'RESULTED',
          now() - INTERVAL '7 days', now() - INTERVAL '5 days',
          'CKD monitoring — quarterly CMP',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_lo4 FROM lab_orders WHERE uuid = '80000000-0000-0000-0000-000000000004';

  INSERT INTO lab_results (tenant_id, order_id, patient_id, test_name, value, unit,
                           reference_range, status, loinc_code, result_date,
                           reviewed_by, reviewed_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_lo4, v_pat4, 'Creatinine, Serum',         '2.1',  'mg/dL', '0.7-1.3',      'FINAL', '2160-0',  now() - INTERVAL '5 days', 'Dr. Kevin Torres, MD', now() - INTERVAL '4 days', 'system', 'system'),
    (v_tenant_id, v_lo4, v_pat4, 'eGFR',                      '38',   'mL/min/1.73m2','> 60',  'FINAL', '62238-1', now() - INTERVAL '5 days', 'Dr. Kevin Torres, MD', now() - INTERVAL '4 days', 'system', 'system'),
    (v_tenant_id, v_lo4, v_pat4, 'Potassium',                 '4.8',  'mEq/L', '3.5-5.1',      'FINAL', '2823-3',  now() - INTERVAL '5 days', 'Dr. Kevin Torres, MD', now() - INTERVAL '4 days', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Lab order 5: William Park — TSH (30 days ago, resulted)
  INSERT INTO lab_orders (uuid, tenant_id, patient_id, provider_id, facility,
                          priority, status, ordered_at, resulted_at, indication,
                          created_by, modified_by)
  VALUES ('80000000-0000-0000-0000-000000000005',
          v_tenant_id, v_pat8, v_provider_chen, 'Quest Diagnostics',
          'ROUTINE', 'RESULTED',
          now() - INTERVAL '33 days', now() - INTERVAL '30 days',
          'T1DM screening — thyroid function, CBC',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_lo5 FROM lab_orders WHERE uuid = '80000000-0000-0000-0000-000000000005';

  INSERT INTO lab_results (tenant_id, order_id, patient_id, test_name, value, unit,
                           reference_range, status, loinc_code, result_date,
                           reviewed_by, reviewed_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_lo5, v_pat8, 'TSH',                       '2.4',  'mIU/L', '0.4-4.0',      'FINAL', '3016-3',  now() - INTERVAL '30 days', 'Dr. Emily Chen, MD', now() - INTERVAL '29 days', 'system', 'system'),
    (v_tenant_id, v_lo5, v_pat8, 'CBC — WBC',                 '6.8',  'K/uL',  '4.0-11.0',     'FINAL', '6690-2',  now() - INTERVAL '30 days', 'Dr. Emily Chen, MD', now() - INTERVAL '29 days', 'system', 'system'),
    (v_tenant_id, v_lo5, v_pat8, 'CBC — Hemoglobin',          '14.2', 'g/dL',  '13.5-17.5',    'FINAL', '718-7',   now() - INTERVAL '30 days', 'Dr. Emily Chen, MD', now() - INTERVAL '29 days', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 15. ENCOUNTERS + CLAIMS FOR BILLING
--     We create 8 claims tied to 8 of the past completed encounters.
--     We create mini-encounters for the past apts that need them.
-- ---------------------------------------------------------------------------
DECLARE
  v_bill_enc1 BIGINT; v_bill_enc2 BIGINT; v_bill_enc3 BIGINT; v_bill_enc4 BIGINT;
  v_bill_enc5 BIGINT; v_bill_enc6 BIGINT; v_bill_enc7 BIGINT; v_bill_enc8 BIGINT;
  v_claim1 BIGINT; v_claim2 BIGINT; v_claim3 BIGINT; v_claim4 BIGINT;
  v_claim5 BIGINT; v_claim6 BIGINT; v_claim7 BIGINT; v_claim8 BIGINT;
BEGIN
  -- Create simple signed encounters for billing
  INSERT INTO encounters (tenant_id, patient_id, provider_id, date, type, status,
                          chief_complaint, em_code, em_level, signed_at, signed_by,
                          created_by, modified_by)
  VALUES
    (v_tenant_id, v_pat1,  v_provider_chen,   CURRENT_DATE - INTERVAL '30 days', 'follow_up', 'SIGNED', 'Diabetes + HTN check, Ozempic initiation', 'Z79.84', 4, now() - INTERVAL '30 days', 'Dr. Emily Chen, MD', 'system', 'system'),
    (v_tenant_id, v_pat6,  v_provider_torres, CURRENT_DATE - INTERVAL '21 days', 'follow_up', 'SIGNED', 'HTN/HLD management',                       'I10',    3, now() - INTERVAL '21 days', 'Dr. Kevin Torres, MD', 'system', 'system'),
    (v_tenant_id, v_pat10, v_provider_torres, CURRENT_DATE - INTERVAL '21 days', 'annual_wellness', 'SIGNED', 'Annual wellness, preventive',          'Z00.00', 5, now() - INTERVAL '21 days', 'Dr. Kevin Torres, MD', 'system', 'system'),
    (v_tenant_id, v_pat2,  v_provider_chen,   CURRENT_DATE - INTERVAL '14 days', 'follow_up', 'SIGNED', 'CHF weight check',                         'I50.20', 3, now() - INTERVAL '14 days', 'Dr. Emily Chen, MD', 'system', 'system'),
    (v_tenant_id, v_pat8,  v_provider_chen,   CURRENT_DATE - INTERVAL '21 days', 'follow_up', 'SIGNED', 'T1DM neuropathy',                          'E10.40', 3, now() - INTERVAL '21 days', 'Dr. Emily Chen, MD', 'system', 'system'),
    (v_tenant_id, v_pat5,  v_provider_torres, CURRENT_DATE - INTERVAL '18 days', 'follow_up', 'SIGNED', 'Migraine management',                      'G43.009',3, now() - INTERVAL '18 days', 'Dr. Kevin Torres, MD', 'system', 'system'),
    (v_tenant_id, v_pat9,  v_provider_torres, CURRENT_DATE - INTERVAL '10 days', 'follow_up', 'SIGNED', 'Survivorship follow-up',                   'Z85.3',  4, now() - INTERVAL '10 days', 'Dr. Kevin Torres, MD', 'system', 'system'),
    (v_tenant_id, v_pat7,  v_provider_chen,   CURRENT_DATE - INTERVAL '28 days', 'urgent',    'SIGNED', 'Acute asthma',                             'J45.20', 4, now() - INTERVAL '28 days', 'Dr. Emily Chen, MD', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Grab the newly inserted encounter IDs by unique combination
  SELECT id INTO v_bill_enc1 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat1  AND date = CURRENT_DATE - INTERVAL '30 days' AND type = 'follow_up' AND status = 'SIGNED' LIMIT 1;
  SELECT id INTO v_bill_enc2 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat6  AND date = CURRENT_DATE - INTERVAL '21 days' LIMIT 1;
  SELECT id INTO v_bill_enc3 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat10 AND date = CURRENT_DATE - INTERVAL '21 days' LIMIT 1;
  SELECT id INTO v_bill_enc4 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat2  AND date = CURRENT_DATE - INTERVAL '14 days' LIMIT 1;
  SELECT id INTO v_bill_enc5 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat8  AND date = CURRENT_DATE - INTERVAL '21 days' LIMIT 1;
  SELECT id INTO v_bill_enc6 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat5  AND date = CURRENT_DATE - INTERVAL '18 days' LIMIT 1;
  SELECT id INTO v_bill_enc7 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat9  AND date = CURRENT_DATE - INTERVAL '10 days' LIMIT 1;
  SELECT id INTO v_bill_enc8 FROM encounters WHERE tenant_id = v_tenant_id AND patient_id = v_pat7  AND date = CURRENT_DATE - INTERVAL '28 days' LIMIT 1;

  -- CLAIMS (8)
  INSERT INTO claims (uuid, tenant_id, patient_id, encounter_id, provider_id,
                      date_of_service, payer_name, payer_id, total_charge,
                      allowed_amount, paid_amount, patient_responsibility,
                      status, submitted_at, paid_at, denial_reason, denial_code,
                      created_by, modified_by)
  VALUES
    -- Claim 1: PAID — Sarah Johnson, Blue Cross
    ('90000000-0000-0000-0000-000000000001',
     v_tenant_id, v_pat1, v_bill_enc1, v_provider_chen,
     CURRENT_DATE - INTERVAL '30 days',
     'Blue Cross Blue Shield', 'BCBS-NY', 350.00, 280.00, 250.00, 30.00,
     'PAID', now() - INTERVAL '28 days', now() - INTERVAL '18 days',
     NULL, NULL, 'system', 'system'),

    -- Claim 2: PAID — Robert Martinez, Blue Cross
    ('90000000-0000-0000-0000-000000000002',
     v_tenant_id, v_pat6, v_bill_enc2, v_provider_torres,
     CURRENT_DATE - INTERVAL '21 days',
     'Blue Cross Blue Shield', 'BCBS-NY', 195.00, 156.00, 126.00, 30.00,
     'PAID', now() - INTERVAL '19 days', now() - INTERVAL '10 days',
     NULL, NULL, 'system', 'system'),

    -- Claim 3: SUBMITTED — Michael Brown, Self-Pay
    ('90000000-0000-0000-0000-000000000003',
     v_tenant_id, v_pat10, v_bill_enc3, v_provider_torres,
     CURRENT_DATE - INTERVAL '21 days',
     'Self-Pay', 'SELF', 295.00, NULL, NULL, 295.00,
     'SUBMITTED', now() - INTERVAL '19 days', NULL,
     NULL, NULL, 'system', 'system'),

    -- Claim 4: READY — Marcus Rivera, Medicare
    ('90000000-0000-0000-0000-000000000004',
     v_tenant_id, v_pat2, v_bill_enc4, v_provider_chen,
     CURRENT_DATE - INTERVAL '14 days',
     'Medicare', 'MCR-00001', 195.00, NULL, NULL, 20.00,
     'READY', NULL, NULL,
     NULL, NULL, 'system', 'system'),

    -- Claim 5: DENIED — William Park, Blue Cross (CO-4 missing modifier)
    ('90000000-0000-0000-0000-000000000005',
     v_tenant_id, v_pat8, v_bill_enc5, v_provider_chen,
     CURRENT_DATE - INTERVAL '21 days',
     'Blue Cross Blue Shield', 'BCBS-NY', 195.00, NULL, NULL, NULL,
     'DENIED', now() - INTERVAL '19 days', NULL,
     'Missing required modifier for evaluation and management service billed with procedure on same day. Resubmit with modifier 25.',
     'CO-4', 'system', 'system'),

    -- Claim 6: SUBMITTED — Aisha Williams, Cigna
    ('90000000-0000-0000-0000-000000000006',
     v_tenant_id, v_pat5, v_bill_enc6, v_provider_torres,
     CURRENT_DATE - INTERVAL '18 days',
     'Cigna', 'CGN-00001', 195.00, NULL, NULL, 35.00,
     'SUBMITTED', now() - INTERVAL '16 days', NULL,
     NULL, NULL, 'system', 'system'),

    -- Claim 7: PAID — Catherine O'Brien, Medicare
    ('90000000-0000-0000-0000-000000000007',
     v_tenant_id, v_pat9, v_bill_enc7, v_provider_torres,
     CURRENT_DATE - INTERVAL '10 days',
     'Medicare', 'MCR-00001', 250.00, 200.00, 180.00, 20.00,
     'PAID', now() - INTERVAL '8 days', now() - INTERVAL '2 days',
     NULL, NULL, 'system', 'system'),

    -- Claim 8: DENIED — Emma Davis, Aetna (CO-50 not medically necessary)
    ('90000000-0000-0000-0000-000000000008',
     v_tenant_id, v_pat7, v_bill_enc8, v_provider_chen,
     CURRENT_DATE - INTERVAL '28 days',
     'Aetna', 'AETNA-001', 145.00, NULL, NULL, NULL,
     'DENIED', now() - INTERVAL '26 days', NULL,
     'Service not medically necessary based on clinical documentation submitted. Peer-to-peer review available within 30 days.',
     'CO-50', 'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;

  -- Capture claim PKs
  SELECT id INTO v_claim1 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000001';
  SELECT id INTO v_claim2 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000002';
  SELECT id INTO v_claim3 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000003';
  SELECT id INTO v_claim4 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000004';
  SELECT id INTO v_claim5 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000005';
  SELECT id INTO v_claim6 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000006';
  SELECT id INTO v_claim7 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000007';
  SELECT id INTO v_claim8 FROM claims WHERE uuid = '90000000-0000-0000-0000-000000000008';

  -- CLAIM LINES
  INSERT INTO claim_lines (tenant_id, claim_id, cpt_code, description, modifier, units, charge, created_by, modified_by)
  VALUES
    (v_tenant_id, v_claim1, '99214', 'Office or other outpatient visit, moderate complexity', NULL, 1, 350.00, 'system', 'system'),
    (v_tenant_id, v_claim2, '99213', 'Office or other outpatient visit, low-moderate complexity', NULL, 1, 195.00, 'system', 'system'),
    (v_tenant_id, v_claim3, '99395', 'Periodic comprehensive preventive medicine, 18-39 years', NULL, 1, 295.00, 'system', 'system'),
    (v_tenant_id, v_claim4, '99213', 'Office or other outpatient visit, low-moderate complexity', NULL, 1, 195.00, 'system', 'system'),
    (v_tenant_id, v_claim5, '99213', 'Office or other outpatient visit, low-moderate complexity', NULL, 1, 195.00, 'system', 'system'),
    (v_tenant_id, v_claim6, '99213', 'Office or other outpatient visit, low-moderate complexity', NULL, 1, 195.00, 'system', 'system'),
    (v_tenant_id, v_claim7, '99214', 'Office or other outpatient visit, moderate complexity', NULL, 1, 250.00, 'system', 'system'),
    (v_tenant_id, v_claim8, '99213', 'Office or other outpatient visit, low-moderate complexity', NULL, 1, 145.00, 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 16. MESSAGING THREADS + MESSAGES
-- ---------------------------------------------------------------------------
DECLARE
  v_thread1 BIGINT; v_thread2 BIGINT; v_thread3 BIGINT;
  v_user_chen   BIGINT;
  v_user_torres BIGINT;
  v_user_nurse  BIGINT;
  v_user_fd     BIGINT;
BEGIN
  SELECT id INTO v_user_chen   FROM users WHERE uuid = '40000000-0000-0000-0000-000000000004';
  SELECT id INTO v_user_torres FROM users WHERE uuid = '40000000-0000-0000-0000-000000000005';
  SELECT id INTO v_user_nurse  FROM users WHERE uuid = '40000000-0000-0000-0000-000000000006';
  SELECT id INTO v_user_fd     FROM users WHERE uuid = '40000000-0000-0000-0000-000000000007';

  -- Thread 1: Dr. Chen <-> Sarah Johnson (A1c discussion)
  INSERT INTO message_threads (uuid, tenant_id, subject, type, last_message_at, last_message_text, created_by, modified_by)
  VALUES ('A0000000-0000-0000-0000-000000000001',
          v_tenant_id, 'Your A1c Results Are Ready', 'patient_message',
          now() - INTERVAL '2 days',
          'You''re making great progress! Your A1c improved from 8.1% to 7.4%...',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_thread1 FROM message_threads WHERE uuid = 'A0000000-0000-0000-0000-000000000001';

  INSERT INTO messages (tenant_id, thread_id, sender_user_id, sender_name, sender_role, body, sent_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_thread1, v_user_chen, 'Dr. Emily Chen', 'provider',
     'Ms. Johnson, I wanted to share your latest lab results. Your A1c came back at 7.4%, which is down from 8.1% three months ago. This is excellent progress and reflects your hard work with the diet changes and the new Ozempic prescription. Your fasting glucose was 112 and your kidney function looks great. I have increased your Ozempic to 1 mg as we discussed. Keep up the great work and I will see you at your appointment today.',
     now() - INTERVAL '2 days', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Thread 2: Front Desk -> James Thompson (appointment reminder)
  INSERT INTO message_threads (uuid, tenant_id, subject, type, last_message_at, last_message_text, created_by, modified_by)
  VALUES ('A0000000-0000-0000-0000-000000000002',
          v_tenant_id, 'Appointment Reminder — Tomorrow at 8:00 AM', 'appointment_reminder',
          now() - INTERVAL '1 day',
          'This is a reminder for your appointment with Dr. Torres tomorrow...',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_thread2 FROM message_threads WHERE uuid = 'A0000000-0000-0000-0000-000000000002';

  INSERT INTO messages (tenant_id, thread_id, sender_user_id, sender_name, sender_role, body, sent_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_thread2, v_user_fd, 'David Kim', 'front_desk',
     'Dear Mr. Thompson, this is a courtesy reminder that you have an appointment with Dr. Kevin Torres tomorrow, ' || CURRENT_DATE::text || ', at 8:00 AM at our Midtown location (420 Lexington Ave, Suite 200). Please bring your insurance card and a list of your current medications. Please reply CONFIRM to confirm or call (212) 555-0120 to reschedule. Thank you!',
     now() - INTERVAL '1 day', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Thread 3: Nurse -> Dr. Chen (vitals concern — Emma Davis)
  INSERT INTO message_threads (uuid, tenant_id, subject, type, last_message_at, last_message_text, created_by, modified_by)
  VALUES ('A0000000-0000-0000-0000-000000000003',
          v_tenant_id, 'URGENT: Emma Davis — O2 Sat 96%, wheezing on auscultation', 'clinical_message',
          now() - INTERVAL '5 minutes',
          'Dr. Chen, Emma Davis in Exam 3 has O2 sat 96% and audible expiratory wheeze...',
          'system', 'system')
  ON CONFLICT (uuid) DO NOTHING;
  SELECT id INTO v_thread3 FROM message_threads WHERE uuid = 'A0000000-0000-0000-0000-000000000003';

  INSERT INTO messages (tenant_id, thread_id, sender_user_id, sender_name, sender_role, body, sent_at, created_by, modified_by)
  VALUES
    (v_tenant_id, v_thread3, v_user_nurse, 'Sarah Thompson, RN', 'nurse',
     'Dr. Chen — Emma Davis (PAT-10007, 8F, asthma) is in the room. Vitals: HR 108, RR 22, O2 sat 96% on room air, temp 98.8. She has audible expiratory wheeze and is using accessory muscles. Peak flow 65% predicted. Mom reports she used her rescue inhaler twice this morning without relief. She is requesting nebulization. Ready when you are.',
     now() - INTERVAL '5 minutes', 'system', 'system')
  ON CONFLICT DO NOTHING;

  -- Thread participants
  INSERT INTO thread_participants (tenant_id, thread_id, user_id, unread_count, created_by, modified_by)
  VALUES
    (v_tenant_id, v_thread1, v_user_chen, 0, 'system', 'system'),
    (v_tenant_id, v_thread2, v_user_fd,   0, 'system', 'system'),
    (v_tenant_id, v_thread3, v_user_chen, 1, 'system', 'system'),
    (v_tenant_id, v_thread3, v_user_nurse, 0, 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 17. INBOX ITEMS (10 — assigned to Dr. Chen)
-- ---------------------------------------------------------------------------
  INSERT INTO inbox_items (tenant_id, user_id, type, title, subtitle,
                           patient_id, patient_name, priority, status, due_at,
                           created_by, modified_by)
  VALUES
    -- Lab results (3)
    (v_tenant_id, v_user_chen, 'lab_result', 'HbA1c 7.4% — Sarah Johnson', 'Resulted 3 days ago — HIGH flag: A1c above target, LDL 142', v_pat1, 'Sarah Johnson', 'HIGH',   'PENDING', CURRENT_DATE + TIME '17:00:00', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'lab_result', 'Lipid Panel — Sarah Johnson', 'LDL 142 mg/dL (H), TG 186 mg/dL (H)', v_pat1, 'Sarah Johnson', 'NORMAL', 'PENDING', CURRENT_DATE + TIME '17:00:00', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'lab_result', 'CMP — James Thompson', 'Cr 2.1, eGFR 38 — stable but below 60', v_pat4, 'James Thompson', 'NORMAL', 'PENDING', CURRENT_DATE + TIME '17:00:00', 'system', 'system'),
    -- Refill requests (2)
    (v_tenant_id, v_user_chen, 'refill_request', 'Refill Request — Metformin 1000mg', 'Sarah Johnson | CVS 86th & Broadway | Requested today', v_pat1, 'Sarah Johnson', 'NORMAL', 'PENDING', CURRENT_DATE + TIME '17:00:00', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'refill_request', 'Refill Request — Lantus insulin', 'William Park | Walgreens Flatbush | Last filled 30 days ago', v_pat8, 'William Park', 'HIGH',   'PENDING', CURRENT_DATE + TIME '17:00:00', 'system', 'system'),
    -- Patient messages (2)
    (v_tenant_id, v_user_chen, 'patient_message', 'Message from Sarah Johnson', 'Re: My A1c — Thank you Dr. Chen! Quick question about Ozempic storage...', v_pat1, 'Sarah Johnson', 'NORMAL', 'PENDING', NULL, 'system', 'system'),
    (v_tenant_id, v_user_chen, 'patient_message', 'Message from Marcus Rivera', 'Having more shortness of breath this morning — should I come in?', v_pat2, 'Marcus Rivera', 'HIGH',   'PENDING', NULL, 'system', 'system'),
    -- Prior auth (1)
    (v_tenant_id, v_user_chen, 'prior_auth', 'Prior Auth Required — Ozempic (Sarah Johnson)', 'Blue Cross requesting clinical documentation for semaglutide continuation | Due in 5 days', v_pat1, 'Sarah Johnson', 'HIGH', 'PENDING', CURRENT_DATE + INTERVAL '5 days', 'system', 'system'),
    -- Tasks (2)
    (v_tenant_id, v_user_chen, 'task', 'Complete encounter note — Sarah Johnson (today)', 'Encounter from today''s 8:30 AM visit is unsigned', v_pat1, 'Sarah Johnson', 'HIGH',   'PENDING', CURRENT_DATE + TIME '18:00:00', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'task', 'Diabetic eye exam referral — Sarah Johnson', 'Ophthalmology referral ordered — awaiting patient scheduling confirmation', v_pat1, 'Sarah Johnson', 'NORMAL', 'PENDING', CURRENT_DATE + INTERVAL '7 days', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 18. CARE GAPS (6)
-- ---------------------------------------------------------------------------
  INSERT INTO care_gaps (tenant_id, patient_id, measure, description, last_date,
                         due_date, status, priority, created_by, modified_by)
  VALUES
    -- Sarah Johnson: HbA1c overdue (done 3 days ago — gap should be marked closed but demo shows open)
    (v_tenant_id, v_pat1, 'HbA1c Testing',
     'Diabetes patients should have HbA1c tested at least twice per year. Last result: 7.4% (3 days ago). Next due in 3 months.',
     CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '90 days', 'CLOSED', 'HIGH', 'system', 'system'),
    -- Sarah Johnson: Diabetic eye exam overdue
    (v_tenant_id, v_pat1, 'Diabetic Retinal Exam',
     'Annual dilated eye exam due for patients with diabetes. No prior record on file.',
     NULL, CURRENT_DATE + INTERVAL '14 days', 'OPEN', 'HIGH', 'system', 'system'),
    -- Marcus Rivera: Pneumococcal vaccine due
    (v_tenant_id, v_pat2, 'Pneumococcal Vaccination (PPSV23)',
     'Indicated for patients with COPD and CHF. No prior record on file.',
     NULL, CURRENT_DATE + INTERVAL '30 days', 'OPEN', 'HIGH', 'system', 'system'),
    -- Catherine O'Brien: Mammogram overdue
    (v_tenant_id, v_pat9, 'Mammography Screening',
     'Annual mammogram recommended for breast cancer survivors. Last mammogram: over 13 months ago.',
     CURRENT_DATE - INTERVAL '13 months', CURRENT_DATE - INTERVAL '30 days', 'OPEN', 'HIGH', 'system', 'system'),
    -- Catherine O'Brien: DEXA scan
    (v_tenant_id, v_pat9, 'DEXA Bone Density Scan',
     'Annual DEXA recommended for patients on aromatase inhibitors with osteoporosis.',
     CURRENT_DATE - INTERVAL '14 months', CURRENT_DATE - INTERVAL '60 days', 'OPEN', 'MEDIUM', 'system', 'system'),
    -- James Thompson: Colorectal cancer screening overdue
    (v_tenant_id, v_pat4, 'Colorectal Cancer Screening (Colonoscopy)',
     'Colonoscopy recommended every 10 years age 45+. Last colonoscopy: 11 years ago.',
     CURRENT_DATE - INTERVAL '11 years', CURRENT_DATE - INTERVAL '1 year', 'OPEN', 'MEDIUM', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 19. IMMUNIZATIONS
-- ---------------------------------------------------------------------------
  INSERT INTO immunizations (tenant_id, patient_id, vaccine_name, cvx_code,
                             dose_number, dose_in_series, administered_date,
                             administered_by, site, lot_number, manufacturer,
                             created_by, modified_by)
  VALUES
    -- Sarah Johnson: Flu, COVID, Tdap
    (v_tenant_id, v_pat1, 'Influenza, Seasonal (IIV)', '141', 1, 1, CURRENT_DATE - INTERVAL '6 months', 'Sarah Thompson, RN', 'Left deltoid', 'FLU2025-A1', 'Sanofi', 'system', 'system'),
    (v_tenant_id, v_pat1, 'COVID-19, mRNA (Updated Booster)', '228', 3, NULL, CURRENT_DATE - INTERVAL '4 months', 'Sarah Thompson, RN', 'Right deltoid', 'COV2025-XBB1', 'Pfizer-BioNTech', 'system', 'system'),
    -- Marcus Rivera: Flu, COVID, Pneumococcal PCV15
    (v_tenant_id, v_pat2, 'Influenza, Seasonal (IIV)', '141', 1, 1, CURRENT_DATE - INTERVAL '6 months', 'Sarah Thompson, RN', 'Left deltoid', 'FLU2025-A2', 'Sanofi', 'system', 'system'),
    (v_tenant_id, v_pat2, 'COVID-19, mRNA (Updated Booster)', '228', 4, NULL, CURRENT_DATE - INTERVAL '4 months', 'Sarah Thompson, RN', 'Right deltoid', 'COV2025-XBB2', 'Pfizer-BioNTech', 'system', 'system'),
    -- James Thompson: Flu, COVID, Shingrix #1 and #2
    (v_tenant_id, v_pat4, 'Influenza, Seasonal (IIV)', '141', 1, 1, CURRENT_DATE - INTERVAL '6 months', 'Sarah Thompson, RN', 'Left deltoid', 'FLU2025-B1', 'CSL Seqirus', 'system', 'system'),
    (v_tenant_id, v_pat4, 'Zoster Recombinant (Shingrix)', '187', 1, 2, CURRENT_DATE - INTERVAL '8 months', 'Sarah Thompson, RN', 'Right deltoid', 'SHG2024-001', 'GSK', 'system', 'system'),
    (v_tenant_id, v_pat4, 'Zoster Recombinant (Shingrix)', '187', 2, 2, CURRENT_DATE - INTERVAL '6 months', 'Sarah Thompson, RN', 'Right deltoid', 'SHG2024-002', 'GSK', 'system', 'system'),
    -- Aisha Williams: Flu, Tdap
    (v_tenant_id, v_pat5, 'Influenza, Seasonal (IIV)', '141', 1, 1, CURRENT_DATE - INTERVAL '5 months', 'Sarah Thompson, RN', 'Left deltoid', 'FLU2025-C1', 'Sanofi', 'system', 'system'),
    (v_tenant_id, v_pat5, 'Tdap', '115', 1, 1, CURRENT_DATE - INTERVAL '3 years', 'Sarah Thompson, RN', 'Left deltoid', 'TDP2022-001', 'Sanofi', 'system', 'system'),
    -- Emma Davis: Flu, IPV, MMR, Varicella
    (v_tenant_id, v_pat7, 'Influenza, Seasonal (IIV Pediatric)', '141', 1, 1, CURRENT_DATE - INTERVAL '5 months', 'Sarah Thompson, RN', 'Left deltoid', 'FLU2025-PED1', 'Sanofi', 'system', 'system'),
    (v_tenant_id, v_pat7, 'Polio (IPV)', '10', 4, 4, CURRENT_DATE - INTERVAL '3 years', 'Sarah Thompson, RN', 'Right thigh', 'IPV2022-001', 'Sanofi', 'system', 'system'),
    -- Catherine O'Brien: Flu, COVID, Shingrix complete
    (v_tenant_id, v_pat9, 'Influenza, High-Dose (IIV HD)', '197', 1, 1, CURRENT_DATE - INTERVAL '6 months', 'Sarah Thompson, RN', 'Left deltoid', 'FLU2025-HD1', 'Sanofi', 'system', 'system'),
    (v_tenant_id, v_pat9, 'COVID-19, mRNA (Updated Booster)', '228', 5, NULL, CURRENT_DATE - INTERVAL '3 months', 'Sarah Thompson, RN', 'Right deltoid', 'COV2025-XBB3', 'Moderna', 'system', 'system'),
    (v_tenant_id, v_pat9, 'Zoster Recombinant (Shingrix)', '187', 1, 2, CURRENT_DATE - INTERVAL '2 years', 'Sarah Thompson, RN', 'Right deltoid', 'SHG2023-001', 'GSK', 'system', 'system'),
    (v_tenant_id, v_pat9, 'Zoster Recombinant (Shingrix)', '187', 2, 2, CURRENT_DATE - INTERVAL '20 months', 'Sarah Thompson, RN', 'Right deltoid', 'SHG2023-002', 'GSK', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 20. NOTIFICATIONS (for Dr. Chen)
-- ---------------------------------------------------------------------------
  INSERT INTO notifications (tenant_id, user_id, type, title, body, read, action_url, created_by, modified_by)
  VALUES
    (v_tenant_id, v_user_chen, 'lab_result', 'Lab Result: HbA1c — Sarah Johnson', 'HbA1c 7.4% — improved from 8.1%. LDL 142 mg/dL still elevated.', false, '/patients/PAT-10001/labs', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'urgent_message', 'URGENT: Emma Davis O2 Sat 96%', 'Sarah Thompson, RN flagged Emma Davis (PAT-10007) — audible wheeze, O2 96%.', false, '/schedule/today', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'refill_request', 'Refill Request: Lantus — William Park', 'Patient requesting insulin refill. Last filled 30 days ago.', false, '/patients/PAT-10008/medications', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'encounter_unsigned', 'Unsigned Encounter — Sarah Johnson', 'Today''s encounter note is unsigned. Please review and sign.', false, '/encounters', 'system', 'system'),
    (v_tenant_id, v_user_chen, 'lab_result', 'Lab Result: CMP — James Thompson', 'Cr 2.1 mg/dL, eGFR 38 — stable CKD 3b. Review required.', true, '/patients/PAT-10004/labs', 'system', 'system')
  ON CONFLICT DO NOTHING;

-- Close all nested blocks
END; -- bill_enc block
END; -- thread block
END; -- lab_order block
END; -- patient_pk block
END; -- room_pk block
END; -- loc/room block
END; -- tenant do block
$$;

COMMIT;
