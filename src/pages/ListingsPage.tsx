import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FilterBar } from '@/components/listings/FilterBar'
import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { SaveSearchButton } from '@/components/SaveSearchButton'
import { useSearchStore } from '@/stores/searchStore'

export function ListingsPage() {
  const [searchParams] = useSearchParams()
  const { setFilters, setActiveOperation } = useSearchStore()

  // Sync URL query parameters into the search store on mount and when they change
  useEffect(() => {
    console.log('ListingsPage - URL params changed:', Object.fromEntries(searchParams.entries()))
    const filters: Record<string, unknown> = {}

    const q = searchParams.get('q')
    if (q) filters.query = q

    const wilaya = searchParams.get('wilaya')
    if (wilaya) filters.wilayaId = Number(wilaya)

    const operation = searchParams.get('operation')
    if (operation) {
      filters.operationType = operation as 'rent' | 'sale' | 'vacation' | 'colocation'
      setActiveOperation(operation as 'rent' | 'sale' | 'vacation' | 'colocation')
    }

    const type = searchParams.get('type')
    if (type) filters.propertyType = type

    const minPrice = searchParams.get('minPrice')
    if (minPrice) filters.minPrice = Number(minPrice)

    const maxPrice = searchParams.get('maxPrice')
    if (maxPrice) filters.maxPrice = Number(maxPrice)

    const bedrooms = searchParams.get('bedrooms')
    if (bedrooms) filters.minBedrooms = Number(bedrooms)

    console.log('ListingsPage - setting filters from URL:', filters)
    setFilters(filters)
  }, [searchParams, setFilters, setActiveOperation])

  return (
    <div>
      <FilterBar />
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-end">
          <SaveSearchButton />
        </div>
      </div>
      <ListingsGrid />
    </div>
  )
}
