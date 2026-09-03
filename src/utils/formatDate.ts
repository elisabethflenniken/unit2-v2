// utils/formatDate.ts
export function formatShortDate (isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Full date + time for a timestamp (not a date-only string) — e.g. exception raised/resolved times. */
export function formatDateTime (isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
