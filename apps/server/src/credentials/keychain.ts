import { AsyncEntry } from '@napi-rs/keyring';
import type { CredentialProviderId } from '@astrometrics/widget-sdk';
import type { CredentialStore } from './store';

const SERVICE = 'astrometrics';

export class KeychainCredentialStore implements CredentialStore {
  async get(provider: CredentialProviderId) {
    return new AsyncEntry(SERVICE, provider).getPassword();
  }

  async set(provider: CredentialProviderId, secret: string) {
    await new AsyncEntry(SERVICE, provider).setPassword(secret);
  }

  async delete(provider: CredentialProviderId) {
    await new AsyncEntry(SERVICE, provider).deletePassword();
  }
}
