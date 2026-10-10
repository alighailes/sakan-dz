import { SharedNotesAndStatus } from '@/components/collaborative/SharedNotesAndStatus'
import type { VisitStatus } from '@/services/collaborativeFavoritesApi'

interface SharedNotesBadgeProps {
  note: string
  partnerName: string | null
  avatarUrl?: string | null
  visitStatus: VisitStatus
  visitAt: string | null
  editable?: boolean
  saving?: boolean
  onSave?: (note: string, status: VisitStatus, visitAt: string | null) => void
}

/**
 * Darna Duo partner note + visit-status tag:
 * À contacter (للاتصال) · À visiter (موعد معاينة) · تمت المعاينة.
 */
export function SharedNotesBadge(props: SharedNotesBadgeProps) {
  return <SharedNotesAndStatus {...props} />
}
