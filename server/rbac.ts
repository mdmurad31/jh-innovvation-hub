/**
 * JH Innovation Hub - Server-Side Role-Based Access Control (RBAC) Engine
 * 
 * Strict enforcement of permissions and state machine workflow transitions
 * across 7 primary roles:
 * - CITIZEN
 * - GOVERNMENT
 * - UNIVERSITY_ADMIN
 * - FACULTY
 * - STUDENT
 * - INDUSTRY
 * - MENTOR
 */

import { Request, Response, NextFunction } from 'express';
import {
  NormalizedRole,
  Problem,
  ProblemStatus,
  Project,
  ProjectStatus,
  RbacPermission,
  User,
  UserRole,
} from '../src/types';

/**
 * Normalizes any legacy or alias role string into one of the 7 official system roles
 */
export function normalizeRole(role?: string): NormalizedRole {
  if (!role) return 'CITIZEN';
  const r = role.toUpperCase().trim();

  if (r === 'GOVERNMENT' || r === 'GOVERNMENT_OFFICER') return 'GOVERNMENT';
  if (r === 'UNIVERSITY_ADMIN') return 'UNIVERSITY_ADMIN';
  if (r === 'FACULTY') return 'FACULTY';
  if (r === 'STUDENT' || r === 'STUDENT_RESEARCHER') return 'STUDENT';
  if (r === 'INDUSTRY' || r === 'INDUSTRY_PARTNER' || r === 'STARTUP_MSME') return 'INDUSTRY';
  if (r === 'MENTOR') return 'MENTOR';
  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN';

  // Default citizens, community orgs, panchayats
  return 'CITIZEN';
}

/**
 * Canonical RBAC Permission Matrix
 */
export const ROLE_PERMISSIONS: Record<NormalizedRole, RbacPermission[]> = {
  CITIZEN: [
    'problem:submit',
    'problem:upload_evidence',
    'problem:track',
    'project:give_feedback',
  ],

  GOVERNMENT: [
    'problem:submit',
    'problem:upload_evidence',
    'problem:track',
    'problem:review',
    'problem:validate',
    'problem:reject',
    'problem:prioritize',
    'problem:assign_institution',
    'project:approve_stage',
    'project:verify_impact',
    'support_request:view',
    'project:track_supported',
  ],

  UNIVERSITY_ADMIN: [
    'problem:track',
    'problem:review_assigned',
    'problem:accept_decline_assignment',
    'institution:form_teams',
    'institution:assign_faculty',
    'project:submit_proposal',
    'project:manage',
    'support_request:view',
  ],

  FACULTY: [
    'problem:track',
    'problem:review_assigned',
    'problem:accept_decline_assignment',
    'institution:form_teams',
    'project:submit_proposal',
    'project:manage',
    'support_request:view',
    'mentor:advise',
  ],

  STUDENT: [
    'problem:track',
    'project:work_assigned_tasks',
  ],

  INDUSTRY: [
    'problem:track',
    'support_request:view',
    'support_request:offer',
    'project:track_supported',
  ],

  MENTOR: [
    'problem:track',
    'support_request:view',
    'support_request:offer',
    'project:track_supported',
    'mentor:advise',
    'mentor:offer_mentorship',
  ],

  SUPER_ADMIN: [
    'problem:submit',
    'problem:upload_evidence',
    'problem:track',
    'project:give_feedback',
    'problem:review',
    'problem:validate',
    'problem:reject',
    'problem:prioritize',
    'problem:assign_institution',
    'project:approve_stage',
    'project:verify_impact',
    'problem:review_assigned',
    'problem:accept_decline_assignment',
    'institution:form_teams',
    'institution:assign_faculty',
    'project:submit_proposal',
    'project:manage',
    'support_request:view',
    'support_request:offer',
    'project:track_supported',
    'project:work_assigned_tasks',
    'mentor:advise',
    'mentor:offer_mentorship',
  ],
};

/**
 * Checks if a role has the given permission
 */
