import L from 'leaflet'
import type { Property, MapMarker } from '@/types'

// ============================================================
// Algeria coordinate guards — Leaflet expects [latitude, longitude].
//   lat (North)  ~18.0 .. 38.0
//   lng (East)   ~-9.0 .. 12.0
// e.g. Saida = [34.8303, 0.1517]. An inverted pair like [0.15, 34.83]
// lands in the Gulf of Guinea / deep south and must be auto-swapped.
// ============================================================

export const ALGERIA_LAT_MIN = 18.0
export const ALGERIA_LAT_MAX = 38.0
export const ALGERIA_LNG_MIN = -9.0
export const ALGERIA_LNG_MAX = 12.0

/** Saida, Algeria — used as the documented reference pin. */
export const SAIDA_CENTER: [number, number] = [34.8303, 0.1517]

export function isValidAlgeriaLatLng(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  return (
    lat >= ALGERIA_LAT_MIN &&
    lat <= ALGERIA_LAT_MAX &&
    lng >= ALGERIA_LNG_MIN &&
    lng <= ALGERIA_LNG_MAX
  )
}

/**
 * Normalize a possibly-inverted pair into Leaflet [lat, lng] order.
 * - Returns the pair as-is when already valid.
 * - Auto-swaps when [lng, lat] was passed but the swapped version is valid.
 * - Returns null when neither ordering falls inside Algeria (unplottable).
 */
export function normalizeLatLng(
  lat: unknown,
  lng: unknown
): { lat: number; lng: number } | null {
  const a = typeof lat === 'string' ? Number(lat) : (lat as number)
  const b = typeof lng === 'string' ? Number(lng) : (lng as number)
  if (typeof a !== 'number' || typeof b !== 'number') return null
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null
  if (isValidAlgeriaLatLng(a, b)) return { lat: a, lng: b }
  // Common bug: GeoJSON [lng, lat] passed straight to Leaflet.
  if (isValidAlgeriaLatLng(b, a)) return { lat: b, lng: a }
  return null
}

/**
 * Convert a Property to a MapMarker.
 * Explicitly maps latitude -> lat, longitude -> lng and auto-corrects
 * inverted pairs so Saida pins never render near the equator.
 */
export function propertyToMarker(property: Property): MapMarker {
  const fixed = normalizeLatLng(property.latitude, property.longitude)
  return {
    id: property.id,
    lat: fixed ? fixed.lat : property.latitude,
    lng: fixed ? fixed.lng : property.longitude,
    price: property.price,
    currency: property.currency,
    operationType: property.operationType,
    propertyType: property.propertyType,
    title: property.title,
  }
}

/**
 * Create a custom price icon for map markers
 */
export function createPriceIcon(price: string, isFeatured: boolean = false): L.DivIcon {
  const bgColor = isFeatured ? '#d97706' : '#059669'
  const textColor = isFeatured ? '#fff' : '#fff'

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: ${textColor};
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        font-family: Inter, sans-serif;
      ">${price}</div>
    `,
    iconSize: [0, 0],
    iconAnchor: [30, 16],
  })
}

/**
 * Get tile layer URL based on whether Mapbox token is available
 */
export function getTileLayerUrl(): string {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
  if (mapboxToken) {
    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`
  }
  return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

/**
 * Get tile layer attribution
 */
export function getTileLayerAttribution(): string {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
  if (mapboxToken) {
    return '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
  return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}

/**
 * Calculate distance between two coordinates in km
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Filter properties within a bounding box.
 * Normalizes each property first so inverted pairs don't leak through.
 */
export function filterByBoundingBox(
  properties: Property[],
  bounds: L.LatLngBounds
): Property[] {
  return properties.filter((p) => {
    const fixed = normalizeLatLng(p.latitude, p.longitude)
    if (!fixed) return false
    // Leaflet bounds.contains expects [lat, lng] order.
    return bounds.contains([fixed.lat, fixed.lng])
  })
}
