import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
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
      <Footer />
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
