import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '../cx';

export const Menu = DropdownMenu.Root;
export const MenuTrigger = DropdownMenu.Trigger;
export const MenuGroup = DropdownMenu.Group;

export function MenuContent({
  className,
  sideOffset = 6,
  align = 'end',
  ...props
}: DropdownMenu.DropdownMenuContentProps) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={sideOffset}
        align={align}
        className={cx(
          'z-50 min-w-56 rounded-control border border-line bg-raised p-1.5 text-fg shadow-3',
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

const itemClasses =
  'flex h-10 cursor-pointer items-center gap-2.5 rounded-[calc(var(--am-radius-control)-4px)] px-3 text-sm outline-none select-none ' +
  'data-[highlighted]:bg-sunken data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50';

interface MenuItemProps extends DropdownMenu.DropdownMenuItemProps {
  icon?: ReactNode;
  shortcut?: string;
  destructive?: boolean;
}

export function MenuItem({
  icon,
  shortcut,
  destructive,
  className,
  children,
  ...props
}: MenuItemProps) {
  return (
    <DropdownMenu.Item
      className={cx(itemClasses, destructive && 'text-danger', className)}
      {...props}
    >
      {icon && <span className={cx('shrink-0', !destructive && 'text-muted')}>{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && <kbd className="font-mono text-[11px] text-muted">{shortcut}</kbd>}
    </DropdownMenu.Item>
  );
}

export function MenuCheckboxItem({
  className,
  children,
  ...props
}: DropdownMenu.DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenu.CheckboxItem className={cx(itemClasses, className)} {...props}>
      <span className="flex size-4 shrink-0 items-center justify-center">
        <DropdownMenu.ItemIndicator>
          <Check className="size-4 text-accent-ink" aria-hidden />
        </DropdownMenu.ItemIndicator>
      </span>
      <span className="flex-1">{children}</span>
    </DropdownMenu.CheckboxItem>
  );
}

export function MenuLabel({ className, ...props }: DropdownMenu.DropdownMenuLabelProps) {
  return (
    <DropdownMenu.Label
      className={cx(
        'px-3 pt-2 pb-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-muted uppercase',
        className,
      )}
      {...props}
    />
  );
}

export function MenuSeparator({ className, ...props }: DropdownMenu.DropdownMenuSeparatorProps) {
  return <DropdownMenu.Separator className={cx('my-1.5 h-px bg-line', className)} {...props} />;
}
