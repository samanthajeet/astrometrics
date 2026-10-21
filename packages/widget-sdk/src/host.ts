import { createContext, useContext } from 'react';

/** Things a widget view can ask the app to do. The app provides it around every widget. */
export interface WidgetHost {
  openWatchlist(): void;
  /** Opens a watchlist item's details, where its status can be changed or it can be removed. */
  openTitle(id: string): void;
}

const WidgetHostContext = createContext<WidgetHost | null>(null);

export const WidgetHostProvider = WidgetHostContext.Provider;

export function useWidgetHost(): WidgetHost {
  const host = useContext(WidgetHostContext);
  if (!host) throw new Error('useWidgetHost must be used inside <WidgetHostProvider>.');
  return host;
}
