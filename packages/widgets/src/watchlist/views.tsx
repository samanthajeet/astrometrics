import { Button, Chip, EmptyState, Poster, Skeleton, type Tone } from '@astrometrics/ui';
import {
  tmdbImageUrl,
  useWidgetHost,
  watchlistKindLabels,
  watchlistStatusLabels,
  type WatchlistItem,
  type WatchlistStatus,
  type WidgetViewProps,
} from '@astrometrics/widget-sdk';
import { Plus } from 'lucide-react';
import { byStatus, upNext } from './watchlist';

type Props = WidgetViewProps<Record<string, never>, WatchlistItem[]>;

const statusTones: Record<WatchlistStatus, Tone> = {
  want: 'accent-4',
  watching: 'accent',
  done: 'success',
};

const MAIN_LIMIT = 12;
const COMPACT_LIMIT = 5;

function StatusChip({ value }: { value: WatchlistStatus }) {
  return (
    <Chip tone={statusTones[value]} pulse={value === 'watching'} className="self-start">
      {watchlistStatusLabels[value]}
    </Chip>
  );
}

function poster(item: WatchlistItem, width: 'w92' | 'w185') {
  return item.posterPath ? tmdbImageUrl(item.posterPath, width) : null;
}

function meta(item: WatchlistItem) {
  const kind = watchlistKindLabels[item.kind];
  return item.year ? `${kind} · ${item.year}` : kind;
}

function Empty({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      title="Your watchlist is a clear sky"
      description="Add a movie or show and it shows up here with its status."
      action={
        <Button
          variant="primary"
          size="sm"
          onClick={onAdd}
          leadingIcon={<Plus className="size-4" aria-hidden />}
        >
          Add a title
        </Button>
      }
    />
  );
}

function Loading({ rows }: { rows: number }) {
  return (
    <div aria-busy className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
      <span className="sr-only">Loading watchlist</span>
    </div>
  );
}

function counts(items: readonly WatchlistItem[]) {
  return (['watching', 'want', 'done'] as const)
    .map((s) => [s, items.filter((i) => i.status === s).length] as const)
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${n} ${watchlistStatusLabels[s].toLowerCase()}`)
    .join(' · ');
}

const titleButton =
  'group flex min-w-0 cursor-pointer text-left rounded-[calc(var(--am-radius-chip)-2px)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus';

export function WatchlistMain({ data }: Props) {
  const { openWatchlist, openTitle } = useWidgetHost();
  if (!data) return <Loading rows={3} />;
  if (data.length === 0) return <Empty onAdd={openWatchlist} />;

  const items = byStatus(data);
  const hidden = items.length - MAIN_LIMIT;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{counts(items)}</p>
        <Button
          size="sm"
          onClick={openWatchlist}
          leadingIcon={<Plus className="size-4" aria-hidden />}
        >
          Add or edit
        </Button>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
        {items.slice(0, MAIN_LIMIT).map((item) => (
          <li key={item.id} className="flex min-w-0 flex-col gap-2">
            <button
              type="button"
              onClick={() => openTitle(item.id)}
              className={`${titleButton} flex-col gap-2`}
            >
              <Poster
                src={poster(item, 'w185')}
                size="fill"
                className="transition-transform duration-300 ease-spring group-hover:-translate-y-1"
              />
              <span className="block w-full min-w-0">
                <span className="block truncate text-sm font-semibold group-hover:underline">
                  {item.title}
                </span>
                <span className="block truncate text-xs text-muted">{meta(item)}</span>
              </span>
            </button>
            <StatusChip value={item.status} />
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <Button variant="ghost" size="sm" onClick={openWatchlist} className="self-start">
          {hidden} more on your watchlist
        </Button>
      )}
    </div>
  );
}

export function WatchlistCompact({ data }: Props) {
  const { openWatchlist, openTitle } = useWidgetHost();
  if (!data) return <Loading rows={2} />;
  if (data.length === 0) return <Empty onAdd={openWatchlist} />;

  const next = upNext(data);

  return (
    <div className="flex flex-col gap-2">
      {next.length === 0 ? (
        <p className="py-2 text-sm text-muted">Everything on your list is watched.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {next.slice(0, COMPACT_LIMIT).map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => openTitle(item.id)}
                className={`${titleButton} flex-1 items-center gap-3`}
              >
                <Poster src={poster(item, 'w92')} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold group-hover:underline">
                  {item.title}
                </span>
              </button>
              <StatusChip value={item.status} />
            </li>
          ))}
        </ul>
      )}
      <Button variant="ghost" size="sm" onClick={openWatchlist} className="self-start">
        {next.length > COMPACT_LIMIT
          ? `${next.length - COMPACT_LIMIT} more · manage watchlist`
          : 'Manage watchlist'}
      </Button>
    </div>
  );
}
