import { Detector } from '../types';
import { validateLuhn } from '../validators/luhn';

export const creditCardDetector: Detector = {
  id: 'credit-card',
  category: 'credit-card',
  // 13-19 digits with optional space or hyphen grouping (e.g. 4-4-4-4, 4-6-5)
  pattern: /\b(?:\d{4}[-\s]?){3}\d{1,4}\b|\b\d{4}[-\s]?\d{6}[-\s]?\d{5}\b|\b\d{13,19}\b/g,
  validate: (match: string) => validateLuhn(match),
  confidence: 'high',
  enabled: true
};
