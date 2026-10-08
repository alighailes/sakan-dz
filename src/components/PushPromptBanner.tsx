import { useEffect, useState } from 'react'
import { BellRing, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import {
  shouldShowPushNudge,
  dismissPushNudge,
  subscribeToPush,
} from '@/services/notifications'

/**
 * Subtle contextual prompt (never on first paint): appears only after a
 * nudge signal (login / register / search saved) while permission is
 * still undecided. Dismissing hides it for good.
 */
export function PushPromptBanner() {
  const { t } = useLocale()
  const { user } = useAuthStore()
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setVisible(shouldShowPushNudge())
  }, [])

  if (!visible) return null

  const handleEnable = async () => {
    setBusy(true)
    try {
      const res = await subscribeToPush(user?.id)
      if (res.ok || res.reason === 'denied') {
        dismissPushNudge()
        setVisible(false)
      }
    } finally {
      setBusy(false)
    }
  }

  const handleDismiss = () => {
    dismissPushNudge()
    setVisible(false)
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[1400] animate-slide-up md:bottom-6 md:left-auto md:right-6 md:w-80">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-soft-lg dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <BellRing className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                {t.notifications.enableNew}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.notifications.prompt}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={t.notifications.later}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleEnable} disabled={busy}>
            {t.notifications.enable}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            {t.notifications.later}
          </Button>
        </div>
      </div>
    </div>
  )
}
