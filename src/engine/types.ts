export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type EntityCategory =
  | 'email'
  | 'phone'
  | 'ipv4'
  | 'pan'
  | 'aadhaar'
  | 'credit-card';

export interface Entity {
  id: string;
  detectorId: string;
  category: EntityCategory;
  start: number;
  end: number;
  length: number;
  value: string; // in memory only
  confidence: ConfidenceLevel;
  validated: boolean;
  context?: string;
}

export interface Detector {
  id: string;
  category: EntityCategory;
  pattern: RegExp;
  validate: (match: string, fullText: string, startIndex: number) => boolean;
  confidence?: ConfidenceLevel;
  enabled: boolean;
}

export type RedactionMode = 'fullMask' | 'partialMask' | 'pseudonymize';

export interface SanitizeOptions {
  mode?: RedactionMode;
  enabledCategories?: EntityCategory[];
  preserveMapping?: boolean;
}

export interface SanitizeStats {
  totalEntities: number;
  categoryCounts: Record<EntityCategory, number>;
  charsOriginal: number;
  charsRedacted: number;
  rejected: Record<string, number>; // counts of candidates rejected by validation per detectorId (counts only, no values)
}

export interface SanitizeResult {
  output: string;
  entities: Entity[];
  stats: SanitizeStats;
  durationMs: number;
}
