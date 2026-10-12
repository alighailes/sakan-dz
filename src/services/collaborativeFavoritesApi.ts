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

/**
 * UUID v4 built on crypto.getRandomValues. Unlike crypto.randomUUID(),
 * this works in non-secure contexts (e.g. a LAN http:// origin), where
 * randomUUID is undefined and would otherwise throw.
 */
function randomUuid(): string {
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0'))
  return (
    h.slice(0, 4).join('') +
    '-' + h.slice(4, 6).join('') +
    '-' + h.slice(6, 8).join('') +
    '-' + h.slice(8, 10).join('') +
    '-' + h.slice(10, 16).join('')
  )
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

  const rows = await fetchMemberRows(groupId)
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

/** Last underlying Supabase error from group provisioning (for diagnostics). */
let lastGroupProvisionError: string | null = null

/**
 * Tracks whether the deployed `shared_favorite_members` table has the newer
 * `display_name` / `avatar_url` columns. Older deployments lack them and
 * PostgREST aborts whole queries that reference a missing column, so we probe
 * once and cache the result to avoid repeated "schema cache" errors.
 */
type MembersSchema = 'unknown' | 'full' | 'minimal'
let membersSchema: MembersSchema = 'unknown'

/** Read member rows, degrading to a minimal column set if the DB is older. */
async function fetchMemberRows(
  groupId: string
): Promise<Record<string, unknown>[]> {
  if (membersSchema === 'full') {
    const { data, error } = await supabase
      .from('shared_favorite_members')
      .select('user_id, display_name, avatar_url')
      .eq('group_id', groupId)
    if (!error) return (data ?? []) as unknown as Record<string, unknown>[]
    membersSchema = 'minimal'
  }
  const { data, error } = await supabase
    .from('shared_favorite_members')
    .select('user_id')
    .eq('group_id', groupId)
  if (error) return []
  membersSchema = 'minimal'
  return (data ?? []) as unknown as Record<string, unknown>[]
}

/** Insert a member row, retrying without `display_name` on older tables. */
async function insertMember(groupId: string, userId: string): Promise<boolean> {
  if (membersSchema !== 'minimal') {
    const displayName = await getDisplayName(userId)
    const { error } = await supabase
      .from('shared_favorite_members')
      .insert({ group_id: groupId, user_id: userId, display_name: displayName })
    if (!error) {
      membersSchema = 'full'
      return true
    }
    if (error) {
      lastGroupProvisionError = error.message
      console.error(
        '[collaborativeFavoritesApi] member insert with display_name failed, retrying without it — ' +
          'run: ALTER TABLE shared_favorite_members ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT \'\';',
        error
      )
    }
    membersSchema = 'minimal'
  }
  const { error } = await supabase
    .from('shared_favorite_members')
    .insert({ group_id: groupId, user_id: userId })
  if (error) {
    lastGroupProvisionError = error.message
    console.error('[collaborativeFavoritesApi] member insert (minimal) failed:', error)
    return false
  }
  return true
}

/**
 * Get the current user's active shared group (pure read — never creates).
 * Queries `shared_favorite_members` for the current user's `group_id`,
 * then fetches group details plus all members for that `group_id`.
 * Returns null cleanly (no throw) when logged out, when the user has no
 * group yet, or when the shared_* tables are unavailable.
 */
export async function fetchUserGroup(): Promise<SharedGroup | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const { data: membership, error: membershipError } = await supabase
      .from('shared_favorite_members')
      .select('group_id')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (membershipError) return null
    const groupId = (membership as { group_id?: unknown } | null)?.group_id
    if (typeof groupId !== 'string' || !groupId) return null

    // Fetch group details + all members for that group_id.
    const existing = await loadGroupWithMembers(groupId)
    return existing ?? null
  } catch (err) {
    lastGroupProvisionError = err instanceof Error ? err.message : String(err)
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Personal invite codes — join by linking two user accounts.           */
/* ------------------------------------------------------------------ */

export type DuoJoinStatus = 'joined' | 'not_found' | 'own_code'

export interface DuoJoinResult {
  status: DuoJoinStatus
  group: SharedGroup | null
  /** Exact server message (RPC) when present — shown verbatim in the UI. */
  message?: string | null
}

async function findGroupIdByInviteCode(clean: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('shared_favorite_groups')
    .select('id')
    .eq('invite_code', clean)
    .maybeSingle()
  if (error || !data) return null
  return String((data as unknown as Record<string, unknown>).id ?? '') || null
}

async function findUserIdByProfileInviteCode(clean: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_code', clean)
      .maybeSingle()
    if (error || !data) return null
    return String((data as unknown as Record<string, unknown>).id ?? '') || null
  } catch {
    return null
  }
}

