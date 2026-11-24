/**
 * JH Innovation Hub - Project Lifecycle & Workflow State Tracker
 * 
 * Includes dual views:
 * 1. Citizen 11-Stage Authentic Database Workflow Engine:
 *    SUBMITTED -> AI ANALYSIS -> GOVERNMENT REVIEW -> VALIDATED -> UNIVERSITY MATCHED
 *    -> PROJECT ACTIVE -> PROTOTYPE -> TESTING -> PILOT -> DEPLOYED -> IMPACT VERIFIED
 * 2. Academic & Engineering Stage-Gate Progression & Laboratory QA Logs
 */

import {
  Activity,
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileCheck,
  FileText,
  Layers,
  MapPin,
  Play,
  RotateCw,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { advanceProjectLifecycle } from '../lib/api';
import { translations, tText, translateStatus, translateText } from '../lib/i18n';
import { Problem, Project, ProjectStatus, User } from '../types';
import { CitizenLifecycleTracker } from './CitizenLifecycleTracker';
import { TranslatedView } from './TranslatedView';

interface LifecycleTrackerViewProps {
  currentUser: User;
  projects: Project[];
  allProblems?: Problem[];
  onProjectUpdated: (p: Project) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

const LIFECYCLE_STAGES: { status: ProjectStatus; labelEn: string; labelHi: string; descEn: string; descHi: string }[] = [
  { status: 'APPROVED', labelEn: 'Approved', labelHi: 'अनुमोदित', descEn: 'Authorized by State Government', descHi: 'राज्य सरकार द्वारा अधिकृत' },
  { status: 'RESEARCH', labelEn: 'Research', labelHi: 'अनुसंधान', descEn: 'Hydrological & GIS Survey', descHi: 'जल विज्ञान एवं जीआईएस सर्वेक्षण' },
  { status: 'PROTOTYPE', labelEn: 'Prototype', labelHi: 'प्रोटोटाइप', descEn: 'Hardware & Edge Firmware Bench Prototyping', descHi: 'हार्डवेयर और एम्बेडेड फर्मवेयर प्रोटोटाइपिंग' },
  { status: 'TESTING', labelEn: 'Testing', labelHi: 'परीक्षण', descEn: 'Simulated Surge Calibration Tests', descHi: 'सिम्युलेटेड सर्ज अंशांकन परीक्षण' },
  { status: 'PILOT', labelEn: 'Pilot', labelHi: 'पायलट', descEn: 'Live Field Pilot at Bundu Middle School', descHi: 'बुंडू मिडिल स्कूल में लाइव फील्ड पायलट' },
  { status: 'DEPLOYED', labelEn: 'Deployed', labelHi: 'तैनात', descEn: 'Permanent Operation & Community Handover', descHi: 'स्थायी संचालन और सामुदायिक हस्तांतरण' },
  { status: 'COMPLETED', labelEn: 'Completed', labelHi: 'पूर्ण', descEn: 'Measured Societal Impact Verified', descHi: 'मापा गया सामाजिक प्रभाव सत्यापित' },
];

export const LifecycleTrackerView: React.FC<LifecycleTrackerViewProps> = ({
  currentUser,
  projects,
  allProblems = [],
  onProjectUpdated,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];

  // View Mode: 'citizen-pipeline' (11-Stage Workflow) or 'engineering-qa' (Project QA & Stage-Gates)
  const [viewMode, setViewMode] = useState<'citizen-pipeline' | 'engineering-qa'>('citizen-pipeline');

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-golden-flood-01');
  const project = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Stage Advancement State
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  const getStageIndex = (status: ProjectStatus) => {
    const idx = LIFECYCLE_STAGES.findIndex((s) => s.status === status);
    return idx === -1 ? 3 : idx;
  };

  const currentStageIndex = project ? getStageIndex(project.status) : 3;

  const handleAdvanceStage = async (nextStatus: ProjectStatus) => {
    if (!project) return;
    setIsAdvancing(true);
    setStatusError(null);
    setStatusSuccess(null);

    try {
      const res = await advanceProjectLifecycle(project.id, {
        newStatus: nextStatus,
      });
      if (res.success && res.project) {
        onProjectUpdated(res.project);
        setStatusSuccess(`Stage successfully transitioned to ${nextStatus.replace('_', ' ')}.`);
        setTimeout(() => setStatusSuccess(null), 4000);
      }
    } catch (err: any) {
      setStatusError(err.message || 'Stage transition failed');
      setTimeout(() => setStatusError(null), 5000);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Header & Perspective Switcher */}
      <div className="bg-black text-white border border-slate-300 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                {tText(lang, 'State Database Lifecycle Engine', 'राज्य डेटाबेस जीवनचक्र इंजन')}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {tText(lang, '11-Stage Citizen Workflow & R&D Stage-Gates', '11-चरण नागरिक कार्यप्रवाह और आरएंडडी चरण')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              {tText(lang, 'Problem & Solution Lifecycle Tracking', 'समस्या एवं समाधान जीवनचक्र ट्रैकिंग')}
            </h1>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {tText(
                lang,
                'Track authentic database state progressions from citizen grievance intake to AI triage, university R&D, and permanent field deployment.',
                'नागरिक समस्या दर्ज करने से लेकर एआई विश्लेषण, विश्वविद्यालय अनुसंधान और स्थायी क्षेत्र तैनाती तक प्रगति ट्रैक करें।'
              )}
            </p>
          </div>

          {/* Perspective Toggle Buttons */}
          <div className="flex items-center bg-slate-900 border-2 border-white p-1">
            <button
              onClick={() => setViewMode('citizen-pipeline')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'citizen-pipeline' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{tText(lang, 'Citizen 11-Stage Workflow', 'नागरिक 11-चरण कार्यप्रवाह')}</span>
            </button>
            <button
              onClick={() => setViewMode('engineering-qa')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'engineering-qa' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{tText(lang, 'University R&D & Stage-Gates', 'विश्वविद्यालय आरएंडडी एवं चरण-गेट')}</span>
            </button>
          </div>
        </div>
      </div>

      {statusError && (
        <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-600 p-4 text-red-700 dark:text-red-300 text-xs font-bold flex items-center justify-between">
          <span>{statusError}</span>
          <button onClick={() => setStatusError(null)} className="font-black px-2 cursor-pointer">&times;</button>
        </div>
      )}

      {statusSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-600 p-4 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span>{statusSuccess}</span>
          <button onClick={() => setStatusSuccess(null)} className="font-black px-2 cursor-pointer">&times;</button>
        </div>
      )}

      {/* VIEW 1: AUTHENTIC 11-STAGE DATABASE WORKFLOW */}
      {viewMode === 'citizen-pipeline' ? (
        <CitizenLifecycleTracker
          allProblems={allProblems}
          currentUser={currentUser}
          onOpenGoldenDemo={onOpenGoldenDemo}
          lang={lang}
        />
      ) : (
        /* VIEW 2: UNIVERSITY ENGINEERING & STAGE-GATE QA */
        <div className="space-y-6">
          {project ? (
            <>
              {/* Project Meta Card */}
              <div className="bg-white p-6 sm:p-8 border border-slate-300 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-white bg-black px-2.5 py-1">
                        {project.id}
                      </span>
                      <span className="text-xs px-2.5 py-1 font-black bg-orange-600 text-white uppercase tracking-wider">
                        CURRENT STAGE: {project.status}
                      </span>
                      {project.isGoldenDemo && (
                        <span className="text-[10px] font-black px-2.5 py-1 bg-black text-orange-400 border border-slate-300 uppercase tracking-widest">
                          ★ STATE BENCHMARK
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-2">
                      {project.title}
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      HEI: <strong className="text-black">{project.universityName}</strong> • Lead: {project.facultyMentorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="px-3 py-2 bg-white text-black border border-slate-300 text-xs font-bold"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id}: {p.title.slice(0, 24)}...
                        </option>
                      ))}
                    </select>

                    {/* Next Stage Button */}
                    {currentStageIndex < LIFECYCLE_STAGES.length - 1 && (
                      <button
                        onClick={() => handleAdvanceStage(LIFECYCLE_STAGES[currentStageIndex + 1].status)}
                        disabled={isAdvancing}
                        className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider border border-slate-300 transition flex items-center gap-1.5"
                      >
                        <span>
                          {tText(lang, 'Advance to ', 'आगे बढ़ें: ')}
                          {tText(lang, LIFECYCLE_STAGES[currentStageIndex + 1].labelEn, LIFECYCLE_STAGES[currentStageIndex + 1].labelHi)}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Stepper Pipeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                  {LIFECYCLE_STAGES.map((st, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div
                        key={st.status}
                        className={`p-3 border-2 text-center transition ${
                          isCurrent
                            ? 'bg-orange-50 border-orange-600 ring-2 ring-orange-400'
                            : isDone
                            ? 'bg-emerald-50 border-emerald-500'
                            : 'bg-slate-50 border-slate-300 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <span className="w-3 h-3 rounded-full bg-orange-600 animate-ping" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                          )}
                        </div>
                        <strong className={`block text-xs font-black uppercase ${isCurrent ? 'text-orange-950' : 'text-black'}`}>
                          {tText(lang, st.labelEn, st.labelHi)}
                        </strong>
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5 line-clamp-2">
                          {tText(lang, st.descEn, st.descHi)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid: 3 Lifecycle Logs (Testing, Pilot, Deployment) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card 1: Verified Test Results */}
                <div className="bg-white p-6 border border-slate-300 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-orange-600" />
                      <h3 className="font-black uppercase text-black text-sm">Laboratory & Bench Testing</h3>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {project.tests.filter((t) => t.passed).length} / {project.tests.length} PASSED
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {project.tests.map((t) => (
                      <div key={t.id} className="p-3 bg-slate-50 border border-slate-300 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-black text-xs font-black">{t.testName}</strong>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800">
                            PASSED
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">Date: {t.testDate} • {t.environment}</span>
                        <div className="text-[11px] space-y-0.5 pt-1 text-slate-700">
                          <div><strong>Expected:</strong> {t.expectedResult}</div>
                          <div><strong>Actual:</strong> <span className="text-emerald-700 font-bold">{t.actualResult}</span></div>
                        </div>
                        {t.notes && <p className="text-[10px] text-slate-500 italic mt-1">{t.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Community Pilot Deployment */}
                <div className="bg-white p-6 border border-slate-300 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h3 className="font-black uppercase text-black text-sm">Live Field Pilot Trial</h3>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-blue-100 text-blue-900 border border-blue-300">
                      {project.pilotDeployments.length} DEPLOYED
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {project.pilotDeployments.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-50 border border-slate-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-black font-black text-xs">{p.locationName}</strong>
                          <span className="text-[10px] font-mono font-bold text-orange-600">
                            {p.beneficiariesReached} Beneficiaries
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <div><strong>Dates:</strong> {p.startDate} &rarr; {p.endDate}</div>
                          <div><strong>Key Outcome:</strong> {p.keyOutcomes}</div>
                        </div>
                        <div className="p-2 bg-white border border-slate-300 text-[11px] text-slate-800 italic">
                          "{p.communityFeedback}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: Production Deployment & Permanent Handover */}
                <div className="bg-white p-6 border border-slate-300 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-black uppercase text-black text-sm">Permanent Handover</h3>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-600 text-white">
                      COMMISSIONED
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {project.deployments.map((d) => (
                      <div key={d.id} className="p-3 bg-slate-50 border border-slate-300 space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-black font-black text-xs">{d.district} &bull; {d.location}</strong>
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            {d.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <div><strong>Installed:</strong> {d.installationDate}</div>
                          <div><strong>Local Custodian:</strong> {d.custodian}</div>
                          <div><strong>Telemetry Status:</strong> {d.telemetryStatus}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 bg-white border border-slate-300 text-center text-slate-500 font-bold">
              No active university projects found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