export function hasPermission(role: UserRole | string, permission: RbacPermission): boolean {
  const norm = normalizeRole(role);
  if (norm === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[norm] || [];
  return permissions.includes(permission);
}

/**
 * Checks if a student is assigned to a specific project team
 */
export function isStudentAssignedToProject(user: User, project: Project): boolean {
  if (!project.studentTeam || !Array.isArray(project.studentTeam)) return false;

  const userEmail = (user.email || '').toLowerCase().trim();
  const userName = (user.name || '').toLowerCase().trim();
  const userId = (user.id || '').toLowerCase().trim();

  return project.studentTeam.some((st) => {
    const stEmail = (st.email || '').toLowerCase().trim();
    const stName = (st.name || '').toLowerCase().trim();
    const stId = (st.id || '').toLowerCase().trim();

    if (userId && stId && userId === stId) return true;
    if (userEmail && stEmail && userEmail === stEmail) return true;
    if (userName && stName) {
      if (userName === stName) return true;
      if (userName.includes(stName) || stName.includes(userName)) return true;
    }
    return false;
  });
}

/**
 * Workflow State Machine: Problem Status Transitions
 */
export function validateProblemTransition(
  currentStatus: ProblemStatus,
  targetStatus: ProblemStatus,
  actorRole: NormalizedRole
): { allowed: boolean; reason?: string } {
  if (actorRole === 'SUPER_ADMIN') return { allowed: true };

  // 1. Terminal / Restricted states
  if (currentStatus === 'REJECTED' && targetStatus !== 'UNDER_REVIEW') {
    return {
      allowed: false,
      reason: 'Rejected problems cannot transition directly. A Government Officer must first reopen them under review.',
    };
  }

  // 2. Triage & Validation transitions require GOVERNMENT
  const validationStatuses: ProblemStatus[] = ['VALIDATED', 'REJECTED', 'CLARIFICATION_REQUIRED', 'DUPLICATE'];
  if (validationStatuses.includes(targetStatus)) {
    if (actorRole !== 'GOVERNMENT') {
      return {
        allowed: false,
        reason: `Unauthorized: Only Government Officers have authority to transition problem status to ${targetStatus}.`,
      };
    }
  }

  // 3. Institution Assignment requires GOVERNMENT
  if (targetStatus === 'ASSIGNED') {
    if (actorRole !== 'GOVERNMENT') {
      return {
        allowed: false,
        reason: 'Unauthorized: Only Government Officers can assign problems to higher education institutions.',
      };
    }
    const unassignableStatuses: ProblemStatus[] = ['REJECTED', 'DUPLICATE'];
    if (unassignableStatuses.includes(currentStatus)) {
      return {
        allowed: false,
        reason: `Cannot assign institution to problem in status "${currentStatus}".`,
      };
    }
  }

  // 4. University Accept / Decline requires UNIVERSITY_ADMIN or FACULTY
  if (targetStatus === 'ASSIGNED_ACCEPTED' || targetStatus === 'ASSIGNED_DECLINED') {
    if (actorRole !== 'UNIVERSITY_ADMIN' && actorRole !== 'FACULTY') {
      return {
        allowed: false,
        reason: `Unauthorized: Only University Administrators or Faculty leads can accept or decline assigned problems.`,
      };
    }
    if (currentStatus !== 'ASSIGNED') {
      return {
        allowed: false,
        reason: `Cannot accept/decline problem in status "${currentStatus}". Problem must be in "ASSIGNED" status.`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Workflow State Machine: Project Lifecycle Progression
 */
const LIFECYCLE_ORDER: ProjectStatus[] = [
  'PROPOSED',
  'APPROVED',
  'RESEARCH',
  'PROTOTYPE',
  'TESTING',
  'PILOT',
  'DEPLOYED',
  'COMPLETED',
];

export function validateProjectLifecycleTransition(
  currentStatus: ProjectStatus,
  targetStatus: ProjectStatus,
  actorRole: NormalizedRole
): { allowed: boolean; reason?: string } {
  if (actorRole === 'SUPER_ADMIN') return { allowed: true };

  // Students can NEVER advance project lifecycle stages
  if (actorRole === 'STUDENT') {
    return {
      allowed: false,
      reason: 'Unauthorized: Students are restricted to working on assigned tasks and milestone deliverables. Only Faculty, University Admins, or Government Officers can transition project lifecycle stages.',
    };
  }

  // Industry/Citizens cannot transition lifecycle stages
  if (actorRole === 'CITIZEN' || actorRole === 'INDUSTRY' || actorRole === 'MENTOR') {
    return {
      allowed: false,
      reason: `Unauthorized: Role "${actorRole}" cannot advance project lifecycle stages.`,
    };
  }

  // Check valid status
  if (!LIFECYCLE_ORDER.includes(targetStatus) && targetStatus !== 'BLOCKED') {
    return { allowed: false, reason: `Invalid target project status: ${targetStatus}` };
  }

  // Stage: PROPOSED -> APPROVED (Requires Government Approval)
  if (targetStatus === 'APPROVED') {
    if (actorRole !== 'GOVERNMENT') {
      return {
        allowed: false,
        reason: 'Unauthorized: Only Government Officers have authority to approve project proposals and allocate state grants.',
      };
    }
  }

  // Stage: PILOT -> DEPLOYED (Requires Government Approval)
  if (targetStatus === 'DEPLOYED') {
    if (actorRole !== 'GOVERNMENT') {
      return {
        allowed: false,
        reason: 'Unauthorized: Field deployment into public schools, roads, or municipal wards requires formal Government authorization.',
      };
    }
    if (currentStatus !== 'PILOT' && currentStatus !== 'TESTING') {
      return {
        allowed: false,
        reason: `Cannot transition project directly from "${currentStatus}" to "DEPLOYED". Project must first complete TESTING and PILOT validation.`,
      };
    }
  }

  // Stage: DEPLOYED -> COMPLETED (Requires Government verification)
  if (targetStatus === 'COMPLETED') {
    if (actorRole !== 'GOVERNMENT') {
      return {
        allowed: false,
        reason: 'Unauthorized: Only Government Officers can formally certify project completion after impact verification.',
      };
    }
  }

  // Prevent skipping multiple lifecycle stages forward
  const currentIndex = LIFECYCLE_ORDER.indexOf(currentStatus);
  const targetIndex = LIFECYCLE_ORDER.indexOf(targetStatus);

  if (currentIndex !== -1 && targetIndex !== -1) {
    if (targetIndex > currentIndex + 1 && targetStatus !== 'BLOCKED') {
      return {
        allowed: false,
        reason: `Cannot skip stages: moving from "${currentStatus}" to "${targetStatus}" skips intermediate development gates. Next valid stage is "${LIFECYCLE_ORDER[currentIndex + 1]}".`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Express Middleware to enforce specific RBAC permission
 */
export function requirePermission(permission: RbacPermission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: User | undefined = (req as any).user;
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required. Please provide credentials or user identity.',
        code: 'UNAUTHENTICATED',
      });
    }

    const normRole = normalizeRole(user.role);
    if (!hasPermission(normRole, permission)) {
      return res.status(403).json({
        error: `Access Denied: Role "${normRole}" lacks permission "${permission}".`,
        code: 'PERMISSION_DENIED',
        role: normRole,
        requiredPermission: permission,
        allowedRoles: Object.keys(ROLE_PERMISSIONS).filter((r) =>
          ROLE_PERMISSIONS[r as NormalizedRole].includes(permission)
        ),
      });
    }

    next();
  };
}

/**
 * Express Middleware to require one of multiple specific roles
 */
export function requireRoles(allowedRoles: NormalizedRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: User | undefined = (req as any).user;
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required.',
        code: 'UNAUTHENTICATED',
      });
    }

    const normRole = normalizeRole(user.role);
    if (normRole !== 'SUPER_ADMIN' && !allowedRoles.includes(normRole)) {
      return res.status(403).json({
        error: `Access Denied: Action restricted to roles: ${allowedRoles.join(', ')}. Current role is "${normRole}".`,
        code: 'ROLE_FORBIDDEN',
        role: normRole,
        allowedRoles,
      });
    }

    next();
  };
}
