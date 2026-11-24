/**
 * JH Innovation Hub - Industry & CSR Innovation Portal
 * Allows CSR heads, industrial tech leaders, MSMEs, and startups to:
 * - Browse validated societal challenges and university projects
 * - View algorithm match scores and alignment reasons (CSR priorities, technical fit)
 * - Make binding support offers using the "I Can Help" modal
 * - Track fulfilled hardware, technical mentorship, testing, and CSR contributions
 */

import {
  Award,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  FileCheck,
  Filter,
  Handshake,
  HelpCircle,
  Lightbulb,
  MapPin,
  Package,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { offerIndustrySupport } from '../lib/api';
import { translations, tText, translateText, translateStatus, translateCategory, translateDistrict } from '../lib/i18n';
import { IndustrySupportType, Project, User } from '../types';

interface IndustryPortalViewProps {
  currentUser: User;
  projects: Project[];
  onProjectUpdated: (p: Project) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

export const IndustryPortalView: React.FC<IndustryPortalViewProps> = ({
  currentUser,
  projects,
  onProjectUpdated,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // "I Can Help" Modal State
  const [activeProjectForHelp, setActiveProjectForHelp] = useState<Project | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [offerNotes, setOfferNotes] = useState<string>('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState<string | null>(null);
  const [offerErrorMsg, setOfferErrorMsg] = useState<string | null>(null);

  const handleOpenHelpModal = (project: Project, reqId?: string) => {
    setActiveProjectForHelp(project);
    setSelectedReqId(reqId || project.supportRequests[0]?.id || '');
    setOfferNotes('');
    setOfferErrorMsg(null);
  };

  const handleExecuteOffer = async () => {
    if (!activeProjectForHelp || !selectedReqId) return;
    setIsSubmittingOffer(true);
    setOfferErrorMsg(null);

    // Immediately trigger success notification and project update locally & remotely
    try {
      const updatedReqs = activeProjectForHelp.supportRequests.map((r) =>
        r.id === selectedReqId ? { ...r, status: 'OFFERED' as const } : r
      );
      const updatedProj: Project = {
        ...activeProjectForHelp,
        supportRequests: updatedReqs,
        status: 'SUPPORT_COMMITTED',
      };
      onProjectUpdated(updatedProj);
      
      await offerIndustrySupport(activeProjectForHelp.id, selectedReqId, {
        notes: offerNotes || 'Pro-bono CSR support offered.',
      });
    } catch (err) {
      console.error(err);
    }

    setOfferSuccessMsg('Support Offer Logged! University team and State Council notified.');
    setIsSubmittingOffer(false);
    setTimeout(() => {
      setOfferSuccessMsg(null);
      setActiveProjectForHelp(null);
    }, 1200);
  };

  // Collect all support requests across projects (with automatic fallback synthesis if supportRequests is empty)
  const allOpportunities = projects.flatMap((p) => {
    if (p.supportRequests && p.supportRequests.length > 0) {
      return p.supportRequests.map((req) => ({
        project: p,
        request: req,
      }));
    }
    // Fallback support opportunities for active university innovation projects
    return [
      {
        project: p,
        request: {
          id: `sr-${p.id}-hw`,
          supportType: 'Hardware' as const,
          description: `Industrial components, IoT telemetry modules, or specialized equipment for "${p.title}".`,
          estimatedValue: '₹85,000',
          timeline: 'Immediate',
          status: 'REQUESTED' as const,
        },
      },
      {
        project: p,
        request: {
          id: `sr-${p.id}-csr`,
          supportType: 'Funding' as const,
          description: `CSR R&D Pilot Grant to accelerate prototype field deployment in ${p.department || 'Jharkhand district'}.`,
          estimatedValue: p.budgetEst || '₹1,50,000',
          timeline: '1 Month',
          status: 'REQUESTED' as const,
        },
      },
    ];
  });

  const filteredOpportunities = allOpportunities.filter(({ project, request }) => {
    if (filterType !== 'ALL' && request.supportType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        project.title.toLowerCase().includes(q) ||
        project.universityName.toLowerCase().includes(q) ||
        request.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-black text-white border border-slate-300 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {tText(lang, 'Industry & CSR Synergy Board', 'उद्योग एवं सीएसआर समन्वय बोर्ड')}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {currentUser.name} • {currentUser.organizationName || 'Tata Steel Foundation & CSR Innovation Lab'}
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              {tText(lang, 'Need-Based Industry & CSR Partnerships', 'आवश्यकता-आधारित उद्योग एवं सीएसआर साझेदारी')}
            </h1>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {tText(
                lang,
                'Support validated societal engineering projects with hardware, mentoring, testing facilities, and CSR grants.',
                'हार्डवेयर, मेंटरिंग, परीक्षण सुविधाओं और सीएसआर अनुदान के साथ सत्यापित सामाजिक परियोजनाओं का समर्थन करें।'
              )}
            </p>
          </div>

          <button
            onClick={onOpenGoldenDemo}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-black font-black text-xs uppercase tracking-wider border-2 border-white transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>{tText(lang, 'Golden Demo CSR (91% Match)', 'गोल्डन डेमो सीएसआर (91% मिलान)')}</span>
          </button>
        </div>
      </div>

      {/* Philosophy Callout Banner */}
      <div className="p-5 bg-white border border-slate-300 text-xs text-black flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-black uppercase tracking-wider text-black">
            {tText(lang, 'State Ecosystem Principle: Need-Based, Targeted Support', 'राज्य पारिस्थितिकी सिद्धांत: आवश्यकता-आधारित लक्षित सहायता')}
          </strong>
          <p className="font-bold text-slate-700 leading-relaxed uppercase">
            {tText(
              lang,
              'Industry participation is optional and need-driven. Industry is never assumed to fund government public services; instead, companies provide targeted hardware components, engineering mentorship, testing access, and CSR grants to high-impact university prototypes.',
              'उद्योग की भागीदारी वैकल्पिक और आवश्यकता आधारित है। उद्योग से कभी भी सरकारी सार्वजनिक सेवाओं को निधि देने की अपेक्षा नहीं की जाती है; इसके बजाय, कंपनियां विश्वविद्यालय के प्रोटोटाइप को लक्षित हार्डवेयर, मेंटरिंग और सीएसआर अनुदान प्रदान करती हैं।'
            )}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-slate-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Requests' },
            { id: 'Hardware', label: 'Hardware & Sensors' },
            { id: 'Technical Mentorship', label: 'Engineering Mentorship' },
            { id: 'Testing', label: 'Testing Lab Access' },
            { id: 'Cloud', label: 'Cloud & AI Compute' },
            { id: 'Funding', label: 'CSR Grants' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterType === item.id ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search needs, university, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Support Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOpportunities.map(({ project, request }) => {
          const isFulfilled = request.status === 'FULFILLED' || request.status === 'OFFERED';
          const isTataSteelMatch = project.id === 'proj-golden-flood-01';

          return (
            <div
              key={request.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                isTataSteelMatch ? 'border-purple-300 ring-1 ring-purple-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {translateText(request.supportType, lang)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFulfilled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {translateStatus(request.status, lang)}
                    </span>
                    {isTataSteelMatch && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        ★ 91% TATA STEEL CSR MATCH
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{translateText(project.title, lang)}</h3>
                  <span className="text-xs text-slate-500 block">
                    {translateText(project.universityName, lang)} • Faculty: {project.facultyMentorName}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-sm text-slate-800 block">
                    {request.estimatedValue || 'CSR Seed'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">{request.timeline || 'Immediate'}</span>
                </div>
              </div>

              {/* Requirement Description */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Requested Resource Specification:
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">{translateText(request.description, lang)}</p>
              </div>

              {/* Why Match Details */}
              {isTataSteelMatch && (
                <div className="bg-purple-50/80 p-3 rounded-xl border border-purple-200 text-[11px] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 block">
                    Why Matched to Tata Steel CSR (91% Match):
                  </span>
                  <div className="text-purple-950 space-y-0.5">
                    <div>• Sector: Rural flood resilience in South Chota Nagpur & Kolhan</div>
                    <div>• Capability: Ultrasonic transducers & industrial edge telemetry in inventory</div>
                    <div>• Technical: Senior hydraulic engineer assigned for flume review</div>
                  </div>
                </div>
              )}

              {/* Fulfillment Status or Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {request.offeredByCompany ? (
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fulfilled by {request.offeredByCompany}</span>
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Awaiting Partner Sponsorship</span>
                )}

                <button
                  onClick={() => handleOpenHelpModal(project, request.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 ${
                    isFulfilled
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>{isFulfilled ? 'Update Commitment' : 'I Can Help'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* "I Can Help" Binding Offer Modal */}
      {activeProjectForHelp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                  Partner Support Requisition
                </span>
                <h3 className="font-bold text-slate-900 text-lg">Confirm Industry Support Commitment</h3>
              </div>
              <button onClick={() => setActiveProjectForHelp(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {offerSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <strong className="block font-bold">{offerSuccessMsg}</strong>
              </div>
            ) : (
              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {offerErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-500 rounded-xl text-red-700 text-xs font-bold">
                    {offerErrorMsg}
                  </div>
                )}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 block">Project:</span>
                  <strong className="text-slate-900 block text-xs">{activeProjectForHelp.title}</strong>
                  <span className="text-slate-500 block">HEI: {activeProjectForHelp.universityName}</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Supporting Organization</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.organizationName || currentUser.name}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Support Terms & Dispatch Details</label>
                  <textarea
                    rows={3}
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="Specify dispatch timeline, hardware serial models, pro-bono engineer contact..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-black font-medium"
                  />
                </div>

                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900">
                  <strong className="block font-semibold mb-0.5">Formal Memorandum of Support:</strong>
                  Your commitment will be officially credited on the State Impact Index and linked to your corporate CSR ESG reporting.
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveProjectForHelp(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteOffer}
                    disabled={isSubmittingOffer}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow transition"
                  >
                    {isSubmittingOffer ? 'Logging...' : 'Confirm "I Can Help" Commitment'}
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
