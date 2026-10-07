import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrencyMode } from '@/types'

interface CurrencyState {
  mode: CurrencyMode
  toggleMode: () => void
  setMode: (mode: CurrencyMode) => void
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      mode: 'dzd',
      toggleMode: () =>
        set((state) => ({ mode: state.mode === 'dzd' ? 'centimes' : 'dzd' })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'sakan-currency',
    }
  )
)
