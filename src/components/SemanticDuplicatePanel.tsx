import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Cpu,
  Eye,
  GitMerge,
  Layers,
  MapPin,
  Split,
  X,
  FileText,
  ShieldCheck,
  Clock,
  Users,
  Compass,
} from 'lucide-react';
import { DuplicateCandidate, Problem, ProblemCluster } from '../types';
import { PriorityBreakdownDisplay } from './PriorityBreakdownDisplay';

interface SemanticDuplicatePanelProps {
  targetProblem: Problem;
  candidates: DuplicateCandidate[];
  masterCluster?: ProblemCluster;
  onDecision: (candidateId: string, action: 'REVIEW' | 'MERGE' | 'KEEP_SEPARATE', notes?: string) => Promise<void>;
  isLoading?: boolean;
}

export const SemanticDuplicatePanel: React.FC<SemanticDuplicatePanelProps> = ({
  targetProblem,
  candidates,
  masterCluster,
  onDecision,
  isLoading = false,
}) => {
  const [reviewCandidate, setReviewCandidate] = useState<DuplicateCandidate | null>(null);
  const [mergeNotes, setMergeNotes] = useState<string>('');
  const [keepSeparateNotes, setKeepSeparateNotes] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [confirmMergeCandidate, setConfirmMergeCandidate] = useState<DuplicateCandidate | null>(null);
  const [confirmSeparateCandidate, setConfirmSeparateCandidate] = useState<DuplicateCandidate | null>(null);

  const handleAction = async (candidateId: string, action: 'REVIEW' | 'MERGE' | 'KEEP_SEPARATE', notes?: string) => {
    setActionInProgress(`${candidateId}-${action}`);
    try {
      await onDecision(candidateId, action, notes);
      setConfirmMergeCandidate(null);
      setConfirmSeparateCandidate(null);
      if (action !== 'REVIEW') {
        setReviewCandidate(null);
      }
    } finally {
      setActionInProgress(null);
    }
  };

  if (!candidates || candidates.length === 0) {
    return (
      <div id="semantic-duplicate-panel-empty" className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs mb-1">
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Semantic Duplicate Detection (0 Candidates)</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Vector cosine similarity and spatial proximity check complete. No duplicate complaints detected in this catchment area.
        </p>
      </div>
    );
  }

  return (
    <div id="semantic-duplicate-panel" className="bg-purple-50/70 border border-purple-200 rounded-2xl p-5 space-y-4">
      {/* Header & Architecture Pipeline Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-950">
              Semantic Duplicate Detection & Cluster Candidates ({candidates.length})
            </span>
          </div>
          <p className="text-[11px] text-purple-800 mt-0.5">
            Vector embeddings & cosine similarity combined with district, block, category, GPS, and evidence.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/80 border border-amber-300 rounded-md text-[10px] font-semibold text-amber-900 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>Human Decision Required • Never Auto-Merged</span>
        </div>
      </div>

      {/* Pipeline Explanation Bar */}
      <div className="bg-white/90 p-2.5 rounded-xl border border-purple-200 text-[11px] text-purple-900 flex items-center gap-2 flex-wrap font-mono">
        <span className="text-[10px] font-bold text-slate-500 uppercase font-sans">Pipeline:</span>
        <span className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-800 font-medium">Description</span>
        <span>→</span>
        <span className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-800 font-medium">Embedding Vector</span>
        <span>→</span>
        <span className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-800 font-medium">Vector Store</span>
        <span>→</span>
        <span className="px-1.5 py-0.5 bg-purple-100 rounded text-purple-800 font-medium">Cosine Similarity</span>
        <span>→</span>
        <span className="px-1.5 py-0.5 bg-amber-100 rounded text-amber-900 font-semibold">Human Review</span>
      </div>

      {/* Master Cluster Notice if already part of a cluster */}
      {masterCluster && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Master Cluster Active: </span>
              <span className="text-emerald-900">{masterCluster.clusterTitle}</span>
              <div className="text-[10px] text-emerald-700 mt-0.5">
                Contains {masterCluster.problemIds.length} consolidated citizen reports
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono text-[10px] font-bold uppercase">
            {masterCluster.status}
          </span>
        </div>
      )}

      {/* Candidate Cards */}
      <div className="space-y-3">
        {candidates.map((cand) => {
          const isMerged = cand.status === 'MERGED';
          const isKeptSeparate = cand.status === 'KEPT_SEPARATE';

          return (
            <div
              key={cand.problemId}
              id={`duplicate-candidate-${cand.problemId}`}
              className="p-4 bg-white rounded-xl border border-purple-200/90 shadow-sm space-y-3 transition-all hover:border-purple-300"
            >
              {/* Header: Score & Title */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-mono font-bold text-xs rounded-md">
                      {cand.problemId}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md">
                      {cand.category}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-400" />
                      {cand.district} {cand.block ? `(${cand.block})` : ''}
                    </span>
                    {cand.problemType && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                        {cand.problemType}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">{cand.title}</h4>
                  {cand.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">{cand.description}</p>
                  )}
                </div>

                {/* Similarity Score Pill */}
                <div className="sm:text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-xl font-bold shadow-sm">
                    <span className="text-base font-extrabold font-mono tracking-tight">{cand.similarityScore}%</span>
                    <span className="text-xs uppercase font-sans tracking-wide">Similar</span>
                  </div>
                  <div className="text-[10px] text-purple-700 font-mono font-semibold mt-1">
                    Cosine: {cand.why.semanticCosineSimilarity.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Explicit "WHY Considered Similar" Checklist */}
              <div className="bg-purple-50/60 p-3 rounded-lg border border-purple-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block mb-1">
                  Why AI Identified This Candidate:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {cand.why.sameDistrict && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Same district ({cand.why.districtName})</span>
                    </div>
                  )}
                  {cand.why.sameCategory && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Same category ({cand.why.categoryName})</span>
                    </div>
                  )}
                  {cand.why.similarDescription && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Similar description ({Math.round(cand.why.semanticCosineSimilarity * 100)}% cosine match)</span>
                    </div>
                  )}
                  {cand.why.nearbyLocation && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Nearby location ({cand.why.distanceKm ? `${cand.why.distanceKm} km` : 'proximate catchment'})</span>
                    </div>
                  )}
                  {cand.why.sameBlock && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Same administrative block ({cand.why.blockName})</span>
                    </div>
                  )}
                  {cand.why.matchingProblemType && (
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Matching problem type ({cand.why.problemType})</span>
                    </div>
                  )}
                  {cand.why.sharedKeywords && cand.why.sharedKeywords.length > 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-800 col-span-1 sm:col-span-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Shared domain keywords: {cand.why.sharedKeywords.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status / Human Resolution */}
              {isMerged && (
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Merged into Master Cluster by Officer</span>
                </div>
              )}

              {isKeptSeparate && (
                <div className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-700 font-semibold flex items-center gap-2">
                  <Split className="w-4 h-4 text-slate-500" />
                  <span>Officer Verified: Marked as Independent Issue (Kept Separate)</span>
                </div>
              )}

              {/* Human Options: REVIEW | MERGE | KEEP SEPARATE */}
              {!isMerged && !isKeptSeparate && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 mr-auto">Human Decision Options:</span>

                  {/* Option 1: REVIEW */}
                  <button
                    id={`btn-review-${cand.problemId}`}
                    onClick={() => setReviewCandidate(cand)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>REVIEW</span>
                  </button>

                  {/* Option 2: KEEP SEPARATE */}
                  <button
                    id={`btn-keep-separate-${cand.problemId}`}
                    onClick={() => setConfirmSeparateCandidate(cand)}
                    className="px-3 py-1.5 bg-white hover:bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Split className="w-3.5 h-3.5 text-amber-600" />
                    <span>KEEP SEPARATE</span>
                  </button>

                  {/* Option 3: MERGE */}
                  <button
                    id={`btn-merge-${cand.problemId}`}
                    onClick={() => setConfirmMergeCandidate(cand)}
                    className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>MERGE</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Side-by-Side REVIEW Modal */}
      {reviewCandidate && (
        <div
          id="duplicate-review-modal"
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold">Side-by-Side Duplicate Review</h3>
                  <p className="text-[11px] text-slate-400">
                    Compare original report against candidate duplicate before making an official ruling.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Match Banner */}
            <div className="px-6 py-3 bg-purple-50 border-b border-purple-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-purple-700 text-white rounded-lg font-mono font-bold text-sm">
                  {reviewCandidate.similarityScore}% Similar
                </div>
                <div className="text-xs text-purple-950 font-semibold">
                  Semantic Cosine: {reviewCandidate.why.semanticCosineSimilarity.toFixed(2)} • Distance:{' '}
                  {reviewCandidate.why.distanceKm ? `${reviewCandidate.why.distanceKm} km` : 'Catchment match'}
                </div>
              </div>

              {/* Quick Action buttons right in review header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleAction(reviewCandidate.problemId, 'KEEP_SEPARATE', 'Verified separate issue during side-by-side review');
                  }}
                  disabled={!!actionInProgress}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Split className="w-3.5 h-3.5 text-amber-600" />
                  <span>KEEP SEPARATE</span>
                </button>
                <button
                  onClick={() => {
                    handleAction(reviewCandidate.problemId, 'MERGE', 'Merged during side-by-side verification');
                  }}
                  disabled={!!actionInProgress}
                  className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>MERGE INTO CLUSTER</span>
                </button>
              </div>
            </div>

            {/* Side-by-side Columns */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {/* Left Column: Target Problem */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Target Report</span>
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {targetProblem.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{targetProblem.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{targetProblem.description}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">District / Block:</span>
                    <span className="font-semibold text-slate-800">
                      {targetProblem.location.district} {targetProblem.location.block ? `• ${targetProblem.location.block}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="font-semibold text-slate-800">{targetProblem.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Affected Population:</span>
                    <span className="font-semibold text-slate-800">{targetProblem.affectedPeopleCount} residents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Urgency:</span>
                    <span className="font-semibold text-slate-800">{targetProblem.urgency}</span>
                  </div>
                  {targetProblem.location.latitude && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Coordinates:</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        {targetProblem.location.latitude.toFixed(4)}, {targetProblem.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {targetProblem.priority && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Priority Breakdown:</span>
                    <PriorityBreakdownDisplay priority={targetProblem.priority} compact />
                  </div>
                )}

                {/* Evidence Photos */}
                {targetProblem.evidence && targetProblem.evidence.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Photographic Evidence:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {targetProblem.evidence.slice(0, 2).map((ev) => (
                        <div key={ev.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                          <img src={ev.url} alt={ev.fileName} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Candidate Duplicate */}
              <div className="space-y-4 md:pl-6 pt-4 md:pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Candidate Duplicate Report</span>
                  <span className="font-mono text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                    {reviewCandidate.problemId}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{reviewCandidate.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reviewCandidate.description || 'No extended description recorded.'}
                  </p>
                </div>

                <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800">District / Block:</span>
                    <span className="font-semibold text-purple-950">
                      {reviewCandidate.district} {reviewCandidate.block ? `• ${reviewCandidate.block}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800">Category:</span>
                    <span className="font-semibold text-purple-950">{reviewCandidate.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800">Problem Type:</span>
                    <span className="font-semibold text-purple-950">{reviewCandidate.problemType || 'INNOVATION'}</span>
                  </div>
                  {reviewCandidate.location?.latitude && (
                    <div className="flex items-center justify-between">
                      <span className="text-purple-800">Coordinates:</span>
                      <span className="font-mono text-[11px] text-purple-900">
                        {reviewCandidate.location.latitude.toFixed(4)}, {reviewCandidate.location.longitude.toFixed(4)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-purple-800">Submitted Date:</span>
                    <span className="text-purple-900">{new Date(reviewCandidate.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Why breakdown list */}
                <div className="bg-white p-3 rounded-xl border border-purple-200 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-purple-900 uppercase block mb-1">
                    Similarity Factors ({reviewCandidate.similarityScore}%):
                  </span>
                  {reviewCandidate.reasons.map((r, idx) => (
                    <div key={idx} className="text-slate-700 flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r.replace(/^✓\s*/, '')}</span>
                    </div>
                  ))}
                </div>

                {/* Candidate Evidence if any */}
                {reviewCandidate.evidence && reviewCandidate.evidence.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-purple-900 uppercase">Photographic Evidence:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {reviewCandidate.evidence.slice(0, 2).map((ev) => (
                        <div key={ev.id} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                          <img src={ev.url} alt={ev.fileName} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MERGE Confirmation Dialog */}
      {confirmMergeCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-purple-900">
              <div className="p-2.5 bg-purple-100 rounded-xl text-purple-700">
                <GitMerge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Merge Duplicate into Master Cluster</h3>
                <p className="text-xs text-slate-500">Consolidate both reports into a single actionable record.</p>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs space-y-1.5">
              <div className="font-semibold text-purple-950">
                Merging Candidate: <span className="font-mono text-purple-700">{confirmMergeCandidate.problemId}</span>
              </div>
              <div className="text-slate-600 text-[11px]">{confirmMergeCandidate.title}</div>
              <div className="text-emerald-700 font-medium text-[11px]">
                Target Master: {targetProblem.id} ({targetProblem.title.slice(0, 45)}...)
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Official Decision Justification</label>
              <textarea
                value={mergeNotes}
                onChange={(e) => setMergeNotes(e.target.value)}
                placeholder="e.g. Verified identical flood runoff corridor along Subarnarekha tributary. Combined into master project."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmMergeCandidate(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmMergeCandidate.problemId, 'MERGE', mergeNotes)}
                disabled={!!actionInProgress}
                className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <GitMerge className="w-3.5 h-3.5" />
                <span>Confirm Merge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KEEP SEPARATE Confirmation Dialog */}
      {confirmSeparateCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
                <Split className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Mark as Independent Issue (Keep Separate)</h3>
                <p className="text-xs text-slate-500">Dismiss AI similarity suggestion and track independently.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                Report: <span className="font-mono text-slate-700">{confirmSeparateCandidate.problemId}</span>
              </div>
              <div className="text-slate-600 text-[11px]">{confirmSeparateCandidate.title}</div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Reason for Keeping Separate</label>
              <textarea
                value={keepSeparateNotes}
                onChange={(e) => setKeepSeparateNotes(e.target.value)}
                placeholder="e.g. Verified separate local drainage catchment requiring distinct engineering contractor."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 h-20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmSeparateCandidate(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmSeparateCandidate.problemId, 'KEEP_SEPARATE', keepSeparateNotes)}
                disabled={!!actionInProgress}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Split className="w-3.5 h-3.5" />
                <span>Confirm Keep Separate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
