import {
  Banner,
  buildPalette,
  Card,
  cx,
  Field,
  presetIds,
  presets,
  SegmentedControl,
  SwitchRow,
  useTheme,
  type Mode,
  type RadiusStyle,
  type ThemeSettings,
} from '@astrometrics/ui';
import { Check } from 'lucide-react';

type PresetChoice = ThemeSettings['preset'];

const modeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

const radiusOptions = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'soft', label: 'Soft' },
  { value: 'round', label: 'Round' },
] as const;

const choices: { id: PresetChoice; name: string; tagline: string }[] = [
  ...presetIds.map((id) => ({ id, name: presets[id].name, tagline: presets[id].tagline })),
  { id: 'custom', name: 'Custom', tagline: 'One accent in, a whole OKLCH palette out.' },
];

export function AppearanceSettings() {
  const { settings, setSettings, mode, checks } = useTheme();
  const failing = checks.filter((check) => !check.pass);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Mode</span>
          <SegmentedControl
            label="Mode"
            options={modeOptions}
            value={settings.mode}
            onValueChange={(next) => setSettings({ mode: next })}
          />
          {settings.mode === 'system' && (
            <p className="text-xs text-muted">Following your system, which is {mode} right now.</p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-semibold">Theme</legend>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
            {choices.map((choice) => (
              <PresetOption
                key={choice.id}
                {...choice}
                settings={settings}
                mode={mode}
                selected={settings.preset === choice.id}
                onSelect={() => setSettings({ preset: choice.id })}
              />
            ))}
          </div>
        </fieldset>

        {settings.preset === 'custom' && <CustomAccent />}

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Corners</span>
          <SegmentedControl
            label="Corners"
            options={radiusOptions}
            value={settings.radius}
            onValueChange={(next: RadiusStyle) => setSettings({ radius: next })}
          />
        </div>

        {failing.length > 0 ? (
          <Banner
            tone="danger"
            role="status"
            title={`${failing.length} color ${failing.length === 1 ? 'pairing fails' : 'pairings fail'} WCAG AA`}
          >
            <ul className="mt-1 flex flex-col gap-0.5">
              {failing.map((check) => (
                <li key={check.label}>
                  {check.label}:{' '}
                  <span className="font-mono">
                    {check.ratio.toFixed(2)}:1, needs {check.required}:1
                  </span>
                </li>
              ))}
            </ul>
          </Banner>
        ) : (
          <Banner tone="success" role="status" title="Every color pairing passes WCAG AA" />
        )}
      </div>
    </Card>
  );
}

function PresetOption({
  id,
  name,
  tagline,
  settings,
  mode,
  selected,
  onSelect,
}: {
  id: PresetChoice;
  name: string;
  tagline: string;
  settings: ThemeSettings;
  mode: Mode;
  selected: boolean;
  onSelect: () => void;
}) {
  const palette = buildPalette({ ...settings, preset: id }, mode);
  const swatches = [
    palette.surface,
    palette.accent,
    palette.accent2,
    palette.accent3,
    palette.accent4,
  ];

  return (
    <label
      className={cx(
        'block cursor-pointer overflow-hidden rounded-[calc(var(--am-radius-card)-4px)] border-2 bg-raised transition-[translate,border-color,box-shadow] duration-300 ease-spring hover:-translate-y-[3px]',
        'has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus',
        selected
          ? 'border-accent shadow-[0_0_0_4px_color-mix(in_oklab,var(--am-accent)_22%,transparent)]'
          : 'border-line',
      )}
    >
      <input
        type="radio"
        name="theme-preset"
        value={id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span aria-hidden className="flex h-14">
        {swatches.map((color, i) => (
          <span
            key={i}
            className={i === 0 ? 'flex-[2.2]' : 'flex-1'}
            style={{ background: color }}
          />
        ))}
      </span>
      <span className="block px-3 pt-2.5 pb-3">
        <span className="flex items-center justify-between text-sm font-bold">
          {name}
          {selected && <Check className="size-4 text-accent-ink" aria-hidden />}
        </span>
        <span className="mt-0.5 block text-xs leading-snug text-muted">{tagline}</span>
      </span>
    </label>
  );
}

function CustomAccent() {
  const { settings, setSettings, palette } = useTheme();

  return (
    <div className="flex flex-col gap-3 rounded-control border border-line bg-sunken p-4">
      <ColorField
        label="Accent"
        help="The rest of the palette is generated from this in OKLCH."
        value={settings.customAccent}
        onChange={(customAccent) => setSettings({ customAccent })}
      />
      <SwitchRow
        label="Pick a second accent"
        description="Otherwise it's derived from the accent's hue."
        checked={settings.customAccent2 !== null}
        onCheckedChange={(on) => setSettings({ customAccent2: on ? palette.accent2 : null })}
      />
      {settings.customAccent2 !== null && (
        <ColorField
          label="Second accent"
          value={settings.customAccent2}
          onChange={(customAccent2) => setSettings({ customAccent2 })}
        />
      )}
    </div>
  );
}

function ColorField({
  label,
  help,
  value,
  onChange,
}: {
  label: string;
  help?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} help={help}>
      {(control) => (
        <div className="flex items-center gap-3 rounded-control border border-line bg-raised p-2">
          <input
            {...control}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-11 w-14 cursor-pointer rounded-[calc(var(--am-radius-control)-4px)] border-0 bg-transparent p-0"
          />
          <span className="font-mono text-sm font-semibold uppercase">{value}</span>
        </div>
      )}
    </Field>
  );
}
