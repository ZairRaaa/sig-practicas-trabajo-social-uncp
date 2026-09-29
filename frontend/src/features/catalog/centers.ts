export interface Center {
  id: string
  name: string
  institution: string
  district: string
  districtCode: string | null
  type: string
  coordinates: [number, number] // Leaflet: latitude, longitude.
  description: string
  address: string | null
  isDemo: boolean
  verificationStatus: 'pending' | 'verified'
  verifiedAt: string | null
  distanceM: number | null
}

export interface DistrictOption { ubigeo: string; name: string }
export interface CatalogPage { items: Center[]; total: number; limit: number; offset: number }
export type Origin = [latitude: number, longitude: number]
export interface CatalogFilters { query: string; district: string; category: string; offset: number; siteId: string | null; origin: Origin | null; radiusM: number }

export function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toLocaleString('es-PE', { maximumFractionDigits: 2 })} km`
}
