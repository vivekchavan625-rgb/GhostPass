import {
  Entity,
  EntityCategory,
  RedactionMode,
  SanitizeOptions,
  SanitizeResult,
  SanitizeStats
} from './types';
import { detectPII } from './detect';
import {
  fullMask,
  partialMask,
  globalPseudonymManager,
  clearMapping,
  exportMapping,
  reconstruct
} from './redaction';

export * from './types';
export * from './detect';
export * from './detectors';
export * from './validators/luhn';
export * from './validators/verhoeff';
export * from './validators/ipv4';
export * from './validators/pan';
export * from './validators/phone';
export * from './validators/email';
export { clearMapping, exportMapping, fullMask, partialMask, reconstruct };

/**
 * Core sanitizer:
 * Runs detection, resolves overlaps, applies selected redaction mode,
 * and compiles sanitized statistics without leaking sensitive values.
 */
export function sanitize(text: string, options?: SanitizeOptions): SanitizeResult {
  const startTime = performance.now();
  const mode: RedactionMode = options?.mode ?? 'fullMask';

  // Unless explicitly asked to preserve mapping across calls, reset pseudonymizer for fresh runs
  if (mode === 'pseudonymize' && !options?.preserveMapping) {
    clearMapping();
  }

  const entities = detectPII(text, {
    enabledCategories: options?.enabledCategories
  });

  const replacer = (entity: Entity): string => {
    switch (mode) {
      case 'partialMask':
        return partialMask(entity);
      case 'pseudonymize':
        return globalPseudonymManager.getPseudonym(entity);
      case 'fullMask':
      default:
        return fullMask(entity);
    }
  };

  const output = reconstruct(text, entities, replacer);
  const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

  const categoryCounts: Record<EntityCategory, number> = {
    email: 0,
    phone: 0,
    ipv4: 0,
    pan: 0,
    aadhaar: 0,
    'credit-card': 0
  };

  for (const entity of entities) {
    categoryCounts[entity.category] = (categoryCounts[entity.category] ?? 0) + 1;
  }

  const stats: SanitizeStats = {
    totalEntities: entities.length,
    categoryCounts,
    charsOriginal: text.length,
    charsRedacted: output.length
  };

  return {
    output,
    entities,
    stats,
    durationMs
  };
}
