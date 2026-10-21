import { buttonClasses, cx, IconButton } from '@astrometrics/ui';
import { GripVertical, X } from 'lucide-react';
import type { ComponentProps, CSSProperties, ReactNode, Ref } from 'react';

interface WidgetFrameProps {
  ref?: Ref<HTMLElement>;
  title: string;
  handle?: ReactNode;
  onRemove?: () => void;
  dimmed?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

export function WidgetFrame({
  ref,
  title,
  handle,
  onRemove,
  dimmed,
  style,
  children,
}: WidgetFrameProps) {
  return (
    <article
      ref={ref}
      style={style}
      className={cx(
        'flex min-w-0 flex-col rounded-card border border-line bg-raised shadow-1 transition-[translate,opacity] duration-300 ease-spring hover:-translate-y-[3px]',
        dimmed && 'opacity-60',
      )}
    >
      <header className="flex items-center gap-1.5 pt-2.5 pr-2.5 pl-1.5">
        {handle}
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-bold">{title}</h3>
        {onRemove && (
          <IconButton
            label={`Remove ${title}`}
            onClick={onRemove}
            icon={<X className="size-5" />}
            className="text-muted hover:text-danger"
          />
        )}
      </header>
      <div className="min-w-0 px-5 pt-1.5 pb-5">{children}</div>
    </article>
  );
}

export function DragHandle({
  label,
  className,
  ...props
}: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(
        buttonClasses({ variant: 'ghost', square: true }),
        'cursor-grab p-0 text-muted hover:text-fg active:cursor-grabbing',
        className,
      )}
      {...props}
    >
      <GripVertical className="size-5" />
    </button>
  );
}
