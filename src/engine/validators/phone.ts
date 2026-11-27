/**
 * Validates Phone numbers:
 * - Indian Phone: optional +91, 91, or 0; 10 digits starting with 6, 7, 8, 9.
 * - International E.164-like: +<1-3 digit cc><4-14 digits>.
 * Excludes standalone digit strings that don't match phone structures,
 * and rejects digit sequences preceded by identifier prefixes (e.g. ORD-, INV-, TKT-, ID-, REF-).
 */
export function validateIndianPhone(
  input: string,
  fullText?: string,
  startIndex?: number
): boolean {
  // Context checking: Reject if preceded by an order/invoice/ticket/id prefix
  if (fullText !== undefined && startIndex !== undefined && startIndex > 0) {
    const lookback = fullText.slice(Math.max(0, startIndex - 10), startIndex);
    if (/(?:ORD|INV|TKT|ID|REF)[-_:]?$/i.test(lookback)) {
      return false;
    }
  }

  const clean = input.replace(/[\s()-]/g, '');
  // Matches +91, 91, 0, or just 10 digits starting with 6-9
  const match = clean.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  if (!match) {
    return false;
  }

  const numberPart = match[1];
  // Reject repetitive placeholder numbers like 9999999999 or 8888888888
  if (/^(\d)\1{9}$/.test(numberPart)) {
    return false;
  }

  return true;
}

export function validateIntlPhone(
  input: string,
  fullText?: string,
  startIndex?: number
): boolean {
  // Context checking: Reject if preceded by an order/invoice/ticket/id prefix
  if (fullText !== undefined && startIndex !== undefined && startIndex > 0) {
    const lookback = fullText.slice(Math.max(0, startIndex - 10), startIndex);
    if (/(?:ORD|INV|TKT|ID|REF)[-_:]?$/i.test(lookback)) {
      return false;
    }
  }

  const clean = input.replace(/[\s()-]/g, '');
  // E.164: + followed by 7 to 15 digits
  if (!/^\+[1-9]\d{6,14}$/.test(clean)) {
    return false;
  }

  const digits = clean.slice(1);
  // Reject identical digits
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  return true;
}