async function findUserGroupId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('shared_favorite_members')
    .select('group_id')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const groupId = (data as { group_id?: unknown } | null)?.group_id
  return typeof groupId === 'string' && groupId ? groupId : null
}

async function addMemberToGroup(groupId: string, userId: string): Promise<void> {
  if (membersSchema !== 'minimal') {
    const displayName = await getDisplayName(userId)
    const { error } = await supabase
      .from('shared_favorite_members')
      .upsert(
        { group_id: groupId, user_id: userId, display_name: displayName },
        { onConflict: 'group_id,user_id' }
      )
    if (!error) {
      membersSchema = 'full'
      return
    }
    console.error(
      '[collaborativeFavoritesApi] member upsert with display_name failed, retrying without it:',
      error
    )
    membersSchema = 'minimal'
  }
  await supabase
    .from('shared_favorite_members')
    .upsert({ group_id: groupId, user_id: userId }, { onConflict: 'group_id,user_id' })
}

async function createGroupForOwner(ownerId: string): Promise<string | null> {
  // Client-generated id + no RETURNING: the SELECT policy on
  // shared_favorite_groups only reveals rows to members, and the owner is not
  // a member yet at insert time, so `.select()` would yield no row.
  const groupId = randomUuid()
  const { error } = await supabase
    .from('shared_favorite_groups')
    .insert({ id: groupId, created_by: ownerId, invite_code: randomInviteCode() })
  if (error) return null
  return groupId
}

/**
 * Join a shared group using either a group invite code
 * (`shared_favorite_groups.invite_code`) or a user's personal invite code
 * (`profiles.invite_code`). A personal code links the two accounts: it
 * reuses the partner's existing group, or creates a fresh one for both.
 *
 * Preferred path is the `validate_and_join_duo` RPC: client-side lookups
 * of groups/profiles by code are RLS-blocked for strangers, which used to
 * surface valid codes as "not_found". Keeps the DuoJoinResult status
 * contract (callers map statuses to localized strings and do not catch),
 * with the exact RPC message plumbed through `message` when present.
 */
export async function joinGroupByCode(code: string): Promise<DuoJoinResult> {
  const clean = code.trim().toUpperCase()
  try {
    const userId = await getCurrentUserId()
    if (!userId || !clean) return { status: 'not_found', group: null }

    const { data, error } = await supabase.rpc('validate_and_join_duo', {
      invite_code_input: clean,
    })
    if (error) {
      console.error('[validate_and_join_duo] RPC error:', error)
      const rpcErr = error as unknown as Record<string, unknown>
      const rpcMsg = String(rpcErr.message ?? '')
      if (rpcMsg.includes('SELF_CODE')) {
        return { status: 'own_code', group: null, message: rpcMsg }
      }
      if (
        rpcErr.code === 'PGRST202' ||
        rpcErr.status === 404 ||
        rpcMsg.includes('validate_and_join_duo') ||
        rpcMsg.includes('does not exist')
      ) {
        // RPC not migrated yet — legacy client-side path.
        return legacyJoinGroupByCode(clean, userId)
      }
      return { status: 'not_found', group: null, message: rpcMsg || null }
    }

    const res = (data ?? {}) as unknown as Record<string, unknown>
    const ok = res.success === true
    const resCode = String(res.code ?? '')
    const resMsg = typeof res.message === 'string' && res.message ? res.message : null
    if (!ok) {
      if (resCode.includes('SELF_CODE')) {
        return { status: 'own_code', group: null, message: resMsg }
      }
      return { status: 'not_found', group: null, message: resMsg }
    }
    const gid = String(res.group_id ?? '')
    if (!gid) return { status: 'not_found', group: null }
    // Refresh the active session: the joined group is the newest membership.
    const group =
      (await loadGroupWithMembers(gid)) ?? (await fetchUserGroup())
    // Reads still RLS-blocked (migration partially applied): the join
    // itself succeeded server-side; the caller refreshes the cache.
    return { status: 'joined', group: group?.id === gid ? group : null }
  } catch {
    return { status: 'not_found', group: null }
  }
}

