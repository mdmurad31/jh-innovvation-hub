import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ArrowRight, MapPin, Lightbulb, Sparkles, Cpu, Layers, Globe } from 'lucide-react';

interface LandingScrollExperienceProps {
  lang: 'en' | 'hi';
  onReportProblem: () => void;
  onExploreSolutions: () => void;
  renderHeroStage?: () => React.ReactNode;
}

export const LandingScrollExperience: React.FC<LandingScrollExperienceProps> = ({
  lang,
  onReportProblem,
  onExploreSolutions,
  renderHeroStage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll tracking for parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Soft spring physics for buttery-smooth animations
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 100,
    mass: 0.5
  });

  // Parallax transformations for background glows
  const glowY1 = useTransform(smoothProgress, [0, 1], [0, -150]);
  const glowY2 = useTransform(smoothProgress, [0, 1], [0, 150]);
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.05]);

  // Transform elements in the text container
  const heroOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.4], [1, 0.95]);
  const heroY = useTransform(smoothProgress, [0, 0.4], [0, -50]);

  // Let's create an elegant text split animation for the title
  const titleText = lang === 'hi' 
    ? 'समुदाय की समस्याओं से वास्तविक समाधान तक' 
    : 'From Community Problems to Real-World Solutions';
  const titleWords = titleText.split(" ");

  return (
    <div ref={containerRef} className="relative w-full space-y-16">
      {/* PARALLAX HERO CONTAINER */}
      <div className="relative mt-4 sm:mt-6 min-h-[90vh] lg:min-h-[95vh] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
          
          {/* Animated Background Canvas & Grid */}
          <motion.div 
            style={{ scale: bgScale }}
            className="absolute inset-0 pointer-events-none opacity-60 overflow-hidden flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]" />
          </motion.div>

          {/* Jharkhand Map PNG Overlay - Fixed size black map silhouette with shining glowing border */}
          <motion.div
            initial={{ opacity: 0, scale: 1.25 }}
            animate={{ opacity: 0.95, scale: 1.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden flex items-center justify-center p-0 sm:p-2"
          >
            <img
              src="/jharkhand_map_transparent.png"
              alt="Jharkhand Black Map Silhouette Overlay"
              style={{
                filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 12px rgba(251, 191, 36, 0.85)) drop-shadow(0 0 32px rgba(249, 115, 22, 0.65))'
              }}
              className="w-full h-full object-contain pointer-events-none"
            />
          </motion.div>

          {/* Parallax Glowing Accents */}
          <motion.div 
            style={{ y: glowY1 }}
            className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div 
            style={{ y: glowY2 }}
            className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none"
          />

          {/* Floating Technology Badges on the sides for desktop */}
          <div className="absolute inset-0 hidden lg:block pointer-events-none overflow-hidden">
            <motion.div 
              style={{ y: useTransform(smoothProgress, [0, 1], [40, -100]) }}
              className="absolute left-[8%] top-[25%] px-4 py-2 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center gap-2.5 shadow-lg"
            >
              <Cpu className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-semibold text-slate-300">IoT Level Sensors</span>
            </motion.div>
            
            <motion.div 
              style={{ y: useTransform(smoothProgress, [0, 1], [-20, 120]) }}
              className="absolute right-[8%] top-[20%] px-4 py-2 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center gap-2.5 shadow-lg"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Drizzle ORM Engine</span>
            </motion.div>

            <motion.div 
              style={{ y: useTransform(smoothProgress, [0, 1], [10, -80]) }}
              className="absolute left-[12%] bottom-[20%] px-4 py-2 bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center gap-2.5 shadow-lg"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">24 Districts Tracked</span>
            </motion.div>
          </div>

          {/* Core Hero Content */}
          <motion.div 
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
            className="relative z-10 max-w-4xl mx-auto text-center space-y-8 py-8"
          >
            {/* Tag Badge */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/95 border border-slate-700/80 text-slate-200 text-xs font-semibold shadow-inner"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span>{lang === 'hi' ? 'झारखंड राज्य नवाचार मंच' : 'Jharkhand State Innovation Platform'}</span>
            </motion.div>

            {/* Hero Headline Typography - Optimized single hardware-accelerated animation */}
            <motion.h1 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.125] max-w-3xl mx-auto"
            >
              {lang === 'hi' 
                ? 'झारखंड की नागरिक चुनौतियों का डिजिटल और वैज्ञानिक समाधान'
                : 'Bridging Citizen Challenges with University Innovation & Impact'}
            </motion.h1>

            {/* Subtitle with fast crisp entrance */}
            <motion.p 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg lg:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed"
            >
              {lang === 'hi'
                ? 'नागरिकों, राज्य सरकार के अधिकारियों, विश्वविद्यालयों और उद्योग भागीदारों को जोड़कर वास्तविक स्थानीय चुनौतियों का पारदर्शी समाधान।'
                : 'A unified state platform connecting citizens reporting local challenges with government prioritization, university research, and industry co-funding.'}
            </motion.p>

            {/* CTA buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={onReportProblem}
                className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl shadow-lg hover:shadow-orange-600/25 transition-all duration-200 flex items-center justify-center gap-2 border border-orange-500/20"
              >
                <MapPin className="w-4 h-4" />
                <span>{lang === 'hi' ? 'समस्या दर्ज करें' : 'REPORT A PROBLEM'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={onExploreSolutions}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 font-semibold text-sm rounded-xl border border-slate-700/80 hover:border-slate-500 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Lightbulb className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{lang === 'hi' ? 'समाधान खोजें' : 'EXPLORE SOLUTIONS'}</span>
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* PARALLAX INTERACTIVE ARCHITECTURE SECTION */}
        {renderHeroStage && (
          <div className="relative mt-12">
            {renderHeroStage()}
          </div>
        )}
      </div>
  );
};
