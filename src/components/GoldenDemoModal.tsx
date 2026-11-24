/**
 * JH Innovation Hub - Golden Walkthrough Modal
 * Interactive 10-step demonstration of the state societal innovation pipeline:
 * Problem -> AI Understanding -> Prioritization -> Duplicate Clustering ->
 * Govt Validation -> University Matching -> Project Team -> Industry CSR Match ->
 * Testing & Pilot -> Verified Societal Impact.
 */

import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Eye,
  FileCheck,
  Layers,
  MapPin,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { resetGoldenDemo } from '../lib/api';
import { PriorityBreakdownDisplay } from './PriorityBreakdownDisplay';

interface GoldenDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabId: string, problemId?: string) => void;
  onNavigate?: (tabId: string, problemId?: string) => void;
  lang?: 'en' | 'hi';
}

export const GoldenDemoModal: React.FC<GoldenDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigate,
  lang,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  const normalizeTab = (target: string): 'home' | 'citizen' | 'government' | 'university' | 'industry' | 'lifecycle' | 'impact' | 'map' => {
    if (target === 'govt' || target === 'government') return 'government';
    if (target === 'citizen') return 'citizen';
    if (target === 'university' || target === 'faculty') return 'university';
    if (target === 'industry') return 'industry';
    if (target === 'lifecycle') return 'lifecycle';
    if (target === 'impact') return 'impact';
    if (target === 'map') return 'map';
    return 'home';
  };

  const navigate = (tabId: string, problemId?: string) => {
    const cleanTab = normalizeTab(tabId);
    if (onNavigate) {
      onNavigate(cleanTab, problemId);
    } else if (onNavigateTab) {
      onNavigateTab(cleanTab, problemId);
    }
  };

  if (!isOpen) return null;

  const steps = [
    {
      number: 1,
      title: 'Citizen Problem Discovery & Evidence',
      actor: 'Citizen: Ramesh Munda (Bundu, Ranchi)',
      targetTab: 'citizen',
      icon: MapPin,
      badge: 'Step 1 of 10 • Citizen Voice',
      content: {
        summary: 'Ramesh Munda submits high-severity floodwater ingress report at Govt Middle School Bundu.',
        problemId: 'JH-2026-00124',
        details: [
          'Location: Bundu Block, Ranchi District (Coordinates: 23.1812° N, 85.5849° E)',
          'Affected: 500 tribal boys and girls & 14 school faculty members',
          'Evidence: 2 geotagged photographs showing classrooms and kitchen shed inundated under 2.5 feet of flash stream runoff',
          'Frequency: Every monsoon rainfall event (halts 18-22 instructional school days annually)',
        ],
        highlight: 'Real societal evidence uploaded with GPS coordinates directly from the field.',
      },
    },
    {
      number: 2,
      title: 'AI Understanding & Structured Synthesis',
      actor: 'AI Intelligence Engine (Gemini 3.8 Flash)',
      targetTab: 'government',
      icon: Sparkles,
      badge: 'Step 2 of 10 • Semantic AI',
      content: {
        summary: 'AI ingests unstructured citizen narrative and returns verified multi-dimensional schema.',
        details: [
          'Classified Category: Education & Water Resources',
          'Subcategory: School Water Inundation & Micro-Watershed Flash Drainage',
          'Root Cause: Natural micro-watershed tributary discharge aligned with un-graded school boundary',
          'Suggested Routing: INNOVATION (Requires hardware sensor telemetry + civil drainage bypass)',
          'Required Skills: Hydrology, LoRaWAN IoT, Civil Drainage Flumes, GIS Topography',
          'Required Technologies: Solar Ultrasonic Water Gauges, Cloud SMS Alerting Node, Hydro Diverters',
        ],
        highlight: 'AI classifies, summarizes and extracts technical skills without human bias.',
      },
    },
    {
      number: 3,
      title: 'Deterministic Priority Engine (87 / 100)',
      actor: 'Mathematical Algorithm (Audit Compliant)',
      targetTab: 'government',
      icon: Cpu,
      badge: 'Step 3 of 10 • State Scoring',
      content: {
        summary: 'Deterministic weighted formula calculates an explainable priority score of 87/100 (CRITICAL).',
        formula: 'Priority = Severity (30%) + Population (25%) + Urgency (20%) + Geographic (15%) + Evidence (10%)',
        breakdown: [
          'Severity: 30/30 (Disrupts primary child education & health risk)',
          'Population: 22/25 (500 direct students + 120 neighboring households)',
          'Urgency: 18/20 (Monsoon season emergency recurring flash floods)',
          'Geographic: 12/15 (Verified GPS on NH-33 Subarnarekha tributary)',
          'Evidence: 5/10 (Multiple photos & school headmaster sign-off)',
        ],
        highlight: 'Transparent calculation guarantees zero opaque AI black-box decisions.',
      },
    },
    {
      number: 4,
      title: 'Semantic Duplicate & Cluster Detection',
      actor: 'Vector Embeddings & Human-in-the-Loop Review',
      targetTab: 'government',
      icon: Layers,
      badge: 'Step 4 of 10 • Anti-Duplication',
      content: {
        summary: 'Problem description → embedding → vector storage → cosine similarity pipeline identifies 92% similarity with nearby reports.',
        clusterTitle: 'Subarnarekha Basin School & Rural Inundation Cluster',
        similarity: '92% Similar',
        whyList: [
          '✓ Same district (Ranchi)',
          '✓ Same category (Education)',
          '✓ Similar description (91% semantic cosine match)',
          '✓ Nearby location (Bundu & Tamar catchment corridor)',
          '✓ Same administrative block (Bundu micro-watershed)',
          '✓ Matching problem type (INNOVATION)',
        ],
        details: [
          'JH-2026-00124 (Bundu School - Master Record)',
          'JH-2026-00142 (Tamar School Flash Flood - 92% match)',
          'JH-2026-00168 (Sonahatu Girls Hostel Ingress - 86% match)',
          'Pipeline: Problem Description → Dense Embedding Vector → Cosine Similarity (0.91) → Candidate Cluster',
        ],
        highlight: 'Strict Rule: Never automatically merged based on AI similarity. Human Officer has 3 options: REVIEW, MERGE, or KEEP SEPARATE.',
      },
    },
    {
      number: 5,
      title: 'Human Government Validation & Routing',
      actor: 'Government Officer: Dr. Amitesh Sinha, IAS (State Innovation Council)',
      targetTab: 'government',
      icon: FileCheck,
      badge: 'Step 5 of 10 • Human in the Loop',
      content: {
        summary: 'State official reviews AI assessment, validates Priority 87, and routes to University Matching.',
        officialNotes: '"Validated as CRITICAL school hazard. Traditional municipal patching has failed for 5 years. Routing to HEI innovation track for smart IoT prediction & structural bypass flume development."',
        decision: 'VALIDATED • ROUTED TO INNOVATION (HEI Matching)',
        details: [
          'Assigned Department: Dept of School Education & Literacy Jharkhand',
          'Timestamp: 2026-08-15 11:00 AM IST',
          'Audit Log Generated: Immutable state transition record #audit-3',
        ],
        highlight: 'AI never authorizes alone; authorized state official holds final decision accountability.',
      },
    },
    {
      number: 6,
      title: 'Transparent Capability-Based Matching (91%)',
      actor: 'HEI Capability Engine (10-Factor Formula)',
      targetTab: 'university',
      icon: Building2,
      badge: 'Step 6 of 10 • HEI Recommendation',
      content: {
        summary: 'Platform evaluates 10 capability factors and ranks BIT Mesra with a transparent 91% score. Never outputs only "AI selected this university".',
        matchedHEI: 'BIT Mesra — 91%',
        whyExplanation: [
          '✓ Hydrology expertise (Dr. Anand Kumar Mishra — 14 published papers)',
          '✓ GIS capability (Dr. Priya Ranjan & Watershed Remote Sensing Lab)',
          '✓ IoT lab (Sensors, Microcontrollers & LoRaWAN Telemetry Facility)',
          '✓ Relevant previous project (Chota Nagpur Stormwater Telemetry)',
          '✓ Student skills (Civil Engineering, AI/ML, GIS, IoT, Cloud Backend)',
          '✓ Incubation facilities (BIT Mesra Science & Tech Entrepreneurship Park)',
          '✓ Geographic suitability (Ranchi District • 42 km from Bundu campus)',
        ],
        highlight: 'Transparent match score with verified capability reasons — 100% explainable and verifiable.',
      },
    },
    {
      number: 7,
      title: 'Multidisciplinary University Team Formation',
      actor: 'Faculty: Dr. Anand Mishra & Multidisciplinary Student Innovators',
      targetTab: 'university',
      icon: Users,
      badge: 'Step 7 of 10 • Student Innovation',
      content: {
        summary: 'BIT Mesra forms cross-department project #proj-golden-flood-01 combining Civil, AI/ML, GIS, IoT, and Backend.',
        projectTitle: 'Civil Engineering + AI/ML + GIS + IoT + Backend + Faculty Mentor',
        teamMembers: [
          'Dr. Anand Kumar Mishra (Civil & Environmental) — Faculty Mentor & PI',
          'Priya Kumari (B.Tech Civil Engineering) — Team Lead & Flume Hydro-Diverter Prototyper',
          'Rahul Oraon (B.Tech Computer Science AI/ML) — Inundation Crest Prediction Model',
          'Sunita Soren (M.Tech Remote Sensing & GIS) — Catchment Elevation Contour Modeler',
          'Ankit Verma (B.Tech Electronics & IoT) — LoRaWAN Ultrasonic Depth Telemetry Node',
          'Deepak Kumar (B.Tech CS Backend) — Cloud Ingestion & Emergency Siren Alert API',
        ],
        budget: '₹3,45,000 (Hardware + Fabrication + Field Installation)',
        highlight: 'Multidisciplinary cross-faculty engineering team stored permanently in state project database.',
      },
    },
    {
      number: 8,
      title: 'Optional Industry CSR & Tech Partnership (91%)',
      actor: 'Industry Partner: Tata Steel Foundation & CSR Lab',
      targetTab: 'industry',
      icon: Cpu,
      badge: 'Step 8 of 10 • Industry Synergy',
      content: {
        summary: 'Tata Steel Foundation reviews support request on portal and clicks "I Can Help".',
        industryPartner: 'Tata Steel Foundation & CSR Innovation Lab (Jamshedpur)',
        supportOffered: [
          'Hardware: 2x Industrial IP68 Ultrasonic Transducers + 1x Solar LoRaWAN Gateway kit (Value: ₹85,000)',
          'Mentorship: Senior hydraulic engineer assigned for weekly flume design review',
        ],
        whyMatched: 'Tata Steel CSR focuses on rural water and education in Kolhan and South Chota Nagpur.',
        highlight: 'Industry provides targeted, need-based support without taking over government governance.',
      },
    },
    {
      number: 9,
      title: 'Prototype, Stress Testing & Live Pilot',
      actor: 'Student Team & Bundu School Administration',
      targetTab: 'lifecycle',
      icon: Clock,
      badge: 'Step 9 of 10 • Field Validation',
      content: {
        summary: 'Solution passes rigorous bench testing and enters live monsoon pilot at Bundu campus.',
        testResults: [
          'Ultrasonic Dip Test: ±2.8mm depth accuracy across 150 pulses (PASSED)',
          'Darkness Endurance: Operated 114 continuous hours on solar battery reserve (PASSED)',
          'Live Pilot: Successfully sounded siren 48 minutes and 52 minutes ahead of flash cresting',
          'Hydro-Flume: Diverted 100% of surface runoff around school perimeter into drainage nallah',
        ],
        highlight: 'Working hardware deployed in real mud and monsoon downpours, not just classroom slides.',
      },
    },
    {
      number: 10,
      title: 'Verified Societal Impact & Knowledge Reuse',
      actor: 'Government IAS Officer & Citizen Ramesh Munda',
      targetTab: 'impact',
      icon: Award,
      badge: 'Step 10 of 10 • Real-World Impact',
      content: {
        summary: 'Impact formally audited and verified by State Government; citizen gives 5-star testimonial.',
        verifiedKPIs: [
          'School Inundation Incidents: Reduced from 12/yr to 3/yr (75% Reduction)',
          'Lost School Days: Reduced from 18 days/yr to 0 days (100% Saved)',
          'Protected Students: 500 tribal boys and girls at Bundu school',
        ],
        citizenQuote: '"Our school stayed dry for the first time in 10 years! My daughter did not miss a single day of classes." — Ramesh Munda',
        reuseNotice: 'Blueprint and LoRaWAN firmware published to Knowledge Reuse Repository; already being replicated in 4 other schools!',
        highlight: 'Full circle: Citizen problem -> Working engineering solution -> Measured societal impact.',
      },
    },
  ];

  const current = steps[currentStep];

  const handleReset = async () => {
    setIsResetting(true);
    await resetGoldenDemo();
    setIsResetting(false);
    setCurrentStep(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-hidden overscroll-contain"
      style={{ touchAction: 'none' }}
    >
      <div
        className="bg-white border-2 sm:border-4 border-slate-300 max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] shadow-2xl flex flex-col font-sans overscroll-contain rounded-xl sm:rounded-2xl overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Header - Fixed/Shrink-0 */}
        <div className="bg-black text-white p-4 sm:p-6 md:p-7 border-b-2 border-slate-300 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-white hover:text-orange-500 p-1.5 border border-white/60 hover:border-orange-500 rounded transition cursor-pointer z-10"
            title="Close Walkthrough"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3 pr-10">
            <span className="px-2.5 py-0.5 sm:py-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded">
              STATE BENCHMARK WALKTHROUGH
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">
              State Problem-to-Impact Pipeline
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white pr-8">
            10-Stage Societal Transformation Walkthrough
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            Follow problem <span className="text-orange-400 font-mono font-black">JH-2026-00124</span> (Bundu School Monsoon Flood Ingress) from citizen report to verified community deployment.
          </p>

          {/* Stepper Progress Badges */}
          <div className="mt-4 sm:mt-5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {steps.map((s, idx) => (
              <button
                key={s.number}
                onClick={() => setCurrentStep(idx)}
                className={`h-7 w-7 sm:h-8 sm:w-8 shrink-0 font-mono font-black text-xs flex items-center justify-center border-2 rounded transition cursor-pointer ${
                  idx === currentStep
                    ? 'bg-orange-600 text-white border-white scale-105 shadow-md'
                    : idx < currentStep
                    ? 'bg-white text-black border-white'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-white'
                }`}
                title={`Step ${s.number}: ${s.title}`}
              >
                {s.number < 10 ? `0${s.number}` : s.number}
              </button>
            ))}
          </div>
        </div>

        {/* Body Content - Scrollable with min-h-0 and internal scrollbar */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar overscroll-contain">
          {/* Top Step Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white flex items-center justify-center border border-slate-200 rounded-lg shrink-0">
                <current.icon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 block">
                  {current.badge}
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-tight text-black">
                  {current.title}
                </h3>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Executing Stakeholder
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-black bg-slate-100 border border-slate-300 px-2.5 py-1 inline-block mt-1 rounded">
                {current.actor}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 p-4 sm:p-5">
            <p className="text-black font-black text-sm sm:text-base leading-snug uppercase">
              {current.content.summary}
            </p>
          </div>

          {/* Detailed Step Content */}
          <div className="space-y-4">
            {current.content.formula && (
              <div className="bg-slate-900 text-white border border-slate-200 p-4 font-mono text-xs">
                <span className="font-black text-orange-400 uppercase tracking-wider block mb-1">
                  Deterministic Equation:
                </span>
                {current.content.formula}
              </div>
            )}

            {current.content.officialNotes && (
              <div className="bg-slate-50 border-l-4 border-slate-300 border-y border-r border-slate-300 p-4 text-xs text-black">
                <span className="font-black uppercase tracking-widest block mb-1 text-black">
                  Official Administrative Directive:
                </span>
                <p className="font-medium italic">{current.content.officialNotes}</p>
              </div>
            )}

            {current.content.details && (
              <ul className="space-y-2 text-xs sm:text-sm font-medium text-slate-800">
                {current.content.details.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {current.number === 3 ? (
              <div className="space-y-3">
                <PriorityBreakdownDisplay
                  priority={{
                    severityComponent: 30,
                    populationComponent: 22,
                    urgencyComponent: 18,
                    geographicComponent: 12,
                    evidenceComponent: 5,
                    totalScore: 87,
                    level: 'CRITICAL',
                    reasons: [
                      'Severity 30/30 (Disrupts primary child education & health risk)',
                      'Population 22/25 (500 direct students + 120 neighboring households)',
                      'Urgency 18/20 (Monsoon season emergency recurring flash floods)',
                      'Geographic 12/15 (Verified GPS on NH-33 Subarnarekha tributary)',
                      'Evidence 5/10 (Multiple photos & school headmaster sign-off)',
                    ],
                  }}
                  variant="full"
                />
              </div>
            ) : current.content.breakdown ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {current.content.breakdown.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 font-mono font-bold text-black">
                    {item}
                  </div>
                ))}
              </div>
            ) : null}

            {current.content.whyList && (
              <div className="space-y-2 p-4 bg-purple-50 border-2 border-purple-600">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-purple-900">
                    Why Considered Similar:
                  </span>
                  <span className="px-2 py-0.5 bg-purple-700 text-white font-mono text-xs font-bold rounded">
                    {current.content.similarity}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-emerald-800">
                  {current.content.whyList.map((item, idx) => (
                    <div key={idx} className="p-2 bg-white border border-purple-200 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-extrabold text-sm">✓</span>
                      <span>{item.replace(/^✓\s*/, '')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-purple-200 flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-slate-700">Human Options (Never Auto-Merged):</span>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 bg-white border border-slate-400 font-mono font-bold text-slate-800 text-[10px]">
                      REVIEW
                    </span>
                    <span className="px-2 py-0.5 bg-purple-700 font-mono font-bold text-white text-[10px]">
                      MERGE
                    </span>
                    <span className="px-2 py-0.5 bg-amber-600 font-mono font-bold text-white text-[10px]">
                      KEEP SEPARATE
                    </span>
                  </div>
                </div>
              </div>
            )}

            {current.content.whyExplanation && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Transparent 100-Point Match Breakdown:
                </span>
                <div className="space-y-2 text-xs font-bold">
                  {current.content.whyExplanation.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 text-black">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {current.content.verifiedKPIs && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-black text-white border border-slate-200 p-4 text-center">
                  <span className="text-4xl font-black font-mono block">75%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 block">
                    Inundation Drop (12 to 3/yr)
                  </span>
                </div>
                <div className="bg-orange-600 text-white border-2 border-orange-600 p-4 text-center">
                  <span className="text-4xl font-black font-mono block">0</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80 mt-1 block">
                    Lost School Days (down from 18)
                  </span>
                </div>
                <div className="bg-white text-black border border-slate-200 p-4 text-center">
                  <span className="text-4xl font-black font-mono block">500</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1 block">
                    Protected Tribal Students
                  </span>
                </div>
              </div>
            )}

            {current.content.citizenQuote && (
              <div className="p-4 bg-orange-50 border-l-4 border-orange-600 border border-orange-200 text-xs text-orange-950 font-bold">
                "{current.content.citizenQuote}"
              </div>
            )}

            {/* Step Bottom Highlight */}
            <div className="flex items-center gap-2.5 p-3.5 bg-black text-white border border-slate-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
              <span>{current.content.highlight}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation - Fixed/Shrink-0 */}
        <div className="bg-slate-50 border-t-2 border-slate-300 p-3.5 sm:p-5 md:p-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white border border-slate-300 hover:bg-slate-100 flex items-center gap-1.5 rounded transition cursor-pointer"
              title="Reset state to initial benchmark"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset State</span>
            </button>
            <button
              onClick={() => {
                navigate(current.targetTab, 'JH-2026-00124');
                onClose();
              }}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-white bg-black hover:bg-slate-800 border border-slate-200 flex items-center gap-1.5 rounded transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-orange-400" />
              <span>View In {current.title.split(' ')[0]}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-black bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 rounded transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-white bg-orange-600 hover:bg-orange-500 border border-orange-700 flex items-center gap-1 rounded shadow-sm transition cursor-pointer"
              >
                <span>Next Phase</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('impact', 'JH-2026-00124');
                  onClose();
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-white bg-black hover:bg-slate-800 border border-slate-200 flex items-center gap-1.5 rounded shadow-sm transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Finish & View Verified Impact</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
