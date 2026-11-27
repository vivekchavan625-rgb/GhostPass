/**
 * Validates Indian Permanent Account Number (PAN):
 * 5 letters + 4 digits + 1 letter (length 10).
 * 4th character represents entity type (e.g., P, C, H, F, A, T, B, L, J, G).
 */
const VALID_4TH_CHARS = new Set(['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G']);

export function validatePAN(input: string): boolean {
  const pan = input.trim().toUpperCase();
  if (pan.length !== 10) {
    return false;
  }

  const pattern = /^[A-Z]{3}[A-Z][A-Z][0-9]{4}[A-Z]$/;
  if (!pattern.test(pan)) {
    return false;
  }

  // 4th character (index 3) is entity type
  const entityType = pan[3];
  return VALID_4TH_CHARS.has(entityType);
}
