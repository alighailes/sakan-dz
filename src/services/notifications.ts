import { supabase } from '@/lib/supabase'

// ============================================================
// Web Push notifications (browser Push API + Supabase storage).
//
// Flow: requestNotificationPermission() -> subscribeToPush() stores
// { endpoint, p256dh, auth } in the `push_subscriptions` table
// (see schema.sql) for later server-side fan-out.
// Everything degrades gracefully: unsupported browsers, missing
// VAPID key, denied permission or missing table all return a
// reason instead of throwing.
// ============================================================

export type PushSubscribeResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'denied' | 'no-sw' | 'no-vapid' | 'db-error' | 'error' }

const NUDGE_KEY = 'sakan-push-nudge'
const DISMISSED_KEY = 'sakan-push-dismissed'

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export function getPushPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

/** Ask the browser for notification permission (must run on user gesture). */
export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!isPushSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = window.atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

function arrayBufferToBase64(buf: ArrayBuffer | null): string {
  if (!buf) return ''
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return window.btoa(binary)
}

async function getExistingSubscription(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready
  return reg.pushManager.getSubscription()
}

/**
 * Subscribe via the registered service worker and upsert the
 * subscription into Supabase. Never throws — returns a reason.
 */
/**
 * Subscribe the user to Web Push (VAPID) and upsert the subscription.
 * Requests permission, subscribes via the service worker pushManager
 * ({ userVisibleOnly: true, applicationServerKey }), then stores the
 * endpoint + keys in Supabase `push_subscriptions`. Never throws.
 */
export async function subscribeUserToPush(userId?: string): Promise<PushSubscribeResult> {
  return subscribeToPush(userId)
}

/**
 * @deprecated Use subscribeUserToPush() instead. Kept as a thin alias.
 */
export async function subscribeToPush(userId?: string): Promise<PushSubscribeResult> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') return { ok: false, reason: 'denied' }

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!vapidKey) return { ok: false, reason: 'no-vapid' }

  let registration: ServiceWorkerRegistration
  try {
    registration = await navigator.serviceWorker.ready
  } catch {
    return { ok: false, reason: 'no-sw' }
  }

  try {
    const existing = await registration.pushManager.getSubscription()
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      }))

    const payload = {
      user_id: userId ?? null,
      endpoint: subscription.endpoint,
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth')),
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(payload, { onConflict: 'endpoint' })
    if (error) {
      console.error('Failed to save push subscription:', error)
      return { ok: false, reason: 'db-error' }
    }
    return { ok: true }
  } catch (err) {
    console.error('Push subscribe failed:', err)
    return { ok: false, reason: 'error' }
  }
}

/** Remove the browser subscription and its stored row. Never throws. */
export async function unsubscribeFromPush(): Promise<void> {
  try {
    const sub = await getExistingSubscription()
    const endpoint = sub?.endpoint
    if (sub) await sub.unsubscribe()
    if (endpoint) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    }
  } catch (err) {
    console.error('Push unsubscribe failed:', err)
  }
}

/** True when a subscription is active in this browser. */
export async function isPushSubscribed(): Promise<boolean> {
  try {
    if (!isPushSupported()) return false
    return (await getExistingSubscription()) !== null
  } catch {
    return false
  }
}

// ------------------------------------------------------------
// Contextual nudge flags (never bombard on first visit).
// Call signalPushNudge() after login/register or search-save;
// the banner shows only while permission is still 'default'.
// ------------------------------------------------------------

export function signalPushNudge(): void {
  try {
    if (!isPushSupported()) return
    if (Notification.permission !== 'default') return
    if (localStorage.getItem(DISMISSED_KEY)) return
    localStorage.setItem(NUDGE_KEY, '1')
  } catch {
    // Storage unavailable — skip the nudge silently.
  }
}

export function shouldShowPushNudge(): boolean {
  try {
    if (!isPushSupported()) return false
    if (Notification.permission !== 'default') return false
    if (localStorage.getItem(DISMISSED_KEY)) return false
    return localStorage.getItem(NUDGE_KEY) === '1'
  } catch {
    return false
  }
}

export function dismissPushNudge(permanent = true): void {
  try {
    localStorage.removeItem(NUDGE_KEY)
    if (permanent) localStorage.setItem(DISMISSED_KEY, '1')
  } catch {
    // Ignore storage errors.
  }
}
