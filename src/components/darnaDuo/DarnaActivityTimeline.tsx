import { useEffect, useState } from 'react'
import { Bell, ChevronDown, ChevronUp, Loader2, Heart, CalendarClock, MessageCircle, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import { fetchSharedInteractions } from '@/services/collaborativeFavoritesApi'
import type { SharedGroup, SharedReaction, VisitStatus } from '@/services/collaborativeFavoritesApi'

interface ActivityEvent {
  id: string
  type: 'property_added' | 'reaction_changed' | 'visit_scheduled' | 'note_added' | 'status_changed'
  propertyId: string
  propertyTitle: string
  actorName: string
  actorId: string
  timestamp: string
  reaction?: SharedReaction
  visitStatus?: VisitStatus
  visitAt?: string | null
  note?: string
}

const REACTION_EMOJI: Record<SharedReaction, string> = {
  love: '😍',
  happy: '🙂',
  thinking: '🤔',
  skeptical: '🤨',
  sad: '😞',
}

const REACTION_LABEL = {
  love: { ar: 'حب', fr: 'Coup de cœur' },
  happy: { ar: 'إعجاب', fr: 'J\'aime' },
  thinking: { ar: 'تفكير', fr: 'Réfléchit' },
  skeptical: { ar: 'تردد', fr: 'Sceptique' },
  sad: { ar: 'غير مناسب', fr: 'Pas adapté' },
}

function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return locale === 'ar' ? 'الآن' : 'À l\'instant'
  if (diffMins < 60) return locale === 'ar' ? `منذ ${diffMins} دقيقة` : `Il y a ${diffMins} min`
  if (diffHours < 24) return locale === 'ar' ? `منذ ${diffHours} ساعة` : `Il y a ${diffHours}h`
  if (diffDays < 7) return locale === 'ar' ? `منذ ${diffDays} يوم` : `Il y a ${diffDays}j`

  return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getVisitStatusLabel(status: VisitStatus, visitAt: string | null | undefined, locale: string): string {
  if (status === 'to_contact') return locale === 'ar' ? 'للاتصال' : 'À contacter'
  if (status === 'to_visit') {
    const when = visitAt ? new Date(visitAt).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }) : ''
    return locale === 'ar' ? `موعد معاينة${when ? ` ${when}` : ''}` : `À visiter${when ? ` ${when}` : ''}`
  }
  if (status === 'visited') return locale === 'ar' ? 'تمت المعاينة' : 'Visitée'
  return ''
}

interface DarnaActivityTimelineProps {
  group: SharedGroup | null
  currentUserId: string | null
  properties: Map<string, { title: string }>
}

