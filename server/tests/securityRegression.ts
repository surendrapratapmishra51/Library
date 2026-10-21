/**
 * Pre-UAT Automated Security Regression Test
 * Validates Phase 1 Authorization, IDOR Protection, and Privilege Escalation Guards.
 * Non-destructive: Does not create, modify, or delete real records.
 */

import http from 'http';
import { generateToken } from '../utils/jwt.js';

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  expectedStatus: number | number[];
  actualStatus: number;
  details?: string;
}

const results: TestResult[] = [];

// Helper to make HTTP requests
function sendRequest(
  method: string,
  path: string,
  token?: string | null,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : undefined;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({ status: res.statusCode || 0, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

function recordTest(
  name: string,
  category: string,
  expectedStatus: number | number[],
  actualStatus: number,
  details?: string
) {
  const passed = Array.isArray(expectedStatus)
    ? expectedStatus.includes(actualStatus)
    : expectedStatus === actualStatus;
  results.push({ name, category, passed, expectedStatus, actualStatus, details });
  console.log(
    `${passed ? '✅ PASS' : '❌ FAIL'} [${category}] ${name} -> Expected ${expectedStatus}, Got ${actualStatus}${
      details ? ` (${details})` : ''
    }`
  );
}

async function runSecurityTests() {
  console.log('🔒 Starting Pre-UAT Security & Authorization Regression Test Suite...\n');

  // Test Tokens
  const studentToken = generateToken({
    id: 'test-student-01',
    name: 'Test Student',
    email: 'student@test.com',
    role: 'student',
  });

  const adminToken = generateToken({
    id: 'usr-admin-01',
    name: 'FocusZone Administrator',
    email: 'admin@focuszonelibrary.com',
    role: 'admin',
  });

  // 1. Unauthenticated Access Rejections (Must be 401)
  console.log('--- 1. Testing Unauthenticated Request Rejection ---');
  let res = await sendRequest('GET', '/api/users');
  recordTest('GET /api/users rejects anonymous visitor', 'Authentication', 401, res.status);

  res = await sendRequest('GET', '/api/payments/summary');
  recordTest('GET /api/payments/summary rejects anonymous visitor', 'Authentication', 401, res.status);

  res = await sendRequest('POST', '/api/payments', null, { amount: 100 });
  recordTest('POST /api/payments rejects anonymous visitor', 'Authentication', 401, res.status);

  res = await sendRequest('POST', '/api/seats/transfer', null, { newSeatNumber: 'S-01' });
  recordTest('POST /api/seats/transfer rejects anonymous visitor', 'Authentication', 401, res.status);

  res = await sendRequest('POST', '/api/floors', null, { name: 'Floor 99' });
  recordTest('POST /api/floors rejects anonymous visitor', 'Authentication', 401, res.status);

  res = await sendRequest('POST', '/api/plans', null, { name: 'VIP Plan' });
  recordTest('POST /api/plans rejects anonymous visitor', 'Authentication', 401, res.status);

  // 2. Student Role Authorization Rejections (Must be 403 Forbidden)
  console.log('\n--- 2. Testing Student Role Boundary & Admin Protection ---');
  res = await sendRequest('GET', '/api/users', studentToken);
  recordTest('GET /api/users rejects student token', 'Role Authorization', 403, res.status);

  res = await sendRequest('GET', '/api/payments/summary', studentToken);
  recordTest('GET /api/payments/summary rejects student token', 'Role Authorization', 403, res.status);

  res = await sendRequest('POST', '/api/payments', studentToken, { amount: 500 });
  recordTest('POST /api/payments rejects student token', 'Role Authorization', 403, res.status);

  res = await sendRequest('PUT', '/api/payments/discount/test-student-02', studentToken, { discount: 500 });
  recordTest('PUT /api/payments/discount rejects student token', 'Role Authorization', 403, res.status);

  res = await sendRequest('POST', '/api/seats/transfer', studentToken, { newSeatNumber: 'S-01' });
  recordTest('POST /api/seats/transfer rejects student token', 'Role Authorization', 403, res.status);

  res = await sendRequest('GET', '/api/seats/allocations/history', studentToken);
  recordTest('GET /api/seats/allocations/history rejects student token', 'Role Authorization', 403, res.status);

  // 3. IDOR Protection on Payment & Statements
  console.log('\n--- 3. Testing IDOR Cross-User Data Exposure ---');
  // Student requesting another student's fee statement
  res = await sendRequest('GET', '/api/payments/statement/test-student-02', studentToken);
  recordTest(
    'GET /api/payments/statement/:userId blocks cross-student IDOR',
    'IDOR Protection',
    403,
    res.status
  );

  // Student requesting another student's payment transactions
  res = await sendRequest('GET', '/api/payments/user/test-student-02', studentToken);
  recordTest(
    'GET /api/payments/user/:userId blocks cross-student IDOR',
    'IDOR Protection',
    403,
    res.status
  );

  // Student requesting own payments (must NOT be 401 or 403)
  res = await sendRequest('GET', '/api/payments/user/test-student-01', studentToken);
  recordTest(
    'GET /api/payments/user/:userId allows student to view own payments',
    'Self Access',
    200,
    res.status
  );

  // Admin requesting student fee statement (must be allowed: 200 or 404 if user doesn't exist, but NOT 401 or 403)
  res = await sendRequest('GET', '/api/payments/statement/test-student-02', adminToken);
  recordTest(
    'GET /api/payments/statement/:userId allows authorized admin',
    'Admin Access',
    [200, 404],
    res.status,
    '404 indicates authorized access reached database query for non-existent test user'
  );

  // 4. Public Endpoints Integrity
  console.log('\n--- 4. Testing Public Endpoints Accessibility ---');
  res = await sendRequest('GET', '/api/health');
  recordTest('GET /api/health accessible without token', 'Public Route', 200, res.status);

  res = await sendRequest('GET', '/api/plans');
  recordTest('GET /api/plans accessible without token', 'Public Route', 200, res.status);

  res = await sendRequest('GET', '/api/seats');
  recordTest('GET /api/seats accessible without token', 'Public Route', 200, res.status);

  res = await sendRequest('GET', '/api/floors');
  recordTest('GET /api/floors accessible without token', 'Public Route', 200, res.status);

  // 5. Privilege Escalation Prevention
  console.log('\n--- 5. Testing Privilege Escalation Protection ---');
  res = await sendRequest('POST', '/api/auth/register', null, {
    name: 'Attacker',
    mobile: '9999999901',
    password: 'password123',
    role: 'admin',
  });
  recordTest(
    'POST /api/auth/register blocks admin creation',
    'Privilege Escalation',
    403,
    res.status
  );

  res = await sendRequest('POST', '/api/users', studentToken, {
    name: 'Attacker',
    mobile: '9999999902',
    password: 'password123',
    role: 'admin',
  });
  recordTest(
    'POST /api/users blocks non-admin creating admin accounts',
    'Privilege Escalation',
    403,
    res.status
  );

  // Summary
  console.log('\n========================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`Test Results: ${passedCount} / ${results.length} PASSED`);
  if (passedCount === results.length) {
    console.log('🎉 ALL SECURITY REGRESSION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME TESTS FAILED!');
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err.message);
  process.exit(1);
});
