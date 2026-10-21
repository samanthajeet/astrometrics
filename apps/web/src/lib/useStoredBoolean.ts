import { useState } from 'react';

function read(key: string, fallback: boolean): boolean {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

export function useStoredBoolean(key: string, fallback: boolean) {
  const [value, setValue] = useState(() => read(key, fallback));
  const update = (next: boolean) => {
    setValue(next);
    try {
      localStorage.setItem(key, String(next));
    } catch {
      // Storage can be unavailable (private mode); the preference just won't persist.
    }
  };
  return [value, update] as const;
}
