/**
 * JH Innovation Hub - Main Application
 * Turning Community Problems into Real-World Solutions
 * Full state ecosystem coordinating Citizens, Government, Universities, and Industry.
 */

import {
  Activity,
  Award,
  Building2,
  ChevronDown,
  Globe,
  HelpCircle,
  Layers,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  LogIn,
  LogOut,
  KeyRound,
  CheckCircle2,
  X,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { AuthModal } from './components/AuthModal';
import { CitizenSubmitView } from './components/CitizenSubmitView';
import { GoldenDemoModal } from './components/GoldenDemoModal';
import { GovernmentCommandView } from './components/GovernmentCommandView';
import { HomeView } from './components/HomeView';
import { ImpactAndReuseView } from './components/ImpactAndReuseView';
import { IndustryPortalView } from './components/IndustryPortalView';
import { JharkhandMapView } from './components/JharkhandMapView';
import { LifecycleTrackerView } from './components/LifecycleTrackerView';
import { UniversityWorkspaceView } from './components/UniversityWorkspaceView';
import { Footer } from './components/Footer';
import {
  fetchAnalytics,
  fetchBlueprints,
  fetchDistricts,
  fetchProblems,
  fetchProjects,
  logoutUser,
  resetGoldenDemoData,
} from './lib/api';
import { translations } from './lib/i18n';
import { Problem, Project, SolutionBlueprint, User, UserRole } from './types';

// Pre-configured persona users for testing role-based access across all 7 server-enforced roles
const PRESET_USERS: User[] = [
  {
    id: 'usr-citizen-ramesh',
    name: 'Ramesh Munda',
    role: 'CITIZEN',
    district: 'Ranchi',
    email: 'ramesh.munda@bundu.jharkhand.in',
  },
  {
    id: 'usr-govt-ias-amitesh',
    name: 'Dr. Amitesh Sinha, IAS',
    role: 'GOVERNMENT',
    department: 'Planning & Development',
    organizationName: 'Jharkhand State Innovation Council',
    district: 'Ranchi',
    email: 'amitesh.sinha@gov.jh.in',
  },
  {
    id: 'usr-univ-admin-indranil',
    name: 'Prof. Indranil Manna',
    role: 'UNIVERSITY_ADMIN',
    universityId: 'univ-bit-mesra',
    department: 'Academic Administration',
    organizationName: 'Birla Institute of Technology (BIT) Mesra',
    district: 'Ranchi',
    email: 'admin.office@bitmesra.ac.in',
  },
  {
    id: 'usr-faculty-anand',
    name: 'Dr. Anand Kumar Mishra',
    role: 'FACULTY',
    universityId: 'univ-bit-mesra',
    department: 'Civil & Remote Sensing',
    organizationName: 'Birla Institute of Technology (BIT) Mesra',
    district: 'Ranchi',
    email: 'anand.mishra@bitmesra.ac.in',
  },
  {
    id: 'usr-student-priya',
    name: 'Priya Kumari',
    role: 'STUDENT',
    universityId: 'univ-bit-mesra',
    department: 'IoT & Embedded Systems',
    organizationName: 'BIT Mesra Innovation Lab',
    district: 'Ranchi',
    email: 'priya.kumari@student.bitmesra.ac.in',
  },
  {
    id: 'usr-student-unassigned',
    name: 'Amit Kumar',
    role: 'STUDENT',
    universityId: 'univ-bit-mesra',
    department: 'Electrical Engineering',
    organizationName: 'BIT Mesra',
    district: 'Ranchi',
    email: 'amit.kumar@student.bitmesra.ac.in',
  },
  {
    id: 'usr-industry-tata',
    name: 'Sanjeev Sengupta',
    role: 'INDUSTRY',
    organizationName: 'Tata Steel Foundation & CSR Innovation Lab',
    district: 'East Singhbhum',
    email: 'sanjeev.sengupta@tatasteel.com',
  },
  {
    id: 'usr-mentor-rajesh',
    name: 'Dr. Rajesh Sharma',
    role: 'MENTOR',
    organizationName: 'CSIR-NML / National Innovation Foundation',
    district: 'East Singhbhum',
    email: 'rajesh.sharma@nmlindia.org',
  },
];

export default function App() {
  const [lang, setLang] = useState<'en' | 'hi'>(() => {
    try {
      const saved = localStorage.getItem('jh_hub_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en';
  });
  const t = translations[lang];

  const handleSetLang = (newLang: 'en' | 'hi') => {
    setLang(newLang);
    try {
      localStorage.setItem('jh_hub_lang', newLang);
    } catch {
      // ignore
    }
  };

  // Current active navigation view - Always default to 'home' (Executive Dashboard)
  const [activeNav, setActiveNav] = useState<
    'home' | 'citizen' | 'government' | 'university' | 'industry' | 'lifecycle' | 'impact' | 'map'
  >('home');

  // Logged-in user state (persisted or default persona)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('jh_hub_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRESET_USERS[1]; // Default to IAS Officer for complete inspection
  });

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('jh_hub_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jh_hub_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jh_hub_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // Auth modal and user profile menu state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);

  // Golden Demo modal trigger
  const [isGoldenDemoOpen, setIsGoldenDemoOpen] = useState(false);

  // Lock background body scroll whenever any drawer or modal is open to prevent background scrolling
  useEffect(() => {
    const isAnyOverlayActive = isNavDrawerOpen || isAuthModalOpen || isGoldenDemoOpen;
    if (isAnyOverlayActive) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isNavDrawerOpen, isAuthModalOpen, isGoldenDemoOpen]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('jh_hub_auth_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    setIsUserMenuOpen(false);
    // User requested to always land on the Executive Dashboard at first screen regardless of role
    setActiveNav('home');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('jh_hub_auth_user');
    } catch {
      // ignore
    }
    setCurrentUser(PRESET_USERS[0]);
    setIsUserMenuOpen(false);
    setActiveNav('home');
  };

  // Core platform state
  const [problems, setProblems] = useState<Problem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [blueprints, setBlueprints] = useState<SolutionBlueprint[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resettingDemo, setResettingDemo] = useState(false);

  // Initial load
  const loadPlatformData = async () => {
    setIsLoading(true);
    try {
      const [probsData, projsData, distsData, bpsData, statsData] = await Promise.all([
        fetchProblems(),
        fetchProjects(),
        fetchDistricts(),
        fetchBlueprints(),
        fetchAnalytics(),
      ]);

      setProblems(probsData.problems || []);
      setProjects(projsData.projects || []);
      setDistricts(distsData.districts || []);
      setBlueprints(bpsData.blueprints || []);
      setAnalytics(statsData);
    } catch (err) {
      console.warn('Failed loading platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  // Reset Golden Demo state
  const handleResetDemo = async () => {
    setResettingDemo(true);
    try {
      await resetGoldenDemoData();
      await loadPlatformData();
      setIsGoldenDemoOpen(true);
    } catch (err) {
      console.warn('Reset error:', err);
    } finally {
      setResettingDemo(false);
    }
  };

  // Callback when new problem created
  const handleProblemCreated = (newProblem: Problem) => {
    setProblems((prev) => [newProblem, ...prev]);
    loadPlatformData();
  };

  // Callback when problem updated
  const handleProblemUpdated = (updated: Problem) => {
    setProblems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    loadPlatformData();
  };

  // Callback when project updated
  const handleProjectUpdated = (updated: Project) => {
    setProjects((prev) => prev.map((pr) => (pr.id === updated.id ? updated : pr)));
    loadPlatformData();
  };

  // Callback for replicating blueprint to new district
  const handleSelectReplication = (blueprint: SolutionBlueprint, targetDistrict: string) => {
    setActiveNav('citizen');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 text-[#1A1A1A] dark:text-slate-100 flex flex-col font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Main Official Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Branding & Emblem */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveNav('home')}
            >
              <span className="text-3xl sm:text-4xl font-black tracking-tighter text-black uppercase leading-none">
                JH.HUB
              </span>
              <div className="hidden sm:flex flex-col justify-center border-l-2 border-slate-300 pl-3 py-0.5">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-700 leading-tight">
                  {t.innovationEcosystem}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 leading-tight mt-0.5">
                  {t.stateCouncil}
                </span>
              </div>
            </div>

            {/* Persona / Role Selector, Auth SSO, Language Switch & User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden xl:block text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t.aiStatus}
                </p>
                <p className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  {t.engineActive}
                </p>
              </div>

              {/* Reset Demo Button */}
              <button
                id="header-reset-demo-btn"
                onClick={handleResetDemo}
                disabled={resettingDemo}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                title="Reset Golden Demo and Prototype data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${resettingDemo ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">{resettingDemo ? t.resetting : t.resetDemo}</span>
              </button>

              {/* Dark / Light Mode Toggle Button */}
              <button
                id="header-dark-mode-toggle-btn"
                onClick={() => {
                  console.log('Dark mode toggle clicked. Current state:', isDarkMode);
                  setIsDarkMode(!isDarkMode);
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-orange-500 border border-slate-300 transition cursor-pointer"
                title="Toggle Dark / Light Mode"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
              </button>

              {/* Prominent Header Language Switcher */}
              <div className="flex items-center border border-slate-300 bg-white shadow-sm">
                <button
                  id="main-lang-toggle-en"
                  onClick={() => handleSetLang('en')}
                  className={`px-2 py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1 ${
                    lang === 'en'
                      ? 'bg-black text-white shadow-inner'
                      : 'bg-white text-slate-600 hover:text-black hover:bg-slate-100'
                  }`}
                  title="Switch language to English"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>EN</span>
                </button>
                <button
                  id="main-lang-toggle-hi"
                  onClick={() => handleSetLang('hi')}
                  className={`px-2 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                    lang === 'hi'
                      ? 'bg-orange-600 text-white shadow-inner'
                      : 'bg-white text-slate-600 hover:text-black hover:bg-slate-100'
                  }`}
                  title="भाषा को हिन्दी में बदलें"
                >
                  <span>हिन्दी</span>
                </button>
              </div>

              {/* Right Slide-Out Navigation Menu Trigger Button */}
              <button
                id="main-nav-drawer-toggle-btn"
                onClick={() => setIsNavDrawerOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 border-black shadow-[2px_2px_0px_#ea580c] hover:shadow-[1px_1px_0px_#ea580c] transition cursor-pointer"
                title="Open Navigation Menu"
              >
                <Menu className="w-4 h-4 text-orange-400" />
                <span>{lang === 'hi' ? 'मेनू' : 'Menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer (Swipe / Slide from Right Corner to Left) */}
      <AnimatePresence>
        {isNavDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsNavDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              id="navigation-slideout-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-sm sm:max-w-md bg-white text-slate-900 h-full shadow-2xl flex flex-col z-10 border-l-4 border-black overflow-hidden overscroll-contain"
            >
              {/* Drawer Header */}
              <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white flex items-center justify-between border-b-2 border-orange-600 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center font-black text-sm text-white">
                    JH
                  </div>
                  <div>
                    <h2 className="font-black text-base tracking-tight uppercase">
                      {lang === 'hi' ? 'नेविगेशन मेनू' : 'Navigation Menu'}
                    </h2>
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                      {t.stateCouncil}
                    </p>
                  </div>
                </div>

                <button
                  id="nav-drawer-close-btn"
                  onClick={() => setIsNavDrawerOpen(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active Persona Banner & Sign In Action in Drawer */}
              <div className="p-4 bg-orange-50 border-b border-orange-200 space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-orange-200 text-orange-950 px-2 py-0.5 rounded">
                      {currentUser.role}
                    </span>
                    <p className="font-bold text-xs text-slate-900 mt-1 truncate">{currentUser.name}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 border border-orange-200 rounded">
                    {currentUser.authProvider ? currentUser.authProvider.toUpperCase() : 'SSO'}
                  </span>
                </div>

                {/* Sign In / Switch Account Button */}
                <button
                  id="drawer-sign-in-modal-btn"
                  onClick={() => {
                    setIsNavDrawerOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 bg-black hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-300 shadow-[2px_2px_0px_#ea580c] hover:shadow-[1px_1px_0px_#ea580c] transition cursor-pointer"
                  title="Sign in with Google, Facebook, GitHub, or State MeriPehchaan SSO"
                >
                  <LogIn className="w-3.5 h-3.5 text-orange-400" />
                  <span>{t.signIn || 'Sign In'} / {lang === 'hi' ? 'खाता बदलें' : 'Switch Platform'}</span>
                </button>
              </div>

              {/* Navigation Items List */}
              <div
                id="drawer-nav-items-scroll-container"
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1.5 custom-scrollbar overscroll-contain"
                style={{
                  touchAction: 'pan-y',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {[
                  { id: 'home', label: t.navDashboard, icon: Layers, desc: lang === 'hi' ? 'मुख्य डैशबोर्ड और अवलोकन' : 'Overview, Analytics & Metrics' },
                  { id: 'citizen', label: t.navCitizen, icon: Users, desc: lang === 'hi' ? 'समस्या दर्ज करें और ट्रैक करें' : 'Report Civic Problems' },
                  { id: 'government', label: t.navGovt, icon: ShieldCheck, desc: lang === 'hi' ? 'आईएएस सत्यापन व स्वीकृति' : 'IAS Review & Triage Engine' },
                  { id: 'university', label: t.navUniversity, icon: Building2, desc: lang === 'hi' ? 'शोध, प्रोटोटाइप व संकाय' : 'R&D Workspace & Prototypes' },
                  { id: 'industry', label: t.navIndustry, icon: Award, desc: lang === 'hi' ? 'सीएसआर फंडिंग व साझेदारी' : 'CSR Funding & Deployment' },
                  { id: 'lifecycle', label: t.navLifecycle, icon: Activity, desc: lang === 'hi' ? '10-चरणीय ट्रैकर' : '10-Stage Project Lifecycle' },
                  { id: 'impact', label: t.navImpact, icon: Sparkles, desc: lang === 'hi' ? 'ब्लूप्रिंट्स और प्रभाव' : 'Blueprint Library & Metrics' },
                  { id: 'map', label: t.navMap, icon: MapPin, desc: lang === 'hi' ? '24 जिलों का भौगोलिक नक्शा' : '24-District Geographic GIS' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeNav === tab.id;

                  return (
                    <button
                      key={tab.id}
                      id={`drawer-nav-item-${tab.id}`}
                      onClick={() => {
                        setActiveNav(tab.id as any);
                        setIsNavDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-slate-950 text-white shadow-md border-l-4 border-orange-500'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-orange-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-black text-sm tracking-wide">{tab.label}</div>
                          <div className={`text-[11px] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                            {tab.desc}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
                <button
                  onClick={() => {
                    setIsNavDrawerOpen(false);
                    setIsGoldenDemoOpen(true);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'गोल्डन डेमो शुरू करें' : 'Launch Golden Demo'}</span>
                </button>

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 font-bold">
                  <span>Jharkhand Innovation Ecosystem</span>
                  <span>v2.4 Live</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Loading State Innovation Ecosystem...
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              {activeNav === 'home' && (
                <HomeView
                  problems={problems}
                  projects={projects}
                  analytics={analytics}
                  districts={districts}
                  onNavigate={(v) => setActiveNav(v as any)}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}

              {activeNav === 'citizen' && (
                <CitizenSubmitView
                  currentUser={currentUser}
                  districts={districts}
                  allProblems={problems}
                  onProblemCreated={handleProblemCreated}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}

              {activeNav === 'government' && (
                <GovernmentCommandView
                  currentUser={currentUser}
                  problems={problems}
                  projects={projects}
                  districts={districts}
                  blueprints={blueprints}
                  analytics={analytics}
                  onProblemUpdated={handleProblemUpdated}
                  onProjectUpdated={handleProjectUpdated}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  onNavigate={(tab) => setActiveNav(tab as any)}
                  lang={lang}
                />
              )}

              {activeNav === 'university' && (
                <UniversityWorkspaceView
                  currentUser={currentUser}
                  problems={problems}
                  projects={projects}
                  onProjectUpdated={handleProjectUpdated}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}

              {activeNav === 'industry' && (
                <IndustryPortalView
                  currentUser={currentUser}
                  projects={projects}
                  onProjectUpdated={handleProjectUpdated}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}

              {activeNav === 'lifecycle' && (
                <LifecycleTrackerView
                  currentUser={currentUser}
                  projects={projects}
                  allProblems={problems}
                  onProjectUpdated={handleProjectUpdated}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}

              {activeNav === 'impact' && (
                <ImpactAndReuseView
                  currentUser={currentUser}
                  projects={projects}
                  blueprints={blueprints}
                  districts={districts}
                  onSelectReplication={handleSelectReplication}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}

              {activeNav === 'map' && (
                <JharkhandMapView
                  districts={districts}
                  problems={problems}
                  projects={projects}
                  blueprints={blueprints}
                  onSelectDistrictFilter={(districtName) => {
                    setActiveNav('government');
                  }}
                  onNavigate={(tab) => setActiveNav(tab as any)}
                  onOpenGoldenDemo={() => setIsGoldenDemoOpen(true)}
                  lang={lang}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Global Footer */}
      <Footer lang={lang} />

      {/* Multi-Platform Auth & SSO Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        lang={lang}
        defaultRole={currentUser.role}
      />

      {/* 10-Step Golden Demo Walkthrough Modal */}
      <GoldenDemoModal
        isOpen={isGoldenDemoOpen}
        onClose={() => setIsGoldenDemoOpen(false)}
        onNavigate={(tab) => {
          setActiveNav(tab as any);
        }}
        lang={lang}
      />
    </div>
  );
}
