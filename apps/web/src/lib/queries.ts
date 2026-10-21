import type {
  Column,
  CredentialProviderId,
  TitleDetails,
  TitleSearchResult,
  WatchlistItem,
  WatchlistKind,
  WatchlistStatus,
} from '@astrometrics/widget-sdk';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { api, type CredentialStatus, type Dashboard, type Layout, type WidgetData } from './api';

const keys = {
  dashboard: ['dashboard'] as const,
  credentials: ['credentials'] as const,
  widgetData: (id: string) => ['widget-data', id] as const,
  watchlist: ['watchlist'] as const,
  watchlistSearch: (query: string) => ['watchlist-search', query] as const,
  titleDetails: (id: string) => ['title-details', id] as const,
};

/** The server clears cached data for widgets that read the watchlist; refetch them too. */
function invalidateWatchlist(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: keys.watchlist });
  void queryClient.invalidateQueries({ queryKey: ['watchlist-search'] });
  void queryClient.invalidateQueries({ queryKey: ['widget-data'] });
}

export function useWatchlist() {
  return useQuery({
    queryKey: keys.watchlist,
    queryFn: () => api<WatchlistItem[]>('/api/watchlist'),
  });
}

export function useWatchlistSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: keys.watchlistSearch(trimmed),
    queryFn: () =>
      api<TitleSearchResult[]>(`/api/watchlist/search?q=${encodeURIComponent(trimmed)}`),
    enabled: trimmed.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useTitleDetails(id: string | null) {
  return useQuery({
    queryKey: keys.titleDetails(id ?? ''),
    queryFn: () => api<TitleDetails>(`/api/watchlist/${id}/details`),
    enabled: id !== null,
    staleTime: 60 * 60_000,
    retry: false,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { kind: WatchlistKind; tmdbId: number; status?: WatchlistStatus }) =>
      api<WatchlistItem>('/api/watchlist', { method: 'POST', body: JSON.stringify(body) }),
    onSettled: () => invalidateWatchlist(queryClient),
  });
}

export function useSetWatchlistStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WatchlistStatus }) =>
      api<WatchlistItem>(`/api/watchlist/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onMutate: ({ id, status }) => {
      queryClient.setQueryData<WatchlistItem[]>(keys.watchlist, (items) =>
        items?.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    },
    onSettled: () => invalidateWatchlist(queryClient),
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/watchlist/${id}`, { method: 'DELETE' }),
    onSettled: () => invalidateWatchlist(queryClient),
  });
}

export function useDashboard() {
  return useQuery({ queryKey: keys.dashboard, queryFn: () => api<Dashboard>('/api/dashboard') });
}

export function useAddWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { type: string; column: Column }) =>
      api('/api/dashboard/widgets', { method: 'POST', body: JSON.stringify(body) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.dashboard }),
  });
}

export function useRemoveWidget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/api/dashboard/widgets/${id}`, { method: 'DELETE' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.dashboard }),
  });
}

export function useSaveLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (layout: Layout) =>
      api('/api/dashboard/layout', { method: 'PUT', body: JSON.stringify(layout) }),
    onMutate: (layout) => {
      queryClient.setQueryData<Dashboard>(keys.dashboard, (dashboard) => {
        if (!dashboard) return dashboard;
        const placement = new Map<string, { column: Column; position: number }>();
        for (const column of ['main', 'side'] as const) {
          layout[column].forEach((id, position) => placement.set(id, { column, position }));
        }
        return {
          ...dashboard,
          widgets: dashboard.widgets.map((w) => ({ ...w, ...placement.get(w.id) })),
        };
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.dashboard }),
  });
}

export function useWidgetData(id: string, refreshMs: number | null) {
  return useQuery({
    queryKey: keys.widgetData(id),
    queryFn: () => api<WidgetData>(`/api/widgets/${id}/data`),
    enabled: refreshMs !== null,
    refetchInterval: refreshMs ?? false,
  });
}

export function useCredentials() {
  return useQuery({
    queryKey: keys.credentials,
    queryFn: () => api<CredentialStatus[]>('/api/credentials'),
  });
}

export function useSetCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, value }: { provider: CredentialProviderId; value: string }) =>
      api(`/api/credentials/${provider}`, { method: 'PUT', body: JSON.stringify({ value }) }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: keys.credentials });
      void queryClient.invalidateQueries({ queryKey: ['widget-data'] });
    },
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: CredentialProviderId) =>
      api(`/api/credentials/${provider}`, { method: 'DELETE' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.credentials }),
  });
}
