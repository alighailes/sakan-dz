import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { WILAYAS_58, getCommunesByWilaya, wilayaLabel, communeLabel, communeValue } from '@/data/algeria-locations'
import { OPERATION_TYPES, PROPERTY_TYPES, LEGAL_STATUS } from '@/constants'
import { useLocale } from '@/i18n'
import { useSearchStore } from '@/stores/searchStore'
import { cn } from '@/lib/utils'
import type { PropertyType, LegalStatus, ColocationGender } from '@/types'

export function FilterBar() {
  const [showFilters, setShowFilters] = useState(false)
  const { locale, t } = useLocale()
  const { filters, setFilters, resetFilters, activeOperation, setActiveOperation } = useSearchStore()

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null && v !== ''
  ).length

  const hasActiveFilters = activeFilterCount > 0

  const handleReset = () => {
    resetFilters()
    setActiveOperation(undefined)
  }

  return (
    <div className="sticky top-16 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Operation Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveOperation(undefined)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              !activeOperation
                ? 'bg-primary-600 text-white shadow-glow'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            )}
          >
            {t.filters.all}
          </button>
          {OPERATION_TYPES.map((op) => (
            <button
              key={op.value}
              onClick={() => setActiveOperation(activeOperation === op.value ? undefined : op.value)}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                activeOperation === op.value
                  ? 'bg-primary-600 text-white shadow-glow'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
              )}
            >
              {locale === 'ar' ? op.labelAr : op.labelFr}
            </button>
          ))}

          <div className="ml-auto flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-1.5"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-3 border-t border-zinc-200 pt-4 dark:border-zinc-700 animate-slide-up">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {/* Wilaya */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.wilaya}
                </label>
                <Select
                  value={filters.wilayaId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    // Reset the dependent commune whenever the wilaya changes
                    setFilters({ wilayaId: val, commune: undefined })
                  }}
                >
                  <option value="">{t.filters.allWilayas}</option>
                  {WILAYAS_58.map((w) => (
                    <option key={w.code} value={w.code}>
                      {wilayaLabel(w, locale)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Commune — dependent on the selected wilaya */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.commune}
                </label>
                <Select
                  value={filters.commune ?? ''}
                  disabled={filters.wilayaId === undefined}
                  onChange={(e) => {
                    const val = e.target.value || undefined
                    setFilters({ commune: val })
                  }}
                >
                  <option value="">
                    {filters.wilayaId === undefined ? t.filters.selectWilayaFirst : t.filters.allCommunes}
                  </option>
                  {getCommunesByWilaya(filters.wilayaId).map((c) => (
                    <option key={communeValue(c)} value={communeValue(c)}>
                      {communeLabel(c, locale)}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Property Type */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.propertyType}
                </label>
                <Select
                  value={filters.propertyType ?? ''}
                  onChange={(e) => {
                    const val = (e.target.value || undefined) as PropertyType | undefined
                    setFilters({ propertyType: val })
                  }}
                >
                  <option value="">{t.filters.allTypes}</option>
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {locale === 'ar' ? pt.labelAr : pt.labelFr}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Legal Status */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.legalStatus}
                </label>
                <Select
                  value={filters.legalStatus ?? ''}
                  onChange={(e) => {
                    const val = (e.target.value || undefined) as LegalStatus | undefined
                    setFilters({ legalStatus: val })
                  }}
                >
                  <option value="">{t.filters.allLegal}</option>
                  {LEGAL_STATUS.map((ls) => (
                    <option key={ls.value} value={ls.value}>
                      {locale === 'ar' ? ls.labelAr : ls.labelFr}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Min Price */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.minPrice}
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    setFilters({ minPrice: val })
                  }}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.maxPrice}
                </label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    setFilters({ maxPrice: val })
                  }}
                />
              </div>

              {/* Bedrooms */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.bedrooms}
                </label>
                <Select
                  value={filters.minBedrooms ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined
                    setFilters({ minBedrooms: val })
                  }}
                >
                  <option value="">{t.filters.any}</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}+</option>
                  ))}
                </Select>
              </div>

              {/* Colocation Gender */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.colocationGender}
                </label>
                <Select
                  value={filters.colocationGender ?? ''}
                  onChange={(e) => {
                    const val = (e.target.value || undefined) as ColocationGender | undefined
                    setFilters({ colocationGender: val })
                  }}
                >
                  <option value="">{t.filters.anyGender}</option>
                  <option value="male_only">{t.filters.maleOnly}</option>
                  <option value="female_only">{t.filters.femaleOnly}</option>
                </Select>
              </div>

              {/* Student Friendly */}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {t.filters.studentFriendly}
                </label>
                <Select
                  value={filters.studentFriendly !== undefined ? String(filters.studentFriendly) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? e.target.value === 'true' : undefined
                    setFilters({ studentFriendly: val })
                  }}
                >
                  <option value="">{t.filters.any}</option>
                  <option value="true">{t.filters.studentFriendly}</option>
                </Select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {activeFilterCount} filtre(s) actif(s)
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="h-3.5 w-3.5" />
                  {t.filters.reset}
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  {t.filters.apply}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
