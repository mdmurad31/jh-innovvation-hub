/**
 * JH Innovation Hub - Impact Measurement & District Solution Reuse Library
 * - Displays verified before/after societal metrics, cost efficiency, and citizen testimonials
 * - Provides modular, open blueprints (Bill of Materials, Schematics, Implementation Guides)
 * - Enables "Replicate in Another District" across Jharkhand's 24 districts with 1-click pre-fill
 */

import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Download,
  FileCheck,
  FileText,
  HeartHandshake,
  Layers,
  MapPin,
  PackageCheck,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { translations, tText, translateText, translateStatus, translateCategory, translateDistrict } from '../lib/i18n';
import { Problem, Project, SolutionBlueprint, User } from '../types';

interface ImpactAndReuseViewProps {
  currentUser: User;
  projects: Project[];
  blueprints: SolutionBlueprint[];
  districts: any[];
  onSelectReplication: (blueprint: SolutionBlueprint, targetDistrict: string) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

export const ImpactAndReuseView: React.FC<ImpactAndReuseViewProps> = ({
  currentUser,
  projects,
  blueprints,
  districts,
  onSelectReplication,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'impact' | 'blueprints'>('impact');
  const [selectedBlueprint, setSelectedBlueprint] = useState<SolutionBlueprint | null>(blueprints[0] || null);

  // Replicate Modal
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const [targetDistrict, setTargetDistrict] = useState('Dumka');
  const [targetBlock, setTargetBlock] = useState('Ranishwar');
  const [adaptationNotes, setAdaptationNotes] = useState('Adapt for laterite soil and higher monsoon water surges.');
  const [isReplicating, setIsReplicating] = useState(false);
  const [replicateSuccess, setReplicateSuccess] = useState(false);
  const [replicateError, setReplicateError] = useState<string | null>(null);

  const handleReplicate = async () => {
    if (!selectedBlueprint) return;
    setIsReplicating(true);
    setReplicateError(null);
    try {
      const { replicateBlueprint } = await import('../lib/api');
      await replicateBlueprint(selectedBlueprint.id, targetDistrict);
      setReplicateSuccess(true);
      setTimeout(() => {
        setReplicateSuccess(false);
        setShowReplicateModal(false);
        onSelectReplication(selectedBlueprint, targetDistrict);
      }, 1500);
    } catch (err: any) {
      setReplicateError(err.message || 'Failed to replicate');
    } finally {
      setIsReplicating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-black text-white border border-slate-300 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {tText(lang, 'Statewide Impact & Scale', 'राज्यव्यापी प्रभाव एवं विस्तार')}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {tText(lang, 'Solving Once, Deploying Everywhere', 'एक बार समाधान, हर जगह तैनाती')}
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              {tText(lang, 'Impact Verification & Solution Reuse Library', 'प्रभाव सत्यापन एवं समाधान पुनरूपयोग लाइब्रेरी')}
            </h1>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {tText(
                lang,
                'Rigorous before-and-after impact metrics, citizen testimonials, and packaged blueprints for rapid 24-district replication.',
                'सटीक पूर्व-और-पश्चात प्रभाव मेट्रिक्स, नागरिक प्रशंसापत्र और त्वरित 24-ज़िला प्रतिकृति के लिए ब्लूप्रिंट।'
              )}
            </p>
          </div>

          <div className="flex items-center bg-white border border-slate-300 p-1">
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'impact' ? 'bg-black text-white' : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              {tText(lang, 'Measured Outcomes', 'मापे गए परिणाम')}
            </button>
            <button
              onClick={() => setActiveTab('blueprints')}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'blueprints' ? 'bg-black text-white' : 'text-slate-600 hover:text-black hover:bg-slate-100'
              }`}
            >
              {tText(lang, 'District Blueprints', 'ज़िला ब्लूप्रिंट')} ({blueprints.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'impact' ? (
        /* Measured Impact View */
        <div className="space-y-6">
          {/* Key State Impact Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 border border-slate-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verified Beneficiaries</span>
              <div className="font-mono font-black text-2xl text-black">3,420 CITIZENS</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Across 14 active deployments</span>
            </div>

            <div className="bg-white p-5 border border-slate-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Average Cost Efficiency</span>
              <div className="font-mono font-black text-2xl text-orange-600">62% SAVINGS</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Vs traditional municipal civil tenders</span>
            </div>

            <div className="bg-white p-5 border border-slate-300 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Average Time-to-Field</span>
              <div className="font-mono font-extrabold text-2xl text-amber-600">3.8 Months</div>
              <span className="text-[11px] text-slate-500">From submission to live deployment</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Satisfaction</span>
              <div className="font-mono font-extrabold text-2xl text-purple-600">4.9 / 5.0 ★</div>
              <span className="text-[11px] text-slate-500">380+ verified testimonials</span>
            </div>
          </div>

          {/* Deep Impact Case Study: Bundu School Flood Mitigation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-xs font-bold rounded-md border border-amber-300">
                    ★ GOLDEN BENCHMARK CASE STUDY
                  </span>
                  <span className="text-xs font-mono text-indigo-700 font-semibold">JH-2026-00124</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Bundu Govt Middle School: Automated Sluice & IoT Sump Drainage
                </h2>
                <span className="text-xs text-slate-500">
                  Deployed by BIT Mesra • Hardware sponsored by Tata Steel CSR • Verified by Ranchi District Administration
                </span>
              </div>

              <button
                onClick={() => {
                  setActiveTab('blueprints');
                  setSelectedBlueprint(blueprints[0]);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Replicate Blueprint to Dumka / Bokaro</span>
              </button>
            </div>

            {/* Before & After Quantitative Comparison */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                Rigorous Quantitative Before-and-After Verification
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Classroom Water Depth</span>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-rose-500 font-bold block">BEFORE</span>
                      <strong className="text-lg font-mono text-rose-600">2.5 Feet</strong>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-emerald-600 font-bold block">AFTER</span>
                      <strong className="text-lg font-mono text-emerald-600">0.0 Feet</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Zero standing water during heavy 85mm cloudburst</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Lost School Days / Year</span>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-rose-500 font-bold block">BEFORE</span>
                      <strong className="text-lg font-mono text-rose-600">18 Days</strong>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-emerald-600 font-bold block">AFTER</span>
                      <strong className="text-lg font-mono text-emerald-600">0 Days</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Classes continued uninterrupted all monsoon</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Beneficiaries Protected</span>
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">BENEFICIARIES</span>
                      <strong className="text-lg font-mono text-indigo-700">520 Students</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 block">Plus 24 faculty, staff, and midday meal workers</span>
                </div>
              </div>
            </div>

            {/* Citizen Feedback Testimonials */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
                Verified Citizen Testimonials & Government Sign-Off
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-emerald-900">Ramesh Munda (Complainant & Villager)</strong>
                    <div className="flex text-amber-500">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "For five monsoons our children had to wade through knee-deep water or stay home for weeks. BIT Mesra's student team and Tata Steel's sensors fixed the culvert in 3 weeks. Classes have not halted once this monsoon."
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold block">✓ Verified Beneficiary Citizen</span>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-indigo-900">Dr. Amitesh Sinha, IAS (State Innovation Council)</strong>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                      STATE CERTIFICATION
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "This case confirms our thesis: societal challenges do not need 2-year bureaucratic tenders when state universities and CSR partners are matched on day one. We have approved replication to 11 similarly flood-vulnerable schools."
                  </p>
                  <span className="text-[10px] text-indigo-700 font-semibold block">✓ Official Department Sign-Off</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* District Solution Reuse Library */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blueprints Sidebar */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Packaged District Blueprints ({blueprints.length})
            </span>

            {blueprints.map((bp) => (
              <div
                key={bp.id}
                onClick={() => setSelectedBlueprint(bp)}
                className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                  selectedBlueprint?.id === bp.id
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-800">{bp.id}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {translateCategory(bp.category, lang)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{translateText(bp.title, lang)}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Originated: {translateDistrict(bp.originatedDistrict, lang)}</span>
                  <span className="text-emerald-700 font-bold">{bp.replicationsCount} Replications</span>
                </div>
              </div>
            ))}
          </div>

          {/* Blueprint Detail View */}
          {selectedBlueprint && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {selectedBlueprint.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                        {translateCategory(selectedBlueprint.category, lang)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{translateText(selectedBlueprint.title, lang)}</h3>
                    <span className="text-xs text-slate-500">
                      Developed by <strong>{translateText(selectedBlueprint.developedByHEI, lang)}</strong> in {translateDistrict(selectedBlueprint.originatedDistrict, lang)}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowReplicateModal(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Replicate to Another District</span>
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    Problem Summary & Technical Solution
                  </span>
                  <p className="text-slate-700 leading-relaxed">{translateText(selectedBlueprint.problemSummary, lang)}</p>
                  <p className="text-slate-800 font-medium leading-relaxed">{translateText(selectedBlueprint.technicalSolution, lang)}</p>
                </div>

                {/* Bill of Materials (BoM) Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Standardized Bill of Materials (BoM)
                    </span>
                    <span className="font-mono font-bold text-xs text-indigo-700">
                      Est. Total Cost: {selectedBlueprint.estimatedCost}
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3">Quantity</th>
                          <th className="py-2.5 px-3">Est. Unit Cost</th>
                          <th className="py-2.5 px-3">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {selectedBlueprint.billOfMaterials.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-medium">{item.item}</td>
                            <td className="py-2.5 px-3 font-mono">{item.quantity}</td>
                            <td className="py-2.5 px-3 font-mono">{item.unitCost}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold">{item.totalCost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Implementation Guide Steps */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Standard Field Implementation Protocol
                  </span>
                  <div className="space-y-2">
                    {selectedBlueprint.implementationSteps.map((step, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lessons Learned */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <strong className="block font-bold">Field Lessons Learned from Bundu Deployment:</strong>
                  <p>{selectedBlueprint.lessonsLearned}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Replicate Blueprint to Target District Modal */}
      {showReplicateModal && selectedBlueprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Statewide Solution Diffusion
                </span>
                <h3 className="font-bold text-slate-900 text-base">Replicate Blueprint Across Jharkhand</h3>
              </div>
              <button onClick={() => setShowReplicateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {replicateSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <strong className="block font-bold">Replication Package Pre-filled!</strong>
                <p>Redirecting to Citizen Discovery & Project Initialization...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {replicateError && (
                  <div className="p-3 bg-red-50 border border-red-500 rounded-xl text-red-700 text-xs font-bold">
                    {replicateError}
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Source Blueprint:</span>
                  <strong className="text-slate-900 block text-xs">{selectedBlueprint.title}</strong>
                  <span className="text-slate-500 block">Est. Cost: {selectedBlueprint.estimatedCost}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Target District</label>
                    <select
                      value={targetDistrict}
                      onChange={(e) => setTargetDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      {districts.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.hindiName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Target Block / Sub-division</label>
                    <input
                      type="text"
                      value={targetBlock}
                      onChange={(e) => setTargetBlock(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Local Catchment Adaptation Notes</label>
                  <textarea
                    rows={3}
                    value={adaptationNotes}
                    onChange={(e) => setAdaptationNotes(e.target.value)}
                    placeholder="Specify local soil, rainfall variations, or school campus layout..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowReplicateModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReplicate}
                    disabled={isReplicating}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
                  >
                    {isReplicating ? 'Packaging Blueprint...' : `Replicate in ${targetDistrict}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
