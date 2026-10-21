import {
  Badge,
  Banner,
  Button,
  Dialog,
  EmptyState,
  Eyebrow,
  Field,
  IconButton,
  Input,
  Poster,
  SegmentedControl,
  Skeleton,
} from '@astrometrics/ui';
import {
  tmdbImageUrl,
  watchlistStatusLabels,
  type TitleSearchResult,
  type WatchlistItem,
  type WatchlistStatus,
} from '@astrometrics/widget-sdk';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { ApiError } from '../lib/api';
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useSetWatchlistStatus,
  useWatchlist,
  useWatchlistSearch,
} from '../lib/queries';
import { useDebouncedValue } from '../lib/useDebouncedValue';
import { describeTitle, statusOptions } from '../lib/watchlist';

type Filter = 'all' | WatchlistStatus;

interface WatchlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
}

export function WatchlistModal({ open, onOpenChange, onOpenSettings }: WatchlistModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      // Tall enough that the search results panel isn't cut off when the list is short.
      className="min-h-[min(560px,88vh)]"
      title="Watchlist"
      description="Movies and shows to watch. Upcoming releases and New episodes read from this list."
      footer={
        <p className="text-xs text-muted">
          Search and title details come from TMDB. This product uses the TMDB API but is not
          endorsed or certified by TMDB.
        </p>
      }
    >
      <div className="flex flex-col gap-8">
        <TitleSearch
          onOpenSettings={() => {
            onOpenChange(false);
            onOpenSettings();
          }}
        />
        <SavedTitles />
      </div>
    </Dialog>
  );
}

