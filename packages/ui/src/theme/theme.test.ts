import { describe, expect, it } from 'vitest';
import { contrast, oklch } from './color';
import { presetIds } from './presets';
import {
  buildPalette,
  contrastChecks,
  defaultThemeSettings,
  themeSettingsSchema,
  themeVariables,
  type Mode,
} from './theme';

const modes: Mode[] = ['light', 'dark'];

describe('presets', () => {
  for (const preset of presetIds) {
    for (const mode of modes) {
      it(`${preset} ${mode} passes every contrast check`, () => {
        const palette = buildPalette({ ...defaultThemeSettings, preset }, mode);
        const failures = contrastChecks(palette)
          .filter((c) => !c.pass)
          .map((c) => `${c.label} ${c.ratio.toFixed(2)}:1`);
        expect(failures).toEqual([]);
      });
    }
  }
});

describe('custom themes', () => {
  const hues = Array.from({ length: 12 }, (_, i) => i * 30);
  const accents = ['#2f6fed', '#e0245e', '#0f9d58', '#8e44ad', '#ff7a00', '#00a3a3'];

  for (const mode of modes) {
    it(`always produce readable body text and links in ${mode} mode`, () => {
      for (const customAccent of accents) {
        const p = buildPalette({ ...defaultThemeSettings, preset: 'custom', customAccent }, mode);
        expect(contrast(p.text, p.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.muted, p.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(p.accentText, p.surface)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  it('flags a light-mode accent too pale to draw as an edge', () => {
    const p = buildPalette(
      { ...defaultThemeSettings, preset: 'custom', customAccent: '#ffe066' },
      'light',
    );
    const edge = contrastChecks(p).find((c) => c.label === 'Accent as a UI edge on surface')!;
    expect(edge.pass).toBe(false);
  });

  it('derives a distinct second accent for any hue when none is chosen', () => {
    for (const H of hues) {
      const customAccent = oklch(0.6, 0.15, H);
      for (const mode of modes) {
        const p = buildPalette({ ...defaultThemeSettings, preset: 'custom', customAccent }, mode);
        expect(p.accent2).not.toBe(p.accent);
      }
    }
  });

  it('keeps a chosen second accent in light mode', () => {
    const p = buildPalette(
      { ...defaultThemeSettings, preset: 'custom', customAccent2: '#f0a020' },
      'light',
    );
    expect(p.accent2).toBe('#f0a020');
  });
});

describe('themeVariables', () => {
  it('emits --am- prefixed variables for color, radius, and shadow', () => {
    const vars = themeVariables({ ...defaultThemeSettings, radius: 'round' }, 'dark');
    expect(vars['--am-surface']).toBe('#0e0d16');
    expect(vars['--am-radius-control']).toBe('999px');
    expect(Object.keys(vars).every((k) => k.startsWith('--am-'))).toBe(true);
  });
});

describe('themeSettingsSchema', () => {
  it('rejects unknown presets and malformed colors', () => {
    expect(themeSettingsSchema.safeParse({ ...defaultThemeSettings, preset: 'borg' }).success).toBe(
      false,
    );
    expect(
      themeSettingsSchema.safeParse({ ...defaultThemeSettings, customAccent: 'orange' }).success,
    ).toBe(false);
  });
});
