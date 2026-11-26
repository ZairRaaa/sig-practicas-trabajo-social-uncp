import { latLng } from 'leaflet'
import { ApiError } from '../../services/api'
import type { CatalogFilters, CatalogPage, Center, DistrictOption } from './centers'
import records from './previewSites.json'

const centers: Center[] = records.map(record => ({
  id: record.id,
  name: record.name,
  institution: record.institution,
  district: record.district,
  districtCode: record.districtCode,
  type: record.type,
  coordinates: record.latitude === null || record.longitude === null ? null : [record.latitude, record.longitude],
  description: record.description,
  address: record.address,
  isDemo: false,
  verificationStatus: 'pending',
  verifiedAt: null,
  publicSource: null,
  distanceM: null,
  preview: { relationship: record.relationship, sources: record.sources, photo: record.photo },
}))

function searchKey(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function findCenter(id: string): Center {
  const center = centers.find(record => record.id === id)
  if (!center) throw new ApiError('La sede no está disponible en esta vista previa.', 404)
  return center
}

export function findPage(filters: CatalogFilters, limit: number): CatalogPage {
  const { siteId, query, district, category, origin, radiusM, offset } = filters
  if (siteId) return { items: [findCenter(siteId)], total: 1, offset: 0, limit }

  const term = searchKey(query)
  let items = centers.filter(center =>
    (!district || center.districtCode === district) && (!category || center.type === category)
    && searchKey([center.name, center.institution, center.district, center.type].join(' ')).includes(term),
  )
  if (origin) {
    const start = latLng(origin)
    items = items.flatMap(center => center.coordinates
      ? [{ ...center, distanceM: start.distanceTo(center.coordinates) }]
      : [])
      .filter(center => center.distanceM <= radiusM)
      .sort((first, second) => first.distanceM - second.distanceM)
  } else {
    items.sort((first, second) => first.name.localeCompare(second.name, 'es'))
  }
  return { items: items.slice(offset, offset + limit), total: items.length, offset, limit }
}

export function findOptions(): [DistrictOption[], string[]] {
  const districts = new Map(records.map(record => [record.districtCode, record.district]))
  return [Array.from(districts, ([ubigeo, name]) => ({ ubigeo, name }))
    .sort((first, second) => first.name.localeCompare(second.name, 'es')),
  [...new Set(records.map(record => record.type))].sort()]
}
