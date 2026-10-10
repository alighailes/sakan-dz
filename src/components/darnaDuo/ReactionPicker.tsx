import { EmojiReactionPicker } from '@/components/collaborative/EmojiReactionPicker'
import type { SharedReaction } from '@/services/collaborativeFavoritesApi'

interface ReactionPickerProps {
  value: SharedReaction | null
  onSelect: (reaction: SharedReaction) => void
  disabled?: boolean
}

/**
 * Darna Duo floating frosted reaction pill.
 * Reactions: 😍 حب · 🙂 إعجاب · 🤔 تفكير · 🤨 تردد · 😞 غير مناسب.
 */
export function ReactionPicker({ value, onSelect, disabled }: ReactionPickerProps) {
  return (
    <div className="sticky bottom-4 z-10 flex justify-center">
      <div className="backdrop-blur-xl transition-shadow hover:shadow-lg">
        <EmojiReactionPicker value={value} onSelect={onSelect} disabled={disabled} />
      </div>
    </div>
  )
}
