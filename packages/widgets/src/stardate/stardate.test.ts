import { describe, expect, it } from 'vitest';
import { formatStardate, toStardate } from './stardate';

describe('toStardate', () => {
  it('is 0 at the start of 2323', () => {
    expect(toStardate(new Date(2323, 0, 1))).toBe(0);
  });

  it('is halfway through a thousand by the middle of the year', () => {
    expect(toStardate(new Date(2323, 6, 2, 12))).toBeCloseTo(500, 0);
  });

  it('is negative before the epoch', () => {
    expect(formatStardate(new Date(2026, 0, 1))).toBe('-297000.00');
  });
});
