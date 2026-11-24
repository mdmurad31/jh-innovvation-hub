/**
 * JH Innovation Hub - Client API Helper
 */

import {
  AuditLog,
  DuplicateCandidate,
  Problem,
  ProblemCluster,
  Project,
  SolutionReuse,
  StatsSummary,
  User,
} from '../types';

const BASE_URL = '/api';

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const saved = localStorage.getItem('jh_hub_auth_user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user?.id) headers['x-user-id'] = user.id;
      if (user?.role) headers['x-user-role'] = user.role;
      if (user?.email) headers['x-user-email'] = user.email;
      if (user?.name) headers['x-user-name'] = encodeURIComponent(user.name);
    }
    const token = localStorage.getItem('jh_hub_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return headers;
}

/**
 * Robust fetch helper that guarantees clean error messages and prevents
 * "Unexpected token '<', <html>... is not valid JSON" errors when servers
 * return HTML (e.g. during restarts, 404s, or reverse proxy fallbacks).
 */
export async function safeApiFetch<T = any>(
  url: string,
  options?: RequestInit,
  defaultError = 'API request failed'
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    // If server returned non-JSON (such as HTML fallback from Vite/Express during restart)
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      if (text.trim().startsWith('<')) {
        throw new Error(
          `Service is initializing or returned an HTML response (${res.status}). Please retry in a moment.`
        );
      }
      try {
        const parsed = JSON.parse(text);
        if (!res.ok) {
          throw new Error(parsed?.error || `${defaultError} (${res.status})`);
        }
        return parsed as T;
      } catch (err: any) {
        if (err.message && !err.message.includes('Unexpected token')) {
          throw err;
        }
        throw new Error(`${defaultError} (${res.status})`);
      }
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || `${defaultError} (${res.status})`);
    }
    return data as T;
  } catch (err: any) {
    if (err.message && err.message.includes("Unexpected token '<'")) {
      throw new Error(
        `Server returned an HTML page instead of JSON. The service may be restarting. Please retry in a moment.`
      );
    }
    throw err;
  }
}

export async function fetchMe(): Promise<{
  user: User;
  normalizedRole: string;
  permissions: string[];
  availableUsers: User[];
}> {
  return safeApiFetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch active session');
}

export async function fetchRbacPermissions(): Promise<{
  currentRole: string;
  currentUser: User;
  permissions: string[];
  allRolePermissions: Record<string, string[]>;
}> {
  return safeApiFetch(`${BASE_URL}/rbac/permissions`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch RBAC permissions');
}

export async function fetchAuthProviders(): Promise<{
  providers: Array<{
    id: string;
    name: string;
    configured: boolean;
    icon: string;
    color: string;
    popular?: boolean;
    official?: boolean;
  }>;
}> {
  return safeApiFetch(`${BASE_URL}/auth/providers`, undefined, 'Failed to fetch auth providers');
}

export async function fetchOAuthUrl(
  provider: string,
  role?: string
): Promise<{ url: string }> {
  const params = new URLSearchParams({ provider });
  if (role) params.append('role', role);
  return safeApiFetch(`${BASE_URL}/auth/url?${params.toString()}`, undefined, 'Failed to fetch OAuth URL');
}

export async function loginWithOAuth(data: {
  provider: string;
  email?: string;
  name?: string;
  role?: string;
  district?: string;
  avatarUrl?: string;
  organizationName?: string;
}): Promise<{ success: boolean; user: User; token: string; availableUsers: User[] }> {
  return safeApiFetch(`${BASE_URL}/auth/oauth-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, 'OAuth login failed');
}

export async function loginWithEmail(data: {
  email: string;
  password?: string;
  name?: string;
  role?: string;
  district?: string;
}): Promise<{ success: boolean; user: User; token: string; availableUsers: User[] }> {
  return safeApiFetch(`${BASE_URL}/auth/email-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, 'Email login failed');
}

export async function logoutUser(): Promise<{ success: boolean; user: User }> {
  return safeApiFetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
  }, 'Logout failed');
}

