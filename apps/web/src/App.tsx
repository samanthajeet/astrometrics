import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Rail, type View } from './components/Rail';
import { Settings } from './components/Settings';
import { useStoredBoolean } from './lib/useStoredBoolean';

export function App() {
  const [view, setView] = useState<View>('dashboard');
  const [collapsed, setCollapsed] = useStoredBoolean('astrometrics.rail-collapsed', false);

  return (
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
    </div>
  );
}
