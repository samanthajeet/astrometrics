import { Banner, Button, Chip, Dialog, Poster, SegmentedControl, Skeleton } from '@astrometrics/ui';
import { tmdbImageUrl, type TitleDetails, type WatchlistItem } from '@astrometrics/widget-sdk';
import { Trash2 } from 'lucide-react';
import { ApiError } from '../lib/api';
import {
  useRemoveFromWatchlist,
  useSetWatchlistStatus,
  useTitleDetails,
  useWatchlist,
} from '../lib/queries';
import { describeTitle, statusOptions } from '../lib/watchlist';

interface TitleDetailsModalProps {
  /** The watchlist item to show; `null` keeps the dialog closed. */
  id: string | null;
  onClose: () => void;
  onOpenSettings: () => void;
}

export function TitleDetailsModal({ id, onClose, onOpenSettings }: TitleDetailsModalProps) {
  const { data: items } = useWatchlist();
  const item = items?.find((i) => i.id === id);

  return (
    <Dialog
      open={id !== null}
      onOpenChange={(open) => !open && onClose()}
      title={item?.title ?? 'Title'}
      description={item ? describeTitle(item.kind, item.year) : undefined}
      footer={
        <p className="text-xs text-muted">
          Details come from TMDB. This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      }
    >
      {item ? (
        <Details
          item={item}
          onClose={onClose}
          onOpenSettings={() => {
            onClose();
            onOpenSettings();
          }}
        />
      ) : (
        <Skeleton className="h-48" />
      )}
    </Dialog>
  );
}

function Details({
  item,
  onClose,
  onOpenSettings,
}: {
  item: WatchlistItem;
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  const details = useTitleDetails(item.id);
  const setStatus = useSetWatchlistStatus();
  const remove = useRemoveFromWatchlist();
  const missingToken = details.error instanceof ApiError && details.error.status === 409;
  const unknownTitle =
    details.error instanceof ApiError && details.error.body?.error === 'unknown_title';

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="w-36 shrink-0 self-start">
        <Poster src={item.posterPath ? tmdbImageUrl(item.posterPath, 'w342') : null} size="fill" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {details.isPending && (
          <div aria-busy className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4" />
            <Skeleton className="h-4 w-5/6" />
            <span className="sr-only">Loading details</span>
          </div>
        )}
        {missingToken && (
          <Banner
            tone="info"
            title="Connect TMDB to see details"
            action={
              <Button size="sm" variant="primary" onClick={onOpenSettings}>
                Open Settings
              </Button>
            }
          />
        )}
        {details.error && !missingToken && (
          <Banner tone="danger" title="Couldn’t load details" role="alert">
            {unknownTitle ? 'TMDB no longer lists this title.' : details.error.message}
          </Banner>
        )}
        {details.data && <Facts details={details.data} kind={item.kind} />}

        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold">Status</span>
          <SegmentedControl
            label={`${item.title} status`}
            value={item.status}
            onValueChange={(status) => setStatus.mutate({ id: item.id, status })}
            options={statusOptions}
            className="self-start"
          />
        </div>

        {remove.error && (
          <Banner tone="danger" title="Couldn’t remove it" role="alert">
            {remove.error.message}
          </Banner>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="self-start text-danger"
          disabled={remove.isPending}
          leadingIcon={<Trash2 className="size-4" aria-hidden />}
          onClick={() => remove.mutate(item.id, { onSuccess: onClose })}
        >
          Remove from watchlist
        </Button>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRuntime(minutes: number, kind: WatchlistItem['kind']) {
  if (kind === 'tv') return `${minutes} min episodes`;
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function Facts({ details, kind }: { details: TitleDetails; kind: WatchlistItem['kind'] }) {
  const facts: [string, string][] = [];
  if (details.date)
    facts.push([kind === 'movie' ? 'Release' : 'First aired', formatDate(details.date)]);
  if (details.runtimeMinutes) facts.push(['Runtime', formatRuntime(details.runtimeMinutes, kind)]);
  if (details.seasons) {
    const seasons = `${details.seasons} season${details.seasons === 1 ? '' : 's'}`;
    facts.push([
      'Seasons',
      details.episodes ? `${seasons} · ${details.episodes} episodes` : seasons,
    ]);
  }
  if (details.status) facts.push(['Status on TMDB', details.status]);

  return (
    <div className="flex flex-col gap-4">
      {details.tagline && <p className="text-sm font-semibold italic">{details.tagline}</p>}
      <p className="text-sm leading-relaxed">
        {details.overview ?? <span className="text-muted">TMDB has no overview yet.</span>}
      </p>
      {details.genres.length > 0 && (
        <ul aria-label="Genres" className="flex flex-wrap gap-1.5">
          {details.genres.map((genre) => (
            <li key={genre}>
              <Chip>{genre}</Chip>
            </li>
          ))}
        </ul>
      )}
      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          {facts.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-muted">{term}</dt>
              <dd className="m-0 font-mono tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
