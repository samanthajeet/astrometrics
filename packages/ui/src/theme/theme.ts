import { z } from 'zod';
import { contrast, ink, isHexColor, onColor, oklch, toOklch } from './color';
import { presetIds, presets, type BaseColors } from './presets';

export type Mode = 'light' | 'dark';

const hex = z.string().refine(isHexColor);

export const themeSettingsSchema = z.object({
  preset: z.enum([...presetIds, 'custom']),
  mode: z.enum(['system', 'light', 'dark']),
  radius: z.enum(['sharp', 'soft', 'round']),
  customAccent: hex,
  customAccent2: hex.nullable(),
});

export type ThemeSettings = z.infer<typeof themeSettingsSchema>;
export type RadiusStyle = ThemeSettings['radius'];

export const defaultThemeSettings: ThemeSettings = {
  preset: 'voyager',
  mode: 'system',
  radius: 'soft',
  customAccent: '#2f6fed',
  customAccent2: null,
};

export interface Palette extends BaseColors {
  success: string;
  warning: string;
  danger: string;
  accentContrast: string;
  accent2Contrast: string;
  accent3Contrast: string;
  accent4Contrast: string;
  successContrast: string;
  warningContrast: string;
  dangerContrast: string;
  /** The accent darkened or lightened to 4.5:1 on the surface, for links and icons. */
  accentText: string;
  focus: string;
}

function customColors(accent: string, accent2: string | null, mode: Mode): BaseColors {
  const { L, C, H } = toOklch(accent);
  const tint = Math.min(C * 0.12, 0.018);
  const second = accent2
    ? toOklch(accent2)
    : { L: mode === 'dark' ? 0.74 : 0.6, C: Math.max(C * 0.85, 0.08), H: (H + 150) % 360 };

  if (mode === 'dark') {
    return {
      surface: oklch(0.17, tint * 1.4, H),
      raised: oklch(0.215, tint * 1.6, H),
      sunken: oklch(0.135, tint * 1.2, H),
      text: oklch(0.965, 0.01, H),
      muted: oklch(0.75, 0.03, H),
      border: oklch(0.32, Math.min(C * 0.2, 0.035), H),
      accent: oklch(Math.max(L, 0.72), C, H),
      accent2: oklch(Math.max(second.L, 0.72), second.C, second.H),
      accent3: oklch(0.84, C * 0.8, (H + 70) % 360),
      accent4: oklch(0.68, C * 0.85, (H + 310) % 360),
    };
  }
  return {
    surface: oklch(0.985, tint, H),
    raised: oklch(0.998, tint * 0.3, H),
    sunken: oklch(0.955, tint * 1.3, H),
    text: oklch(0.21, Math.min(C * 0.15, 0.03), H),
    muted: oklch(0.47, Math.min(C * 0.12, 0.03), H),
    border: oklch(0.89, Math.min(C * 0.15, 0.025), H),
    accent,
    accent2: accent2 ?? oklch(second.L, second.C, second.H),
    accent3: oklch(0.82, C * 0.85, (H + 70) % 360),
    accent4: oklch(0.64, C * 0.9, (H + 310) % 360),
  };
}

const statusColors = {
  light: { success: '#1d8048', warning: '#a86300', danger: '#c42f28' },
  dark: { success: '#4cd38a', warning: '#ffb547', danger: '#ff6b63' },
} as const;

export function buildPalette(settings: ThemeSettings, mode: Mode): Palette {
  const base =
    settings.preset === 'custom'
      ? customColors(settings.customAccent, settings.customAccent2, mode)
      : presets[settings.preset][mode];
  const colors = { ...base, ...statusColors[mode] };
  const accentText = ink(colors.accent, colors.surface);
  return {
    ...colors,
    accentContrast: onColor(colors.accent),
    accent2Contrast: onColor(colors.accent2),
    accent3Contrast: onColor(colors.accent3),
    accent4Contrast: onColor(colors.accent4),
    successContrast: onColor(colors.success),
    warningContrast: onColor(colors.warning),
    dangerContrast: onColor(colors.danger),
    accentText,
    focus: accentText,
  };
}

