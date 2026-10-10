import { supabase } from '@/lib/supabase'

/* ------------------------------------------------------------------ */
/* Collaborative Favorites ("مفضلة العائلة والشريك")                     */
/* Two-member shared favorites: reactions, notes, visit statuses.       */
/* All functions are failure-safe (return null/[]) so the UI degrades   */
/* gracefully when the shared_* tables are not migrated yet.            */
/* ------------------------------------------------------------------ */

export type SharedReaction = 'love' | 'happy' | 'thinking' | 'skeptical' | 'sad'
export type VisitStatus = 'none' | 'to_contact' | 'to_visit' | 'visited'

export type SharedMemberRole = 'owner' | 'member'

export interface SharedMember {
  userId: string
  displayName: string
  avatarUrl?: string | null
  /** Derived client-side: creator (created_by) is 'owner', others 'member'. */
  role: SharedMemberRole
}

export interface SharedPropertyEntry {
  propertyId: string
  note: string
  reaction: SharedReaction | null
  reactionBy: string | null
  reactionByName: string | null
  visitStatus: VisitStatus
  visitAt: string | null
  addedBy: string | null
  updatedAt: string | null
}

export interface SharedGroup {
  id: string
  inviteCode: string
  createdBy: string | null
  members: SharedMember[]
}

export interface SharedPropertyPatch {
  note?: string
  reaction?: SharedReaction | null
  visitStatus?: VisitStatus
  visitAt?: string | null
}

const VALID_REACTIONS: readonly string[] = ['love', 'happy', 'thinking', 'skeptical', 'sad']
const VALID_STATUSES: readonly string[] = ['none', 'to_contact', 'to_visit', 'visited']

function toSharedReaction(value: unknown): SharedReaction | null {
  return typeof value === 'string' && VALID_REACTIONS.includes(value)
    ? (value as SharedReaction)
    : null
}

function toVisitStatus(value: unknown): VisitStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value)
    ? (value as VisitStatus)
    : 'none'
}

function randomInviteCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const bytes = new Uint32Array(length)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < length; i++) {
    code += alphabet[bytes[i] % alphabet.length]
  }
  return code
}

/** Shareable link to join a group: `/favorites?join=CODE`. */
export function buildJoinLink(code: string): string {
  const path = `/favorites?join=${encodeURIComponent(code)}`
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  return path
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}

async function getDisplayName(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    const name = (data as { full_name?: unknown } | null)?.full_name
    if (typeof name === 'string' && name.trim()) return name.trim()
  } catch {
    // Fall through to default
  }
  return 'شريك'
}

function mapMembers(
  rows: Record<string, unknown>[],
  fallbackNames: Map<string, string>,
  createdBy: string | null
): SharedMember[] {
  return rows.map((r) => {
    const userId = String(r.user_id ?? '')
    return {
      userId,
      displayName:
        (typeof r.display_name === 'string' && r.display_name.trim()
          ? r.display_name.trim()
          : fallbackNames.get(userId)) ?? 'شريك',
      avatarUrl: (r.avatar_url as string | null | undefined) ?? null,
      role: createdBy !== null && userId === createdBy ? 'owner' : 'member',
    }
  })
}

async function loadGroupWithMembers(groupId: string): Promise<SharedGroup | null> {
  const { data: group, error: groupError } = await supabase
    .from('shared_favorite_groups')
    .select('id, invite_code, created_by')
    .eq('id', groupId)
    .single()
  if (groupError || !group) return null

  const { data: memberRows } = await supabase
    .from('shared_favorite_members')
    .select('user_id, display_name, avatar_url')
    .eq('group_id', groupId)

  const rows = ((memberRows ?? []) as unknown as Record<string, unknown>[])
  const names = new Map<string, string>()
  await Promise.all(
    rows.map(async (r) => {
      const uid = String(r.user_id ?? '')
      if (uid && !(typeof r.display_name === 'string' && r.display_name.trim())) {
        names.set(uid, await getDisplayName(uid))
      }
    })
  )

  const g = group as unknown as Record<string, unknown>
  const createdBy =
    typeof g.created_by === 'string' && g.created_by ? g.created_by : null
  return {
    id: String(g.id ?? groupId),
    inviteCode: String(g.invite_code ?? ''),
    createdBy,
    members: mapMembers(rows, names, createdBy),
  }
}

