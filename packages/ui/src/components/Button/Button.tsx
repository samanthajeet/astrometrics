import type { ComponentProps, ReactNode } from 'react';
import { cx } from '../cx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border border-transparent font-semibold whitespace-nowrap transition duration-150 ease-spring ' +
  'enabled:hover:-translate-y-px enabled:hover:shadow-1 enabled:active:translate-y-px enabled:active:scale-[.97] enabled:active:shadow-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-accent enabled:hover:bg-[color-mix(in_oklab,var(--am-accent)_88%,var(--am-text))]',
  secondary:
    'border-line bg-raised text-fg enabled:hover:border-[color-mix(in_oklab,var(--am-border)_50%,var(--am-text))]',
  ghost: 'bg-transparent text-fg enabled:hover:bg-sunken enabled:hover:shadow-none',
  danger: 'bg-danger text-on-danger',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-[34px] px-3 text-[13px] gap-1.5',
  md: 'h-11 px-[18px] text-sm',
  lg: 'h-[52px] px-6 text-base',
};

const squareSizes: Record<ButtonSize, string> = {
  sm: 'size-[34px]',
  md: 'size-11',
  lg: 'size-[52px]',
};

export function buttonClasses({
  variant = 'secondary',
  size = 'md',
  square = false,
}: { variant?: ButtonVariant; size?: ButtonSize; square?: boolean } = {}) {
  return cx(base, variants[variant], square ? squareSizes[size] : sizes[size]);
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={cx(buttonClasses({ variant, size }), className)} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'children' | 'aria-label'> {
  /** The accessible name; icon-only buttons have no visible text. */
  label: string;
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size,
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(buttonClasses({ variant, size, square: true }), 'p-0', className)}
      {...props}
    >
      {icon}
    </button>
  );
}
