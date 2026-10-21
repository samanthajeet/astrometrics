import { cx } from '../cx';
import { hatch, solid, type Tone } from '../tones';

export interface ProgressSegment {
  value: number;
  tone?: Tone;
  label: string;
}

interface ProgressBarProps {
  /** Names the bar for assistive tech. */
  label: string;
  max?: number;
  /** One value, or several stacked segments (e.g. used and planned PTO). */
  value?: number;
  segments?: ProgressSegment[];
  tone?: Tone;
  size?: 'md' | 'lg';
  hatched?: boolean;
  className?: string;
}

export function ProgressBar({
  label,
  max = 100,
  value = 0,
  segments,
  tone = 'accent',
  size = 'md',
  hatched = true,
  className,
}: ProgressBarProps) {
  const parts = segments ?? [{ value, tone, label }];
  const total = parts.reduce((sum, p) => sum + p.value, 0);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(total, max)}
      aria-valuetext={
        segments ? segments.map((s) => `${s.label} ${s.value}`).join(', ') : undefined
      }
      className={cx(
        'flex overflow-hidden rounded-full border border-line bg-sunken',
        size === 'lg' ? 'h-[18px]' : 'h-3',
        className,
      )}
    >
      {parts.map((part) => (
        <div
          key={part.label}
          className={cx(
            'h-full transition-[width] duration-500 ease-out first:rounded-l-full',
            hatched ? hatch[part.tone ?? tone] : solid[part.tone ?? tone],
          )}
          style={{ width: `${Math.min(100, (part.value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
