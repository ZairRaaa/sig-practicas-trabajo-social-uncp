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
}

export interface DistrictOption { ubigeo: string; name: string }
export interface CatalogPage { items: Center[]; total: number; limit: number; offset: number }
export interface CatalogFilters { query: string; district: string; category: string; offset: number; siteId: string | null }
