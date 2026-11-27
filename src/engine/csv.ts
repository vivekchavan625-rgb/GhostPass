import Papa from 'papaparse';
import { sanitize } from './index';
import { EntityCategory, RedactionMode } from './types';

/**
 * Checks if a string represents a plain pure number (integer or float).
 * E.g., "-42", "-42.5", "+100" -> true.
 * "+91 98201 12345", "=CMD()", "@SUM(A1)" -> false.
 */
export function isPlainNumeric(val: string): boolean {
  const trimmed = val.trim();
  if (trimmed === '' || trimmed === '+' || trimmed === '-') {
    return false;
  }
  // Matches optional +/- followed by digits and optional .digits
  return /^[-+]?\d+(?:\.\d+)?$/.test(trimmed);
}

/**
 * Neutralizes potential formula injection characters: =, +, -, @, \t, \r
 * Prepends a leading single quote (') unless it is a plain numeric value.
 */
export function neutralizeCSVCell(val: string): { value: string; neutralized: boolean } {
  if (typeof val !== 'string' || val.length === 0) {
    return { value: val, neutralized: false };
  }

  const firstChar = val[0];
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];

  if (formulaTriggers.includes(firstChar)) {
    if (!isPlainNumeric(val)) {
      return { value: `'${val}`, neutralized: true };
    }
  }

  return { value: val, neutralized: false };
}

export interface CSVSanitizeResult {
  outputCSV: string;
  rows: string[][];
  headers: string[];
  totalCells: number;
  neutralizedCount: number;
  totalEntities: number;
}

/**
 * Parses CSV using PapaParse, sanitizes each cell with the GhostPass engine,
 * applies formula-injection defense to exported CSV, and reconstructs the file.
 */
export function sanitizeCSV(
  csvText: string,
  options?: {
    mode?: RedactionMode;
    enabledCategories?: EntityCategory[];
  }
): CSVSanitizeResult {
  const parsed = Papa.parse<string[]>(csvText, {
    skipEmptyLines: false,
  });

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length === 0) {
    return {
      outputCSV: '',
      rows: [],
      headers: [],
      totalCells: 0,
      neutralizedCount: 0,
      totalEntities: 0,
    };
  }

  const sanitizedRows: string[][] = [];
  const exportRows: string[][] = [];
  let totalEntities = 0;
  let totalCells = 0;
  let neutralizedCount = 0;

  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r];
    const newRow: string[] = [];
    const newExportRow: string[] = [];

    for (let c = 0; c < row.length; c++) {
      totalCells++;
      const cell = row[c] ?? '';

      // Run cell through GhostPass engine
      const res = sanitize(cell, {
        mode: options?.mode ?? 'fullMask',
        enabledCategories: options?.enabledCategories,
        preserveMapping: true, // Maintain pseudonym consistency across cells
      });

      totalEntities += res.stats.totalEntities;
      newRow.push(res.output);

      // Formula injection defense for export
      const neutralized = neutralizeCSVCell(res.output);
      if (neutralized.neutralized) {
        neutralizedCount++;
      }
      newExportRow.push(neutralized.value);
    }

    sanitizedRows.push(newRow);
    exportRows.push(newExportRow);
  }

  const delimiter = parsed.meta.delimiter || ',';
  const outputCSV = Papa.unparse(exportRows, {
    delimiter,
  });

  return {
    outputCSV,
    rows: sanitizedRows,
    headers: sanitizedRows.length > 0 ? sanitizedRows[0] : [],
    totalCells,
    neutralizedCount,
    totalEntities,
  };
}
