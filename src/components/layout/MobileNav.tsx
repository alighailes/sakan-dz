import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Map, Heart, MessageCircle, Plus, User, LayoutDashboard } from 'lucide-react'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface TabDef {
  to: string
  icon: typeof Home
  label: string
}

export function MobileNav() {
  const location = useLocation()
  const { t } = useLocale()
  const { user, profile } = useAuthStore()

  const isSeller = profile?.role === 'seller'
  // NOTE: /annonces, /carte, /favoris, /profile and /dashboard do not exist as
  // routes — every target below is mapped to its real equivalent.
  const accountTo = user ? '/my-listings' : '/auth'

  // Buyer: 100% browsing-focused, flat 5 tabs (no publish FAB, no listings mgmt).
  const buyerTabs: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/listings', icon: Search, label: t.nav.listings },
    { to: '/map', icon: Map, label: t.nav.map },
    { to: '/favorites', icon: Heart, label: t.nav.favorites },
    { to: accountTo, icon: User, label: t.nav.profile },
  ]

  // Seller: management layout. /dashboard has no route — /my-listings serves
  // as both dashboard and listings manager, hence the shared target.
  const sellerLeft: TabDef[] = [
    { to: '/my-listings', icon: LayoutDashboard, label: t.role?.dashboard ?? 'Tableau de bord' },
    { to: '/messages', icon: MessageCircle, label: t.nav.messages },
  ]
  const sellerRight: TabDef[] = [
    { to: '/listings', icon: Search, label: t.nav.listings },
    { to: accountTo, icon: User, label: t.nav.profile },
  ]

  const isActive = (path: string) => location.pathname === path

  // Flex direction follows document.dir (ltr/rtl synced in the locale store),
  // so tab order mirrors automatically in Arabic.
  const renderTab = ({ to, icon: Icon, label }: TabDef) => (
    <Link
      key={`${label}-${to}`}
      to={to}
      className={cn(
        'flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-xs font-medium transition-all duration-200',
        isActive(to)
          ? 'text-primary-600 dark:text-primary-400'
          : 'text-zinc-500 dark:text-zinc-400'
      )}
    >
      <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive(to) && 'scale-110')} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-4 mb-4">
        <div className="glass-strong flex items-center justify-around rounded-2xl px-2 py-2 shadow-soft-xl">
          {isSeller ? (
            <>
              {sellerLeft.map(renderTab)}

              {/* Center Floating Publish Button (seller only) */}
              <Link
                to="/publish"
                aria-label={t.nav.publish}
                className="flex h-12 w-12 shrink-0 -mt-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow transition-transform active:scale-90"
              >
                <Plus className="h-6 w-6" />
              </Link>

              {sellerRight.map(renderTab)}
            </>
          ) : (
            buyerTabs.map(renderTab)
          )}
        </div>
      </div>
    </nav>
  )
}
