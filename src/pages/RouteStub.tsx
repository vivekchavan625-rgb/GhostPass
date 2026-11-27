import React from 'react';
import { Card } from '../components/ui/Card';

interface SimpleRouteProps {
  title: string;
  badge: string;
  description: string;
  comingInSprint3?: boolean;
}

export const RouteStub: React.FC<SimpleRouteProps> = ({
  title,
  badge,
  description,
  comingInSprint3 = true,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-4">
        <span>{badge}</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">{description}</p>

      {comingInSprint3 && (
        <Card variant="elevated" className="border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
          <p className="text-sm font-mono text-teal-600 dark:text-teal-400">
            Coming in next sprint (Sprint 3 — Security, Privacy & Audit Guarantees)
          </p>
        </Card>
      )}
    </div>
  );
};
