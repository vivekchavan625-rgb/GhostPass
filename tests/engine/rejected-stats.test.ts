import { describe, it, expect } from 'vitest';
import { sanitize } from '../../src/engine';

describe('Sanitize Engine Rejected Stats Suite', () => {
  it('returns rejected candidate count per detectorId in stats', () => {
    // Contains false-positive version tags (v1.2.3.4) and invalid card checksums
    const textWithNoise = `
      Software version v1.2.3.4 running on host.
      Invalid card number: 4532 0150 1234 5679
      Valid card number: 4532 0150 1234 5671
    `;
    const res = sanitize(textWithNoise);

    expect(res.stats.rejected).toBeDefined();
    // 4532 0150 1234 5679 fails Luhn -> rejected
    expect(res.stats.rejected['credit-card']).toBeGreaterThanOrEqual(1);
    // v1.2.3.4 fails IPv4 version check -> rejected
    expect(res.stats.rejected['ipv4']).toBeGreaterThanOrEqual(1);

    // Only the valid card was identified as an entity
    expect(res.entities.length).toBe(1);
    expect(res.entities[0].category).toBe('credit-card');
  });
});
