import { Badge, Button, Card, Eyebrow, Field, PasswordInput } from '@astrometrics/ui';
import {
  credentialProviderIds,
  credentialProviders,
  type CredentialProviderId,
} from '@astrometrics/widget-sdk';
import { useState, type FormEvent } from 'react';
import { useCredentials, useDeleteCredential, useSetCredential } from '../lib/queries';

export function Settings() {
  const { data: statuses } = useCredentials();
  const configured = new Set(statuses?.filter((s) => s.configured).map((s) => s.provider));

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="font-display text-[44px] leading-none font-semibold tracking-[0.04em] uppercase">
        Settings
      </h1>
      <section aria-labelledby="credentials-heading" className="mt-8">
        <Eyebrow id="credentials-heading" role="heading" aria-level={2}>
          Credentials
        </Eyebrow>
        <p className="mt-1 text-sm text-muted">
          Stored in your system keychain. The local server attaches them to API requests; they are
          never sent to the browser.
        </p>
        <ul className="mt-4 flex flex-col gap-4">
          {credentialProviderIds.map((provider) => (
            <li key={provider}>
              <CredentialRow provider={provider} configured={configured.has(provider)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CredentialRow({
  provider,
  configured,
}: {
  provider: CredentialProviderId;
  configured: boolean;
}) {
  const { label, inputLabel, help } = credentialProviders[provider];
  const [value, setValue] = useState('');
  const setCredential = useSetCredential();
  const deleteCredential = useDeleteCredential();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setCredential.mutate({ provider, value }, { onSuccess: () => setValue('') });
  };

  return (
    <Card
      title={label}
      action={
        configured ? (
          <Badge tone="success">Connected</Badge>
        ) : (
          <Badge variant="outline">Not connected</Badge>
        )
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label={inputLabel} help={help} error={setCredential.error?.message}>
          {(control) => (
            <PasswordInput
              {...control}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={configured ? 'Enter a new value to replace' : ''}
            />
          )}
        </Field>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!value.trim() || setCredential.isPending}
          >
            Save
          </Button>
          {configured && (
            <Button
              variant="ghost"
              size="sm"
              className="text-danger"
              onClick={() => deleteCredential.mutate(provider)}
            >
              Remove
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
