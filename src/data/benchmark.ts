import { EntityCategory } from '../engine/types';
import { detectPII } from '../engine/detect';

export interface BenchmarkItem {
  id: string;
  text: string;
  expectedCategory: EntityCategory | 'none'; // 'none' for adversarial negatives
  expectedValue?: string;
  description: string;
}

export interface CategoryMetrics {
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface BenchmarkReport {
  overall: CategoryMetrics;
  byCategory: Record<EntityCategory, CategoryMetrics>;
  totalItems: number;
  adversarialItems: number;
}

/**
 * Labeled synthetic test items including positive examples and adversarial negatives.
 * Exactly 44 labeled items covering all 6 categories + negatives.
 */
export const BENCHMARK_ITEMS: BenchmarkItem[] = [
  // --- EMAIL (Positive) ---
  { id: 'em-1', text: 'Contact us at support@example.com today.', expectedCategory: 'email', expectedValue: 'support@example.com', description: 'Standard corporate email' },
  { id: 'em-2', text: 'Write to user.name+tag@sub.domain.org for info.', expectedCategory: 'email', expectedValue: 'user.name+tag@sub.domain.org', description: 'Email with plus-addressing and subdomain' },
  { id: 'em-3', text: 'My address is alex123@example.co.in.', expectedCategory: 'email', expectedValue: 'alex123@example.co.in', description: 'Email with 2-part ccTLD' },
  { id: 'em-4', text: 'Contact: dev_ops@engineering-corp.io', expectedCategory: 'email', expectedValue: 'dev_ops@engineering-corp.io', description: 'Email with hyphen domain and underscore' },

  // --- EMAIL (Adversarial Negatives) ---
  { id: 'em-neg-1', text: 'Plain text with @no-domain symbol', expectedCategory: 'none', description: 'Incomplete email missing TLD' },
  { id: 'em-neg-2', text: 'Double at sign user@@example.com', expectedCategory: 'none', description: 'Invalid double @ sign' },

  // --- PHONE (Positive - Indian) ---
  { id: 'ph-1', text: 'Call on +91 98765 43210 immediately.', expectedCategory: 'phone', expectedValue: '+91 98765 43210', description: 'Indian phone with +91 prefix and space' },
  { id: 'ph-2', text: 'Reach out at 098201 12345.', expectedCategory: 'phone', expectedValue: '098201 12345', description: 'Indian phone with leading 0' },
  { id: 'ph-3', text: 'Primary mobile number: 8765432109.', expectedCategory: 'phone', expectedValue: '8765432109', description: 'Indian phone 10 digits starting with 8' },

  // --- PHONE (Positive - International) ---
  { id: 'ph-4', text: 'US Office: +1 415 555 2671.', expectedCategory: 'phone', expectedValue: '+1 415 555 2671', description: 'US E.164 phone number' },
  { id: 'ph-5', text: 'UK helpline is +44 20 7946 0912.', expectedCategory: 'phone', expectedValue: '+44 20 7946 0912', description: 'UK international phone format' },

  // --- PHONE (Adversarial Negatives) ---
  { id: 'ph-neg-1', text: 'Repetitive test phone 9999999999 rejected', expectedCategory: 'none', description: 'Repetitive dummy phone digits' },
  { id: 'ph-neg-2', text: 'Short number 1234567 is not phone', expectedCategory: 'none', description: 'Insufficient digits' },
  { id: 'ph-neg-3', text: 'Invoice reference INV-9876543210', expectedCategory: 'none', description: 'Order ID prefix attached to number' },

  // --- IPV4 (Positive) ---
  { id: 'ip-1', text: 'Gateway address is 192.168.1.1.', expectedCategory: 'ipv4', expectedValue: '192.168.1.1', description: 'Standard private IPv4' },
  { id: 'ip-2', text: 'Connecting to server 10.240.12.99 on port 80', expectedCategory: 'ipv4', expectedValue: '10.240.12.99', description: 'Class A private IP' },
  { id: 'ip-3', text: 'DNS resolver is 8.8.8.8.', expectedCategory: 'ipv4', expectedValue: '8.8.8.8', description: 'Google public DNS IP' },
  { id: 'ip-4', text: 'Boundary address: 255.255.255.0 subnet', expectedCategory: 'ipv4', expectedValue: '255.255.255.0', description: 'Subnet mask IPv4' },

  // --- IPV4 (Adversarial Negatives) ---
  { id: 'ip-neg-1', text: 'Upgrade completed to version v1.2.3.4 today', expectedCategory: 'none', description: 'Software version with leading v' },
  { id: 'ip-neg-2', text: 'Running release 2.0.1.5 in production', expectedCategory: 'none', description: 'Software release tag context' },
  { id: 'ip-neg-3', text: 'Out of bounds IP 192.168.1.256 is bad', expectedCategory: 'none', description: 'Octet exceeding 255' },
  { id: 'ip-neg-4', text: 'Octet leading zero 192.168.01.1 rejected', expectedCategory: 'none', description: 'Octet with invalid leading zero' },

  // --- PAN (Positive) ---
  { id: 'pan-1', text: 'Individual PAN: ABCPV1234K verified.', expectedCategory: 'pan', expectedValue: 'ABCPV1234K', description: 'Individual taxpayer PAN' },
  { id: 'pan-2', text: 'Company PAN number is AAACB5678D.', expectedCategory: 'pan', expectedValue: 'AAACB5678D', description: 'Company taxpayer PAN' },
  { id: 'pan-3', text: 'Trust registration: AABTB9988G on record', expectedCategory: 'pan', expectedValue: 'AABTB9988G', description: 'Trust taxpayer PAN' },

  // --- PAN (Adversarial Negatives) ---
  { id: 'pan-neg-1', text: 'Invalid entity code ABCZV1234K bad 4th char', expectedCategory: 'none', description: '4th char is Z (not recognized tax entity)' },
  { id: 'pan-neg-2', text: 'Short PAN ABCP1234K rejected', expectedCategory: 'none', description: 'Only 4 leading letters' },
  { id: 'pan-neg-3', text: 'Alpha digits mix ABCPV123AK rejected', expectedCategory: 'none', description: 'Letter inside 4 digits sequence' },

  // --- AADHAAR (Positive - Verhoeff Valid) ---
  { id: 'adh-1', text: 'Citizen identity: 3675 9834 6016 presented.', expectedCategory: 'aadhaar', expectedValue: '3675 9834 6016', description: 'Space-delimited valid Verhoeff Aadhaar' },
  { id: 'adh-2', text: 'Aadhaar: 2198-7654-3210 on e-KYC', expectedCategory: 'aadhaar', expectedValue: '2198-7654-3210', description: 'Hyphen-delimited valid Verhoeff Aadhaar' },
  { id: 'adh-3', text: 'Record number 987654321096 verified.', expectedCategory: 'aadhaar', expectedValue: '987654321096', description: 'Unspaced 12-digit valid Verhoeff Aadhaar' },

  // --- AADHAAR (Adversarial Negatives) ---
  { id: 'adh-neg-1', text: 'Invalid starts with 0: 0123 4567 8901 rejected', expectedCategory: 'none', description: 'Aadhaar cannot start with 0' },
  { id: 'adh-neg-2', text: 'Invalid starts with 1: 1234 5678 9012 rejected', expectedCategory: 'none', description: 'Aadhaar cannot start with 1' },
  { id: 'adh-neg-3', text: 'Corrupted checksum: 3675 9834 6013 rejected', expectedCategory: 'none', description: 'Invalid Verhoeff checksum digit' },
  { id: 'adh-neg-4', text: 'Too short aadhaar: 3675 9834 601 rejected', expectedCategory: 'none', description: 'Only 11 digits' },

  // --- CREDIT CARD (Positive - Luhn Valid) ---
  { id: 'cc-1', text: 'Charge card 4532-0150-1234-5671 successfully', expectedCategory: 'credit-card', expectedValue: '4532-0150-1234-5671', description: 'Visa valid Luhn with dashes' },
  { id: 'cc-2', text: 'Payment via 5555 4444 3333 1111 MasterCard', expectedCategory: 'credit-card', expectedValue: '5555 4444 3333 1111', description: 'MasterCard valid Luhn with spaces' },
  { id: 'cc-3', text: 'Test visa continuous: 4111111111111111', expectedCategory: 'credit-card', expectedValue: '4111111111111111', description: 'Visa 16-digit unspaced valid Luhn' },
  { id: 'cc-4', text: 'Amex payment: 3782 822463 10005 processed', expectedCategory: 'credit-card', expectedValue: '3782 822463 10005', description: 'American Express 15-digit valid Luhn' },

  // --- CREDIT CARD (Adversarial Negatives) ---
  { id: 'cc-neg-1', text: 'Bad checksum card: 4532-0150-1234-5679 rejected', expectedCategory: 'none', description: 'Card number failing Luhn algorithm' },
  { id: 'cc-neg-2', text: 'Random sequence 12345678901234 failing Luhn', expectedCategory: 'none', description: '14-digit number with invalid Luhn' },
  { id: 'cc-neg-3', text: 'Order tracking: ORD-4532015012345671', expectedCategory: 'none', description: 'Prefix attached to 16 digits' },

  // --- PLAIN NON-PII TEXT ---
  { id: 'plain-1', text: 'The quick brown fox jumps over the lazy dog.', expectedCategory: 'none', description: 'Ordinary English prose' },
  { id: 'plain-2', text: 'System load average: 0.14, 0.22, 0.18 over 15 minutes.', expectedCategory: 'none', description: 'System load metrics' }
];

function calculateMetrics(tp: number, fp: number, fn: number): CategoryMetrics {
  const precision = tp + fp === 0 ? 1 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 1 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

  return {
    tp,
    fp,
    fn,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1: Math.round(f1 * 1000) / 1000
  };
}

/**
 * Runs the benchmark evaluation against the labeled synthetic set.
 * Returns true precision, recall, and F1 per category and overall.
 */
export function runBenchmark(items: BenchmarkItem[] = BENCHMARK_ITEMS): BenchmarkReport {
  const allCategories: EntityCategory[] = [
    'email',
    'phone',
    'ipv4',
    'pan',
    'aadhaar',
    'credit-card'
  ];

  const categoryCounts: Record<EntityCategory, { tp: number; fp: number; fn: number }> = {
    email: { tp: 0, fp: 0, fn: 0 },
    phone: { tp: 0, fp: 0, fn: 0 },
    ipv4: { tp: 0, fp: 0, fn: 0 },
    pan: { tp: 0, fp: 0, fn: 0 },
    aadhaar: { tp: 0, fp: 0, fn: 0 },
    'credit-card': { tp: 0, fp: 0, fn: 0 }
  };

  let overallTP = 0;
  let overallFP = 0;
  let overallFN = 0;
  let adversarialCount = 0;

  for (const item of items) {
    if (item.expectedCategory === 'none') {
      adversarialCount++;
    }

    const detected = detectPII(item.text);

    if (item.expectedCategory === 'none') {
      // Adversarial negative: any detection is a false positive
      if (detected.length > 0) {
        overallFP += detected.length;
        for (const d of detected) {
          categoryCounts[d.category].fp++;
        }
      }
    } else {
      // Expected positive
      const match = detected.find((d) => d.category === item.expectedCategory);
      if (match) {
        overallTP++;
        categoryCounts[item.expectedCategory].tp++;

        // Any extra detections are false positives
        if (detected.length > 1) {
          const extra = detected.length - 1;
          overallFP += extra;
        }
      } else {
        overallFN++;
        categoryCounts[item.expectedCategory].fn++;

        // Any other category detected is a false positive
        if (detected.length > 0) {
          overallFP += detected.length;
          for (const d of detected) {
            categoryCounts[d.category].fp++;
          }
        }
      }
    }
  }

  const byCategory: Record<EntityCategory, CategoryMetrics> = {} as Record<
    EntityCategory,
    CategoryMetrics
  >;

  for (const cat of allCategories) {
    const c = categoryCounts[cat];
    byCategory[cat] = calculateMetrics(c.tp, c.fp, c.fn);
  }

  const overall = calculateMetrics(overallTP, overallFP, overallFN);

  return {
    overall,
    byCategory,
    totalItems: items.length,
    adversarialItems: adversarialCount
  };
}
