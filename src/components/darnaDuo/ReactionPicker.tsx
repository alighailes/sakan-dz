import { EmojiReactionPicker } from '@/components/collaborative/EmojiReactionPicker'
import { useLocale } from '@/i18n'
import type { SharedReaction } from '@/services/collaborativeFavoritesApi'

interface ReactionPickerProps {
  value: SharedReaction | null
  onSelect: (reaction: SharedReaction) => void
  disabled?: boolean
}

/**
 * Darna Duo prominent reaction bar rendered underneath each shared card image.
 * Reactions: 😍 حب · 🙂 إعجاب · 🤔 تفكير · 🤨 تردد · 😞 غير مناسب.
 */
export function ReactionPicker({ value, onSelect, disabled }: ReactionPickerProps) {
  const { locale } = useLocale()
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-primary-100 bg-primary-50/60 px-2 py-2 dark:border-primary-900/40 dark:bg-primary-950/20">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
        {locale === 'ar' ? 'ردّة فعلكما' : 'Votre réaction'}
      </p>
      <div className="flex justify-center">
        <EmojiReactionPicker value={value} onSelect={onSelect} disabled={disabled} />
      </div>
    </div>
  )
}
