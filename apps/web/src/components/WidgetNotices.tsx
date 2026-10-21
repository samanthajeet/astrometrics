import { credentialProviders, type CredentialProviderId } from '@astrometrics/widget-sdk';

export function MissingCredentialNotice({
  provider,
  onOpenSettings,
}: {
  provider: CredentialProviderId;
  onOpenSettings: () => void;
}) {
  return (
    <p className="text-sm text-slate-300">
      Connect {credentialProviders[provider].label} to use this widget.{' '}
      <button type="button" onClick={onOpenSettings} className="text-lcars-blue underline">
        Open settings
      </button>
    </p>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return <p className="text-sm text-lcars-red">{message}</p>;
}

export function StaleNotice({ message }: { message?: string }) {
  return (
    <p className="mt-2 text-xs text-lcars-gold">
      Showing cached data{message ? `: ${message}` : ''}
    </p>
  );
}

export function UnknownWidgetNotice({ type }: { type: string }) {
  return <p className="text-sm text-slate-400">Unknown widget type “{type}”.</p>;
}
