export const districts = ['El Tambo', 'Huancayo', 'Chilca'] as const
export const centerTypes = ['Salud', 'Educación', 'Comunidad'] as const

export interface Center {
  id: string
  name: string
  district: typeof districts[number]
  type: typeof centerTypes[number]
  coordinates: [number, number] // Leaflet: latitude, longitude; synthetic locations.
  description: string
}

// Fictional fixtures only. None of these records represents an authorized institution.
export const demoCenters: Center[] = [
  { id: 'demo-01', name: 'Centro demo · Aprender', district: 'El Tambo', type: 'Educación', coordinates: [-12.047, -75.218], description: 'Ejemplo de una sede orientada al acompañamiento de comunidades educativas.' },
  { id: 'demo-02', name: 'Centro demo · Cuidar', district: 'El Tambo', type: 'Salud', coordinates: [-12.052, -75.226], description: 'Ejemplo de una sede de intervención social en el ámbito de la salud.' },
  { id: 'demo-03', name: 'Centro demo · Encuentro', district: 'Huancayo', type: 'Comunidad', coordinates: [-12.066, -75.205], description: 'Ejemplo de una sede dedicada al acompañamiento y participación comunitaria.' },
  { id: 'demo-04', name: 'Centro demo · Bienestar', district: 'Huancayo', type: 'Salud', coordinates: [-12.075, -75.212], description: 'Ejemplo de una sede de orientación social y bienestar familiar.' },
  { id: 'demo-05', name: 'Centro demo · Crecer', district: 'Chilca', type: 'Educación', coordinates: [-12.086, -75.204], description: 'Ejemplo de una sede de acompañamiento educativo y familiar.' },
  { id: 'demo-06', name: 'Centro demo · Vínculos', district: 'Chilca', type: 'Comunidad', coordinates: [-12.094, -75.211], description: 'Ejemplo de una sede para iniciativas de desarrollo comunitario.' },
]

export function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim()
}

export function filterCenters(centers: Center[], query: string, district: string, type: string) {
  const search = normalizeSearch(query)
  return centers.filter(center =>
    (!district || center.district === district) &&
    (!type || center.type === type) &&
    normalizeSearch(`${center.name} ${center.district} ${center.type}`).includes(search),
  )
}
