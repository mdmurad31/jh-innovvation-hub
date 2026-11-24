/**
 * JH Innovation Hub - Core Types & Relational Domain Models
 * Turning Community Problems into Real-World Solutions
 */

export type UserRole =
  | 'CITIZEN'
  | 'COMMUNITY_ORG'
  | 'PANCHAYAT_ULB'
  | 'GOVERNMENT'
  | 'GOVERNMENT_OFFICER'
  | 'UNIVERSITY_ADMIN'
  | 'FACULTY'
  | 'STUDENT'
  | 'STUDENT_RESEARCHER'
  | 'INDUSTRY'
  | 'INDUSTRY_PARTNER'
  | 'MENTOR'
  | 'STARTUP_MSME'
  | 'RESEARCH_INSTITUTION'
  | 'SUPER_ADMIN';

export type ProblemStatus =
  | 'SUBMITTED'
  | 'AI_ANALYZED'
  | 'UNDER_REVIEW'
  | 'CLARIFICATION_REQUIRED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'ASSIGNED'
  | 'ASSIGNED_ACCEPTED'
  | 'ASSIGNED_DECLINED';

export type SupportRouting =
  | 'GOVERNMENT_SERVICE'
  | 'RESEARCH'
  | 'INNOVATION'
  | 'ENTREPRENEURSHIP'
  | 'MULTI_DISCIPLINARY'
  | 'EMERGENCY';

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ProjectStatus =
  | 'PROPOSED'
  | 'APPROVED'
  | 'RESEARCH'
  | 'PROTOTYPE'
  | 'TESTING'
  | 'PILOT'
  | 'DEPLOYED'
  | 'COMPLETED'
  | 'BLOCKED';

export type MilestoneStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'OVERDUE';

export type IndustrySupportType =
  | 'Technical Mentorship'
  | 'Hardware'
  | 'Cloud'
  | 'Testing'
  | 'Funding'
  | 'CSR'
  | 'Manufacturing'
  | 'Deployment'
  | 'Commercialization'
  | 'Data';

export type ProblemCategory =
  | 'Education'
  | 'Agriculture'
  | 'Healthcare'
  | 'Water'
  | 'Sanitation'
  | 'Environment'
  | 'Energy'
  | 'Rural Livelihood'
  | 'Urban Infrastructure'
  | 'Accessibility'
  | 'Public Administration'
  | 'Transportation'
  | 'Waste Management'
  | 'Disaster Management'
  | 'Other';

export type AuthProvider = 'google' | 'facebook' | 'github' | 'linkedin' | 'meripehchaan' | 'email' | 'demo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  department?: string;
  universityId?: string;
  phone?: string;
  district?: string;
  avatarUrl?: string;
  authProvider?: AuthProvider;
  authProviderId?: string;
  verified?: boolean;
}

export interface ProblemLocation {
  district: string;
  block?: string;
  villageOrWard?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}

export interface ProblemEvidence {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  caption?: string;
  fileName: string;
  fileSize?: string;
  fileSizeBytes?: number;
  mimeType?: string;
  extension?: string;
  uploadedAt: string;
  uploadedBy?: string;
  ownerId?: string;
  isPublic?: boolean;
  visibility?: 'PRIVATE' | 'RESTRICTED' | 'PUBLIC';
}

export interface ProblemAIAnalysis {
  category: ProblemCategory;
  subcategory: string;
  summary: string;
  severity: number; // 1-10
  urgency: number; // 1-10
  estimatedAffectedPeople: number;
  keywords: string[];
  requiredSkills: string[];
  requiredTechnologies: string[];
  possibleGovernmentDepartment: string;
  problemType: SupportRouting;
  confidence: number; // 0-1
  rootCause: string;
  affectedPopulation: string;
  locationExpertise: string;
  solutionDomain: string;
  expectedOutcome: string;
  analyzedAt: string;
  provider: 'gemini' | 'openai' | 'mock';
}

export interface PriorityBreakdown {
  severityComponent: number; // 30%
  populationComponent: number; // 25%
  urgencyComponent: number; // 20%
  geographicComponent: number; // 15%
  evidenceComponent: number; // 10%
  totalScore: number; // 0-100
  level: PriorityLevel;
  reasons: string[];
  adminOverrideScore?: number;
  adminOverrideReason?: string;
  overriddenBy?: string;
}

