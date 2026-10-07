import { Skeleton } from '@/components/ui/skeleton'

/**
 * Realistic loading placeholder that mirrors the PropertyCard layout
 * (image + price/location overlays, title, location row, features row,
 * badges, footer) for instantaneous perceived performance.
 */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900">
      {/* Image placeholder with price + views pills */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <Skeleton className="h-8 w-24 rounded-xl" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title bar */}
        <Skeleton className="h-4 w-3/4" />
        {/* Location row */}
        <div className="mt-2 flex items-center gap-1.5">
          <Skeleton className="h-3.5 w-3.5 shrink-0 rounded-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        {/* Features row */}
        <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
        </div>
        {/* Badges */}
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
