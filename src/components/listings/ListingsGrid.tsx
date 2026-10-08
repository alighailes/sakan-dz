import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { PropertyCard } from './PropertyCard'
import { PropertyCardSkeleton } from './PropertyCardSkeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useProperties } from '@/hooks/useProperties'
import { useSearchStore } from '@/stores/searchStore'
import { useLocale } from '@/i18n'
import { FEED_PAGE_SIZE } from '@/services/api'

export function ListingsGrid() {
  const filters = useSearchStore((state) => state.filters)
  const [limit, setLimit] = useState(FEED_PAGE_SIZE)
  const { locale, t } = useLocale()

  // Reset paging whenever filters change (paginated feed, 12 per page)
  useEffect(() => {
    setLimit(FEED_PAGE_SIZE)
  }, [filters])

  const { properties, loading, error, refetch } = useProperties(filters, { limit })

  // Keep the current page visible while the next one loads
  const showSkeletons = loading && properties.length === 0
  const hasMore = !loading && properties.length >= limit

  if (showSkeletons) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={SearchX}
          title={t.common.error}
          description={error}
          action={<Button onClick={refetch}>{t.common.retry}</Button>}
        />
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          icon={SearchX}
          title={locale === 'ar' ? 'لا توجد عقارات منشورة حالياً - كن أول من ينشر عقاراً!' : 'Aucun bien publié pour le moment — soyez le premier à publier !'}
          description={locale === 'ar' ? 'جرّب تعديل الفلاتر أو انشر عقارك مجاناً.' : 'Essayez de modifier les filtres ou publiez votre bien gratuitement.'}
          action={
            <Link to="/publish">
              <Button>{locale === 'ar' ? 'انشر عقاراً الآن' : 'Publier un bien'}</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Results count */}
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="font-semibold text-zinc-900 dark:text-white">{properties.length}</span>{' '}
        {t.filters.results}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Load more (paginated feed) */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => setLimit((l) => l + FEED_PAGE_SIZE)}
            disabled={loading}
          >
            {loading ? t.common.loading : t.common.loadMore}
          </Button>
        </div>
      )}
    </div>
  )
}
