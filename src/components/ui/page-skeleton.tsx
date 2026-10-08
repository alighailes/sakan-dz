import { Skeleton } from '@/components/ui/skeleton'

/**
 * Lightweight route-level fallback for React.lazy() pages.
 * Mirrors a generic listing/detail layout so lazy chunks resolve
 * without layout shift. Kept dependency-free (no stores/i18n) so the
 * initial bundle stays small.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 aspect-[4/3] w-full rounded-2xl sm:aspect-video" />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
