import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { contrast, onColor, ramp } from '../theme/color';
import { useTheme } from '../theme/ThemeProvider';
import type { Palette } from '../theme/theme';

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

interface Swatch {
  token: string;
  utility: string;
  background: keyof Palette;
  foreground: keyof Palette;
  note: string;
}

const swatches: Swatch[] = [
  {
    token: '--am-surface',
    utility: 'bg-surface',
    background: 'surface',
    foreground: 'text',
    note: 'page',
  },
  {
    token: '--am-surface-raised',
    utility: 'bg-raised',
    background: 'raised',
    foreground: 'text',
    note: 'cards',
  },
  {
    token: '--am-surface-sunken',
    utility: 'bg-sunken',
    background: 'sunken',
    foreground: 'muted',
    note: 'wells, inputs',
  },
  {
    token: '--am-text',
    utility: 'text-fg',
    background: 'surface',
    foreground: 'text',
    note: 'body text',
  },
  {
    token: '--am-text-muted',
    utility: 'text-muted',
    background: 'surface',
    foreground: 'muted',
    note: 'secondary text',
  },
  {
    token: '--am-accent',
    utility: 'bg-accent',
    background: 'accent',
    foreground: 'accentContrast',
    note: 'with text-on-accent',
  },
  {
    token: '--am-accent-text',
    utility: 'text-accent-ink',
    background: 'surface',
    foreground: 'accentText',
    note: 'links, icons',
  },
  {
    token: '--am-accent-2',
    utility: 'bg-accent-2',
    background: 'accent2',
    foreground: 'accent2Contrast',
    note: 'with text-on-accent-2',
  },
  {
    token: '--am-accent-3',
    utility: 'bg-accent-3',
    background: 'accent3',
    foreground: 'accent3Contrast',
    note: 'with text-on-accent-3',
  },
  {
    token: '--am-accent-4',
    utility: 'bg-accent-4',
    background: 'accent4',
    foreground: 'accent4Contrast',
    note: 'with text-on-accent-4',
  },
  {
    token: '--am-success',
    utility: 'bg-success',
    background: 'success',
    foreground: 'successContrast',
    note: 'with text-on-success',
  },
  {
    token: '--am-warning',
    utility: 'bg-warning',
    background: 'warning',
    foreground: 'warningContrast',
    note: 'with text-on-warning',
  },
  {
    token: '--am-danger',
    utility: 'bg-danger',
    background: 'danger',
    foreground: 'dangerContrast',
    note: 'with text-on-danger',
  },
];

function Grade({ ratio, required = 4.5 }: { ratio: number; required?: number }) {
  const pass = ratio >= required;
  const label = !pass ? 'Fail' : ratio >= 7 ? 'AAA' : required < 4.5 ? 'UI' : 'AA';
  return (
    <span
      className={`rounded-chip px-2 py-0.5 font-mono text-xs font-semibold ${
        pass ? 'bg-success text-on-success' : 'bg-danger text-on-danger'
      }`}
    >
      {ratio.toFixed(2)}:1 {label}
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-3xl font-semibold tracking-wide uppercase">{title}</h2>
      {children}
    </section>
  );
}

