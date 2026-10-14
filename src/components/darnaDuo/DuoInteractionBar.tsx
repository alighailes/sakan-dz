import { useEffect, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import type { DuoReaction } from '@/services/collaborativeFavoritesApi'

interface DuoInteractionBarProps {
  myReaction: DuoReaction | null
  partnerReaction: DuoReaction | null
  partnerNote: string
  mutualMatch: boolean
  initialNote: string
  disabled?: boolean
  saving?: boolean
  onReaction: (reaction: DuoReaction) => void
  onNoteSave: (note: string) => void
}

const PILLS: { value: DuoReaction; emoji: string; ar: string; fr: string }[] = [
  { value: 'love', emoji: '🔥', ar: 'ممتاز', fr: 'Top' },
  { value: 'considering', emoji: '🤔', ar: 'نفكر فيه', fr: 'À réfléchir' },
  { value: 'pass', emoji: '❌', ar: 'استبعاد', fr: 'Écarter' },
]

function reactionLabel(reaction: DuoReaction, isAr: boolean): string {
  const pill = PILLS.find((p) => p.value === reaction)
  if (!pill) return reaction
  return `${pill.emoji} ${isAr ? pill.ar : pill.fr}`
}

/**
 * Sleek Darna Duo Match & Notes control bar (RTL, dark/light).
 * Reaction pills (optimistic) + glowing mutual-match banner +
 * partner status + inline quick note (blur/Enter) + partner note.
 * Controlled — parent owns persistence.
 */
export function DuoInteractionBar({
  myReaction,
  partnerReaction,
  partnerNote,
  mutualMatch,
  initialNote,
  disabled,
  saving,
  onReaction,
  onNoteSave,
}: DuoInteractionBarProps) {
  const { locale } = useLocale()
  const isAr = locale === 'ar'
  const [draft, setDraft] = useState(initialNote ?? '')

  useEffect(() => {
    setDraft(initialNote ?? '')
  }, [initialNote])

  const commit = () => {
    const next = draft.trim()
    if (next === (initialNote ?? '').trim()) return
    onNoteSave(next)
  }

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="space-y-2 rounded-xl border border-zinc-200/80 bg-zinc-50/80 px-2 py-2 dark:border-zinc-700/60 dark:bg-zinc-800/50"
    >
      {mutualMatch && (
        <div className="rounded-lg border border-emerald-300/70 bg-emerald-100 px-2.5 py-1.5 text-center text-xs font-bold text-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.35)] dark:border-emerald-600/60 dark:bg-emerald-900/40 dark:text-emerald-100 dark:shadow-[0_0_16px_rgba(16,185,129,0.25)]">
          {isAr
            ? '🎉 توافق تام! كلاكما أحب هذا العقار'
            : '🎉 Match parfait ! Vous avez tous les deux adoré ce bien'}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {PILLS.map((p) => {
          const active = myReaction === p.value
          return (
            <button
              key={p.value}
              type="button"
              disabled={disabled}
              onClick={() => onReaction(p.value)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-150 active:scale-95',
                active
                  ? p.value === 'love'
                    ? 'border-orange-500/60 bg-orange-100 text-orange-800 shadow-sm dark:bg-orange-900/30 dark:text-orange-200'
                    : p.value === 'considering'
                      ? 'border-sky-500/60 bg-sky-100 text-sky-800 shadow-sm dark:bg-sky-900/30 dark:text-sky-200'
                      : 'border-zinc-500/60 bg-zinc-200 text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <span aria-hidden>{p.emoji}</span>
              {isAr ? p.ar : p.fr}
            </button>
          )
        })}
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />}
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        {partnerReaction
          ? isAr
            ? `رأي الشريك: ${reactionLabel(partnerReaction, true)}`
            : `Avis du partenaire : ${reactionLabel(partnerReaction, false)}`
          : isAr
            ? 'بانتظار رأي الشريك...'
            : 'En attente de l’avis du partenaire…'}
      </p>

      <div className="flex items-center gap-1.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
            }
          }}
          disabled={disabled}
          maxLength={280}
          placeholder={isAr ? 'ملاحظة للشريك...' : 'Note pour votre partenaire…'}
          className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={commit}
          aria-label={isAr ? 'إرسال الملاحظة' : 'Envoyer la note'}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-60"
        >
          <Send className={cn('h-3.5 w-3.5', isAr && '-scale-x-100')} />
        </button>
      </div>

      {partnerNote.trim() !== '' && (
        <p className="truncate rounded-lg bg-white/70 px-2 py-1 text-[11px] italic text-zinc-600 dark:bg-zinc-900/70 dark:text-zinc-300">
          {isAr ? `💬 الشريك: ${partnerNote.trim()}` : `💬 Partenaire : ${partnerNote.trim()}`}
        </p>
      )}
    </div>
  )
}
