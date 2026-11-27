/**
 * Validates Email addresses.
 * Rejects leading/trailing invalid dots, excessive lengths, and invalid domains.
 */
export function validateEmail(input: string): boolean {
  const email = input.trim();
  if (email.length < 5 || email.length > 254) {
    return false;
  }

  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex === email.length - 1 || email.indexOf('@', atIndex + 1) !== -1) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (localPart.length > 64 || domainPart.length > 253) {
    return false;
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return false;
  }

  if (domainPart.startsWith('.') || domainPart.endsWith('.') || domainPart.includes('..')) {
    return false;
  }

  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return false;
  }

  // TLD must be at least 2 chars and only letters
  const tld = domainParts[domainParts.length - 1];
  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return false;
  }

  // Local part allowed chars
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
    return false;
  }

  return true;
}
