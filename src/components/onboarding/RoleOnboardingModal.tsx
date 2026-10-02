import { useState } from 'react'
import { Home, Building2, Loader2 } from 'lucide-react'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

/**
 * First-time role onboarding. Shows once per session when a logged-in user
 * has no role set yet. Choosing a role persists it (Supabase + local store).
 */
export function RoleOnboardingModal() {
  const { user, profile, loading, updateRole } = useAuthStore()
  const { t } = useLocale()
  const [dismissed, setDismissed] = useState(false)
  const [saving, setSaving] = useState<UserRole | null>(null)

  if (loading || !user || profile?.role || dismissed) return null

  const choose = async (role: UserRole) => {
    setSaving(role)
    try {
      await updateRole(role)
    } finally {
      setSaving(null)
    }
  }

  const options: { role: UserRole; icon: typeof Home; title: string; desc: string }[] = [
    { role: 'buyer', icon: Home, title: t.role.buyerTitle, desc: t.role.buyerDesc },
    { role: 'seller', icon: Building2, title: t.role.sellerTitle, desc: t.role.sellerDesc },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl dark:bg-zinc-900 sm:p-8 animate-scale-in">
        <h2 className="text-center text-xl font-bold text-zinc-900 dark:text-white">
          {t.role.onboardingTitle}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t.role.onboardingSubtitle}
        </p>

        <div className="mt-6 space-y-3">
          {options.map(({ role, icon: Icon, title, desc }) => (
            <button
              key={role}
              type="button"
              disabled={saving !== null}
              onClick={() => choose(role)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl border-2 border-zinc-200 p-4 text-start transition-all',
                'hover:border-primary-500 hover:bg-primary-50 dark:border-zinc-700 dark:hover:border-primary-400 dark:hover:bg-primary-900/20',
                'disabled:cursor-wait disabled:opacity-60'
              )}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                {saving === role ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600 dark:text-primary-400" />
                ) : (
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">{title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-4 w-full text-center text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {t.role.later}
        </button>
      </div>
    </div>
  )
}
