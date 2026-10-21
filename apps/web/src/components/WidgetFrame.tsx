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
      className={`rounded-xl border border-edge bg-panel ${dimmed ? 'opacity-60' : ''}`}
    >
      <header className="flex items-center gap-2 border-b border-edge px-3 py-2">
        {handle}
        <h3 className="flex-1 truncate text-sm font-medium text-lcars-gold">{title}</h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${title}`}
            className="rounded p-0.5 text-slate-500 hover:text-lcars-red"
          >
            <X className="size-4" />
          </button>
        )}
      </header>
      <div className="p-4">{children}</div>
    </article>
  );
}

export function DragHandle({ label, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="cursor-grab rounded p-0.5 text-slate-500 hover:text-slate-300 active:cursor-grabbing"
      {...props}
    >
      <GripVertical className="size-4" />
    </button>
  );
}
