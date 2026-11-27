import { Detector } from '../types';
import { validateIPv4 } from '../validators/ipv4';

export const ipv4Detector: Detector = {
  id: 'ipv4',
  category: 'ipv4',
  // Word bounded 4-octet IPv4 pattern
  pattern: /\b(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}\b/g,
  validate: (match: string, fullText: string, startIndex: number) =>
    validateIPv4(match, fullText, startIndex),
  confidence: 'high',
  enabled: true
};
