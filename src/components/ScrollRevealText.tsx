import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Trophy, Lightbulb, Users } from 'lucide-react';

interface ScrollRevealTextProps {
  text: string;
  subtext?: string;
  lang?: 'en' | 'hi';
}

export const ScrollRevealText: React.FC<ScrollRevealTextProps> = ({ 
  text, 
  subtext,
  lang = 'en' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Split text into words
  const words = text.split(" ");

  // Create subtle parallax offsets for ambient decorative icons
  const iconY1 = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const iconY2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const iconRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const iconScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.8]);

  return (
    <div 
      ref={containerRef} 
      className="relative my-16 py-12 px-6 overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 text-center"
    >
      {/* Decorative Parallax Background Elements */}
      <motion.div 
        style={{ y: iconY1, rotate: iconRotate, scale: iconScale }}
        className="absolute left-6 top-12 text-orange-500/20 pointer-events-none"
      >
        <Sparkles className="w-12 h-12" />
      </motion.div>

      <motion.div 
        style={{ y: iconY2, rotate: iconRotate, scale: iconScale }}
        className="absolute right-8 bottom-12 text-emerald-500/20 pointer-events-none"
      >
        <Lightbulb className="w-10 h-10" />
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-orange-400">
          <Trophy className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'हमारा दृष्टिकोण' : 'Our Unified Vision'}</span>
        </div>

        {/* Word-by-word reveal text */}
        <div className="flex flex-wrap justify-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-relaxed px-4">
          {words.map((word, wordIndex) => {
            // Distribute the animation windows across the scroll progression
            const totalWords = words.length;
            const start = (wordIndex / totalWords) * 0.6 + 0.1; // active during middle scroll
            const end = start + 0.25;

            return (
              <Word 
                key={wordIndex} 
                word={word} 
                progress={scrollYProgress} 
                range={[start, end]} 
              />
            );
          })}
        </div>

        {/* Dynamic subtext fade-in */}
        {subtext && (
          <motion.p 
            style={{ 
              opacity: useTransform(scrollYProgress, [0.3, 0.6], [0, 1]),
              y: useTransform(scrollYProgress, [0.3, 0.6], [15, 0])
            }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mt-4"
          >
            {subtext}
          </motion.p>
        )}
      </div>

      {/* Elegant horizontal grid line accents that react to scroll */}
      <motion.div 
        style={{ 
          scaleX: useTransform(scrollYProgress, [0.1, 0.8], [0, 1]),
          opacity: useTransform(scrollYProgress, [0.1, 0.5, 0.8], [0, 1, 0])
        }}
        className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"
      />
    </div>
  );
};

interface WordProps {
  word: string;
  progress: any;
  range: [number, number];
}

const Word: React.FC<WordProps> = ({ word, progress, range }) => {
  // Use non-linear transforms for a beautiful, punchy entrance effect
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [15, 0]);
  const scale = useTransform(progress, range, [0.93, 1]);
  const color = useTransform(
    progress,
    [range[0], (range[0] + range[1]) / 2, range[1]],
    ['rgba(255, 255, 255, 0.15)', 'rgba(249, 115, 22, 1)', 'rgba(255, 255, 255, 1)'] // flashes orange during transition for active state highlight!
  );

  return (
    <motion.span 
      style={{ opacity, y, scale, color }}
      className="inline-block mr-2.5 mb-1.5 cursor-default select-none"
    >
      {word}
    </motion.span>
  );
};
