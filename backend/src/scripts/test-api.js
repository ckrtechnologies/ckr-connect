import { secrets } from '../config/secrets.js';
import app from '../app.js';
import http from 'http';

const runTests = async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`[Test Runner] Temporary server running on ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, desc) => {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('\n--- 1. Testing Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
    assert(healthRes.status === 'healthy', 'Health check returns healthy status');

    // 2. Admin Login
    console.log('\n--- 2. Testing Admin Auth Login ---');
    const adminLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'chandan@ckrtechnologies.in', password: 'password@1' })
    }).then(r => r.json());

    assert(adminLoginRes.success === true, 'Admin login succeeded');
    assert(adminLoginRes.data?.user?.role === 'admin', 'Admin role verified in token');
    const adminToken = adminLoginRes.data?.accessToken;

    // 3. BDM Login
    console.log('\n--- 3. Testing BDM Auth Login ---');
    const bdmLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@ckrtechnologies.in', password: 'password@1' })
    }).then(r => r.json());

    assert(bdmLoginRes.success === true, 'BDM login succeeded');
    assert(bdmLoginRes.data?.user?.role === 'bdm', 'BDM role verified in token');
    const bdmToken = bdmLoginRes.data?.accessToken;
    const bdmUserId = bdmLoginRes.data?.user?.id;

    // 4. Bootstrap Endpoint
    console.log('\n--- 4. Testing Shared Bootstrap API ---');
    const bootRes = await fetch(`${baseUrl}/api/v1/bootstrap`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(bootRes.success === true, 'Bootstrap API returned success');
    assert(Array.isArray(bootRes.data?.tags) && bootRes.data.tags.length > 0, 'Bootstrap returned active tags');
    assert(Array.isArray(bootRes.data?.bdms) && bootRes.data.bdms.length > 0, 'Bootstrap returned active BDMs');
    assert(Array.isArray(bootRes.data?.holidays) && bootRes.data.holidays.length > 0, 'Bootstrap returned holidays');

    // 5. Admin Dashboard
    console.log('\n--- 5. Testing Admin Dashboard ---');
    const adminDashRes = await fetch(`${baseUrl}/api/v1/admin/dashboard/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(adminDashRes.success === true, 'Admin dashboard summary retrieved');
    assert(adminDashRes.data?.kpis !== undefined, 'KPIs object present in dashboard');
    assert(Array.isArray(adminDashRes.data?.funnel), 'Funnel array present');
    assert(Array.isArray(adminDashRes.data?.leaderboard), 'Leaderboard array present');

    // 6. Admin Leads CRUD
    console.log('\n--- 6. Testing Admin Leads ---');
    const leadsRes = await fetch(`${baseUrl}/api/v1/admin/leads?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(leadsRes.success === true, 'Admin leads list retrieved');
    assert(Array.isArray(leadsRes.data?.items), 'Leads items array present');
    assert(leadsRes.data?.pagination?.total >= 0, 'Pagination metadata present');

    // Create a new lead via Quick Create
    const createLeadRes = await fetch(`${baseUrl}/api/v1/admin/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Sunil Mehta',
        company_name: 'Acme Test Solutions',
        email: 'sunil@acmetest.in',
        phone: '+919988776655',
        source: 'website',
        expected_value: 750000,
        assigned_to: bdmUserId
      })
    }).then(r => r.json());

    assert(createLeadRes.success === true, 'Quick Create lead succeeded');
    const testLeadId = createLeadRes.data?.id;
    assert(testLeadId !== undefined, `New lead ID generated: ${testLeadId}`);

    // 7. Admin Staff Roster
    console.log('\n--- 7. Testing Admin Staff ---');
    const staffRes = await fetch(`${baseUrl}/api/v1/admin/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(staffRes.success === true, 'Staff roster retrieved');
    assert(staffRes.data?.length >= 5, `Expected at least 5 staff, got ${staffRes.data?.length}`);

    // 8. Admin Attendance Matrix
    console.log('\n--- 8. Testing Admin Attendance Matrix ---');
    const matrixRes = await fetch(`${baseUrl}/api/v1/admin/attendance/matrix?year=2026&month=9`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(matrixRes.success === true, 'Attendance matrix retrieved');
    assert(Array.isArray(matrixRes.data?.staff_attendance), 'Staff attendance rows present');

    // 9. Admin Interactions Ledger
    console.log('\n--- 9. Testing Admin Interactions Ledger ---');
    const interactionsRes = await fetch(`${baseUrl}/api/v1/admin/interactions?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(interactionsRes.success === true, 'Interactions ledger retrieved');

    const dailySummaryRes = await fetch(`${baseUrl}/api/v1/admin/interactions/daily-summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(dailySummaryRes.success === true, 'Daily interactions summary retrieved');

    // 10. Admin Accounts
    console.log('\n--- 10. Testing Admin Accounts ---');
    const accountsRes = await fetch(`${baseUrl}/api/v1/admin/accounts`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(accountsRes.success === true, 'Corporate accounts list retrieved');

    // 11. Admin Masters
    console.log('\n--- 11. Testing Admin Masters (Tags & Holidays) ---');
    const tagsRes = await fetch(`${baseUrl}/api/v1/admin/masters/tags`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(tagsRes.success === true, 'Tags retrieved');

    const holidaysRes = await fetch(`${baseUrl}/api/v1/admin/masters/holidays`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then(r => r.json());

    assert(holidaysRes.success === true, 'Holidays retrieved');

    // 12. BDM Workspace
    console.log('\n--- 12. Testing BDM Workspace Dashboard ---');
    const bdmDashRes = await fetch(`${baseUrl}/api/v1/bdm/workspace/dashboard`, {
      headers: { Authorization: `Bearer ${bdmToken}` }
    }).then(r => r.json());

    assert(bdmDashRes.success === true, 'BDM workspace dashboard retrieved');
    assert(bdmDashRes.data?.kpis !== undefined, 'BDM KPIs present');

    // 13. BDM My Leads (scoped)
    console.log('\n--- 13. Testing BDM Assigned Leads ---');
    const bdmLeadsRes = await fetch(`${baseUrl}/api/v1/bdm/leads`, {
      headers: { Authorization: `Bearer ${bdmToken}` }
    }).then(r => r.json());

    assert(bdmLeadsRes.success === true, 'BDM leads list retrieved');
    const hasAssignedLead = bdmLeadsRes.data?.items?.some(l => l.id === testLeadId);
    assert(hasAssignedLead === true, 'Newly created test lead found in assigned BDM list');

    // Update Lead Status by BDM
    const statusUpdateRes = await fetch(`${baseUrl}/api/v1/bdm/leads/${testLeadId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bdmToken}`
      },
      body: JSON.stringify({ status: 'contacted' })
    }).then(r => r.json());

    assert(statusUpdateRes.success === true, 'BDM updated lead status to contacted');

    // 14. BDM Log Interaction
    console.log('\n--- 14. Testing BDM Log Interaction ---');
    const logRes = await fetch(`${baseUrl}/api/v1/bdm/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bdmToken}`
      },
      body: JSON.stringify({
        lead_id: testLeadId,
        type: 'call',
        call_result: 'connected',
        notes: 'Introductory discussion on enterprise portal integration. Scheduled demo.',
        next_followup_date: '2026-09-25'
      })
    }).then(r => r.json());

    assert(logRes.success === true, 'BDM successfully logged call interaction');

    // 15. BDM Attendance
    console.log('\n--- 15. Testing BDM Attendance Status ---');
    const punchStatus = await fetch(`${baseUrl}/api/v1/bdm/attendance/today`, {
      headers: { Authorization: `Bearer ${bdmToken}` }
    }).then(r => r.json());

    assert(punchStatus.success === true, 'BDM attendance today status retrieved');

    // 16. BDM Notifications
    console.log('\n--- 16. Testing BDM Notifications ---');
    const notifsRes = await fetch(`${baseUrl}/api/v1/bdm/notifications`, {
      headers: { Authorization: `Bearer ${bdmToken}` }
    }).then(r => r.json());

    assert(notifsRes.success === true, 'BDM notifications feed retrieved');

    // 17. RBAC Security Check: BDM cannot access Admin routes
    console.log('\n--- 17. Testing RBAC Security Guard ---');
    const forbiddenRes = await fetch(`${baseUrl}/api/v1/admin/dashboard/summary`, {
      headers: { Authorization: `Bearer ${bdmToken}` }
    });

    assert(forbiddenRes.status === 403, 'BDM token blocked with 403 Forbidden from accessing Admin routes');

  } catch (err) {
    console.error('[Test Runner] Unhandled test error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n=======================================================`);
    console.log(`  Tests Completed: ${passed} PASSED, ${failed} FAILED  `);
    console.log(`=======================================================`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
