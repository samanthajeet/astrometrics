import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type ComponentProps, type ReactNode } from 'react';
import { IconButton } from '../Button/Button';
import { cx } from '../cx';

export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

interface FieldProps {
  label: string;
  help?: ReactNode;
  /** Replaces the help text and marks the control invalid. */
  error?: ReactNode;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

export function Field({ label, help, error, className, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? help;

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
      </label>
      {children({
        id,
        'aria-describedby': message ? messageId : undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {message && (
        <p id={messageId} className={cx('text-xs', error ? 'text-danger' : 'text-muted')}>
          {message}
        </p>
      )}
    </div>
  );
}

const inputClasses =
  'h-11 w-full rounded-control border border-line bg-sunken px-3.5 text-fg transition-[border-color,box-shadow] duration-150 placeholder:text-muted ' +
  'focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_color-mix(in_oklab,var(--am-focus-ring)_30%,transparent)] focus-visible:outline-none ' +
  'aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cx(inputClasses, className)} {...props} />;
}

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative flex items-center">
      <Input
        type={visible ? 'text' : 'password'}
        autoComplete="off"
        spellCheck={false}
        className={cx('pr-12 font-mono', className)}
        {...props}
      />
      <IconButton
        label={visible ? 'Hide value' : 'Show value'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        icon={visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        className="absolute right-0 text-muted hover:text-fg"
      />
    </div>
  );
}
