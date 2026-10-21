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
      <h1 className="text-xl font-semibold">Settings</h1>
      <section aria-labelledby="credentials-heading" className="mt-6">
        <h2 id="credentials-heading" className="text-sm font-semibold text-lcars-lavender">
          Credentials
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Stored in your system keychain. The local server attaches them to API requests; they are
          never sent to the browser.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {credentialProviderIds.map((provider) => (
            <CredentialRow
              key={provider}
              provider={provider}
              configured={configured.has(provider)}
            />
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
  const inputId = `credential-${provider}`;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setCredential.mutate({ provider, value }, { onSuccess: () => setValue('') });
  };

  return (
    <li className="rounded-xl border border-edge bg-panel p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{label}</h3>
        <span className={`text-xs ${configured ? 'text-lcars-blue' : 'text-slate-500'}`}>
          {configured ? 'Connected' : 'Not connected'}
        </span>
      </div>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2">
        <label htmlFor={inputId} className="text-xs text-slate-400">
          {inputLabel}
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="password"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={configured ? 'Enter a new value to replace' : ''}
            className="min-w-0 flex-1 rounded-md border border-edge bg-space px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={!value.trim() || setCredential.isPending}
            className="rounded-md bg-lcars-orange px-3 py-1.5 text-sm font-medium text-space disabled:opacity-40"
          >
            Save
          </button>
          {configured && (
            <button
              type="button"
              onClick={() => deleteCredential.mutate(provider)}
              className="rounded-md border border-edge px-3 py-1.5 text-sm hover:border-lcars-red hover:text-lcars-red"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">{help}</p>
        {setCredential.error && (
          <p className="text-xs text-lcars-red">{setCredential.error.message}</p>
        )}
      </form>
    </li>
  );
}
