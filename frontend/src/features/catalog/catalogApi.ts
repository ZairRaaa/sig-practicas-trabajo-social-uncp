import { ApiError, getJson, postJson } from '../../services/api'
import type { CatalogFilters, CatalogPage, Center, DistrictOption } from './centers'

interface SiteResponse {
  id: string
  institution_name: string
  name: string
  category: string
  district_ubigeo: string | null
  district_name: string | null
  address: string | null
  description: string | null
  latitude: number
  longitude: number
  is_demo: boolean
  verification_status: 'pending' | 'verified'
  verified_at: string | null
  distance_m?: number | null
}
interface PageResponse { items: SiteResponse[]; total: number; limit: number; offset: number }
export const PAGE_SIZE = 12

function toCenter(site: SiteResponse): Center {
  if (!Number.isFinite(site.latitude) || !Number.isFinite(site.longitude)
    || Math.abs(site.latitude) > 90 || Math.abs(site.longitude) > 180) {
    throw new ApiError('El catálogo contiene una ubicación no válida. Es necesario corregir el registro.')
  }
  return {
    id: site.id, name: site.name, institution: site.institution_name,
    district: site.district_name || 'Distrito pendiente', districtCode: site.district_ubigeo,
    type: site.category, coordinates: [site.latitude, site.longitude],
    description: site.description || 'Sin descripción registrada.', address: site.address,
    isDemo: site.is_demo, verificationStatus: site.verification_status, verifiedAt: site.verified_at,
    distanceM: site.distance_m ?? null,
  }
}

export async function loadCatalog(filters: CatalogFilters, signal: AbortSignal): Promise<CatalogPage> {
  if (filters.siteId) {
    const site = await getJson<SiteResponse>(`/sites/${encodeURIComponent(filters.siteId)}`, signal)
    return { items: [toCenter(site)], total: 1, limit: PAGE_SIZE, offset: 0 }
  }
  if (filters.origin) {
    const page = await postJson<PageResponse>('/spatial/search', {
      latitude: filters.origin[0], longitude: filters.origin[1], radius_m: filters.radiusM,
      q: filters.query.trim() || null, district: filters.district || null,
      category: filters.category || null, limit: PAGE_SIZE, offset: filters.offset,
    }, signal)
    return { ...page, items: page.items.map(toCenter) }
  }
  const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(filters.offset) })
  if (filters.query.trim()) query.set('q', filters.query.trim())
  if (filters.district) query.set('district', filters.district)
  if (filters.category) query.set('category', filters.category)
  const page = await getJson<PageResponse>(`/sites?${query}`, signal)
  return { ...page, items: page.items.map(toCenter) }
}

export function loadOptions(signal: AbortSignal) {
  return Promise.all([
    getJson<DistrictOption[]>('/districts', signal),
    getJson<string[]>('/categories', signal),
  ])
}
