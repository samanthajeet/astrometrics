import { cx } from '../cx';

export type PosterSize = 'sm' | 'md' | 'fill';

const sizes: Record<PosterSize, string> = {
  sm: 'w-8 rounded-[calc(var(--am-radius-chip)-2px)]',
  md: 'w-10 rounded-[calc(var(--am-radius-chip)-2px)]',
  fill: 'w-full rounded-[calc(var(--am-radius-card)-8px)]',
};

interface PosterProps {
  /** Image URL. Without one, an accent gradient stands in. */
  src: string | null;
  size?: PosterSize;
  className?: string;
}

/** A 2:3 poster. Decorative: the title always sits next to it. */
export function Poster({ src, size = 'md', className }: PosterProps) {
  const classes = cx('aspect-[2/3] shrink-0', sizes[size], className);
  if (!src) {
    return (
      <span
        aria-hidden
        className={cx(
          classes,
          'block bg-[linear-gradient(160deg,var(--am-accent),var(--am-accent-2))]',
        )}
      />
    );
  }
  return <img src={src} alt="" loading="lazy" className={cx(classes, 'bg-sunken object-cover')} />;
}
