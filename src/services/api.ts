import { supabase } from '@/lib/supabase'
import type { Property, SearchFilters } from '@/types'
import type { Agent } from '@/types'
import { WILAYAS } from '@/constants'
import { normalizeLatLng } from '@/lib/mapHelpers'

// Re-export Agent type for consumers importing from services
export type { Agent }

/* ------------------------------------------------------------------ */
/* Row mapping (Supabase snake_case -> app camelCase Property)          */
/* ------------------------------------------------------------------ */

function firstNonEmpty(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
    if (typeof v === 'number' && !Number.isNaN(v)) return String(v)
  }
  return ''
}

function resolveAgentWilaya(row: Record<string, unknown>): string {
  const text = firstNonEmpty(row.wilaya, row.wilaya_name)
  if (text) return text
  const idRaw = firstNonEmpty(row.wilaya_id)
  if (!idRaw) return ''
  const match = WILAYAS.find((w) => String(w.id) === idRaw)
  return match ? match.name : idRaw
}

function resolveWilayaId(row: Record<string, unknown>): number {
  const direct = row.wilaya_id ?? row.wilayaId
  if (direct !== undefined && direct !== null && direct !== '') return Number(direct)
  const name = String(row.wilaya ?? '').trim().toLowerCase()
  if (!name) return 16
  const match = WILAYAS.find(
    (w) =>
      w.name.toLowerCase() === name ||
      w.nameAr === String(row.wilaya ?? '').trim() ||
      String(w.id) === name
  )
  return match ? match.id : 16
}

function mapRowToProperty(row: Record<string, unknown>): Property {
  const pick = (...keys: string[]) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null) return row[k]
    }
    return undefined
  }

  // Leaflet + DB canonical order is [latitude, longitude].
  // Auto-correct rows that were stored inverted ([lng, lat]) so a Saida
  // listing (34.83, 0.15) never renders near the equator.
  const rawLat = Number(pick('latitude', 'lat') ?? 28.0339)
  const rawLng = Number(pick('longitude', 'lng') ?? 1.6596)
  const fixed = normalizeLatLng(rawLat, rawLng)
  const latitude = fixed ? fixed.lat : rawLat
  const longitude = fixed ? fixed.lng : rawLng

  return {
    id: String(pick('id', 'ID') ?? ''),
    title: String(pick('title') ?? ''),
    titleAr: (pick('title_ar', 'titleAr') as string | undefined) ?? undefined,
    description: String(pick('description') ?? ''),
    descriptionAr: (pick('description_ar', 'descriptionAr') as string | undefined) ?? undefined,
    operationType: (pick('operation', 'operation_type', 'operationType') as Property['operationType']) ?? 'sale',
    propertyType: (pick('property_type', 'propertyType') as Property['propertyType']) ?? 'apartment',
    price: Number(pick('price') ?? 0),
    currency: ((pick('currency') as string) ?? 'DZD') as Property['currency'],
    pricePerNight: (pick('price_per_night', 'pricePerNight') as number | undefined) ?? undefined,
    wilayaId: resolveWilayaId(row),
    daira: (pick('daira') as string | undefined) ?? undefined,
    commune: (pick('commune') as string | undefined) ?? undefined,
    address: (pick('address') as string | undefined) ?? undefined,
    latitude,
    longitude,
    bedrooms: Number(pick('bedrooms', 'rooms') ?? 0),
    bathrooms: Number(pick('bathrooms') ?? 0),
    area: Number(pick('area', 'surface') ?? 0),
    floor: (pick('floor') as number | undefined) ?? undefined,
    legalStatus: (pick('legal_status', 'legalStatus') as Property['legalStatus']) ?? 'acte_livret',
    images: ((pick('images') as string[]) ?? []) as string[],
    ownerId: String(pick('owner_id', 'ownerId', 'user_id', 'userId') ?? ''),
    ownerName: String(pick('owner_name', 'ownerName') ?? ''),
    ownerPhone: (pick('owner_phone', 'ownerPhone') as string | undefined) ?? undefined,
    isFeatured: Boolean(pick('is_featured', 'isFeatured') ?? false),
    isAvailable: pick('is_published', 'is_available', 'isAvailable') === undefined ? true : Boolean(pick('is_published', 'is_available', 'isAvailable')),
    isVerified: Boolean(pick('is_verified', 'isVerified') ?? false),
    viewsCount: Number(pick('views_count', 'viewsCount') ?? 0),
    createdAt: String(pick('created_at', 'createdAt') ?? new Date().toISOString()),
    updatedAt: String(pick('updated_at', 'updatedAt') ?? new Date().toISOString()),
    waterAvailability: ((pick('water_availability', 'waterAvailability') as string) ?? '24_7') as Property['waterAvailability'],
    gasType: ((pick('gas_type', 'gasType') as string) ?? 'city_gas') as Property['gasType'],
    electricityMeter: ((pick('electricity_meter', 'electricityMeter') as string) ?? 'individual') as Property['electricityMeter'],
    hasElevator: Boolean(pick('has_elevator', 'hasElevator') ?? false),
    floorNumber: (pick('floor_number', 'floorNumber') as number | undefined) ?? undefined,
    buildingFloors: (pick('building_floors', 'buildingFloors') as number | undefined) ?? undefined,
    colocationGender: (pick('colocation_gender', 'colocationGender') as Property['colocationGender']) ?? undefined,
    studentFriendly: Boolean(pick('student_friendly', 'studentFriendly') ?? false),
    roommatesCount: (pick('roommates_count', 'roommatesCount') as number | undefined) ?? undefined,
    availableBeds: (pick('available_beds', 'availableBeds') as number | undefined) ?? undefined,
    smokingAllowed: Boolean(pick('smoking_allowed', 'smokingAllowed') ?? false),
    wifiIncluded: pick('wifi_included', 'wifiIncluded') === undefined ? true : Boolean(pick('wifi_included', 'wifiIncluded')),
    cleaningFee: (pick('cleaning_fee', 'cleaningFee') as number | undefined) ?? undefined,
    bookedDates: ((pick('booked_dates', 'bookedDates') as string[]) ?? undefined) as string[] | undefined,
    agencyId: (pick('agency_id', 'agencyId') as string | undefined) ?? undefined,
    agencyName: (pick('agency_name', 'agencyName') as string | undefined) ?? undefined,
  }
}

