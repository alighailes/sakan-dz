// ============================================================
// Supabase Edge Function: send-broadcast-push (Deno)
// Trigger: Database Webhook on public.properties (INSERT).
// Fans a new-listing push notification out to every stored
// Web Push subscription, pruning dead (410/404) endpoints.
// ============================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  buildBroadcastPayload,
  summarizeDispatch,
  type DispatchOutcome,
  type PropertyRecord,
} from './payload.ts'

interface WebhookBody {
  type?: string
  table?: string
  schema?: string
  record?: PropertyRecord | null
}

interface StoredSubscription {
  endpoint: string
  p256dh: string
  auth: string
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function readEnv(name: string, fallback = ''): string {
  try {
    return Deno.env.get(name) ?? fallback
  } catch {
    return fallback
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed, use POST' }, 405)
  }

  let body: WebhookBody
  try {
    body = (await req.json()) as WebhookBody
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  // Accept INSERT webhooks on properties, or any payload carrying a record.
  const isInsert = body.type === 'INSERT'
  const record: PropertyRecord = body.record ?? {}
  if (!isInsert && !body.record) {
    return json({ error: 'Expected a properties INSERT webhook (record or type INSERT)' }, 400)
  }

  const vapidPublicKey = readEnv('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = readEnv('VAPID_PRIVATE_KEY')
  const vapidSubject = readEnv('VAPID_SUBJECT', 'mailto:alighailes@gmail.com')
  const supabaseUrl = readEnv('SUPABASE_URL')
  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!vapidPublicKey || !vapidPrivateKey) {
    return json({ error: 'Missing VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY secret' }, 500)
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY secret' }, 500)
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')

  if (subsError) {
    console.error('Failed to load push subscriptions:', subsError)
    return json({ error: 'Failed to load subscriptions' }, 500)
  }

  const subscriptions = ((subs ?? []) as StoredSubscription[]).filter((s) => s.endpoint)
  if (subscriptions.length === 0) {
    return json({ sent: 0, failed: 0, removed: 0, total: 0 })
  }

  const payload = JSON.stringify(buildBroadcastPayload(record))

  // Concurrent dispatch; one failing endpoint must not crash the batch.
  const settled = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
      return sub.endpoint
    })
  )

  const outcomes: DispatchOutcome[] = settled.map((r, i) => {
    const endpoint = subscriptions[i].endpoint
    if (r.status === 'fulfilled') return { status: 'fulfilled', endpoint }
    const statusCode = (r.reason as { statusCode?: unknown } | null)?.statusCode
    return {
      status: 'rejected',
      endpoint,
      httpStatus: typeof statusCode === 'number' ? statusCode : undefined,
    }
  })

  const { sent, failed, removeEndpoints } = summarizeDispatch(outcomes)

  // Prune stale/expired endpoints (410 Gone, 404 Not Found).
  if (removeEndpoints.length > 0) {
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', removeEndpoints)
    if (deleteError) {
      console.error('Failed to prune stale subscriptions:', deleteError)
    }
  }

  return json({ sent, failed, removed: removeEndpoints.length, total: subscriptions.length })
})
