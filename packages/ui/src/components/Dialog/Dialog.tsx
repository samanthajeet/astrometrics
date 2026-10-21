import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from '../Button/Button';
import { cx } from '../cx';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Pinned below the scrolling body, e.g. actions or attribution. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * A modal built on the native `<dialog>`, so the browser handles Escape, focus containment, and
 * making the rest of the page inert. Children unmount while closed, so their state resets.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  footer,
  className,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onClose={() => onOpenChange(false)}
      // The dialog element itself is only hit outside the panel, i.e. on the backdrop.
      onClick={(event) => event.target === event.currentTarget && onOpenChange(false)}
      className={cx(
        'm-auto max-h-[min(88vh,820px)] w-[min(720px,calc(100vw-32px))] overflow-hidden rounded-card border border-line bg-raised p-0 text-fg shadow-3',
        'backdrop:bg-[color-mix(in_oklab,var(--am-surface)_65%,transparent)] backdrop:backdrop-blur-[2px]',
        'open:flex open:flex-col',
        className,
      )}
    >
      {open && (
        <>
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
            <div className="min-w-0">
              <h2
                id={`${id}-title`}
                className="font-display text-[28px] leading-none font-semibold tracking-[0.04em] uppercase"
              >
                {title}
              </h2>
              {description && (
                <p id={`${id}-description`} className="mt-1.5 text-sm text-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton
              label="Close"
              onClick={() => onOpenChange(false)}
              icon={<X className="size-5" />}
              className="-mt-1 -mr-2 text-muted hover:text-fg"
            />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          {footer && <footer className="border-t border-line px-6 py-3">{footer}</footer>}
        </>
      )}
    </dialog>
  );
}
