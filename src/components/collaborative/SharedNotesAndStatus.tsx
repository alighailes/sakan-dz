import { useState } from 'react'
import { CalendarClock, Check, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import type { VisitStatus } from '@/services/collaborativeFavoritesApi'

function statusBadgeClasses(status: VisitStatus): string {
  switch (status) {
    case 'to_contact':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
    case 'to_visit':
      return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800'
    case 'visited':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
    default:
      return ''
  }
}

function StatusIcon({ status }: { status: VisitStatus }) {
  if (status === 'to_contact') return <Phone className="h-3 w-3" />
  if (status === 'to_visit') return <CalendarClock className="h-3 w-3" />
  if (status === 'visited') return <Check className="h-3 w-3" />
  return null
}

interface SharedNotesAndStatusProps {
  note: string
  partnerName: string | null
  avatarUrl?: string | null
  visitStatus: VisitStatus
  visitAt: string | null
  editable?: boolean
  saving?: boolean
  onSave?: (note: string, status: VisitStatus, visitAt: string | null) => void
}

const STATUS_OPTIONS: VisitStatus[] = ['to_contact', 'to_visit', 'visited']

export function SharedNotesAndStatus({
  note,
  partnerName,
  avatarUrl,
  visitStatus,
  visitAt,
  editable,
  saving,
  onSave,
}: SharedNotesAndStatusProps) {
  const { locale } = useLocale()
  const [draft, setDraft] = useState(note)
  const [draftStatus, setDraftStatus] = useState<VisitStatus>(visitStatus)
  const [draftVisitAt, setDraftVisitAt] = useState(visitAt ?? '')

  const statusLabel = (status: VisitStatus): string => {
    if (status === 'to_contact') return locale === 'ar' ? 'للاتصال' : 'À contacter'
    if (status === 'to_visit') {
      const when = (visitAt ?? '').trim()
      return locale === 'ar'
        ? `موعد معاينة${when ? ` ${when}` : ''}`
        : `À visiter${when ? ` ${when}` : ''}`
    }
    if (status === 'visited') return locale === 'ar' ? 'تمت المعاينة' : 'Visitée'
    return ''
  }

  const initial = (partnerName ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="space-y-2">
      {note.trim() !== '' && (
        <div className="flex items-start gap-2 rounded-xl bg-zinc-50 p-2.5 text-start border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60">
          {avatarUrl ? (
            <img src={avatarUrl} alt={partnerName ?? ''} className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0">
            {partnerName && (
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{partnerName}</p>
            )}
            <p className="text-sm italic leading-snug text-zinc-700 dark:text-zinc-200">
              &ldquo;{note}&rdquo;
            </p>
          </div>
        </div>
      )}

      {visitStatus !== 'none' && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            statusBadgeClasses(visitStatus)
          )}
        >
          <StatusIcon status={visitStatus} />
          {statusLabel(visitStatus)}
        </span>
      )}

      {editable && onSave && (
        <div className="space-y-2 rounded-xl border border-dashed border-zinc-300 p-2.5 dark:border-zinc-700">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            maxLength={280}
            placeholder={locale === 'ar' ? 'أضف ملاحظة لشريكك…' : 'Ajouter une note pour votre partenaire…'}
            className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraftStatus(draftStatus === s ? 'none' : s)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  draftStatus === s
                    ? statusBadgeClasses(s)
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                )}
              >
                <StatusIcon status={s} />
                {s === 'to_contact'
                  ? locale === 'ar' ? 'للاتصال' : 'À contacter'
                  : s === 'to_visit'
                    ? locale === 'ar' ? 'معاينة' : 'À visiter'
                    : locale === 'ar' ? 'تمت المعاينة' : 'Visitée'}
              </button>
            ))}
          </div>
          {draftStatus === 'to_visit' && (
            <input
              value={draftVisitAt}
              onChange={(e) => setDraftVisitAt(e.target.value)}
              placeholder={locale === 'ar' ? 'مثال: 28/05 الساعة 15h' : 'Ex: 28/05 à 15h'}
              className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          )}
          <Button
            size="sm"
            disabled={saving}
            onClick={() =>
              onSave(draft.trim(), draftStatus, draftVisitAt.trim() ? draftVisitAt.trim() : null)
            }
          >
            {locale === 'ar' ? 'حفظ' : 'Enregistrer'}
          </Button>
        </div>
      )}
    </div>
  )
}
