import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Heart, Loader2, LogIn, UserPlus, CalendarClock, MapPin } from 'lucide-react'
import { PropertyCard } from '@/components/listings/PropertyCard'
import { PropertyCardSkeleton } from '@/components/listings/PropertyCardSkeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { DarnaDuoHeader } from '@/components/darnaDuo/DarnaDuoHeader'
import { ReactionPicker } from '@/components/darnaDuo/ReactionPicker'
import { SharedNotesBadge } from '@/components/darnaDuo/SharedNotesBadge'
import { VisitSchedulerModal } from '@/components/darnaDuo/VisitSchedulerModal'
import { DarnaActivityTimeline } from '@/components/darnaDuo/DarnaActivityTimeline'
import { useProperties } from '@/hooks/useProperties'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useAuthStore } from '@/stores/authStore'
import { useLocale } from '@/i18n'
import { cn } from '@/lib/utils'
import {
  createGroup,
  fetchSharedInteractions,
  fetchUserGroup,
  joinGroupByCode,
  removeSharedProperty,
  toggleSharedProperty,
  type DuoJoinStatus,
  type SharedGroup,
  type SharedPropertyEntry,
  type SharedReaction,
  type VisitStatus,
} from '@/services/collaborativeFavoritesApi'
import { fetchPropertiesByIds } from '@/services/api'
import type { Property } from '@/types'

type FavoritesTab = 'private' | 'shared'

