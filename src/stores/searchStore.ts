import { create } from 'zustand'
import type { SearchFilters, OperationType } from '@/types'

interface SearchState {
  filters: SearchFilters
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
  activeOperation: OperationType | undefined
  setActiveOperation: (op: OperationType | undefined) => void
}

const defaultFilters: SearchFilters = {}

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) =>
    set((state) => {
      const newFilters = { ...state.filters }
      // Properly handle undefined values by deleting the key
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          delete newFilters[key as keyof SearchFilters]
        } else {
          (newFilters as Record<string, unknown>)[key] = value
        }
      })
      console.log('searchStore - setFilters called with:', filters)
      console.log('searchStore - new filters:', newFilters)
      return { filters: newFilters }
    }),
  resetFilters: () => {
    console.log('searchStore - resetFilters called')
    set({ filters: defaultFilters })
  },
  activeOperation: undefined,
  setActiveOperation: (op) =>
    set((state) => {
      console.log('searchStore - setActiveOperation called with:', op)
      return {
        activeOperation: op,
        filters: { ...state.filters, operationType: op },
      }
    }),
}))
