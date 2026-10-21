import type { CredentialProviderId } from '@astrometrics/widget-sdk';

export interface CredentialStore {
  get(provider: CredentialProviderId): Promise<string | null>;
  set(provider: CredentialProviderId, secret: string): Promise<void>;
  delete(provider: CredentialProviderId): Promise<void>;
}

export class MemoryCredentialStore implements CredentialStore {
  private readonly secrets = new Map<CredentialProviderId, string>();

  async get(provider: CredentialProviderId) {
    return this.secrets.get(provider) ?? null;
  }

  async set(provider: CredentialProviderId, secret: string) {
    this.secrets.set(provider, secret);
  }

  async delete(provider: CredentialProviderId) {
    this.secrets.delete(provider);
  }
}
