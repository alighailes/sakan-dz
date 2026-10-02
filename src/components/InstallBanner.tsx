import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const { t } = useLocale()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [dismissed])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    setDismissed(true)
  }

  if (!showBanner || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[1500] md:bottom-6 md:left-auto md:right-6 md:w-80 animate-slide-up">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-soft-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Download className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t.pwa.installTitle}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.pwa.installDescription}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={handleInstall}>
            {t.pwa.install}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            {t.pwa.dismiss}
          </Button>
        </div>
      </div>
    </div>
  )
}
