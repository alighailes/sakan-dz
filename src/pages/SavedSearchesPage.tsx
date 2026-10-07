import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Bell, BellOff, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { WILAYAS } from '@/constants'

interface SavedSearch {
  id: string
  userId: string
  criteria: Record<string, unknown>
  notifyEmail: boolean
  createdAt: string
}

export function SavedSearchesPage() {
  const { t } = useLocale()
  const { user } = useAuthStore()
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    if (!user) return
    const saved = JSON.parse(localStorage.getItem('sakan-saved-searches') || '[]')
    setSavedSearches(saved.filter((s: SavedSearch) => s.userId === user.id))
  }, [user])

  const handleDelete = (id: string) => {
    const saved = JSON.parse(localStorage.getItem('sakan-saved-searches') || '[]')
    const filtered = saved.filter((s: SavedSearch) => s.id !== id)
    localStorage.setItem('sakan-saved-searches', JSON.stringify(filtered))
    setSavedSearches(filtered.filter((s: SavedSearch) => s.userId === user?.id))
  }

  const handleToggleNotification = (id: string) => {
    const saved = JSON.parse(localStorage.getItem('sakan-saved-searches') || '[]')
    const updated = saved.map((s: SavedSearch) =>
      s.id === id ? { ...s, notifyEmail: !s.notifyEmail } : s
    )
    localStorage.setItem('sakan-saved-searches', JSON.stringify(updated))
    setSavedSearches(updated.filter((s: SavedSearch) => s.userId === user?.id))
  }

  const formatCriteria = (criteria: Record<string, unknown>) => {
    const parts: string[] = []
    if (criteria.wilayaId) {
      const wilaya = WILAYAS.find((w) => w.id === criteria.wilayaId)
      if (wilaya) parts.push(wilaya.name)
    }
    if (criteria.operationType) parts.push(String(criteria.operationType))
    if (criteria.propertyType) parts.push(String(criteria.propertyType))
    if (criteria.minPrice || criteria.maxPrice) {
      parts.push(`${criteria.minPrice || 0} - ${criteria.maxPrice || '∞'} DZD`)
    }
    if (criteria.minBedrooms) parts.push(`${criteria.minBedrooms}+ chambres`)
    return parts.join(' · ') || 'Tous les critères'
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={Bookmark}
          title={t.savedSearches.empty}
          description={t.savedSearches.emptyHint}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {t.savedSearches.title}
      </h1>

      {savedSearches.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t.savedSearches.empty}
          description={t.savedSearches.emptyHint}
          action={
            <Link to="/listings">
              <Button className="gap-1.5">
                <Search className="h-4 w-4" />
                {t.nav.listings}
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-soft dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                  <Bookmark className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCriteria(search.criteria)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={search.notifyEmail ? 'success' : 'secondary'}>
                  {search.notifyEmail ? t.savedSearches.active : t.savedSearches.inactive}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleNotification(search.id)}
                  title={search.notifyEmail ? t.savedSearches.disableNotifications : t.savedSearches.enableNotifications}
                >
                  {search.notifyEmail ? (
                    <Bell className="h-4 w-4 text-green-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(search.id)}
                  title={t.savedSearches.deleteSearch}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