export async function switchRole(userId: string): Promise<{ success: boolean; user: User }> {
  return safeApiFetch(`${BASE_URL}/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  }, 'Failed to switch role');
}

export async function fetchStats(isDemo: boolean = true): Promise<StatsSummary> {
  return safeApiFetch(`${BASE_URL}/stats?mode=${isDemo ? 'demo' : 'real'}`, undefined, 'Failed to fetch stats');
}

export async function fetchDistricts(): Promise<{ districts: any[] }> {
  return safeApiFetch(`${BASE_URL}/districts`, undefined, 'Failed to fetch districts');
}

export async function fetchProblems(filters?: {
  district?: string;
  category?: string;
  status?: string;
  priority?: string;
  route?: string;
  search?: string;
}): Promise<{ problems: Problem[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.district) params.append('district', filters.district);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.route) params.append('route', filters.route);
  if (filters?.search) params.append('search', filters.search);

  return safeApiFetch(`${BASE_URL}/problems?${params.toString()}`, undefined, 'Failed to fetch problems');
}

export async function fetchProblemById(id: string): Promise<{
  problem: Problem;
  matchedUniversities: any[];
  matchedIndustry: any[];
  duplicateCandidates: any[];
  project?: Project;
}> {
  return safeApiFetch(`${BASE_URL}/problems/${id}`, undefined, 'Failed to fetch problem details');
}

export async function submitProblem(data: any): Promise<{ success: boolean; problem: Problem; warning?: string }> {
  return safeApiFetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to submit problem');
}

export async function retryProblemAI(id: string): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${id}/retry-ai`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }, 'Failed to retry AI analysis');
}

export async function addProblemEvidence(
  problemId: string,
  evidence: { type?: string; url: string; caption?: string; fileName?: string; fileSize?: string }
): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/evidence`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(evidence),
  }, 'Failed to upload evidence');
}

export async function reanalyzeProblemAI(problemId: string, providerMode?: string): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/ai-analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ providerMode }),
  }, 'AI analysis failed');
}

export async function validateProblem(
  problemId: string,
  data: {
    decision: 'VALIDATED' | 'REJECTED' | 'CLARIFICATION_REQUIRED' | 'DUPLICATE';
    routedTo: string;
    notes: string;
    clarificationRequest?: string;
  }
): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to validate problem');
}

export async function fetchDuplicates(problemId: string): Promise<{
  problemId: string;
  title: string;
  duplicateCandidates: DuplicateCandidate[];
  masterCluster?: ProblemCluster;
  totalFound: number;
}> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/duplicates`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch duplicate candidates');
}

export async function decideDuplicateAction(
  problemId: string,
  data: {
    candidateProblemId: string;
    action: 'REVIEW' | 'MERGE' | 'KEEP_SEPARATE';
    notes?: string;
    clusterTitle?: string;
  }
): Promise<{
  success: boolean;
  action: 'REVIEW' | 'MERGE' | 'KEEP_SEPARATE';
  cluster?: ProblemCluster;
  targetProblem: Problem;
  candidateProblem: Problem;
  message: string;
}> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/duplicate-decision`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to submit duplicate decision');
}

export async function fetchClusters(): Promise<{ clusters: ProblemCluster[]; total: number }> {
  return safeApiFetch(`${BASE_URL}/clusters`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch clusters');
}

export async function prioritizeProblem(
  problemId: string,
  data: { totalScore?: number; level?: string; reasons?: string[] }
): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/prioritize`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to prioritize problem');
}

export async function assignProblem(
  problemId: string,
  data: {
    universityId: string;
    universityName: string;
    departmentName?: string;
  }
): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to assign problem');
}

export async function respondToProblemAssignment(
  problemId: string,
  data: { decision: 'ACCEPT' | 'DECLINE'; notes?: string }
): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/university-response`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to respond to problem assignment');
}

export async function assignFacultyToProblem(
  problemId: string,
  data: { facultyName: string; facultyEmail: string; department?: string }
): Promise<{ success: boolean; problem: Problem }> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/assign-faculty`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to assign faculty');
}

