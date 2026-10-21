import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  buildPalette,
  contrastChecks,
  defaultThemeSettings,
  themeSettingsSchema,
  themeVariables,
  type ContrastCheck,
  type Mode,
  type Palette,
  type ThemeSettings,
} from './theme';

export const THEME_STORAGE_KEY = 'astrometrics.theme';

interface ThemeContextValue {
  settings: ThemeSettings;
  setSettings: (patch: Partial<ThemeSettings>) => void;
  /** `settings.mode` with `system` resolved. */
  mode: Mode;
  palette: Palette;
  checks: ContrastCheck[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const darkQuery = '(prefers-color-scheme: dark)';

function subscribeToSystemMode(onChange: () => void) {
  const query = window.matchMedia(darkQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useSystemMode(): Mode {
  return useSyncExternalStore(
    subscribeToSystemMode,
    () => (window.matchMedia(darkQuery).matches ? 'dark' : 'light'),
    () => 'dark',
  );
}

function loadSettings(storageKey: string | null): ThemeSettings {
  if (!storageKey) return defaultThemeSettings;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultThemeSettings;
    const parsed = themeSettingsSchema.safeParse({ ...defaultThemeSettings, ...JSON.parse(raw) });
    return parsed.success ? parsed.data : defaultThemeSettings;
  } catch {
    return defaultThemeSettings;
  }
}

function saveSettings(storageKey: string | null, settings: ThemeSettings) {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable (private mode); the theme just won't persist.
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Controlled settings. When omitted, settings load from and save to `storageKey`. */
  settings?: ThemeSettings;
  onSettingsChange?: (settings: ThemeSettings) => void;
  storageKey?: string | null;
}

export function ThemeProvider({
  children,
  settings: controlled,
  onSettingsChange,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [stored, setStored] = useState(() => loadSettings(controlled ? null : storageKey));
  const settings = controlled ?? stored;
  const systemMode = useSystemMode();
  const mode = settings.mode === 'system' ? systemMode : settings.mode;

  const setSettings = useCallback(
    (patch: Partial<ThemeSettings>) => {
      const next = { ...settings, ...patch };
      if (controlled) {
        onSettingsChange?.(next);
        return;
      }
      setStored(next);
      saveSettings(storageKey, next);
      onSettingsChange?.(next);
    },
    [settings, controlled, onSettingsChange, storageKey],
  );

  const variables = useMemo(() => themeVariables(settings, mode), [settings, mode]);
  const palette = useMemo(() => buildPalette(settings, mode), [settings, mode]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
    root.dataset.amMode = mode;
    root.dataset.amTheme = settings.preset;
    root.style.colorScheme = mode;
  }, [variables, mode, settings.preset]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    return () => {
      for (const name of Object.keys(variables)) root.style.removeProperty(name);
      delete root.dataset.amMode;
      delete root.dataset.amTheme;
      root.style.removeProperty('color-scheme');
    };
    // Cleanup only on unmount; the effect above keeps the values current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ settings, setSettings, mode, palette, checks: contrastChecks(palette) }),
    [settings, setSettings, mode, palette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>.');
  return value;
}
