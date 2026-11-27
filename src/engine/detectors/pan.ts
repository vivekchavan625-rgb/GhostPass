import { Detector } from '../types';
import { validatePAN } from '../validators/pan';

export const panDetector: Detector = {
  id: 'pan',
  category: 'pan',
  // Indian PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
  pattern: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
  validate: (match: string) => validatePAN(match),
  confidence: 'high',
  enabled: true
};
