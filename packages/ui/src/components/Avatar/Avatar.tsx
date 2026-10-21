import { useState, type ComponentProps } from 'react';
import { cx } from '../cx';
import { solid, type Tone } from '../tones';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizes: Record<AvatarSize, string> = {
  sm: 'size-7 text-[11px]',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
};

const fallbackTones: Tone[] = ['accent', 'accent-2', 'accent-3', 'accent-4'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
}

function toneFor(name: string): Tone {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return fallbackTones[hash % fallbackTones.length]!;
}

interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'> {
  name: string;
  src?: string;
  size?: AvatarSize;
  status?: 'online' | 'away' | 'offline';
}

export function Avatar({ name, src, size = 'md', status, className, ...props }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span className={cx('relative inline-flex shrink-0', className)} {...props}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className={cx('rounded-full object-cover', sizes[size])}
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className={cx(
            'inline-flex items-center justify-center rounded-full font-bold',
            sizes[size],
            solid[toneFor(name)],
          )}
        >
          {initials(name)}
        </span>
      )}
      {status && (
        <span
          aria-hidden
          className={cx(
            'absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-raised',
            status === 'online' && 'bg-success',
            status === 'away' && 'bg-warning',
            status === 'offline' && 'bg-muted',
          )}
        />
      )}
    </span>
  );
}

interface AvatarGroupProps {
  people: { name: string; src?: string }[];
  max?: number;
  size?: AvatarSize;
  label: string;
}

export function AvatarGroup({ people, max = 4, size = 'md', label }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div role="group" aria-label={label} className="flex items-center">
      {shown.map((person, i) => (
        <Avatar
          key={person.name}
          {...person}
          size={size}
          className={cx('rounded-full ring-2 ring-raised', i > 0 && '-ml-2')}
        />
      ))}
      {extra > 0 && (
        <span
          className={cx(
            '-ml-2 inline-flex items-center justify-center rounded-full border border-line bg-sunken font-mono font-semibold ring-2 ring-raised',
            sizes[size],
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
