import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../cx';
import { dot, halo, soft, type Tone } from '../tones';

const chipBase =
  'inline-flex h-7 items-center gap-1.5 rounded-chip border px-[11px] text-xs font-semibold whitespace-nowrap text-fg';

interface ChipProps extends ComponentProps<'span'> {
  tone?: Tone;
  /** Shows a colored status dot before the label. */
  withDot?: boolean;
  /** Adds a soft halo to the dot, for an in-progress state. */
  pulse?: boolean;
  icon?: ReactNode;
}

export function Chip({
  tone = 'neutral',
  withDot = tone !== 'neutral',
  pulse = false,
  icon,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span className={cx(chipBase, soft[tone], className)} {...props}>
      {withDot && (
        <span
          aria-hidden
          className={cx('size-2 rounded-full', dot[tone], pulse && cx('ring-[3px]', halo[tone]))}
        />
      )}
      {icon}
      {children}
    </span>
  );
}

interface FilterChipProps extends Omit<ComponentProps<'button'>, 'onChange'> {
  selected: boolean;
  onSelectedChange: (selected: boolean) => void;
  icon?: ReactNode;
}

export function FilterChip({
  selected,
  onSelectedChange,
  icon,
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelectedChange(!selected)}
      className={cx(
        chipBase,
        'cursor-pointer transition duration-150 ease-spring hover:-translate-y-px',
        selected ? 'border-fg bg-fg text-surface' : 'border-line bg-raised',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