/**
 * Get the current user's active shared group, creating one (with a fresh
 * invite code) when they have none yet. Returns null when logged out or
 * when the shared_* tables are unavailable.
 */
export async function fetchUserGroup(): Promise<SharedGroup | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data: membership } = await supabase
      .from('shared_favorite_members')
      .select('group_id')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(1)
      .single()
    const groupId = (membership as { group_id?: unknown } | null)?.group_id
    if (typeof groupId === 'string' && groupId) {
      const existing = await loadGroupWithMembers(groupId)
      if (existing) return existing
    }

    // No group yet — create one and add the caller as first member.
    const { data: created, error: createError } = await supabase
      .from('shared_favorite_groups')
      .insert({ created_by: userId, invite_code: randomInviteCode() })
      .select('id, invite_code')
      .single()
    if (createError || !created) return null
    const c = created as unknown as Record<string, unknown>
    const newGroupId = String(c.id ?? '')
    if (!newGroupId) return null

    const displayName = await getDisplayName(userId)
    await supabase
      .from('shared_favorite_members')
      .insert({ group_id: newGroupId, user_id: userId, display_name: displayName })

    return loadGroupWithMembers(newGroupId)
  } catch {
    return null
  }
}

/** Join an existing shared group via its invite code. Idempotent. */
export async function joinGroupByCode(code: string): Promise<SharedGroup | null> {
  try {
    const userId = await getCurrentUserId()
    const clean = code.trim().toUpperCase()
    if (!userId || !clean) return null

    const { data: group, error } = await supabase
      .from('shared_favorite_groups')
      .select('id')
      .eq('invite_code', clean)
      .single()
    if (error || !group) return null
    const groupId = String((group as unknown as Record<string, unknown>).id ?? '')
    if (!groupId) return null

    const displayName = await getDisplayName(userId)
    // Idempotent: ignore duplicate-membership errors.
    await supabase
      .from('shared_favorite_members')
      .upsert(
        { group_id: groupId, user_id: userId, display_name: displayName },
        { onConflict: 'group_id,user_id' }
      )

    return loadGroupWithMembers(groupId)
  } catch {
    return null
  }
}

function mapEntry(
  row: Record<string, unknown>,
  memberNames: Map<string, string>
): SharedPropertyEntry {
  const reactionBy =
    typeof row.reaction_by === 'string' && row.reaction_by ? row.reaction_by : null
  return {
    propertyId: String(row.property_id ?? ''),
    note: typeof row.note === 'string' ? row.note : '',
    reaction: toSharedReaction(row.reaction),
    reactionBy,
    reactionByName: reactionBy ? (memberNames.get(reactionBy) ?? null) : null,
    visitStatus: toVisitStatus(row.visit_status),
    visitAt: typeof row.visit_at === 'string' && row.visit_at ? row.visit_at : null,
    addedBy: typeof row.added_by === 'string' ? row.added_by : null,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  }
}

/** Retrieve a group's shared properties with member reactions/statuses. */
export async function fetchSharedInteractions(
  groupId: string
): Promise<SharedPropertyEntry[]> {
  try {
    if (!groupId) return []
    const { data: items, error } = await supabase
      .from('shared_favorite_items')
      .select('property_id, note, reaction, reaction_by, visit_status, visit_at, added_by, updated_at')
      .eq('group_id', groupId)
      .order('updated_at', { ascending: false })
    if (error || !items) return []

    const { data: memberRows } = await supabase
      .from('shared_favorite_members')
      .select('user_id, display_name')
      .eq('group_id', groupId)
    const names = new Map<string, string>()
    for (const r of ((memberRows ?? []) as unknown as Record<string, unknown>[])) {
      const uid = String(r.user_id ?? '')
      if (uid) {
        names.set(
          uid,
          typeof r.display_name === 'string' && r.display_name.trim()
            ? r.display_name.trim()
            : 'شريك'
        )
      }
    }

    return ((items ?? []) as unknown as Record<string, unknown>[])
      .filter((r) => String(r.property_id ?? '') !== '')
      .map((r) => mapEntry(r, names))
  } catch {
    return []
  }
}

