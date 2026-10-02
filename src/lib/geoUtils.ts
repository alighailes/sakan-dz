import type { Property } from '@/types'

// ============================================================
// Point-in-Polygon (Ray-Casting Algorithm)
// ============================================================

export interface GeoPoint {
  lat: number
  lng: number
}

/**
 * Check if a point is inside a polygon using the ray-casting algorithm.
 * Works for both convex and concave polygons.
 */
export function pointInPolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Filter properties to only those whose coordinates fall within the polygon.
 */
export function filterPropertiesByPolygon(
  properties: Property[],
  polygon: GeoPoint[]
): Property[] {
  if (polygon.length < 3) return properties
  return properties.filter((p) =>
    pointInPolygon({ lat: p.latitude, lng: p.longitude }, polygon)
  )
}

/**
 * Calculate the centroid of a polygon.
 */
export function polygonCentroid(polygon: GeoPoint[]): GeoPoint {
  const n = polygon.length
  if (n === 0) return { lat: 0, lng: 0 }

  let latSum = 0
  let lngSum = 0
  for (const p of polygon) {
    latSum += p.lat
    lngSum += p.lng
  }
  return { lat: latSum / n, lng: lngSum / n }
}

/**
 * Calculate the approximate area of a polygon in square kilometers.
 * Uses the Shoelace formula with latitude correction.
 */
export function polygonArea(polygon: GeoPoint[]): number {
  const n = polygon.length
  if (n < 3) return 0

  let area = 0
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += polygon[i].lng * polygon[j].lat
    area -= polygon[j].lng * polygon[i].lat
  }
  area = Math.abs(area) / 2

  // Convert to approximate km² (rough conversion at Algeria's latitude)
  const latCorrection = Math.cos((polygon[0].lat * Math.PI) / 180)
  return area * 111.32 * 111.32 * latCorrection
}
