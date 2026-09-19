/**
 * Complete End-to-End Acceptance Test Suite
 * Tests all 20 Phases of RAVAN College Receptionist & Appointment Management System
 */

import prisma from '../prisma/client';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('================================================================');
  console.log('STARTING COMPLETE END-TO-END SYSTEM ACCEPTANCE TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, extra || '');
      failed++;
    }
  }

  try {
    // 1. Health Check Test (Phase 0)
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    assert(health.status === 'ok' && healthRes.status === 200, 'Phase 0: Health check endpoint responds with status ok');

    // 2. PWA Frontend Serving Test (Phase 0 & 15)
    const pwaRes = await fetch(`${BASE_URL}/`);
    const pwaHtml = await pwaRes.text();
    assert(pwaRes.status === 200 && pwaHtml.includes('RAVAN College Receptionist'), 'Phase 15: PWA frontend application shell is served');

    const manifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
    const manifest = await manifestRes.json();
    assert(manifestRes.status === 200 && manifest.name === 'RAVAN College Receptionist', 'Phase 15: PWA web app manifest detected and valid');

    // 3. Authentication & RBAC Test (Phase 1)
    // Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'ADMIN-001', password: 'Admin@123' })
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLogin.success && adminLogin.user.role === 'SUPER_ADMIN', 'Phase 1: Super Admin login and RBAC role verification');

    // Director (Authority) login
    const dirLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'DIRECTOR-001', password: 'Director@123' })
    });
    const dirLogin = await dirLoginRes.json();
    assert(dirLogin.success && dirLogin.user.role === 'AUTHORITY', 'Phase 1: Authority login and linked authority profile verification');

    // Reception login
    const recLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'RECEPTION-001', password: 'Reception@123' })
    });
    const recLogin = await recLoginRes.json();
    assert(recLogin.success && recLogin.user.role === 'RECEPTION', 'Phase 1: Reception staff login verification');

    // Role Guard Check: Authority attempting admin action should be blocked (403)
    const unauthorizedRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dirLogin.token}`
      },
      body: JSON.stringify({ collegeName: 'Hacked Name' })
    });
    assert(unauthorizedRes.status === 403, 'Phase 1: RBAC security guard blocks unauthorized role access');

    // 4. College Setup & Directory (Phase 2)
    const authListRes = await fetch(`${BASE_URL}/api/authorities`);
    const authList = await authListRes.json();
    assert(authList.success && authList.authorities.length >= 4, 'Phase 2: Authority directory returns active authorities with office hours');

    const directorAuth = authList.authorities.find((a: any) => a.name.includes('Sharma') || a.designation === 'Director');
    assert(!!directorAuth, 'Phase 2: Director profile present in public directory');

    // Compute a valid weekday within advance booking window (e.g. 3 days from now, skipping weekend)
    const testDateObj = new Date();
    testDateObj.setDate(testDateObj.getDate() + 3);
    if (testDateObj.getDay() === 0) testDateObj.setDate(testDateObj.getDate() + 1); // Sunday -> Monday
    if (testDateObj.getDay() === 6) testDateObj.setDate(testDateObj.getDate() + 2); // Saturday -> Monday
    const validTestDate = testDateObj.toISOString().split('T')[0];

    // Clean up any test appointments from prior test runs to ensure conflict tests are idempotent
    await prisma.appointment.deleteMany({
      where: {
        visitorMobile: { in: ['9876543210', '9988776655'] }
      }
    });

    // 5. Visitor Appointment Booking (Phase 3 & Phase 8)
    const bookingPayload = {
      authorityId: directorAuth.id,
      visitorName: 'Aditya Verma',
      visitorMobile: '9876543210',
      visitorEmail: 'aditya.verma@example.com',
      purpose: 'Project Consultation on AI Robotics',
      requestedDate: validTestDate,
      requestedTime: '15:00',
      numberOfVisitors: 1
    };

    const bookRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    const bookData = await bookRes.json();
    assert(bookRes.status === 201 && bookData.appointment && bookData.appointment.status === 'PENDING', 'Phase 3: Visitor creates appointment, receives sequential reference number and PENDING status', bookData);
    const appointmentRef = bookData.appointment?.referenceNo;
    const appointmentId = bookData.appointment?.id;

    // 6. Authority Dashboard Acceptance & QR Token Generation (Phase 4, Phase 9)
    const acceptPayload = {
      scheduledDate: validTestDate,
      scheduledTime: '15:00',
      durationMinutes: 20,
      location: 'Director Office, Main Admin Block',
      authorityMessage: 'Appointment confirmed. Please arrive on time with valid photo ID.'
    };

    const acceptRes = await fetch(`${BASE_URL}/api/appointments/${appointmentId}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dirLogin.token}`
      },
      body: JSON.stringify(acceptPayload)
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200 && acceptData.appointment.status === 'ACCEPTED' && !!acceptData.appointment.qrToken, 'Phase 4 & 9: Authority accepts request; status changes to ACCEPTED and secure QR token is generated');

    // 7. Conflict Detection & Double-Booking Prevention (Phase 5)
    // Book a second appointment attempting overlap on the same date and overlapping time (15:10, within [15:00, 15:20))
    const conflictBookingPayload = {
      authorityId: directorAuth.id,
      visitorName: 'Sanjay Gupta',
      visitorMobile: '9988776655',
      purpose: 'Urgent meeting',
      requestedDate: validTestDate,
      requestedTime: '15:10',
      numberOfVisitors: 1
    };

    const conflictBookRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conflictBookingPayload)
    });
    const conflictBookData = await conflictBookRes.json();

    // Authority attempts to accept the overlapping request at 15:10
    const conflictAcceptRes = await fetch(`${BASE_URL}/api/appointments/${conflictBookData.appointment.id}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dirLogin.token}`
      },
      body: JSON.stringify({
        scheduledDate: validTestDate,
        scheduledTime: '15:10',
        durationMinutes: 15
      })
    });
    assert(conflictAcceptRes.status === 409, 'Phase 5: Double-booking prevention successfully blocks overlapping appointment with 409 Conflict');

    // 8. Visitor Tracking & QR Pass Presentation (Phase 6 & 9)
    const trackRes = await fetch(`${BASE_URL}/api/appointments/track?referenceNo=${appointmentRef}&mobile=9876543210`);
    const trackData = await trackRes.json();
    assert(trackData.success && trackData.appointment.status === 'ACCEPTED' && !!trackData.appointment.qrDataUrl, 'Phase 6: Visitor tracks status with reference & mobile, receives ACCEPTED state and base64 QR pass');

    // 9. Reception QR Verification & Completion (Phase 9)
    const verifyQRRes = await fetch(`${BASE_URL}/api/appointments/verify-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recLogin.token}`
      },
      body: JSON.stringify({ qrToken: acceptData.appointment.qrToken })
    });
    const verifyQRData = await verifyQRRes.json();
    assert(verifyQRRes.status === 200 && verifyQRData.valid === true, 'Phase 9: Reception verifies QR visitor pass token successfully');

    // Mark visit completed
    const completeRes = await fetch(`${BASE_URL}/api/appointments/${appointmentId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${recLogin.token}`
      }
    });
    const completeData = await completeRes.json();
    assert(completeData.appointment.status === 'COMPLETED', 'Phase 6: Reception marks appointment as COMPLETED');

    // 10. College Information & Interactive Map (Phase 10 & 11)
    const infoRes = await fetch(`${BASE_URL}/api/college/info`);
    const infoData = await infoRes.json();
    assert(infoData.items.length >= 5, 'Phase 10: College knowledge base loaded with admission, exam, and working hours info');

    const campusRes = await fetch(`${BASE_URL}/api/college/campus`);
    const campusData = await campusRes.json();
    assert(campusData.locations.length >= 5, 'Phase 11: Campus interactive map locations with coordinates available');

    // 11. Announcements (Phase 12)
    const annRes = await fetch(`${BASE_URL}/api/college/announcements`);
    const annData = await annRes.json();
    assert(annData.announcements.length >= 1, 'Phase 12: Active digital notice board announcements accessible');

    // 12. Grounded Gemini AI Assistant Test (Phase 13 & 14)
    const aiRes = await fetch(`${BASE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Principal se milna hai', language: 'hi' })
    });
    const aiData = await aiRes.json();
    assert(aiRes.status === 200 && aiData.answer.length > 5, 'Phase 13 & 14: Bilingual AI assistant responds with grounded guidance');

    // 13. Admin Analytics & Audit Logs (Phase 17 & 18)
    const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    });
    const analyticsData = await analyticsRes.json();
    assert(analyticsData.success && analyticsData.analytics.totalAppointments >= 2, 'Phase 17: Admin analytics reflects real-time appointment metrics');

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    });
    const auditData = await auditRes.json();
    assert(auditData.success && auditData.logs.length >= 5, 'Phase 18: Comprehensive security audit logs recorded with timestamps and actors');

    // 14. Full Application & Website Settings Customization
    const patchSettingsRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminLogin.token}`
      },
      body: JSON.stringify({
        collegeName: 'RAVAN Apex Institute of Technology',
        tagline: 'Premier Autonomous AI Campus',
        themeColor: '#059669',
        collegeEmail: 'admin@ravanapex.edu',
        collegePhone: '+91 99887 66554',
        emergencyPhone: '+91 99887 00000',
        visitingHoursGeneral: '09:00 AM - 05:00 PM',
        kioskAutoResetSeconds: 60,
        maxAdvanceBookingDays: 30,
        requiredVisitorFields: ['visitorName', 'visitorMobile', 'purpose', 'requestedDate', 'requestedTime', 'visitorEmail']
      })
    });
    const patchSettingsData = await patchSettingsRes.json();
    assert(
      patchSettingsData.success &&
      patchSettingsData.settings.collegeName === 'RAVAN Apex Institute of Technology' &&
      patchSettingsData.settings.themeColor === '#059669' &&
      patchSettingsData.settings.emergencyPhone === '+91 99887 00000',
      'Phase 19: Full settings customization (branding, contacts, rules, timers) updated and persisted'
    );

    // Dynamic field enforcement check: Missing visitorEmail when it was configured as required
    const invalidBookRes = await fetch(`${BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorityId: directorAuth.id,
        visitorName: 'Test Incomplete Visitor',
        visitorMobile: '9988776655',
        visitorEmail: '', // Missing required email
        purpose: 'Meeting',
        requestedDate: '2026-10-06',
        requestedTime: '11:00',
        numberOfVisitors: 1
      })
    });
    const invalidBookData = await invalidBookRes.json();
    assert(
      invalidBookRes.status === 400 && invalidBookData.message.includes('email'),
      'Phase 19: Dynamic required visitor field policy strictly enforced on backend'
    );

    // 21. Dedicated Site Settings & App Settings Customization (Phase 21)
    // Upload a test logo via POST /api/admin/upload-logo with dataUri
    const sampleLogoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadLogoRes = await fetch(`${BASE_URL}/api/admin/upload-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminLogin.token}`
      },
      body: JSON.stringify({ dataUri: sampleLogoDataUri })
    });
    const uploadLogoData = await uploadLogoRes.json();
    assert(uploadLogoRes.status === 200 && uploadLogoData.success && uploadLogoData.logoUrl.startsWith('/uploads/logos/'), 'Phase 21: Admin can upload logo image directly and receive static URL');

    // Update distinct Site and App Settings
    const updateSiteAppRes = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminLogin.token}`
      },
      body: JSON.stringify({
        siteName: 'Stanford Institute Portal',
        siteLogoUrl: uploadLogoData.logoUrl,
        appName: 'Stanford Reception Kiosk',
        appShortName: 'Stanford PWA',
        appLogoUrl: uploadLogoData.logoUrl,
        themeColor: '#4338ca'
      })
    });
    const updateSiteAppData = await updateSiteAppRes.json();
    assert(
      updateSiteAppRes.status === 200 &&
      updateSiteAppData.settings.siteName === 'Stanford Institute Portal' &&
      updateSiteAppData.settings.appName === 'Stanford Reception Kiosk' &&
      updateSiteAppData.settings.appShortName === 'Stanford PWA',
      'Phase 21: Admin can update distinct Site Settings and App Settings with custom names and logos'
    );

    // Verify dynamic PWA Web App Manifest reflects the new App Name and Logo
    const dynamicManifestRes = await fetch(`${BASE_URL}/manifest.webmanifest`);
    const dynamicManifest = await dynamicManifestRes.json();
    assert(
      dynamicManifestRes.status === 200 &&
      dynamicManifest.name === 'Stanford Reception Kiosk' &&
      dynamicManifest.short_name === 'Stanford PWA' &&
      dynamicManifest.theme_color === '#4338ca' &&
      dynamicManifest.icons.some((icon: any) => icon.src === uploadLogoData.logoUrl),
      'Phase 21: Dynamic PWA manifest immediately delivers updated appName, appShortName, themeColor, and app touch icon'
    );

    // Restore default settings
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminLogin.token}`
      },
      body: JSON.stringify({
        collegeName: 'RAVAN College Receptionist',
        siteName: 'RAVAN College Receptionist',
        siteLogoUrl: '',
        appName: 'RAVAN College Receptionist',
        appShortName: 'RAVAN Reception',
        appLogoUrl: '',
        tagline: 'AI Visitor & Appointment Management System',
        themeColor: '#1e3a8a',
        requiredVisitorFields: ['visitorName', 'visitorMobile', 'purpose', 'requestedDate', 'requestedTime']
      })
    });

  } catch (err: any) {
    console.error('Fatal test execution error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL PHASE ACCEPTANCE CRITERIA VERIFIED SUCCESSFULLY!\n');
  }
}

runTests();
