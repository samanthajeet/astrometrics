import { Banner, Button, EmptyState } from '@astrometrics/ui';
import { credentialProviders, type CredentialProviderId } from '@astrometrics/widget-sdk';
import { Plug } from 'lucide-react';

export function MissingCredentialNotice({
  provider,
  onOpenSettings,
}: {
  provider: CredentialProviderId;
  onOpenSettings: () => void;
}) {
  const { label } = credentialProviders[provider];
  return (
    <EmptyState
      title={`Connect ${label} to use this widget`}
      description="Add the credential in Settings and this widget fills in on its next refresh."
      action={
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenSettings}
          leadingIcon={<Plug className="size-4" aria-hidden />}
        >
          Open Settings
        </Button>
      }
    />
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <Banner tone="danger" title="Couldn’t load this widget" role="alert">
      {message}
    </Banner>
  );
}

export function StaleNotice({ message }: { message?: string }) {
  return (
    <Banner tone="warning" title="Showing cached data" className="mt-3">
      {message}
    </Banner>
  );
}

export function UnknownWidgetNotice({ type }: { type: string }) {
  return <p className="text-sm text-muted">Unknown widget type “{type}”.</p>;
}
