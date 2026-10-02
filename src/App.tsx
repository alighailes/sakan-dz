import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { InstallBanner } from '@/components/InstallBanner'
import { HomePage } from '@/pages/HomePage'
import { ListingsPage } from '@/pages/ListingsPage'
import { MapPage } from '@/pages/MapPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { PublishPage } from '@/pages/PublishPage'
import { PropertyDetailPage } from '@/pages/PropertyDetailPage'
import { AuthPage } from '@/pages/Auth'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { SavedSearchesPage } from '@/pages/SavedSearchesPage'
import { ContractGeneratorPage } from '@/pages/ContractGeneratorPage'
import { AgencyPage } from '@/pages/AgencyPage'
import { AgentsPage } from '@/pages/AgentsPage'
import { AboutPage } from '@/pages/AboutPage'
import { CareersPage } from '@/pages/CareersPage'
import { ContactPage } from '@/pages/ContactPage'
import { FaqPage } from '@/pages/FaqPage'
import { FinancingPage } from '@/pages/guides/FinancingPage'
import { FirstTimeBuyerPage } from '@/pages/guides/FirstTimeBuyerPage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { ValuationPage } from '@/pages/ValuationPage'
import { useAuthStore } from '@/stores/authStore'

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
<BrowserRouter basename={import.meta.env.BASE_URL} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/saved-searches" element={<SavedSearchesPage />} />
          <Route path="/contract" element={<ContractGeneratorPage />} />
          <Route path="/agency/:agencyId" element={<AgencyPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/guides/first-time-buyer" element={<FirstTimeBuyerPage />} />
          <Route path="/guides/financing" element={<FinancingPage />} />
          <Route path="/valuation" element={<ValuationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route
            path="/publish"
            element={
              <ProtectedRoute>
                <PublishPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
        </Route>
      </Routes>
      <ChatWidget />
      <InstallBanner />
    </BrowserRouter>
  )
}
