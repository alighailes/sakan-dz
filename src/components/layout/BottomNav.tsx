import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Building,
  Map,
  Heart,
  User,
  Plus,
  MessageSquare,
  Search,
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
  const { user, activeRole } = useAuthStore()

  const isSeller = activeRole === 'seller'
  const isActive = (path: string) => location.pathname === path

  // Dynamic account target: authenticated users go to /profile,
  // logged-out users go to /auth.
  const profileTo = user ? '/profile' : '/auth'

  // Buyer mode (باحث عن سكن / مشتري): home, listings, map, favorites, account.
  const buyerTabs: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/listings', icon: Search, label: t.nav.listings },
    { to: '/map', icon: Map, label: t.nav.map },
    { to: '/favorites', icon: Heart, label: t.nav.favorites },
    { to: profileTo, icon: User, label: t.nav.profile },
  ]

  // Agent mode (مالك / وكيل عقاري): home, own listings, publish, inbox, account.
  const sellerTabs: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/my-listings', icon: Building, label: t.nav.myListings },
    { to: '/publish', icon: Plus, label: t.nav.publish },
    { to: '/messages', icon: MessageSquare, label: t.nav.messages },
    { to: profileTo, icon: User, label: t.nav.profile },
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
        aria-label={label}
        title={label}
        aria-current={active ? 'page' : undefined}
        className="flex items-center justify-center"
      >
        <span
          className={cn(
            'p-2.5 rounded-xl transition-all duration-200',
            active
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/40'
              : 'text-zinc-400 hover:text-zinc-200'
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </Link>
    )
  }

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-3 inset-x-4 mx-auto max-w-md h-14 rounded-2xl bg-zinc-950/90 dark:bg-zinc-900/90 backdrop-blur-lg border border-zinc-800 shadow-2xl flex items-center justify-around px-3 z-40 md:hidden"
    >
      {tabs.map(renderTab)}
    </nav>
  )
}