function buildPropertyQuery(filters?: SearchFilters) {
  let query = supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(100)

  if (!filters) return query

  if (filters.propertyType) {
    query = query.eq('property_type', filters.propertyType)
  }
  if (filters.legalStatus) {
    query = query.eq('legal_status', filters.legalStatus)
  }
  if (filters.minPrice !== undefined && filters.minPrice !== null && Number(filters.minPrice) > 0) {
    query = query.gte('price', Number(filters.minPrice))
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== null && Number(filters.maxPrice) > 0) {
    query = query.lte('price', Number(filters.maxPrice))
  }

  return query
}

/* ------------------------------------------------------------------ */
/* Properties — 100% live, no mock fallback                            */
/* ------------------------------------------------------------------ */

/** Fetch live listings. Returns [] when the table is empty or on error. */
export async function fetchProperties(filters?: SearchFilters): Promise<Property[]> {
  const { data, error } = await buildPropertyQuery(filters)

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  if (!data || data.length === 0) return []

  let properties = (data as Record<string, unknown>[]).map(mapRowToProperty)

  // Client-side filters (support both `operation`/`operation_type`,
  // `wilaya`/`wilaya_id`, `surface`/`area`, `rooms`/`bedrooms` variants)
  if (filters?.operationType) {
    const op = String(filters.operationType).toLowerCase()
    properties = properties.filter((p) => String(p.operationType || '').toLowerCase() === op)
  }
  if (filters?.wilayaId !== undefined && filters?.wilayaId !== null) {
    properties = properties.filter((p) => Number(p.wilayaId) === Number(filters.wilayaId))
  }
  if (filters?.commune) {
    const target = String(filters.commune).toLowerCase().trim()
    properties = properties.filter((p) => String(p.commune || '').toLowerCase().trim() === target)
  }
  if (filters?.minBedrooms !== undefined && filters?.minBedrooms !== null && Number(filters.minBedrooms) > 0) {
    properties = properties.filter((p) => Number(p.bedrooms) >= Number(filters.minBedrooms))
  }
  if (filters?.minArea !== undefined && filters?.minArea !== null && Number(filters.minArea) > 0) {
    properties = properties.filter((p) => Number(p.area) >= Number(filters.minArea))
  }
  // Client-side text search (query) — Supabase full-text kept simple here
  if (filters?.query?.trim()) {
    const q = filters.query.toLowerCase().trim()
    properties = properties.filter((p) =>
      [p.title, p.description, p.address, p.commune, p.daira]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }
  if (filters?.colocationGender) {
    properties = properties.filter((p) => p.colocationGender === filters.colocationGender)
  }
  if (filters?.studentFriendly !== undefined && filters.studentFriendly !== null) {
    properties = properties.filter((p) => p.studentFriendly === filters.studentFriendly)
  }

  return properties
}

/** Fetch a single property by id, joined with its publisher profile. */
export async function fetchPropertyById(id: string): Promise<{ property: Property | null; publisherName: string | null }> {
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single()

  if (error || !data) {
    console.error('Error fetching property:', error)
    return { property: null, publisherName: null }
  }

  const property = mapRowToProperty(data as Record<string, unknown>)

  let publisherName: string | null = null
  if (property.ownerId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', property.ownerId)
      .single()
    if (profile && typeof (profile as Record<string, unknown>).full_name === 'string') {
      publisherName = (profile as Record<string, unknown>).full_name as string
    }
  }

  return { property, publisherName }
}

/** Increment the view counter (fire-and-forget safe). */
export async function incrementPropertyViews(propertyId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_property_views', { property_uuid: propertyId })
  if (error) {
    console.error('Error incrementing views:', error)
  }
}

/** Fetch featured properties for the home page. */
export async function fetchFeaturedProperties(limit = 4): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured properties:', error)
    return []
  }

  if (!data || data.length === 0) return []
  return (data as Record<string, unknown>[]).map(mapRowToProperty)
}