function ColorsView() {
  const { palette } = useTheme();
  return (
    <Section title="Colors">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {swatches.map((s) => {
          const bg = palette[s.background];
          const fg = palette[s.foreground];
          return (
            <li
              key={s.token}
              className="overflow-hidden rounded-card border border-line bg-raised shadow-1"
            >
              <div className="flex h-24 items-end p-3" style={{ background: bg, color: fg }}>
                <span className="font-display text-3xl font-semibold">Aa</span>
              </div>
              <div className="flex flex-col gap-1.5 p-3 text-sm">
                <code className="font-mono text-xs font-semibold">{s.token}</code>
                <span className="text-muted">
                  {s.utility} · {s.note}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <code className="font-mono text-xs text-muted">{bg.toUpperCase()}</code>
                  <Grade ratio={contrast(fg, bg)} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

export const Colors: Story = { render: () => <ColorsView /> };

function ContrastView() {
  const { checks } = useTheme();
  return (
    <Section title="Contrast checks">
      <p className="text-muted">
        Every pairing the components draw. Text needs 4.5:1; UI edges and focus rings need 3:1.
      </p>
      <table className="w-full max-w-3xl overflow-hidden rounded-card border border-line bg-raised text-sm">
        <thead className="bg-sunken text-left font-mono text-xs tracking-widest text-muted uppercase">
          <tr>
            <th className="px-4 py-3">Pairing</th>
            <th className="px-4 py-3">Sample</th>
            <th className="px-4 py-3">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.label} className="border-t border-line">
              <td className="px-4 py-3">{c.label}</td>
              <td className="px-4 py-3">
                <span
                  className="rounded-control px-3 py-1 font-semibold"
                  style={{ background: c.background, color: c.foreground }}
                >
                  Sample
                </span>
              </td>
              <td className="px-4 py-3">
                <Grade ratio={c.ratio} required={c.required} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

export const Contrast: Story = { render: () => <ContrastView /> };

function AccentRampView() {
  const { palette } = useTheme();
  return (
    <Section title="Accent ramp">
      <p className="text-muted">OKLCH, even lightness steps, generated from the accent.</p>
      <ol className="grid grid-cols-5 overflow-hidden rounded-card border border-line sm:grid-cols-10">
        {ramp(palette.accent).map((s) => (
          <li
            key={s.step}
            className="flex h-24 flex-col justify-between p-2 font-mono text-xs font-semibold"
            style={{ background: s.hex, color: onColor(s.hex) }}
          >
            <span>{s.step}</span>
            <span>{s.hex.toUpperCase()}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export const AccentRamp: Story = { render: () => <AccentRampView /> };

export const Typography: Story = {
  render: () => (
    <Section title="Type">
      <div className="flex flex-col gap-5 rounded-card border border-line bg-raised p-6 shadow-1">
        <p className="font-display text-6xl font-semibold tracking-wide uppercase">
          Display · Antonio
        </p>
        <p className="text-4xl font-bold">Heading 1 · DM Sans</p>
        <p className="text-2xl font-bold">Heading 2 · DM Sans</p>
        <p className="text-lg font-semibold">Heading 3 · DM Sans</p>
        <p className="max-w-prose">
          Body · DM Sans 15px. Your tokens stay in the keychain; the local server attaches them to
          each request.
        </p>
        <p className="text-sm text-muted">Small · muted secondary text</p>
        <p className="font-mono text-3xl font-semibold tabular-nums">10:42:07 · SD −296196.23</p>
        <p className="font-mono text-xs font-semibold tracking-[0.14em] text-muted uppercase">
          Eyebrow · JetBrains Mono
        </p>
      </div>
    </Section>
  ),
};

export const ShapeAndDepth: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <Section title="Radius">
        <div className="flex flex-wrap gap-4">
          {(['rounded-card', 'rounded-control', 'rounded-chip'] as const).map((r) => (
            <div
              key={r}
              className={`flex h-24 w-40 items-end border border-line bg-raised p-3 ${r}`}
            >
              <code className="font-mono text-xs">{r}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Shadow">
        <div className="flex flex-wrap gap-6">
          {(['shadow-1', 'shadow-2', 'shadow-3'] as const).map((s) => (
            <div key={s} className={`flex h-24 w-40 items-end rounded-card bg-raised p-3 ${s}`}>
              <code className="font-mono text-xs">{s}</code>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Signature details">
        <div className="flex flex-wrap items-start gap-6">
          <div className="chamfer flex h-32 w-56 flex-col justify-between bg-accent p-5 text-on-accent">
            <span className="font-mono text-xs font-semibold tracking-[0.14em] uppercase">
              chamfer
            </span>
            <span className="font-display text-4xl font-semibold">42 h</span>
          </div>
          <div className="flex w-72 flex-col gap-3">
            {(['hatch-accent', 'hatch-accent-2', 'hatch-accent-4', 'hatch-success'] as const).map(
              (h, i) => (
                <div key={h} className="flex flex-col gap-1">
                  <code className="font-mono text-xs text-muted">{h}</code>
                  <div className="h-3 overflow-hidden rounded-full border border-line bg-sunken">
                    <div className={`h-full ${h}`} style={{ width: `${80 - i * 15}%` }} />
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="flex flex-col gap-2">
            <code className="font-mono text-xs text-muted">animate-shimmer skeleton</code>
            <span className="block h-4 w-56 animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--am-surface-sunken)_0%,var(--am-surface-raised)_50%,var(--am-surface-sunken)_100%)] bg-[length:220%_100%]" />
            <span className="block h-4 w-40 animate-shimmer rounded-lg bg-[linear-gradient(90deg,var(--am-surface-sunken)_0%,var(--am-surface-raised)_50%,var(--am-surface-sunken)_100%)] bg-[length:220%_100%]" />
          </div>
        </div>
      </Section>
    </div>
  ),
};
