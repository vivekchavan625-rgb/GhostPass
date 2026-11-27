import { Entity, EntityCategory } from '../types';

/**
 * Full Masking:
 * Replaces the entire entity with category-specific tags.
 */
const FULL_MASK_TAGS: Record<EntityCategory, string> = {
  email: '[REDACTED_EMAIL]',
  phone: '[REDACTED_PHONE]',
  pan: '[REDACTED_PAN]',
  aadhaar: '[REDACTED_AADHAAR]',
  'credit-card': '[REDACTED_CARD]',
  ipv4: '[REDACTED_IP]'
};

export function fullMask(entity: Entity): string {
  return FULL_MASK_TAGS[entity.category] ?? '[REDACTED]';
}

/**
 * Partial Masking:
 * Preserves limited non-sensitive context while masking the sensitive core.
 * - email: v***@example.com (first char + *** + @ + domain)
 * - phone: 98XXXXXX10 (takes national 10-digit number, keeps first 2 and last 2)
 * - credit-card: XXXX-XXXX-XXXX-1234 or XXXX1234
 * - aadhaar: XXXX XXXX 1234 or XXXXXXXX1234
 * - pan: ABXXXXX34F (first 2 and last 3 / 2 chars)
 * - ipv4: 192.XXX.XXX.XXX (keep first octet)
 */
export function partialMask(entity: Entity): string {
  const val = entity.value;

  switch (entity.category) {
    case 'email': {
      const atIdx = val.indexOf('@');
      if (atIdx <= 1) {
        return `*@${val.slice(atIdx + 1)}`;
      }
      return `${val[0]}***@${val.slice(atIdx + 1)}`;
    }

    case 'phone': {
      const digits = val.replace(/\D/g, '');
      // For Indian numbers with prefix like 91 or 0, extract the core 10 digits
      const coreDigits = digits.length > 10 ? digits.slice(-10) : digits;
      if (coreDigits.length <= 4) {
        return 'X'.repeat(coreDigits.length);
      }
      const first2 = coreDigits.slice(0, 2);
      const last2 = coreDigits.slice(-2);
      const maskedMiddle = 'X'.repeat(coreDigits.length - 4);
      return `${first2}${maskedMiddle}${last2}`;
    }

    case 'credit-card': {
      const digits = val.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      if (val.includes('-')) {
        return `XXXX-XXXX-XXXX-${last4}`;
      } else if (val.includes(' ')) {
        return `XXXX XXXX XXXX ${last4}`;
      }
      return `${'X'.repeat(Math.max(0, digits.length - 4))}${last4}`;
    }

    case 'aadhaar': {
      const digits = val.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      if (val.includes('-')) {
        return `XXXX-XXXX-${last4}`;
      } else if (val.includes(' ')) {
        return `XXXX XXXX ${last4}`;
      }
      return `XXXXXXXX${last4}`;
    }

    case 'pan': {
      const clean = val.trim().toUpperCase();
      if (clean.length === 10) {
        return `${clean.slice(0, 2)}XXXXX${clean.slice(7)}`;
      }
      return `${clean.slice(0, 2)}XXXX${clean.slice(-2)}`;
    }

    case 'ipv4': {
      const octets = val.split('.');
      if (octets.length === 4) {
        return `${octets[0]}.XXX.XXX.XXX`;
      }
      return 'XXX.XXX.XXX.XXX';
    }

    default:
      return '[REDACTED]';
  }
}

/**
 * Pseudonymization:
 * - USER_01, PHONE_01, IP_01, PAN_01, AADHAAR_01, CARD_01
 * - Independent counters per category
 * - Same normalized value always gets the same placeholder
 * - Map in memory only
 */
const CATEGORY_PREFIX: Record<EntityCategory, string> = {
  email: 'USER',
  phone: 'PHONE',
  ipv4: 'IP',
  pan: 'PAN',
  aadhaar: 'AADHAAR',
  'credit-card': 'CARD'
};

class PseudonymManager {
  private categoryCounters: Map<EntityCategory, number> = new Map();
  private valueToPseudonym: Map<string, string> = new Map();

  private normalize(category: EntityCategory, value: string): string {
    const trimmed = value.trim();
    if (category === 'email') {
      return trimmed.toLowerCase();
    }
    if (category === 'pan') {
      return trimmed.toUpperCase();
    }
    if (category === 'phone' || category === 'credit-card' || category === 'aadhaar') {
      return trimmed.replace(/[\s-]/g, '');
    }
    return trimmed;
  }

  public getPseudonym(entity: Entity): string {
    const norm = this.normalize(entity.category, entity.value);
    const mapKey = `${entity.category}:${norm}`;

    const existing = this.valueToPseudonym.get(mapKey);
    if (existing) {
      return existing;
    }

    const currentCount = (this.categoryCounters.get(entity.category) ?? 0) + 1;
    this.categoryCounters.set(entity.category, currentCount);

    const prefix = CATEGORY_PREFIX[entity.category] ?? 'ENTITY';
    const paddedIndex = currentCount.toString().padStart(2, '0');
    const pseudonym = `${prefix}_${paddedIndex}`;

    this.valueToPseudonym.set(mapKey, pseudonym);
    return pseudonym;
  }

  public clearMapping(): void {
    this.categoryCounters.clear();
    this.valueToPseudonym.clear();
  }

  /**
   * Returns a copy of the current pseudonym mappings.
   * Gated for UI inspection / audit export.
   */
  public exportMapping(): Record<string, string> {
    const exportObj: Record<string, string> = {};
    for (const [key, val] of this.valueToPseudonym.entries()) {
      exportObj[key] = val;
    }
    return exportObj;
  }
}

export const globalPseudonymManager = new PseudonymManager();

export function clearMapping(): void {
  globalPseudonymManager.clearMapping();
}

export function exportMapping(): Record<string, string> {
  return globalPseudonymManager.exportMapping();
}

/**
 * Reconstructs original text with redactions via sorted span slicing.
 * Preserves exact non-PII characters, whitespace, and newlines byte-for-byte.
 */
export function reconstruct(
  text: string,
  entities: Entity[],
  replacer: (entity: Entity) => string
): string {
  if (entities.length === 0) {
    return text;
  }

  let result = '';
  let lastIndex = 0;

  for (const entity of entities) {
    // Append unchanged chunk before this entity
    result += text.slice(lastIndex, entity.start);
    // Append redacted token
    result += replacer(entity);
    lastIndex = entity.end;
  }

  // Append remaining text after the last entity
  result += text.slice(lastIndex);

  return result;
}