/* ------------------------------------------------------------------ */
/* Agents — live profiles (role in ('agent', 'agency')). No fallback.   */
/* ------------------------------------------------------------------ */

export async function fetchAgents(wilaya?: string): Promise<Agent[]> {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .in('role', ['agent', 'agency', 'user'])

    if (wilaya && wilaya !== 'all' && wilaya !== 'جميع الولايات') {
      query = query.eq('wilaya', wilaya)
    }

    const { data, error } = await query.order('rating', { ascending: false }).limit(50)

    console.log('Fetched agents raw data:', data, error)

    if (error) {
      console.error('Error fetching agents from Supabase:', error)
      return []
    }

    // Map snake_case DB columns to Agent interface.
    // Do not filter out agents with 0 properties.
    return ((data || []) as Record<string, unknown>[]).map((row: Record<string, unknown>, index: number) => ({
      id: String(row.id ?? `profile-${index}`),
      name: String(row.full_name || row.agency_name || 'وكيل معتمد'),
      agencyName: String(row.agency_name || row.full_name || ''),
      licenseNumber: String(row.license_number ?? ''),
      phone: String(row.phone || row.phone_number || ''),
      whatsapp: String(row.whatsapp || row.phone || row.phone_number || ''),
      email: String(row.email ?? ''),
      wilaya: resolveAgentWilaya(row),
      commune: String(row.commune ?? ''),
      bio: String(row.bio ?? ''),
      rating: Number(row.rating) || 5.0,
      reviewsCount: Number(row.reviews_count ?? 0),
      avatarUrl: String(
        row.avatar_url ??
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=150'
      ),
      verified: Boolean(row.is_verified ?? true),
      activeListingsCount: Number(row.active_listings_count ?? 0),
      specialties: (Array.isArray(row.specialties) ? (row.specialties as string[]) : []) as string[],
    }))
  } catch (err) {
    console.error('Unexpected error in fetchAgents:', err)
    return []
  }
}

/* ------------------------------------------------------------------ */
/* Favorites — live Supabase (authenticated users)                     */
/* ------------------------------------------------------------------ */

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('property_id').eq('user_id', userId)

  if (error) {
    console.error('Error fetching favorites:', error)
    return []
  }

  return ((data ?? []) as { property_id: string }[]).map((r) => r.property_id)
}

export async function addFavorite(userId: string, propertyId: string): Promise<boolean> {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId })
  if (error) {
    console.error('Error adding favorite:', error)
    return false
  }
  return true
}

export async function removeFavorite(userId: string, propertyId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId)
  if (error) {
    console.error('Error removing favorite:', error)
    return false
  }
  return true
}

/** Fetch full property rows for a user's favorites. */
export async function fetchFavoriteProperties(userId: string): Promise<Property[]> {
  const ids = await getFavoriteIds(userId)
  if (ids.length === 0) return []

  const { data, error } = await supabase.from('properties').select('*').in('id', ids)

  if (error) {
    console.error('Error fetching favorite properties:', error)
    return []
  }

  if (!data || data.length === 0) return []
  return (data as Record<string, unknown>[]).map(mapRowToProperty)
}

/* ------------------------------------------------------------------ */
/* Delete / Update — owner operations on properties                     */
/* NOTE: properties.id is UUID (string) — pass the id through as-is.    */
/* ------------------------------------------------------------------ */

export interface DeletePropertyResult {
  success: boolean
  count: number
  errorMessage: string | null
}

/** Delete a single property by exact id match. */
export async function deleteProperty(propertyId: string): Promise<DeletePropertyResult> {
  const { error, count } = await supabase
    .from('properties')
    .delete({ count: 'exact' })
    .eq('id', propertyId)

  if (error) {
    console.error('Error deleting property:', error.message)
    return { success: false, count: 0, errorMessage: error.message }
  }

  const affected = count ?? 0
  if (affected === 0) {
    console.warn(
      'Delete affected 0 rows — RLS likely prevented the deletion ' +
        '(auth.uid() vs owner_id mismatch) for id:',
      propertyId
    )
  }

  return { success: true, count: affected, errorMessage: null }
}

/** Read-only / system-managed fields that must never be sent in an update. */
const UPDATE_STRIPPED_FIELDS = new Set([
  'id',
  'created_at',
  'createdAt',
  'views_count',
  'viewsCount',
  'owner_id',
  'ownerId',
])

/** Update a single property by exact id match, stripping read-only fields. */
export async function updateProperty(
  propertyId: string,
  updates: Record<string, unknown>
): Promise<{ success: boolean; errorMessage: string | null }> {
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(updates)) {
    if (!UPDATE_STRIPPED_FIELDS.has(key) && value !== undefined) {
      payload[key] = value
    }
  }
  payload.updated_at = new Date().toISOString()

  const { error } = await supabase.from('properties').update(payload).eq('id', propertyId)

  if (error) {
    console.error('Error updating property:', error.message)
    return { success: false, errorMessage: error.message }
  }

  return { success: true, errorMessage: null }
}
