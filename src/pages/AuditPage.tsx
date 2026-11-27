import React, { useState, useEffect } from 'react';
import { auditStore, AuditEvent, DETECTION_RULE_VERSION } from '../audit';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { useToast } from '../components/ui/Toast';
import promptLogText from '../../docs/PROMPT_LOG.md?raw';

export const AuditPage: React.FC = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<AuditEvent[]>(() => auditStore.getEvents());
  const [selectedType, setSelectedType] = useState<string>('all');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'prompts'>('audit');

  useEffect(() => {
    return auditStore.subscribe(() => {
      setEvents(auditStore.getEvents());
    });
  }, []);

  const filteredEvents = events.filter((e) =>
    selectedType === 'all' ? true : e.type === selectedType
  );

  const handleDownloadAudit = () => {
    const jsonStr = auditStore.exportAuditJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghostpass_audit_log_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Audit log exported safely', 'success');
  };

  const handleClearLog = () => {
    auditStore.clearLog();
    setConfirmClearOpen(false);
    toast('Audit log cleared from memory', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Audit & Prompt Log
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Rule Version: <strong className="font-mono text-teal-500">v{DETECTION_RULE_VERSION}</strong> • Session memory only. Never records document text, filenames, or sensitive values.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-teal-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Runtime Session Audit ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'prompts'
                ? 'bg-white dark:bg-slate-900 text-teal-500 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Development Prompt Log
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Filter:</span>
              {(['all', 'sanitize', 'export', 'privacy', 'memory-clear'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                    selectedType === t
                      ? 'bg-teal-500 text-slate-950 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAudit}
                disabled={events.length === 0}
              >
                📥 Download JSON
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmClearOpen(true)}
                disabled={events.length === 0}
              >
                🧹 Clear Log
              </Button>
            </div>
          </div>

          {/* Table */}
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
              No audit events recorded for current session yet. Actions performed in the workspace will appear here.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                    <th className="px-3 py-2.5">TIMESTAMP</th>
                    <th className="px-3 py-2.5">TYPE</th>
                    <th className="px-3 py-2.5">MODE</th>
                    <th className="px-3 py-2.5">DETECTED</th>
                    <th className="px-3 py-2.5">REDACTED</th>
                    <th className="px-3 py-2.5">REJECTED</th>
                    <th className="px-3 py-2.5">DURATION</th>
                    <th className="px-3 py-2.5">EXPORT DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {filteredEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 font-bold text-teal-600 dark:text-teal-400">
                        {evt.type.toUpperCase()}
                      </td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                        {evt.mode ?? '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                        {evt.detectedCount !== undefined ? evt.detectedCount : '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-800 dark:text-slate-200">
                        {evt.redactedCount !== undefined ? evt.redactedCount : '-'}
                      </td>
                      <td className="px-3 py-2 text-amber-500">
                        {evt.rejectedCount !== undefined ? evt.rejectedCount : '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {evt.durationMs !== undefined ? `${evt.durationMs}ms` : '-'}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {evt.exportType ? `${evt.exportType.toUpperCase()} (${evt.exportBytes} B)` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Development Prompt Log Tab */
        <Card className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto">
            {promptLogText}
          </pre>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear In-Memory Audit Log?"
        description="This will erase all recorded session audit events from volatile memory."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setConfirmClearOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearLog}>
            Clear Log
          </Button>
        </div>
      </Dialog>
    </div>
  );
};
