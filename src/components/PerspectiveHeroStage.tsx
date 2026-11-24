/**
 * PerspectiveHeroStage.tsx
 * 3D Skewed Perspective Cards & Subtle Parallax Hover Stage
 * JH Innovation Hub - Societal Transformation Architecture
 */

import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Cpu,
  Eye,
  Layers,
  MapPin,
  Play,
  RotateCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useRef, useState } from 'react';
import { translations } from '../lib/i18n';

interface PerspectiveHeroStageProps {
  onNavigate: (tabId: string, param?: string) => void;
  onOpenGoldenDemo: () => void;
  lang: 'en' | 'hi';
}

export const PerspectiveHeroStage: React.FC<PerspectiveHeroStageProps> = ({
  onNavigate,
  onOpenGoldenDemo,
  lang,
}) => {
  const t = translations[lang];
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax tilt angles
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState<0 | 1 | 2>(0);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1
    // Controlled tilt angles: max ~7 degrees
    const rotateY = (x - 0.5) * 14;
    const rotateX = -(y - 0.5) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Card definitions
  const cards = [
    {
      id: 0,
      phase: lang === 'hi' ? 'चरण ०१: नागरिक मांग' : 'Phase 01: Citizen Intake',
      title: lang === 'hi' ? 'बुंडू नदी स्वचालित स्लुइस गेट' : 'Bundu River IoT Sluice Sentry',
      category: lang === 'hi' ? 'आपदा प्रबंधन / जल अवसंरचना' : 'Disaster Prevention / Water Infra',
      badge: lang === 'hi' ? '८७/१०० गंभीरता' : '87/100 Severity',
      badgeColor: 'bg-orange-600 text-white',
      location: 'Bundu, Ranchi (23.1678° N, 85.5891° E)',
      impact: lang === 'hi' ? '१४,२०० नागरिक सुरक्षित' : '14,200 Citizens Safeguarded',
      status: lang === 'hi' ? 'आईएएस अधिकारी द्वारा सत्यापित' : 'Verified by District IAS',
      actionLabel: lang === 'hi' ? 'नागरिक पोर्टल देखें' : 'View Citizen Portal',
      targetNav: 'citizen',
      accentBorder: 'border-orange-500',
    },
    {
      id: 1,
      phase: lang === 'hi' ? 'चरण ०२: एआई व अकादमिक मिलान' : 'Phase 02: AI & HEI Match',
      title: 'BIT Mesra (Civil & Remote Sensing)',
      category: lang === 'hi' ? 'जेमिनी ३.८ फ़्लैश विश्लेषण' : 'Gemini 3.8 Flash Prioritization',
      badge: lang === 'hi' ? '९१% संकाय मिलान' : '91% Match Score',
      badgeColor: 'bg-emerald-600 text-white',
      location: 'BIT Mesra Innovation Lab, Ranchi',
      impact: lang === 'hi' ? '५ बहु-विषयक छात्र दल' : '5 Multidisciplinary Leads Assigned',
      status: lang === 'hi' ? 'प्रोटोटाइप विकास जारी' : 'Hardware Telemetry Pilot in Progress',
      actionLabel: lang === 'hi' ? 'विश्वविद्यालय हब देखें' : 'View HEI Workspace',
      targetNav: 'university',
      accentBorder: 'border-emerald-500',
    },
    {
      id: 2,
      phase: lang === 'hi' ? 'चरण ०३: उद्योग व तैनाती' : 'Phase 03: CSR & State SLA',
      title: 'Tata Steel Foundation & CSR Lab',
      category: lang === 'hi' ? '४५-दिवसीय राज्य एसएलए' : '45-Day State SLA Deployment',
      badge: '₹12.5L CO-FUNDED',
      badgeColor: 'bg-indigo-600 text-white',
      location: 'East Singhbhum & Ranchi Corridor',
      impact: lang === 'hi' ? 'दुमका व बोकारो में पुनर्उपयोग' : 'Ready for Replication in Dumka',
      status: lang === 'hi' ? 'क्षेत्रीय तैनाती सक्रिय' : 'Live Field Deployment Active',
      actionLabel: lang === 'hi' ? 'सीएसआर सिंडिकेट देखें' : 'View Industry Portal',
      targetNav: 'industry',
      accentBorder: 'border-indigo-500',
    },
  ];

  return (
    <div className="w-full flex flex-col justify-between h-full bg-[#0D1117] text-white p-6 sm:p-8 select-none relative overflow-hidden border-t-2 lg:border-t-0 border-slate-300">
      {/* Background Dimensional Perspective Grid Lines */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Header: 3D Stage Info & Card Tabs */}
      <div className="relative z-20 space-y-3 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
              {lang === 'hi' ? '3D सामाजिक रूपांतरण मंच' : '3D Societal Impact Stage'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 border border-slate-700 px-2 py-0.5 uppercase tracking-wider">
            {isHovered ? (lang === 'hi' ? 'इंटरैक्टिव झुकाव' : 'PARALLAX ACTIVE') : (lang === 'hi' ? 'माउस से हिलाएं' : 'HOVER TO TILT')}
          </span>
        </div>

        {/* 3-Tab Card Switcher */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 border border-slate-700">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              id={`stage-card-tab-${idx}`}
              onClick={() => setActiveCard(idx as 0 | 1 | 2)}
              className={`py-1.5 px-2 text-[10px] font-black uppercase tracking-wider transition text-center truncate ${
                activeCard === idx
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {`0${idx + 1}. `}
              {idx === 0
                ? (lang === 'hi' ? 'नागरिक मांग' : 'Intake')
                : idx === 1
                ? (lang === 'hi' ? 'एआई व विश्वविद्यालय' : 'AI & HEI')
                : (lang === 'hi' ? 'सीएसआर व एसएलए' : 'CSR & SLA')}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Perspective Stage Viewport */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={handlePointerLeave}
        className="relative my-4 w-full h-[330px] flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{ perspective: '1100px' }}
      >
        {/* Tilting 3D Parent Canvas */}
        <motion.div
          className="relative w-full max-w-[420px] h-[260px]"
          animate={{
            rotateX: tilt.x,
            rotateY: tilt.y,
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24,
            mass: 0.6,
          }}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Floating Dimension Pill (Top Left - translateZ 55px) */}
          <motion.div
            className="absolute -top-5 -left-2 z-30 bg-black/90 text-white border border-slate-700 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl backdrop-blur-sm pointer-events-none"
            style={{
              transform: 'translateZ(55px)',
            }}
          >
            <Sparkles className="w-3 h-3 text-orange-400" />
            <span>{lang === 'hi' ? '२४ ज़िले जुड़े हैं' : '24 Districts Monitored'}</span>
          </motion.div>

          {/* Floating SLA Badge (Bottom Right - translateZ 65px) */}
          <motion.div
            className="absolute -bottom-4 -right-2 z-30 bg-orange-600 text-white border border-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-2xl pointer-events-none"
            style={{
              transform: 'translateZ(65px)',
            }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>{lang === 'hi' ? 'सत्यापित राज्य एसएलए ९८.४%' : 'State SLA: 98.4% On-Time'}</span>
          </motion.div>

          {/* Render 3 Layered Skewed Perspective Cards */}
          {cards.map((card, index) => {
            // Determine visual depth and offset based on activeCard
            const relativeIdx = (index - activeCard + 3) % 3;
            // relativeIdx: 0 = primary/foreground, 1 = middle, 2 = deep background

            let zTranslate = 35;
            let yTranslate = 0;
            let xTranslate = 0;
            let rotateZ = -1.5;
            let scale = 1;
            let opacity = 1;
            let pointerEvents = 'auto';

            if (relativeIdx === 0) {
              zTranslate = 42;
              yTranslate = 0;
              xTranslate = 0;
              rotateZ = -1;
              scale = 1;
              opacity = 1;
              pointerEvents = 'auto';
            } else if (relativeIdx === 1) {
              zTranslate = 14;
              yTranslate = 20;
              xTranslate = 14;
              rotateZ = 2;
              scale = 0.96;
              opacity = 0.78;
              pointerEvents = 'auto';
            } else {
              zTranslate = -14;
              yTranslate = 38;
              xTranslate = 28;
              rotateZ = 4.5;
              scale = 0.92;
              opacity = 0.55;
              pointerEvents = 'auto';
            }

            return (
              <motion.div
                key={card.id}
                onClick={() => setActiveCard(card.id as 0 | 1 | 2)}
                className={`absolute inset-0 bg-[#161B22] border-2 ${
                  relativeIdx === 0
                    ? `${card.accentBorder} shadow-[0_20px_45px_rgba(0,0,0,0.85)]`
                    : 'border-slate-700 shadow-[0_12px_30px_rgba(0,0,0,0.6)]'
                } p-5 flex flex-col justify-between transition-colors duration-200 cursor-pointer`}
                style={{
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  transform: `translateZ(${zTranslate}px) translateY(${yTranslate}px) translateX(${xTranslate}px) rotateZ(${rotateZ}deg) scale(${scale})`,
                  opacity,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 26,
                }}
                whileHover={
                  relativeIdx === 0
                    ? {
                        scale: 1.02,
                        transform: `translateZ(50px) translateY(${yTranslate - 4}px) translateX(${xTranslate}px) rotateZ(0deg)`,
                      }
                    : undefined
                }
              >
                {/* Card Top Strip */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {card.phase}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight leading-snug line-clamp-2">
                    {card.title}
                  </h3>

                  <p className="text-[11px] font-bold text-orange-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    <span>{card.category}</span>
                  </p>
                </div>

                {/* Card Bottom Inset Spec */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span className="truncate max-w-[190px]">{card.location}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">{card.impact}</span>
                    <span className="text-emerald-400 font-mono font-black flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {card.status}
                    </span>
                  </div>

                  {/* Direct Link on Primary Card */}
                  {relativeIdx === 0 && (
                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(card.targetNav);
                        }}
                        className="flex-1 py-1.5 bg-white hover:bg-slate-200 text-black text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
                      >
                        <span>{card.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenGoldenDemo();
                        }}
                        className="py-1.5 px-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition"
                        title="Open 10-Step Interactive Demo"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span className="hidden sm:inline">{lang === 'hi' ? 'डेमो' : 'DEMO'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
