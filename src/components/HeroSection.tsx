import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Sparkles, Trophy, ArrowRight, Eye, ShieldCheck, HeartPulse } from "lucide-react";

interface HeroSectionProps {
  onStartTrial: () => void;
  onExploreFeatures: () => void;
}

export default function HeroSection({ onStartTrial, onExploreFeatures }: HeroSectionProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse tracking for the golden cat paw
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientWidth, clientHeight } = document.documentElement;
      const x = (e.clientX - clientWidth / 2) / 30;
      const y = (e.clientY - clientHeight / 2) / 30;
      setMousePos({ x, y });
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-brand-matte text-brand-warm py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient gold glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Sparkles & Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-10% w-2 h-2 bg-brand-gold rounded-full animate-ping duration-1000" />
        <div className="absolute top-1/2 right-[15%] w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-[20%] w-2 h-2 bg-brand-emerald rounded-full animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto text-center z-10 flex flex-col items-center">
        {/* Luxury Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-brand-gold/20 text-xs tracking-widest text-brand-gold font-display uppercase mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-gold" />
          The World's First AI Cat Ecosystem
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]"
        >
          Everything Your Cat Needs. <br />
          <span className="bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold bg-clip-text text-transparent">
            Powered by AI.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-neutral-400 font-sans max-w-2xl mb-10 leading-relaxed font-light"
        >
          Welcome to <span className="text-brand-gold font-medium">PurrVerse AI</span>. A premium ecosystem designed to personalize nutrition, predict healthcare, map veterinary services, foster community, and recreate your specific cat as a custom virtual companion.
        </motion.p>

        {/* Interactive Floating 3D Gold-Glow Paw */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, delay: 0.3 }}
          className="relative w-72 h-72 my-8 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            x: smoothX,
            y: smoothY,
          }}
        >
          {/* Subtle Outer Glow Wave */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-gold/10 to-transparent blur-2xl animate-pulse-slow" />
          
          {/* Glowing Ring */}
          <motion.div 
            animate={{ scale: isHovered ? 1.15 : 1.0 }}
            className="absolute inset-4 rounded-full border border-brand-gold/25 bg-neutral-950/80 shadow-[0_0_50px_rgba(214,175,55,0.15)] flex items-center justify-center backdrop-blur-md"
          >
            {/* The Paw Symbol created using SVG and stylized luxury gold gradient */}
            <svg
              viewBox="0 0 100 100"
              className="w-40 h-40 drop-shadow-[0_0_15px_rgba(214,175,55,0.4)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF1B0" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
              </defs>
              
              {/* Center Main Pad */}
              <motion.path
                d="M33,62 C33,52 42,47 50,47 C58,47 67,52 67,62 C67,73 59,78 50,78 C41,78 33,73 33,62 Z"
                fill="url(#gold-grad)"
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              />
              
              {/* Left Toe */}
              <motion.circle
                cx="24"
                cy="44"
                r="9"
                fill="url(#gold-grad)"
                animate={{ y: isHovered ? -5 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.02 }}
              />
              
              {/* Mid-Left Toe */}
              <motion.circle
                cx="41"
                cy="31"
                r="10.5"
                fill="url(#gold-grad)"
                animate={{ y: isHovered ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.05 }}
              />

              {/* Mid-Right Toe */}
              <motion.circle
                cx="59"
                cy="31"
                r="10.5"
                fill="url(#gold-grad)"
                animate={{ y: isHovered ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.08 }}
              />

              {/* Right Toe */}
              <motion.circle
                cx="76"
                cy="44"
                r="9"
                fill="url(#gold-grad)"
                animate={{ y: isHovered ? -5 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 }}
              />
            </svg>
          </motion.div>

          {/* Interactive Mouse Hover Hint */}
          <span className="absolute bottom-1 bg-brand-matte border border-brand-gold/30 text-[10px] tracking-widest uppercase font-mono px-3 py-1 rounded-full text-brand-gold shadow-lg opacity-80 pointer-events-none">
            Interact
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 w-full max-w-md"
        >
          <button
            onClick={onStartTrial}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-gold hover:bg-yellow-500 text-brand-matte font-display font-semibold tracking-wide transition-all duration-300 shadow-[0_4px_20px_rgba(214,175,55,0.3)] flex items-center justify-center gap-2 cursor-pointer group"
          >
            Start Free 3-Day Trial
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={onExploreFeatures}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900 hover:bg-neutral-800 text-brand-warm border border-neutral-800 font-display font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-brand-gold" />
            Explore Ecosystem
          </button>
        </motion.div>

        {/* Key USPs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-neutral-900 w-full text-left"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 border border-brand-gold/15">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-brand-warm">Luxury Pet Care</p>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">Premium curated features</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 border border-brand-gold/15">
              <Sparkles className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-brand-warm">AI Cloning Engine</p>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">Simulate your own cat</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 border border-brand-gold/15">
              <HeartPulse className="w-5 h-5 text-brand-emerald" />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-brand-warm">Health Analytics</p>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">Symptom checker & stats</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-neutral-900 border border-brand-gold/15">
              <Trophy className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold font-display text-brand-warm">Premium Market</p>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">Top-tier cat utilities</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