export interface DuplicateWhyBreakdown {
  sameDistrict: boolean;
  districtName?: string;
  sameBlock: boolean;
  blockName?: string;
  sameCategory: boolean;
  categoryName?: string;
  similarDescription: boolean;
  semanticCosineSimilarity: number; // e.g. 0.92
  nearbyLocation: boolean;
  distanceKm?: number;
  sharedKeywords: string[];
  evidenceSimilarity: boolean;
  matchingProblemType: boolean;
  problemType?: string;
}

export interface DuplicateCandidate {
  problemId: string;
  title: string;
  description?: string;
  district: string;
  block?: string;
  category: string;
  problemType?: string;
  similarityScore: number; // e.g. 92
  reasons: string[];
  why: DuplicateWhyBreakdown;
  submittedAt: string;
  evidenceCount?: number;
  status?: 'PENDING_REVIEW' | 'MERGED' | 'KEPT_SEPARATE';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  location?: ProblemLocation;
  evidence?: ProblemEvidence[];
  priorityScore?: number;
}

export interface ProblemCluster {
  id: string;
  masterProblemId: string;
  clusterTitle: string;
  problemIds: string[];
  similarityScore: number; // e.g. 91
  reason: string;
  status: 'PENDING_REVIEW' | 'MERGED' | 'KEPT_SEPARATE';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ProblemValidation {
  decision: 'VALIDATED' | 'REJECTED' | 'CLARIFICATION_REQUIRED' | 'DUPLICATE';
  routedTo: SupportRouting;
  departmentId?: string;
  departmentName?: string;
  notes: string;
  validatedBy: string;
  validatorName: string;
  validatedAt: string;
  clarificationRequest?: string;
}

export interface UniversityMatchBreakdown {
  facultyExpertise: number; // max 20
  departments: number; // max 10
  researchAreas: number; // max 15
  labs: number; // max 10
  equipment: number; // max 10
  technologies: number; // max 10
  previousProjects: number; // max 10
  studentSkills: number; // max 5
  incubationFacilities: number; // max 5
  geographicSuitability: number; // max 5
}

export interface UniversityMatch {
  universityId: string;
  universityName: string;
  shortName?: string;
  district?: string;
  matchScore: number; // 0-100 (e.g. 91)
  breakdown: UniversityMatchBreakdown;
  reasons: string[]; // List of explicit verified checkmarks: "✓ Hydrology expertise", "✓ GIS capability", "✓ IoT lab", "✓ Relevant previous project", "✓ Student skills"
  why: {
    facultyReason: string;
    departmentReason: string;
    researchReason?: string;
    labReason: string;
    equipmentReason?: string;
    technologyReason?: string;
    projectReason: string;
    studentReason: string;
    incubationReason?: string;
    locationReason: string;
  };
  matchedFaculty?: { name: string; department: string; expertise: string[]; email?: string }[];
  matchedDepartments?: string[];
  matchedResearch?: string[];
  matchedLabs?: string[];
  matchedEquipment?: string[];
  matchedTechnologies?: string[];
  matchedProjects?: { title: string; domain: string; outcomes: string }[];
  matchedSkills?: string[];
  incubationCenter?: string;
}

export interface IndustryMatch {
  industryId: string;
  companyName: string;
  matchScore: number; // 0-100
  breakdown: {
    technologyAlignment: number; // max 30
    sectorAndCSR: number; // max 25
    hardwareAndResources: number; // max 20
    geography: number; // max 15
    commercializationTrack: number; // max 10
  };
  why: string[];
  offeredSupportTypes: IndustrySupportType[];
}

export interface Problem {
  id: string; // e.g. "JH-2026-00124"
  title: string;
  description: string;
  category: ProblemCategory;
  location: ProblemLocation;
  evidence: ProblemEvidence[];
  affectedPeopleCount: number;
  frequency: 'Daily' | 'Weekly' | 'Seasonal/Monsoon' | 'Occasional' | 'Continuous';
  urgency: 'Immediate Emergency' | 'High (Weeks)' | 'Medium (Months)' | 'Low';
  durationMonths: number;
  status: ProblemStatus;
  submittedBy: string;
  submitterName: string;
  submitterPhone?: string;
  submittedAt: string;
  aiAnalysis?: ProblemAIAnalysis;
  priority?: PriorityBreakdown;
  validation?: ProblemValidation;
  assignedUniversityId?: string;
  assignedUniversityName?: string;
  assignedDepartmentId?: string;
  assignedDepartmentName?: string;
  isMasterProblem?: boolean;
  masterClusterId?: string;
  projectId?: string;
  isGoldenDemo?: boolean;
}

export interface StudentTeamMember {
  id: string;
  name: string;
  email: string;
  department: string;
  skills: string[]; // Civil, IoT, GIS, AI/ML, Backend, Data Science
  roleInProject: string;
  disciplineTag?: 'Civil' | 'AI/ML' | 'GIS' | 'IoT' | 'Backend' | 'Faculty' | 'Electronics' | 'Mechanical' | 'AgriTech' | 'Biomedical' | 'Chemical' | 'Environmental';
  isLead?: boolean;
  avatarUrl?: string;
  joinedAt?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  owner: string;
  deadline: string;
  status: MilestoneStatus;
  progressPercent: number;
  deliverables?: string[];
  evidenceUrl?: string;
  comments?: string;
  completedAt?: string;
  approvedBy?: string;
}

export interface ProjectSupportRequest {
  id: string;
  projectId: string;
  organizationId?: string;
  organizationName?: string;
  supportType: IndustrySupportType;
  description: string;
  estimatedValue?: string;
  timeline: string;
  status: 'REQUESTED' | 'OFFERED' | 'ACCEPTED' | 'FULFILLED' | 'REJECTED';
  offeredByCompany?: string;
  offeredByUserName?: string;
  offeredAt?: string;
  notes?: string;
}

export interface TestRecord {
  id: string;
  testName: string;
  testDate: string;
  environment: string;
  expectedResult: string;
  actualResult: string;
  passed: boolean;
  evidenceUrl?: string;
  notes: string;
}

export interface PilotRecord {
  id: string;
  location: string;
  startDate: string;
  endDate: string;
  targetUsersCount: number;
  fieldConditions: string;
  resultsSummary: string;
  issuesIdentified: string[];
  communityApproval: boolean;
  governmentApproval: boolean;
  approvedByOfficial?: string;
}

export interface DeploymentEvidence {
  id: string;
  title: string;
  type: 'image' | 'document' | 'telemetry' | 'certification';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  action: string;
  technician: string;
  status: 'OPERATIONAL' | 'SCHEDULED_MAINTENANCE' | 'UNDER_REPAIR' | 'DECOMMISSIONED';
  notes: string;
}

export interface DeploymentRecord {
  id: string;
  deploymentDate: string;
  location: string;
  district?: string;
  block?: string;
  gpsCoordinates?: { lat: number; lng: number };
  hardwareVersion?: string;
  softwareVersion?: string;
  version: string; // Hardware/Software/System version e.g. "v2.1-IoT-Sluice"
  activeBeneficiaries: number; // Users/beneficiaries
  beneficiaryDemographics?: string;
  responsibleOrg: string; // e.g. "BIT Mesra R&D & Bundu Municipal Council"
  maintenanceSchedule?: string;
  maintenanceStatus: 'OPERATIONAL' | 'SCHEDULED_MAINTENANCE' | 'UNDER_REPAIR' | 'DECOMMISSIONED';
  lastServicedDate?: string;
  nextMaintenanceDate?: string;
  evidence: DeploymentEvidence[];
  approvalStatus: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedByOfficial?: string;
  approvedAt?: string;
  approvalNotes?: string;
  commissioningCertUrl?: string;
  status: 'ACTIVE' | 'SCHEDULED_MAINTENANCE' | 'UPGRADED' | 'OPERATIONAL' | 'PENDING_APPROVAL';
}

export interface ImpactKPI {
  id: string;
  kpiName: string;
  metricCategory?: string;
  baseline: string; // e.g. "12 incidents"
  baselineNumber?: number;
  target: string; // e.g. "4 incidents"
  targetNumber?: number;
  actual: string; // e.g. "3 incidents"
  actualNumber?: number;
  difference?: string; // e.g. "-9 incidents (-75%)"
  improvementPercentage: number; // e.g. 75
  unit: string; // e.g. "incidents / year"
  evidenceUrls: string[]; // Commissioning photos, laboratory assays, telemetry dumps
  evidenceDescription?: string;
  claimedBy: string;
  claimedAt: string;
  claimedNotes?: string;
  verificationStatus: 'CLAIMED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  isVerifiedByGovernment: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationRemarks?: string;
  rejectionReason?: string;
  checklistStatus?: {
    evidenceUploaded: boolean;
    pilotCompleted: boolean;
    governmentVerified: boolean;
  };
}

export type CitizenProblemResolutionStatus = 'SOLVED' | 'PARTIALLY_SOLVED' | 'NOT_SOLVED';

export interface CitizenFeedback {
  id: string;
  citizenName: string;
  district: string;
  block?: string;
  village?: string;
  solutionSolvedStatus: CitizenProblemResolutionStatus; // "Did the solution solve the problem?": Solved | Partially Solved | Not Solved
  rating: number; // 1-5 stars
  feedbackText: string;
  evidenceUrls?: string[]; // Evidence uploaded by the citizen/community
  evidenceDescription?: string;
  submittedAt: string;
  isOriginalSubmitter?: boolean;
  isBeneficiary: boolean;
  roleOrRelation?: string;
}

export interface Project {
  id: string;
  problemId: string;
  problemTitle: string;
  title: string;
  summary: string;
  universityId: string;
  universityName: string;
  facultyMentorName: string;
  facultyMentorEmail: string;
  department: string;
  studentTeam: StudentTeamMember[];
  objectives: string[];
  scope: string;
  budgetEst: string;
  timelineMonths: number;
  status: ProjectStatus;
  milestones: ProjectMilestone[];
  supportRequests: ProjectSupportRequest[];
  tests: TestRecord[];
  pilot?: PilotRecord;
  deployment?: DeploymentRecord;
  impactKPIs: ImpactKPI[];
  citizenFeedbacks: CitizenFeedback[];
  createdAt: string;
  updatedAt: string;
  isGoldenDemo?: boolean;
}

export interface SolutionBlueprint {
  id: string;
  title: string;
  category: ProblemCategory;
  originatedDistrict: string;
  developedByHEI: string;
  problemSummary: string;
  technicalSolution: string;
  estimatedCost: string;
  billOfMaterials: { item: string; quantity: string; unitCost: string; totalCost: string }[];
  implementationSteps: string[];
  lessonsLearned: string;
  replicationsCount: number;
}

export interface SolutionReuse {
  id: string;
  title: string;
  problemCategory: ProblemCategory;
  district: string;
  originalProblemId: string;
  originalProjectId: string;
  deployedSolutionSummary: string;
  technologyStack: string[];
  estimatedCost: string;
  developedByUniversity: string;
  supportedByIndustry: string;
  measuredImpact: string;
  blueprintDocsUrl: string;
  timesReused: number;
  deploymentsCount: number;
}

export interface Notification {
  id: string;
  userId: string;
  targetRole: UserRole;
  title: string;
  message: string;
  type: 'SUBMISSION' | 'AI_ANALYSIS' | 'VALIDATION' | 'UNIVERSITY_MATCH' | 'PROJECT' | 'INDUSTRY_SUPPORT' | 'MILESTONE' | 'DEPLOYMENT' | 'IMPACT';
  read: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  role: UserRole;
  targetObject: string;
  objectId: string;
  timestamp: string;
  details: string;
  who?: string;
  what?: string;
  when?: string;
  objectEntity?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface StatsSummary {
  totalProblems: number;
  validatedProblems: number;
  inDevelopment: number;
  completedProjects: number;
  deployedSolutions: number;
  peopleImpacted: number;
  participatingHEIs: number;
  industryPartners: number;
  categoryDistribution: { category: string; count: number }[];
  districtDistribution: { district: string; count: number; validated: number; deployed: number }[];
  priorityDistribution: { priority: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

export interface JharkhandDistrict {
  id: string;
  name: string;
  hindiName: string;
  headquarters: string;
  population: string;
  keyIssues: string[];
  lat: number;
  lng: number;
}

export type NormalizedRole =
  | 'CITIZEN'
  | 'GOVERNMENT'
  | 'UNIVERSITY_ADMIN'
  | 'FACULTY'
  | 'STUDENT'
  | 'INDUSTRY'
  | 'MENTOR'
  | 'SUPER_ADMIN';

export type RbacPermission =
  // Citizen
  | 'problem:submit'
  | 'problem:upload_evidence'
  | 'problem:track'
  | 'project:give_feedback'

  // Government
  | 'problem:review'
  | 'problem:validate'
  | 'problem:reject'
  | 'problem:prioritize'
  | 'problem:assign_institution'
  | 'project:approve_stage'
  | 'project:verify_impact'

  // University (University Admin + Faculty)
  | 'problem:review_assigned'
  | 'problem:accept_decline_assignment'
  | 'institution:form_teams'
  | 'institution:assign_faculty'
  | 'project:submit_proposal'
  | 'project:manage'

  // Industry
  | 'support_request:view'
  | 'support_request:offer'
  | 'project:track_supported'

  // Student
  | 'project:work_assigned_tasks'

  // Mentor
  | 'mentor:advise'
  | 'mentor:offer_mentorship';
