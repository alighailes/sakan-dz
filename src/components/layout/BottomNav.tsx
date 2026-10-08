import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Search,
  Plus,
  Heart,
  User,
  LayoutDashboard,
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

  // Buyer / visitor tabs (left of the FAB notch).
  const buyerLeft: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/listings', icon: Search, label: t.nav.listings },
  ]
  // Buyer / visitor tabs (right of the FAB notch).
  const buyerRight: TabDef[] = [
    { to: '/favorites', icon: Heart, label: t.nav.favorites },
    { to: '/auth', icon: User, label: t.nav.profile },
  ]

  // Agent / seller tabs (left of the FAB notch): home + own listings.
  const sellerLeft: TabDef[] = [
    { to: '/', icon: Home, label: t.nav.home },
    { to: '/my-listings', icon: LayoutDashboard, label: t.nav.myListings },
  ]
  // Agent / seller tabs (right of the FAB notch): messages + account.
  const sellerRight: TabDef[] = [
    { to: '/messages', icon: MessageSquare, label: t.nav.messages },
    { to: '/auth', icon: User, label: t.nav.profile },
  ]

  const left = isSeller ? sellerLeft : buyerLeft
  const right = isSeller ? sellerRight : buyerRight

  const renderTab = ({ to, icon: Icon, label }: TabDef) => {
    const active = isActive(to)
    return (
      <Link
        key={`${label}-${to}`}
        to={to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center justify-center py-2 text-zinc-400 transition-colors duration-200',
          active && 'font-bold text-primary-600 dark:text-primary-400'
        )}
      >
        <Icon className="h-6 w-6" />
        <span className="max-w-full truncate text-[10px] font-medium mt-1">{label}</span>
      </Link>
    )
  }

  return (
    <nav aria-label="Bottom navigation" className="fixed bottom-0 inset-x-0 z-40 md:hidden">
      <div className="relative border-t border-zinc-200/80 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900">
        {/* Signature curved cutout cradling the center FAB. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 120 24"
          className="absolute -top-[23px] left-1/2 h-6 w-32 -translate-x-1/2 fill-white dark:fill-zinc-900"
        >
          <path d="M0 24 L0 8 Q 34 8 46 18 Q 54 24 60 24 Q 66 24 74 18 Q 86 8 120 8 L120 24 Z" />
        </svg>
        <div className="flex h-16 items-center justify-around px-2">
          {left.map(renderTab)}
          {/* Center FAB — publish / new property. */}
          <Link
            to="/publish"
            aria-label={t.nav.publish}
            className="relative -top-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white shadow-xl shadow-primary-500/40 transition-transform hover:bg-primary-700 active:scale-95"
          >
            <Plus className="h-7 w-7" />
          </Link>
          {right.map(renderTab)}
        </div>
      </div>
    </nav>
  )
}
