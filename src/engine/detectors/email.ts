import { Detector } from '../types';
import { validateEmail } from '../validators/email';

export const emailDetector: Detector = {
  id: 'email',
  category: 'email',
  // Bounded regex with lookbehind/lookahead to prevent polynomial backtracking on long numeric or symbol sequences
  pattern: /(?:(?<=[^\w.!#$%&'*+/=?^_`{|}~-])|^)[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?=[^\w-]|$)/g,
  validate: (match: string) => validateEmail(match),
  confidence: 'high',
  enabled: true
};
