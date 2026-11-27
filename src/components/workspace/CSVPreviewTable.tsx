import React from 'react';

interface CSVPreviewTableProps {
  rows: string[][];
  headers: string[];
  neutralizedCount: number;
}

export const CSVPreviewTable: React.FC<CSVPreviewTableProps> = ({
  rows,
  headers,
  neutralizedCount,
}) => {
  // Show first 50 rows
  const previewRows = rows.slice(0, 50);

  return (
    <div className="flex flex-col gap-3">
      {neutralizedCount > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
          <span>🛡️ Formula Injection Defense:</span>
          <span>
            Neutralized {neutralizedCount} cell(s) starting with formula characters (=, +, -, @).
          </span>
        </div>
      )}

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-900 shadow-sm max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              {headers.map((h, i) => (
                <th
                  key={`th_${i}`}
                  className="px-3 py-2 font-mono font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 last:border-r-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.slice(1).map((row, rIdx) => (
              <tr
                key={`tr_${rIdx}`}
                className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={`td_${rIdx}_${cIdx}`}
                    className="px-3 py-1.5 font-mono text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 whitespace-nowrap"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="text-[11px] text-slate-500 font-mono">
        Showing first {Math.min(50, rows.length)} rows.
      </span>
    </div>
  );
};
