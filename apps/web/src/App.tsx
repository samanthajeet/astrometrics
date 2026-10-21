import { WidgetHostProvider, type WidgetHost } from '@astrometrics/widget-sdk';
import { useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Rail, type View } from './components/Rail';
import { Settings } from './components/Settings';
import { TitleDetailsModal } from './components/TitleDetailsModal';
import { WatchlistModal } from './components/WatchlistModal';
import { useStoredBoolean } from './lib/useStoredBoolean';

export function App() {
  const [view, setView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useStoredBoolean('astrometrics.rail-collapsed', false);
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [titleId, setTitleId] = useState<string | null>(null);
  const host = useMemo<WidgetHost>(
    () => ({ openWatchlist: () => setWatchlistOpen(true), openTitle: setTitleId }),
    [],
  );

  return (
    <WidgetHostProvider value={host}>
      <div className="flex h-screen overflow-hidden">
        <Rail
          view={view}
          onNavigate={setView}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className="starfield flex-1 overflow-y-auto">
          {view === 'dashboard' ? (
            <Dashboard onOpenSettings={() => setView('settings')} />
          ) : (
            <Settings />
          )}
        </main>
        <WatchlistModal
          open={watchlistOpen}
          onOpenChange={setWatchlistOpen}
          onOpenSettings={() => setView('settings')}
        />
        <TitleDetailsModal
          id={titleId}
          onClose={() => setTitleId(null)}
          onOpenSettings={() => setView('settings')}
        />
      </div>
    </WidgetHostProvider>
  );
}