/** Pre-RPC join path (kept as fallback until the RPC is migrated). */
async function legacyJoinGroupByCode(
  clean: string,
  userId: string
): Promise<DuoJoinResult> {
  try {
    // 1) Direct group invite code.
    const groupIdFromCode = await findGroupIdByInviteCode(clean)
    if (groupIdFromCode) {
      await addMemberToGroup(groupIdFromCode, userId)
      const group = await loadGroupWithMembers(groupIdFromCode)
      return group ? { status: 'joined', group } : { status: 'not_found', group: null }
    }

    // 2) Personal invite code -> resolve the owner's profile.
    const partnerId = await findUserIdByProfileInviteCode(clean)
    if (!partnerId) return { status: 'not_found', group: null }
    if (partnerId === userId) return { status: 'own_code', group: null }

    // Reuse the partner's active group, or create one for both accounts.
    let groupId = await findUserGroupId(partnerId)
    if (!groupId) {
      groupId = await createGroupForOwner(partnerId)
      if (!groupId) return { status: 'not_found', group: null }
      await addMemberToGroup(groupId, partnerId)
    }
    await addMemberToGroup(groupId, userId)

    const group = await loadGroupWithMembers(groupId)
    return group ? { status: 'joined', group } : { status: 'not_found', group: null }
  } catch {
    return { status: 'not_found', group: null }
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
    // Wide projection first; on failure (e.g. a newer column missing on an
    // older deployment) fall back to a minimal projection so one column
    // can't silently blank the whole shared list.
    let items: unknown[] | null = null
    {
      const { data, error } = await supabase
        .from('shared_favorite_items')
        .select('property_id, note, reaction, reaction_by, visit_status, visit_at, added_by, updated_at')
        .eq('group_id', groupId)
        .order('updated_at', { ascending: false })
      if (!error && data) {
        items = data as unknown[]
      } else if (error) {
        console.error('[collaborativeFavoritesApi] shared items read failed, retrying minimal projection:', error)
        const retry = await supabase
          .from('shared_favorite_items')
          .select('property_id')
          .eq('group_id', groupId)
        if (retry.error || !retry.data) return []
        items = retry.data as unknown[]
      } else {
        return []
      }
    }

    const names = new Map<string, string>()
    for (const r of await fetchMemberRows(groupId)) {
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
  groupId: string | null | undefined,
  propertyId: string,
  patch: SharedPropertyPatch = {}
): Promise<SharedPropertyEntry | null> {
  try {
    const userId = await getCurrentUserId()
    if (!propertyId || !userId) return null

    // Auto-provision the caller's group when none was passed instead of
    // failing — a single tap on a listing card must work before a partner
    // ever joins.
    let resolvedGroupId = groupId ?? null
    if (!resolvedGroupId) {
      const group = (await fetchUserGroup()) ?? (await createGroup())
      resolvedGroupId = group?.id ?? null
    }
    if (!resolvedGroupId) return null

    const payload: Record<string, unknown> = {
      group_id: resolvedGroupId,
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
    if (error || !data) {
      // Never treat as success: the caller only updates UI on non-null.
      console.error('[SharedFavorites] Write failed:', error ?? 'no data returned')
      return null
    }

    const group = await loadGroupWithMembers(resolvedGroupId)
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
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    // Idempotent: reuse the active group when one already exists.
    const existing = await fetchUserGroup()
    if (existing) return existing

    // 1. Check existing group created by this user (covers an orphaned group
    // where the membership row is missing/invisible but the created_by row
    // exists — otherwise the insert below hits unique_user_single_duo_group).
    const { data: existingOwnedGroup } = await supabase
      .from('shared_favorite_groups')
      .select('id, invite_code, created_by')
      .eq('created_by', userId)
      .maybeSingle()

    if (existingOwnedGroup) {
      const ownedId = String(
        (existingOwnedGroup as unknown as Record<string, unknown>).id ?? ''
      )
      if (ownedId) {
        // Ensure membership exists
        await supabase
          .from('shared_favorite_members')
          .upsert(
            { group_id: ownedId, user_id: userId },
            { onConflict: 'group_id,user_id' }
          )

        const owned = await loadGroupWithMembers(ownedId)
        if (owned) return owned
      }
    }

    // The group id is generated client-side on purpose: INSERT ... RETURNING
    // would be filtered out by the SELECT policy (the caller is not a member
    // of the row until the membership insert runs), so the returned row would
    // be empty and creation would appear to fail.
    const newGroupId = randomUuid()
    const inviteCode = randomInviteCode()
    const { error: createError } = await supabase
      .from('shared_favorite_groups')
      .insert({ id: newGroupId, created_by: userId, invite_code: inviteCode })
    if (createError) {
      // Race / orphaned row: the DB enforces one duo group per user via
      // unique_user_single_duo_group — on 23505 return the existing owned
      // group instead of surfacing "duo group unavailable".
      const code = (createError as unknown as Record<string, unknown>)?.code
      if (code === '23505') {
        const { data: conflictGroup } = await supabase
          .from('shared_favorite_groups')
          .select('id, invite_code, created_by')
          .eq('created_by', userId)
          .maybeSingle()
        const conflictId = String(
          (conflictGroup as unknown as Record<string, unknown> | null)?.id ?? ''
        )
        if (conflictId) {
          await supabase
            .from('shared_favorite_members')
            .upsert(
              { group_id: conflictId, user_id: userId },
              { onConflict: 'group_id,user_id' }
            )
          const reloadedConflict = await loadGroupWithMembers(conflictId)
          if (reloadedConflict) return reloadedConflict
        }
      }
      lastGroupProvisionError = createError.message
      console.error('[collaborativeFavoritesApi] createGroup insert failed:', createError)
      return null
    }

    await insertMember(newGroupId, userId)
    const displayName = await getDisplayName(userId)

    // Return the group we just built instead of re-reading it — the SELECT
    // policies hide rows until membership becomes visible, so a follow-up
    // read can return null even though the writes succeeded.
    // Best-effort refresh: if the row is already visible, return full state.
    const reloaded = await loadGroupWithMembers(newGroupId)
    if (reloaded) return reloaded
    return {
      id: newGroupId,
      inviteCode,
      createdBy: userId,
      members: [{ userId, displayName, avatarUrl: null, role: 'owner' }],
    }
  } catch (err) {
    lastGroupProvisionError = err instanceof Error ? err.message : String(err)
    return null
  }
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

/* ------------------------------------------------------------------ */
/* Quick toggle from a listing card — auto-provisions the user's group. */
/* ------------------------------------------------------------------ */

export type DuoToggleStatus = 'added' | 'removed' | 'no_auth' | 'error'

export interface DuoToggleResult {
  status: DuoToggleStatus
  groupId?: string | null
  error?: string
}

/** Read the last group-provisioning failure for diagnostics. */
export function getLastDuoGroupError(): string | null {
  return lastGroupProvisionError
}

/** Whether the property is in the group and was added by this user. */
async function isDuoPropertyOwnedByUser(
  groupId: string,
  propertyId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('shared_favorite_items')
    .select('property_id')
    .eq('group_id', groupId)
    .eq('property_id', propertyId)
    .eq('added_by', userId)
    .maybeSingle()
  if (error) return false
  return !!data
}

/**
 * Toggle a property in the current user's shared (Darna Duo) group.
 * Auto-provisions a group when the user has none, so a single tap works
 * even before the partner joins. Inserts/removes using
 * `(group_id, property_id, added_by = auth.uid())`.
 */
export async function toggleDuoProperty(
  propertyId: string,
  groupId?: string | null
): Promise<DuoToggleResult> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return { status: 'no_auth' }
    if (!propertyId) return { status: 'error', error: 'missing-property' }

    // Active group. The caller may pass a just-provisioned id; otherwise
    // create one on the fly — fetchUserGroup already provisions, and
    // createGroup() is an explicit retry so a single tap works before a
    // partner ever joins.
    let resolvedGroupId = groupId ?? null
    if (!resolvedGroupId) {
      const group = (await fetchUserGroup()) ?? (await createGroup())
      resolvedGroupId = group?.id ?? null
    }
    if (!resolvedGroupId) {
      // Never thrown — returned as a status. Keep the underlying cause in the
      // error field for the console (the card shows only a friendly toast).
      return { status: 'error', error: lastGroupProvisionError ?? 'group-unavailable' }
    }

    const owned = await isDuoPropertyOwnedByUser(resolvedGroupId, propertyId, userId)
    if (owned) {
      const { error } = await supabase
        .from('shared_favorite_items')
        .delete()
        .eq('group_id', resolvedGroupId)
        .eq('property_id', propertyId)
        .eq('added_by', userId)
      if (error) return { status: 'error', error: error.message, groupId: resolvedGroupId }
      return { status: 'removed', groupId: resolvedGroupId }
    }

    const { data: written, error } = await supabase
      .from('shared_favorite_items')
      .upsert(
        {
          group_id: resolvedGroupId,
          property_id: propertyId,
          added_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'group_id,property_id' }
      )
      .select('property_id')
      .single()
    // Verify-after-write: report 'added' only when the row is confirmed.
    // An upsert with no error but no returned row must not toast success.
    if (error || !written) {
      if (error) {
        console.error('[collaborativeFavoritesApi] insert error:', error)
        return { status: 'error', error: error.message, groupId: resolvedGroupId }
      }
      return { status: 'error', error: 'write-unconfirmed', groupId: resolvedGroupId }
    }
    return { status: 'added', groupId: resolvedGroupId }
  } catch (err) {
    return { status: 'error', error: err instanceof Error ? err.message : String(err) }
  }
}
