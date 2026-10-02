import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import fr from './fr'
import ar from './ar'
import type { Locale } from '@/types'

type Translations = typeof fr

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const translations: Record<Locale, Translations> = { fr, ar }

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'fr',
      setLocale: (locale) => set({ locale, t: translations[locale] }),
      t: translations.fr,
    }),
    {
      name: 'sakan-locale',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const dir = state.locale === 'ar' ? 'rtl' : 'ltr'
          document.documentElement.dir = dir
          document.documentElement.lang = state.locale
        }
      },
    }
  )
)

// Helper hook for components
export function useTranslations() {
  return useLocaleStore((state) => state.t)
}

export function useLocale() {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const t = useLocaleStore((state) => state.t)
  return { locale, setLocale, t }
}
