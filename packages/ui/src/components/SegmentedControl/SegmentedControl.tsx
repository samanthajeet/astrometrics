import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cx } from '../cx';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  /** Names the group for assistive tech. */
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      // Radix emits "" when the active item is pressed again; a segmented control always has one.
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cx(
        'inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[calc(var(--am-radius-control)+4px)] border border-line bg-sunken p-1',
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          className={cx(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control px-3.5 text-[13px] font-semibold whitespace-nowrap text-muted transition-colors duration-150 hover:text-fg',
            'data-[state=on]:bg-raised data-[state=on]:text-fg data-[state=on]:shadow-1',
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="font-mono text-[11px] text-muted">{option.count}</span>
          )}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
