import { Link, useLocation } from 'react-router-dom'
import { Home, Map, Heart, MessageCircle, Plus, User, LayoutDashboard, Bookmark } from 'lucide-react'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const location = useLocation()
  const { t } = useLocale()
  const { user, profile } = useAuthStore()

  // Seller mode surfaces management shortcuts; buyer mode focuses discovery.
  // Unknown/unset role falls back to buyer. All targets are real routes.
  const navItems =
    profile?.role === 'seller'
      ? [
          { to: '/my-listings', icon: LayoutDashboard, label: t.role.dashboard },
          { to: '/messages', icon: MessageCircle, label: t.nav.messages },
          { to: '/map', icon: Map, label: t.nav.map },
          { to: '/saved-searches', icon: Bookmark, label: t.nav.savedSearches },
        ]
      : [
          { to: '/', icon: Home, label: t.nav.home },
          { to: '/listings', icon: Home, label: t.nav.listings },
          { to: '/map', icon: Map, label: t.nav.map },
          { to: '/favorites', icon: Heart, label: t.nav.favorites },
        ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-4 mb-4">
        <div className="glass-strong flex items-center justify-around rounded-2xl px-2 py-2 shadow-soft-xl">
          {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                isActive(to)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive(to) && 'scale-110')} />
              <span>{label}</span>
            </Link>
          ))}

          {/* Center Publish Button */}
          <Link
            to="/publish"
            className="flex h-12 w-12 -mt-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow transition-transform active:scale-90"
          >
            <Plus className="h-6 w-6" />
          </Link>

          {navItems.slice(2, 4).map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                isActive(to)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive(to) && 'scale-110')} />
              <span>{label}</span>
            </Link>
          ))}

          {/* Auth / Profile */}
          {user ? (
            <Link
              to="/my-listings"
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                location.pathname === '/my-listings'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              <User className={cn('h-5 w-5 transition-transform duration-200', location.pathname === '/my-listings' && 'scale-110')} />
              <span>{t.nav.myListings}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200',
                location.pathname === '/auth'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              )}
            >
              <User className={cn('h-5 w-5 transition-transform duration-200', location.pathname === '/auth' && 'scale-110')} />
              <span>{t.nav.login}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
