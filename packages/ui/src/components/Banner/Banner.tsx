import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../cx';
import { soft, type Tone } from '../tones';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

const config: Record<BannerTone, { tone: Tone; icon: ReactNode; iconClass: string }> = {
  info: {
    tone: 'accent',
    icon: <Info className="size-5" aria-hidden />,
    iconClass: 'text-accent-ink',
  },
  success: {
    tone: 'success',
    icon: <CircleCheck className="size-5" aria-hidden />,
    iconClass: 'text-success',
  },
  warning: {
    tone: 'warning',
    icon: <TriangleAlert className="size-5" aria-hidden />,
    iconClass: 'text-warning',
  },
  danger: {
    tone: 'danger',
    icon: <CircleAlert className="size-5" aria-hidden />,
    iconClass: 'text-danger',
  },
};

interface BannerProps extends Omit<ComponentProps<'div'>, 'title'> {
  tone?: BannerTone;
  title?: ReactNode;
  action?: ReactNode;
}

export function Banner({
  tone = 'info',
  title,
  action,
  className,
  children,
  ...props
}: BannerProps) {
  const { tone: color, icon, iconClass } = config[tone];
  return (
    <div
      className={cx(
        'flex items-start gap-2.5 rounded-control border px-3 py-2.5 text-[13px]',
        soft[color],
        className,
      )}
      {...props}
    >
      <span className={cx('mt-px shrink-0', iconClass)}>{icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'text-muted' : undefined}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
