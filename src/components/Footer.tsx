import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#070a14]/80 backdrop-blur-md transition-colors py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="space-y-2 max-w-md">
            <Logo size={28} />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              GhostPass — Document contents are processed locally and never transmitted. Pure client-side zero-trust PII sanitization.
            </p>
          </div>

          {/* Quick Nav Links */}
          <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <a href="#home" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Home
            </a>
            <a href="#workspace" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Workspace
            </a>
            <a href="#privacy" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              Privacy
            </a>
            <a href="#about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              About
            </a>
            <a
              href="https://github.com/vivekchavan625-rgb/GhostPass"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-1"
            >
              GitHub ↗
            </a>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span>Developed by <strong className="text-slate-700 dark:text-slate-200 font-semibold">Vivek Chavan</strong></span>
            <span className="hidden sm:inline">•</span>
            <a
              href="mailto:vivek.chavan.dev@gmail.com"
              className="text-teal-600 dark:text-teal-400 hover:underline font-mono"
            >
              Contact Developer
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>© 2026 GhostPass. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
