import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { PropertyCard } from './PropertyCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { useProperties } from '@/hooks/useProperties'
import { useSearchStore } from '@/stores/searchStore'
import { useLocale } from '@/i18n'

export function ListingsGrid() {
  const filters = useSearchStore((state) => state.filters)
  const { properties, loading, error, refetch } = useProperties(filters)
  const { locale, t } = useLocale()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
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
    </div>
  )
}
