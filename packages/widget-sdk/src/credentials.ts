export type CredentialAuth =
  | { type: 'bearer'; origins: readonly string[] }
  | { type: 'header'; header: string; origins: readonly string[] }
  | { type: 'secret-url' };

export interface CredentialProvider {
  label: string;
  inputLabel: string;
  help: string;
  auth: CredentialAuth;
}

export const credentialProviders = {
  tmdb: {
    label: 'TMDB',
    inputLabel: 'API Read Access Token',
    help: 'themoviedb.org → Settings → API → "API Read Access Token".',
    auth: { type: 'bearer', origins: ['https://api.themoviedb.org'] },
  },
  github: {
    label: 'GitHub',
    inputLabel: 'Personal access token',
    help: 'github.com → Settings → Developer settings → Personal access tokens.',
    auth: { type: 'bearer', origins: ['https://api.github.com'] },
  },
  shortcut: {
    label: 'Shortcut',
    inputLabel: 'API token',
    help: 'app.shortcut.com → Settings → Your Account → API Tokens.',
    auth: { type: 'header', header: 'Shortcut-Token', origins: ['https://api.app.shortcut.com'] },
  },
  calendar: {
    label: 'Work calendar',
    inputLabel: 'Secret ICS feed URL',
    help: 'Google Calendar → Settings for your calendar → "Secret address in iCal format".',
    auth: { type: 'secret-url' },
  },
} as const satisfies Record<string, CredentialProvider>;

export type CredentialProviderId = keyof typeof credentialProviders;

export const credentialProviderIds = Object.keys(credentialProviders) as CredentialProviderId[];

export function isCredentialProviderId(value: string): value is CredentialProviderId {
  return Object.hasOwn(credentialProviders, value);
}
