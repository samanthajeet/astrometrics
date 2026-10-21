import { describe, expect, it } from 'vitest';
import { contrast, ink, onColor, oklch, ramp, toOklch } from './color';

describe('contrast', () => {
  it('is 21:1 for black on white and 1:1 for a color on itself', () => {
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrast('#e07a00', '#e07a00')).toBe(1);
  });
});

describe('oklch', () => {
  it('round-trips sRGB colors', () => {
    for (const hex of ['#e07a00', '#2f6fed', '#5fc29d', '#121417', '#fbf7f1']) {
      const { L, C, H } = toOklch(hex);
      expect(oklch(L, C, H)).toBe(hex);
    }
  });

  it('pulls out-of-gamut chroma back into sRGB', () => {
    expect(oklch(0.7, 0.5, 145)).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('onColor', () => {
  it('picks dark text on light accents and white on dark ones', () => {
    expect(onColor('#ffd233')).toBe('#0b0b10');
    expect(onColor('#4b2fd1')).toBe('#ffffff');
  });
});

describe('ink', () => {
  it('reaches 4.5:1 for a pale accent on a light surface', () => {
    expect(contrast(ink('#f5c211', '#ffffff'), '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it('reaches 4.5:1 for a deep accent on a dark surface', () => {
    expect(contrast(ink('#4b2fd1', '#0b0a1f'), '#0b0a1f')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('ramp', () => {
  it('runs 50 to 900 from light to dark', () => {
    const steps = ramp('#e07a00');
    expect(steps.map((s) => s.step)).toEqual([
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
    ]);
    const lightness = steps.map((s) => toOklch(s.hex).L);
    expect(lightness).toEqual([...lightness].sort((a, b) => b - a));
  });
});