export async function fetchProjects(): Promise<{ projects: Project[]; total: number }> {
  return safeApiFetch(`${BASE_URL}/projects`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch projects');
}

export async function fetchProjectById(id: string): Promise<{ project: Project; problem?: Problem }> {
  return safeApiFetch(`${BASE_URL}/projects/${id}`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch project details');
}

export async function createProject(data: any): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to create project proposal');
}

export async function updateProjectTeam(
  projectId: string,
  data: { studentTeam: any[] }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/team`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to update student team');
}

export async function updateMilestone(
  projectId: string,
  data: {
    milestoneId: string;
    progressPercent: number;
    status: string;
    deliverables?: string[];
    evidenceUrl?: string;
    comments?: string;
    completed?: boolean;
  }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/milestones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to update milestone');
}

export async function fetchSupportRequests(): Promise<{ supportRequests: any[] }> {
  return safeApiFetch(`${BASE_URL}/support-requests`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch support requests');
}

export async function addSupportRequest(
  projectId: string,
  data: {
    supportType: string;
    description: string;
    estimatedValue?: string;
    timeline: string;
  }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/support-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to add support request');
}

export async function offerIndustrySupport(
  projectId: string,
  requestId: string,
  data: { notes?: string }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/support-requests/${requestId}/offer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to submit support offer');
}

export async function advanceProjectLifecycle(
  projectId: string,
  data: { newStatus: string; recordData?: any }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/lifecycle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to advance project lifecycle');
}

export async function approveProjectStage(
  projectId: string,
  data: { newStage: string; notes?: string }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/approve-stage`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to approve project stage');
}

export async function approveProjectDeployment(
  projectId: string,
  data: { approvalStatus: 'APPROVED' | 'REJECTED'; notes?: string }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/approve-deployment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to approve deployment');
}

export async function interveneDelayedProject(
  projectId: string,
  data: {
    actionType: 'GRANT_EXTENSION' | 'CLEAR_BOTTLENECK' | 'EXPEDITE_FUNDS' | 'INTER_DEPARTMENTAL_REQUISITION';
    notes: string;
    newDeadline?: string;
  }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/intervene`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to execute government intervention');
}

export async function verifyProjectImpact(
  projectId: string,
  data: { kpiIndex: number }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/verify-impact`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to verify impact');
}

export async function submitCitizenFeedback(
  projectId: string,
  data: {
    citizenName: string;
    district: string;
    block?: string;
    village?: string;
    solutionSolvedStatus: 'SOLVED' | 'PARTIALLY_SOLVED' | 'NOT_SOLVED';
    rating: number;
    feedbackText: string;
    evidenceUrls?: string[];
    evidenceDescription?: string;
    isOriginalSubmitter?: boolean;
    isBeneficiary: boolean;
  }
): Promise<{ success: boolean; project: Project }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/feedback`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }, 'Failed to submit citizen feedback');
}

export async function fetchSolutionsReuse(): Promise<{ solutions: SolutionReuse[]; total: number }> {
  return safeApiFetch(`${BASE_URL}/solutions/reuse`, undefined, 'Failed to fetch reusable solutions');
}

export async function fetchBlueprints(): Promise<{ blueprints: any[]; total: number }> {
  const data = await safeApiFetch<{ solutions: any[] }>(`${BASE_URL}/solutions/reuse`, undefined, 'Failed to fetch blueprints');
  const blueprints = (data?.solutions || []).map((sol: any) => ({
    id: sol.id || 'BP-2026-001',
    title: sol.title || 'IoT Drainage Sluice Gate System',
    category: sol.problemCategory || 'Water',
    originatedDistrict: sol.district || 'Ranchi',
    developedByHEI: sol.developedByUniversity || 'BIT Mesra',
    problemSummary: sol.deployedSolutionSummary || 'Automated sluice and solar telemetry drainage to prevent classroom floodwater inundation.',
    technicalSolution: 'Ultrasonic depth transceivers + LoRaWAN solar telemetry node + motorized flume gate with mechanical fail-safe override.',
    estimatedCost: sol.estimatedCost || '₹3,45,000',
    billOfMaterials: [
      { item: 'Industrial IP68 Ultrasonic Depth Transceiver', quantity: '2 units', unitCost: '₹35,000', totalCost: '₹70,000' },
      { item: 'High-Torque 24V DC Sluice Gate Actuator', quantity: '1 unit', unitCost: '₹85,000', totalCost: '₹85,000' },
      { item: 'Solar PV 200W Monocrystalline + 100Ah LiFePO4 Battery', quantity: '1 set', unitCost: '₹65,000', totalCost: '₹65,000' },
      { item: 'Submersible 3HP Dewatering Slurry Sump Pump', quantity: '1 unit', unitCost: '₹75,000', totalCost: '₹75,000' },
      { item: 'LoRaWAN Edge Gateway Node + Local Siren Buzzer', quantity: '1 unit', unitCost: '₹50,000', totalCost: '₹50,000' },
    ],
    implementationSteps: [
      'Site Elevation & Contour GIS Survey across campus watershed catchment',
      'Excavation of 4x3m sediment settling sump and culvert clearing',
      'Installation of motorized sluice gate housing and mechanical frame',
      'Mounting ultrasonic depth sensors at 1.5m above high-water benchmark',
      'Deploying solar battery node and telemetry cloud API connection',
      'Conducting live controlled water discharge calibration test',
      'Training local school staff and community committee on manual override',
    ],
    lessonsLearned: 'Ensure silt filters are cleaned bi-weekly prior to peak monsoon weeks; install bird-guards on solar panel mounts.',
    replicationsCount: sol.timesReused || 11,
  }));
  return { blueprints, total: blueprints.length };
}

export async function replicateBlueprint(blueprintId: string, targetDistrict: string): Promise<{ success: boolean; blueprint: any }> {
  return safeApiFetch(`${BASE_URL}/blueprints/${blueprintId}/replicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ targetDistrict }),
  }, 'Failed to replicate blueprint');
}

