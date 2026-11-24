import { validateFileSecurity, validateEvidenceOwnership, parseSizeBytes } from './uploadSecurity';
/**
 * JH Innovation Hub - In-Memory & Persistent Database Store
 * Contains complete seed data across all 24 Jharkhand districts,
 * relational entities, workflow state machines, and the Golden Demo Problem.
 */

import fs from 'fs';
import path from 'path';
import {
  AuditLog,
  CitizenFeedback,
  IndustryMatch,
  IndustrySupportType,
  JharkhandDistrict,
  Notification,
  PriorityBreakdown,
  PriorityLevel,
  Problem,
  ProblemCluster,
  ProblemStatus,
  Project,
  ProjectStatus,
  SolutionReuse,
  StatsSummary,
  SupportRouting,
  UniversityMatch,
  User,
  UserRole,
} from '../src/types';
import { JHARKHAND_INDUSTRY_PARTNERS, JHARKHAND_UNIVERSITIES, matchIndustryForProblem, matchUniversitiesForProblem } from './matching';
import { calculatePriority } from './priority';

export const JHARKHAND_DISTRICTS: JharkhandDistrict[] = [
  { id: 'ranchi', name: 'Ranchi', hindiName: 'राँची', headquarters: 'Ranchi', population: '2,914,253', keyIssues: ['Urban stormwater flooding', 'Tribal education access', 'Subarnarekha basin runoff'], lat: 23.3441, lng: 85.3096 },
  { id: 'dhanbad', name: 'Dhanbad', hindiName: 'धनबाद', headquarters: 'Dhanbad', population: '2,684,487', keyIssues: ['Mine fire subsidence', 'Groundwater coal particulate', 'Air quality'], lat: 23.7957, lng: 86.4304 },
  { id: 'east-singhbhum', name: 'East Singhbhum', hindiName: 'पूर्वी सिंहभूम', headquarters: 'Jamshedpur', population: '2,293,919', keyIssues: ['Industrial effluent drainage', 'Rural tomato cold-storage', 'Subarnarekha flash water'], lat: 22.8046, lng: 86.2029 },
  { id: 'bokaro', name: 'Bokaro', hindiName: 'बोकारो', headquarters: 'Bokaro Steel City', population: '2,062,330', keyIssues: ['Fly ash recycling', 'Garga river contamination', 'Rural primary health'], lat: 23.6693, lng: 86.1511 },
  { id: 'hazaribagh', name: 'Hazaribagh', hindiName: 'हज़ारीबाग', headquarters: 'Hazaribagh', population: '1,734,495', keyIssues: ['Forest fringe human-elephant conflict', 'Konar canal water distribution', 'Cold storage'], lat: 23.9925, lng: 85.3637 },
  { id: 'deoghar', name: 'Deoghar', hindiName: 'देवघर', headquarters: 'Deoghar', population: '1,492,073', keyIssues: ['Pilgrim crowd sanitation', 'Rural fluoride contamination', 'Tele-health outreach'], lat: 24.4826, lng: 86.7000 },
  { id: 'dumka', name: 'Dumka', hindiName: 'दुमका', headquarters: 'Dumka', population: '1,321,442', keyIssues: ['Arsenic drinking water', 'Lac cultivation pest attack', 'Minor forest produce logistics'], lat: 24.2676, lng: 87.2517 },
  { id: 'palamu', name: 'Palamu', hindiName: 'पलामू', headquarters: 'Medininagar', population: '1,939,869', keyIssues: ['Recurrent drought', 'North Koel canal siltation', 'Underground water table depletion'], lat: 24.0435, lng: 84.0713 },
  { id: 'giridih', name: 'Giridih', hindiName: 'गिरिडीह', headquarters: 'Giridih', population: '2,445,474', keyIssues: ['Mica scrap occupational safety', 'Usri river siltation', 'Rural solar electrification'], lat: 24.1852, lng: 86.3079 },
  { id: 'ramgarh', name: 'Ramgarh', hindiName: 'रामगढ़', headquarters: 'Ramgarh Cantonment', population: '949,443', keyIssues: ['Damodar industrial discharge', 'Rajrappa pilgrim waste', 'Coal transport dust'], lat: 23.6263, lng: 85.5135 },
  { id: 'khunti', name: 'Khunti', hindiName: 'खूंटी', headquarters: 'Khunti', population: '531,885', keyIssues: ['Lac processing value addition', 'Drought tolerant millets', 'Solar micro-irrigation'], lat: 23.0722, lng: 85.2798 },
  { id: 'west-singhbhum', name: 'West Singhbhum', hindiName: 'पश्चिमी सिंहभूम', headquarters: 'Chaibasa', population: '1,502,338', keyIssues: ['Iron ore transport road degradation', 'Saranda forest solar connectivity', 'Malnutrition'], lat: 22.5517, lng: 85.8117 },
  { id: 'gumla', name: 'Gumla', hindiName: 'गुमला', headquarters: 'Gumla', population: '1,025,213', keyIssues: ['Finger millet blast disease', 'Solar cold chain', 'Rural road stabilization'], lat: 23.0440, lng: 84.5410 },
  { id: 'simdega', name: 'Simdega', hindiName: 'सिमडेगा', headquarters: 'Simdega', population: '599,578', keyIssues: ['Minor forest produce value addition', 'Sports biomechanics telemetry', 'Clean stream water'], lat: 22.6152, lng: 84.5098 },
  { id: 'latehar', name: 'Latehar', hindiName: 'लातेहार', headquarters: 'Latehar', population: '726,978', keyIssues: ['Forest telemetry fire alerts', 'Auranga river basin erosion', 'Tribal education'], lat: 23.7438, lng: 84.5042 },
  { id: 'garhwa', name: 'Garhwa', hindiName: 'गढ़वा', headquarters: 'Garhwa', population: '1,322,784', keyIssues: ['Kanhar river runoff management', 'Summer acute drought', 'Solar water pumps'], lat: 24.1611, lng: 83.8093 },
  { id: 'chatra', name: 'Chatra', hindiName: 'चतरा', headquarters: 'Chatra', population: '1,042,886', keyIssues: ['Off-grid solar microgrids', 'Tomato post-harvest loss', 'Rural health triage'], lat: 24.2087, lng: 84.8718 },
  { id: 'koderma', name: 'Koderma', hindiName: 'कोडरमा', headquarters: 'Koderma', population: '716,259', keyIssues: ['Tilaiya dam tourist safety', 'Groundwater fluoride', 'Youth skill incubation'], lat: 24.4682, lng: 85.5947 },
  { id: 'lohardaga', name: 'Lohardaga', hindiName: 'लोहरदगा', headquarters: 'Lohardaga', population: '461,790', keyIssues: ['Bauxite transit road wear', 'Vegetable cold preservation', 'Solar dryers'], lat: 23.4326, lng: 84.6811 },
  { id: 'saraikela-kharsawan', name: 'Saraikela Kharsawan', hindiName: 'सरायकेला खरसावां', headquarters: 'Saraikela', population: '1,065,056', keyIssues: ['Kharkai river industrial froth', 'Chhau cultural archiving tech', 'Rural drinking water'], lat: 22.6997, lng: 85.9304 },
  { id: 'jamtara', name: 'Jamtara', hindiName: 'जामताड़ा', headquarters: 'Jamtara', population: '791,042', keyIssues: ['Cyber safety digital education', 'Soil acidity', 'Cashew processing machinery'], lat: 23.9592, lng: 86.8016 },
  { id: 'godda', name: 'Godda', hindiName: 'गोड्डा', headquarters: 'Godda', population: '1,313,551', keyIssues: ['Thermal plant ambient air quality', 'Paddy procurement logistics', 'Flood channels'], lat: 24.8272, lng: 87.2140 },
  { id: 'sahibganj', name: 'Sahibganj', hindiName: 'साहिबगंज', headquarters: 'Sahibganj', population: '1,150,567', keyIssues: ['Ganges river bank erosion', 'Inland port freight logistics', 'Stone crusher dust control'], lat: 25.2425, lng: 87.6433 },
  { id: 'pakur', name: 'Pakur', hindiName: 'पाकुड़', headquarters: 'Pakur', population: '900,422', keyIssues: ['Stone quarry worker respiratory health', 'Paharia tribal drinking water', 'Solar irrigation'], lat: 24.6333, lng: 87.8488 },
];

