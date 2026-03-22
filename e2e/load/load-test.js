/**
 * Primus EHR — k6 Load Test
 *
 * Simulates realistic EHR workload for 100 tenants:
 *   - 700 concurrent users (10% of 7,000 providers)
 *   - 30-minute sustained test
 *   - Mix of read/write operations weighted by real clinic traffic
 *
 * Run:
 *   brew install k6  (or docker run -i grafana/k6 run -)
 *   k6 run e2e/load/load-test.js
 *
 * With Grafana dashboard:
 *   K6_OUT=influxdb=http://localhost:8086/k6 k6 run e2e/load/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ─────────────────────────────────────────────────────────
const errorRate = new Rate('errors');
const patientSearchDuration = new Trend('patient_search_duration', true);
const appointmentCreateDuration = new Trend('appointment_create_duration', true);
const encounterLoadDuration = new Trend('encounter_load_duration', true);

// ─── Test Configuration ─────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'mock-jwt-token';
const TENANT_ID = __ENV.TENANT_ID || '1';

export const options = {
  scenarios: {
    // Ramp up to 700 concurrent users over 5 minutes
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Warm up
        { duration: '3m', target: 350 },   // Ramp to 50%
        { duration: '5m', target: 700 },   // Full load
        { duration: '15m', target: 700 },  // Sustain
        { duration: '3m', target: 100 },   // Cool down
        { duration: '2m', target: 0 },     // Drain
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],  // 95th < 500ms, 99th < 2s
    http_req_failed: ['rate<0.01'],                   // <1% error rate
    errors: ['rate<0.05'],                             // <5% custom errors
    patient_search_duration: ['p(95)<300'],            // Patient search < 300ms
    appointment_create_duration: ['p(95)<500'],        // Appointment create < 500ms
    encounter_load_duration: ['p(95)<400'],            // Encounter load < 400ms
  },
};

// ─── Auth Headers ───────────────────────────────────────────────────────────
function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'X-TENANT-ID': TENANT_ID,
  };
}

// ─── Test Scenarios ─────────────────────────────────────────────────────────

export default function () {
  // Weighted scenario distribution (mirrors real clinic traffic):
  // 40% — Patient lookup/search (most common action)
  // 20% — Appointment scheduling
  // 15% — Encounter/chart viewing
  // 10% — Billing queries
  // 10% — Messaging
  // 5%  — Dashboard/reports

  const roll = Math.random();

  if (roll < 0.40) {
    patientWorkflow();
  } else if (roll < 0.60) {
    appointmentWorkflow();
  } else if (roll < 0.75) {
    encounterWorkflow();
  } else if (roll < 0.85) {
    billingWorkflow();
  } else if (roll < 0.95) {
    messagingWorkflow();
  } else {
    dashboardWorkflow();
  }

  sleep(Math.random() * 3 + 1); // 1-4s think time between actions
}

// ─── Patient Workflow ───────────────────────────────────────────────────────
function patientWorkflow() {
  group('Patient Workflow', () => {
    // Search for a patient
    const searchRes = http.get(
      `${BASE_URL}/api/v1/patients/search?q=Smith&page=0&size=20`,
      { headers: headers(), tags: { name: 'patient_search' } }
    );
    patientSearchDuration.add(searchRes.timings.duration);
    check(searchRes, {
      'patient search returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.5);

    // List patients
    const listRes = http.get(
      `${BASE_URL}/api/v1/patients?page=0&size=20`,
      { headers: headers(), tags: { name: 'patient_list' } }
    );
    check(listRes, {
      'patient list returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

// ─── Appointment Workflow ───────────────────────────────────────────────────
function appointmentWorkflow() {
  group('Appointment Workflow', () => {
    // Get today's appointments
    const todayRes = http.get(
      `${BASE_URL}/api/v1/appointments/today`,
      { headers: headers(), tags: { name: 'appointments_today' } }
    );
    check(todayRes, {
      'today appointments returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.5);

    // Check available slots
    const slotsRes = http.get(
      `${BASE_URL}/api/v1/appointments/available-slots?providerId=PRV-00001&date=2026-03-23`,
      { headers: headers(), tags: { name: 'available_slots' } }
    );
    check(slotsRes, {
      'available slots returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.3);

    // Create appointment (write operation)
    const createRes = http.post(
      `${BASE_URL}/api/v1/appointments`,
      JSON.stringify({
        patientId: 'PAT-00001',
        providerId: 'PRV-00001',
        appointmentDate: '2026-03-23',
        startTime: '09:00',
        endTime: '09:30',
        type: 'FOLLOW_UP',
        reason: 'Load test appointment',
      }),
      { headers: headers(), tags: { name: 'appointment_create' } }
    );
    appointmentCreateDuration.add(createRes.timings.duration);
    check(createRes, {
      'appointment create returns 200/201': (r) => r.status === 200 || r.status === 201,
    }) || errorRate.add(1);
  });
}

// ─── Encounter Workflow ─────────────────────────────────────────────────────
function encounterWorkflow() {
  group('Encounter Workflow', () => {
    // List encounters for a patient
    const listRes = http.get(
      `${BASE_URL}/api/v1/encounters/patient/PAT-00001`,
      { headers: headers(), tags: { name: 'encounter_list' } }
    );
    encounterLoadDuration.add(listRes.timings.duration);
    check(listRes, {
      'encounter list returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

// ─── Billing Workflow ───────────────────────────────────────────────────────
function billingWorkflow() {
  group('Billing Workflow', () => {
    const kpiRes = http.get(
      `${BASE_URL}/api/v1/billing/kpi`,
      { headers: headers(), tags: { name: 'billing_kpi' } }
    );
    check(kpiRes, {
      'billing KPI returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.3);

    const arRes = http.get(
      `${BASE_URL}/api/v1/billing/ar-aging`,
      { headers: headers(), tags: { name: 'ar_aging' } }
    );
    check(arRes, {
      'AR aging returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

// ─── Messaging Workflow ─────────────────────────────────────────────────────
function messagingWorkflow() {
  group('Messaging Workflow', () => {
    const threadsRes = http.get(
      `${BASE_URL}/api/v1/messages/threads`,
      { headers: headers(), tags: { name: 'message_threads' } }
    );
    check(threadsRes, {
      'message threads returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(0.3);

    const unreadRes = http.get(
      `${BASE_URL}/api/v1/messages/unread-count`,
      { headers: headers(), tags: { name: 'unread_count' } }
    );
    check(unreadRes, {
      'unread count returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}

// ─── Dashboard Workflow ─────────────────────────────────────────────────────
function dashboardWorkflow() {
  group('Dashboard Workflow', () => {
    const dashRes = http.get(
      `${BASE_URL}/api/v1/dashboard/provider`,
      { headers: headers(), tags: { name: 'dashboard_provider' } }
    );
    check(dashRes, {
      'dashboard returns 200': (r) => r.status === 200,
    }) || errorRate.add(1);
  });
}
