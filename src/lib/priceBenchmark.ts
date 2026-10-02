import type { Property, PriceBenchmark } from '@/types'

/**
 * Neighborhood Price Benchmark Engine
 * Calculates average price per m² for a wilaya + property type combination
 * and returns a trust badge indicator.
 */

interface BenchmarkResult {
  badge: PriceBenchmark
  labelFr: string
  labelAr: string
  averagePrice: number
  averagePerM2: number
}

/**
 * Calculate the price benchmark for a property against its neighborhood average.
 */
export function calculatePriceBenchmark(
  property: Property,
  allProperties: Property[]
): BenchmarkResult {
  // Filter properties in the same wilaya and property type
  const neighborhood = allProperties.filter(
    (p) =>
      p.wilayaId === property.wilayaId &&
      p.propertyType === property.propertyType &&
      p.operationType === property.operationType &&
      p.id !== property.id
  )

  // If no comparable properties, default to "fair"
  if (neighborhood.length === 0) {
    return {
      badge: 'fair',
      labelFr: 'Prix dans la moyenne',
      labelAr: 'سعر عادل ومتوسط',
      averagePrice: property.price,
      averagePerM2: property.area > 0 ? property.price / property.area : 0,
    }
  }

  // Calculate average price per m²
  const totalPerM2 = neighborhood.reduce((sum, p) => {
    return sum + (p.area > 0 ? p.price / p.area : 0)
  }, 0)
  const averagePerM2 = totalPerM2 / neighborhood.length
  const propertyPerM2 = property.area > 0 ? property.price / property.area : 0

  // Calculate ratio
  const ratio = averagePerM2 > 0 ? propertyPerM2 / averagePerM2 : 1

  // Determine badge
  let badge: PriceBenchmark
  let labelFr: string
  let labelAr: string

  if (ratio < 0.9) {
    badge = 'very_good'
    labelFr = 'Très bon prix'
    labelAr = 'سعر مناسب جداً'
  } else if (ratio <= 1.1) {
    badge = 'fair'
    labelFr = 'Prix dans la moyenne'
    labelAr = 'سعر عادل ومتوسط'
  } else {
    badge = 'premium'
    labelFr = 'Haut de gamme'
    labelAr = 'عقار فاخر'
  }

  const averagePrice = neighborhood.reduce((sum, p) => sum + p.price, 0) / neighborhood.length

  return { badge, labelFr, labelAr, averagePrice, averagePerM2 }
}
