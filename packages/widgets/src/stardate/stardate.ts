const TNG_EPOCH_YEAR = 2323;

export function toStardate(date: Date): number {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const fraction = (date.getTime() - start) / (end - start);
  return (year - TNG_EPOCH_YEAR) * 1000 + fraction * 1000;
}

export function formatStardate(date: Date): string {
  return toStardate(date).toFixed(2);
}
