import { Detector } from '../types';
import { validateVerhoeff } from '../validators/verhoeff';

export const aadhaarDetector: Detector = {
  id: 'aadhaar',
  category: 'aadhaar',
  // 12 digits, cannot start with 0 or 1, optional 4-4-4 space or hyphen grouping
  pattern: /\b[2-9]\d{3}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  validate: (match: string) => validateVerhoeff(match),
  confidence: 'high',
  enabled: true
};
