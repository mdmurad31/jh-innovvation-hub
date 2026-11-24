/**
 * JH Innovation Hub - Automated Verification & Critical Logic Test Suite
 * 
 * Verifies all requested critical system behaviors:
 * 1. Priority calculation (multi-factor, deterministic reasons & levels)
 * 2. Duplicate detection (multi-dimensional semantic and geographical scoring)
 * 3. University matching (10 distinct academic capability dimensions)
 * 4. Industry matching (CSR, technology, and hardware alignment profiles)
 * 5. RBAC permissions matrix
 * 6. State transitions (problem and project lifecycle validation)
 * 7. Impact calculation and verification (Government authorization & KPI updates)
 * 8. Replication (solution blueprint replication and logging)
 * 9. AI failure handling (Gemini error catchment to deterministic offline mock fallbacks)
 * 10. Explicit testing of unauthorized actions
 */

import assert from 'assert';
import { calculatePriority } from './priority';
import { calculateProblemSemanticSimilarity, findDuplicateCandidates } from './duplicate';
import { matchUniversitiesForProblem, matchIndustryForProblem } from './matching';
import { hasPermission, validateProblemTransition, validateProjectLifecycleTransition, normalizeRole } from './rbac';
import { db } from './db';
import { analyzeProblemWithAI } from './ai';
import { Problem, Project, User } from '../src/types';

interface TestStats {
  passed: number;
  failed: number;
  cases: { name: string; status: 'PASSED' | 'FAILED'; error?: string }[];
}

const stats: TestStats = {
  passed: 0,
  failed: 0,
  cases: [],
};

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const p = fn();
    if (p instanceof Promise) {
      p.then(() => {
        stats.passed++;
        stats.cases.push({ name, status: 'PASSED' });
        console.log(`  ✓ [PASSED] ${name}`);
      }).catch((err) => {
        stats.failed++;
        stats.cases.push({ name, status: 'FAILED', error: String(err) });
        console.error(`  ✗ [FAILED] ${name}`);
        console.error(err);
      });
    } else {
      stats.passed++;
      stats.cases.push({ name, status: 'PASSED' });
      console.log(`  ✓ [PASSED] ${name}`);
    }
  } catch (err) {
    stats.failed++;
    stats.cases.push({ name, status: 'FAILED', error: String(err) });
    console.error(`  ✗ [FAILED] ${name}`);
    console.error(err);
  }
}

