import type { ReactNode } from 'react';
import { cx } from '../cx';

function Orbit() {
  return (
    <svg viewBox="0 0 120 92" className="h-[92px] w-[120px]" aria-hidden>
      <ellipse
        cx="60"
        cy="50"
        rx="52"
        ry="16"
        fill="none"
        className="stroke-line"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <circle cx="60" cy="46" r="22" className="fill-accent" />
      <path
        d="M44 38a22 22 0 0 1 22-14"
        fill="none"
        className="stroke-on-accent"
        strokeOpacity=".5"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="104" cy="56" r="5" className="fill-accent-2" />
      <circle cx="22" cy="20" r="1.6" className="fill-muted" />
      <circle cx="98" cy="14" r="2.2" className="fill-accent-3" />
      <circle cx="12" cy="66" r="1.4" className="fill-muted" />
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx('flex flex-col items-center gap-2.5 px-1.5 pt-2.5 pb-1 text-center', className)}
    >
      {illustration ?? <Orbit />}
      <h4 className="text-[15px] font-bold">{title}</h4>
      {description && <p className="max-w-60 text-[13px] text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
