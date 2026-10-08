import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'
import { InstallBanner } from '@/components/InstallBanner'
import { PushPromptBanner } from '@/components/PushPromptBanner'

export function Layout() {
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/auth')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">
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
      <BottomNav />
      <InstallBanner />
      <PushPromptBanner />
    </div>
  )
}
