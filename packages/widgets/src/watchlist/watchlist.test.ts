import type { WatchlistItem } from '@astrometrics/widget-sdk';
import { describe, expect, it } from 'vitest';
import { byStatus, upNext } from './watchlist';

const item = (title: string, status: WatchlistItem['status'], addedAt: string): WatchlistItem => ({
  id: title,
  kind: 'movie',
  tmdbId: 1,
  imdbId: null,
  title,
  year: null,
  posterPath: null,
  status,
  addedAt,
});

const items = [
  item('Old want', 'want', '2026-01-01T00:00:00Z'),
  item('Done', 'done', '2026-03-01T00:00:00Z'),
  item('New want', 'want', '2026-02-01T00:00:00Z'),
  item('Watching', 'watching', '2025-12-01T00:00:00Z'),
];

describe('byStatus', () => {
  it('puts watching first, then want, then done, newest first within each', () => {
    expect(byStatus(items).map((i) => i.title)).toEqual([
      'Watching',
      'New want',
      'Old want',
      'Done',
    ]);
  });
});

describe('upNext', () => {
  it('leaves out titles already watched', () => {
    expect(upNext(items).map((i) => i.title)).toEqual(['Watching', 'New want', 'Old want']);
  });
});
