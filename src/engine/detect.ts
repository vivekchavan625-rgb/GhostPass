import { Entity, EntityCategory, Detector } from './types';
import { ALL_DETECTORS } from './detectors';

// Priority order as required:
// credit-card > aadhaar > pan > email > ipv4 > phone
const CATEGORY_PRIORITY: Record<EntityCategory, number> = {
  'credit-card': 60,
  'aadhaar': 50,
  'pan': 40,
  'email': 30,
  'ipv4': 20,
  'phone': 10
};

// 2 MB max input size limit to avoid browser freezes
export const MAX_INPUT_SIZE = 2 * 1024 * 1024;

export interface DetectResult {
  entities: Entity[];
  rejected: Record<string, number>;
}

/**
 * Detects all enabled PII entities in the text without mutating it.
 * Validates with checksum/format validators, resolves overlapping spans deterministically,
 * and returns sorted entities along with rejected validation counts.
 */
export function detectPII(
  text: string,
  options?: {
    enabledCategories?: EntityCategory[];
    detectors?: Detector[];
  }
): Entity[] {
  return detectPIIWithStats(text, options).entities;
}

export function detectPIIWithStats(
  text: string,
  options?: {
    enabledCategories?: EntityCategory[];
    detectors?: Detector[];
  }
): DetectResult {
  const rejected: Record<string, number> = {};
  if (!text || text.length === 0) {
    return { entities: [], rejected };
  }

  if (text.length > MAX_INPUT_SIZE) {
    throw new Error(`Input exceeds maximum size limit of ${MAX_INPUT_SIZE} bytes (2MB).`);
  }

  const enabledCategories = options?.enabledCategories
    ? new Set(options.enabledCategories)
    : null;

  const detectors = (options?.detectors ?? ALL_DETECTORS).filter(
    (d) => d.enabled && (!enabledCategories || enabledCategories.has(d.category))
  );

  for (const detector of detectors) {
    rejected[detector.id] = 0;
  }

  const rawEntities: Entity[] = [];
  let entityCounter = 0;

  for (const detector of detectors) {
    // Reset global regex state
    detector.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = detector.pattern.exec(text)) !== null) {
      const matchText = match[0];
      const startIndex = match.index;
      const endIndex = startIndex + matchText.length;

      // Avoid zero-length regex loop
      if (matchText.length === 0) {
        detector.pattern.lastIndex++;
        continue;
      }

      // Run validator
      const isValid = detector.validate(matchText, text, startIndex);
      if (!isValid) {
        rejected[detector.id] = (rejected[detector.id] ?? 0) + 1;
        continue;
      }

      entityCounter++;
      rawEntities.push({
        id: `entity_${entityCounter}`,
        detectorId: detector.id,
        category: detector.category,
        start: startIndex,
        end: endIndex,
        length: matchText.length,
        value: matchText,
        confidence: detector.confidence ?? 'high',
        validated: true
      });
    }
  }

  // Deduplicate and resolve overlaps deterministically
  return {
    entities: resolveOverlaps(rawEntities),
    rejected
  };
}

/**
 * Resolves overlapping entities deterministically:
 * Priority rules:
 * 1. Higher category priority (credit-card > aadhaar > pan > email > ipv4 > phone)
 * 2. Longer span length wins
 * 3. Earlier start index wins
 */
export function resolveOverlaps(entities: Entity[]): Entity[] {
  if (entities.length <= 1) {
    return entities;
  }

  // Sort candidates by:
  // - Category priority descending
  // - Length descending
  // - Start index ascending
  const sortedCandidates = [...entities].sort((a, b) => {
    const priorityDiff = CATEGORY_PRIORITY[b.category] - CATEGORY_PRIORITY[a.category];
    if (priorityDiff !== 0) return priorityDiff;

    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) return lengthDiff;

    return a.start - b.start;
  });

  const selected: Entity[] = [];

  for (const candidate of sortedCandidates) {
    // Check if candidate overlaps with any already selected entity
    const overlaps = selected.some(
      (chosen) => !(candidate.end <= chosen.start || candidate.start >= chosen.end)
    );

    if (!overlaps) {
      selected.push(candidate);
    }
  }

  // Return final entities sorted in order of appearance in text
  return selected.sort((a, b) => a.start - b.start);
}
