import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { MobileNav } from './MobileNav'
import { Footer } from './Footer'
import { InstallBanner } from '@/components/InstallBanner'

export function Layout() {
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/auth')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      {/* Hide heavy multi-column footer on mobile auth views for a cleaner native look */}
      {isAuthPage ? (
        <div className="hidden md:block">
          <Footer />
        </div>
      ) : (
        <Footer />
      )}
      <MobileNav />
      <InstallBanner />
    </div>
  )
}
