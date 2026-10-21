export interface BaseColors {
  surface: string;
  raised: string;
  sunken: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accent2: string;
  accent3: string;
  accent4: string;
}

export interface Preset {
  name: string;
  tagline: string;
  light: BaseColors;
  dark: BaseColors;
}

export const presets = {
  voyager: {
    name: 'Voyager',
    tagline: 'LCARS orange and lavender, 70,000 light-years from home.',
    light: {
      surface: '#fbf7f1',
      raised: '#ffffff',
      sunken: '#f2ebe0',
      text: '#1e1a2b',
      muted: '#5d566e',
      border: '#e3d9c9',
      accent: '#d47922',
      accent2: '#9a6ab8',
      accent3: '#f2b84b',
      accent4: '#7b7fe8',
    },
    dark: {
      surface: '#0e0d16',
      raised: '#18172a',
      sunken: '#0a0910',
      text: '#f3eee6',
      muted: '#a8a1bc',
      border: '#2c2a44',
      accent: '#ff9c1a',
      accent2: '#c99bd6',
      accent3: '#ffcf6b',
      accent4: '#9ea2ff',
    },
  },
  halohalo: {
    name: 'Halo-halo',
    tagline: 'Ube, pandan, mango and a slab of leche flan.',
    light: {
      surface: '#fcf7ec',
      raised: '#fffdf7',
      sunken: '#f4ead4',
      text: '#24182f',
      muted: '#62556d',
      border: '#e7dbbe',
      accent: '#6e3fa6',
      accent2: '#3e8e50',
      accent3: '#f2b232',
      accent4: '#e7c77e',
    },
    dark: {
      surface: '#17111f',
      raised: '#221a2d',
      sunken: '#110c17',
      text: '#f8eedb',
      muted: '#b7a9c2',
      border: '#3a2e48',
      accent: '#b48ae8',
      accent2: '#6bc77e',
      accent3: '#f7c04e',
      accent4: '#f3dfa9',
    },
  },
  jeepney: {
    name: 'Jeepney',
    tagline: 'Polished chrome, loud stripes, room for one more.',
    light: {
      surface: '#f1f3f5',
      raised: '#ffffff',
      sunken: '#e3e7eb',
      text: '#121417',
      muted: '#4e5661',
      border: '#cdd3da',
      accent: '#d7261e',
      accent2: '#1f57c3',
      accent3: '#f5c211',
      accent4: '#1e9a4b',
    },
    dark: {
      surface: '#101215',
      raised: '#1b1e23',
      sunken: '#0b0c0e',
      text: '#eef1f4',
      muted: '#9ca4af',
      border: '#2e333b',
      accent: '#ff4a3d',
      accent2: '#5b8dff',
      accent3: '#ffd233',
      accent4: '#36c26a',
    },
  },
  sampaguita: {
    name: 'Sampaguita',
    tagline: 'Quiet jade on fresh linen. Breathe out.',
    light: {
      surface: '#fbfbf8',
      raised: '#ffffff',
      sunken: '#f1f3ef',
      text: '#1b2420',
      muted: '#56625c',
      border: '#e0e5de',
      accent: '#2f7d62',
      accent2: '#6fa58c',
      accent3: '#cfe3d6',
      accent4: '#a9c8b8',
    },
    dark: {
      surface: '#101513',
      raised: '#18201c',
      sunken: '#0c100e',
      text: '#edf2ee',
      muted: '#9dada5',
      border: '#26322c',
      accent: '#5fc29d',
      accent2: '#8fcdb4',
      accent3: '#2f4a3e',
      accent4: '#3f6655',
    },
  },
  nebula: {
    name: 'Nebula',
    tagline: 'Indigo dust with a magenta afterglow.',
    light: {
      surface: '#f6f5fc',
      raised: '#ffffff',
      sunken: '#eceaf7',
      text: '#17153a',
      muted: '#55527a',
      border: '#dcd9ee',
      accent: '#4b2fd1',
      accent2: '#c2188f',
      accent3: '#0fa5c4',
      accent4: '#7859fc',
    },
    dark: {
      surface: '#0b0a1f',
      raised: '#15133a',
      sunken: '#07061a',
      text: '#eeebff',
      muted: '#a7a3d1',
      border: '#2a2759',
      accent: '#8c7bff',
      accent2: '#ff4fc3',
      accent3: '#2fd8f0',
      accent4: '#5a48e6',
    },
  },
} as const satisfies Record<string, Preset>;

export type PresetId = keyof typeof presets;

export const presetIds = Object.keys(presets) as PresetId[];
