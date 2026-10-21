export interface Oklch {
  L: number;
  C: number;
  H: number;
}

type Rgb = [number, number, number];

const DARK_INK = '#0b0b10';

function hexToRgb(hex: string): Rgb {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function rgbToHex(rgb: Rgb): string {
  return (
    '#' +
    rgb
      .map((v) =>
        Math.round(Math.min(1, Math.max(0, v)) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

function fromLinear(c: number) {
  const v = Math.min(1, Math.max(0, c));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as Rgb;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio, 1–21. */
export function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function toOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C: Math.sqrt(A * A + B * B), H };
}

function oklchToLinearRgb(L: number, C: number, H: number): Rgb {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** OKLCH to hex, reducing chroma until the color fits in sRGB. */
export function oklch(L: number, C: number, H: number): string {
  const lightness = Math.min(1, Math.max(0, L));
  let chroma = Math.max(0, C);
  for (let i = 0; i < 40; i++) {
    const rgb = oklchToLinearRgb(lightness, chroma, H);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) return rgbToHex(rgb.map(fromLinear) as Rgb);
    chroma *= 0.9;
  }
  return rgbToHex(oklchToLinearRgb(lightness, 0, H).map(fromLinear) as Rgb);
}

/** White or near-black, whichever reads better on `hex`. */
export function onColor(hex: string): string {
  return contrast(hex, '#ffffff') >= contrast(hex, DARK_INK) ? '#ffffff' : DARK_INK;
}

/** Shifts `hex` lighter or darker (keeping its hue) until it reaches 4.5:1 on `surface`. */
export function ink(hex: string, surface: string): string {
  const { L, C, H } = toOklch(hex);
  const step = luminance(surface) > 0.18 ? -0.01 : 0.01;
  let lightness = L;
  let out = hex;
  for (let i = 0; i < 80 && contrast(out, surface) < 4.5; i++) {
    lightness += step;
    out = oklch(lightness, C, H);
  }
  return out;
}

const RAMP_L = [0.97, 0.93, 0.87, 0.79, 0.71, 0.63, 0.55, 0.47, 0.39, 0.3];
const RAMP_C = [0.15, 0.3, 0.55, 0.8, 0.95, 1, 1, 0.92, 0.8, 0.62];

/** A 50–900 scale with even perceptual lightness steps. */
export function ramp(hex: string): { step: string; hex: string }[] {
  const { C, H } = toOklch(hex);
  return RAMP_L.map((L, i) => ({
    step: i === 0 ? '50' : String(i * 100),
    hex: oklch(L, C * RAMP_C[i]!, H),
  }));
}
