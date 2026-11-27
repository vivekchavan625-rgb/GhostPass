import { Detector } from '../types';
import { emailDetector } from './email';
import { phoneInDetector } from './phone-in';
import { phoneIntlDetector } from './phone-intl';
import { ipv4Detector } from './ipv4';
import { panDetector } from './pan';
import { aadhaarDetector } from './aadhaar';
import { creditCardDetector } from './credit-card';

export const ALL_DETECTORS: Detector[] = [
  creditCardDetector,
  aadhaarDetector,
  panDetector,
  emailDetector,
  ipv4Detector,
  phoneInDetector,
  phoneIntlDetector
];

export {
  emailDetector,
  phoneInDetector,
  phoneIntlDetector,
  ipv4Detector,
  panDetector,
  aadhaarDetector,
  creditCardDetector
};
