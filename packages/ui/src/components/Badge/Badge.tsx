import type { ComponentProps } from 'react';
import { cx } from '../cx';
import { solid, type Tone } from '../tones';

interface BadgeProps extends ComponentProps<'span'> {
  tone?: Tone;
  variant?: 'solid' | 'outline';
  /** A round counter, e.g. unread notifications. */
  count?: boolean;
}

export function Badge({
  tone = 'neutral',
  variant = 'solid',
  count = false,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cx(
        'inline-flex h-[22px] items-center gap-1 px-2 text-[11px] font-bold tracking-[0.02em] whitespace-nowrap',
        count
          ? 'min-w-[22px] justify-center rounded-full font-mono'
          : 'rounded-[calc(var(--am-radius-chip)-2px)]',
        variant === 'outline' ? 'border border-line bg-transparent text-fg' : solid[tone],
        tone === 'neutral' && variant === 'solid' && 'border border-line',
        className,
      )}
      {...props}
    />
  );
}
