/**
 * JH Innovation Hub - Landing Page / Executive Dashboard
 * Redesigned for minimal information overload, elegant visual hierarchy,
 * and high-impact CTA flow.
 */
import React, { lazy, Suspense } from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Cpu,
  FileText,
  Globe,
  HelpCircle,
  Layers,
  Lightbulb,
  MapPin,
  Play,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { translations } from '../lib/i18n';
import { StatsSummary } from '../types';
import { ScrollRevealText } from './ScrollRevealText';

const LandingScrollExperience = lazy(() =>
  import('./LandingScrollExperience').then((m) => ({ default: m.LandingScrollExperience }))
);

// Fallback skeleton templates for visual continuity during loading
const LandingScrollExperienceFallback = () => (
  <div className="w-full min-h-[90vh] bg-slate-950 rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800 flex items-center justify-center">
    <div className="space-y-4 text-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Initializing unified innovation framework...</p>
    </div>
  </div>
);

interface HomeViewProps {
  stats?: StatsSummary | null;
  analytics?: any;
  problems?: any[];
  projects?: any[];
  districts?: any[];
  isDemoMode?: boolean;
  onNavigateTab?: (tabId: string, param?: string) => void;
  onNavigate?: (tabId: string, param?: string) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  analytics,
  problems = [],
  projects = [],
  districts = [],
  isDemoMode,
  onNavigateTab,
  onNavigate,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];

  const navigate = (tabId: string, param?: string) => {
    if (onNavigate) {
      onNavigate(tabId, param);
    } else if (onNavigateTab) {
      onNavigateTab(tabId, param);
    }
  };

  const totalProblemsCount = analytics?.totalProblems || stats?.totalProblems || 12480;
  const validatedCount = analytics?.validatedProblems || stats?.validatedProblems || 8420;
  const inDevCount = analytics?.inDevelopment || stats?.inDevelopment || 2150;
  const deployedCount = analytics?.deployedSolutions || stats?.deployedSolutions || 920;
  const impactFormatted = '4.2M+';

  return (
    <div className="space-y-12 pb-16 font-sans text-slate-900 overflow-hidden">
      {/* LANDING PARALLAX SMOOTH SCROLL EXPERIENCE WITH LAZY LOADING */}
      <Suspense fallback={<LandingScrollExperienceFallback />}>
        <LandingScrollExperience
          lang={lang}
          onReportProblem={() => navigate('citizen')}
          onExploreSolutions={() => navigate('impact')}
        />
      </Suspense>

      {/* SCROLL REVEAL TYPOGRAPHY SECTION */}
      <ScrollRevealText
        text={
          lang === 'hi'
            ? "वास्तविक नवाचार के माध्यम से झारखंड के भविष्य के निर्माण के लिए नागरिकों, अनुसंधान संस्थानों और अग्रणी उद्यमों को जोड़ना।"
            : "Connecting citizens, research institutions, and leading enterprises to build the future of Jharkhand through real-world innovation."
        }
        subtext={
          lang === 'hi'
            ? "स्थानीय चुनौतियों को ओपन-सोर्स सत्यापित समाधान ब्लूप्रिंट में बदलकर सभी 24 जिलों में विकास को गति देने के लिए एक डिजिटल शासन पहल।"
            : "A digital governance initiative aimed at accelerating development across all 24 districts by transforming local challenges into open-source validated solution blueprints."
        }
        lang={lang}
      />

      {/* 4. KEY METRICS */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              {lang === 'hi' ? 'राज्यव्यापी आंकड़े' : 'Statewide Telemetry'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {lang === 'hi' ? 'मुख्य आंकड़े' : 'Key Metrics'}
            </h2>
          </div>
          <button
            onClick={() => navigate('impact')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
          >
            <span>{lang === 'hi' ? 'विस्तृत रिपोर्ट' : 'View Analytics'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5 hover:border-slate-300 transition">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalProblemsCount.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {lang === 'hi' ? 'दर्ज समस्याएं' : 'Problems Reported'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5 hover:border-slate-300 transition">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {validatedCount.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {lang === 'hi' ? 'सत्यापित एवं प्राथमिकता' : 'Validated & IAS Prioritized'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5 hover:border-slate-300 transition">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {inDevCount.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {lang === 'hi' ? 'विकास में समाधान' : 'Solutions in Development'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-1.5 hover:border-slate-300 transition">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {deployedCount.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {lang === 'hi' ? 'तैनात समाधान' : 'Deployed Real-World Solutions'}
            </p>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm space-y-1.5">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {impactFormatted}
            </p>
            <p className="text-xs font-medium text-slate-300">
              {lang === 'hi' ? 'लाभान्वित नागरिक' : 'Citizens Impacted'}
            </p>
          </div>
        </div>
      </motion.section>

      {/* GOLDEN DEMO */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-8 sm:p-10 rounded-2xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>{lang === 'hi' ? '10-चरणीय इंटरैक्टिव वॉकथ्रू' : '10-Stage Interactive Walkthrough'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === 'hi' ? 'गोल्डन डेमो' : 'Golden Demo'}
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
            {lang === 'hi'
              ? 'बुंडू नदी जलभराव समस्या से लेकर एआई स्कोरिंग, आईएएस सत्यापन, बीआईटी मेसरा प्रोटोटाइप और टाटा स्टील सीएसआर तैनाती तक।'
              : 'Experience problem JH-2026-00124 (Bundu Monsoon Flood) through citizen reporting, AI severity scoring, IAS verification, BIT Mesra prototype, and Tata Steel CSR deployment.'}
          </p>
        </div>

        <button
          onClick={onOpenGoldenDemo}
          className="px-6 py-3.5 bg-white hover:bg-slate-100 text-orange-950 font-bold text-sm rounded-xl shadow-md transition-all duration-200 shrink-0 flex items-center gap-2.5 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-orange-950" />
          <span>{lang === 'hi' ? 'इंटरैक्टिव डेमो शुरू करें' : 'Launch Golden Demo'}</span>
        </button>
      </motion.section>

      {/* 5. HOW IT WORKS */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-6 bg-slate-50/80 p-6 sm:p-10 rounded-2xl border border-slate-200"
      >
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            {lang === 'hi' ? 'पारदर्शी प्रक्रिया' : 'Governance Model'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {lang === 'hi' ? 'यह कैसे काम करता है' : 'How It Works'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {lang === 'hi'
              ? 'समस्या रिपोर्ट से लेकर सत्यापन, अकादमिक विकास और वास्तविक तैनाती तक।'
              : 'End-to-end framework turning grassroots concerns into deployed solutions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'नागरिक रिपोर्ट' : 'Citizen Report'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {lang === 'hi'
                    ? 'नागरिक जियो-टैग की गई फोटो साक्ष्य, प्रभावित आबादी और विवरण के साथ समस्या दर्ज करते हैं।'
                    : 'Geotagged submission with photographic evidence, severity rating, and location.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('citizen')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 pt-2 border-t border-slate-100"
            >
              <span>{lang === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'एआई व अधिकारी प्राथमिकता' : 'AI & IAS Priority'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {lang === 'hi'
                    ? 'जेमिनी एआई गंभीरता विश्लेषण करता है और आईएएस अधिकारी औपचारिक सत्यापन करते हैं।'
                    : 'Gemini AI calculates severity scores while District IAS officers formally verify.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('government')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-2 border-t border-slate-100"
            >
              <span>{lang === 'hi' ? 'कमांड सेंटर' : 'Command Center'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <Building2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'विश्वविद्यालय समाधान' : 'University Workspace'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {lang === 'hi'
                    ? '100-बिंदु एल्गोरिदम बीआईटी मेसरा जैसे संस्थानों और छात्र इंजीनियरिंग टीमों को असाइन करता है।'
                    : '100-point algorithm assigns top HEI labs, faculty mentors, and student teams.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('university')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-2 border-t border-slate-100"
            >
              <span>{lang === 'hi' ? 'विश्वविद्यालय हब' : 'HEI Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'hi' ? 'सीएसआर व राज्य तैनाती' : 'CSR & State Deployment'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {lang === 'hi'
                    ? 'टाटा स्टील जैसे उद्योग भागीदार अनुदान प्रदान करते हैं और राज्य एसएलए समाधान तैनात करते हैं।'
                    : 'Industry CSR provides hardware grants while 45-day SLAs manage field deployment.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('industry')}
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 pt-2 border-t border-slate-100"
            >
              <span>{lang === 'hi' ? 'उद्योग पोर्टल' : 'Industry CSR'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};