/**
 * Add a property to the shared group or update its note / reaction /
 * visit status. Returns the updated entry, or null on failure.
 */
export async function toggleSharedProperty(
  groupId: string,
  propertyId: string,
  patch: SharedPropertyPatch = {}
): Promise<SharedPropertyEntry | null> {
  try {
    const userId = await getCurrentUserId()
    if (!groupId || !propertyId || !userId) return null

    const payload: Record<string, unknown> = {
      group_id: groupId,
      property_id: propertyId,
      added_by: userId,
      updated_at: new Date().toISOString(),
    }
    if (patch.note !== undefined) payload.note = patch.note
    if (patch.reaction !== undefined) {
      payload.reaction = patch.reaction
      payload.reaction_by = patch.reaction === null ? null : userId
    }
    if (patch.visitStatus !== undefined) payload.visit_status = patch.visitStatus
    if (patch.visitAt !== undefined) payload.visit_at = patch.visitAt

    const { data, error } = await supabase
      .from('shared_favorite_items')
      .upsert(payload, { onConflict: 'group_id,property_id' })
      .select('property_id, note, reaction, reaction_by, visit_status, visit_at, added_by, updated_at')
      .single()
    if (error || !data) return null

    const group = await loadGroupWithMembers(groupId)
    const names = new Map<string, string>()
    for (const m of group?.members ?? []) names.set(m.userId, m.displayName)
    return mapEntry(data as unknown as Record<string, unknown>, names)
  } catch {
    return null
  }
}

/** Remove a property from the shared group. Returns true on success. */
export async function removeSharedProperty(
  groupId: string,
  propertyId: string
): Promise<boolean> {
  try {
    if (!groupId || !propertyId) return false
    const { error } = await supabase
      .from('shared_favorite_items')
      .delete()
      .eq('group_id', groupId)
      .eq('property_id', propertyId)
    return !error
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Darna Duo aliases — same shared-favorites backend, Duo branding.     */
/* ------------------------------------------------------------------ */

/** Shareable Darna Duo invite link: `/favorites?duo=CODE`. */
export function buildDuoLink(code: string): string {
  const path = `/favorites?duo=${encodeURIComponent(code)}`
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  return path
}

/** Fetch the current user's active Darna Duo group (members + partner). */
export async function getMyGroup(): Promise<SharedGroup | null> {
  return fetchUserGroup()
}

/**
 * Create a new Darna Duo group; the creator auto-joins as 'owner'.
 * Idempotent: returns the existing group when the user already has one.
 */
export async function createGroup(_name?: string): Promise<SharedGroup | null> {
  void _name
  return fetchUserGroup()
}

export interface DarnaDuoInteractionPatch {
  reaction?: SharedReaction | null
  note?: string
  visit_status?: VisitStatus
  visit_date?: string | null
}

/** Upsert a property interaction (reaction / note / visit status). */
export async function addOrUpdateInteraction(
  groupId: string,
  propertyId: string,
  patch: DarnaDuoInteractionPatch = {}
): Promise<SharedPropertyEntry | null> {
  return toggleSharedProperty(groupId, propertyId, {
    ...(patch.reaction !== undefined ? { reaction: patch.reaction } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.visit_status !== undefined ? { visitStatus: patch.visit_status } : {}),
    ...(patch.visit_date !== undefined ? { visitAt: patch.visit_date } : {}),
  })
}

/** Fetch full shared interaction data (reactions, notes, visit statuses). */
export async function fetchGroupProperties(
  groupId: string
): Promise<SharedPropertyEntry[]> {
  return fetchSharedInteractions(groupId)
}