export function DarnaActivityTimeline({ group, currentUserId, properties }: DarnaActivityTimelineProps) {
  const { locale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!group || !currentUserId) {
      setActivities([])
      setUnreadCount(0)
      return
    }
    loadActivities()
  }, [group, currentUserId, properties])

  const loadActivities = async () => {
    if (!group) return
    setLoading(true)
    try {
      const interactions = await fetchSharedInteractions(group.id)
      const events: ActivityEvent[] = []

      for (const entry of interactions) {
        const propertyInfo = properties.get(entry.propertyId)
        if (!propertyInfo) continue

        const partner = group.members.find(m => m.userId !== currentUserId)

        if (entry.addedBy && entry.addedBy !== currentUserId) {
          events.push({
            id: `added-${entry.propertyId}-${entry.updatedAt}`,
            type: 'property_added',
            propertyId: entry.propertyId,
            propertyTitle: propertyInfo.title,
            actorName: partner?.displayName || 'Partenaire',
            actorId: entry.addedBy,
            timestamp: entry.updatedAt || new Date().toISOString(),
          })
        }

        if (entry.reaction && entry.reactionBy && entry.reactionBy !== currentUserId) {
          events.push({
            id: `reaction-${entry.propertyId}-${entry.updatedAt}`,
            type: 'reaction_changed',
            propertyId: entry.propertyId,
            propertyTitle: propertyInfo.title,
            actorName: entry.reactionByName || 'Partenaire',
            actorId: entry.reactionBy,
            timestamp: entry.updatedAt || new Date().toISOString(),
            reaction: entry.reaction,
          })
        }

        if (entry.visitStatus !== 'none' && entry.updatedAt) {
          events.push({
            id: `visit-${entry.propertyId}-${entry.updatedAt}`,
            type: 'visit_scheduled',
            propertyId: entry.propertyId,
            propertyTitle: propertyInfo.title,
            actorName: entry.reactionByName || (entry.addedBy === currentUserId ? 'Vous' : 'Partenaire'),
            actorId: entry.addedBy || entry.reactionBy || '',
            timestamp: entry.updatedAt,
            visitStatus: entry.visitStatus,
            visitAt: entry.visitAt,
          })
        }

        if (entry.note && entry.updatedAt) {
          events.push({
            id: `note-${entry.propertyId}-${entry.updatedAt}`,
            type: 'note_added',
            propertyId: entry.propertyId,
            propertyTitle: propertyInfo.title,
            actorName: entry.addedBy === currentUserId ? 'Vous' : 'Partenaire',
            actorId: entry.addedBy || '',
            timestamp: entry.updatedAt,
            note: entry.note,
          })
        }
      }

      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(events.slice(0, 50))

      const unread = events.filter(e => e.actorId !== currentUserId && new Date(e.timestamp) > new Date(Date.now() - 5 * 60 * 1000)).length
      setUnreadCount(unread)
    } catch {
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'property_added': return <Users className="h-4 w-4 text-primary-600" />
      case 'reaction_changed': return <Heart className="h-4 w-4 text-red-500" />
      case 'visit_scheduled': return <CalendarClock className="h-4 w-4 text-sky-600" />
      case 'note_added': return <MessageCircle className="h-4 w-4 text-amber-600" />
      case 'status_changed': return <Check className="h-4 w-4 text-emerald-600" />
    }
  }

  const getActivityText = (activity: ActivityEvent): string => {
    const isCurrentUser = activity.actorId === currentUserId
    const prefix = isCurrentUser ? (locale === 'ar' ? 'أنت' : 'Vous') : activity.actorName

    switch (activity.type) {
      case 'property_added':
        return locale === 'ar'
          ? `${prefix} أضاف عقاراً جديداً: "${activity.propertyTitle}"`
          : `${prefix} a ajouté un bien: "${activity.propertyTitle}"`
      case 'reaction_changed':
        const emoji = activity.reaction ? REACTION_EMOJI[activity.reaction] : ''
        const label = activity.reaction ? REACTION_LABEL[activity.reaction][locale === 'ar' ? 'ar' : 'fr'] : ''
        return locale === 'ar'
          ? `${prefix} غيّر تفاعله إلى ${emoji} ${label} للعقار: "${activity.propertyTitle}"`
          : `${prefix} a changé sa réaction à ${emoji} ${label} pour: "${activity.propertyTitle}"`
      case 'visit_scheduled':
        const statusLabel = activity.visitStatus ? getVisitStatusLabel(activity.visitStatus, activity.visitAt, locale) : ''
        return locale === 'ar'
          ? `${prefix} ${statusLabel} للعقار: "${activity.propertyTitle}"`
          : `${prefix} ${statusLabel} pour: "${activity.propertyTitle}"`
      case 'note_added':
        return locale === 'ar'
          ? `${prefix} أضاف ملاحظة للعقار: "${activity.propertyTitle}"`
          : `${prefix} a ajouté une note pour: "${activity.propertyTitle}"`
      case 'status_changed':
        return locale === 'ar'
          ? `${prefix} غيّر حالة العقار: "${activity.propertyTitle}"`
          : `${prefix} a changé le statut du bien: "${activity.propertyTitle}"`
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn('gap-1.5', isOpen && 'bg-primary-50 dark:bg-primary-900/20')}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={cn('h-4 w-4', unreadCount > 0 && 'text-red-500')} />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {locale === 'ar' ? 'نشاط الشريك' : 'Activité du partenaire'}
        </span>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-full max-w-sm md:max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl overflow-hidden dark:border-zinc-700 dark:bg-zinc-900 animate-slide-down z-50">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <h4 className="font-semibold text-zinc-900 dark:text-white">
              {locale === 'ar' ? 'النشاط الأخير' : 'Activité récente'}
            </h4>
            <Button variant="ghost" size="sm" onClick={loadActivities} disabled={loading}>
              <Loader2 className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && activities.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-zinc-500 dark:text-zinc-400">
                <p className="text-sm">{locale === 'ar' ? 'لا يوجد نشاط حديث' : 'Aucune activité récente'}</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">
                          {getActivityText(activity)}
                        </p>
                        <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                          {formatRelativeTime(activity.timestamp, locale)}
                        </p>
                        {activity.note && (
                          <p className="mt-1.5 text-sm italic text-zinc-600 dark:text-zinc-400 line-clamp-2">
                            &ldquo;{activity.note}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {activities.length > 0 && (
            <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <Button variant="ghost" size="sm" className="w-full" onClick={loadActivities}>
                {locale === 'ar' ? 'تحديث النشاط' : 'Actualiser l\'activité'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}