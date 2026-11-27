import { describe, it, expect } from 'vitest';
import { validateLuhn } from '../../src/engine/validators/luhn';
import { validateVerhoeff } from '../../src/engine/validators/verhoeff';
import { validateIPv4 } from '../../src/engine/validators/ipv4';
import { validatePAN } from '../../src/engine/validators/pan';
import { validateIndianPhone, validateIntlPhone } from '../../src/engine/validators/phone';
import { validateEmail } from '../../src/engine/validators/email';

describe('Validators Suite', () => {
  describe('Luhn Algorithm (Credit Card)', () => {
    it('accepts valid credit card numbers with or without separators', () => {
      expect(validateLuhn('4532 0150 1234 5671')).toBe(true);
      expect(validateLuhn('4532-0150-1234-5671')).toBe(true);
      expect(validateLuhn('4111111111111111')).toBe(true);
      expect(validateLuhn('378282246310005')).toBe(true); // Amex
    });

    it('rejects invalid Luhn checksum numbers', () => {
      expect(validateLuhn('4532 0150 1234 5679')).toBe(false);
      expect(validateLuhn('4111111111111112')).toBe(false);
    });

    it('rejects numbers that are too short or too long', () => {
      expect(validateLuhn('123456789012')).toBe(false); // 12 digits
      expect(validateLuhn('12345678901234567890')).toBe(false); // 20 digits
    });
  });

  describe('Verhoeff Algorithm (Aadhaar)', () => {
    it('accepts valid 12-digit Aadhaar numbers', () => {
      expect(validateVerhoeff('3675 9834 6016')).toBe(true);
      expect(validateVerhoeff('2198-7654-3210')).toBe(true);
      expect(validateVerhoeff('987654321096')).toBe(true);
    });

    it('rejects numbers starting with 0 or 1', () => {
      expect(validateVerhoeff('0123 4567 8901')).toBe(false);
      expect(validateVerhoeff('1234 5678 9012')).toBe(false);
    });

    it('rejects numbers with checksum digit corrupted', () => {
      expect(validateVerhoeff('3675 9834 6013')).toBe(false);
      expect(validateVerhoeff('2198-7654-3219')).toBe(false);
    });

    it('rejects invalid length', () => {
      expect(validateVerhoeff('3675 9834 601')).toBe(false); // 11
      expect(validateVerhoeff('3675 9834 60123')).toBe(false); // 13
    });
  });

  describe('IPv4 Validator', () => {
    it('validates standard IPv4 addresses', () => {
      expect(validateIPv4('192.168.1.1', 'IP is 192.168.1.1', 6)).toBe(true);
      expect(validateIPv4('8.8.8.8', 'DNS 8.8.8.8 here', 4)).toBe(true);
      expect(validateIPv4('255.255.255.0', 'Mask: 255.255.255.0', 6)).toBe(true);
      expect(validateIPv4('0.0.0.0', 'Route 0.0.0.0 is open', 6)).toBe(true);
    });

    it('rejects octets > 255', () => {
      expect(validateIPv4('256.1.1.1', 'IP 256.1.1.1', 3)).toBe(false);
      expect(validateIPv4('192.168.1.300', 'IP 192.168.1.300', 3)).toBe(false);
    });

    it('rejects leading zeroes in octets', () => {
      expect(validateIPv4('192.168.01.1', 'IP 192.168.01.1', 3)).toBe(false);
    });

    it('rejects software version tags and prefixes', () => {
      expect(validateIPv4('1.2.3.4', 'Release v1.2.3.4 today', 9)).toBe(false);
      expect(validateIPv4('2.0.1.5', 'Upgrade version 2.0.1.5 now', 16)).toBe(false);
      expect(validateIPv4('1.0.0.0', 'running release 1.0.0.0', 16)).toBe(false);
    });

    it('rejects version extensions with 5 octets', () => {
      expect(validateIPv4('1.2.3.4', '1.2.3.4.5', 0)).toBe(false);
    });
  });

  describe('PAN Validator', () => {
    it('accepts valid 10-character PANs with valid 4th entity char', () => {
      expect(validatePAN('ABCPV1234K')).toBe(true); // P = Individual
      expect(validatePAN('AAACB5678D')).toBe(true); // C = Company
      expect(validatePAN('AABTB9988G')).toBe(true); // T = Trust
      expect(validatePAN('BKZPR8901L')).toBe(true);
    });

    it('rejects invalid 4th entity characters', () => {
      expect(validatePAN('ABCZV1234K')).toBe(false); // Z is not valid
      expect(validatePAN('AAAA99999Z')).toBe(false);
    });

    it('rejects incorrect lengths or formats', () => {
      expect(validatePAN('ABCP1234K')).toBe(false); // too short
      expect(validatePAN('ABCPV12345K')).toBe(false); // too long
      expect(validatePAN('ABCPV123AK')).toBe(false); // letter inside number part
    });
  });

  describe('Phone Validators', () => {
    it('accepts valid Indian phone numbers', () => {
      expect(validateIndianPhone('+91 98765 43210')).toBe(true);
      expect(validateIndianPhone('098201 12345')).toBe(true);
      expect(validateIndianPhone('8765432109')).toBe(true);
      expect(validateIndianPhone('+91-9123456789')).toBe(true);
    });

    it('rejects Indian phones starting with invalid digit or repetitive dummy', () => {
      expect(validateIndianPhone('5123456789')).toBe(false); // starts with 5
      expect(validateIndianPhone('9999999999')).toBe(false); // repetitive
    });

    it('accepts valid international E.164 phone numbers', () => {
      expect(validateIntlPhone('+1 415 555 2671')).toBe(true);
      expect(validateIntlPhone('+44 20 7946 0912')).toBe(true);
      expect(validateIntlPhone('+81 3 1234 5678')).toBe(true);
    });

    it('rejects invalid international phone patterns', () => {
      expect(validateIntlPhone('14155552671')).toBe(false); // missing +
      expect(validateIntlPhone('+111111111111')).toBe(false); // repetitive
    });
  });

  describe('Email Validator', () => {
    it('accepts valid emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('first.last+tag@sub.domain.org')).toBe(true);
      expect(validateEmail('user_name123@domain.co.in')).toBe(true);
    });

    it('rejects malformed emails', () => {
      expect(validateEmail('plainaddress')).toBe(false);
      expect(validateEmail('@missinguser.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false); // no tld dot
      expect(validateEmail('user..name@example.com')).toBe(false); // double dot
      expect(validateEmail('user@@example.com')).toBe(false); // double @
    });
  });
});
