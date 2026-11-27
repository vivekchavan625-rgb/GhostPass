import { Detector } from '../types';
import { validateIndianPhone } from '../validators/phone';

export const phoneInDetector: Detector = {
  id: 'phone-in',
  category: 'phone',
  // Matches Indian phone numbers: +91 / 91 / 0 prefix with 10 digits starting with 6-9
  pattern: /(?:(?:\+91|91|0)[-\s]?)?[6-9]\d{4}[-\s]?\d{5}\b/g,
  validate: (match: string) => validateIndianPhone(match),
  confidence: 'high',
  enabled: true
};
