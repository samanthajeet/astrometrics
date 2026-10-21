export type Tone =
  'accent' | 'accent-2' | 'accent-3' | 'accent-4' | 'success' | 'warning' | 'danger' | 'neutral';

export const tones: readonly Tone[] = [
  'accent',
  'accent-2',
  'accent-3',
  'accent-4',
  'success',
  'warning',
  'danger',
  'neutral',
];

// Full class strings, so Tailwind can find them.
export const solid: Record<Tone, string> = {
  accent: 'bg-accent text-on-accent',
  'accent-2': 'bg-accent-2 text-on-accent-2',
  'accent-3': 'bg-accent-3 text-on-accent-3',
  'accent-4': 'bg-accent-4 text-on-accent-4',
  success: 'bg-success text-on-success',
  warning: 'bg-warning text-on-warning',
  danger: 'bg-danger text-on-danger',
  neutral: 'bg-sunken text-fg',
};

export const soft: Record<Tone, string> = {
  accent:
    'bg-[color-mix(in_oklab,var(--am-accent)_16%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-accent)_45%,var(--am-border))]',
  'accent-2':
    'bg-[color-mix(in_oklab,var(--am-accent-2)_16%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-accent-2)_45%,var(--am-border))]',
  'accent-3':
    'bg-[color-mix(in_oklab,var(--am-accent-3)_16%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-accent-3)_45%,var(--am-border))]',
  'accent-4':
    'bg-[color-mix(in_oklab,var(--am-accent-4)_16%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-accent-4)_45%,var(--am-border))]',
  success:
    'bg-[color-mix(in_oklab,var(--am-success)_14%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-success)_40%,var(--am-border))]',
  warning:
    'bg-[color-mix(in_oklab,var(--am-warning)_14%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-warning)_50%,var(--am-border))]',
  danger:
    'bg-[color-mix(in_oklab,var(--am-danger)_12%,var(--am-surface-raised))] border-[color-mix(in_oklab,var(--am-danger)_50%,var(--am-border))]',
  neutral: 'bg-raised border-line',
};

export const dot: Record<Tone, string> = {
  accent: 'bg-accent',
  'accent-2': 'bg-accent-2',
  'accent-3': 'bg-accent-3',
  'accent-4': 'bg-accent-4',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-muted',
};

export const hatch: Record<Tone, string> = {
  accent: 'hatch-accent',
  'accent-2': 'hatch-accent-2',
  'accent-3': 'hatch-accent-3',
  'accent-4': 'hatch-accent-4',
  success: 'hatch-success',
  warning: 'hatch-warning',
  danger: 'hatch-danger',
  neutral: 'hatch-muted',
};

/** Text color in the tone, for graphics drawn with currentColor. */
export const graphic: Record<Tone, string> = {
  accent: 'text-accent',
  'accent-2': 'text-accent-2',
  'accent-3': 'text-accent-3',
  'accent-4': 'text-accent-4',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  neutral: 'text-muted',
};

export const halo: Record<Tone, string> = {
  accent: 'ring-accent/30',
  'accent-2': 'ring-accent-2/30',
  'accent-3': 'ring-accent-3/30',
  'accent-4': 'ring-accent-4/30',
  success: 'ring-success/30',
  warning: 'ring-warning/30',
  danger: 'ring-danger/30',
  neutral: 'ring-muted/30',
};
