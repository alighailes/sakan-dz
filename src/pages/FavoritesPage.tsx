import { useEffect } from 'react'
import { Heart } from 'lucide-react'
import { PropertyCard } from '@/components/listings/PropertyCard'
import { PropertyCardSkeleton } from '@/components/listings/PropertyCardSkeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useProperties } from '@/hooks/useProperties'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useAuthStore } from '@/stores/authStore'
import { useLocale } from '@/i18n'

export function FavoritesPage() {
  const { properties, loading } = useProperties(undefined, { limit: 100 })
  const { favorites, loadUserFavorites } = useFavoritesStore()
  const { user } = useAuthStore()
  const { t } = useLocale()

  // Pull the logged-in user's live favorites from Supabase
  useEffect(() => {
    if (user?.id) {
      loadUserFavorites(user.id).catch(() => {})
    }
  }, [user?.id, loadUserFavorites])

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id))

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (favoriteProperties.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={Heart}
          title="Aucun favori"
          description="Ajoutez des biens a vos favoris pour les retrouver facilement."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">{t.nav.favorites}</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favoriteProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
