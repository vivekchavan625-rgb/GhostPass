/**
 * Validates IPv4 addresses:
 * - Must have exactly 4 octets.
 * - Each octet must be an integer between 0 and 255 with no leading zeroes unless '0'.
 * - Rejects version strings e.g. "v1.2.3.4" or "version 2.0.1.5" or "/1.2.3.4" (package versions).
 */
export function validateIPv4(match: string, fullText: string, startIndex: number): boolean {
  const octets = match.split('.');
  if (octets.length !== 4) {
    return false;
  }

  for (const octet of octets) {
    if (!/^\d{1,3}$/.test(octet)) {
      return false;
    }
    if (octet.length > 1 && octet.startsWith('0')) {
      return false;
    }
    const num = parseInt(octet, 10);
    if (num < 0 || num > 255) {
      return false;
    }
  }

  // Context checking: Reject if immediately preceded by 'v', 'V', or 'version '
  const prefixLookback = fullText.slice(Math.max(0, startIndex - 10), startIndex);
  if (/(?:^|\s|[._/-])[vV]$/.test(prefixLookback)) {
    return false;
  }
  if (/(?:version|ver|release)\s*$/i.test(prefixLookback)) {
    return false;
  }

  // Reject if immediately followed by another dot and digit (like v1.2.3.4.5)
  const endIndex = startIndex + match.length;
  const suffixLookahead = fullText.slice(endIndex, Math.min(fullText.length, endIndex + 5));
  if (/^\.\d/.test(suffixLookahead)) {
    return false;
  }

  return true;
}
