/**
 * Validates a number string using the Luhn algorithm (Mod 10).
 * Strips non-digit characters (spaces, dashes) before computing.
 */
export function validateLuhn(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isNaN(digit)) {
      return false;
    }

    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}
