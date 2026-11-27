import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 32,
  showWordmark = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Inline SVG Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-all duration-300 logo-shimmer"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C5CFF" />
            <stop offset="100%" stopColor="#22E3FF" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shield Border */}
        <path
          d="M50 8 L85 24 V50 C85 72 50 92 50 92 C50 92 15 72 15 50 V24 Z"
          fill="url(#logoGrad)"
          fillOpacity="0.12"
          stroke="url(#logoGrad)"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Ghost Shape with Wavy Bottom */}
        <path
          d="M34 52 C34 42 41 35 50 35 C59 35 66 42 66 52 V64 C66 64 62.5 62 59.5 64 C56.5 66 53.5 64 50 64 C46.5 64 43.5 66 40.5 64 C37.5 62 34 64 34 64 Z"
          fill="url(#logoGrad)"
        />

        {/* Ghost Eyes */}
        <circle cx="44" cy="46" r="3" fill="#070A14" />
        <circle cx="56" cy="46" r="3" fill="#070A14" />

        {/* Keyhole slot */}
        <path d="M48 51 H52 L53.5 58 H46.5 Z" fill="#070A14" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center">
          <span>Ghost</span>
          <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            Pass
          </span>
        </span>
      )}
    </div>
  );
};
