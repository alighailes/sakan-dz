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
      return { filters: newFilters }
    }),
  resetFilters: () => {
    set({ filters: defaultFilters })
  },
  activeOperation: undefined,
  setActiveOperation: (op) =>
    set((state) => {
      return {
        activeOperation: op,
        filters: { ...state.filters, operationType: op },
      }
    }),
}))
