import { cn } from '@/lib/utils'
import type { SharedReaction } from '@/services/collaborativeFavoritesApi'

const REACTIONS: { value: SharedReaction; emoji: string; label: string }[] = [
  { value: 'love', emoji: '😍', label: 'Love' },
  { value: 'happy', emoji: '🙂', label: 'Happy' },
  { value: 'thinking', emoji: '🤔', label: 'Thinking' },
  { value: 'skeptical', emoji: '🤨', label: 'Skeptical' },
  { value: 'sad', emoji: '😞', label: 'Sad' },
]

interface EmojiReactionPickerProps {
  value: SharedReaction | null
  onSelect: (reaction: SharedReaction) => void
  disabled?: boolean
}

export function EmojiReactionPicker({ value, onSelect, disabled }: EmojiReactionPickerProps) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-2 py-1 shadow-sm backdrop-blur transition-colors dark:border-zinc-700 dark:bg-zinc-900/80"
      role="radiogroup"
      aria-label="Partner reaction"
    >
      {REACTIONS.map((r) => {
        const active = value === r.value
        return (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={r.label}
            aria-label={r.label}
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSelect(r.value)
            }}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xl transition-all duration-200',
              active
                ? 'scale-110 bg-primary-100 shadow-glow ring-2 ring-primary-500 dark:bg-primary-900/50'
                : 'opacity-60 hover:scale-105 hover:bg-zinc-100 hover:opacity-100 dark:hover:bg-zinc-800',
              disabled && 'cursor-not-allowed opacity-40'
            )}
          >
            <span aria-hidden>{r.emoji}</span>
          </button>
        )
      })}
    </div>
  )
}
