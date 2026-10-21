import type { Column, CredentialProviderId } from '@astrometrics/widget-sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type CredentialStatus, type Dashboard, type Layout, type WidgetData } from './api';

const keys = {
  dashboard: ['dashboard'] as const,
  credentials: ['credentials'] as const,
  widgetData: (id: string) => ['widget-data', id] as const,
};

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
