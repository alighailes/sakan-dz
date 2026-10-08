import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Building2,
  Building,
  Map,
  Heart,
  User,
  PlusCircle,
  MessageSquare,
} from 'lucide-react'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface TabDef {
  to: string
  icon: typeof Home
  label: string
}

export function BottomNav() {
  const location = useLocation()
  const { t } = useLocale()
  const { activeRole } = useAuthStore()

  const isSeller = activeRole === 'seller'
  const isActive = (path: string) => location.pathname === path

  // Buyer mode (باحث عن سكن / مشتري): browse, map, saved, account.
  const buyerTabs: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/listings', icon: Building2, label: t.nav.listings },
    { to: '/map', icon: Map, label: t.nav.map },
    { to: '/favorites', icon: Heart, label: t.nav.favorites },
    { to: '/auth', icon: User, label: t.nav.profile },
  ]

  // Agent mode (مالك / وكيل عقاري): home, own listings, publish, inbox, account.
  const sellerTabs: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/my-listings', icon: Building, label: t.nav.myListings },
    { to: '/publish', icon: PlusCircle, label: t.nav.publish },
    { to: '/messages', icon: MessageSquare, label: t.nav.messages },
    { to: '/auth', icon: User, label: t.nav.profile },
  ]

  // Flex direction follows document.dir (ltr/rtl synced in the locale store),
  // so tab order mirrors automatically in Arabic.
  const tabs = isSeller ? sellerTabs : buyerTabs

  const renderTab = ({ to, icon: Icon, label }: TabDef) => {
    const active = isActive(to)
    return (
      <Link
        key={`${label}-${to}`}
        to={to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center justify-center py-2 transition-all duration-300 ease-spring',
          active && '-translate-y-2'
        )}
      >
        <span
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full text-zinc-400 transition-all duration-300 ease-spring dark:text-zinc-500',
            active && 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 dark:text-white'
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <span
          className={cn(
            'max-w-full truncate text-[10px] font-medium mt-1 text-zinc-400 dark:text-zinc-500',
            active && 'font-bold text-emerald-700 dark:text-emerald-300'
          )}
        >
          {label}
        </span>
      </Link>
    )
  }

  return (
    <nav aria-label="Bottom navigation" className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div className="border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="flex h-16 items-stretch justify-around px-2">
          {tabs.map(renderTab)}
        </div>
      </div>
    </nav>
  )
}
