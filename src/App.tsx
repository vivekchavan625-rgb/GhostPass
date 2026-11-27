import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { InsightsPage } from './pages/InsightsPage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { AuditPage } from './pages/AuditPage';
import { EvaluatePage } from './pages/EvaluatePage';
import { AboutPage } from './pages/AboutPage';

const AppContent: React.FC = () => {
  const { currentRoute } = useRouter();

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'home':
        return <LandingPage />;
      case 'workspace':
        return <WorkspacePage />;
      case 'insights':
        return <InsightsPage />;
      case 'privacy':
        return <PrivacyCenterPage />;
      case 'audit':
        return <AuditPage />;
      case 'evaluate':
        return <EvaluatePage />;
      case 'about':
        return <AboutPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-500 focus:text-slate-950 focus:font-bold focus:rounded-md"
      >
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1">
        {renderCurrentPage()}
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-[#070a14]/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">GhostPass</span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
          <span>Client-side PII sanitizer</span>
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
          <span>Document contents are processed locally and never transmitted</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </RouterProvider>
    </ThemeProvider>
  );
};
