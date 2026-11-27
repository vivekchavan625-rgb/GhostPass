import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Entity, EntityCategory, RedactionMode, SanitizeResult } from '../engine/types';
import { sanitize, clearMapping, exportMapping } from '../engine';
import { sanitizeCSV, CSVSanitizeResult } from '../engine/csv';
import { SYNTHETIC_SAMPLES, SampleData } from '../data/samples';
import { Button } from '../components/ui/Button';
import { Chip } from '../components/ui/Chip';
import { Select } from '../components/ui/Select';
import { Dialog } from '../components/ui/Dialog';
import { useToast } from '../components/ui/Toast';
import { DiffViewer } from '../components/workspace/DiffViewer';
import { EntityInspector } from '../components/workspace/EntityInspector';
import { CSVPreviewTable } from '../components/workspace/CSVPreviewTable';

const ALL_CATEGORIES: EntityCategory[] = [
  'email',
  'phone',
  'ipv4',
  'pan',
  'aadhaar',
  'credit-card',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const VALID_EXTENSIONS = ['.txt', '.csv', '.log', '.md', '.json'];

export const WorkspacePage: React.FC = () => {
  const { toast } = useToast();

  // State
  const [inputText, setInputText] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [mode, setMode] = useState<RedactionMode>('fullMask');
  const [enabledCategories, setEnabledCategories] = useState<EntityCategory[]>(ALL_CATEGORIES);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isCSV, setIsCSV] = useState(false);
  const [csvResult, setCsvResult] = useState<CSVSanitizeResult | null>(null);
  const [activeSessionFileName, setActiveSessionFileName] = useState<string | null>(null);

  // Dialog states
  const [confirmClearDocOpen, setConfirmClearDocOpen] = useState(false);
  const [confirmClearMemOpen, setConfirmClearMemOpen] = useState(false);
  const [exportWarningOpen, setExportWarningOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Debounced input value for live sanitize (250ms)
  const [debouncedText, setDebouncedText] = useState(inputText);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedText(inputText);
    }, 250);
    return () => clearTimeout(handler);
  }, [inputText]);

  // Compute Sanitization result
  const sanitizeResult: SanitizeResult = useMemo(() => {
    if (!debouncedText.trim()) {
      return {
        output: '',
        entities: [],
        stats: {
          totalEntities: 0,
          categoryCounts: {
            email: 0,
            phone: 0,
            ipv4: 0,
            pan: 0,
            aadhaar: 0,
            'credit-card': 0,
          },
          charsOriginal: 0,
          charsRedacted: 0,
          rejected: {},
        },
        durationMs: 0,
      };
    }

    if (isCSV) {
      const csvRes = sanitizeCSV(debouncedText, {
        mode,
        enabledCategories,
      });
      setCsvResult(csvRes);
    } else {
      setCsvResult(null);
    }

    return sanitize(debouncedText, {
      mode,
      enabledCategories,
      preserveMapping: mode === 'pseudonymize',
    });
  }, [debouncedText, mode, enabledCategories, isCSV]);

  // Keyboard Shortcuts (Ctrl/Cmd+Enter = sanitize now, Ctrl/Cmd+Shift+C = copy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        setDebouncedText(inputText);
        toast('Sanitized now', 'info');
      } else if (isCmdOrCtrl && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        handleCopy();
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, sanitizeResult.output]);

  // Load sample
  const handleLoadSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const sample = SYNTHETIC_SAMPLES.find((s: SampleData) => s.id === sampleId);
    if (!sample) return;

    setInputText(sample.content);
    setDebouncedText(sample.content);
    setIsCSV(sampleId === 'csv-customer-export');
    setActiveSessionFileName(sampleId === 'csv-customer-export' ? 'sample.csv' : 'sample.txt');
    toast(`Loaded sample: ${sample.title}`, 'info');
  };

  const handleResetSample = () => {
    if (selectedSampleId) {
      handleLoadSample(selectedSampleId);
    }
  };

  // Category toggle
  const toggleCategory = (cat: EntityCategory) => {
    setEnabledCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    const textToCopy = isCSV && csvResult ? csvResult.outputCSV : sanitizeResult.output;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(
      () => toast('Sanitized output copied to clipboard!', 'success'),
      () => toast('Failed to copy to clipboard', 'error')
    );
  }, [isCSV, csvResult, sanitizeResult.output, toast]);

  // Download Output
  const handleDownload = () => {
    const content = isCSV && csvResult ? csvResult.outputCSV : sanitizeResult.output;
    if (!content) return;

    const mime = isCSV ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isCSV ? 'sanitized_export.csv' : 'sanitized_output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Explicitly revoke Blob URL immediately after click
    URL.revokeObjectURL(url);
    toast('Download initiated safely (Blob URL revoked)', 'success');
  };

  // File Upload Handler (drag & drop and file input)
  const processUploadedFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext)) {
      toast(`Unsupported file extension ${ext}. Allowed: ${VALID_EXTENSIONS.join(', ')}`, 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast(`File exceeds 2 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB)`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
      setDebouncedText(text);
      setIsCSV(ext === '.csv');
      // Set filename strictly in local UI session only, never logged
      setActiveSessionFileName(file.name);
      setSelectedSampleId('');
      toast(`Loaded file: ${file.name}`, 'info');
    };
    reader.onerror = () => toast('Error reading file', 'error');
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Clear memory
  const handleClearMemory = () => {
    clearMapping();
    setDebouncedText(inputText); // Trigger re-sanitize
    setConfirmClearMemOpen(false);
    toast('Pseudonymization mapping memory cleared', 'success');
  };

  // Export mapping
  const handleExportMapping = () => {
    const mapping = exportMapping();
    const jsonStr = JSON.stringify(mapping, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pseudonym_mapping.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportWarningOpen(false);
    toast('Mapping exported. Keep this file secure!', 'warning');
  };

  // Char and word counts
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Aria-live region for screen readers */}
      <div aria-live="polite" className="sr-only">
        {sanitizeResult.stats.totalEntities} entities detected and redacted
      </div>

      {/* Top Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Left Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Load Sample"
            options={[
              { value: '', label: 'Select a sample...' },
              ...SYNTHETIC_SAMPLES.map((s: SampleData) => ({ value: s.id, label: s.title })),
            ]}
            value={selectedSampleId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLoadSample(e.target.value)}
          />

          {selectedSampleId && (
            <Button variant="ghost" size="sm" onClick={handleResetSample}>
              ↺ Reset
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClearDocOpen(true)}
            disabled={!inputText}
          >
            Clear Document
          </Button>

          {/* File Upload Button */}
          <label className="cursor-pointer">
            <span className="inline-flex items-center justify-center font-medium transition-colors rounded-md text-xs px-2.5 py-1.5 gap-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700">
              📁 Upload File
            </span>
            <input
              type="file"
              accept=".txt,.csv,.log,.md,.json"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files?.[0]) processUploadedFile(e.target.files[0]);
              }}
            />
          </label>

          {activeSessionFileName && (
            <span className="text-xs font-mono text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-1 rounded">
              📄 {activeSessionFileName}
            </span>
          )}
        </div>

        {/* Right Toolbar Controls (Redaction Mode & Memory) */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            label="Redaction Mode"
            options={[
              { value: 'fullMask', label: 'Full Mask ([REDACTED])' },
              { value: 'partialMask', label: 'Partial Mask (v***@...)' },
              { value: 'pseudonymize', label: 'Pseudonymize (USER_01)' },
            ]}
            value={mode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMode(e.target.value as RedactionMode)}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClearMemOpen(true)}
            title="Clears all pseudonym state in memory"
          >
            🧹 Clear Memory
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={mode !== 'pseudonymize'}
            onClick={() => setExportWarningOpen(true)}
            title="Download reverse mapping (Warning: contains PII links)"
          >
            📥 Export Mapping
          </Button>

          <button
            onClick={() => setShortcutsOpen(true)}
            className="p-1.5 text-xs text-slate-400 hover:text-slate-200 rounded"
            title="Keyboard Shortcuts (?)"
          >
            ⌨️
          </button>
        </div>
      </div>

      {/* Mode Note for Pseudonymization */}
      {mode === 'pseudonymize' && (
        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs flex items-center justify-between">
          <span>
            💡 <strong>Pseudonym Mode Active:</strong> Identifiers are assigned sequential tokens
            (USER_01, PHONE_01, etc.). Mappings exist in volatile memory only; clicking &quot;Clear Memory&quot; resets them.
          </span>
        </div>
      )}

      {/* Category Toggle Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
          Detectors:
        </span>
        {ALL_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            category={cat}
            count={sanitizeResult.stats.categoryCounts[cat] || 0}
            active={enabledCategories.includes(cat)}
            onClick={() => toggleCategory(cat)}
          />
        ))}
      </div>

      {/* Editor & Dropzone Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
      >
        <div className="p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>INPUT DOCUMENT (Paste or drop .txt, .csv, .log, .md, .json)</span>
          <div className="flex gap-3 font-mono">
            <span>{charCount} chars</span>
            <span>{wordCount} words</span>
            <span>{sanitizeResult.stats.totalEntities} PII found</span>
            <span className="text-teal-500 font-semibold">{sanitizeResult.durationMs}ms</span>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste sensitive text, support tickets, code, or customer records here..."
          className="w-full h-44 p-4 font-mono text-sm leading-relaxed bg-transparent resize-y text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Action bar under textarea */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 rounded-b-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              disabled={!sanitizeResult.output}
            >
              📋 Copy Sanitized
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!sanitizeResult.output}
            >
              💾 Download {isCSV ? '.csv' : '.txt'}
            </Button>
          </div>

          <span className="text-xs text-slate-500">
            Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">Ctrl+Enter</kbd> to force-sanitize
          </span>
        </div>
      </div>

      {/* Empty State */}
      {!inputText && (
        <div className="p-12 text-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-500">
          <span className="text-3xl block mb-2">📄</span>
          <p className="font-medium text-sm">No document loaded yet.</p>
          <p className="text-xs mt-1 text-slate-400">
            Paste text above, click &quot;Upload File&quot;, or select one of the 6 synthetic samples in the toolbar.
          </p>
        </div>
      )}

      {/* CSV Preview Table (if in CSV mode) */}
      {isCSV && csvResult && csvResult.rows.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            CSV Table View ({csvResult.totalCells} cells parsed)
          </h2>
          <CSVPreviewTable
            rows={csvResult.rows}
            headers={csvResult.headers}
            neutralizedCount={csvResult.neutralizedCount}
          />
        </div>
      )}

      {/* Visual Side-by-Side Diff */}
      {inputText && (
        <DiffViewer
          originalText={inputText}
          sanitizedText={sanitizeResult.output}
          entities={sanitizeResult.entities}
          mode={mode}
          onSelectEntity={(ent: Entity) => setSelectedEntity(ent)}
          selectedEntity={selectedEntity}
        />
      )}

      {/* Floating Entity Inspector */}
      <EntityInspector
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
      />

      {/* Dialog: Clear Document Confirmation */}
      <Dialog
        open={confirmClearDocOpen}
        onClose={() => setConfirmClearDocOpen(false)}
        title="Clear Current Document?"
        description="This will clear the current text from editor memory. Unsaved changes will be discarded."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setConfirmClearDocOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setInputText('');
              setDebouncedText('');
              setSelectedSampleId('');
              setActiveSessionFileName(null);
              setConfirmClearDocOpen(false);
              toast('Document cleared', 'info');
            }}
          >
            Clear Document
          </Button>
        </div>
      </Dialog>

      {/* Dialog: Clear Memory Confirmation */}
      <Dialog
        open={confirmClearMemOpen}
        onClose={() => setConfirmClearMemOpen(false)}
        title="Clear Pseudonym Memory?"
        description="This resets the in-memory map of original entities to pseudonyms (USER_01, etc.). Future sanitizations will restart counts from 01."
      >
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setConfirmClearMemOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClearMemory}>
            Reset Memory Map
          </Button>
        </div>
      </Dialog>

      {/* Dialog: Export Mapping Privacy Warning */}
      <Dialog
        open={exportWarningOpen}
        onClose={() => setExportWarningOpen(false)}
        title="⚠️ Privacy Warning: Exporting Reverse Key"
        description="You are about to export the reverse mapping table that links pseudonyms to original sensitive data. Storing this file insecurely negates anonymization benefits."
      >
        <div className="p-3 my-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
          Never upload this reverse mapping to untrusted cloud storage or public issue trackers.
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setExportWarningOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExportMapping}>
            I Understand, Download Key
          </Button>
        </div>
      </Dialog>

      {/* Dialog: Keyboard Shortcuts */}
      <Dialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        title="Keyboard Shortcuts"
      >
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Sanitize immediately</span>
            <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Ctrl/Cmd + Enter</kbd>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Copy sanitized output</span>
            <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Ctrl/Cmd + Shift + C</kbd>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-600 dark:text-slate-400">Open shortcuts help</span>
            <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">?</kbd>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-600 dark:text-slate-400">Close dialog</span>
            <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Escape</kbd>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
