// ============================================================
// Pure broadcast helpers for the send-broadcast-push Edge Function.
// Dependency-free (no Deno / npm imports) so the logic is unit-
// testable outside the edge runtime.
// ============================================================

export interface PropertyRecord {
  id?: unknown
  title?: unknown
  wilaya?: unknown
  commune?: unknown
  price?: unknown
  currency?: unknown
}

export interface BroadcastPayload {
  title: string
  body: string
  icon: string
  url: string
}

export const BROADCAST_TITLE = 'عقار جديد على سكن دزاير 🇩🇿'
export const BROADCAST_ICON = '/favicon.svg'
export const LISTINGS_URL = '/listings'

/**
 * Build the bilingual push payload for a new property.
 * Body carries title + wilaya + price; url deep-links the listing
 * (falls back to /listings — there is no /annonces route).
 */
export function buildBroadcastPayload(record: PropertyRecord): BroadcastPayload {
  const title = typeof record.title === 'string' && record.title.trim() !== ''
    ? record.title.trim()
    : BROADCAST_TITLE
  const place = typeof record.wilaya === 'string' && record.wilaya.trim() !== ''
    ? record.wilaya.trim()
    : typeof record.commune === 'string' && record.commune.trim() !== ''
      ? record.commune.trim()
      : null
  const priceNum = typeof record.price === 'number' && Number.isFinite(record.price)
    ? record.price
    : typeof record.price === 'string' && record.price.trim() !== '' && !Number.isNaN(Number(record.price))
      ? Number(record.price)
      : null
  const currency = typeof record.currency === 'string' && record.currency.trim() !== ''
    ? record.currency.trim()
    : 'DZD'

  const parts: string[] = [title]
  if (place) parts.push(place)
  parts.push(priceNum !== null ? `${priceNum} ${currency}` : BROADCAST_TITLE)

  const id = typeof record.id === 'string' && record.id !== '' ? record.id : null

  return {
    title: BROADCAST_TITLE,
    body: parts.join(' · '),
    icon: BROADCAST_ICON,
    url: id ? `/property/${id}` : LISTINGS_URL,
  }
}

/** Only 404/410 mean the endpoint is gone and must be deleted. */
export function isGoneSubscriptionStatus(status: number): boolean {
  return status === 404 || status === 410
}

export interface DispatchOutcome {
  status: 'fulfilled' | 'rejected'
  endpoint: string
  /** HTTP status from the push provider, when known. */
  httpStatus?: number
}

export interface DispatchSummary {
  sent: number
  failed: number
  /** Endpoints to delete from push_subscriptions. */
  removeEndpoints: string[]
}

/** Count an allSettled-style dispatch and pick stale endpoints. */
export function summarizeDispatch(outcomes: DispatchOutcome[]): DispatchSummary {
  let sent = 0
  let failed = 0
  const removeEndpoints: string[] = []
  for (const o of outcomes) {
    if (o.status === 'fulfilled') {
      sent++
    } else {
      failed++
      if (typeof o.httpStatus === 'number' && isGoneSubscriptionStatus(o.httpStatus)) {
        removeEndpoints.push(o.endpoint)
      }
    }
  }
  return { sent, failed, removeEndpoints }
}
