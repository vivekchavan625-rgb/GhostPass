import { Detector } from '../types';
import { validateIntlPhone } from '../validators/phone';

export const phoneIntlDetector: Detector = {
  id: 'phone-intl',
  category: 'phone',
  // E.164-like international telephone numbers starting with +
  pattern: /\+[1-9]\d{0,2}[-\s]?(?:\(?\d{1,4}\)?[-\s]?){1,4}\d{1,4}\b/g,
  validate: (match: string, fullText: string, startIndex: number) =>
    validateIntlPhone(match, fullText, startIndex),
  confidence: 'medium',
  enabled: true
};
