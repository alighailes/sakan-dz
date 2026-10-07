// ============================================================
// Shared query cache: in-flight dedup + short-TTL reuse.
//
// Why this exists: every useProperties() hook fires its own
// fetchProperties() network request. PropertyCard mounts one hook
// per card, so a 20-card grid fired 20+ simultaneous full-table
// queries (N+1 flood), and every page-transition remount refetched.
// This collapses concurrent identical queries onto ONE promise and
// reuses fresh results briefly — the frontend equivalent of pooling
// many consumers over one shared pipeline.
//
// Error policy: rejections are never cached (the entry is dropped so
// the next caller retries). Explicit refreshes must call
// invalidateQueries() first (see useProperties refetch + publish).
// ============================================================

type PendingEntry = { status: 'pending'; promise: Promise<unknown> }
type ReadyEntry = { status: 'ready'; data: unknown; expiresAt: number }
type Entry = PendingEntry | ReadyEntry

const entries = new Map<string, Entry>()

/**
 * Run `fn` under `key`, sharing one in-flight promise between
 * concurrent callers and reusing the result for `ttlMs`.
 */
export async function dedupedQuery<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 30_000
): Promise<T> {
  const now = Date.now()
  const hit = entries.get(key)

  if (hit) {
    if (hit.status === 'pending') return hit.promise as Promise<T>
    if (hit.expiresAt > now) return hit.data as T
    entries.delete(key)
  }

  const promise: Promise<T> = fn().then(
    (data) => {
      entries.set(key, { status: 'ready', data, expiresAt: Date.now() + ttlMs })
      return data
    },
    (err) => {
      // Never cache failures — a later caller must retry.
      if (entries.get(key)?.status === 'pending') entries.delete(key)
      throw err
    }
  )
  entries.set(key, { status: 'pending', promise })
  return promise
}

/** Drop cached entries whose key starts with `prefix` (or all). */
export function invalidateQueries(prefix?: string): void {
  if (!prefix) {
    entries.clear()
    return
  }
  for (const key of entries.keys()) {
    if (key.startsWith(prefix)) entries.delete(key)
  }
}
