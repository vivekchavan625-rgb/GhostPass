import { Detector } from '../types';
import { validateEmail } from '../validators/email';

export const emailDetector: Detector = {
  id: 'email',
  category: 'email',
  // Bounded regex without nested quantifiers to prevent ReDoS
  pattern: /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/g,
  validate: (match: string) => validateEmail(match),
  confidence: 'high',
  enabled: true
};
