import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, UserRound } from 'lucide-react';
import type { ComponentType } from 'react';

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

export function Rail({ view, onNavigate, collapsed, onToggle }: RailProps) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <nav
      aria-label="Primary"
      className={`flex shrink-0 flex-col border-r border-edge bg-panel transition-[width] ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lcars-orange text-space">
          <UserRound className="size-5" aria-hidden />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Astrometrics</p>
            <p className="truncate text-xs text-slate-400">Local</p>
          </div>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-2">
        {items.map(({ view: target, label, Icon }) => (
          <li key={target}>
            <button
              type="button"
              onClick={() => onNavigate(target)}
              aria-current={view === target ? 'page' : undefined}
              aria-label={collapsed ? label : undefined}
              title={collapsed ? label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                view === target
                  ? 'bg-panel-raised text-lcars-gold'
                  : 'text-slate-300 hover:bg-panel-raised'
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && label}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="m-2 flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-panel-raised"
      >
        <ToggleIcon className="size-5" />
      </button>
    </nav>
  );
}
