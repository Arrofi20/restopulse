// RestoPulse Load Test — k6 Mixed Traffic Script (D-42, D-43)
//
// Purpose: Simulate 50 concurrent restaurant owners cycling through the
//          three core authenticated endpoints under real-world usage patterns.
//
// Backend: Express on http://localhost:3000
// Auth:    JWT obtained via setup() calling POST /api/auth/login
//
// D-45: Existing database indexes (verified from prisma/schema.prisma):
//   - DailySales:   @@index([outlet_id, date]) — covers sales write dedup + read filtering
//   - SalesTrend:   @@index([outlet_id, date]) — covers CQRS-lite dashboard O(1) reads
//   - DailySalesReport: @@index([outlet_id, period_start, period_end]) — report range scan
//   Only add indexes if p(95) > 500ms — these existing indexes are the baseline.
//
// NFR §9.4: API Latency ≤500ms (for 50 concurrent transactions)
// NFR §9.1: Dashboard update ≤3 detik
//
// Usage:
//   1. Start backend:  npm run dev  (from project root)
//   2. Ensure testuser/testpass123 exists (run dummy-injector first if needed)
//   3. Run:  k6 run k6/load-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

// ── Options ────────────────────────────────────────────────────────────────
export const options = {
  vus: 50,               // 50 concurrent virtual users (D-43)
  duration: '30s',       // 30-second steady-state run
  thresholds: {
    // NFR §9.4: 95th percentile of ALL requests must be ≤500ms
    http_req_duration: ['p(95)<500'],

    // Error rate must stay under 1%
    http_req_failed: ['rate<0.01'],

    // Per-endpoint tagged thresholds (see default function below)
    'http_req_duration{endpoint:sales}':     ['p(95)<500'],
    'http_req_duration{endpoint:dashboard}': ['p(95)<400'],   // CQRS-lite: pre-computed SalesTrend
    'http_req_duration{endpoint:report}':    ['p(95)<500'],
  },
};

// ── Constants ──────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:3000';

const MENU_ITEMS = ['Nasi Goreng', 'Mie Ayam', 'Es Teh', 'Ayam Bakar', 'Soto'];

// Date range for dashboard/report queries (last 26 days)
const REPORT_START = '2026-06-01';
const REPORT_END = '2026-06-26';

// ── Setup — obtain a fresh JWT via login endpoint ──────────────────────────
export function setup() {
  const loginUrl = `${BASE_URL}/api/auth/login`;
  const payload = JSON.stringify({
    username: 'testuser',
    password: 'testpass123',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(loginUrl, payload, params);

  const loginOk = check(res, {
    'login succeeded': (r) => r.status === 200,
    'token received':  (r) => r.json('data.token') !== undefined,
  });

  if (!loginOk) {
    console.error(`Login failed: status=${res.status}, body=${res.body}`);
    throw new Error('Setup failed — cannot obtain JWT. Is the backend running with a testuser?');
  }

  const token = res.json('data.token');
  console.log(`Setup complete — JWT obtained (first 20 chars): ${token.substring(0, 20)}...`);
  return { token };
}

// ── Default — weighted traffic distribution ────────────────────────────────
export default function (data) {
  const token = data.token;
  const rand = Math.random();

  // ── 40% — POST /api/sales (data entry) ───────────────────────────────
  if (rand < 0.4) {
    const today = new Date().toISOString().split('T')[0];  // "YYYY-MM-DD"
    const revenue = Math.floor(Math.random() * 1000000) + 100000;  // 100K–1.1M IDR
    const itemCount = Math.floor(Math.random() * 3) + 1;           // 1–3 items
    const topMenuItems = [];
    for (let i = 0; i < itemCount; i++) {
      topMenuItems.push(MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)]);
    }

    const payload = JSON.stringify({
      date: today,
      revenue,
      top_menu_items: topMenuItems,
    });

    const res = http.post(`${BASE_URL}/api/sales`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      tags: { endpoint: 'sales' },
    });

    // 201 = first sale for today, 409 = duplicate (acceptable under load)
    check(res, {
      'sales_ok': (r) => r.status === 201 || r.status === 409,
    });
  }
  // ── 30% — GET /api/dashboard ─────────────────────────────────────────
  else if (rand < 0.7) {
    const res = http.get(
      `${BASE_URL}/api/dashboard?start=${REPORT_START}&end=${REPORT_END}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        tags: { endpoint: 'dashboard' },
      }
    );

    check(res, {
      'dashboard status 200': (r) => r.status === 200,
    });
  }
  // ── 30% — GET /api/report ────────────────────────────────────────────
  else {
    const res = http.get(
      `${BASE_URL}/api/report?start=${REPORT_START}&end=${REPORT_END}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        tags: { endpoint: 'report' },
      }
    );

    check(res, {
      'report status 200': (r) => r.status === 200,
    });
  }

  // 1 second think time between iterations (realistic user behavior)
  sleep(1);
}