export async function requestImpactVerification(projectId: string): Promise<{ success: boolean; project: any }> {
  return safeApiFetch(`${BASE_URL}/projects/${projectId}/request-impact-verification`, {
    method: 'POST',
    headers: getAuthHeaders(),
  }, 'Failed to request impact verification');
}

export async function fetchAnalytics(): Promise<any> {
  return fetchStats(true);
}

export async function fetchNotifications(): Promise<{ notifications: any[]; unreadCount: number }> {
  return safeApiFetch(`${BASE_URL}/notifications`, undefined, 'Failed to fetch notifications');
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  return safeApiFetch(`${BASE_URL}/notifications/${id}/read`, { method: 'POST' }, 'Failed to mark notification as read');
}

export async function resetGoldenDemo(): Promise<{ success: boolean; message: string }> {
  return safeApiFetch(`${BASE_URL}/demo/golden/reset`, { method: 'POST' }, 'Failed to reset demo data');
}

export const resetGoldenDemoData = resetGoldenDemo;

export async function validateFileServer(fileData: {
  fileName: string;
  mimeType?: string;
  fileSize?: string | number;
  fileSizeBytes?: number;
  type?: string;
}): Promise<{ success: boolean; validation: any }> {
  return safeApiFetch(`${BASE_URL}/files/validate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(fileData),
  }, 'File validation failed');
}

export async function fetchProblemEvidence(problemId: string): Promise<{
  problemId: string;
  evidence: any[];
  totalEvidence: number;
  accessibleCount: number;
  restrictedCount: number;
  notice?: string;
}> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/evidence`, {
    headers: getAuthHeaders(),
  }, 'Failed to fetch problem evidence');
}

export async function fetchEvidenceItem(problemId: string, evidenceId: string): Promise<{
  success: boolean;
  evidence: any;
  isPublic: boolean;
}> {
  return safeApiFetch(`${BASE_URL}/problems/${problemId}/evidence/${evidenceId}`, {
    headers: getAuthHeaders(),
  }, 'Access Denied: Evidence is private and restricted.');
}

export async function fetchAuditLogs(objectId?: string): Promise<{ logs: AuditLog[]; total: number }> {
  const url = objectId ? `${BASE_URL}/audit-logs?objectId=${encodeURIComponent(objectId)}` : `${BASE_URL}/audit-logs`;
  return safeApiFetch(url, { headers: getAuthHeaders() }, 'Failed to fetch audit logs');
}
