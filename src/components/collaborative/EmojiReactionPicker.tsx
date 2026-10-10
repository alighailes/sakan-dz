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
      className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 bg-white px-2 py-1.5 shadow-sm backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900"
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
              'flex h-10 w-10 select-none items-center justify-center rounded-full transition-all duration-200 active:scale-90',
              active
                ? 'scale-110 bg-primary-100 opacity-100 shadow-glow ring-2 ring-primary-500 dark:bg-primary-900/60'
                : 'opacity-100 hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <span
              aria-hidden
              className="text-2xl leading-none"
              style={{
                fontFamily:
                  '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif',
              }}
            >
              {r.emoji}
            </span>
          </button>
        )
      })}
    </div>
  )
}
