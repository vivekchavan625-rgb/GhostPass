import React, { useState, useEffect, useRef } from 'react';
import { useRouter, RoutePath } from '../context/RouterContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks: { route: RoutePath; label: string }[] = [
    { route: 'home', label: 'Home' },
    { route: 'workspace', label: 'Workspace' },
    { route: 'insights', label: 'Insights' },
    { route: 'privacy', label: 'Privacy' },
    { route: 'audit', label: 'Audit' },
    { route: 'evaluate', label: 'Evaluate' },
    { route: 'about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#070a14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="#home"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg p-1"
          >
            <Logo size={32} />
          </a>
          <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-400 font-semibold">
            v0.1.0 • client-side
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <a
                key={link.route}
                href={`#${link.route}`}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Theme toggle & mobile menu trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('workspace')}
            className="hidden sm:inline-flex"
          >
            Sanitize
          </Button>

          <button
            ref={hamburgerRef}
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile navigation"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1"
        >
          {navLinks.map((link) => (
            <a
              key={link.route}
              href={`#${link.route}`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={currentRoute === link.route ? 'page' : undefined}
              className={`block px-3 py-2 rounded-md text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                currentRoute === link.route
                  ? 'bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
};
