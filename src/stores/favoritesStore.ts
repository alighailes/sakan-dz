import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

interface FavoritesState {
  favorites: string[] // property IDs (local cache, synced with Supabase when logged in)
  toggleFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean
  clearFavorites: () => void
  loadUserFavorites: (userId: string) => Promise<void>
}

async function syncAdd(userId: string, propertyId: string) {
  try {
    await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId })
  } catch {
    // Ignore — local cache already updated
  }
}

async function syncRemove(userId: string, propertyId: string) {
  try {
    await supabase.from('favorites').delete().eq('user_id', userId).eq('property_id', propertyId)
  } catch {
    // Ignore — local cache already updated
  }
}

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (propertyId) => {
        const isFav = get().favorites.includes(propertyId)
        set((state) => ({
          favorites: isFav
            ? state.favorites.filter((id) => id !== propertyId)
            : [...state.favorites, propertyId],
        }))
        // Fire-and-forget live sync for authenticated users
        currentUserId().then((userId) => {
          if (!userId) return
          if (isFav) {
            void syncRemove(userId, propertyId)
          } else {
            void syncAdd(userId, propertyId)
          }
        })
      },
      isFavorite: (propertyId) => get().favorites.includes(propertyId),
      clearFavorites: () => set({ favorites: [] }),
      loadUserFavorites: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select('property_id')
            .eq('user_id', userId)
          if (error) return
          const ids = ((data ?? []) as { property_id: string }[]).map((r) => r.property_id)
          set({ favorites: ids })
        } catch {
          // Keep local cache on error
        }
      },
    }),
    {
      name: 'sakan-favorites',
    }
  )
)
