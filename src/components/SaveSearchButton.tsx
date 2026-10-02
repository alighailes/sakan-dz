import { useState } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { useAuthStore } from '@/stores/authStore'
import { useSearchStore } from '@/stores/searchStore'
import { cn } from '@/lib/utils'

interface SaveSearchButtonProps {
  onSave?: () => void
  className?: string
}

export function SaveSearchButton({ onSave, className }: SaveSearchButtonProps) {
  const { t } = useLocale()
  const { user } = useAuthStore()
  const { filters } = useSearchStore()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!user) return

    // Save to localStorage for mock mode
    const savedSearches = JSON.parse(localStorage.getItem('sakan-saved-searches') || '[]')
    const newSearch = {
      id: Date.now().toString(),
      userId: user.id,
      criteria: filters,
      notifyEmail: true,
      createdAt: new Date().toISOString(),
    }
    savedSearches.push(newSearch)
    localStorage.setItem('sakan-saved-searches', JSON.stringify(savedSearches))
    setSaved(true)
    onSave?.()

    setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('gap-1.5', className)}
      onClick={handleSave}
    >
      {saved ? (
        <>
          <BookmarkCheck className="h-4 w-4 text-green-500" />
          <span className="text-green-600 dark:text-green-400">{t.map.searchSaved}</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          {t.map.saveSearch}
        </>
      )}
    </Button>
  )
}