export function FavoritesPage() {
  const { properties, loading } = useProperties(undefined, { limit: 100 })
  const { favorites, loadUserFavorites } = useFavoritesStore()
  const { user, profile } = useAuthStore()
  const { locale, t } = useLocale()
  const [searchParams, setSearchParams] = useSearchParams()

  const joinErrorMessage = (status: DuoJoinStatus): string =>
    status === 'own_code'
      ? locale === 'ar'
        ? 'لا يمكنك استخدام رمز الدعوة الخاص بك'
        : 'Vous ne pouvez pas utiliser votre propre code d’invitation'
      : locale === 'ar'
        ? 'رمز الدعوة غير موجود أو غير صالح'
        : 'Code d’invitation introuvable ou invalide'

  const [tab, setTab] = useState<FavoritesTab>('private')
  const [group, setGroup] = useState<SharedGroup | null>(null)
  const [entries, setEntries] = useState<SharedPropertyEntry[]>([])
  // Property rows for shared ids, fetched directly from the `properties`
  // table by id — covers shared items missing from the paginated feed.
  const [sharedDetails, setSharedDetails] = useState<Property[]>([])
  const [sharedLoading, setSharedLoading] = useState(false)
  const [sharedError, setSharedError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [pendingDuo, setPendingDuo] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [schedulerProperty, setSchedulerProperty] = useState<{ propertyId: string; title: string } | null>(null)
  const [schedulerLoading, setSchedulerLoading] = useState(false)

  // Pull the logged-in user's live favorites from Supabase
  useEffect(() => {
    if (user?.id) {
      loadUserFavorites(user.id).catch(() => {})
    }
  }, [user?.id, loadUserFavorites])

  const refreshShared = useCallback(async () => {
    if (!user?.id) return
    setSharedLoading(true)
    setSharedError(null)
    try {
      // 1) Fetch the current group.
      const g = await fetchUserGroup()
      setGroup(g)
      if (!g) {
        setEntries((prev) => (prev.length === 0 ? [] : prev))
        return
      }
      // 2) Query shared_favorite_items for that group_id.
      const fresh = await fetchSharedInteractions(g.id)
      // 3) Update state immediately — never let a failed sync ([]) wipe
      // already-loaded entries.
      setEntries((prev) => (fresh.length > 0 || prev.length === 0 ? fresh : prev))
      const effective = fresh.length > 0 ? fresh : null
      // 4) Query property details matching the property_id list.
      if (effective && effective.length > 0) {
        const ids = effective.map((e) => e.propertyId)
        const rows = await fetchPropertiesByIds(ids)
        if (rows.length > 0) setSharedDetails(rows)
      }
    } catch {
      setSharedError(
        locale === 'ar' ? 'تعذر تحميل المفضلة المشتركة.' : 'Impossible de charger les favoris partagés.'
      )
    } finally {
      setSharedLoading(false)
    }
  }, [user?.id, locale])

  // Bootstrap the shared group on mount / login
  useEffect(() => {
    if (user?.id) {
      void refreshShared()
    } else {
      setGroup(null)
      setEntries([])
    }
  }, [user?.id, refreshShared])

  // When the "Darna Duo" (shared) tab is selected: fetch the current
  // group, query shared_favorite_items for that group_id, then query
  // property details matching the property_id list. Updates state
  // immediately; a failed sync ([]) never overwrites loaded entries.
  useEffect(() => {
    if (tab !== 'shared' || !user?.id) return
    let cancelled = false
    void (async () => {
      setSharedLoading(true)
      try {
        // 1) Fetch the current group fresh (not stale state).
        const g = await fetchUserGroup()
        if (cancelled) return
        if (g) setGroup(g)
        const gid = g?.id ?? group?.id
        if (!gid) return
        // 2) Query shared_favorite_items for that group_id.
        const fresh = await fetchSharedInteractions(gid)
        if (cancelled) return
        // 3) Update state immediately — guard against empty overwrite.
        let effective: SharedPropertyEntry[] | null = null
        setEntries((prev) => {
          effective = fresh.length > 0 || prev.length === 0 ? fresh : prev
          return effective
        })
        // 4) Query property details for the fetched property_id list.
        const ids = (effective ?? fresh).map((e) => e.propertyId)
        if (ids.length > 0) {
          const rows = await fetchPropertiesByIds(ids)
          if (!cancelled && rows.length > 0) setSharedDetails(rows)
        }
      } finally {
        if (!cancelled) setSharedLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tab, user?.id])

  // Join via invite link: /favorites?join=CODE (legacy, auto-joins)
  useEffect(() => {
    const code = searchParams.get('join')
    if (!code || !user?.id) return
    let cancelled = false
    void (async () => {
      setJoinError(null)
      const result = await joinGroupByCode(code)
      if (cancelled) return
      let g = result.group
      if (result.status === 'joined' && !g) {
        g = await fetchUserGroup()
        if (cancelled) return
      }
      if (result.status === 'joined' && g) {
        setGroup(g)
        const fresh = await fetchSharedInteractions(g.id)
        if (!cancelled) {
          setEntries((prev) => (fresh.length > 0 || prev.length === 0 ? fresh : prev))
          if (fresh.length > 0) {
            const rows = await fetchPropertiesByIds(fresh.map((e) => e.propertyId))
            if (rows.length > 0) setSharedDetails(rows)
          }
        }
        setTab('shared')
        setSearchParams({}, { replace: true })
      } else {
        setJoinError(result.message || joinErrorMessage(result.status))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams, user?.id, locale, setSearchParams])

  // Darna Duo invite: /favorites?duo=CODE triggers an accept modal
  useEffect(() => {
    const code = searchParams.get('duo')
    if (!code) return
    if (!user?.id) {
      setTab('shared')
      return
    }
    setPendingDuo(code.trim().toUpperCase())
    setTab('shared')
  }, [searchParams, user?.id])

  const handleReaction = async (propertyId: string, reaction: SharedReaction) => {
    if (!group || !user?.id) return
    setActionId(propertyId)
    try {
      const updated = await toggleSharedProperty(group.id, propertyId, { reaction })
      if (updated) {
        setEntries((prev) =>
          prev.map((e) => (e.propertyId === propertyId ? updated : e))
        )
      }
    } finally {
      setActionId(null)
    }
  }

  const handleSaveNote = async (
    propertyId: string,
    note: string,
    status: VisitStatus,
    visitAt: string | null
  ) => {
    if (!group || !user?.id) return
    setActionId(propertyId)
    try {
      const updated = await toggleSharedProperty(group.id, propertyId, {
        note,
        visitStatus: status,
        visitAt,
      })
      if (updated) {
        setEntries((prev) =>
          prev.map((e) => (e.propertyId === propertyId ? updated : e))
        )
      }
    } finally {
      setActionId(null)
    }
  }

  const handleScheduleVisit = async (visitAt: string, notes: string) => {
    if (!group || !user?.id || !schedulerProperty) return
    setSchedulerLoading(true)
    try {
      const updated = await toggleSharedProperty(group.id, schedulerProperty.propertyId, {
        visitStatus: 'to_visit',
        visitAt,
        note: notes || undefined,
      })
      if (updated) {
        setEntries((prev) =>
          prev.map((e) => (e.propertyId === schedulerProperty.propertyId ? updated : e))
        )
      }
      setSchedulerProperty(null)
    } finally {
      setSchedulerLoading(false)
    }
  }

  const openScheduler = (propertyId: string, title: string) => {
    setSchedulerProperty({ propertyId, title })
  }

  const handleCreateGroup = useCallback(async () => {
    const g = await createGroup()
    if (g) {
      setGroup(g)
      await refreshShared()
    }
  }, [refreshShared])

  const handleToggleShared = async (propertyId: string) => {
    if (!user?.id) return
    let activeGroup = group
    if (!activeGroup) {
      activeGroup = (await fetchUserGroup()) ?? (await createGroup())
      if (!activeGroup) return
      setGroup(activeGroup)
    }
    const existing = entries.some((e) => e.propertyId === propertyId)
    setActionId(propertyId)
    try {
      if (existing) {
        if (await removeSharedProperty(activeGroup.id, propertyId)) {
          setEntries((prev) => prev.filter((e) => e.propertyId !== propertyId))
        }
      } else {
        const created = await toggleSharedProperty(activeGroup.id, propertyId, {})
        // created != null means the row was written AND read back (RETURNING).
        // Immediately refetch and merge (never replace) so the UI reflects
        // server truth while a failed sync can't wipe local state.
        if (created) {
          const fresh = await fetchSharedInteractions(activeGroup.id)
          setEntries((prev) => {
            const merged = new Map(prev.map((e) => [e.propertyId, e]))
            merged.set(created.propertyId, created)
            for (const e of fresh) merged.set(e.propertyId, e)
            return [...merged.values()]
          })
          // Ensure property details for the new id are available even when
          // the card is absent from the paginated feed.
          const rows = await fetchPropertiesByIds([created.propertyId])
          if (rows.length > 0) {
            setSharedDetails((prev) => {
              const merged = new Map(prev.map((p) => [p.id, p]))
              for (const r of rows) merged.set(r.id, r)
              return [...merged.values()]
            })
          }
        }
      }
    } finally {
      setActionId(null)
    }
  }

  const handleJoin = async (code: string): Promise<boolean> => {
    setJoinError(null)
    const result = await joinGroupByCode(code)
    let g = result.group
    if (result.status === 'joined' && !g) {
      // RPC joined server-side but the group read was blocked — refresh cache.
      g = await fetchUserGroup()
    }
    if (result.status === 'joined' && g) {
      setGroup(g)
      const fresh = await fetchSharedInteractions(g.id)
      setEntries((prev) => (fresh.length > 0 || prev.length === 0 ? fresh : prev))
      if (fresh.length > 0) {
        const rows = await fetchPropertiesByIds(fresh.map((e) => e.propertyId))
        if (rows.length > 0) setSharedDetails(rows)
      }
      setTab('shared')
      setPendingDuo(null)
      setSearchParams({}, { replace: true })
      return true
    }
    setJoinError(result.message || joinErrorMessage(result.status))
    return false
  }

  const handleDeclineDuo = () => {
    setPendingDuo(null)
    setSearchParams({}, { replace: true })
  }

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id))
  const sharedIds = new Set(entries.map((e) => e.propertyId))
  // Combine the paginated feed with rows fetched directly from the
  // `properties` table by id, so shared items are never dropped when absent
  // from the feed page.
  const allSharedCandidates = useMemo(() => {
    const merged = new Map<string, Property>()
    for (const p of properties) merged.set(p.id, p)
    for (const p of sharedDetails) merged.set(p.id, p)
    return [...merged.values()]
  }, [properties, sharedDetails])
  const sharedProperties = entries
    .map((entry) => ({
      entry,
      property: allSharedCandidates.find((p) => p.id === entry.propertyId) ?? null,
    }))
    .filter((x) => x.property !== null)
  const addableFavorites = favoriteProperties.filter((p) => !sharedIds.has(p.id))

  // Properties map for activity timeline
  const propertiesMap = useMemo(
    () => new Map(allSharedCandidates.map((p) => [p.id, { title: p.title }])),
    [allSharedCandidates]
  )

  // Upcoming visits (to_visit status with visitAt in the future)
  const upcomingVisits = useMemo(() => {
    const now = new Date()
    return entries
      .map((entry) => {
        const property = allSharedCandidates.find((p) => p.id === entry.propertyId)
        if (!property || entry.visitStatus !== 'to_visit' || !entry.visitAt) return null
        const visitDate = new Date(entry.visitAt)
        if (visitDate < now) return null
        return { entry, property, visitDate }
      })
      .filter((x): x is { entry: SharedPropertyEntry; property: typeof properties[0]; visitDate: Date } => x !== null)
      .sort((a, b) => a.visitDate.getTime() - b.visitDate.getTime())
  }, [entries, allSharedCandidates])

  const tabBtn = (active: boolean) =>
    cn(
      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
      active
        ? 'bg-primary-600 text-white shadow-glow'
        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
    )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">{t.nav.favorites}</h1>

      {/* Tab toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button type="button" onClick={() => setTab('private')} className={tabBtn(tab === 'private')}>
          {locale === 'ar' ? 'مفضلتي الفردية' : 'Mes favoris'}
        </button>
        <button type="button" onClick={() => setTab('shared')} className={tabBtn(tab === 'shared')}>
          {locale === 'ar' ? 'Darna Duo | مفضلة الشريك' : 'Darna Duo | Partenaire'}
        </button>
      </div>

      {tab === 'private' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : favoriteProperties.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Heart}
                title="Aucun favori"
                description="Ajoutez des biens a vos favoris pour les retrouver facilement."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'shared' && (
        <div className="space-y-5">
          {!user ? (
            <EmptyState
              icon={LogIn}
              title={locale === 'ar' ? 'سجّل الدخول للمشاركة' : 'Connectez-vous pour partager'}
              description={
                locale === 'ar'
                  ? 'المفضلة المشتركة تتطلب حساباً لك ولشريكك.'
                  : 'Les favoris partagés nécessitent un compte pour vous et votre partenaire.'
              }
              action={
                <Link to="/auth">
                  <Button className="gap-2">
                    <LogIn className="h-4 w-4" />
                    {locale === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              <DarnaDuoHeader
                group={group}
                currentUserId={user.id}
                ownInviteCode={profile?.invite_code ?? group?.inviteCode ?? null}
                loading={sharedLoading}
                joinError={joinError}
                onCreate={() => void handleCreateGroup()}
                onJoin={handleJoin}
              />
              {sharedError && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {sharedError}
                </p>
              )}
              {sharedLoading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              ) : sharedProperties.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title={locale === 'ar' ? 'لا توجد عقارات مشتركة بعد' : 'Aucun bien partagé pour le moment'}
                  description={
                    locale === 'ar'
                      ? 'أضف عقاراً من مفضلتك الخاصة ليظهر هنا مع شريكك.'
                      : 'Ajoutez un bien de vos favoris pour le partager ici avec votre partenaire.'
                  }
                />
              ) : (
                <>
                  {/* Upcoming Visits */}
                  {upcomingVisits.length > 0 && (
                    <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm backdrop-blur-xl dark:border-sky-900/40 dark:bg-sky-950/20">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-sky-800 dark:text-sky-300">
                          <CalendarClock className="h-4 w-4" />
                          {locale === 'ar' ? 'مواعد المعاينات القادمة' : 'Prochaines visites'}
                        </h3>
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-600 px-2 text-xs font-bold text-white">
                          {upcomingVisits.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {upcomingVisits.slice(0, 3).map(({ property, visitDate }) => (
                          <Button
                            key={property.id}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 bg-white/80 dark:bg-zinc-800/80"
                            onClick={() => openScheduler(property.id, property.title)}
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[200px]">
                              {property.title} — {visitDate.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </Button>
                        ))}
                        {upcomingVisits.length > 3 && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            {locale === 'ar' ? `+${upcomingVisits.length - 3} أخرى` : `+${upcomingVisits.length - 3} autres`}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Activity Timeline */}
                  {group && (
                    <div className="mb-5">
                      <DarnaActivityTimeline
                        group={group}
                        currentUserId={user.id}
                        properties={propertiesMap}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {sharedProperties.map(({ entry, property }) => {
                    if (!property) return null
                    const partnerName =
                      group?.members.find((m) => m.userId === entry.reactionBy)?.displayName ??
                      group?.members.find((m) => m.userId !== user.id)?.displayName ??
                      null
                    return (
                      <div
                        key={property.id}
                        className="space-y-2 rounded-2xl border border-zinc-200 bg-white/60 p-2 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900/60"
                      >
                        <PropertyCard property={property} />
                        <div className="flex justify-center">
                          <ReactionPicker
                            value={entry.reaction}
                            disabled={actionId === property.id}
                            onSelect={(r) => void handleReaction(property.id, r)}
                          />
                        </div>
                        <div className="px-1 pb-1">
                          <SharedNotesBadge
                            note={entry.note}
                            partnerName={partnerName}
                            visitStatus={entry.visitStatus}
                            visitAt={entry.visitAt}
                            editable
                            saving={actionId === property.id}
                            onSave={(note, status, visitAt) =>
                              void handleSaveNote(property.id, note, status, visitAt)
                            }
                          />
                        </div>
                        <div className="px-1 pb-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full gap-1.5 text-xs"
                            disabled={actionId === property.id}
                            onClick={() => void handleToggleShared(property.id)}
                          >
                            {actionId === property.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Heart className="h-3.5 w-3.5" />
                            )}
                            {locale === 'ar' ? 'إزالة من المشتركة' : 'Retirer du partage'}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>)}

              {/* Add private favorites into the shared group */}
              {addableFavorites.length > 0 && (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    {locale === 'ar' ? 'أضف من مفضلتك الخاصة' : 'Ajouter depuis vos favoris'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {addableFavorites.slice(0, 12).map((p) => (
                      <Button
                        key={p.id}
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        disabled={actionId === p.id}
                        onClick={() => void handleToggleShared(p.id)}
                      >
                        {actionId === p.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5" />
                        )}
                        <span className="max-w-40 truncate">{p.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Visit Scheduler Modal */}
      {schedulerProperty && (
        <VisitSchedulerModal
          isOpen
          onClose={() => setSchedulerProperty(null)}
          property={{ id: schedulerProperty.propertyId, title: schedulerProperty.title } as any}
          onSchedule={handleScheduleVisit}
          loading={schedulerLoading}
        />
      )}

      {/* Darna Duo invitation accept modal (?duo=CODE) */}
      {pendingDuo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={handleDeclineDuo}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-xl animate-scale-in dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/10 dark:bg-primary-900/30">
              <UserPlus className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Darna Duo</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {locale === 'ar'
                ? 'دعاك شريكك للانضمام إلى مفضلته المشتركة. هل تقبل الدعوة؟'
                : 'Votre partenaire vous invite à rejoindre ses favoris partagés. Accepter ?'}
            </p>
            <p className="mt-2 text-xl font-bold tracking-[0.3em] text-primary-600 dark:text-primary-400">
              {pendingDuo}
            </p>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => void handleJoin(pendingDuo)}>
                {locale === 'ar' ? 'قبول الدعوة' : 'Accepter'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleDeclineDuo}>
                {locale === 'ar' ? 'رفض' : 'Refuser'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
