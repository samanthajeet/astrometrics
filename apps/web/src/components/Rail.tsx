import { Avatar, cx, Tooltip } from '@astrometrics/ui';
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react';
import type { ComponentType, ReactElement } from 'react';

export type View = 'dashboard' | 'settings';

interface RailProps {
  view: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const items: { view: View; label: string; Icon: ComponentType<{ className?: string }> }[] = [
  { view: 'dashboard', label: 'Bridge', Icon: LayoutDashboard },
  { view: 'settings', label: 'Settings', Icon: Settings },
];

const rowClasses =
  'flex h-11 w-full cursor-pointer items-center gap-3 rounded-control px-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150';

export function Rail({ view, onNavigate, collapsed, onToggle }: RailProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const withTooltip = (label: string, control: ReactElement) =>
    collapsed ? (
      <Tooltip content={label} side="right">
        {control}
      </Tooltip>
    ) : (
      control
    );

  return (
    <nav
      aria-label="Primary"
      className={cx(
        'flex shrink-0 flex-col gap-1.5 border-r border-line bg-sunken px-3 py-5 transition-[width] duration-300 ease-out',
        collapsed ? 'w-[72px]' : 'w-60',
      )}
    >
      <div className={cx('flex items-center gap-3 pb-5', collapsed ? 'justify-center' : 'px-1')}>
        <Avatar name="Astrometrics" status="online" />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-bold">Astrometrics</p>
            <p className="truncate text-xs text-muted">Local</p>
          </div>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {items.map(({ view: target, label, Icon }) => (
          <li key={target}>
            {withTooltip(
              label,
              <button
                type="button"
                onClick={() => onNavigate(target)}
                aria-current={view === target ? 'page' : undefined}
                aria-label={collapsed ? label : undefined}
                className={cx(
                  rowClasses,
                  collapsed && 'justify-center px-0',
                  view === target
                    ? 'bg-accent text-on-accent'
                    : 'text-muted hover:bg-raised hover:text-fg',
                )}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && label}
              </button>,
            )}
          </li>
        ))}
      </ul>

      {withTooltip(
        collapsed ? 'Expand sidebar' : 'Collapse sidebar',
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={cx(
            rowClasses,
            'border border-dashed border-line text-muted hover:border-solid hover:text-fg',
            collapsed && 'justify-center px-0',
          )}
        >
          <ToggleIcon className="size-5 shrink-0" />
          {!collapsed && 'Collapse'}
        </button>,
      )}
    </nav>
  );
}
