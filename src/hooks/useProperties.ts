import { useState, useEffect, useCallback } from 'react'
import type { Property, SearchFilters } from '@/types'
import { fetchProperties, invalidatePropertiesCache } from '@/services/api'

interface UsePropertiesReturn {
  properties: Property[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch live properties from Supabase with optional filters.
 * Returns an empty array when the table is empty or on error (no mock data).
 */
export function useProperties(filters?: SearchFilters): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const filtersKey = JSON.stringify(filters ?? {})

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const parsed: SearchFilters = filtersKey ? (JSON.parse(filtersKey) as SearchFilters) : {}
        const data = await fetchProperties(Object.keys(parsed).length > 0 ? parsed : undefined)
        if (!cancelled) {
          setProperties(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch properties')
          setProperties([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, nonce])

  const refetch = useCallback(() => {
    // Bypass the shared query cache so an explicit refresh always
    // hits the network (e.g. after deleting a listing).
    invalidatePropertiesCache()
    setNonce((n) => n + 1)
  }, [])

  return { properties, loading, error, refetch }
}
