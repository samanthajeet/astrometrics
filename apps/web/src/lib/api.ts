import type { Column, CredentialProviderId } from '@astrometrics/widget-sdk';

export interface WidgetInstance {
  id: string;
  type: string;
  column: Column;
  position: number;
  settings: unknown;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: WidgetInstance[];
}

export interface CredentialStatus {
  provider: CredentialProviderId;
  configured: boolean;
}

export interface WidgetData {
  data: unknown;
  fetchedAt: string;
  stale: boolean;
  error?: string;
}

export interface Layout {
  main: string[];
  side: string[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: { error?: string; provider?: CredentialProviderId; message?: string } | null,
  ) {
    super(body?.message ?? body?.error ?? `Request failed (${status})`);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'x-astrometrics': '1', 'content-type': 'application/json', ...init.headers },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
