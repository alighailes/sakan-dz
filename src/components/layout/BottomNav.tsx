import { Link, useLocation } from 'react-router-dom'
import { Home, Building2, Plus, Heart, User } from 'lucide-react'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const location = useLocation()
  const { t } = useLocale()
  const { user } = useAuthStore()

  const accountTo = user ? '/my-listings' : '/auth'
  const isActive = (path: string) => location.pathname === path
  const isPublishActive = location.pathname === '/publish'

  const tabs = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/listings', icon: Building2, label: t.nav.listings },
  ]
  const endTabs = [
    { to: '/favorites', icon: Heart, label: t.nav.favorites },
    { to: accountTo, icon: User, label: t.nav.profile },
  ]

  const renderTab = ({ to, icon: Icon, label }: { to: string; icon: typeof Home; label: string }) => {
    const active = isActive(to)
    return (
      <Link
        key={to}
        to={to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-1.5 transition-colors duration-200',
          active
            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
        )}
      >
        <Icon className={cn('h-5 w-5 transition-transform duration-200', active && 'scale-110')} />
        <span className="max-w-full truncate text-[10px] font-medium">{label}</span>
        <span
          className={cn(
            'h-1 w-1 rounded-full transition-opacity duration-200',
            active ? 'bg-primary-600 opacity-100 dark:bg-primary-400' : 'opacity-0'
          )}
        />
      </Link>
    )
  }

  return (
    <nav aria-label="Bottom navigation" className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-md md:hidden">
      <div className="flex items-center justify-around rounded-full border border-zinc-200/80 bg-white/90 px-2 py-2 shadow-xl shadow-black/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
        {tabs.map(renderTab)}
        <Link
          to="/publish"
          aria-label={t.nav.publish}
          className={cn(
            '-mt-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 transition-transform duration-150 hover:bg-primary-700 active:scale-90',
            isPublishActive && 'ring-2 ring-primary-300 ring-offset-2 ring-offset-white dark:ring-primary-700 dark:ring-offset-zinc-900'
          )}
        >
          <Plus className="h-6 w-6" />
        </Link>
        {endTabs.map(renderTab)}
      </div>
    </nav>
  )
}