export const PRESET_USERS: User[] = [
  {
    id: 'user-citizen-ramesh',
    name: 'Ramesh Munda',
    email: 'ramesh.munda@jharkhandmail.in',
    role: 'CITIZEN',
    phone: '+91 94311 02841',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-govt-amitesh',
    name: 'Dr. Amitesh Sinha, IAS',
    email: 'secy.highered@jharkhand.gov.in',
    role: 'GOVERNMENT',
    organizationName: 'Dept of Higher & Technical Education / State Innovation Council, Ranchi',
    phone: '+91 651 244 6100',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-univadmin-manna',
    name: 'Prof. Indranil Manna',
    email: 'vc@bitmesra.ac.in',
    role: 'UNIVERSITY_ADMIN',
    organizationName: 'Birla Institute of Technology (BIT) Mesra - Academic Administration',
    phone: '+91 651 227 5444',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-univ-anand',
    name: 'Dr. Anand Kumar Mishra',
    email: 'akmishra@bitmesra.ac.in',
    role: 'FACULTY',
    organizationName: 'BIT Mesra, Dept of Civil & Environmental Engineering',
    phone: '+91 94313 56789',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-student-priya',
    name: 'Priya Kumari',
    email: 'priya.iot@bitmesra.ac.in',
    role: 'STUDENT',
    organizationName: 'BIT Mesra Innovation Team (B.Tech IoT & Civil)',
    phone: '+91 82104 98765',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-student-amit',
    name: 'Amit Kumar',
    email: 'amit.unassigned@ranchiuniv.edu.in',
    role: 'STUDENT',
    organizationName: 'Ranchi University Department of IT (Unassigned Student)',
    phone: '+91 88770 12345',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-ind-sanjeev',
    name: 'Sanjeev Sengupta',
    email: 'sanjeev.sengupta@tatasteel.com',
    role: 'INDUSTRY',
    organizationName: 'Tata Steel Foundation & CSR Innovation Lab, Jamshedpur',
    phone: '+91 657 242 3456',
    district: 'East Singhbhum',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-mentor-rajesh',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@csir-cmfri.res.in',
    role: 'MENTOR',
    organizationName: 'National Innovation Foundation & CSIR Technical Advisory Council',
    phone: '+91 98112 34567',
    district: 'Ranchi',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
];

// Initial In-Memory State
interface DatabaseSchema {
  problems: Problem[];
  projects: Project[];
  clusters: ProblemCluster[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  solutionReuses: SolutionReuse[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'jh_db.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.initializeSeedData();
    this.tryLoadFromDisk();
  }

  private tryLoadFromDisk() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.problems && parsed.problems.length > 0) {
          this.data = parsed;
          // Hydrate any missing seed problems, projects and solution reuses
          const seed = this.initializeSeedData();
          if (!this.data.problems) this.data.problems = [];
          seed.problems.forEach((sp) => {
            if (!this.data.problems.some((p) => p.id === sp.id)) {
              this.data.problems.push(sp);
            }
          });
          if (!this.data.projects) this.data.projects = [];
          seed.projects.forEach((sp) => {
            if (!this.data.projects.some((p) => p.id === sp.id)) {
              this.data.projects.push(sp);
            }
          });
          if (!this.data.solutionReuses) this.data.solutionReuses = [];
          seed.solutionReuses?.forEach((sr) => {
            if (!this.data.solutionReuses.some((r) => r.id === sr.id)) {
              this.data.solutionReuses.push(sr);
            }
          });
          console.log(`[DB] Successfully loaded ${this.data.problems.length} problems, ${this.data.projects.length} projects, and ${this.data.solutionReuses.length} reusable solutions from ${DB_PATH}`);
        }
      }
    } catch (err) {
      console.warn('[DB] Could not load persisted DB file, using fresh seed data:', err);
    }
  }

  public saveToDisk() {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Failed to persist data to disk:', err);
    }
  }

  private initializeSeedData(): DatabaseSchema {
    // 1. Golden Demo Problem: School Floodwater Ingress
    const goldenPriority: PriorityBreakdown = {
      severityComponent: 30, // 30/30
      populationComponent: 22, // 22/25 (500 students)
      urgencyComponent: 18, // 18/20 (Immediate emergency during monsoon)
      geographicComponent: 12, // 12/15 (verified coordinates in Bundu, Ranchi)
      evidenceComponent: 5, // 5/10
      totalScore: 87, // 87/100
      level: 'CRITICAL',
      reasons: [
        'Acute monsoon structural floodwater ingress threatening primary school safety',
        'Directly affects 500 tribal children, halting mid-day meal & 18 instruction days/yr',
        'Immediate emergency urgency: recurring flash stream swells during peak monsoon',
        'Verified geo-coordinates on NH-33 Subarnarekha catchment tributary',
        'Multiple photographic proof documents school building inundated to 2.5 feet',
      ],
    };

    const goldenProblem: Problem = {
      id: 'JH-2026-00124',
      title: 'Monsoon Inundation & Flash Floodwater Ingress at Govt Middle School Bundu',
      description: 'During every monsoon downpour, flash flood runoff from the nearby Subarnarekha tributary surges directly into the Government Middle School Bundu campus. Classrooms and the kitchen shed submerge in 2.5 feet of stagnant muddy water. School operations halt for 18-22 instructional days each year, posing acute dengue and electrical hazards to 500 tribal boys and girls.',
      category: 'Education',
      location: {
        district: 'Ranchi',
        block: 'Bundu',
        villageOrWard: 'Ward 4, Bundu Nagar',
        landmark: 'Near Bundu Block Development Office & Subarnarekha Tributary',
        latitude: 23.1812,
        longitude: 85.5849,
      },
      evidence: [
        {
          id: 'ev-1',
          type: 'image',
          fileName: 'bundu_school_monsoon_inundation.jpg',
          url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=80',
          caption: 'Classroom corridor submerged under 2.5 feet of flash stream runoff',
          uploadedAt: '2026-08-14T09:30:00Z',
        },
        {
          id: 'ev-2',
          type: 'image',
          fileName: 'bundu_school_kitchen_waterlogging.jpg',
          url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
          caption: 'Mid-day meal ration store inundated by muddy water ingress',
          uploadedAt: '2026-08-14T09:32:00Z',
        },
      ],
      affectedPeopleCount: 500,
      frequency: 'Seasonal/Monsoon',
      urgency: 'Immediate Emergency',
      durationMonths: 24,
      status: 'ASSIGNED',
      submittedBy: 'user-citizen-ramesh',
      submitterName: 'Ramesh Munda',
      submitterPhone: '+91 94311 02841',
      submittedAt: '2026-08-14T09:35:00Z',
      isGoldenDemo: true,
      aiAnalysis: {
        category: 'Education',
        subcategory: 'School Water Infrastructure & Disaster Resilience',
        summary: 'Critical flash monsoon runoff ingress at Govt Middle School Bundu campus. Inundates classrooms to 2.5 ft, cutting off 500 students and halting mid-day meal operations.',
        severity: 9,
        urgency: 9,
        estimatedAffectedPeople: 500,
        keywords: ['Monsoon Inundation', 'Flood Early Warning', 'Ultrasonic Water Level Sensor', 'IoT Telemetry', 'Retention Bypass Drainage'],
        requiredSkills: ['Hydrological Modeling', 'IoT Sensor Firmware', 'Civil Drainage Design', 'GIS Watershed Topography'],
        requiredTechnologies: ['Solar Ultrasonic Level Gauges', 'LoRaWAN Edge Gateway', 'Automated Siren & Cloud Alerting', 'Hydro-dynamic Diverter Flumes'],
        possibleGovernmentDepartment: 'Department of School Education & Literacy / Water Resources Dept Jharkhand',
        problemType: 'INNOVATION',
        confidence: 0.96,
        rootCause: 'Absence of graded stormwater bypass channel coupled with low-lying compound grading directly aligned with the natural micro-watershed tributary discharge.',
        affectedPopulation: '500 enrolled tribal primary/middle students, 14 school staff, and neighboring 120 households',
        locationExpertise: 'Ranchi district Subarnarekha upper catchment drainage profile',
        solutionDomain: 'Integrated IoT ultrasonic hydrological telemetry, automated solar cloud early-warning alarm node, and civil retention-bypass drainage conduits.',
        expectedOutcome: 'Zero school closure days, 75% reduction in floodwater ingress events (from 12/yr to 3/yr during peak cloudbursts), and real-time SMS/siren alerts 45 minutes prior to flood surge.',
        analyzedAt: '2026-08-14T09:37:00Z',
        provider: 'gemini',
      },
      priority: goldenPriority,
      validation: {
        decision: 'VALIDATED',
        routedTo: 'INNOVATION',
        departmentId: 'dept-education',
        departmentName: 'Department of School Education & Literacy Jharkhand',
        notes: 'Priority validated at 87/100. High-risk school hazard requiring engineering & IoT innovation. Routed to HEI matching for rapid prototype development.',
        validatedBy: 'user-govt-amitesh',
        validatorName: 'Dr. Amitesh Sinha, IAS',
        validatedAt: '2026-08-15T11:00:00Z',
      },
      assignedUniversityId: 'univ-bit-mesra',
      assignedUniversityName: 'Birla Institute of Technology (BIT) Mesra',
      assignedDepartmentName: 'Civil & Environmental Engineering and Remote Sensing',
      projectId: 'proj-golden-flood-01',
    };

    // Golden Project for this problem
    const goldenProject: Project = {
      id: 'proj-golden-flood-01',
      problemId: 'JH-2026-00124',
      problemTitle: 'Monsoon Inundation & Flash Floodwater Ingress at Govt Middle School Bundu',
      title: 'Smart IoT Ultrasonic Flood Prediction & Early Warning System with Hydro-Diverter Conduits',
      summary: 'Engineering intervention combining solar-powered LoRaWAN ultrasonic water-level telemetry with calibrated civil gravity-drainage flumes to eliminate floodwater ingress into school campus.',
      universityId: 'univ-bit-mesra',
      universityName: 'Birla Institute of Technology (BIT) Mesra',
      facultyMentorName: 'Dr. Anand Kumar Mishra',
      facultyMentorEmail: 'akmishra@bitmesra.ac.in',
      department: 'Civil & Environmental Engineering',
      studentTeam: [
        { id: 'st-1', name: 'Priya Kumari', email: 'priya.iot@bitmesra.ac.in', department: 'Civil & IoT', skills: ['IoT', 'Hydrology', 'LoRaWAN'], roleInProject: 'Student Team Lead & Sensor Integration' },
        { id: 'st-2', name: 'Rahul Oraon', email: 'rahul.oraon@bitmesra.ac.in', department: 'Computer Science', skills: ['Backend', 'Cloud', 'AI/ML'], roleInProject: 'Cloud Telemetry & Alerting API' },
        { id: 'st-3', name: 'Sunita Soren', email: 'sunita.soren@bitmesra.ac.in', department: 'Remote Sensing', skills: ['GIS', 'Topography'], roleInProject: 'Watershed Elevation Profiling' },
      ],
      objectives: [
        'Deploy dual ultrasonic solar telemetry probes in upstream catchment canal',
        'Construct 140-meter reinforced concrete bypass retention flume around school boundary',
        'Implement solar edge gateway dispatching instant SMS/siren alerts 45 minutes ahead of cresting',
        'Verify zero classroom flooding during peak 2026 monsoon testing',
      ],
      scope: 'Govt Middle School Bundu campus boundary and 800m upstream catchment tributary channel.',
      budgetEst: '₹3,45,000 (Sponsored by Tata Steel CSR & Innovation Grant)',
      timelineMonths: 4,
      status: 'TESTING', // In active Testing & Pilot preparation!
      isGoldenDemo: true,
      milestones: [
        {
          id: 'ms-1',
          title: 'Hydrological Survey & Micro-Watershed GIS Mapping',
          description: 'Topographic contour elevation mapping and historical rainfall runoff surge analysis.',
          owner: 'Sunita Soren (Remote Sensing)',
          deadline: '2026-08-25',
          status: 'COMPLETED',
          progressPercent: 100,
          deliverables: ['GIS Contour Map.pdf', 'Catchment Runoff Volume Simulation'],
          evidenceUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80',
          completedAt: '2026-08-24T16:00:00Z',
          approvedBy: 'Dr. Anand Kumar Mishra',
        },
        {
          id: 'ms-2',
          title: 'IoT Sensor Node Prototyping & Edge LoRaWAN Telemetry',
          description: 'Fabrication of weatherproof dual ultrasonic level sensor node with solar battery charging.',
          owner: 'Priya Kumari (IoT Lead)',
          deadline: '2026-09-02',
          status: 'COMPLETED',
          progressPercent: 100,
          deliverables: ['Firmware v1.2 Code', 'LoRaWAN Edge Gateway Configuration'],
          evidenceUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
          completedAt: '2026-09-01T14:30:00Z',
          approvedBy: 'Dr. Anand Kumar Mishra',
        },
        {
          id: 'ms-3',
          title: 'Field Hardware Deployment & Stress Testing in Simulated Flash Flow',
          description: 'Installed hardware on upstream canal bridge and tested water sensor calibration against flume flow.',
          owner: 'Priya Kumari & Team',
          deadline: '2026-09-10',
          status: 'IN_PROGRESS',
          progressPercent: 85,
          deliverables: ['Sensor Calibration Logs', 'Flume Discharge Rate Report'],
        },
        {
          id: 'ms-4',
          title: 'Community Pilot Run & Siren Emergency Drill with School',
          description: 'Conduct live evacuation drill with 500 students and verify cloud SMS delivery to Headmaster & BDO.',
          owner: 'Dr. Anand Kumar Mishra',
          deadline: '2026-09-20',
          status: 'NOT_STARTED',
          progressPercent: 0,
        },
        {
          id: 'ms-5',
          title: 'State Impact Audit & Final Handover to School Management Committee',
          description: 'Official Government Impact Verification by District Education Officer.',
          owner: 'Dr. Amitesh Sinha (Govt)',
          deadline: '2026-09-30',
          status: 'NOT_STARTED',
          progressPercent: 0,
        },
      ],
      supportRequests: [
        {
          id: 'sr-1',
          projectId: 'proj-golden-flood-01',
          organizationId: 'ind-tata-steel',
          organizationName: 'Tata Steel Foundation & CSR Innovation Lab',
          supportType: 'Hardware',
          description: '2x Industrial Grade Ultrasonic Transducers (IP68) and 1x LoRaWAN Edge Gateway with Solar Panel kit',
          estimatedValue: '₹85,000',
          timeline: 'Immediate 48 hours',
          status: 'FULFILLED',
          offeredByCompany: 'Tata Steel CSR',
          offeredByUserName: 'Sanjeev Sengupta',
          offeredAt: '2026-08-18T10:00:00Z',
          notes: 'Dispatched from Jamshedpur warehouse via priority CSR courier.',
        },
        {
          id: 'sr-2',
          projectId: 'proj-golden-flood-01',
          organizationId: 'ind-tata-steel',
          organizationName: 'Tata Steel Foundation & CSR Innovation Lab',
          supportType: 'Technical Mentorship',
          description: 'Senior hydraulic structural engineer review for gravity flume civil design',
          estimatedValue: 'Pro-bono CSR Engineering',
          timeline: 'Weekly design review',
          status: 'ACCEPTED',
          offeredByCompany: 'Tata Steel CSR',
          offeredByUserName: 'Sanjeev Sengupta',
          offeredAt: '2026-08-19T14:00:00Z',
        },
      ],
      tests: [
        {
          id: 'test-1',
          testName: 'Ultrasonic Accuracy Calibration vs Manual Gauge Dip',
          testDate: '2026-08-28',
          environment: 'Canal Test Rig at Bundu Culvert',
          expectedResult: 'Measurement within ±5mm tolerance across 0-3 meter depth',
          actualResult: 'Achieved ±2.8mm precision across 150 automated sampling pulses',
          passed: true,
          notes: 'No false echoes detected from surface floating weeds.',
        },
        {
          id: 'test-2',
          testName: 'Solar-Battery Endurance under Cloudburst Darkness',
          testDate: '2026-09-01',
          environment: 'Zero sun indoor stress chamber',
          expectedResult: 'Continuous transmission for 96 hours on 12V 18Ah LiFePO4 battery',
          actualResult: 'Node operated continuously for 114 hours with 18% reserve charge remaining',
          passed: true,
          notes: 'Sleep power draw measured at 1.4mA.',
        },
      ],
      pilot: {
        id: 'pilot-1',
        location: 'Govt Middle School Bundu Campus & Culvert #4',
        startDate: '2026-08-25',
        endDate: '2026-09-25',
        targetUsersCount: 500,
        fieldConditions: 'Continuous monsoon rainfall season; wet muddy ground',
        resultsSummary: 'Sensor detected 2 upstream surge spikes and triggered alerts 48 minutes and 52 minutes ahead of cresting. Water was cleanly diverted away from classroom doorways.',
        issuesIdentified: ['Plastic trash trapped near intake grille requires monthly wire-mesh clearing'],
        communityApproval: true,
        governmentApproval: true,
        approvedByOfficial: 'Block Education Officer, Bundu, Ranchi',
      },
      deployment: {
        id: 'dep-1',
        deploymentDate: '2026-09-02',
        location: 'Bundu Govt Middle School, Culvert #4, Bundu Block, Ranchi District',
        district: 'Ranchi',
        block: 'Bundu',
        gpsCoordinates: { lat: 23.1812, lng: 85.5872 },
        version: 'v2.1-IoT-Sluice-Mesh',
        hardwareVersion: 'JH-LoRa-Hydro v2.1 (IP68 Solar Node)',
        softwareVersion: 'Cloud Sluice Alerting OS v1.4',
        activeBeneficiaries: 520,
        beneficiaryDemographics: '500 tribal school students, 20 faculty & staff, 150 surrounding village households',
        responsibleOrg: 'BIT Mesra Civil Dept & Bundu School SMC / District Administration',
        maintenanceSchedule: 'Quarterly sensor cleaning, silt desanding, and LiFePO4 battery health audit',
        maintenanceStatus: 'OPERATIONAL',
        lastServicedDate: '2026-09-02T10:00:00Z',
        nextMaintenanceDate: '2026-12-02T10:00:00Z',
        evidence: [
          {
            id: 'dev-1',
            title: 'Commissioning & Sluice Gate Flow Calibration Report',
            type: 'certification',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
            uploadedAt: '2026-09-02T08:30:00Z',
            uploadedBy: 'Dr. Amitesh Sinha, IAS',
          },
          {
            id: 'dev-2',
            title: 'Culvert Flume Sensor Array & Solar Mast Installation Photos',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
            uploadedAt: '2026-09-02T08:45:00Z',
            uploadedBy: 'Prof. Alok Ranjan',
          },
        ],
        approvalStatus: 'APPROVED',
        approvedByOfficial: 'Dr. Amitesh Sinha, IAS (State Innovation Council) & Block Development Officer, Bundu',
        approvedAt: '2026-09-02T11:00:00Z',
        approvalNotes: 'On-site technical inspection passed. Telemetry streams connected to State Innovation Command Dashboard.',
        commissioningCertUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
        status: 'ACTIVE',
      },
      impactKPIs: [
        {
          id: 'kpi-1',
          kpiName: 'Annual School Flood Inundation Incidents',
          metricCategory: 'Disaster Mitigation',
          baseline: '12 incidents / year',
          baselineNumber: 12,
          target: '4 incidents / year (67% reduction)',
          targetNumber: 4,
          actual: '3 incidents / year',
          actualNumber: 3,
          difference: '-9 incidents / year (-75%)',
          improvementPercentage: 75,
          unit: 'incidents / year',
          evidenceUrls: [
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
          ],
          evidenceDescription: 'Automated LoRa telemetry logs showing 3 high-water bypass events safely routed without school yard flooding during 85mm rainfall.',
          claimedBy: 'BIT Mesra Innovation Team',
          claimedAt: '2026-09-03T08:00:00Z',
          claimedNotes: 'Continuous automated ultrasonic gauge logs verified over 30 days of monsoon surge testing.',
          verificationStatus: 'VERIFIED',
          isVerifiedByGovernment: true,
          verifiedAt: '2026-09-03T10:00:00Z',
          verifiedBy: 'Dr. Amitesh Sinha, IAS',
          verificationRemarks: 'Audited on-site by District Administration. 75% reduction in flood inundations confirmed.',
          checklistStatus: {
            evidenceUploaded: true,
            pilotCompleted: true,
            governmentVerified: true,
          },
        },
        {
          id: 'kpi-2',
          kpiName: 'Instructional School Days Saved',
          metricCategory: 'Education Continuity',
          baseline: '18 lost days / year',
          baselineNumber: 18,
          target: '0 lost days',
          targetNumber: 0,
          actual: '0 lost days during pilot month',
          actualNumber: 0,
          difference: '-18 lost days (-100%)',
          improvementPercentage: 100,
          unit: 'school days',
          evidenceUrls: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
          ],
          evidenceDescription: 'School attendance register countersigned by Headmaster Bundu Middle School.',
          claimedBy: 'BIT Mesra Innovation Team',
          claimedAt: '2026-09-03T08:00:00Z',
          claimedNotes: 'Counter-checked with State Mid-Day Meal daily student attendance portal.',
          verificationStatus: 'VERIFIED',
          isVerifiedByGovernment: true,
          verifiedAt: '2026-09-03T10:00:00Z',
          verifiedBy: 'Dr. Amitesh Sinha, IAS',
          verificationRemarks: 'Certified by Block Education Officer. Zero closure days recorded.',
          checklistStatus: {
            evidenceUploaded: true,
            pilotCompleted: true,
            governmentVerified: true,
          },
        },
        {
          id: 'kpi-3',
          kpiName: 'Benefited Tribal Students & Staff',
          metricCategory: 'Social Inclusion',
          baseline: '0 protected',
          baselineNumber: 0,
          target: '500 students',
          targetNumber: 500,
          actual: '520 students & staff',
          actualNumber: 520,
          difference: '+520 beneficiaries (+100%)',
          improvementPercentage: 100,
          unit: 'students & teachers',
          evidenceUrls: [
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
          ],
          evidenceDescription: 'Student enrollment list and SMC resolution confirming permanent barrier operation.',
          claimedBy: 'BIT Mesra Innovation Team',
          claimedAt: '2026-09-03T08:00:00Z',
          verificationStatus: 'VERIFIED',
          isVerifiedByGovernment: true,
          verifiedAt: '2026-09-03T10:00:00Z',
          verifiedBy: 'Dr. Amitesh Sinha, IAS',
          verificationRemarks: 'Verified in State Beneficiary Registry.',
          checklistStatus: {
            evidenceUploaded: true,
            pilotCompleted: true,
            governmentVerified: true,
          },
        },
      ],
      citizenFeedbacks: [
        {
          id: 'cf-1',
          citizenName: 'Ramesh Munda',
          district: 'Ranchi',
          block: 'Bundu',
          village: 'Govt Middle School Compound, Bundu',
          solutionSolvedStatus: 'SOLVED',
          rating: 5,
          feedbackText: 'Our school compound has stayed dry for the first time in 10 years! The sirens warned the school guards before the canal overflowed, and water was diverted around the field. My daughter did not miss a single class this week.',
          evidenceUrls: [
            'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
          ],
          evidenceDescription: 'Photo of school entrance completely flood-free on Sep 4 during 85mm heavy downpour.',
          submittedAt: '2026-09-04T12:00:00Z',
          isOriginalSubmitter: true,
          isBeneficiary: true,
          roleOrRelation: 'Original Submitter & Parent / SMC Member',
        },
      ],
      createdAt: '2026-08-16T10:00:00Z',
      updatedAt: '2026-09-04T15:00:00Z',
    };

    // Project 2: Dumka Arsenic & Water Filtration (DEPLOYED & ACTIVE)
    const dumkaProject: Project = {
      id: 'proj-dumka-water-01',
      problemId: 'JH-2026-00085',
      problemTitle: 'Severe Arsenic Contamination in Drinking Borewells of Ranishwar Block',
      title: 'Low-Cost Nano-Adsorbent Arsenic & Fluoride Community Water Decontamination Unit',
      summary: 'Gravity-driven community filter using activated bauxite-laterite composite medium. Removes 98% arsenic and 89% fluoride without electricity or wastewater generation.',
      universityId: 'univ-iit-ism-dhanbad',
      universityName: 'IIT (ISM) Dhanbad',
      facultyMentorName: 'Prof. Sukumar Roy',
      facultyMentorEmail: 'sukumar.env@iitism.ac.in',
      department: 'Environmental Science & Chemical Engineering',
      studentTeam: [
        { id: 'st-d1', name: 'Alok Kumar Verma', email: 'alok.chem@iitism.ac.in', department: 'Chemical Eng', skills: ['Water Chemistry', 'Adsorption Media'], roleInProject: 'Filtration Column Sizing' },
        { id: 'st-d2', name: 'Neha Mahato', email: 'neha.env@iitism.ac.in', department: 'Environmental Eng', skills: ['Spectrophotometry', 'Field Testing'], roleInProject: 'Lab Assays & Arsenic Titration' },
      ],
      objectives: [
        'Synthesize 500kg nano-adsorbent laterite media in IIT ISM lab',
        'Fabricate 12 gravity filtration columns for Ranishwar community handpumps',
        'Train Panchayat Jal Sahiyas for weekly backwash maintenance',
      ],
      scope: 'Ranishwar block 14 drinking water borewell sites in Dumka.',
      budgetEst: '₹2,40,000 (Sponsored by CCL Ranchi CSR)',
      timelineMonths: 3,
      status: 'DEPLOYED',
      milestones: [
        { id: 'ms-d1', title: 'Adsorbent Synthesis & Lab Breakthrough', description: 'Prepared composite resin matrix', owner: 'Alok Verma', deadline: '2026-07-28', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-07-27T12:00:00Z' },
        { id: 'ms-d2', title: 'Field Installation at Ranishwar Point #1 to #8', description: 'Installed community filter towers', owner: 'Neha Mahato', deadline: '2026-08-10', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-09T16:00:00Z' },
        { id: 'ms-d3', title: 'State Water Quality Testing Certification', description: 'Certified arsenic < 0.005 mg/L', owner: 'Prof. Sukumar Roy', deadline: '2026-08-20', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-19T10:00:00Z' },
      ],
      supportRequests: [
        { id: 'sr-d1', projectId: 'proj-dumka-water-01', organizationName: 'CCL Ranchi CSR', supportType: 'Funding', description: 'Seed grant for HDPE filtration column casings', estimatedValue: '₹1,50,000', timeline: 'Fulfilled', status: 'FULFILLED' }
      ],
      tests: [
        { id: 'test-d1', testName: 'Arsenic Stripping Efficiency', testDate: '2026-08-12', environment: 'Mohanpur Handpump 3', expectedResult: '<0.01 mg/L', actualResult: '0.003 mg/L (98% elimination)', passed: true, notes: 'Field certified by PHED zonal testing kit' }
      ],
      pilot: {
        id: 'pilot-d1',
        location: 'Ranishwar Block HQ & Mohanpur Panchayat',
        startDate: '2026-08-01',
        endDate: '2026-08-20',
        targetUsersCount: 4200,
        fieldConditions: 'High iron and arsenic tubewell discharge',
        resultsSummary: 'Zero arsenic breakthrough over 120,000 liters treated water output.',
        issuesIdentified: [],
        communityApproval: true,
        governmentApproval: true,
        approvedByOfficial: 'Executive Engineer, PHED Dumka',
      },
      deployment: {
        id: 'dep-d1',
        deploymentDate: '2026-08-22',
        location: 'Ranishwar Block, Dumka District',
        district: 'Dumka',
        block: 'Ranishwar',
        version: 'v3.0-Nano-Adsorbent-Gravity',
        hardwareVersion: 'JH-Arsenic-Clean v3.0 (Gravity Filter Stack)',
        softwareVersion: 'N/A (Passive Gravity Flow)',
        activeBeneficiaries: 4200,
        beneficiaryDemographics: '4,200 rural residents across 14 vulnerable borewell hamlets',
        responsibleOrg: 'Dumka District PHED & Village Water Sanitation Committee',
        maintenanceSchedule: 'Bi-monthly backwash & annual media replacement',
        maintenanceStatus: 'OPERATIONAL',
        lastServicedDate: '2026-08-22T10:00:00Z',
        nextMaintenanceDate: '2026-10-22T10:00:00Z',
        evidence: [
          {
            id: 'dev-d1',
            title: 'PHED Water Quality Testing Lab Report',
            type: 'certification',
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
            uploadedAt: '2026-08-22T09:00:00Z',
            uploadedBy: 'Prof. Sukumar Roy',
          },
        ],
        approvalStatus: 'APPROVED',
        approvedByOfficial: 'Executive Engineer, PHED Dumka & District Collector',
        approvedAt: '2026-08-24T14:00:00Z',
        approvalNotes: 'Zero arsenic breakthrough certified across 14 handpump testing points.',
        commissioningCertUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
        status: 'ACTIVE',
      },
      impactKPIs: [
        {
          id: 'kpi-d1',
          kpiName: 'Drinking Water Arsenic Concentration',
          metricCategory: 'Public Health',
          baseline: '0.082 mg/L',
          baselineNumber: 0.082,
          target: '<0.010 mg/L (WHO Limit)',
          targetNumber: 0.010,
          actual: '0.003 mg/L',
          actualNumber: 0.003,
          difference: '-0.079 mg/L (-96% toxin reduction)',
          improvementPercentage: 96,
          unit: 'mg/L',
          evidenceUrls: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
          ],
          evidenceDescription: 'Spectrophotometric assay reports signed by PHED Zonal Lab.',
          claimedBy: 'IIT (ISM) Dhanbad Chemical Team',
          claimedAt: '2026-08-24T09:00:00Z',
          verificationStatus: 'VERIFIED',
          isVerifiedByGovernment: true,
          verifiedAt: '2026-08-25T11:00:00Z',
          verifiedBy: 'Dr. Amitesh Sinha, IAS',
          verificationRemarks: 'Certified by State PHED Water Testing Directorate.',
          checklistStatus: {
            evidenceUploaded: true,
            pilotCompleted: true,
            governmentVerified: true,
          },
        },
        {
          id: 'kpi-d2',
          kpiName: 'Fluoride Concentration Reduction',
          metricCategory: 'Water Safety',
          baseline: '3.8 mg/L',
          baselineNumber: 3.8,
          target: '1.0 mg/L',
          targetNumber: 1.0,
          actual: '0.6 mg/L',
          actualNumber: 0.6,
          difference: '-3.2 mg/L (-84%)',
          improvementPercentage: 84,
          unit: 'mg/L',
          evidenceUrls: [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
          ],
          evidenceDescription: 'Field electrode fluoride sensor telemetry and lab assay sheets uploaded by research fellows.',
          claimedBy: 'IIT (ISM) Dhanbad Environmental Eng',
          claimedAt: '2026-09-04T10:00:00Z',
          claimedNotes: 'Awaiting formal District Collector sign-off for statewide verification stamp.',
          verificationStatus: 'CLAIMED',
          isVerifiedByGovernment: false,
          checklistStatus: {
            evidenceUploaded: true,
            pilotCompleted: true,
            governmentVerified: false,
          },
        },
        {
          id: 'kpi-d3',
          kpiName: 'Rural Population with Clean Drinking Water',
          metricCategory: 'Community Impact',
          baseline: '0 beneficiaries',
          baselineNumber: 0,
          target: '4,200 villagers',
          targetNumber: 4200,
          actual: '4,200 villagers',
          actualNumber: 4200,
          difference: '+4,200 villagers protected (+100%)',
          improvementPercentage: 100,
          unit: 'people',
          evidenceUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'],
          claimedBy: 'IIT (ISM) Dhanbad Team',
          claimedAt: '2026-08-24T09:00:00Z',
          verificationStatus: 'VERIFIED',
          isVerifiedByGovernment: true,
          verifiedAt: '2026-08-25T11:00:00Z',
          verifiedBy: 'Dr. Amitesh Sinha, IAS',
          checklistStatus: {
            evidenceUploaded: true,
            pilotCompleted: true,
            governmentVerified: true,
          },
        },
      ],
      citizenFeedbacks: [
        {
          id: 'cf-d1',
          citizenName: 'Dr. Sunil Soren',
          district: 'Dumka',
          block: 'Ranishwar',
          village: 'Mohanpur',
          solutionSolvedStatus: 'SOLVED',
          rating: 5,
          feedbackText: 'The water from Mohanpur handpump used to smell metallic and turn yellow in 10 minutes. With the IIT ISM filter tower, the water is crystal clear and completely safe.',
          evidenceUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'],
          evidenceDescription: 'Clear test glass comparison photo from village Mohanpur community tap.',
          submittedAt: '2026-08-28T09:00:00Z',
          isOriginalSubmitter: false,
          isBeneficiary: true,
          roleOrRelation: 'Local Medical Officer & Community Leader',
        },
      ],
      createdAt: '2026-07-25T10:00:00Z',
      updatedAt: '2026-08-26T14:00:00Z',
    };

    // Project 3: Khunti Solar PCM Micro Cold Storage (DELAYED / BLOCKED - Bottleneck Milestone)
    const khuntiProject: Project = {
      id: 'proj-khunti-cold-01',
      problemId: 'JH-2026-00092',
      problemTitle: 'Tomato & Vegetable Post-Harvest Spoilage Due to Lack of Decentralized Cold Storage',
      title: 'Solar-Assisted Phase Change Material (PCM) Micro Cold Room for Farmers',
      summary: '5-metric-ton decentralized cold storage powered by rooftop solar PV with thermal brine PCM energy storage providing 36 hours cooling during zero sunlight.',
      universityId: 'univ-nit-jamshedpur',
      universityName: 'NIT Jamshedpur & BAU Ranchi',
      facultyMentorName: 'Dr. Rameshwar Prasad',
      facultyMentorEmail: 'rprasad.mech@nitjsr.ac.in',
      department: 'Mechanical Engineering & AgriTech',
      studentTeam: [
        { id: 'st-k1', name: 'Manish Hembrom', email: 'manish.mech@nitjsr.ac.in', department: 'Mechanical Eng', skills: ['Thermodynamics', 'HVAC', 'AutoCAD'], roleInProject: 'Thermal Envelope & Insulation Sizing' },
        { id: 'st-k2', name: 'Deepak Toppo', email: 'deepak.agri@bau.ac.in', department: 'BAU Horticulture', skills: ['Post-Harvest Physiology', 'AgriTech'], roleInProject: 'Crop Respiration & Humidity Optimization' },
      ],
      objectives: [
        'Fabricate 5-MT insulated PUF cold storage room at Murhu Weekly Haat',
        'Integrate 6kW solar rooftop array with eutectic salt PCM storage tanks',
        'Develop SMS slot booking system for smallholder tomato farmers',
      ],
      scope: 'Murhu Haat campus, Khunti District.',
      budgetEst: '₹6,20,000 (State Agri Innovation Fund)',
      timelineMonths: 4,
      status: 'BLOCKED',
      milestones: [
        { id: 'ms-k1', title: 'Topographic & Thermal Load Sizing', description: 'Completed thermal load calculation', owner: 'Manish Hembrom', deadline: '2026-08-10', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-08T15:00:00Z' },
        { id: 'ms-k2', title: 'Solar PV & Inverter Compressor Rig Assembly', description: 'Assembly of variable frequency brushless DC compressor unit', owner: 'Dr. Rameshwar Prasad', deadline: '2026-08-20', status: 'BLOCKED', progressPercent: 40, comments: 'DELAYED: Custom clearance and import duty exemption pending at State Commercial Taxes Dept for DC inverter compressor. Project delayed by 17 days.' },
        { id: 'ms-k3', title: 'PCM Thermal Brine Chamber Testing', description: '36-hour cold retention stress test without grid power', owner: 'Deepak Toppo', deadline: '2026-09-15', status: 'NOT_STARTED', progressPercent: 0 },
      ],
      supportRequests: [
        { id: 'sr-k1', projectId: 'proj-khunti-cold-01', organizationName: 'Jharkhand AgTech Accelerator', supportType: 'Technical Mentorship', description: 'Refrigeration cycle review', estimatedValue: 'Pro-bono', timeline: 'Fulfilled', status: 'FULFILLED' }
      ],
      tests: [],
      impactKPIs: [
        { id: 'kpi-khunti-1', kpiName: 'Tomato Post-Harvest Loss', baseline: '40% rot rate', target: '<5% rot rate', actual: 'Pending Pilot', unit: '% spoilage', improvementPercentage: 88, evidenceUrls: [], claimedBy: 'usr-faculty-ramesh', claimedAt: '2026-08-01T10:00:00Z', verificationStatus: 'CLAIMED', isVerifiedByGovernment: false }
      ],
      citizenFeedbacks: [],
      createdAt: '2026-07-28T10:00:00Z',
      updatedAt: '2026-08-21T11:00:00Z',
    };

    // Project 4: Hazaribagh Human-Elephant Conflict Early Warning (IN_PROGRESS)
    const hazaribaghProject: Project = {
      id: 'proj-hazaribagh-wildlife-01',
      problemId: 'JH-2026-00104',
      problemTitle: 'Human-Elephant Conflict & Crop Raiding in Forest Fringe Villages',
      title: 'AI Seismic Ground-Vibration & Thermal Vision Elephant Corridor Early Warning System',
      summary: 'Deployment of subterranean geophone sensors and AI edge optical-thermal cameras to detect elephant herd movement 3 km away and trigger automated SMS and strobe warnings.',
      universityId: 'univ-bit-mesra',
      universityName: 'Birla Institute of Technology (BIT) Mesra',
      facultyMentorName: 'Dr. Sweta Verma',
      facultyMentorEmail: 'sverma@bitmesra.ac.in',
      department: 'Computer Science & AI/ML and Wildlife Conservation',
      studentTeam: [
        { id: 'st-h1', name: 'Vikram Murmu', email: 'vikram.ai@bitmesra.ac.in', department: 'AI/ML', skills: ['Computer Vision', 'Edge AI', 'TensorFlow Lite'], roleInProject: 'Thermal Vision Model Training' },
        { id: 'st-h2', name: 'Anjali Tirkey', email: 'anjali.ece@bitmesra.ac.in', department: 'Electronics', skills: ['Geophones', 'Signal Processing'], roleInProject: 'Seismic Waveform Classification' },
      ],
      objectives: [
        'Deploy 8 subterranean geophone sensor pods along Churchu migration corridor',
        'Train edge AI model on 10,000 elephant stride vibration signatures with >94% precision',
        'Interface with Forest Range Officer dispatch console and village siren masts',
      ],
      scope: 'Churchu Forest Buffer, Hazaribagh District.',
      budgetEst: '₹4,50,000 (Forest Dept Innovation Grant)',
      timelineMonths: 4,
      status: 'PROTOTYPE',
      milestones: [
        { id: 'ms-h1', title: 'Corridor Acoustic & Seismic Soil Baseline Survey', description: 'Geophone calibration in forest soil', owner: 'Anjali Tirkey', deadline: '2026-08-22', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-20T14:00:00Z' },
        { id: 'ms-h2', title: 'Edge Neural Network Firmware Optimization', description: 'YOLOv8-Thermal model quantization', owner: 'Vikram Murmu', deadline: '2026-09-08', status: 'IN_PROGRESS', progressPercent: 75 },
        { id: 'ms-h3', title: 'Field Trial in Buffer Zone with Forest Guards', description: 'Live strobe & radio siren test', owner: 'Dr. Sweta Verma', deadline: '2026-09-25', status: 'NOT_STARTED', progressPercent: 0 },
      ],
      supportRequests: [],
      tests: [
        { id: 'test-h1', testName: 'Geophone Stride Detection at 1.5km', testDate: '2026-08-24', environment: 'Churchu Buffer Forest', expectedResult: '>90% SNR on 4-ton herd walk', actualResult: '94.2% SNR achieved', passed: true, notes: 'Acoustic waveform confirmed elephant footprint resonance' }
      ],
      impactKPIs: [
        { id: 'kpi-hazaribagh-1', kpiName: 'Early Warning Notice Period for Villages', baseline: '0 minutes (Surprise ingress)', target: '45 minutes advance warning', actual: '48 minutes in simulation', unit: 'minutes', improvementPercentage: 100, evidenceUrls: [], claimedBy: 'usr-faculty-sweta', claimedAt: '2026-08-10T10:00:00Z', verificationStatus: 'CLAIMED', isVerifiedByGovernment: false }
      ],
      citizenFeedbacks: [],
      createdAt: '2026-08-05T10:00:00Z',
      updatedAt: '2026-09-02T16:00:00Z',
    };

    // Project 5: Jharia Coal Mine Fire Telemetry (BLOCKED - Regulatory Clearance Bottleneck)
    const dhanbadProject: Project = {
      id: 'proj-dhanbad-minefire-01',
      problemId: 'JH-2026-00182',
      problemTitle: 'Methane Gas Seepage and Underground Smouldering in Jharia Coal Fringe Habitations',
      title: 'Autonomous Thermal UAV & Acoustic Subsurface Mine Fire Telemetry',
      summary: 'Automated thermal imaging drones combined with borehole thermocouple arrays to map subsurface smouldering fire progression and calculate ground subsidence risk zones.',
      universityId: 'univ-iit-ism-dhanbad',
      universityName: 'IIT (ISM) Dhanbad',
      facultyMentorName: 'Prof. Subhashis Mukherjee',
      facultyMentorEmail: 'smukherjee.mining@iitism.ac.in',
      department: 'Department of Mining Engineering & Applied Geophysics',
      studentTeam: [
        { id: 'st-j1', name: 'Debasish Panda', email: 'debasish.mine@iitism.ac.in', department: 'Mining Eng', skills: ['Mine Ventilation', 'Thermal Modeling'], roleInProject: 'Subsurface Heat Transfer Simulation' },
      ],
      objectives: [
        'Deploy thermal camera drone across Kujama Colliery settlement',
        'Map underground gas fissures with 0.5-meter thermal resolution',
      ],
      scope: 'Jharia coalfield settlement fringe, Dhanbad.',
      budgetEst: '₹7,80,000 (BCCL Mine Safety Fund)',
      timelineMonths: 5,
      status: 'BLOCKED',
      milestones: [
        { id: 'ms-j1', title: 'Sensor Payload Integration on Hexacopter', description: 'Thermal radiometric sensor calibration', owner: 'Debasish Panda', deadline: '2026-08-15', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-14T11:00:00Z' },
        { id: 'ms-j2', title: 'DGMS Opencast Airspace Flight Permission & Safety Trial', description: 'Formal clearance from Directorate General of Mines Safety', owner: 'Prof. Subhashis Mukherjee', deadline: '2026-08-28', status: 'BLOCKED', progressPercent: 30, comments: 'DELAYED: DGMS (Directorate General of Mines Safety) mandatory coal airspace permit pending statutory committee review. Delayed by 9 days.' },
      ],
      supportRequests: [],
      tests: [],
      impactKPIs: [
        { id: 'kpi-dhanbad-1', kpiName: 'Subsidence Risk Prediction Lead Time', baseline: '0 days (Sudden collapse)', target: '30 days advance notice', actual: 'Pending Flight Trial', unit: 'days', improvementPercentage: 100, evidenceUrls: [], claimedBy: 'usr-faculty-subhashis', claimedAt: '2026-08-22T10:00:00Z', verificationStatus: 'CLAIMED', isVerifiedByGovernment: false }
      ],
      citizenFeedbacks: [],
      createdAt: '2026-08-20T10:00:00Z',
      updatedAt: '2026-08-30T12:00:00Z',
    };

    // Project 6: Latehar Solar-Peltier Vaccine Carrier (TESTING)
    const lateharProject: Project = {
      id: 'proj-latehar-vaccine-01',
      problemId: 'JH-2026-00201',
      problemTitle: 'Lack of Cold Chain Transport for Remote Rural Vaccines in Latehar',
      title: 'Active Solar-Peltier Smart Cold Carrier with Telemetry for Forest Hamlets',
      summary: 'Lightweight (2.8kg) backpack vaccine cooler maintaining +2°C to +8°C for 14 hours using thermoelectric solid-state cooling and flexible solar panel hat.',
      universityId: 'univ-aiims-deoghar',
      universityName: 'AIIMS Deoghar & NIT Jamshedpur',
      facultyMentorName: 'Dr. Sneha Paul',
      facultyMentorEmail: 'spaul.comm@aiimsdeoghar.edu.in',
      department: 'Community Medicine & Biomedical Instrumentation',
      studentTeam: [
        { id: 'st-l1', name: 'Tanmay Ghosh', email: 'tanmay.bmed@nitjsr.ac.in', department: 'Instrumentation', skills: ['Peltier Cooling', 'Firmware'], roleInProject: 'Temperature PID Loop Controller' },
      ],
      objectives: [
        'Maintain +2°C to +8°C WHO vaccine temperature envelope across 42°C ambient heat',
        'Log GPS and temperature logs to State Health Cloud via SIM7000G module',
      ],
      scope: 'Mahuadanr block forest hamlets, Latehar.',
      budgetEst: '₹1,85,000 (ICMR Tribal Health Grant)',
      timelineMonths: 3,
      status: 'TESTING',
      milestones: [
        { id: 'ms-l1', title: 'Peltier Thermoelectric Enclosure Thermal Simulation', description: 'Optimized PUF insulation with vacuum panels', owner: 'Tanmay Ghosh', deadline: '2026-08-25', status: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-24T16:00:00Z' },
        { id: 'ms-l2', title: 'Hot Weather Chamber Testing at 45°C Ambient', description: 'Verified 14 hours continuous +4°C stability', owner: 'Dr. Sneha Paul', deadline: '2026-09-05', status: 'IN_PROGRESS', progressPercent: 90 },
      ],
      supportRequests: [],
      tests: [
        { id: 'test-l1', testName: 'Extreme Heat Stress Test (45°C Ambient)', testDate: '2026-09-01', environment: 'Thermal Lab Chamber', expectedResult: '+2°C to +8°C for 12 hours', actualResult: 'Maintained +4.1°C ± 0.4°C for 14.2 hours', passed: true, notes: 'Passed cold-chain ISO 9001 stability protocol' }
      ],
      impactKPIs: [
        { id: 'kpi-latehar-1', kpiName: 'Vaccine Spoilage Rate in Remote Forest Hauls', baseline: '22% spoiled vials', target: '0% spoiled vials', actual: '0% in lab trials', unit: '% spoilage', improvementPercentage: 100, evidenceUrls: [], claimedBy: 'usr-faculty-sneha', claimedAt: '2026-08-26T10:00:00Z', verificationStatus: 'CLAIMED', isVerifiedByGovernment: false }
      ],
      citizenFeedbacks: [],
      createdAt: '2026-08-24T10:00:00Z',
      updatedAt: '2026-09-04T12:00:00Z',
    };

    // Duplicate Cluster for the Golden Problem (23 similar reports in Subarnarekha Basin)
    const goldenCluster: ProblemCluster = {
      id: 'cluster-subarnarekha-01',
      masterProblemId: 'JH-2026-00124',
      clusterTitle: 'Subarnarekha Basin School & Rural Inundation Cluster (Bundu-Tamar-Sonahatu)',
      problemIds: ['JH-2026-00124', 'JH-2026-00142', 'JH-2026-00168', 'JH-2026-00189', 'JH-2026-00215'],
      similarityScore: 91,
      reason: '91% semantic, geographic, and hydrological overlap: All 5 reports document monsoon stormwater ingress into rural government schools along the NH-33 Subarnarekha catchment corridor.',
      status: 'MERGED',
      reviewedBy: 'user-govt-amitesh',
      reviewedAt: '2026-08-15T11:15:00Z',
    };

    // 2. Additional Realistic Demo Problems across Jharkhand's 24 Districts
    const additionalProblems: Problem[] = [
      {
        id: 'JH-2026-00142',
        title: 'Monsoon Flash Inundation at Upgraded High School Tamar',
        description: 'Stormwater overflow from hill slopes floods the school ground and kitchen store. Water stagnation lasts 4 days per heavy rain spell.',
        category: 'Education',
        location: { district: 'Ranchi', block: 'Tamar', villageOrWard: 'Tamar Bazar', latitude: 23.0542, longitude: 85.6421 },
        evidence: [{ id: 'ev-tamar', type: 'image', fileName: 'tamar_water.jpg', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500', uploadedAt: '2026-08-14' }],
        affectedPeopleCount: 420,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 18,
        status: 'DUPLICATE',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Mangal Singh Munda',
        submittedAt: '2026-08-14T14:10:00Z',
        masterClusterId: 'cluster-subarnarekha-01',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 420, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Ranchi', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00168',
        title: 'Runoff Ponding at Kasturba Gandhi Balika Vidyalaya Sonahatu',
        description: 'Excessive rainwater runoff from unpaved highway access enters girls hostel boundary wall causing acute dampness and hygiene risk.',
        category: 'Education',
        location: { district: 'Ranchi', block: 'Sonahatu', villageOrWard: 'Sonahatu Block HQ', latitude: 23.2104, longitude: 85.7198 },
        evidence: [{ id: 'ev-sonahatu', type: 'image', fileName: 'sonahatu_water.jpg', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500', uploadedAt: '2026-08-15' }],
        affectedPeopleCount: 380,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 12,
        status: 'DUPLICATE',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Sita Devi',
        submittedAt: '2026-08-15T08:20:00Z',
        masterClusterId: 'cluster-subarnarekha-01',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 380, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Ranchi', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00085',
        title: 'Severe Arsenic Contamination in Drinking Borewells of Ranishwar Block',
        description: 'Laboratory testing revealed arsenic levels exceeding 0.08 mg/L (WHO limit 0.01 mg/L) across 14 community handpumps. Multiple residents show keratosis skin lesions.',
        category: 'Water',
        location: { district: 'Dumka', block: 'Ranishwar', villageOrWard: 'Mohanpur & Ranishwar Panchayats', latitude: 24.0321, longitude: 87.4125 },
        evidence: [{ id: 'ev-dumka', type: 'document', fileName: 'water_test_lab_report.pdf', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', caption: 'State Public Health Engineering Lab Report', uploadedAt: '2026-07-20' }],
        affectedPeopleCount: 4200,
        frequency: 'Continuous',
        urgency: 'Immediate Emergency',
        durationMonths: 36,
        status: 'ASSIGNED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Dr. Sunil Soren',
        submittedAt: '2026-07-20T11:00:00Z',
        assignedUniversityId: 'univ-iit-ism-dhanbad',
        assignedUniversityName: 'IIT (ISM) Dhanbad',
        assignedDepartmentName: 'Environmental Science & Chemical Engineering',
        priority: calculatePriority({ severity: 10, affectedPeopleCount: 4200, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Dumka', evidenceCount: 2 }),
      },
      {
        id: 'JH-2026-00092',
        title: 'Tomato & Vegetable Post-Harvest Spoilage Due to Lack of Decentralized Cold Storage',
        description: 'Over 600 smallholder tribal farmers in Khunti face distress sales at ₹2/kg during peak harvest. Lack of local cold storage leads to 40% tomato rot within 48 hours.',
        category: 'Agriculture',
        location: { district: 'Khunti', block: 'Murhu', villageOrWard: 'Murhu Weekly Haat', latitude: 22.9812, longitude: 85.2981 },
        evidence: [{ id: 'ev-khunti', type: 'image', fileName: 'tomato_spoilage.jpg', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', uploadedAt: '2026-07-22' }],
        affectedPeopleCount: 1800,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 48,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Budhram Bhengra',
        submittedAt: '2026-07-22T09:15:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Department of Agriculture & Farmers Welfare Jharkhand',
          notes: 'High economic loss issue. Requires decentralized solar cold-storage unit innovation. Routing to NIT Jamshedpur and BAU Ranchi.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-07-24T10:00:00Z',
        },
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 1800, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Khunti', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00104',
        title: 'Human-Elephant Conflict & Crop Raiding in Forest Fringe Villages',
        description: 'Wild elephant herds crossing migration corridor regularly destroy standing paddy and mud dwellings in 8 forest fringe villages. Lack of early warning causes tragic human casualties.',
        category: 'Disaster Management',
        location: { district: 'Hazaribagh', block: 'Churchu', villageOrWard: 'Churchu Forest Buffer', latitude: 23.8912, longitude: 85.4912 },
        evidence: [{ id: 'ev-hazaribagh', type: 'image', fileName: 'elephant_damage.jpg', url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=500', uploadedAt: '2026-08-01' }],
        affectedPeopleCount: 3100,
        frequency: 'Weekly',
        urgency: 'Immediate Emergency',
        durationMonths: 60,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Birsa Marandi',
        submittedAt: '2026-08-01T15:40:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Department of Forest, Environment and Climate Change Jharkhand',
          notes: 'Validated for AI seismic vibration and thermal camera perimeter alert prototype.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-03T11:30:00Z',
        },
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 3100, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Hazaribagh', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00045',
        title: 'Broken High-Mast Streetlight & Cable Burn at Doranda Chowk',
        description: 'The municipal high-mast illumination tower has been non-functional for 3 weeks following a transformer fuse blowout. Causes traffic confusion at junction.',
        category: 'Urban Infrastructure',
        location: { district: 'Ranchi', block: 'Ranchi Urban', villageOrWard: 'Doranda Ward 28', latitude: 23.3321, longitude: 85.3214 },
        evidence: [{ id: 'ev-doranda', type: 'image', fileName: 'doranda_light.jpg', url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500', uploadedAt: '2026-06-10' }],
        affectedPeopleCount: 5000,
        frequency: 'Daily',
        urgency: 'Low',
        durationMonths: 1,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Manish Verma',
        submittedAt: '2026-06-10T18:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'GOVERNMENT_SERVICE', // Standard government service, does not need HEI or industry!
          departmentName: 'Ranchi Municipal Corporation (RMC) Electrical Wing',
          notes: 'Direct municipal repair requisition. Scheduled for electrical contractor fuse replacement. No academic research required.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-06-11T09:00:00Z',
        },
        priority: calculatePriority({ severity: 4, affectedPeopleCount: 5000, urgency: 'Low', hasCoordinates: true, district: 'Ranchi', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00177',
        title: 'Acute Ground Fluoride & Dental Fluorosis in Daltonganj Rural Schools',
        description: 'Deep tube wells in 12 villages register fluoride concentrations of 3.2 mg/L (limit 1.5 mg/L). Over 250 school children exhibit skeletal and dental fluorosis.',
        category: 'Healthcare',
        location: { district: 'Palamu', block: 'Daltonganj', villageOrWard: 'Chainpur Block', latitude: 24.0192, longitude: 84.0621 },
        evidence: [{ id: 'ev-palamu', type: 'document', fileName: 'dental_fluorosis_survey.pdf', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-08-16' }],
        affectedPeopleCount: 6500,
        frequency: 'Continuous',
        urgency: 'High (Weeks)',
        durationMonths: 72,
        status: 'UNDER_REVIEW',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Sanjay Pandey',
        submittedAt: '2026-08-16T10:30:00Z',
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 6500, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Palamu', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00182',
        title: 'Methane Gas Seepage and Underground Smouldering in Jharia Coal Fringe Habitations',
        description: 'Toxic CO and methane fumes seep through cracked ground in bastis adjacent to opencast pits. Surface ground temperatures exceed 55°C, risking sudden subsidence.',
        category: 'Disaster Management',
        location: { district: 'Dhanbad', block: 'Jharia', villageOrWard: 'Kujama Colliery Settlement', latitude: 23.7421, longitude: 86.4198 },
        evidence: [{ id: 'ev-jharia', type: 'image', fileName: 'jharia_smoke.jpg', url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500', uploadedAt: '2026-08-18' }],
        affectedPeopleCount: 8900,
        frequency: 'Continuous',
        urgency: 'Immediate Emergency',
        durationMonths: 120,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Shyam Sundar Rawani',
        submittedAt: '2026-08-18T16:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'RESEARCH',
          departmentName: 'Department of Mines & Geology / BCCL Fire Mitigation Task Force',
          notes: 'High risk hazard requiring underground acoustic sensing and thermal drone surveys.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-19T11:00:00Z',
        },
        priority: calculatePriority({ severity: 10, affectedPeopleCount: 8900, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Dhanbad', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00195',
        title: 'Finger Millet (Ragi) Blast Fungus Epidemic in Tribal Upland Farms',
        description: 'Leaf blast and neck blast fungal infections are wiping out indigenous finger millet crops across 15 villages in Gumla. Smallholder farmers lack diagnostic tools.',
        category: 'Agriculture',
        location: { district: 'Gumla', block: 'Raidih', villageOrWard: 'Raidih Tribal Belt', latitude: 23.0121, longitude: 84.4981 },
        evidence: [{ id: 'ev-gumla', type: 'image', fileName: 'millet_blast.jpg', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', uploadedAt: '2026-08-20' }],
        affectedPeopleCount: 1400,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 2,
        status: 'UNDER_REVIEW',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Anupa Kispotta',
        submittedAt: '2026-08-20T14:15:00Z',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 1400, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Gumla', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00201',
        title: 'Lack of Cold Chain Transport for Remote Rural Vaccines in Latehar',
        description: 'Auxiliary Nurse Midwives (ANMs) carry vaccines in melting ice flasks over 4 hours on foot to remote forest hamlets in Latehar. Temperature rises lead to spoiled measles and BCG vials.',
        category: 'Healthcare',
        location: { district: 'Latehar', block: 'Mahuadanr', villageOrWard: 'Chetma Forest Gram', latitude: 23.4121, longitude: 84.1121 },
        evidence: [{ id: 'ev-latehar', type: 'image', fileName: 'vaccine_flask.jpg', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-08-22' }],
        affectedPeopleCount: 2200,
        frequency: 'Weekly',
        urgency: 'High (Weeks)',
        durationMonths: 24,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Sister Teresa Xalxo',
        submittedAt: '2026-08-22T10:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Department of Health & Family Welfare Jharkhand',
          notes: 'Requires portable solar-Peltier vaccine carrier innovation. Routing to NIT Jamshedpur & AIIMS Deoghar.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-23T11:00:00Z',
        },
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 2200, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Latehar', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00210',
        title: 'Severe Fluoride & Turbidity in School Handpumps of Deoghar Border Blocks',
        description: 'Handpump water in 8 primary schools tests with excessive fluoride and red-mud turbidity. Students suffer stomach ailments and dental discoloration.',
        category: 'Water',
        location: { district: 'Deoghar', block: 'Madhupur', villageOrWard: 'Pathrol Panchayat', latitude: 24.2612, longitude: 86.6421 },
        evidence: [{ id: 'ev-deoghar', type: 'image', fileName: 'red_water.jpg', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500', uploadedAt: '2026-08-24' }],
        affectedPeopleCount: 1600,
        frequency: 'Daily',
        urgency: 'Immediate Emergency',
        durationMonths: 15,
        status: 'ASSIGNED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Rakesh Yadav',
        submittedAt: '2026-08-24T09:00:00Z',
        assignedUniversityId: 'univ-aiims-deoghar',
        assignedUniversityName: 'AIIMS Deoghar MedTech & Community Medicine',
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 1600, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Deoghar', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00220',
        title: 'Industrial Chemical Runoff & Turbidity in Kharkai River Basin',
        description: 'Industrial effluent and untreated urban drainage enter the Kharkai-Subarnarekha basin, raising BOD and heavy metal levels affecting 7,200 downstream fishing families.',
        category: 'Environment',
        location: { district: 'East Singhbhum', block: 'Golmuri-cum-Jugsalai', villageOrWard: 'Bagbera Colony', latitude: 22.7712, longitude: 86.1821 },
        evidence: [{ id: 'ev-es-01', type: 'image', fileName: 'kharkai_water.jpg', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500', uploadedAt: '2026-08-25' }],
        affectedPeopleCount: 7200,
        frequency: 'Continuous',
        urgency: 'Immediate Emergency',
        durationMonths: 48,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Rabin Mahto',
        submittedAt: '2026-08-25T11:20:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'State Pollution Control Board & Dept of Environment Jharkhand',
          notes: 'High priority riparian eco-zone. Assigned for bio-remediation floating wetland innovation to NIT Jamshedpur.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-26T14:00:00Z',
        },
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 7200, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'East Singhbhum', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00225',
        title: 'Fly Ash Particulate Air Dispersal & Respiratory Distress in Steel Corridor',
        description: 'Uncovered fly ash dykes and dry transport trucks disperse fine silica and heavy metal dust across 6 schools and surrounding colonies during summer winds.',
        category: 'Environment',
        location: { district: 'Bokaro', block: 'Chas', villageOrWard: 'Chas Ward 14', latitude: 23.6391, longitude: 86.1729 },
        evidence: [{ id: 'ev-bokaro-01', type: 'image', fileName: 'flyash_dust.jpg', url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500', uploadedAt: '2026-08-26' }],
        affectedPeopleCount: 5400,
        frequency: 'Daily',
        urgency: 'High (Weeks)',
        durationMonths: 36,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Poonam Devi',
        submittedAt: '2026-08-26T10:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'RESEARCH',
          departmentName: 'Department of Industries & Environment Jharkhand',
          notes: 'Validated for polymer dust suppression crusting agent research with BIT Sindri & IIT ISM Dhanbad.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-27T09:30:00Z',
        },
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 5400, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Bokaro', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00230',
        title: 'Mica Scrap Sorting Ergonomic Hazards & Fine Mineral Dust Inhalation',
        description: 'Over 850 artisanal mica pickers, predominantly women, suffer chronic musculoskeletal strain and pulmonary silica exposure due to lack of semi-mechanized sorting jigs.',
        category: 'Healthcare',
        location: { district: 'Giridih', block: 'Tisri', villageOrWard: 'Tisri Forest Fringe', latitude: 24.5612, longitude: 86.0612 },
        evidence: [{ id: 'ev-giridih-01', type: 'image', fileName: 'mica_workers.jpg', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-08-27' }],
        affectedPeopleCount: 2900,
        frequency: 'Daily',
        urgency: 'High (Weeks)',
        durationMonths: 60,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Sita Hansda',
        submittedAt: '2026-08-27T12:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Department of Labour, Employment & Training Jharkhand',
          notes: 'Requires ergonomic sorting sieve workstation prototype. Routing to Vinoba Bhave University & BIT Mesra.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-28T10:15:00Z',
        },
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 2900, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Giridih', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00235',
        title: 'Pilgrim Organic Waste Stagnation & Damodar River Siltation at Rajrappa',
        description: 'Daily pilgrim influx generates 4 tonnes of ceremonial flower, coconut, and food waste entering the Bhairavi-Damodar confluence without decentralized composting.',
        category: 'Waste Management',
        location: { district: 'Ramgarh', block: 'Chitarpur', villageOrWard: 'Rajrappa Mandir Complex', latitude: 23.6312, longitude: 85.7121 },
        evidence: [{ id: 'ev-ramgarh-01', type: 'image', fileName: 'rajrappa_waste.jpg', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500', uploadedAt: '2026-08-28' }],
        affectedPeopleCount: 4800,
        frequency: 'Daily',
        urgency: 'High (Weeks)',
        durationMonths: 24,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Mukesh Panda',
        submittedAt: '2026-08-28T14:30:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Urban Development & Housing Department / Tourism Wing',
          notes: 'Validated for rapid microbial enzyme accelerated composting & bio-briquette unit prototype.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-29T11:00:00Z',
        },
        priority: calculatePriority({ severity: 7, affectedPeopleCount: 4800, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Ramgarh', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00240',
        title: 'Severe Child Malnutrition & Falciparum Malaria Outbreak in Saranda Deep Forest',
        description: 'Inaccessible Ho tribal villages in dense Sal forest register 48% severe acute malnutrition among children under 5 and acute drug-resistant malaria during post-monsoon.',
        category: 'Healthcare',
        location: { district: 'West Singhbhum', block: 'Manoharpur', villageOrWard: 'Digha Forest Tola', latitude: 22.2512, longitude: 85.2012 },
        evidence: [{ id: 'ev-ws-01', type: 'document', fileName: 'saranda_health_survey.pdf', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-08-29' }],
        affectedPeopleCount: 3800,
        frequency: 'Continuous',
        urgency: 'Immediate Emergency',
        durationMonths: 36,
        status: 'ASSIGNED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Dr. Mangal Purty',
        submittedAt: '2026-08-29T09:15:00Z',
        assignedUniversityId: 'univ-kolhan',
        assignedUniversityName: 'Kolhan University Chaibasa & AIIMS Deoghar',
        priority: calculatePriority({ severity: 10, affectedPeopleCount: 3800, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'West Singhbhum', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00245',
        title: 'Lac (Kusmi) Processing Spoilage & Thermal Loss for Women Tribal SHGs',
        description: 'Over 400 women lac cultivators in Simdega lose 35% crop value due to fungal molding in unventilated mud barns before reaching the processing cluster.',
        category: 'Rural Livelihood',
        location: { district: 'Simdega', block: 'Kolebira', villageOrWard: 'Kolebira Weekly Haat', latitude: 22.7012, longitude: 84.7012 },
        evidence: [{ id: 'ev-simdega-01', type: 'image', fileName: 'lac_crop.jpg', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', uploadedAt: '2026-08-30' }],
        affectedPeopleCount: 1900,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 18,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Shanti Baa',
        submittedAt: '2026-08-30T11:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Department of Agriculture & Farmers Welfare / Tribal Cooperative',
          notes: 'Validated for solar forced-convection lac drying and grading chamber prototype. Routing to BAU Ranchi & Simdega College.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-08-31T10:00:00Z',
        },
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 1900, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Simdega', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00250',
        title: 'Severe Summer Groundwater Table Collapse & Parched Paddy in Kanhar Basin',
        description: 'Borewells dry up by February across 18 villages in Garhwa plateau. Unlined hill runoff results in 90% monsoon water drainage into Sone river within 72 hours.',
        category: 'Water',
        location: { district: 'Garhwa', block: 'Bhandaria', villageOrWard: 'Bhandaria Plateau', latitude: 23.9512, longitude: 83.5812 },
        evidence: [{ id: 'ev-garhwa-01', type: 'image', fileName: 'dry_well.jpg', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500', uploadedAt: '2026-08-31' }],
        affectedPeopleCount: 6100,
        frequency: 'Seasonal/Monsoon',
        urgency: 'Immediate Emergency',
        durationMonths: 60,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Vikramaditya Shukla',
        submittedAt: '2026-08-31T15:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Water Resources Department & Minor Irrigation Division',
          notes: 'High drought vulnerability zone. Validated for sub-surface check dams and GIS hydrological recharge mapping with BIT Mesra.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-09-01T09:00:00Z',
        },
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 6100, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Garhwa', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00255',
        title: 'Perishable Tomato & Papaya Glut Wastage in Remote Tribal Haats of Chatra',
        description: 'Chatra upland farmers harvest 25 tonnes of tomatoes daily in January-February but lack dehydration or pulp processing, selling at loss of ₹1.5/kg.',
        category: 'Agriculture',
        location: { district: 'Chatra', block: 'Itkhori', villageOrWard: 'Itkhori Block Mandi', latitude: 24.2812, longitude: 85.1512 },
        evidence: [{ id: 'ev-chatra-01', type: 'image', fileName: 'tomato_glut.jpg', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', uploadedAt: '2026-09-01' }],
        affectedPeopleCount: 2400,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 24,
        status: 'UNDER_REVIEW',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Ramanand Dangi',
        submittedAt: '2026-09-01T10:30:00Z',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 2400, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Chatra', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00260',
        title: 'Excessive Fluoride & Blue-Green Algal Blooms in Tilaiya Catchment Reservoirs',
        description: 'Surface water supplied from Tilaiya tributary intakes shows elevated microcystin algal toxins and 2.8 mg/L fluoride in nearby village supply handpumps.',
        category: 'Water',
        location: { district: 'Koderma', block: 'Jainagar', villageOrWard: 'Tilaiya Dam Catchment', latitude: 24.3212, longitude: 85.5312 },
        evidence: [{ id: 'ev-koderma-01', type: 'document', fileName: 'tilaiya_water_test.pdf', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-09-01' }],
        affectedPeopleCount: 3300,
        frequency: 'Continuous',
        urgency: 'Immediate Emergency',
        durationMonths: 18,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Alok Ranjan Barnwal',
        submittedAt: '2026-09-01T16:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'RESEARCH',
          departmentName: 'Drinking Water and Sanitation Department (DWSD)',
          notes: 'Assigned to Vinoba Bhave University & IIT ISM Dhanbad for multi-stage coagulant and solar UV oxidation trial.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-09-02T11:00:00Z',
        },
        priority: calculatePriority({ severity: 9, affectedPeopleCount: 3300, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Koderma', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00265',
        title: 'Bauxite Heavy Haulage Road Degradation & Infrasound Dust Pollution',
        description: 'Continuous transit of 40-ton ore trucks on rural state highways cracks masonry culverts and fills roadside primary school classrooms with red bauxite dust.',
        category: 'Urban Infrastructure',
        location: { district: 'Lohardaga', block: 'Kisko', villageOrWard: 'Kisko Ghati Corridor', latitude: 23.5112, longitude: 84.6212 },
        evidence: [{ id: 'ev-lohardaga-01', type: 'image', fileName: 'road_wear.jpg', url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=500', uploadedAt: '2026-09-02' }],
        affectedPeopleCount: 4100,
        frequency: 'Daily',
        urgency: 'High (Weeks)',
        durationMonths: 36,
        status: 'UNDER_REVIEW',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Birendra Bhagat',
        submittedAt: '2026-09-02T14:00:00Z',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 4100, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Lohardaga', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00270',
        title: 'Heavy Metal Effluent in Adityapur Industrial Drainage & Ground Seepage',
        description: 'Untreated electroplating and metal rinse waters seep into shallow aquifers of 12 bastis surrounding Adityapur Industrial Area, exceeding hexavalent chromium norms.',
        category: 'Environment',
        location: { district: 'Saraikela Kharsawan', block: 'Gamharia', villageOrWard: 'Adityapur Phase 4', latitude: 22.8012, longitude: 86.1312 },
        evidence: [{ id: 'ev-sk-01', type: 'document', fileName: 'adityapur_effluent.pdf', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-09-02' }],
        affectedPeopleCount: 8200,
        frequency: 'Continuous',
        urgency: 'Immediate Emergency',
        durationMonths: 72,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Prakash Chandra Mahato',
        submittedAt: '2026-09-02T17:30:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'State Pollution Control Board & AIADA Industrial Authority',
          notes: 'High priority industrial hub. Routed to NIT Jamshedpur for zero-liquid discharge electro-coagulation prototype.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-09-03T10:00:00Z',
        },
        priority: calculatePriority({ severity: 10, affectedPeopleCount: 8200, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Saraikela Kharsawan', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00275',
        title: 'Hyper-Acidic Soil (pH 4.4) Causing Stunted Paddy & Iron Toxicity',
        description: 'Over 1,200 smallholder farmers in Jamtara uplands suffer 45% paddy yield loss due to severe soil acidity and aluminum/iron toxicity under low organic matter conditions.',
        category: 'Agriculture',
        location: { district: 'Jamtara', block: 'Narayanpur', villageOrWard: 'Narayanpur Agricultural Belt', latitude: 24.0112, longitude: 86.7212 },
        evidence: [{ id: 'ev-jamtara-01', type: 'document', fileName: 'soil_test_card.pdf', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500', uploadedAt: '2026-09-03' }],
        affectedPeopleCount: 2800,
        frequency: 'Seasonal/Monsoon',
        urgency: 'High (Weeks)',
        durationMonths: 24,
        status: 'ASSIGNED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Shambhu Mandal',
        submittedAt: '2026-09-03T09:00:00Z',
        assignedUniversityId: 'univ-skmu',
        assignedUniversityName: 'Sido Kanhu Murmu University & BAU Ranchi',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 2800, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Jamtara', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00280',
        title: 'Thermal Coal Conveyor Dust Settlement on Standing Paddy and Mango Orchards',
        description: 'Unenclosed coal conveyor belts and loading sidings in Godda disperse carbonaceous dust, forming thick black crusts on foliage and reducing crop photosynthesis by 40%.',
        category: 'Environment',
        location: { district: 'Godda', block: 'Boarijor', villageOrWard: 'Lalmatia Coal Fringe', latitude: 25.0412, longitude: 87.3512 },
        evidence: [{ id: 'ev-godda-01', type: 'image', fileName: 'coal_dust_crops.jpg', url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500', uploadedAt: '2026-09-03' }],
        affectedPeopleCount: 4600,
        frequency: 'Daily',
        urgency: 'High (Weeks)',
        durationMonths: 30,
        status: 'UNDER_REVIEW',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Debu Murmu',
        submittedAt: '2026-09-03T14:45:00Z',
        priority: calculatePriority({ severity: 8, affectedPeopleCount: 4600, urgency: 'High (Weeks)', hasCoordinates: true, district: 'Godda', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00285',
        title: 'Severe Ganges Riverbank Erosion & Habitation Loss at Rajmahal',
        description: 'Monsoon scouring along the Ganges riverbank cuts 15 meters of alluvial bank annually, endangering 6 primary schools, ghats, and 450 residential dwellings.',
        category: 'Disaster Management',
        location: { district: 'Sahibganj', block: 'Rajmahal', villageOrWard: 'Kanjhi Riverfront Basti', latitude: 25.0512, longitude: 87.8412 },
        evidence: [{ id: 'ev-sahibganj-01', type: 'image', fileName: 'river_erosion.jpg', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=500', uploadedAt: '2026-09-04' }],
        affectedPeopleCount: 7500,
        frequency: 'Seasonal/Monsoon',
        urgency: 'Immediate Emergency',
        durationMonths: 48,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Zubair Ansari',
        submittedAt: '2026-09-04T10:00:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'RESEARCH',
          departmentName: 'Water Resources Department & Inland Waterways Authority of India',
          notes: 'High risk erosion corridor. Validated for bio-engineering vetiver geotextile armor and acoustic scouring sensors with NIT Jamshedpur.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-09-04T16:00:00Z',
        },
        priority: calculatePriority({ severity: 10, affectedPeopleCount: 7500, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Sahibganj', evidenceCount: 1 }),
      },
      {
        id: 'JH-2026-00290',
        title: 'Stone Crushing Plant Silica Dust & Silicosis Hazard for Paharia Tribal Families',
        description: 'Dense cluster of 120 opencast stone crushers in Pakur operates without wet dust-suppression curtains. High prevalence of chronic silicosis and tuberculosis among crusher workers.',
        category: 'Healthcare',
        location: { district: 'Pakur', block: 'Malpahari', villageOrWard: 'Malpahari Crusher Belt', latitude: 24.6212, longitude: 87.8212 },
        evidence: [{ id: 'ev-pakur-01', type: 'document', fileName: 'silicosis_screening_report.pdf', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500', uploadedAt: '2026-09-05' }],
        affectedPeopleCount: 5200,
        frequency: 'Daily',
        urgency: 'Immediate Emergency',
        durationMonths: 60,
        status: 'VALIDATED',
        submittedBy: 'user-citizen-ramesh',
        submitterName: 'Dr. Arvind Hansda',
        submittedAt: '2026-09-05T08:30:00Z',
        validation: {
          decision: 'VALIDATED',
          routedTo: 'INNOVATION',
          departmentName: 'Department of Health & Family Welfare / Mines & Geology',
          notes: 'Critical occupational hazard. Validated for high-pressure fogging dust suppression nozzles and AI radiographic screening with AIIMS Deoghar.',
          validatedBy: 'user-govt-amitesh',
          validatorName: 'Dr. Amitesh Sinha, IAS',
          validatedAt: '2026-09-05T12:00:00Z',
        },
        priority: calculatePriority({ severity: 10, affectedPeopleCount: 5200, urgency: 'Immediate Emergency', hasCoordinates: true, district: 'Pakur', evidenceCount: 1 }),
      },
    ];

    // Seed Completed Solutions for Knowledge & Solution Reuse Repository
    const solutionReuses: SolutionReuse[] = [
      {
        id: 'reuse-01',
        title: 'Smart IoT Ultrasonic Flood Early Warning & Stormwater Bypass System',
        problemCategory: 'Education',
        district: 'Ranchi',
        originalProblemId: 'JH-2026-00124',
        originalProjectId: 'proj-golden-flood-01',
        deployedSolutionSummary: 'Solar-powered dual ultrasonic river-cresting sensor node combined with rapid gravity-flow bypass retention channels. Tested to prevent classroom inundation and save 18 school instruction days per monsoon.',
        technologyStack: ['LoRaWAN Telemetry', 'Ultrasonic Transducers (IP68)', 'LiFePO4 Solar Node', 'Python Cloud Alerting API', 'Civil Diverter Flumes'],
        estimatedCost: '₹3,45,000 per school cluster',
        developedByUniversity: 'BIT Mesra (Civil & Remote Sensing)',
        supportedByIndustry: 'Tata Steel Foundation & CSR Innovation Lab',
        measuredImpact: '75% reduction in flood inundation incidents; zero lost instructional days; 500 protected tribal students.',
        blueprintDocsUrl: 'https://jharkhand-hub.gov.in/docs/blueprints/smart_flood_bypass_v2.pdf',
        timesReused: 4,
        deploymentsCount: 5,
      },
      {
        id: 'reuse-02',
        title: 'Low-Cost Nano-Adsorbent Arsenic & Fluoride Community Water Filter',
        problemCategory: 'Water',
        district: 'Dumka',
        originalProblemId: 'JH-2026-00085',
        originalProjectId: 'proj-dumka-water-01',
        deployedSolutionSummary: 'Gravity-driven community filter using activated bauxite-laterite composite medium. Removes 98% arsenic and 89% fluoride without electricity or wastewater generation.',
        technologyStack: ['Nano-composite Adsorbent', 'Food-grade HDPE Tank', 'Local Backwash Valve'],
        estimatedCost: '₹48,000 per community point',
        developedByUniversity: 'IIT (ISM) Dhanbad',
        supportedByIndustry: 'CCL Ranchi CSR',
        measuredImpact: 'Drinking water brought within WHO limits for 4,200 villagers; eliminated new skin keratosis incidences.',
        blueprintDocsUrl: 'https://jharkhand-hub.gov.in/docs/blueprints/arsenic_filter_iitism.pdf',
        timesReused: 8,
        deploymentsCount: 12,
      },
      {
        id: 'reuse-03',
        title: 'Solar-Assisted Phase Change Material (PCM) Micro Cold Room for Farmers',
        problemCategory: 'Agriculture',
        district: 'Khunti',
        originalProblemId: 'JH-2026-00092',
        originalProjectId: 'proj-khunti-cold-01',
        deployedSolutionSummary: '5-metric-ton decentralized cold storage powered by rooftop solar PV with thermal brine PCM energy storage providing 36 hours cooling during zero sunlight.',
        technologyStack: ['PCM Thermal Energy Storage', 'Brushless DC Variable Inverter Compressor', 'Monocrystalline Solar PV', 'Mobile Haat Booking App'],
        estimatedCost: '₹6,20,000 per cluster haat',
        developedByUniversity: 'NIT Jamshedpur & BAU Ranchi',
        supportedByIndustry: 'Jharkhand AgTech Accelerator',
        measuredImpact: 'Reduced tomato post-harvest spoilage from 40% to 4%; increased farmer realization by ₹8/kg.',
        blueprintDocsUrl: 'https://jharkhand-hub.gov.in/docs/blueprints/solar_pcm_coldroom.pdf',
        timesReused: 6,
        deploymentsCount: 7,
      },
    ];

    const initialNotifications: Notification[] = [
      {
        id: 'notif-1',
        userId: 'user-govt-amitesh',
        targetRole: 'GOVERNMENT_OFFICER',
        title: 'New High Priority Problem: School Flood Ingress',
        message: 'Problem JH-2026-00124 reported in Bundu, Ranchi with priority score 87/100. AI suggests INNOVATION route to BIT Mesra.',
        type: 'VALIDATION',
        read: false,
        referenceId: 'JH-2026-00124',
        createdAt: '2026-08-14T09:40:00Z',
      },
      {
        id: 'notif-2',
        userId: 'user-univ-anand',
        targetRole: 'FACULTY',
        title: 'HEI Problem Match Assigned: 91% Match Score',
        message: 'Govt has approved and routed JH-2026-00124 (Bundu School Flood Mitigation) to BIT Mesra Civil & Remote Sensing.',
        type: 'UNIVERSITY_MATCH',
        read: false,
        referenceId: 'JH-2026-00124',
        createdAt: '2026-08-15T11:05:00Z',
      },
      {
        id: 'notif-3',
        userId: 'user-ind-sanjeev',
        targetRole: 'INDUSTRY_PARTNER',
        title: 'New Innovation Opportunity in Ranchi: Tata Steel CSR Match (91%)',
        message: 'Project "Smart IoT Flood Early Warning System" requests ultrasonic sensors and technical mentorship under CSR.',
        type: 'INDUSTRY_SUPPORT',
        read: false,
        referenceId: 'proj-golden-flood-01',
        createdAt: '2026-08-17T09:10:00Z',
      },
    ];

    const initialAuditLogs: AuditLog[] = [
      {
        id: 'audit-1',
        action: 'PROBLEM_SUBMITTED',
        performedBy: 'Ramesh Munda',
        role: 'CITIZEN',
        targetObject: 'Problem',
        objectId: 'JH-2026-00124',
        timestamp: '2026-08-14T09:35:00Z',
        details: 'Citizen submitted problem with 2 photo evidences and GPS coordinates in Bundu, Ranchi.',
        who: 'Ramesh Munda (Citizen Submitter)',
        what: 'Problem Submission',
        when: '2026-08-14T09:35:00Z',
        objectEntity: 'Problem JH-2026-00124',
        oldValue: 'N/A',
        newValue: 'SUBMITTED',
        reason: 'Severe annual monsoon waterlogging at Government High School Bundu inundating classrooms and blocking student attendance.',
      },
      {
        id: 'audit-2',
        action: 'AI_ANALYSIS_COMPLETED',
        performedBy: 'Gemini 3.8 Flash Engine',
        role: 'SUPER_ADMIN',
        targetObject: 'Problem',
        objectId: 'JH-2026-00124',
        timestamp: '2026-08-14T09:37:00Z',
        details: 'AI classified category as Education/Water, suggested INNOVATION routing and recommended BIT Mesra.',
        who: 'Gemini 3.8 Flash (AI Triage Engine)',
        what: 'AI Triaging & R&D Matching',
        when: '2026-08-14T09:37:00Z',
        objectEntity: 'Problem JH-2026-00124',
        oldValue: 'SUBMITTED',
        newValue: 'AI_ANALYZED',
        reason: 'High severity score 87/100 calculated based on 500+ affected tribal students and high flood risk probability.',
      },
      {
        id: 'audit-3',
        action: 'HUMAN_GOVERNMENT_VALIDATED',
        performedBy: 'Dr. Amitesh Sinha, IAS',
        role: 'GOVERNMENT_OFFICER',
        targetObject: 'Problem',
        objectId: 'JH-2026-00124',
        timestamp: '2026-08-15T11:00:00Z',
        details: 'Government validated problem at Priority 87/100 and authorized assignment to BIT Mesra.',
        who: 'Dr. Amitesh Sinha, IAS (Government Officer)',
        what: 'Status: UNDER_REVIEW → VALIDATED',
        when: '2026-08-15T11:00:00Z',
        objectEntity: 'Problem JH-2026-00124',
        oldValue: 'UNDER_REVIEW',
        newValue: 'VALIDATED',
        reason: 'Verified field photographic evidence and confirmed waterlogging urgency with Bundu Circle Officer.',
      },
      {
        id: 'audit-4',
        action: 'HEI_ASSIGNMENT',
        performedBy: 'Dr. Amitesh Sinha, IAS',
        role: 'GOVERNMENT_OFFICER',
        targetObject: 'Problem',
        objectId: 'JH-2026-00124',
        timestamp: '2026-08-15T11:05:00Z',
        details: 'Problem assigned to Birla Institute of Technology (BIT) Mesra Water Resources Lab.',
        who: 'Dr. Amitesh Sinha, IAS (Government Officer)',
        what: 'HEI R&D Assignment',
        when: '2026-08-15T11:05:00Z',
        objectEntity: 'Problem JH-2026-00124',
        oldValue: 'Unassigned',
        newValue: 'BIT Mesra',
        reason: 'BIT Mesra possesses specialized IoT hydrologic sensing expertise and proximity to Ranchi watershed.',
      },
      {
        id: 'audit-5',
        action: 'PROJECT_PROPOSAL_SUBMITTED',
        performedBy: 'Dr. Anand Mishra (BIT Mesra Lead)',
        role: 'FACULTY',
        targetObject: 'Project',
        objectId: 'proj-golden-flood-01',
        timestamp: '2026-08-17T09:10:00Z',
        details: 'Project proposal submitted: Bundu Smart IoT Drainage Sluice Gate System.',
        who: 'Dr. Anand Mishra (BIT Mesra Faculty Mentor)',
        what: 'R&D Proposal Submitted',
        when: '2026-08-17T09:10:00Z',
        objectEntity: 'Project proj-golden-flood-01',
        oldValue: 'DRAFT',
        newValue: 'PROPOSAL_SUBMITTED',
        reason: 'Submitted complete engineering blueprint, timeline, and multi-student team structure for state approval.',
      },
      {
        id: 'audit-6',
        action: 'INDUSTRY_SUPPORT_ACCEPTED',
        performedBy: 'Sanjeev Sengupta (Tata Steel CSR)',
        role: 'INDUSTRY_PARTNER',
        targetObject: 'Project',
        objectId: 'proj-golden-flood-01',
        timestamp: '2026-08-18T10:00:00Z',
        details: 'Tata Steel CSR fulfilled hardware request for ultrasonic transducers and edge gateway.',
        who: 'Sanjeev Sengupta (Tata Steel CSR)',
        what: 'CSR Funding & Hardware Pledge',
        when: '2026-08-18T10:00:00Z',
        objectEntity: 'Project proj-golden-flood-01',
        oldValue: 'UNFUNDED',
        newValue: 'CSR_FUNDED',
        reason: 'Tata Steel CSR grant of ₹3,45,000 sanctioned for IoT hardware and solar power infrastructure.',
      },
      {
        id: 'audit-7',
        action: 'STAGE_APPROVED',
        performedBy: 'Dr. Amitesh Sinha, IAS',
        role: 'GOVERNMENT_OFFICER',
        targetObject: 'Project',
        objectId: 'proj-golden-flood-01',
        timestamp: '2026-08-25T14:30:00Z',
        details: 'Government Command Center approved field pilot stress-test stage.',
        who: 'Dr. Amitesh Sinha, IAS (Government Officer)',
        what: 'Stage Approval: PROTOTYPE → DEPLOYED',
        when: '2026-08-25T14:30:00Z',
        objectEntity: 'Project proj-golden-flood-01',
        oldValue: 'PROTOTYPE',
        newValue: 'DEPLOYED',
        reason: 'Field simulation test verified 100% drainage discharge rate during simulated 80mm/hr rainfall event.',
      },
      {
        id: 'audit-8',
        action: 'IMPACT_VERIFIED',
        performedBy: 'Government Verification Board',
        role: 'GOVERNMENT_OFFICER',
        targetObject: 'Project',
        objectId: 'proj-golden-flood-01',
        timestamp: '2026-09-02T16:00:00Z',
        details: 'Formal impact audit completed: 0 flooded days in 2026 monsoon season, 500 students protected.',
        who: 'Government Verification Board',
        what: 'Impact Verification Audit Stamp',
        when: '2026-09-02T16:00:00Z',
        objectEntity: 'Project proj-golden-flood-01',
        oldValue: 'UNVERIFIED',
        newValue: 'VERIFIED_STAMPED',
        reason: 'On-site verification confirmed 18 school days saved and zero standing water across 4.2-acre campus.',
      },
    ];

    return {
      problems: [goldenProblem, ...additionalProblems],
      projects: [goldenProject, dumkaProject, khuntiProject, hazaribaghProject, dhanbadProject, lateharProject],
      clusters: [goldenCluster],
      notifications: initialNotifications,
      auditLogs: initialAuditLogs,
      solutionReuses: solutionReuses,
    };
  }

  // Query Methods
  public getProblems(filters?: {
    district?: string;
    category?: string;
    status?: string;
    priority?: string;
    route?: string;
    search?: string;
  }): Problem[] {
    let result = [...this.data.problems];

    if (filters?.district && filters.district !== 'ALL') {
      result = result.filter((p) => p.location.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      result = result.filter((p) => p.priority?.level === filters.priority);
    }
    if (filters?.route && filters.route !== 'ALL') {
      result = result.filter((p) => p.aiAnalysis?.problemType === filters.route || p.validation?.routedTo === filters.route);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.district.toLowerCase().includes(q) ||
          (p.location.block && p.location.block.toLowerCase().includes(q))
      );
    }

    // Sort by priority totalScore descending
    return result.sort((a, b) => (b.priority?.totalScore || 0) - (a.priority?.totalScore || 0));
  }

  public getProblemById(id: string): Problem | undefined {
    return this.data.problems.find((p) => p.id === id);
  }

  public getProjects(): Project[] {
    this.checkOverdueMilestones();
    return [...this.data.projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  private checkOverdueMilestones() {
    const now = new Date();
    this.data.projects.forEach(project => {
      if (project.status === 'COMPLETED' || project.status === 'BLOCKED') return;
      project.milestones.forEach(m => {
        if (m.status === 'IN_PROGRESS' || m.status === 'NOT_STARTED') {
          const deadline = new Date(m.deadline);
          if (deadline < now) {
            // Check if notification already sent
            const hasNotif = this.data.notifications.some(n => n.referenceId === m.id && n.type === 'MILESTONE');
            if (!hasNotif) {
              this.data.notifications.unshift({
                id: `notif-${Date.now()}-${m.id}`,
                userId: project.universityId || 'univ-user',
                targetRole: 'UNIVERSITY_ADMIN',
                title: 'Milestone Overdue',
                message: `Milestone "${m.title}" for project "${project.title}" is overdue.`,
                type: 'MILESTONE',
                read: false,
                referenceId: m.id,
                createdAt: new Date().toISOString(),
              });
              this.saveToDisk();
            }
          }
        }
      });
    });
  }

  public getProjectById(id: string): Project | undefined {
    return this.data.projects.find((p) => p.id === id);
  }

  public getProjectByProblemId(problemId: string): Project | undefined {
    return this.data.projects.find((p) => p.problemId === problemId);
  }

  public getClusters(): ProblemCluster[] {
    return [...this.data.clusters];
  }

  public getSolutionReuses(): SolutionReuse[] {
    return [...this.data.solutionReuses];
  }

  public getNotifications(role?: UserRole): Notification[] {
    if (!role) return [...this.data.notifications];
    return this.data.notifications.filter((n) => n.targetRole === role || n.targetRole === 'SUPER_ADMIN');
  }

  public markNotificationAsRead(id: string) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    this.saveToDisk();
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.data.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getAuditLogsForObject(objectId: string): AuditLog[] {
    const term = objectId.toLowerCase();
    return [...this.data.auditLogs]
      .filter(
        (log) =>
          log.objectId.toLowerCase() === term ||
          (log.objectEntity && log.objectEntity.toLowerCase().includes(term)) ||
          (log.details && log.details.toLowerCase().includes(term))
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Mutation Methods with Strict State Machine
  public submitProblem(newProblemData: Omit<Problem, 'id' | 'status' | 'submittedAt'>): Problem {
    const year = new Date().getFullYear();
    const count = this.data.problems.length + 125;
    const id = `JH-${year}-${String(count).padStart(5, '0')}`;

    // Secure Evidence Processing: Enforce MIME, extension, size, and private visibility
    const secureEvidence = (newProblemData.evidence || []).map((ev: any) => {
      const val = validateFileSecurity({
        fileName: ev.fileName || 'evidence',
        type: ev.type,
        mimeType: ev.mimeType,
        fileSize: ev.fileSize,
        fileSizeBytes: ev.fileSizeBytes,
      });
      if (!val.valid) {
        throw new Error(val.error);
      }
      return {
        ...ev,
        id: ev.id || ('ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
        fileName: val.sanitizedFileName || ev.fileName,
        mimeType: val.mimeType,
        extension: val.extension,
        fileSizeBytes: val.sizeBytes,
        isPublic: false, // Evidence does not automatically become public
        visibility: 'RESTRICTED',
        uploadedBy: newProblemData.submitterName,
        ownerId: newProblemData.submittedBy,
        uploadedAt: new Date().toISOString(),
      };
    });

    const problem: Problem = {
      ...newProblemData,
      id,
      evidence: secureEvidence,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
    };

    // Auto-calculate deterministic priority
    problem.priority = calculatePriority({
      severity: problem.aiAnalysis?.severity || 7,
      affectedPeopleCount: problem.affectedPeopleCount,
      urgency: problem.urgency,
      hasCoordinates: !!(problem.location.latitude && problem.location.longitude),
      district: problem.location.district,
      evidenceCount: problem.evidence.length,
    });

    this.data.problems.unshift(problem);

    // Audit log
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'PROBLEM_SUBMITTED',
      performedBy: problem.submitterName,
      role: 'CITIZEN',
      targetObject: 'Problem',
      objectId: id,
      timestamp: new Date().toISOString(),
      details: `New problem "${problem.title}" registered in ${problem.location.district} district.`,
    });

    // Notification to Government
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-govt-amitesh',
      targetRole: 'GOVERNMENT_OFFICER',
      title: `New Problem Reported in ${problem.location.district}`,
      message: `"${problem.title}" submitted by ${problem.submitterName}. Priority score: ${problem.priority.totalScore}/100.`,
      type: 'SUBMISSION',
      read: false,
      referenceId: id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return problem;
  }

  public updateProblemAIAnalysis(problemId: string, analysis: any): Problem {
    const problem = this.getProblemById(problemId);
    if (!problem) throw new Error(`Problem ${problemId} not found`);

    problem.aiAnalysis = analysis;
    if (problem.status === 'SUBMITTED') {
      problem.status = 'AI_ANALYZED';
    }

    // Re-evaluate priority with AI inputs
    problem.priority = calculatePriority({
      severity: analysis.severity,
      affectedPeopleCount: problem.affectedPeopleCount || analysis.estimatedAffectedPeople,
      urgency: problem.urgency,
      hasCoordinates: !!(problem.location.latitude && problem.location.longitude),
      district: problem.location.district,
      evidenceCount: problem.evidence.length,
    });

    this.saveToDisk();
    return problem;
  }

  public validateProblem(params: {
    problemId: string;
    decision: 'VALIDATED' | 'REJECTED' | 'CLARIFICATION_REQUIRED' | 'DUPLICATE';
    routedTo: SupportRouting;
    notes: string;
    validatorUser: User;
    clarificationRequest?: string;
  }): Problem {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error(`Problem ${params.problemId} not found`);

    // Allowed transition check
    const normRole = (params.validatorUser.role || '').toUpperCase();
    if (normRole !== 'GOVERNMENT' && normRole !== 'GOVERNMENT_OFFICER' && normRole !== 'SUPER_ADMIN') {
      throw new Error('Unauthorized: Only Government Officers can validate or reject state problems.');
    }

    problem.status = params.decision;
    problem.validation = {
      decision: params.decision,
      routedTo: params.routedTo,
      departmentName: params.validatorUser.organizationName || 'Government of Jharkhand',
      notes: params.notes,
      validatedBy: params.validatorUser.id,
      validatorName: params.validatorUser.name,
      validatedAt: new Date().toISOString(),
      clarificationRequest: params.clarificationRequest,
    };

    // Audit log
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: `PROBLEM_${params.decision}`,
      performedBy: params.validatorUser.name,
      role: params.validatorUser.role,
      targetObject: 'Problem',
      objectId: problem.id,
      timestamp: new Date().toISOString(),
      details: `Government officer validated problem as ${params.decision}. Routed to ${params.routedTo}. Notes: ${params.notes}`,
    });

    // Notification to Citizen
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: problem.submittedBy,
      targetRole: 'CITIZEN',
      title: `Update on Problem ${problem.id}`,
      message: `Your reported problem "${problem.title}" has been reviewed by Government: ${params.decision}.`,
      type: 'VALIDATION',
      read: false,
      referenceId: problem.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return problem;
  }

  public assignProblemToUniversity(params: {
    problemId: string;
    universityId: string;
    universityName: string;
    departmentName?: string;
    assignedByUser: User;
  }): Problem {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error(`Problem ${params.problemId} not found`);

    problem.status = 'ASSIGNED';
    problem.assignedUniversityId = params.universityId;
    problem.assignedUniversityName = params.universityName;
    problem.assignedDepartmentName = params.departmentName;

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'PROBLEM_ASSIGNED_HEI',
      performedBy: params.assignedByUser.name,
      role: params.assignedByUser.role,
      targetObject: 'Problem',
      objectId: problem.id,
      timestamp: new Date().toISOString(),
      details: `Assigned problem to ${params.universityName} (${params.departmentName || 'General'}).`,
    });

    // Notification to University
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'univ-user',
      targetRole: 'UNIVERSITY_ADMIN',
      title: 'Problem Assigned to Your Institution',
      message: `State Council has assigned ${problem.id}: "${problem.title}" to ${params.universityName}.`,
      type: 'UNIVERSITY_MATCH',
      read: false,
      referenceId: problem.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return problem;
  }

  public createProjectFromProblem(params: {
    problemId: string;
    title: string;
    summary: string;
    universityId: string;
    universityName: string;
    facultyMentorName: string;
    facultyMentorEmail: string;
    department: string;
    studentTeam: any[];
    objectives: string[];
    scope: string;
    budgetEst: string;
    timelineMonths: number;
    milestones: any[];
  }): Project {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error(`Problem ${params.problemId} not found`);

    const projectId = `proj-${Date.now()}`;
    const project: Project = {
      id: projectId,
      problemId: params.problemId,
      problemTitle: problem.title,
      title: params.title,
      summary: params.summary,
      universityId: params.universityId,
      universityName: params.universityName,
      facultyMentorName: params.facultyMentorName,
      facultyMentorEmail: params.facultyMentorEmail,
      department: params.department,
      studentTeam: params.studentTeam,
      objectives: params.objectives,
      scope: params.scope,
      budgetEst: params.budgetEst,
      timelineMonths: params.timelineMonths,
      status: 'APPROVED',
      milestones: params.milestones,
      supportRequests: [
        {
          id: `sr-${Date.now()}-1`,
          projectId,
          supportType: 'Hardware',
          description: `Industrial sensors, IoT telemetry modules, or hardware components for ${params.title}.`,
          estimatedValue: '₹75,000',
          timeline: 'Immediate',
          status: 'REQUESTED',
        },
        {
          id: `sr-${Date.now()}-2`,
          projectId,
          supportType: 'Technical Mentorship',
          description: `Industry expert guidance for field calibration, structural design, and system optimization.`,
          estimatedValue: 'Pro-Bono',
          timeline: '2 Weeks',
          status: 'REQUESTED',
        },
        {
          id: `sr-${Date.now()}-3`,
          projectId,
          supportType: 'Funding',
          description: `CSR R&D Pilot Grant for field deployment in ${problem.location.district} district.`,
          estimatedValue: params.budgetEst || '₹1,50,000',
          timeline: '1 Month',
          status: 'REQUESTED',
        },
      ],
      tests: [],
      impactKPIs: [],
      citizenFeedbacks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.projects.unshift(project);
    problem.projectId = projectId;
    problem.status = 'ASSIGNED';

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'PROJECT_CREATED',
      performedBy: params.facultyMentorName,
      role: 'FACULTY',
      targetObject: 'Project',
      objectId: projectId,
      timestamp: new Date().toISOString(),
      details: `Project "${project.title}" created at ${params.universityName} with ${params.studentTeam.length} student innovators.`,
    });

    this.saveToDisk();
    return project;
  }

  public updateProjectMilestone(params: {
    projectId: string;
    milestoneId: string;
    progressPercent: number;
    status: any;
    deliverables?: string[];
    evidenceUrl?: string;
    comments?: string;
    completed?: boolean;
    updatedBy: string;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    const ms = project.milestones.find((m) => m.id === params.milestoneId);
    if (!ms) throw new Error(`Milestone ${params.milestoneId} not found`);

    ms.progressPercent = params.progressPercent;
    ms.status = params.status;
    if (params.deliverables) ms.deliverables = params.deliverables;
    if (params.evidenceUrl) ms.evidenceUrl = params.evidenceUrl;
    if (params.comments) ms.comments = params.comments;
    if (params.completed) {
      ms.status = 'COMPLETED';
      ms.progressPercent = 100;
      ms.completedAt = new Date().toISOString();
      ms.approvedBy = params.updatedBy;
    }

    project.updatedAt = new Date().toISOString();

    // Check if project status should advance
    const allCompleted = project.milestones.every((m) => m.status === 'COMPLETED');
    if (allCompleted && project.status === 'TESTING') {
      project.status = 'PILOT';
    }

    this.saveToDisk();
    return project;
  }

  public addProjectSupportRequest(params: {
    projectId: string;
    supportType: IndustrySupportType;
    description: string;
    estimatedValue?: string;
    timeline: string;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    const sr = {
      id: `sr-${Date.now()}`,
      projectId: project.id,
      supportType: params.supportType,
      description: params.description,
      estimatedValue: params.estimatedValue,
      timeline: params.timeline,
      status: 'REQUESTED' as const,
    };

    project.supportRequests.unshift(sr);
    project.updatedAt = new Date().toISOString();

    // Notification to Industry
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'ind-all',
      targetRole: 'INDUSTRY_PARTNER',
      title: `New Support Request: ${params.supportType}`,
      message: `Project "${project.title}" at ${project.universityName} requested ${params.supportType}: ${params.description}`,
      type: 'INDUSTRY_SUPPORT',
      read: false,
      referenceId: project.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return project;
  }

  public offerIndustrySupport(params: {
    projectId: string;
    supportRequestId: string;
    industryUser: User;
    notes?: string;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    const sr = project.supportRequests.find((r) => r.id === params.supportRequestId);
    if (!sr) throw new Error(`Support request ${params.supportRequestId} not found`);

    sr.status = 'OFFERED';
    sr.offeredByCompany = params.industryUser.organizationName || params.industryUser.name;
    sr.offeredByUserName = params.industryUser.name;
    sr.offeredAt = new Date().toISOString();
    sr.notes = params.notes;

    project.updatedAt = new Date().toISOString();

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: project.universityId || 'univ-user',
      targetRole: 'UNIVERSITY_ADMIN',
      title: 'Industry Expressed Interest',
      message: `${params.industryUser.organizationName || params.industryUser.name} has offered support for your project "${project.title}".`,
      type: 'INDUSTRY_SUPPORT',
      read: false,
      referenceId: project.id,
      createdAt: new Date().toISOString(),
    });

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'INDUSTRY_SUPPORT_OFFERED',
      performedBy: params.industryUser.name,
      role: 'INDUSTRY_PARTNER',
      targetObject: 'ProjectSupportRequest',
      objectId: sr.id,
      timestamp: new Date().toISOString(),
      details: `${sr.offeredByCompany} offered "${sr.supportType}" for project "${project.title}".`,
    });

    this.saveToDisk();
    return project;
  }

  public advanceProjectLifecycle(params: {
    projectId: string;
    newStatus: ProjectStatus;
    actor: User;
    recordData?: any;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    project.status = params.newStatus;
    project.updatedAt = new Date().toISOString();

    if (params.newStatus === 'TESTING' && params.recordData) {
      project.tests.push(params.recordData);
    } else if (params.newStatus === 'PILOT') {
      if (params.recordData) project.pilot = params.recordData;
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'user-govt-amitesh',
        targetRole: 'GOVERNMENT_OFFICER',
        title: 'Testing Completed',
        message: `Project "${project.title}" has completed TESTING and moved to PILOT stage.`,
        type: 'PROJECT',
        read: false,
        referenceId: project.id,
        createdAt: new Date().toISOString(),
      });
    } else if (params.newStatus === 'DEPLOYED' && params.recordData) {
      project.deployment = params.recordData;
    }

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: `PROJECT_LIFECYCLE_${params.newStatus}`,
      performedBy: params.actor.name,
      role: params.actor.role,
      targetObject: 'Project',
      objectId: project.id,
      timestamp: new Date().toISOString(),
      details: `Project moved to stage ${params.newStatus}.`,
    });

    this.saveToDisk();
    return project;
  }

  public verifyProjectImpact(params: {
    projectId: string;
    kpiIndex: number;
    verifierUser: User;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    const normRole = params.verifierUser.role.toUpperCase();
    if (normRole !== 'GOVERNMENT' && normRole !== 'GOVERNMENT_OFFICER' && normRole !== 'SUPER_ADMIN') {
      throw new Error('Only Government Officers can formally verify societal impact.');
    }

    if (project.impactKPIs[params.kpiIndex]) {
      project.impactKPIs[params.kpiIndex].isVerifiedByGovernment = true;
      project.impactKPIs[params.kpiIndex].verifiedAt = new Date().toISOString();
      project.impactKPIs[params.kpiIndex].verifiedBy = params.verifierUser.name;
    }

    this.saveToDisk();
    return project;
  }

  public addProblemEvidence(params: {
    problemId: string;
    evidence: any;
    user: User;
  }): Problem {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error();

    // 1. Ownership & Access Validation
    const ownership = validateEvidenceOwnership(problem, params.user);
    if (!ownership.allowed) {
      throw new Error(ownership.reason || 'Ownership validation failed.');
    }

    // 2. MIME type, Extension, and File Size Security Validation
    const fileVal = validateFileSecurity({
      fileName: params.evidence.fileName || 'evidence_file',
      type: params.evidence.type,
      mimeType: params.evidence.mimeType,
      fileSize: params.evidence.fileSize,
      fileSizeBytes: params.evidence.fileSizeBytes,
    });
    if (!fileVal.valid) {
      throw new Error(fileVal.error);
    }

    if (!problem.evidence) problem.evidence = [];
    const newEv: any = {
      id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: params.evidence.type || 'image',
      url: params.evidence.url,
      caption: params.evidence.caption || '',
      fileName: fileVal.sanitizedFileName || params.evidence.fileName || 'evidence_file',
      fileSize: params.evidence.fileSize || ((fileVal.sizeBytes / (1024 * 1024)).toFixed(1) + ' MB'),
      fileSizeBytes: fileVal.sizeBytes,
      mimeType: fileVal.mimeType,
      extension: fileVal.extension,
      uploadedAt: new Date().toISOString(),
      uploadedBy: params.user.name,
      ownerId: params.user.id,
      isPublic: false, // Evidence does NOT automatically become public
      visibility: 'RESTRICTED',
    };
    problem.evidence.push(newEv);

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'EVIDENCE_UPLOADED',
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Problem',
      objectId: problem.id,
      timestamp: new Date().toISOString(),
      details: `Uploaded new evidence "${newEv.fileName}" for problem ${problem.id}.`,
    });

    this.saveToDisk();
    return problem;
  }

  public prioritizeProblem(params: {
    problemId: string;
    totalScore?: number;
    level?: PriorityLevel;
    reasons?: string[];
    user: User;
  }): Problem {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error(`Problem ${params.problemId} not found`);

    if (!problem.priority) {
      problem.priority = {
        severityComponent: 25,
        populationComponent: 20,
        urgencyComponent: 15,
        geographicComponent: 10,
        evidenceComponent: 5,
        totalScore: params.totalScore || 75,
        level: params.level || 'HIGH',
        reasons: params.reasons || ['Government priority assessment'],
      };
    } else {
      if (params.totalScore !== undefined) problem.priority.totalScore = params.totalScore;
      if (params.level) problem.priority.level = params.level;
      if (params.reasons) problem.priority.reasons = params.reasons;
    }

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'PROBLEM_PRIORITIZED',
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Problem',
      objectId: problem.id,
      timestamp: new Date().toISOString(),
      details: `Government prioritization updated: Level=${problem.priority.level}, Score=${problem.priority.totalScore}/100.`,
    });

    this.saveToDisk();
    return problem;
  }

  public universityRespondToAssignment(params: {
    problemId: string;
    decision: 'ACCEPT' | 'DECLINE';
    user: User;
    notes?: string;
  }): Problem {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error(`Problem ${params.problemId} not found`);

    if (params.decision === 'ACCEPT') {
      problem.status = 'ASSIGNED_ACCEPTED';
    } else {
      problem.status = 'ASSIGNED_DECLINED';
    }

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: `ASSIGNMENT_${params.decision}ED`,
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Problem',
      objectId: problem.id,
      timestamp: new Date().toISOString(),
      details: `Institution ${params.user.organizationName || 'University'} ${params.decision.toLowerCase()}ed assignment. Notes: ${params.notes || 'None'}`,
    });

    // Notification to Government
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-govt-amitesh',
      targetRole: 'GOVERNMENT_OFFICER',
      title: `Institution Assignment ${params.decision}ED`,
      message: `${params.user.organizationName || 'University'} ${params.decision.toLowerCase()}ed problem ${problem.id}: "${problem.title}".`,
      type: 'UNIVERSITY_MATCH',
      read: false,
      referenceId: problem.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return problem;
  }

  public assignFacultyToProblem(params: {
    problemId: string;
    facultyName: string;
    facultyEmail: string;
    department?: string;
    user: User;
  }): Problem {
    const problem = this.getProblemById(params.problemId);
    if (!problem) throw new Error(`Problem ${params.problemId} not found`);

    problem.assignedDepartmentName = params.department || problem.assignedDepartmentName;

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'FACULTY_ASSIGNED',
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Problem',
      objectId: problem.id,
      timestamp: new Date().toISOString(),
      details: `University Admin assigned faculty lead ${params.facultyName} (${params.facultyEmail}) to problem ${problem.id}.`,
    });

    this.saveToDisk();
    return problem;
  }

  public updateProjectTeam(params: {
    projectId: string;
    studentTeam: any[];
    user: User;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    project.studentTeam = params.studentTeam;
    project.updatedAt = new Date().toISOString();

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'PROJECT_TEAM_UPDATED',
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Project',
      objectId: project.id,
      timestamp: new Date().toISOString(),
      details: `Formed/updated student team with ${params.studentTeam.length} members for "${project.title}".`,
    });

    this.saveToDisk();
    return project;
  }

  public approveProjectStage(params: {
    projectId: string;
    newStage: ProjectStatus;
    user: User;
    notes?: string;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    project.status = params.newStage;
    project.updatedAt = new Date().toISOString();

    // Audit
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: `STAGE_APPROVED_${params.newStage}`,
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Project',
      objectId: project.id,
      timestamp: new Date().toISOString(),
      details: `Government Officer approved project stage "${params.newStage}". Notes: ${params.notes || 'None'}`,
    });

    this.saveToDisk();
    return project;
  }

  public approveProjectDeployment(params: {
    projectId: string;
    approvalStatus: 'APPROVED' | 'REJECTED';
    notes?: string;
    user: User;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    if (project.deployment) {
      project.deployment.approvalStatus = params.approvalStatus;
      project.deployment.approvedByOfficial = params.user.name;
      project.deployment.approvedAt = new Date().toISOString();
      project.deployment.approvalNotes = params.notes;

      if (params.approvalStatus === 'APPROVED') {
        this.data.notifications.unshift({
          id: `notif-${Date.now()}`,
          userId: project.universityId || 'univ-user',
          targetRole: 'UNIVERSITY_ADMIN',
          title: 'Pilot Approved',
          message: `Your pilot deployment for project "${project.title}" was approved by Government.`,
          type: 'DEPLOYMENT',
          read: false,
          referenceId: project.id,
          createdAt: new Date().toISOString(),
        });
      }
    }

    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: `DEPLOYMENT_${params.approvalStatus}`,
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Project',
      objectId: project.id,
      timestamp: new Date().toISOString(),
      details: `Government Officer ${params.approvalStatus.toLowerCase()} deployment record. Notes: ${params.notes || 'None'}`,
    });

    this.saveToDisk();
    return project;
  }

  public interveneDelayedProject(params: {
    projectId: string;
    actionType: 'GRANT_EXTENSION' | 'CLEAR_BOTTLENECK' | 'EXPEDITE_FUNDS' | 'INTER_DEPARTMENTAL_REQUISITION';
    notes: string;
    officerUser: User;
    newDeadline?: string;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    const today = new Date().toISOString().split('T')[0];
    let milestonesUpdated = 0;
    project.milestones.forEach((m) => {
      if (m.status === 'BLOCKED' || (m.deadline && m.deadline < today && m.status !== 'COMPLETED')) {
        m.status = 'IN_PROGRESS';
        milestonesUpdated++;
        if (params.newDeadline) {
          m.deadline = params.newDeadline;
        } else {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          m.deadline = d.toISOString().split('T')[0];
        }
        m.comments = `State Intervention (${params.actionType}): ${params.notes} [Authorized by ${params.officerUser.name} on ${new Date().toLocaleDateString()}]`;
      }
    });

    if (project.status === 'BLOCKED') {
      project.status = 'PROTOTYPE';
    }
    project.updatedAt = new Date().toISOString();

    // Audit Log
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: `GOVT_INTERVENTION_${params.actionType}`,
      performedBy: params.officerUser.name,
      role: params.officerUser.role,
      targetObject: 'Project',
      objectId: project.id,
      timestamp: new Date().toISOString(),
      details: `Government Command Center executed ${params.actionType} on project "${project.title}". Notes: ${params.notes} (${milestonesUpdated} milestones unblocked)`,
    });

    // Notification to University Mentor
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: project.facultyMentorEmail || 'faculty',
      targetRole: 'FACULTY',
      title: `State Government Intervention: ${params.actionType}`,
      message: `State Command Officer ${params.officerUser.name} intervened on project "${project.title}" to resolve bottleneck. ${params.notes}`,
      type: 'VALIDATION',
      read: false,
      referenceId: project.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return project;
  }

  public addCitizenFeedback(params: {
    projectId: string;
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
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    // Citizen post-deployment feedback is only valid for deployed or pilot projects
    if (project.status !== 'PILOT' && project.status !== 'DEPLOYED' && project.status !== 'COMPLETED') {
      throw new Error(`Citizen feedback is only accepted for projects in PILOT, DEPLOYED, or COMPLETED status. Current status is ${project.status}.`);
    }

    const fb: CitizenFeedback = {
      id: `cf-${Date.now()}`,
      citizenName: params.citizenName,
      district: params.district,
      block: params.block,
      village: params.village,
      solutionSolvedStatus: params.solutionSolvedStatus || 'SOLVED',
      rating: Math.min(5, Math.max(1, params.rating)),
      feedbackText: params.feedbackText,
      evidenceUrls: params.evidenceUrls || [],
      evidenceDescription: params.evidenceDescription,
      submittedAt: new Date().toISOString(),
      isOriginalSubmitter: params.isOriginalSubmitter ?? true,
      isBeneficiary: params.isBeneficiary,
    };

    project.citizenFeedbacks.unshift(fb);
    this.saveToDisk();
    return project;
  }

  public getStatsSummary(isDemoMode: boolean = true): StatsSummary {
    if (isDemoMode) {
      // Contract specified demo dashboard figures:
      // 12,480 Problems | 8,420 Validated | 2,150 Active Projects | 920 Completed | 310 Deployed | 4.2M People Impacted | 42 HEIs | 86 Industry Partners
      return {
        totalProblems: 12480,
        validatedProblems: 8420,
        inDevelopment: 2150,
        completedProjects: 920,
        deployedSolutions: 310,
        peopleImpacted: 4200000,
        participatingHEIs: 42,
        industryPartners: 86,
        categoryDistribution: [
          { category: 'Water', count: 3120 },
          { category: 'Education', count: 2450 },
          { category: 'Agriculture', count: 2180 },
          { category: 'Healthcare', count: 1840 },
          { category: 'Urban Infrastructure', count: 1290 },
          { category: 'Disaster Management', count: 960 },
          { category: 'Energy', count: 640 },
        ],
        districtDistribution: JHARKHAND_DISTRICTS.map((d, i) => ({
          district: d.name,
          count: 450 + (i * 37) % 400,
          validated: 310 + (i * 25) % 280,
          deployed: 12 + (i * 3) % 20,
        })),
        priorityDistribution: [
          { priority: 'CRITICAL', count: 2640 },
          { priority: 'HIGH', count: 4890 },
          { priority: 'MEDIUM', count: 3720 },
          { priority: 'LOW', count: 1230 },
        ],
        statusDistribution: [
          { status: 'VALIDATED', count: 8420 },
          { status: 'IN_DEVELOPMENT', count: 2150 },
          { status: 'DEPLOYED', count: 310 },
          { status: 'UNDER_REVIEW', count: 1600 },
        ],
      };
    }

    // Real Mode: Live Database Aggregations
    const totalProblems = this.data.problems.length;
    const validatedProblems = this.data.problems.filter((p) => p.status === 'VALIDATED' || p.status === 'ASSIGNED').length;
    const inDevelopment = this.data.projects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'DEPLOYED').length;
    const completedProjects = this.data.projects.filter((p) => p.status === 'COMPLETED').length;
    const deployedSolutions = this.data.projects.filter((p) => p.status === 'DEPLOYED' || !!p.deployment).length;
    const peopleImpacted = this.data.projects.reduce((acc, p) => acc + (p.deployment?.activeBeneficiaries || 0), 0) + 500;

    const catMap: Record<string, number> = {};
    this.data.problems.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    });

    const distMap: Record<string, { count: number; validated: number; deployed: number }> = {};
    JHARKHAND_DISTRICTS.forEach((d) => {
      distMap[d.name] = { count: 0, validated: 0, deployed: 0 };
    });
    this.data.problems.forEach((p) => {
      if (!distMap[p.location.district]) {
        distMap[p.location.district] = { count: 0, validated: 0, deployed: 0 };
      }
      distMap[p.location.district].count++;
      if (p.status === 'VALIDATED' || p.status === 'ASSIGNED') {
        distMap[p.location.district].validated++;
      }
    });
    this.data.projects.forEach((pr) => {
      const prob = this.getProblemById(pr.problemId);
      if (prob && distMap[prob.location.district] && (pr.status === 'DEPLOYED' || !!pr.deployment)) {
        distMap[prob.location.district].deployed++;
      }
    });

    return {
      totalProblems,
      validatedProblems,
      inDevelopment,
      completedProjects,
      deployedSolutions,
      peopleImpacted,
      participatingHEIs: JHARKHAND_UNIVERSITIES.length,
      industryPartners: JHARKHAND_INDUSTRY_PARTNERS.length,
      categoryDistribution: Object.entries(catMap).map(([category, count]) => ({ category, count })),
      districtDistribution: Object.entries(distMap).map(([district, data]) => ({ district, ...data })),
      priorityDistribution: [
        { priority: 'CRITICAL', count: this.data.problems.filter((p) => p.priority?.level === 'CRITICAL').length },
        { priority: 'HIGH', count: this.data.problems.filter((p) => p.priority?.level === 'HIGH').length },
        { priority: 'MEDIUM', count: this.data.problems.filter((p) => p.priority?.level === 'MEDIUM').length },
        { priority: 'LOW', count: this.data.problems.filter((p) => p.priority?.level === 'LOW').length },
      ],
      statusDistribution: [
        { status: 'SUBMITTED', count: this.data.problems.filter((p) => p.status === 'SUBMITTED').length },
        { status: 'UNDER_REVIEW', count: this.data.problems.filter((p) => p.status === 'UNDER_REVIEW').length },
        { status: 'VALIDATED', count: this.data.problems.filter((p) => p.status === 'VALIDATED').length },
        { status: 'ASSIGNED', count: this.data.problems.filter((p) => p.status === 'ASSIGNED').length },
      ],
    };
  }

  public getClusterById(id: string): ProblemCluster | undefined {
    return (this.data.clusters || []).find((c) => c.id === id);
  }

  public handleDuplicateDecision(params: {
    targetProblemId: string;
    candidateProblemId: string;
    action: 'REVIEW' | 'MERGE' | 'KEEP_SEPARATE';
    notes?: string;
    clusterTitle?: string;
    user: User;
  }): {
    success: boolean;
    action: 'REVIEW' | 'MERGE' | 'KEEP_SEPARATE';
    cluster?: ProblemCluster;
    targetProblem: Problem;
    candidateProblem: Problem;
    message: string;
  } {
    const target = this.getProblemById(params.targetProblemId);
    if (!target) throw new Error(`Target problem ${params.targetProblemId} not found`);

    const candidate = this.getProblemById(params.candidateProblemId);
    if (!candidate) throw new Error(`Candidate problem ${params.candidateProblemId} not found`);

    if (!this.data.clusters) this.data.clusters = [];

    if (params.action === 'MERGE') {
      // Find or create master cluster
      let cluster = target.masterClusterId ? this.getClusterById(target.masterClusterId) : undefined;
      if (!cluster && candidate.masterClusterId) {
        cluster = this.getClusterById(candidate.masterClusterId);
      }

      if (!cluster) {
        cluster = {
          id: `cluster-${Date.now()}`,
          masterProblemId: target.id,
          clusterTitle: params.clusterTitle || `Cluster: ${target.title.slice(0, 60)}...`,
          problemIds: [target.id, candidate.id],
          similarityScore: 92,
          reason: params.notes || 'Merged by government officer: identical geographic catchment and root cause',
          status: 'MERGED',
          reviewedBy: params.user.id,
          reviewedAt: new Date().toISOString(),
        };
        this.data.clusters.unshift(cluster);
      } else {
        if (!cluster.problemIds.includes(candidate.id)) {
          cluster.problemIds.push(candidate.id);
        }
        if (!cluster.problemIds.includes(target.id)) {
          cluster.problemIds.push(target.id);
        }
        cluster.status = 'MERGED';
        cluster.reviewedBy = params.user.id;
        cluster.reviewedAt = new Date().toISOString();
        if (params.notes) cluster.reason = params.notes;
      }

      // Update candidate problem status to DUPLICATE linked to this cluster
      candidate.status = 'DUPLICATE';
      candidate.masterClusterId = cluster.id;
      candidate.validation = {
        decision: 'DUPLICATE',
        routedTo: target.aiAnalysis?.problemType || 'INNOVATION',
        notes: `Duplicate report merged into Master Cluster "${cluster.clusterTitle}" (${target.id}) by ${params.user.name}.`,
        validatedBy: params.user.id,
        validatorName: params.user.name,
        validatedAt: new Date().toISOString(),
      };

      // Mark target problem as master if not already
      target.isMasterProblem = true;
      target.masterClusterId = cluster.id;

      // Audit Log
      this.data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'DUPLICATE_MERGED',
        performedBy: params.user.name,
        role: params.user.role,
        targetObject: 'Problem',
        objectId: candidate.id,
        timestamp: new Date().toISOString(),
        details: `Government Officer merged duplicate report ${candidate.id} into Master Cluster "${cluster.clusterTitle}" (Master: ${target.id}). Officer notes: ${params.notes || 'Verified identical catchment issue'}`,
      });

      // Notify citizen who submitted candidate problem
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: candidate.submittedBy,
        targetRole: 'CITIZEN',
        title: 'Report Linked to Existing Master Cluster',
        message: `Your grievance ${candidate.id} has been verified and combined into State Priority Cluster "${cluster.clusterTitle}" for consolidated resolution.`,
        type: 'VALIDATION',
        read: false,
        referenceId: candidate.id,
        createdAt: new Date().toISOString(),
      });

      this.saveToDisk();
      return {
        success: true,
        action: 'MERGE',
        cluster,
        targetProblem: target,
        candidateProblem: candidate,
        message: `Problem ${candidate.id} successfully merged into cluster "${cluster.clusterTitle}".`,
      };
    }

    if (params.action === 'KEEP_SEPARATE') {
      // Find if an existing cluster or review record exists and mark as KEPT_SEPARATE
      let cluster = target.masterClusterId ? this.getClusterById(target.masterClusterId) : undefined;
      if (cluster && cluster.problemIds.includes(candidate.id)) {
        cluster.problemIds = cluster.problemIds.filter((id) => id !== candidate.id);
      }

      // Record audit log for human decision
      this.data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        action: 'DUPLICATE_KEPT_SEPARATE',
        performedBy: params.user.name,
        role: params.user.role,
        targetObject: 'Problem',
        objectId: candidate.id,
        timestamp: new Date().toISOString(),
        details: `Government Officer reviewed AI duplicate suggestion between ${target.id} and ${candidate.id} and ruled: KEEP SEPARATE. Justification: ${params.notes || 'Independent geographic issue requiring distinct resolution.'}`,
      });

      this.saveToDisk();
      return {
        success: true,
        action: 'KEEP_SEPARATE',
        targetProblem: target,
        candidateProblem: candidate,
        message: `Reports ${target.id} and ${candidate.id} confirmed as separate, independent issues.`,
      };
    }

    // Default REVIEW action
    this.data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: 'DUPLICATE_REVIEWED',
      performedBy: params.user.name,
      role: params.user.role,
      targetObject: 'Problem',
      objectId: candidate.id,
      timestamp: new Date().toISOString(),
      details: `Officer reviewed candidate duplicate ${candidate.id} against ${target.id}.`,
    });

    this.saveToDisk();
    return {
      success: true,
      action: 'REVIEW',
      targetProblem: target,
      candidateProblem: candidate,
      message: `Side-by-side comparison loaded for ${target.id} and ${candidate.id}.`,
    };
  }

  public requestImpactVerification(params: {
    projectId: string;
    user: User;
  }): Project {
    const project = this.getProjectById(params.projectId);
    if (!project) throw new Error(`Project ${params.projectId} not found`);

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-govt-amitesh', // Send to Govt command
      targetRole: 'GOVERNMENT_OFFICER',
      title: 'Impact Verification Requested',
      message: `${params.user.name} requested verification for the impact KPIs of project "${project.title}".`,
      type: 'IMPACT',
      read: false,
      referenceId: project.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return project;
  }

  public replicateBlueprint(params: {
    blueprintId: string;
    targetDistrict: string;
    user: User;
  }): SolutionReuse {
    const bp = this.data.solutionReuses.find(b => b.id === params.blueprintId);
    if (!bp) throw new Error(`Blueprint ${params.blueprintId} not found`);

    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-govt-amitesh',
      targetRole: 'GOVERNMENT_OFFICER',
      title: 'Blueprint Replication Requested',
      message: `${params.user.name} requested to replicate blueprint "${bp.title}" in ${params.targetDistrict}.`,
      type: 'PROJECT',
      read: false,
      referenceId: bp.id,
      createdAt: new Date().toISOString(),
    });

    this.saveToDisk();
    return bp;
  }

  // Golden Demo Walkthrough State Reset / Advance
  public resetGoldenDemo() {
    const seed = this.initializeSeedData();
    this.data = seed;
    this.saveToDisk();
    return { success: true, message: 'Golden Demo state restored to benchmark testing stage.' };
  }
}

export const db = new DatabaseStore();
