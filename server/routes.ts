import { validateFileSecurity, validateEvidenceOwnership, canUserAccessEvidence } from './uploadSecurity';
import { GoogleGenAI } from '@google/genai';
/**
 * JH Innovation Hub - Express API Routes
 * Endpoints for Auth, Problems, AI Intelligence, Government Validation,
 * University Matching, Industry Support, Milestones, Testing/Pilot/Deployment,
 * Impact Measurement, Knowledge Reuse, and Golden Demo Walkthrough.
 */

import { Request, Response, Router } from 'express';
import { analyzeProblemWithAI, JH_AI_ENGINE } from './ai';
import { db, JHARKHAND_DISTRICTS, PRESET_USERS } from './db';
import { findDuplicateCandidates } from './duplicate';
import { matchIndustryForProblem, matchUniversitiesForProblem } from './matching';
import {
  hasPermission,
  isStudentAssignedToProject,
  normalizeRole,
  requirePermission,
  requireRoles,
  ROLE_PERMISSIONS,
  validateProblemTransition,
  validateProjectLifecycleTransition,
} from './rbac';

export const apiRouter = Router();

// Current active user in-memory session helper
let currentActiveUserId = 'user-citizen-ramesh';
const customUsers: any[] = [];

function getAllUsers(): any[] {
  return [...PRESET_USERS, ...customUsers];
}

function getCurrentUser(): any {
  return getAllUsers().find((u) => u.id === currentActiveUserId) || PRESET_USERS[0];
}

// Global Auth Context Middleware
apiRouter.use((req: Request, _res: Response, next) => {
  const headerUserId = req.headers['x-user-id'] as string;
  const headerUserRole = req.headers['x-user-role'] as string;
  const headerUserEmail = req.headers['x-user-email'] as string;
  const headerUserName = req.headers['x-user-name'] ? decodeURIComponent(req.headers['x-user-name'] as string) : undefined;

  let resolvedUser: any;
  if (headerUserId || headerUserEmail) {
    resolvedUser = getAllUsers().find((u) =>
      (headerUserId && (u.id === headerUserId || u.id.replace('user-', 'usr-') === headerUserId.replace('user-', 'usr-'))) ||
      (headerUserEmail && u.email && u.email.toLowerCase() === headerUserEmail.toLowerCase())
    );
    if (!resolvedUser && (headerUserId || headerUserEmail)) {
      resolvedUser = {
        id: headerUserId || `usr-${Date.now()}`,
        name: headerUserName || 'Authenticated User',
        email: headerUserEmail || `${headerUserId}@hub.jharkhand.gov.in`,
        role: headerUserRole || 'CITIZEN',
      };
    } else if (resolvedUser && headerUserRole) {
      // Allow overriding role if preset was loaded under different role enum
      resolvedUser = { ...resolvedUser, role: headerUserRole };
    }
  }

  if (!resolvedUser) {
    resolvedUser = getCurrentUser();
  }

  (req as any).user = resolvedUser;
  next();
});

// 1. Auth & Multi-Platform Login System
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(user.role);
  res.json({
    user,
    normalizedRole: normRole,
    permissions: ROLE_PERMISSIONS[normRole] || [],
    availableUsers: getAllUsers(),
  });
});

// RBAC Audit and Permissions Discovery
apiRouter.get('/rbac/permissions', (req: Request, res: Response) => {
  const user = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(user.role);
  res.json({
    currentRole: normRole,
    currentUser: user,
    permissions: ROLE_PERMISSIONS[normRole] || [],
    allRolePermissions: ROLE_PERMISSIONS,
  });
});

apiRouter.get('/auth/providers', (req: Request, res: Response) => {
  res.json({
    providers: [
      {
        id: 'google',
        name: 'Google',
        configured: !!process.env.GOOGLE_CLIENT_ID,
        icon: 'google',
        color: '#4285F4',
        popular: true,
      },
      {
        id: 'facebook',
        name: 'Facebook',
        configured: !!process.env.FACEBOOK_APP_ID,
        icon: 'facebook',
        color: '#1877F2',
      },
      {
        id: 'github',
        name: 'GitHub',
        configured: !!process.env.GITHUB_CLIENT_ID,
        icon: 'github',
        color: '#24292F',
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        configured: !!process.env.LINKEDIN_CLIENT_ID,
        icon: 'linkedin',
        color: '#0A66C2',
      },
      {
        id: 'meripehchaan',
        name: 'MeriPehchaan (Gov SSO)',
        configured: true,
        icon: 'gov',
        color: '#EA580C',
        official: true,
      },
    ],
  });
});

