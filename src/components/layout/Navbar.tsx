import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Map, Heart, MessageCircle, Plus, Menu, X, Sun, Moon, Globe, ChevronDown, LogOut, Building2, List, Bookmark, Users, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/stores/themeStore'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { CurrencyToggle } from '@/components/CurrencyToggle'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useThemeStore()
  const { locale, setLocale, t } = useLocale()
  const { user, profile, signOut, updateRole } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isSeller = profile?.role === 'seller'

  const navLinks = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/listings', label: t.nav.listings, icon: Home },
    { to: '/agents', label: t.nav.agents || 'الوكلاء', icon: Users },
    { to: '/map', label: t.nav.map, icon: Map },
    { to: '/favorites', label: t.nav.favorites, icon: Heart },
    { to: '/messages', label: t.nav.messages, icon: MessageCircle },
  ]

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUserMenuOpen(false)
    navigate('/')
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const roleBadge = (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
      {isSeller ? <Building2 className="h-3 w-3" /> : <Home className="h-3 w-3" />}
      {isSeller ? t.role.sellerBadge : t.role.buyerBadge}
    </span>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <path d="M8 16l8-8 8 8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 14v8h12v-8" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white">
            Sakan <span className="text-primary-600 dark:text-primary-400">DZ</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive(to)
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions — mobile keeps only: Theme, Language, Hamburger */}
        <div className="flex items-center gap-2">
          {/* Language Switcher — visible on mobile and desktop */}
          <Button
            variant="ghost"
            onClick={() => setLocale(locale === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-1 px-2"
            aria-label="Switch language"
          >
            <Globe className="h-5 w-5" />
            <span className="text-xs font-bold uppercase">{locale}</span>
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          {/* Currency Toggle — desktop only, lives in the mobile drawer */}
          <div className="hidden md:flex">
            <CurrencyToggle />
          </div>

          {/* Auth Section — desktop only, account lives in the mobile drawer */}
          <div className="hidden md:block">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {getInitials()}
                </div>
                <ChevronDown className={cn('h-4 w-4 text-zinc-400 transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div className="glass-strong absolute end-0 top-full mt-2 w-56 rounded-xl py-1 shadow-soft-xl animate-fade-in">
                  {/* User Info */}
                  <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-700">
                    <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                      <span className="min-w-0 truncate">{profile?.full_name || user.email}</span>
                      {roleBadge}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                    {profile?.user_type === 'agency' && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                        <Building2 className="h-3 w-3" />
                        {t.auth.agency}
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      to="/my-listings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <List className="h-4 w-4" />
                      {t.nav.myListings}
                    </Link>
                    <Link
                      to="/saved-searches"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Bookmark className="h-4 w-4" />
                      {t.nav.savedSearches}
                    </Link>
                    <Link
                      to="/favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Heart className="h-4 w-4" />
                      {t.nav.favorites}
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t.nav.messages}
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-zinc-100 py-1 dark:border-zinc-700">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        updateRole(isSeller ? 'buyer' : 'seller')
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      {isSeller ? t.role.switchToBuyer : t.role.switchToSeller}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.nav.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button size="sm" variant="outline">
                {t.nav.login}
              </Button>
            </Link>
          )}
          </div>

          {/* Publish CTA */}
          <Link to="/publish" className="hidden sm:block">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              {t.nav.publish}
            </Button>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {/* Account header — exclusive mobile home of the profile/avatar */}
            {user && (
              <div className="mb-2 flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  {getInitials()}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-white">
                    <span className="min-w-0 truncate">{profile?.full_name || user.email}</span>
                    {roleBadge}
                  </p>
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user.email}</p>
                </div>
              </div>
            )}
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(to)
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/my-listings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <List className="h-4 w-4" />
                  {t.nav.myListings}
                </Link>
                <Link
                  to="/saved-searches"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  <Bookmark className="h-4 w-4" />
                  {t.nav.savedSearches}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false)
                    handleSignOut()
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="mt-2 w-full">
                  {t.nav.login}
                </Button>
              </Link>
            )}
            <Link to="/publish" onClick={() => setMobileOpen(false)}>
              <Button className="mt-2 w-full gap-1.5">
                <Plus className="h-4 w-4" />
                {t.nav.publish}
              </Button>
            </Link>
            {/* Role switcher — persists instantly, no re-login needed */}
            {user && (
              <div className="mt-2 rounded-xl bg-zinc-50 p-2.5 dark:bg-zinc-800">
                <p className="flex items-center gap-1.5 px-1 pb-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {t.role.browsingAs} {roleBadge}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { role: 'buyer' as const, label: t.role.buyerTitle },
                      { role: 'seller' as const, label: t.role.sellerTitle },
                    ]
                  ).map(({ role, label }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => updateRole(role)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-xs font-bold transition-all',
                        (profile?.role ?? 'buyer') === role
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white text-zinc-500 hover:text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Currency setting — drawer home on mobile */}
            <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <span>{locale === 'ar' ? 'العملة' : 'Devise'}</span>
              <CurrencyToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
