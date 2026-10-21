import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../cx';
import { solid, type Tone } from '../tones';

interface CardProps extends Omit<ComponentProps<'section'>, 'title'> {
  title?: ReactNode;
  /** Small mono label under the title. */
  eyebrow?: ReactNode;
  /** Controls at the right of the header, e.g. a menu or a segmented control. */
  action?: ReactNode;
}

export function Card({ title, eyebrow, action, className, children, ...props }: CardProps) {
  const hasHeader = title || eyebrow || action;
  return (
    <section
      className={cx(
        'min-w-0 rounded-card border border-line bg-raised px-6 py-[22px] shadow-1',
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="text-base font-bold">{title}</h3>}
            {eyebrow && <Eyebrow className="mt-0.5">{eyebrow}</Eyebrow>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cx(
        'font-mono text-[11px] font-semibold tracking-[0.14em] text-muted uppercase',
        className,
      )}
      {...props}
    />
  );
}

interface TileProps extends ComponentProps<'div'> {
  tone?: Exclude<Tone, 'neutral'>;
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
  /** LCARS-style cut corners. */
  chamfer?: boolean;
}

/** A bold stat tile in an accent color. */
export function Tile({
  tone = 'accent',
  label,
  value,
  detail,
  chamfer = false,
  className,
  ...props
}: TileProps) {
  return (
    <div
      className={cx(
        'relative flex min-h-[132px] flex-col justify-between rounded-card px-[22px] py-5 transition-transform duration-300 ease-spring hover:-translate-y-[3px] hover:-rotate-[0.4deg]',
        solid[tone],
        chamfer && 'chamfer',
        className,
      )}
      {...props}
    >
      <p className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase">{label}</p>
      <p className="font-display text-[52px] leading-none font-semibold">{value}</p>
      {detail && <p className="text-sm font-semibold">{detail}</p>}
    </div>
  );
}