const radii: Record<RadiusStyle, { card: string; control: string; chip: string }> = {
  sharp: { card: '8px', control: '6px', chip: '4px' },
  soft: { card: '20px', control: '12px', chip: '8px' },
  round: { card: '28px', control: '999px', chip: '999px' },
};

function shadows(palette: Palette, mode: Mode): [string, string, string] {
  if (mode === 'dark') {
    return [
      '0 1px 2px rgb(0 0 0 / .4)',
      '0 10px 28px -10px rgb(0 0 0 / .65)',
      '0 24px 60px -18px rgb(0 0 0 / .75)',
    ];
  }
  const tint = (pct: number) => `color-mix(in oklab, ${palette.text} ${pct}%, transparent)`;
  return [`0 1px 2px ${tint(8)}`, `0 12px 30px -12px ${tint(22)}`, `0 26px 60px -20px ${tint(30)}`];
}

/** The runtime CSS variables for a theme. Tailwind's `@theme` block maps these to utilities. */
export function themeVariables(settings: ThemeSettings, mode: Mode): Record<string, string> {
  const p = buildPalette(settings, mode);
  const r = radii[settings.radius];
  const [shadow1, shadow2, shadow3] = shadows(p, mode);
  return {
    '--am-surface': p.surface,
    '--am-surface-raised': p.raised,
    '--am-surface-sunken': p.sunken,
    '--am-text': p.text,
    '--am-text-muted': p.muted,
    '--am-border': p.border,
    '--am-accent': p.accent,
    '--am-accent-contrast': p.accentContrast,
    '--am-accent-text': p.accentText,
    '--am-accent-2': p.accent2,
    '--am-accent-2-contrast': p.accent2Contrast,
    '--am-accent-3': p.accent3,
    '--am-accent-3-contrast': p.accent3Contrast,
    '--am-accent-4': p.accent4,
    '--am-accent-4-contrast': p.accent4Contrast,
    '--am-success': p.success,
    '--am-success-contrast': p.successContrast,
    '--am-warning': p.warning,
    '--am-warning-contrast': p.warningContrast,
    '--am-danger': p.danger,
    '--am-danger-contrast': p.dangerContrast,
    '--am-focus-ring': p.focus,
    '--am-radius-card': r.card,
    '--am-radius-control': r.control,
    '--am-radius-chip': r.chip,
    '--am-shadow-1': shadow1,
    '--am-shadow-2': shadow2,
    '--am-shadow-3': shadow3,
  };
}

export interface ContrastCheck {
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  pass: boolean;
}

/** The pairings the components actually draw. Text needs 4.5:1; UI edges and focus rings 3:1. */
export function contrastChecks(p: Palette): ContrastCheck[] {
  const pairs: [string, string, string, number][] = [
    ['Text on surface', p.text, p.surface, 4.5],
    ['Text on raised card', p.text, p.raised, 4.5],
    ['Muted text on surface', p.muted, p.surface, 4.5],
    ['Muted text on sunken well', p.muted, p.sunken, 4.5],
    ['Text on accent', p.accentContrast, p.accent, 4.5],
    ['Accent text on surface', p.accentText, p.surface, 4.5],
    ['Text on accent 2', p.accent2Contrast, p.accent2, 4.5],
    ['Text on accent 3', p.accent3Contrast, p.accent3, 4.5],
    ['Text on accent 4', p.accent4Contrast, p.accent4, 4.5],
    ['Text on danger', p.dangerContrast, p.danger, 4.5],
    ['Accent as a UI edge on surface', p.accent, p.surface, 3],
    ['Focus ring on surface', p.focus, p.surface, 3],
  ];
  return pairs.map(([label, foreground, background, required]) => {
    const ratio = contrast(foreground, background);
    return { label, foreground, background, ratio, required, pass: ratio >= required };
  });
}
