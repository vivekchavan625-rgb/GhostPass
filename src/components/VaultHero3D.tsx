import React, { useRef, useEffect } from 'react';
import { CATEGORY_CONFIG } from './ui/Chip';
import { EntityCategory } from '../engine/types';

const DETECTOR_KEYS: EntityCategory[] = [
  'email',
  'phone',
  'ipv4',
  'pan',
  'aadhaar',
  'credit-card',
];

export const VaultHero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Subtle mouse-parallax tilt via CSS Custom Properties on element.style
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      lastX = x;
      lastY = y;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const tiltX = -lastY * 20; // max 10 deg
          const tiltY = lastX * 24;  // max 12 deg
          el.style.setProperty('--mouse-tilt-x', `${tiltX}deg`);
          el.style.setProperty('--mouse-tilt-y', `${tiltY}deg`);
          rafId = null;
        });
      }
    };

    const handleMouseLeave = () => {
      el.style.setProperty('--mouse-tilt-x', '0deg');
      el.style.setProperty('--mouse-tilt-y', '0deg');
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[340px] sm:max-w-[420px] h-[340px] sm:h-[400px] mx-auto flex items-center justify-center select-none"
      style={{
        perspective: '1000px',
      }}
      aria-label="3D Vault visualization representing zero-trust encryption"
    >
      {/* 3D Scene Wrapper with mouse tilt */}
      <div
        className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center preserve-3d transition-transform duration-300 ease-out"
        style={{
          transform: 'rotateX(var(--mouse-tilt-x, 0deg)) rotateY(var(--mouse-tilt-y, 0deg))',
        }}
      >
        {/* Core Vault / Shield */}
        <div className="absolute inset-0 flex items-center justify-center preserve-3d animate-vault-spin">
          {/* Back Shield Plate */}
          <div
            className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 border-2 border-violet-500/40 backdrop-blur-sm shadow-[0_0_35px_rgba(124,92,255,0.25)] flex items-center justify-center"
            style={{ transform: 'translateZ(-20px)' }}
          >
            <div className="w-20 h-20 rounded-full border border-violet-400/30 border-dashed animate-spin" style={{ animationDuration: '30s' }} />
          </div>

          {/* Front Shield Plate with Keyhole */}
          <div
            className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-tr from-[#0d1222]/90 to-[#141c34]/90 border-2 border-cyan-400/50 shadow-2xl flex flex-col items-center justify-center"
            style={{ transform: 'translateZ(20px)' }}
          >
            {/* Shield Keyhole Motif */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <span className="text-xl">🛡️</span>
            </div>
            <span className="mt-2 text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400">
              ZERO-TRUST
            </span>
          </div>
        </div>

        {/* Orbiting Detector Chips (Pure CSS 3D Transforms) */}
        {DETECTOR_KEYS.map((cat, idx) => {
          const conf = CATEGORY_CONFIG[cat];
          const orbitClass = `animate-orbit-${idx + 1}`;

          return (
            <div
              key={cat}
              className={`absolute preserve-3d ${orbitClass}`}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider border shadow-md backdrop-blur-md bg-white/95 dark:bg-[#0d1222]/95 border-violet-500/40 text-slate-800 dark:text-slate-100 hover:scale-110 transition-transform">
                <span aria-hidden="true">{conf.icon}</span>
                <span>{conf.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