async function runTestSuite() {
  console.log('======================================================');
  console.log('JH INNOVATION HUB - AUTOMATED CRITICAL LOGIC TEST SUITE');
  console.log('======================================================\n');

  // 1. PRIORITY CALCULATION
  runTest('Priority Calculation - Critical Profile', () => {
    const res = calculatePriority({
      severity: 10,
      affectedPeopleCount: 6000,
      urgency: 'Immediate Emergency',
      hasCoordinates: true,
      district: 'Ranchi',
      evidenceCount: 3,
    });
    // Max severity = 30
    // Max population = 25
    // Max urgency = 20
    // Geo impact verified = 13 (max is 15 but hasCoordinates gives 13)
    // Evidence >= 3 = 10
    // Total should be around 98
    assert.ok(res.totalScore >= 95, 'Should calculate high score for severe profiles');
    assert.strictEqual(res.level, 'CRITICAL', 'Should resolve level as CRITICAL');
    assert.ok(res.reasons.some(r => r.includes('Mass community impact')), 'Should extract population reason');
    assert.ok(res.reasons.some(r => r.includes('Verified geo-tagged location')), 'Should extract GPS verification');
  });

  runTest('Priority Calculation - Moderate Profile', () => {
    const res = calculatePriority({
      severity: 5,
      affectedPeopleCount: 150,
      urgency: 'Medium (Months)',
      hasCoordinates: false,
      district: 'Dumka',
      evidenceCount: 1,
    });
    assert.strictEqual(res.level, 'MEDIUM', 'Should resolve level as MEDIUM');
    assert.ok(res.totalScore >= 45 && res.totalScore < 65, 'Score should sit in Medium boundaries');
    assert.ok(res.reasons.some(r => r.includes('Local cluster impact')), 'Should describe local cluster');
  });

  runTest('Priority Calculation - Low Profile', () => {
    const res = calculatePriority({
      severity: 2,
      affectedPeopleCount: 12,
      urgency: 'Low',
      hasCoordinates: false,
      district: 'Khunti',
      evidenceCount: 0,
    });
    assert.strictEqual(res.level, 'LOW', 'Should resolve level as LOW');
    assert.ok(res.totalScore < 45, 'Score should remain below 45');
  });


  // 2. DUPLICATE DETECTION
  runTest('Duplicate Detection - Exact Match Identity', () => {
    const mockProblem: Problem = {
      id: 'P-101',
      title: 'Water logging in School',
      description: 'The school playground gets flooded during rains.',
      category: 'Water',
      location: { district: 'Ranchi', block: 'Bundu', latitude: 23.18, longitude: 85.58 },
      evidence: [],
      affectedPeopleCount: 300,
      frequency: 'Seasonal/Monsoon',
      urgency: 'High (Weeks)',
      durationMonths: 6,
      status: 'SUBMITTED',
      submittedBy: 'citizen-1',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const res = calculateProblemSemanticSimilarity(mockProblem, mockProblem);
    assert.strictEqual(res.score, 100, 'Identical problems must be 100% similar');
    assert.strictEqual(res.why.sameDistrict, true);
    assert.strictEqual(res.why.sameCategory, true);
  });

  runTest('Duplicate Detection - Highly Similar Geographically & Categorically', () => {
    const probA: Problem = {
      id: 'P-A',
      title: 'Monsoon Flooding at Bundu Girls School Corridor',
      description: 'Severe stagnation of muddy runoff water in primary classes during storms.',
      category: 'Education',
      location: { district: 'Ranchi', block: 'Bundu', latitude: 23.1812, longitude: 85.5849 },
      evidence: [],
      affectedPeopleCount: 400,
      frequency: 'Seasonal/Monsoon',
      urgency: 'High (Weeks)',
      durationMonths: 12,
      status: 'SUBMITTED',
      submittedBy: 'citizen-1',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const probB: Problem = {
      id: 'P-B',
      title: 'Rainwater Ingress and Classroom Waterlogging in Bundu School',
      description: 'Muddy drainage overflow floods compound and school rooms during downpours.',
      category: 'Education',
      location: { district: 'Ranchi', block: 'Bundu', latitude: 23.1820, longitude: 85.5860 }, // extremely close < 200m
      evidence: [],
      affectedPeopleCount: 450,
      frequency: 'Seasonal/Monsoon',
      urgency: 'High (Weeks)',
      durationMonths: 12,
      status: 'SUBMITTED',
      submittedBy: 'citizen-2',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const res = calculateProblemSemanticSimilarity(probA, probB);
    assert.ok(res.score >= 75, 'Should detect high multi-dimensional similarity for local overlapping reports');
    assert.strictEqual(res.why.sameDistrict, true, 'Same district must be validated');
    assert.strictEqual(res.why.sameBlock, true, 'Same block must be validated');
    assert.ok(res.why.distanceKm! < 1.0, 'Distance must register as very close');
  });

  runTest('Duplicate Detection - Completely Different Profile', () => {
    const probA: Problem = {
      id: 'P-A',
      title: 'Monsoon Flooding at Bundu Girls School Corridor',
      description: 'Severe stagnation of muddy runoff water in primary classes during storms.',
      category: 'Education',
      location: { district: 'Ranchi', block: 'Bundu', latitude: 23.1812, longitude: 85.5849 },
      evidence: [],
      affectedPeopleCount: 400,
      frequency: 'Seasonal/Monsoon',
      urgency: 'High (Weeks)',
      durationMonths: 12,
      status: 'SUBMITTED',
      submittedBy: 'citizen-1',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const probC: Problem = {
      id: 'P-C',
      title: 'Fluoride Contamination in Handpumps',
      description: 'Deep drinking tube wells test extremely high for fluoride causing skeletal discoloration.',
      category: 'Water',
      location: { district: 'Palamu', block: 'Daltonganj', latitude: 24.0192, longitude: 84.0621 }, // far away
      evidence: [],
      affectedPeopleCount: 1500,
      frequency: 'Continuous',
      urgency: 'Immediate Emergency',
      durationMonths: 36,
      status: 'SUBMITTED',
      submittedBy: 'citizen-3',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const res = calculateProblemSemanticSimilarity(probA, probC);
    assert.ok(res.score < 40, 'Divergent category and far coordinates should result in low similarity score');
    assert.strictEqual(res.why.sameDistrict, false, 'Should flag as different districts');
  });


  // 3. UNIVERSITY MATCHING
  runTest('University Matching - Validates Capability Matrix', () => {
    // Let's create a water problem
    const waterProblem: Problem = {
      id: 'P-W',
      title: 'Santhal Pargana Groundwater Arsenic Contamination',
      description: 'Borewells test over 0.08 mg/L for heavy metals and arsenic. Requires filtration systems.',
      category: 'Water',
      location: { district: 'Dumka', block: 'Ranishwar', latitude: 24.26, longitude: 87.25 },
      evidence: [],
      affectedPeopleCount: 2500,
      frequency: 'Continuous',
      urgency: 'Immediate Emergency',
      durationMonths: 24,
      status: 'VALIDATED',
      submittedBy: 'citizen-1',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const matches = matchUniversitiesForProblem(waterProblem);
    assert.ok(matches.length > 0, 'Should find institutional matches');
    
    // Prof. Rajeshwar Prasad of IIT ISM Dhanbad is a groundwater heavy metal / arsenic specialist.
    // Thus, IIT ISM Dhanbad should score highly.
    const iitMatch = matches.find(m => m.universityId === 'univ-iit-ism-dhanbad');
    assert.ok(iitMatch, 'IIT ISM Dhanbad must be in match candidates list');
    assert.ok(iitMatch.matchScore >= 70, 'IIT ISM Dhanbad must match highly for groundwater heavy metal problems');
    assert.ok(iitMatch.reasons.some(r => r.includes('remediation') || r.includes('purification') || r.includes('expert')), 'Should highlight faculty or department expertise');
  });


  // 4. INDUSTRY MATCHING
  runTest('Industry Matching - Matches CSR Themes & Hardware', () => {
    const agtechProblem: Problem = {
      id: 'P-AG',
      title: 'Tomato Cold Storage Rot',
      description: 'Farmers need smart solar powered refrigeration devices to prevent 40% tomato spoilages.',
      category: 'Agriculture',
      location: { district: 'Khunti', block: 'Murhu', latitude: 23.07, longitude: 85.27 },
      evidence: [],
      affectedPeopleCount: 1200,
      frequency: 'Seasonal/Monsoon',
      urgency: 'High (Weeks)',
      durationMonths: 12,
      status: 'VALIDATED',
      submittedBy: 'citizen-1',
      submitterName: 'Citizen Submitter',
      submittedAt: new Date().toISOString(),
    };

    const matches = matchIndustryForProblem(agtechProblem);
    assert.ok(matches.length > 0, 'Should find industry matches');

    // Jharkhand AgTech Accelerator has active hardware capabilities and solar dryer themes.
    const agtechMatch = matches.find(m => m.industryId === 'ind-jharkhand-agritech');
    assert.ok(agtechMatch, 'AgTech accelerator should match');
    assert.ok(agtechMatch.matchScore >= 60, 'Should possess high score matching agricultural refrigeration hardware');
  });


  // 5. RBAC
  runTest('RBAC - Permissions Matrix Verification', () => {
    // CITIZEN should have tracking and submission permissions but NEVER review/prioritize/validate
    assert.strictEqual(hasPermission('CITIZEN', 'problem:submit'), true, 'Citizen can submit');
    assert.strictEqual(hasPermission('CITIZEN', 'problem:track'), true, 'Citizen can track');
    assert.strictEqual(hasPermission('CITIZEN', 'problem:prioritize'), false, 'Citizen cannot prioritize');
    assert.strictEqual(hasPermission('CITIZEN', 'problem:validate'), false, 'Citizen cannot validate');

    // GOVERNMENT should be fully authorized for lifecycle actions
    assert.strictEqual(hasPermission('GOVERNMENT', 'problem:validate'), true, 'Government can validate');
    assert.strictEqual(hasPermission('GOVERNMENT', 'problem:prioritize'), true, 'Government can prioritize');
    assert.strictEqual(hasPermission('GOVERNMENT', 'project:approve_stage'), true, 'Government can approve project stage');

    // STUDENT should be restricted
    assert.strictEqual(hasPermission('STUDENT', 'problem:validate'), false, 'Student cannot validate problems');
    assert.strictEqual(hasPermission('STUDENT', 'project:approve_stage'), false, 'Student cannot approve project stage');
    assert.strictEqual(hasPermission('STUDENT', 'project:work_assigned_tasks'), true, 'Student can work on assigned tasks');

    // SUPER_ADMIN has god-eye permissions
    assert.strictEqual(hasPermission('SUPER_ADMIN', 'problem:validate'), true, 'Super admin has all permissions');
  });


  // 6. STATE TRANSITIONS
  runTest('State Transitions - Problem Workflow Guards', () => {
    // Under Review -> Validated requires GOVERNMENT
    const resA = validateProblemTransition('UNDER_REVIEW', 'VALIDATED', 'GOVERNMENT');
    assert.strictEqual(resA.allowed, true, 'Government can validate problem');

    const resB = validateProblemTransition('UNDER_REVIEW', 'VALIDATED', 'CITIZEN');
    assert.strictEqual(resB.allowed, false, 'Citizen cannot validate problems');
    assert.ok(resB.reason!.includes('Unauthorized'), 'Should report unauthorized error');

    // Submitting assignment to university requires VALIDATED status first
    const resC = validateProblemTransition('UNDER_REVIEW', 'ASSIGNED', 'GOVERNMENT');
    assert.strictEqual(resC.allowed, false, 'Cannot assign direct from Under Review without validation');
    assert.ok(resC.reason!.includes('must be in "VALIDATED" status'), 'Should state validation sequence rule');

    // Accept / Decline requires UNIVERSITY_ADMIN or FACULTY
    const resD = validateProblemTransition('ASSIGNED', 'ASSIGNED_ACCEPTED', 'FACULTY');
    assert.strictEqual(resD.allowed, true, 'Faculty lead can accept assignment');

    const resE = validateProblemTransition('ASSIGNED', 'ASSIGNED_ACCEPTED', 'GOVERNMENT');
    assert.strictEqual(resE.allowed, false, 'Government cannot accept assignment on behalf of university');
  });

  runTest('State Transitions - Project Lifecycle Gates', () => {
    // Proposed -> Approved requires GOVERNMENT
    const resA = validateProjectLifecycleTransition('PROPOSED', 'APPROVED', 'GOVERNMENT');
    assert.strictEqual(resA.allowed, true, 'Government can approve a proposal');

    const resB = validateProjectLifecycleTransition('PROPOSED', 'APPROVED', 'FACULTY');
    assert.strictEqual(resB.allowed, false, 'Faculty cannot approve their own state grant proposals');

    // Skip stage protection (Proposed -> Testing skips Approved, Research, Prototype)
    const resC = validateProjectLifecycleTransition('PROPOSED', 'TESTING', 'GOVERNMENT');
    assert.strictEqual(resC.allowed, false, 'Should block skipping stages');
    assert.ok(resC.reason!.includes('Cannot skip stages'), 'Should enforce linear progression checkpoints');
  });


  // 7. IMPACT CALCULATION & VERIFICATION (INTEGRATION WITH IN-MEMORY DB)
  runTest('Impact Verification - Real-world Updates', () => {
    // Re-seed DB to a clean known testing point
    db.resetGoldenDemo();

    const mockGovUser: User = {
      id: 'test-gov-01',
      name: 'Dr. Amitesh Sinha, IAS',
      email: 'secy.highered@jharkhand.gov.in',
      role: 'GOVERNMENT',
    };

    // Grab or initialize a sample project to work on
    const projs = db.getStatsSummary(false); // get live db numbers
    const sampleProj: Project = {
      id: 'PR-TEST-001',
      problemId: 'JH-2026-00124',
      problemTitle: 'Bundu Flood Ingress',
      title: 'Bundu Floodwater Mitigation System',
      summary: 'Integrated IoT sensor & bypass conduit deployment',
      universityId: 'univ-bit-mesra',
      universityName: 'BIT Mesra',
      facultyMentorName: 'Dr. Anand Kumar Mishra',
      facultyMentorEmail: 'akmishra@bitmesra.ac.in',
      department: 'Civil Engineering',
      studentTeam: [],
      objectives: ['Deploy IoT sensor node', 'Create drain bypass channels'],
      scope: 'School perimeter and classrooms',
      budgetEst: '₹5,00,000',
      timelineMonths: 6,
      status: 'DEPLOYED',
      milestones: [],
      supportRequests: [],
      tests: [],
      citizenFeedbacks: [],
      impactKPIs: [
        {
          id: 'kpi-01',
          kpiName: 'School Closure Days',
          baseline: '22 days/year',
          target: '0 days',
          actual: '0 days/year',
          improvementPercentage: 100,
          unit: 'days/year',
          evidenceUrls: [],
          claimedBy: 'University Team',
          claimedAt: new Date().toISOString(),
          verificationStatus: 'CLAIMED',
          isVerifiedByGovernment: false,
        },
        {
          id: 'kpi-02',
          kpiName: 'Dengue Incidents',
          baseline: '14 incidents/season',
          target: '0 infections',
          actual: '0 infections',
          improvementPercentage: 100,
          unit: 'infections/season',
          evidenceUrls: [],
          claimedBy: 'University Team',
          claimedAt: new Date().toISOString(),
          verificationStatus: 'CLAIMED',
          isVerifiedByGovernment: false,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Inject this project directly into our DB schema securely
    // In db.ts, projects are in database data. Let's add it via a helper or direct injection
    // Since direct in-memory manipulation works best:
    (db as any).data.projects.push(sampleProj);

    // Call verify project impact KPI
    const updatedProj = db.verifyProjectImpact({
      projectId: 'PR-TEST-001',
      kpiIndex: 0,
      verifierUser: mockGovUser,
    });

    assert.strictEqual(updatedProj.impactKPIs[0].isVerifiedByGovernment, true, 'KPI 0 should be marked as verified');
    assert.strictEqual(updatedProj.impactKPIs[0].verifiedBy, 'Dr. Amitesh Sinha, IAS', 'Verified official name must match');
    assert.strictEqual(updatedProj.impactKPIs[1].isVerifiedByGovernment, false, 'KPI 1 should remain unverified until triggered');
  });


  // 8. REPLICATION BLUEPRINTS
  runTest('Blueprint Replication - Flow & Notifications', () => {
    db.resetGoldenDemo();

    const mockAdminUser: User = {
      id: 'test-user-admin',
      name: 'Prof. Indranil Manna',
      email: 'vc@bitmesra.ac.in',
      role: 'UNIVERSITY_ADMIN',
    };

    // Solution reuse list in DB
    const blueprintId = 'reuse-bundu-flood-conduit';
    const sampleBlueprint = {
      id: blueprintId,
      problemCategory: 'Education' as const,
      title: 'Graded Solar Ultrasonic Hydro-Bypass Conduit',
      originalProjectId: 'PR-TEST-001',
      description: 'Detailed blueprint for low-cost modular surface water drain bypass.',
      replicationCount: 1,
      targetDistricts: ['Ranchi'],
      authorHEI: 'BIT Mesra',
      schematicFiles: [],
    };

    (db as any).data.solutionReuses.push(sampleBlueprint);

    // Replicate blueprint to another district
    const res = db.replicateBlueprint({
      blueprintId,
      targetDistrict: 'Khunti',
      user: mockAdminUser,
    });

    assert.strictEqual(res.id, blueprintId, 'Should replicate valid blueprint');
    
    // Check notification sent to Government Secretary
    const notifs = (db as any).data.notifications;
    const latestNotif = notifs.find((n: any) => n.title === 'Blueprint Replication Requested');
    assert.ok(latestNotif, 'Should generate alert notification to Government Command Center');
    assert.ok(latestNotif.message.includes('Prof. Indranil Manna'), 'Notification must mention requesting academic official');
  });


  // 9. AI FAILURE HANDLING
  runTest('AI Failure Handling - Falls Back to Deterministic Domain Mock', async () => {
    // Suppress GEMINI_API_KEY to trigger fallback
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const input = {
      title: 'Waterlogging at Kasturba Balika Vidyalaya',
      description: 'Stagnant muddy drainage water enters compound risking student dengue infections.',
      district: 'Ranchi',
      category: 'Education',
    };

    const analysis = await analyzeProblemWithAI(input);

    // Restore API key
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;

    assert.strictEqual(analysis.provider, 'mock', 'Should specify provider as mock in fallback mode');
    assert.strictEqual(analysis.category, 'Education', 'Should parse category correctly');
    assert.strictEqual(analysis.problemType, 'INNOVATION', 'Should deduce problem type from keyword analysis');
    assert.ok(analysis.requiredSkills.includes('Hydrology'), 'Fallback should deduce relevant engineering skills');
    assert.ok(analysis.requiredTechnologies.includes('Ultrasonic Level Sensors'), 'Fallback should output realistic solution bills of materials');
  });


  // 10. EXPLICIT UNAUTHORIZED ACTIONS
  runTest('Unauthorized Actions - Enforces Blocked Operations & Role Checks', () => {
    db.resetGoldenDemo();

    const mockStudentUser: User = {
      id: 'student-priya',
      name: 'Priya Kumari',
      email: 'priya@bitmesra.ac.in',
      role: 'STUDENT',
    };

    // Test Case A: STUDENT attempts to verify impact (restricted to GOVERNMENT)
    try {
      db.verifyProjectImpact({
        projectId: 'proj-golden-flood-01',
        kpiIndex: 0,
        verifierUser: mockStudentUser,
      });
      assert.fail('Should have thrown an authorization exception for student user');
    } catch (err: any) {
      assert.ok(err.message.includes('Only Government Officers'), 'Exception message should clearly deny access');
    }

    // Test Case B: STUDENT attempts to transition problem assignment (restricted to FACULTY/UNIVERSITY_ADMIN)
    const probTransition = validateProblemTransition('ASSIGNED', 'ASSIGNED_ACCEPTED', 'STUDENT');
    assert.strictEqual(probTransition.allowed, false, 'Student must not be allowed to accept institution assignments');
    assert.ok(probTransition.reason!.includes('Only University Administrators'), 'Reason should identify proper role requirements');

    // Test Case C: STUDENT attempts to approve pilot deployment stage (restricted to GOVERNMENT)
    const projTransition = validateProjectLifecycleTransition('PILOT', 'DEPLOYED', 'STUDENT');
    assert.strictEqual(projTransition.allowed, false, 'Student must not be allowed to approve project deployment');
    assert.ok(projTransition.reason!.includes('Students are restricted'), 'Should mention student operational limitations');
  });

  console.log('\n======================================================');
  console.log(`TEST SUITE COMPLETE: ${stats.passed} Passed, ${stats.failed} Failed`);
  console.log('======================================================');

  if (stats.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Execute suite
runTestSuite();
