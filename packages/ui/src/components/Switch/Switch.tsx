import * as SwitchPrimitive from '@radix-ui/react-switch';
import { useId, type ReactNode } from 'react';
import { cx } from '../cx';

type SwitchProps = Omit<SwitchPrimitive.SwitchProps, 'children'>;

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cx(
        'relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-line bg-sunken p-[3px] transition-colors duration-300 ease-out',
        'data-[state=checked]:border-transparent data-[state=checked]:bg-accent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cx(
          'block size-6 rounded-full bg-muted transition-[transform,background-color,width] duration-300 ease-spring',
          'data-[state=checked]:translate-x-6 data-[state=checked]:bg-on-accent',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

interface SwitchRowProps extends SwitchProps {
  label: string;
  description?: ReactNode;
}

/** A labeled switch with optional description, for settings lists. */
export function SwitchRow({ label, description, ...props }: SwitchRowProps) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {description && (
          <span id={`${id}-description`} className="text-[13px] text-muted">
            {description}
          </span>
        )}
      </div>
      <Switch id={id} aria-describedby={description ? `${id}-description` : undefined} {...props} />
    </div>
  );
}