apiRouter.get('/auth/url', (req: Request, res: Response) => {
  const provider = (req.query.provider as string) || 'google';
  const role = (req.query.role as string) || 'CITIZEN';
  const appUrl = process.env.APP_URL || '';

  if (provider === 'google' && process.env.GOOGLE_CLIENT_ID) {
    const redirectUri = `${appUrl}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: JSON.stringify({ provider: 'google', role }),
    });
    return res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  }

  if (provider === 'facebook' && process.env.FACEBOOK_APP_ID) {
    const redirectUri = `${appUrl}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
      redirect_uri: redirectUri,
      scope: 'email,public_profile',
      state: JSON.stringify({ provider: 'facebook', role }),
    });
    return res.json({ url: `https://www.facebook.com/v19.0/dialog/oauth?${params}` });
  }

  if (provider === 'github' && process.env.GITHUB_CLIENT_ID) {
    const redirectUri = `${appUrl}/auth/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state: JSON.stringify({ provider: 'github', role }),
    });
    return res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
  }

  // Interactive sandbox / popup OAuth authorization endpoint
  const mockUrl = `/auth/oauth-mock?provider=${encodeURIComponent(provider)}&role=${encodeURIComponent(role)}`;
  res.json({ url: mockUrl });
});

apiRouter.post('/auth/oauth-login', (req: Request, res: Response) => {
  const {
    provider = 'google',
    email = 'swachh64@gmail.com',
    name = 'Verified User',
    role = 'CITIZEN',
    district = 'Ranchi',
    avatarUrl,
    organizationName,
  } = req.body;

  let existing = getAllUsers().find((u) => u.email === email || (u.authProviderId && u.authProviderId === email));

  if (!existing) {
    const newUser = {
      id: `usr-${provider}-${Date.now().toString().slice(-6)}`,
      name,
      email,
      role,
      district,
      organizationName: organizationName || (role === 'GOVERNMENT_OFFICER' ? 'Govt of Jharkhand' : role === 'FACULTY' ? 'BIT Mesra' : role === 'INDUSTRY_PARTNER' ? 'Tata Steel Foundation' : undefined),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      authProvider: provider,
      authProviderId: email,
      verified: true,
    };
    customUsers.push(newUser);
    existing = newUser;
  } else {
    existing.authProvider = provider;
    existing.verified = true;
    if (name) existing.name = name;
    if (district) existing.district = district;
    if (role) existing.role = role;
  }

  currentActiveUserId = existing.id;
  res.json({
    success: true,
    user: existing,
    token: `jh-oauth-token-${provider}-${Date.now()}`,
    availableUsers: getAllUsers(),
  });
});

apiRouter.post('/auth/email-login', (req: Request, res: Response) => {
  const { email, name, role = 'CITIZEN', district = 'Ranchi', password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email or phone is required' });
  }

  let existing = getAllUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!existing) {
    const formattedName = name || email.split('@')[0];
    const newUser = {
      id: `usr-email-${Date.now().toString().slice(-6)}`,
      name: formattedName.charAt(0).toUpperCase() + formattedName.slice(1),
      email,
      role,
      district,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
      authProvider: 'email',
      verified: true,
    };
    customUsers.push(newUser);
    existing = newUser;
  } else {
    if (role) existing.role = role;
    if (district) existing.district = district;
  }

  currentActiveUserId = existing.id;
  res.json({
    success: true,
    user: existing,
    token: `jh-email-token-${Date.now()}`,
    availableUsers: getAllUsers(),
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  // Reset to default citizen or guest
  currentActiveUserId = 'user-citizen-ramesh';
  res.json({ success: true, user: PRESET_USERS[0] });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { userId } = req.body;
  const normalizedId = (userId || '').trim();
  const found = getAllUsers().find(
    (u) =>
      u.id === normalizedId ||
      u.id.replace('user-', 'usr-') === normalizedId.replace('user-', 'usr-') ||
      u.id.replace('usr-', 'user-') === normalizedId.replace('usr-', 'user-')
  );
  if (!found) {
    return res.status(404).json({ error: 'User persona not found' });
  }
  currentActiveUserId = found.id;
  res.json({ success: true, user: found });
});

// 2. Districts & Metadata
apiRouter.get('/districts', (req: Request, res: Response) => {
  res.json({ districts: JHARKHAND_DISTRICTS });
});

apiRouter.get('/stats', (req: Request, res: Response) => {
  const isDemo = req.query.mode !== 'real';
  const summary = db.getStatsSummary(isDemo);
  res.json(summary);
});

// 3. Citizen Problem Submission & Query
apiRouter.get('/problems', (req: Request, res: Response) => {
  const { district, category, status, priority, route, search } = req.query;
  const problems = db.getProblems({
    district: district as string,
    category: category as string,
    status: status as string,
    priority: priority as string,
    route: route as string,
    search: search as string,
  });
  res.json({ problems, total: problems.length });
});

apiRouter.post('/problems', requirePermission('problem:submit'), async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category,
      location,
      evidence = [],
      affectedPeopleCount = 100,
      frequency = 'Weekly',
      urgency = 'High (Weeks)',
      durationMonths = 6,
      skipAI = false,
    } = req.body;

    if (!title || !description || !location?.district) {
      return res.status(400).json({ error: 'Title, description, and district are mandatory.' });
    }

    const currentUser = (req as any).user || getCurrentUser();

    // 1. Create Problem in DB
    const problem = db.submitProblem({
      title,
      description,
      category: category || 'Urban Infrastructure',
      location,
      evidence,
      affectedPeopleCount: Number(affectedPeopleCount),
      frequency,
      urgency,
      durationMonths: Number(durationMonths),
      submittedBy: currentUser.id,
      submitterName: currentUser.name,
      submitterPhone: currentUser.phone,
    });

    let warning;

    // 2. Trigger AI Understanding
    if (!skipAI) {
      try {
        const analysis = await analyzeProblemWithAI({
          title,
          description,
          district: location.district,
          block: location.block,
          category,
          affectedPeopleCount: Number(affectedPeopleCount),
          urgency,
          frequency,
        });
        db.updateProblemAIAnalysis(problem.id, analysis);
      } catch (err) {
        console.warn('Background AI analysis failed:', err);
        warning = 'AI analysis temporarily unavailable. Your problem has been saved.';
      }
    }

    const updated = db.getProblemById(problem.id);
    res.status(201).json({ success: true, problem: updated, warning });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit problem' });
  }
});

apiRouter.post('/problems/:id/retry-ai', async (req: Request, res: Response) => {
  try {
    const problem = db.getProblemById(req.params.id);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    const analysis = await analyzeProblemWithAI({
      title: problem.title,
      description: problem.description,
      district: problem.location.district,
      block: problem.location.block || '',
      category: problem.category,
      affectedPeopleCount: problem.affectedPeopleCount,
      urgency: problem.urgency,
      frequency: problem.frequency,
    });
    db.updateProblemAIAnalysis(problem.id, analysis);
    const updated = db.getProblemById(problem.id);
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'AI analysis temporarily unavailable. Please try again later.' });
  }
});

// Upload Evidence to an existing problem (Citizen or Government)
// File Validation Endpoint (MIME type, Extension, Size)
apiRouter.post('/files/validate', (req: Request, res: Response) => {
  const { fileName, mimeType, fileSize, fileSizeBytes, type } = req.body;
  const result = validateFileSecurity({ fileName, mimeType, fileSize, fileSizeBytes, type });
  if (!result.valid) {
    return res.status(400).json({ success: false, error: result.error });
  }
  res.json({ success: true, validation: result });
});

// Secure Evidence Upload with MIME, Extension, Size, Ownership, & Access Controls
apiRouter.post('/problems/:id/evidence', requirePermission('problem:upload_evidence'), (req: Request, res: Response) => {
  const { type = 'image', url, caption, fileName, fileSize, fileSizeBytes, mimeType } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  if (!url) {
    return res.status(400).json({ error: 'Evidence URL or file reference is required.' });
  }

  try {
    const updated = db.addProblemEvidence({
      problemId: req.params.id,
      evidence: { type, url, caption, fileName, fileSize, fileSizeBytes, mimeType },
      user: currentUser,
    });
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    const isForbidden = err.message && (err.message.includes('Ownership') || err.message.includes('Permission') || err.message.includes('Unauthorized'));
    res.status(isForbidden ? 403 : 400).json({ error: err.message });
  }
});

// Secure Evidence Access Control (Evidence does not automatically become public)
apiRouter.get('/problems/:id/evidence', (req: Request, res: Response) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const currentUser = (req as any).user || getCurrentUser();
  const allEvidence = problem.evidence || [];
  
  const accessibleEvidence = allEvidence.filter((ev) => canUserAccessEvidence(problem, ev, currentUser).allowed);
  const restrictedCount = allEvidence.length - accessibleEvidence.length;

  res.json({
    problemId: problem.id,
    evidence: accessibleEvidence,
    totalEvidence: allEvidence.length,
    accessibleCount: accessibleEvidence.length,
    restrictedCount,
    notice: restrictedCount > 0 ? restrictedCount + ' private evidence file(s) are restricted to authorized owners and officials.' : undefined
  });
});

apiRouter.get('/problems/:id/evidence/:evidenceId', (req: Request, res: Response) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const evidence = (problem.evidence || []).find((ev) => ev.id === req.params.evidenceId);
  if (!evidence) return res.status(404).json({ error: 'Evidence file not found' });

  const currentUser = (req as any).user || getCurrentUser();
  const access = canUserAccessEvidence(problem, evidence, currentUser);

  if (!access.allowed) {
    return res.status(403).json({
      error: access.reason || 'Access Denied: Evidence is private and restricted.',
      isPublic: false
    });
  }

  res.json({ success: true, evidence, isPublic: evidence.isPublic || false });
});

apiRouter.get('/problems/:id', (req: Request, res: Response) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const currentUser = (req as any).user || getCurrentUser();
  // Filter evidence so evidence does NOT automatically become public to unauthorized users
  const securedProblem = {
    ...problem,
    evidence: (problem.evidence || []).filter((ev) => canUserAccessEvidence(problem, ev, currentUser).allowed)
  };

  // Calculate matching HEIs and Industry
  const matchedUniversities = matchUniversitiesForProblem(problem);
  const matchedIndustry = matchIndustryForProblem(problem);

  // Duplicate candidates
  const allProblems = db.getProblems();
  const duplicateCandidates = findDuplicateCandidates(problem, allProblems, 60);

  // Associated project if any
  const project = problem.projectId ? db.getProjectById(problem.projectId) : db.getProjectByProblemId(problem.id);

  res.json({
    problem: securedProblem,
    matchedUniversities,
    matchedIndustry,
    duplicateCandidates,
    project,
  });
});

// Trigger or retry AI Analysis
apiRouter.post('/problems/:id/ai-analyze', async (req: Request, res: Response) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  try {
    const analysis = await analyzeProblemWithAI({
      title: problem.title,
      description: problem.description,
      district: problem.location.district,
      block: problem.location.block,
      category: problem.category,
      affectedPeopleCount: problem.affectedPeopleCount,
      urgency: problem.urgency,
      frequency: problem.frequency,
      providerMode: req.body.providerMode,
    });

    const updated = db.updateProblemAIAnalysis(problem.id, analysis);
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'AI analysis temporarily unavailable. Problem saved successfully. Retry Analysis.' });
  }
});

// Semantic Duplicate Detection Endpoint
apiRouter.get('/problems/:id/duplicates', (req: Request, res: Response) => {
  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const allProblems = db.getProblems();
  const duplicateCandidates = findDuplicateCandidates(problem, allProblems, 50);

  // Fetch linked cluster if exists
  const masterCluster = problem.masterClusterId ? db.getClusterById(problem.masterClusterId) : undefined;

  res.json({
    problemId: problem.id,
    title: problem.title,
    duplicateCandidates,
    masterCluster,
    totalFound: duplicateCandidates.length,
  });
});

// Human Decision on Duplicate Candidate: REVIEW | MERGE | KEEP_SEPARATE
// Strictly enforces human-in-the-loop (never auto-merged)
apiRouter.post('/problems/:id/duplicate-decision', requirePermission('problem:validate'), (req: Request, res: Response) => {
  const { candidateProblemId, action, notes, clusterTitle } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  if (!candidateProblemId) {
    return res.status(400).json({ error: 'candidateProblemId is required' });
  }

  if (action !== 'REVIEW' && action !== 'MERGE' && action !== 'KEEP_SEPARATE') {
    return res.status(400).json({
      error: `Invalid action "${action}". Allowed options: REVIEW, MERGE, KEEP_SEPARATE.`,
    });
  }

  try {
    const result = db.handleDuplicateDecision({
      targetProblemId: req.params.id,
      candidateProblemId,
      action,
      notes,
      clusterTitle,
      user: currentUser,
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List Master Problem Clusters
apiRouter.get('/clusters', (req: Request, res: Response) => {
  const clusters = db.getClusters();
  res.json({ clusters, total: clusters.length });
});

apiRouter.get('/clusters/:id', (req: Request, res: Response) => {
  const cluster = db.getClusterById(req.params.id);
  if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

  const constituentProblems = cluster.problemIds.map((id) => db.getProblemById(id)).filter(Boolean);
  res.json({ cluster, constituentProblems });
});

// 4. Government Validation Workflow
apiRouter.post('/problems/:id/validate', requirePermission('problem:validate'), (req: Request, res: Response) => {
  const { decision, routedTo, notes = '', clarificationRequest } = req.body;
  const currentUser = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(currentUser.role);

  if (!decision || !routedTo) {
    return res.status(400).json({ error: 'Decision and routedTo are required.' });
  }

  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  // Prevent unauthorized workflow transitions
  const transitionCheck = validateProblemTransition(problem.status, decision, normRole);
  if (!transitionCheck.allowed) {
    return res.status(403).json({
      error: transitionCheck.reason,
      code: 'WORKFLOW_TRANSITION_FORBIDDEN',
      currentStatus: problem.status,
      targetStatus: decision,
      actorRole: normRole,
    });
  }

  try {
    const updated = db.validateProblem({
      problemId: req.params.id,
      decision,
      routedTo,
      notes,
      validatorUser: currentUser,
      clarificationRequest,
    });
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Government Problem Prioritization
apiRouter.post('/problems/:id/prioritize', requirePermission('problem:prioritize'), (req: Request, res: Response) => {
  const { totalScore, level, reasons } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  try {
    const updated = db.prioritizeProblem({
      problemId: req.params.id,
      totalScore: totalScore !== undefined ? Number(totalScore) : undefined,
      level,
      reasons,
      user: currentUser,
    });
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Assign Problem to University / Department (Government Only)
apiRouter.post('/problems/:id/assign', requirePermission('problem:assign_institution'), (req: Request, res: Response) => {
  const { universityId, universityName, departmentName } = req.body;
  const currentUser = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(currentUser.role);

  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  // Workflow validation for institution assignment
  const transitionCheck = validateProblemTransition(problem.status, 'ASSIGNED', normRole);
  if (!transitionCheck.allowed) {
    return res.status(400).json({
      error: transitionCheck.reason,
      code: 'WORKFLOW_TRANSITION_FORBIDDEN',
      currentStatus: problem.status,
    });
  }

  try {
    const updated = db.assignProblemToUniversity({
      problemId: req.params.id,
      universityId,
      universityName,
      departmentName,
      assignedByUser: currentUser,
    });
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// University Accept / Decline Assigned Problem
apiRouter.post('/problems/:id/university-response', requirePermission('problem:accept_decline_assignment'), (req: Request, res: Response) => {
  const { decision, notes } = req.body;
  const currentUser = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(currentUser.role);

  if (decision !== 'ACCEPT' && decision !== 'DECLINE') {
    return res.status(400).json({ error: 'Decision must be "ACCEPT" or "DECLINE".' });
  }

  const problem = db.getProblemById(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });

  const targetStatus = decision === 'ACCEPT' ? 'ASSIGNED_ACCEPTED' : 'ASSIGNED_DECLINED';
  const transitionCheck = validateProblemTransition(problem.status, targetStatus, normRole);
  if (!transitionCheck.allowed) {
    return res.status(403).json({
      error: transitionCheck.reason,
      code: 'WORKFLOW_TRANSITION_FORBIDDEN',
      currentStatus: problem.status,
      targetStatus,
    });
  }

  try {
    const updated = db.universityRespondToAssignment({
      problemId: req.params.id,
      decision,
      user: currentUser,
      notes,
    });
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// University Admin: Assign Faculty Lead to Problem
apiRouter.post('/problems/:id/assign-faculty', requirePermission('institution:assign_faculty'), (req: Request, res: Response) => {
  const { facultyName, facultyEmail, department } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  if (!facultyName || !facultyEmail) {
    return res.status(400).json({ error: 'Faculty name and email are required.' });
  }

  try {
    const updated = db.assignFacultyToProblem({
      problemId: req.params.id,
      facultyName,
      facultyEmail,
      department,
      user: currentUser,
    });
    res.json({ success: true, problem: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Projects & Teams
apiRouter.get('/projects', (req: Request, res: Response) => {
  const projects = db.getProjects();
  res.json({ projects, total: projects.length });
});

apiRouter.get('/projects/:id', (req: Request, res: Response) => {
  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const problem = db.getProblemById(project.problemId);
  res.json({ project, problem });
});

// University: Submit Proposal (Create Project from Problem)
apiRouter.post('/projects', requirePermission('project:submit_proposal'), (req: Request, res: Response) => {
  const {
    problemId,
    title,
    summary,
    universityId,
    universityName,
    facultyMentorName,
    facultyMentorEmail,
    department,
    studentTeam = [],
    objectives = [],
    scope = '',
    budgetEst = '₹2,50,000',
    timelineMonths = 6,
    milestones = [],
  } = req.body;

  if (!problemId || !title || !universityName) {
    return res.status(400).json({ error: 'problemId, title, and universityName are required.' });
  }

  const problem = db.getProblemById(problemId);
  if (!problem) return res.status(404).json({ error: `Problem ${problemId} not found.` });

  // Cannot submit proposal on a rejected problem
  if (problem.status === 'REJECTED') {
    return res.status(400).json({
      error: 'Cannot submit proposal for a rejected problem.',
      code: 'PROBLEM_REJECTED',
    });
  }

  try {
    const project = db.createProjectFromProblem({
      problemId,
      title,
      summary: summary || title,
      universityId: universityId || 'univ-bit-mesra',
      universityName,
      facultyMentorName: facultyMentorName || 'Faculty Coordinator',
      facultyMentorEmail: facultyMentorEmail || 'faculty@university.edu.in',
      department: department || 'Engineering',
      studentTeam,
      objectives,
      scope,
      budgetEst,
      timelineMonths: Number(timelineMonths),
      milestones,
    });
    res.status(201).json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Form/Update Student Teams (University Admin or Faculty)
apiRouter.post('/projects/:id/team', requirePermission('institution:form_teams'), (req: Request, res: Response) => {
  const { studentTeam = [] } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  try {
    const project = db.updateProjectTeam({
      projectId: req.params.id,
      studentTeam,
      user: currentUser,
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Work on Project Milestones & Tasks
// Constraint: Students can ONLY work on assigned projects/tasks
apiRouter.post('/projects/:id/milestones', (req: Request, res: Response) => {
  const { milestoneId, progressPercent, status, deliverables, evidenceUrl, comments, completed } = req.body;
  const currentUser = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(currentUser.role);

  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Student Authorization Check: Must be assigned to this project
  if (normRole === 'STUDENT') {
    if (!isStudentAssignedToProject(currentUser, project)) {
      return res.status(403).json({
        error: `Access Denied: Students can only work on assigned projects/tasks. You are not assigned to project "${project.title}".`,
        code: 'STUDENT_NOT_ASSIGNED',
        user: currentUser.name,
        assignedTeam: project.studentTeam,
      });
    }
  } else if (
    normRole !== 'FACULTY' &&
    normRole !== 'UNIVERSITY_ADMIN' &&
    normRole !== 'SUPER_ADMIN'
  ) {
    return res.status(403).json({
      error: `Access Denied: Role "${normRole}" cannot modify project tasks or milestones. Allowed: Faculty, University Admin, or Assigned Students.`,
      code: 'ROLE_FORBIDDEN',
    });
  }

  try {
    const updated = db.updateProjectMilestone({
      projectId: req.params.id,
      milestoneId,
      progressPercent: Number(progressPercent),
      status,
      deliverables,
      evidenceUrl,
      comments,
      completed,
      updatedBy: currentUser.name,
    });
    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// View open support requests across projects (Industry, Mentors, University, Gov)
apiRouter.get('/support-requests', requirePermission('support_request:view'), (req: Request, res: Response) => {
  const projects = db.getProjects();
  const allRequests: any[] = [];
  projects.forEach((p) => {
    const parentProblem = p.problemId ? db.getProblemById(p.problemId) : undefined;
    (p.supportRequests || []).forEach((sr) => {
      allRequests.push({
        ...sr,
        projectId: p.id,
        projectTitle: p.title,
        universityName: p.universityName,
        district: parentProblem?.location?.district || 'Jharkhand',
      });
    });
  });
  res.json({ supportRequests: allRequests });
});

// Support Requests & Industry Collaboration
apiRouter.post('/projects/:id/support-requests', requirePermission('project:manage'), (req: Request, res: Response) => {
  const { supportType, description, estimatedValue, timeline } = req.body;

  try {
    const project = db.addProjectSupportRequest({
      projectId: req.params.id,
      supportType,
      description,
      estimatedValue,
      timeline: timeline || 'Within 2 weeks',
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Offer Industry Mentorship/Resources/Funding/Technology
// Strictly restricted to Industry and Mentors
apiRouter.post(
  '/projects/:id/support-requests/:requestId/offer',
  requirePermission('support_request:offer'),
  (req: Request, res: Response) => {
    const { notes } = req.body;
    const currentUser = (req as any).user || getCurrentUser();
    const normRole = normalizeRole(currentUser.role);

    if (normRole !== 'INDUSTRY' && normRole !== 'MENTOR' && normRole !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: `Access Denied: Only Industry Partners and Mentors can offer funding, mentorship, or technology support. Current role: "${normRole}".`,
        code: 'ROLE_FORBIDDEN',
      });
    }

    try {
      const project = db.offerIndustrySupport({
        projectId: req.params.id,
        supportRequestId: req.params.requestId,
        industryUser: currentUser,
        notes,
      });
      res.json({ success: true, project });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// Advance Project Lifecycle (Prototype -> Testing -> Pilot -> Deployed)
// Enforces workflow transition rules
apiRouter.post('/projects/:id/lifecycle', (req: Request, res: Response) => {
  const { newStatus, recordData } = req.body;
  const currentUser = (req as any).user || getCurrentUser();
  const normRole = normalizeRole(currentUser.role);

  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Check state machine progression
  const transitionCheck = validateProjectLifecycleTransition(project.status, newStatus, normRole);
  if (!transitionCheck.allowed) {
    return res.status(403).json({
      error: transitionCheck.reason,
      code: 'WORKFLOW_TRANSITION_FORBIDDEN',
      currentStatus: project.status,
      targetStatus: newStatus,
      role: normRole,
    });
  }

  try {
    const updated = db.advanceProjectLifecycle({
      projectId: req.params.id,
      newStatus,
      actor: currentUser,
      recordData,
    });
    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Government: Approve Project Stage (e.g. Approved grant or Pilot clearance)
apiRouter.post('/projects/:id/approve-stage', requirePermission('project:approve_stage'), (req: Request, res: Response) => {
  const { newStage, notes } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  if (!newStage) {
    return res.status(400).json({ error: 'newStage is required.' });
  }

  try {
    const project = db.approveProjectStage({
      projectId: req.params.id,
      newStage,
      user: currentUser,
      notes,
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Government: Approve or Reject Project Deployment Record
apiRouter.post('/projects/:id/approve-deployment', requirePermission('project:approve_stage'), (req: Request, res: Response) => {
  const { approvalStatus, notes } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  if (!approvalStatus) {
    return res.status(400).json({ error: 'approvalStatus is required.' });
  }

  try {
    const project = db.approveProjectDeployment({
      projectId: req.params.id,
      approvalStatus,
      notes,
      user: currentUser,
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Government Command Center Delayed Project Intervention
apiRouter.post('/projects/:id/intervene', requirePermission('problem:validate'), (req: Request, res: Response) => {
  const { actionType, notes, newDeadline } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  try {
    const project = db.interveneDelayedProject({
      projectId: req.params.id,
      actionType: actionType || 'CLEAR_BOTTLENECK',
      notes: notes || 'State fast-track clearance authorized',
      officerUser: currentUser,
      newDeadline,
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Government Impact Verification
apiRouter.post('/projects/:id/verify-impact', requirePermission('project:verify_impact'), (req: Request, res: Response) => {
  const { kpiIndex } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  try {
    const project = db.verifyProjectImpact({
      projectId: req.params.id,
      kpiIndex: Number(kpiIndex),
      verifierUser: currentUser,
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Citizen Post-Deployment Feedback
// Restricted to CITIZEN, and only valid for projects in PILOT, DEPLOYED, or COMPLETED
apiRouter.post('/projects/:id/feedback', requirePermission('project:give_feedback'), (req: Request, res: Response) => {
  const {
    citizenName,
    district,
    block,
    village,
    solutionSolvedStatus = 'SOLVED',
    rating,
    feedbackText,
    evidenceUrls = [],
    evidenceDescription,
    isOriginalSubmitter = true,
    isBeneficiary = true,
  } = req.body;
  const currentUser = (req as any).user || getCurrentUser();

  const project = db.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  if (project.status !== 'PILOT' && project.status !== 'DEPLOYED' && project.status !== 'COMPLETED') {
    return res.status(400).json({
      error: `Citizen feedback is only permitted once a solution reaches PILOT or DEPLOYED status. Current project stage is "${project.status}".`,
      code: 'STAGE_PREMATURE_FOR_FEEDBACK',
    });
  }

  try {
    const updated = db.addCitizenFeedback({
      projectId: req.params.id,
      citizenName: citizenName || currentUser.name || 'Community Resident',
      district: district || currentUser.district || 'Ranchi',
      block: block || currentUser.block || 'Bundu',
      village: village || 'Village Ward',
      solutionSolvedStatus,
      rating: Number(rating),
      feedbackText,
      evidenceUrls,
      evidenceDescription,
      isOriginalSubmitter,
      isBeneficiary,
    });
    res.json({ success: true, project: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Knowledge & Solution Reuse
apiRouter.get('/solutions/reuse', (req: Request, res: Response) => {
  const solutions = db.getSolutionReuses();
  res.json({ solutions, total: solutions.length });
});

apiRouter.post('/projects/:id/request-impact-verification', (req: Request, res: Response) => {
  const currentUser = (req as any).user || getCurrentUser();
  try {
    const project = db.requestImpactVerification({
      projectId: req.params.id,
      user: currentUser,
    });
    res.json({ success: true, project });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/blueprints/:id/replicate', (req: Request, res: Response) => {
  const { targetDistrict } = req.body;
  const currentUser = (req as any).user || getCurrentUser();
  try {
    const blueprint = db.replicateBlueprint({
      blueprintId: req.params.id,
      targetDistrict,
      user: currentUser,
    });
    res.json({ success: true, blueprint });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Notifications & Audit Logs
apiRouter.get('/notifications', (req: Request, res: Response) => {
  const currentUser = getCurrentUser();
  const notifications = db.getNotifications(currentUser.role);
  res.json({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
});

apiRouter.post('/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationAsRead(req.params.id);
  res.json({ success: true });
});

apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const objectId = (req.query.objectId as string) || (req.query.entityId as string) || (req.query.problemId as string) || (req.query.projectId as string);
  let logs = db.getAuditLogs();
  if (objectId) {
    logs = db.getAuditLogsForObject(objectId);
  }
  res.json({ logs, total: logs.length });
});

apiRouter.get('/audit-logs/:objectId', (req: Request, res: Response) => {
  const objectId = req.params.objectId;
  const logs = db.getAuditLogsForObject(objectId);
  res.json({ objectId, logs, total: logs.length });
});

// 7.5 Gemini Chatbot API Endpoint
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], model = 'gemini-3.5-flash', role = 'CITIZEN' } = req.body;

    // Build system instruction based on selected role
    let systemInstruction = '';
    if (role === 'RESEARCHER') {
      systemInstruction = `You are the JH Innovation Hub Academic Research partner. Your goal is to assist students, researchers, and faculty members at institutions like BIT Mesra, NIT Jamshedpur, and IIT (ISM) Dhanbad in designing technological solutions for civic problems in Jharkhand.
Help them structure technical milestones, suggest IoT architectures, write sensor code outlines, draft hardware bills of materials, and formulate project proposals for state grant clearance. Be professional, academic, precise, and highly detailed. Use technical formatting like markdown tables and code snippets where appropriate.`;
    } else if (role === 'GOVERNMENT') {
      systemInstruction = `You are the JH Innovation Hub Government Administrative Policy advisor. Your goal is to assist municipal, block, and district administration officers across Jharkhand in analyzing regional issues, evaluating problem clusters (e.g., water table depletion, agricultural pest waves), coordinating department resources, validating field evidence, and optimizing SLA milestones.
Be administrative, professional, constructive, and direct. Focus on policy alignment, operational efficiency, resource allocation, and civic accountability.`;
    } else {
      systemInstruction = `You are the JH Innovation Hub Citizen AI Assistant, a helpful and reassuring agent for the residents of Jharkhand.
Your goal is to guide citizens in identifying, detailing, and submitting local municipal and rural problems (such as water scarcity, crop damage, road waterlogging, sanitation issues). Always respond politely, and encourage bilingual explanations in English and Hindi (Devanagari script). Help them describe their issue clearly so that the Government of Jharkhand and academic researchers can understand and address it effectively.`;
    }

    // Attempt Gemini Call if API Key exists
    if (process.env.GEMINI_API_KEY) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        const isOAuth = apiKey.startsWith('ya29.');

        let ai: GoogleGenAI;
        if (isOAuth) {
          const originalGeminiKey = process.env.GEMINI_API_KEY;
          const originalGoogleKey = process.env.GOOGLE_API_KEY;
          try {
            delete process.env.GEMINI_API_KEY;
            delete process.env.GOOGLE_API_KEY;
            ai = new GoogleGenAI({
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                  Authorization: `Bearer ${apiKey}`,
                },
              },
            });
          } finally {
            process.env.GEMINI_API_KEY = originalGeminiKey;
            if (originalGoogleKey) {
              process.env.GOOGLE_API_KEY = originalGoogleKey;
            }
          }
        } else {
          ai = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });
        }

        // Format history for @google/genai format
        const formattedContents = messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const response = await ai.models.generateContent({
          model: model,
          contents: formattedContents,
          config: {
            systemInstruction: systemInstruction,
          },
        });

        if (response.text) {
          return res.json({
            success: true,
            content: response.text,
            model: model,
            provider: 'gemini',
          });
        }
      } catch (err: any) {
        console.warn('Gemini Chat API Call Failed, falling back to smart simulation:', err.message);
      }
    }

    // Smart Fallback Assistant Simulation
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const textLower = lastUserMessage.toLowerCase();
    let reply = '';

    if (textLower.includes('water') || textLower.includes('drain') || textLower.includes('flood') || textLower.includes('pond') || textLower.includes('drinking')) {
      if (role === 'RESEARCHER') {
        reply = `### Smart IoT Hydrology & Drainage Blueprint
For waterlogging or water resource issues, here is a recommended architecture for researchers:

1. **Hardware Stack**:
   - **MCU**: ESP32 with Solar Shield or LoRaWAN Node (Heltec CubeCell).
   - **Sensors**: JSN-SR04T Waterproof Ultrasonic Distance Sensor (for level measurement), Gravity TDS Sensor (for quality).
2. **Firmware Strategy**:
   - Program the MCU to wake up every 15 minutes, trigger ultrasonic burst, read water head level, and transmit via LoRaWAN to avoid high power usage.
3. **Panchayat Collaboration**:
   - Ground validation should be done with the local Gram Panchayat Secretary. High-volume runoff can be bypassed into community check dams for groundwater recharge.

Would you like a sample Arduino/C++ code snippet to interface the JSN-SR04T sensor with an ESP32?`;
      } else if (role === 'GOVERNMENT') {
        reply = `### Water Resources Resource Allocation Advisory
To address localized water logging or water scarcity reported in the district:

1. **Urgency Classification**: High-priority seasonal intervention is recommended.
2. **Departmental Routing**: Route to the **Water Resources Department / Drinking Water & Sanitation Department (DWSD), Jharkhand**.
3. **Recommended Actions**:
   - Allocate immediate capital for civil culvert expansion to clear stagnant waterlogging.
   - Deploy automated ultrasonic level telemetry to monitor vulnerable catchments.
   - Utilize MGNREGA labor blocks to excavate adjacent storage percolation ponds.`;
      } else {
        reply = `### Water Management Assistance / जल प्रबंधन सहायता
मैं जल संबंधी समस्याओं में आपकी सहायता करने के लिए तैयार हूँ।

1. **मुख्य जानकारी**: जब आप समस्या सबमिट करें, तो कृपया स्थान (जैसे पंचायत, वार्ड या ब्लॉक) और प्रभावित लोगों की अनुमानित संख्या अवश्य बताएं।
2. **साक्ष्य (Evidence)**: जलभराव या जल की कमी वाली जगह की एक फोटो या वीडियो अवश्य अपलोड करें। इससे अधिकारी इसे प्राथमिकता देंगे।
3. **समाधान**: झारखंड के विश्वविद्यालयों (जैसे BIT Mesra) के छात्र इस पर स्मार्ट मॉनिटरिंग सिस्टम लगाने का काम कर सकते हैं ताकि जलभराव से मुक्ति मिल सके।

क्या आप इस समस्या को दर्ज करने की प्रक्रिया शुरू करना चाहेंगे?`;
      }
    } else if (textLower.includes('crop') || textLower.includes('pest') || textLower.includes('farming') || textLower.includes('farmer') || textLower.includes('soil')) {
      if (role === 'RESEARCHER') {
        reply = `### Agro-Tech Computer Vision Diagnostic Pipeline
For agricultural or crop diseases, researchers can implement this:

1. **Technology**: TensorFlow Lite model deployed on a mobile app (Flutter/React Native) for leaf lesion classification (e.g., Fungal Blast or Blight).
2. **Offline Mode**: Cache the inference model locally on the mobile phone since network bandwidth in remote agricultural zones is often restricted.
3. **Soil Telemetry Node**:
   - Use capacitive soil moisture sensors (avoid cheap resistive ones as they corrode quickly) placed at root depth.
   - Calibrate the readings for Jharkhand's red laterite soil (typical of Chota Nagpur Plateau).

Do you need help with the Mobile TFLite offline integration patterns or soil sensor calibration parameters?`;
      } else if (role === 'GOVERNMENT') {
        reply = `### Agricultural Extension & Farmer Support Action Advisory
To mitigate crop pest waves or drought damage:

1. **Advisory**: Leverage local **Krishi Vigyan Kendras (KVK)** to provide direct training.
2. **Department Routing**: Route to the **Department of Agriculture, Animal Husbandry & Co-operative, Jharkhand**.
3. **Policy Action**:
   - Deploy mobile agro-testing clinics with offline-enabled diagnostic devices.
   - Fast-track direct benefit transfers (DBT) for high-grade organic fungicides to affected cooperative groups.`;
      } else {
        reply = `### Crop Protection & Farming Assistance / कृषि और फसल सुरक्षा सहायता
झारखंड के किसान हमारे राज्य की रीढ़ हैं। फसल रोग या सिंचाई की समस्याओं पर सहायता:

1. **विवरण**: अपनी फसल के प्रकार (जैसे धान, मक्का या सब्जियां) और बीमारी के लक्षणों का वर्णन करें।
2. **स्मार्ट समाधान**: हमारे प्लेटफ़ॉर्म के माध्यम से कृषि विशेषज्ञ और छात्र कंप्यूटर विज़न ऐप विकसित कर रहे हैं जो पत्तियों की तस्वीर देखकर बीमारी की पहचान कर सकते हैं।
3. **सरकारी सहायता**: कृषि विभाग झारखंड द्वारा दी जाने वाली राहत और सुझावों से आपको जोड़ा जाएगा।

कृपया हमें बताएं कि आपके क्षेत्र में कौन सी मुख्य फसल प्रभावित हुई है?`;
      }
    } else if (textLower.includes('college') || textLower.includes('university') || textLower.includes('bit mesra') || textLower.includes('proposal') || textLower.includes('funding')) {
      reply = `### University Workspace Proposal & Funding Guide
Higher Education Institutions (HEIs) in Jharkhand (BIT Mesra, NIT Jamshedpur, RU, etc.) are central to the state's innovation model:

1. **SLA Milestones**: Complete the 4 mandatory stage gates: **Prototype Design, Testing, Field Pilot, and Permanent Commissioning**.
2. **Funding Clearance**: Submit your complete bill of materials and structural blueprint to the Department of Information Technology & e-Governance, Jharkhand via the workspace.
3. **Citizen Feedback**: A minimum of **10 distinct community ratings** and verified Panchayat resolution uploads are required before final project closure and state benchmark recognition.

Would you like assistance in drafting a formal milestone description or structuring a funding proposal?`;
      } else if (textLower.includes('hello') || textLower.includes('hi') || textLower.includes('hey') || textLower.includes('नमस्ते')) {
      reply = `### Welcome to JH Innovation Hub AI Civic Assistant!
How can I assist you today? I am configured with the **${role}** advisory role using **${model}**.

Here are some topics we can explore:
- 💧 **Water & Municipal Utilities**: Smart drainage, water level IoT telemetry, percolation designs.
- 🌾 **Smart Agriculture**: Computer-vision leaf diagnostics, soil moisture monitoring, crop protection.
- 🏥 **Rural Healthcare**: Telemedicine point-of-care vital triage kits, offline health archives.
- 🎓 **University Milestones**: Crafting technical proposals, scheduling testing pilots, and funding approvals.
- 📂 **Citizen Reports**: Help drafting clear, detailed problem summaries in English/Hindi for fast-track routing.

Please type your question or share a challenge you would like to resolve!`;
    } else {
      reply = `### Inquiry Acknowledged
Thank you for your message! As the **JH Innovation Hub ${role === 'RESEARCHER' ? 'Academic Partner' : role === 'GOVERNMENT' ? 'Government Advisor' : 'Citizen Assistant'}**, I am here to assist you.

Regarding your query: "${lastUserMessage}"

Here are the recommended next steps on the platform:
1. **Details**: Expand your description to include specific geographical details (district, block) or quantitative figures (number of residents affected).
2. **Routing**: This will be automatically classified by our State AI Engine and routed to either the relevant state department or matched with research labs (like BIT Mesra).
3. **Collaboration**: You can upload images, PDF resolutions, or technical diagrams using our secure upload panel.

Please let me know how I can help you expand this or provide more specific engineering or administrative feedback!`;
    }

    res.json({
      success: true,
      content: reply,
      model: model,
      provider: 'mock_simulated',
      notice: 'Operating in offline/simulated fallback mode.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to process chat message' });
  }
});

// 8. Golden Demo Reset & Flow
apiRouter.post('/demo/golden/reset', (req: Request, res: Response) => {
  const result = db.resetGoldenDemo();
  res.json(result);
});
