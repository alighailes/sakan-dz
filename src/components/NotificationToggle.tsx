import { useEffect, useState } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import {
  isPushSupported,
  isPushSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/services/notifications'
import { cn } from '@/lib/utils'

/** Subtle account-menu toggle: "تفعيل الإشعارات بالجديد". */
export function NotificationToggle({ onDone, className }: { onDone?: () => void; className?: string }) {
  const { t } = useLocale()
  const { user } = useAuthStore()
  const [supported] = useState(isPushSupported)
  const [active, setActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    let cancelled = false
    isPushSubscribed().then((v) => {
      if (!cancelled) setActive(v)
    })
    if ('Notification' in window) {
      setDenied(Notification.permission === 'denied')
    }
    return () => {
      cancelled = true
    }
  }, [])

  if (!supported) return null

  const handleToggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (active) {
        await unsubscribeFromPush()
        setActive(false)
      } else {
        const res = await subscribeToPush(user?.id)
        if (res.ok) {
          setActive(true)
          setDenied(false)
        } else if (res.reason === 'denied') {
          setDenied(true)
        }
      }
    } finally {
      setBusy(false)
      onDone?.()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={busy}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-700',
        className
      )}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : active ? (
        <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      <span className="flex-1 text-start">{t.notifications.enableNew}</span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-medium',
          denied
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : active
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
        )}
      >
        {denied ? '!' : active ? t.notifications.on : t.notifications.off}
      </span>
    </button>
  )
}
