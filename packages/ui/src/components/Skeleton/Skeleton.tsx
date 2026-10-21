import type { ComponentProps } from 'react';
import { cx } from '../cx';

/** A shimmering placeholder. Size it with width and height classes. */
export function Skeleton({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cx(
        'block h-4 animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--am-surface-sunken)_0%,color-mix(in_oklab,var(--am-surface-sunken)_40%,var(--am-surface-raised))_50%,var(--am-surface-sunken)_100%)] bg-[length:220%_100%]',
        className,
      )}
      {...props}
    />
  );
}
