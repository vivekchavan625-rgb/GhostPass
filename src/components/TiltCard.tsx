import React, { useRef, useEffect } from 'react';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          const tiltX = -y * 12; // max 6 deg
          const tiltY = x * 14;  // max 7 deg
          el.style.setProperty('--card-tilt-x', `${tiltX}deg`);
          el.style.setProperty('--card-tilt-y', `${tiltY}deg`);
          rafId = null;
        });
      }
    };

    const handleMouseLeave = () => {
      el.style.setProperty('--card-tilt-x', '0deg');
      el.style.setProperty('--card-tilt-y', '0deg');
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
      ref={cardRef}
      className={`rounded-2xl p-6 bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-slate-800/80 shadow-md hover:shadow-xl hover:border-violet-500/40 transition-all duration-200 ease-out preserve-3d ${className}`}
      style={{
        transform: 'perspective(800px) rotateX(var(--card-tilt-x, 0deg)) rotateY(var(--card-tilt-y, 0deg))',
      }}
      {...props}
    >
      {children}
    </div>
  );
};