function TitleSearch({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const debounced = useDebouncedValue(query, 300);
  const search = useWatchlistSearch(debounced);
  const add = useAddToWatchlist();
  const ready = query.trim().length >= 2 && debounced.trim().length >= 2;
  const missingToken = search.error instanceof ApiError && search.error.status === 409;
  const showPanel = open && ready;

  const clear = () => {
    setQuery('');
    setOpen(false);
  };

  const choose = (result: TitleSearchResult) => {
    add.mutate({ kind: result.kind, tmdbId: result.tmdbId });
    clear();
    inputRef.current?.focus();
  };

  return (
    <section
      aria-label="Add a title"
      className="flex flex-col gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Field label="Search movies and shows">
        {(control) => (
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-muted"
              aria-hidden
            />
            <Input
              {...control}
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={showPanel}
              aria-controls={panelId}
              aria-autocomplete="list"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={(e) => {
                // Escape clears the search first; a second Escape closes the dialog.
                if (e.key === 'Escape' && query) {
                  e.preventDefault();
                  clear();
                }
              }}
              placeholder="Title, e.g. a film or series name"
              autoComplete="off"
              className="pl-10"
            />
            {showPanel && (
              <div
                id={panelId}
                className="absolute inset-x-0 top-full z-20 mt-2 max-h-[min(320px,45vh)] overflow-y-auto rounded-control border border-line bg-raised p-1.5 shadow-3"
              >
                <SearchResults
                  query={debounced.trim()}
                  search={search}
                  missingToken={missingToken}
                  onChoose={choose}
                  onOpenSettings={onOpenSettings}
                />
              </div>
            )}
          </div>
        )}
      </Field>

      {add.error && (
        <Banner tone="danger" title="Couldn’t add that title" role="alert">
          {add.error.message}
        </Banner>
      )}
    </section>
  );
}

function SearchResults({
  query,
  search,
  missingToken,
  onChoose,
  onOpenSettings,
}: {
  query: string;
  search: ReturnType<typeof useWatchlistSearch>;
  missingToken: boolean;
  onChoose: (result: TitleSearchResult) => void;
  onOpenSettings: () => void;
}) {
  if (missingToken) {
    return (
      <EmptyState
        title="Connect TMDB to search"
        description="Add your TMDB API Read Access Token in Settings."
        action={
          <Button variant="primary" size="sm" onClick={onOpenSettings}>
            Open Settings
          </Button>
        }
      />
    );
  }
  if (search.error) {
    return (
      <Banner tone="danger" title="Search failed" role="alert">
        {search.error.message}
      </Banner>
    );
  }
  if (search.isPending) {
    return (
      <div aria-busy className="flex flex-col gap-1.5 p-1">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <span className="sr-only">Searching</span>
      </div>
    );
  }
  if (search.data.length === 0) {
    return <p className="p-3 text-sm text-muted">No movies or shows match “{query}”.</p>;
  }
  return (
    <ul aria-label="Search results" className="flex flex-col">
      {search.data.slice(0, 8).map((result) => (
        <SearchRow
          key={`${result.kind}:${result.tmdbId}`}
          result={result}
          onAdd={() => onChoose(result)}
        />
      ))}
    </ul>
  );
}

function SearchRow({ result, onAdd }: { result: TitleSearchResult; onAdd: () => void }) {
  const body = (
    <>
      <Poster src={result.posterPath && tmdbImageUrl(result.posterPath, 'w92')} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{result.title}</span>
        <span className="block text-xs text-muted">{describeTitle(result.kind, result.year)}</span>
      </span>
    </>
  );
  const row =
    'flex w-full items-center gap-3 rounded-[calc(var(--am-radius-control)-4px)] px-2.5 py-2';

  if (result.onWatchlist) {
    return (
      <li className={row}>
        {body}
        <Badge variant="outline">
          On your list · {watchlistStatusLabels[result.onWatchlist.status]}
        </Badge>
      </li>
    );
  }
  return (
    <li>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${result.title} (${describeTitle(result.kind, result.year)}) to your watchlist`}
        className={`${row} cursor-pointer text-left hover:bg-sunken focus-visible:bg-sunken`}
      >
        {body}
        <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-accent-ink">
          <Plus className="size-4" aria-hidden />
          Add
        </span>
      </button>
    </li>
  );
}

function SavedTitles() {
  const { data: items, isPending, error } = useWatchlist();
  const [filter, setFilter] = useState<Filter>('all');
  const setStatus = useSetWatchlistStatus();
  const remove = useRemoveFromWatchlist();

  if (isPending) return <Skeleton className="h-32" />;
  if (error) {
    return (
      <Banner tone="danger" title="Couldn’t load your watchlist" role="alert">
        {error.message}
      </Banner>
    );
  }

  const count = (status: WatchlistStatus) => items.filter((i) => i.status === status).length;
  const shown = filter === 'all' ? items : items.filter((i) => i.status === filter);

  return (
    <section aria-labelledby="saved-titles" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow id="saved-titles" role="heading" aria-level={3}>
          Your watchlist
        </Eyebrow>
        {items.length > 0 && (
          <SegmentedControl
            label="Filter by status"
            value={filter}
            onValueChange={setFilter}
            options={[
              { value: 'all', label: 'All', count: items.length },
              ...statusOptions.map((o) => ({ ...o, count: count(o.value) })),
            ]}
          />
        )}
      </div>

      {items.length === 0 && (
        <EmptyState
          title="Your watchlist is a clear sky"
          description="Search above to add a movie or show."
        />
      )}
      {items.length > 0 && shown.length === 0 && (
        <p className="text-sm text-muted">
          Nothing is marked {watchlistStatusLabels[filter as WatchlistStatus]}.
        </p>
      )}
      {shown.length > 0 && (
        <ul className="flex flex-col divide-y divide-line">
          {shown.map((item) => (
            <SavedRow
              key={item.id}
              item={item}
              onStatus={(status) => setStatus.mutate({ id: item.id, status })}
              onRemove={() => remove.mutate(item.id)}
              removing={remove.isPending && remove.variables === item.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function SavedRow({
  item,
  onStatus,
  onRemove,
  removing,
}: {
  item: WatchlistItem;
  onStatus: (status: WatchlistStatus) => void;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
      <Poster src={item.posterPath && tmdbImageUrl(item.posterPath, 'w92')} />
      <div className="min-w-40 flex-1">
        <p className="truncate text-sm font-semibold">{item.title}</p>
        <p className="text-xs text-muted">{describeTitle(item.kind, item.year)}</p>
      </div>
      <div className="flex items-center gap-1">
        <SegmentedControl
          label={`${item.title} status`}
          value={item.status}
          onValueChange={onStatus}
          options={statusOptions}
        />
        <IconButton
          label={`Remove ${item.title}`}
          onClick={onRemove}
          disabled={removing}
          icon={<Trash2 className="size-4" />}
          className="text-muted hover:text-danger"
        />
      </div>
    </li>
  );
}
