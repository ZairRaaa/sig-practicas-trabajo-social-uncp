import { useEffect, useState } from 'react'
import { loadCatalog, loadOptions, PAGE_SIZE } from './catalogApi'
import type { CatalogFilters, CatalogPage, DistrictOption } from './centers'

interface CatalogState {
  key: string
  loading: boolean
  error: string | null
  page: CatalogPage
  districts: DistrictOption[]
  categories: string[]
}
const emptyPage: CatalogPage = { items: [], total: 0, offset: 0, limit: PAGE_SIZE }

export function useCatalog(filters: CatalogFilters) {
  const [revision, setRevision] = useState(0)
  const key = JSON.stringify({ ...filters, revision })
  const [state, setState] = useState<CatalogState>({
    key: '', loading: true, error: null, page: emptyPage, districts: [], categories: [],
  })
  const { query, district, category, offset, siteId } = filters

  useEffect(() => {
    const controller = new AbortController()
    setState(previous => ({ ...previous, key, loading: true, error: null, page: emptyPage }))
    // Debounce y cancelación para evitar resultados de una búsqueda anterior.
    const timer = window.setTimeout(() => {
      Promise.all([
        loadCatalog({ query, district, category, offset, siteId }, controller.signal),
        loadOptions(controller.signal),
      ]).then(([page, [districts, categories]]) => {
        if (!controller.signal.aborted) setState({ key, loading: false, error: null, page, districts, categories })
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setState(previous => ({
          ...previous, key, loading: false, page: emptyPage,
          error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.',
        }))
      })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, district, category, offset, siteId, key])

  const current = state.key === key
  return {
    ...state, loading: !current || state.loading,
    error: current ? state.error : null,
    page: current && !state.loading ? state.page : emptyPage,
    retry: () => setRevision(value => value + 1),
  }
}
