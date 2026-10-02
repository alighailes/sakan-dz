import L from 'leaflet'
import type { Property, MapMarker } from '@/types'

/**
 * Convert a Property to a MapMarker
 */
export function propertyToMarker(property: Property): MapMarker {
  return {
    id: property.id,
    lat: property.latitude,
    lng: property.longitude,
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
 * Filter properties within a bounding box
 */
export function filterByBoundingBox(
  properties: Property[],
  bounds: L.LatLngBounds
): Property[] {
  return properties.filter((p) => {
    return bounds.contains([p.latitude, p.longitude])
  })
}
