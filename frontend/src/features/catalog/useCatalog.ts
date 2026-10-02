import { useEffect, useState } from 'react'
import { loadCatalog, loadOptions, PAGE_SIZE } from './catalogApi'
import type { CatalogFilters, CatalogPage, DistrictOption } from './centers'

interface CatalogState {
  key: string
  loading: boolean
  error: string | null
  page: CatalogPage
}
const emptyPage: CatalogPage = { items: [], total: 0, offset: 0, limit: PAGE_SIZE }

export function useCatalog(filters: CatalogFilters) {
  const [revision, setRevision] = useState(0)
  const key = JSON.stringify({ ...filters, revision })
  const [state, setState] = useState<CatalogState>({
    key: '', loading: true, error: null, page: emptyPage,
  })
  const [optionsRevision, setOptionsRevision] = useState(0)
  const [options, setOptions] = useState<{
    districts: DistrictOption[]; categories: string[]; optionsLoading: boolean; optionsError: string | null
  }>({ districts: [], categories: [], optionsLoading: true, optionsError: null })
  const { query, district, category, offset, siteId, radiusM } = filters
  const latitude = filters.origin?.[0] ?? null
  const longitude = filters.origin?.[1] ?? null

  useEffect(() => {
    const controller = new AbortController()
    setOptions(previous => ({ ...previous, optionsLoading: true, optionsError: null }))
    loadOptions(controller.signal).then(([districts, categories]) => {
      if (!controller.signal.aborted) {
        setOptions({ districts, categories, optionsLoading: false, optionsError: null })
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setOptions(previous => ({
        ...previous, optionsLoading: false,
        optionsError: error instanceof Error ? error.message : 'No se pudieron cargar los filtros.',
      }))
    })
    return () => controller.abort()
  }, [optionsRevision])

  useEffect(() => {
    const controller = new AbortController()
    setState(previous => ({ ...previous, key, loading: true, error: null, page: emptyPage }))
    // Debounce y cancelación para evitar resultados de una búsqueda anterior.
    const timer = window.setTimeout(() => {
      loadCatalog({ query, district, category, offset, siteId, radiusM,
        origin: latitude !== null && longitude !== null ? [latitude, longitude] : null }, controller.signal)
      .then(page => {
        if (!controller.signal.aborted) setState({ key, loading: false, error: null, page })
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) setState(previous => ({
          ...previous, key, loading: false, page: emptyPage,
          error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.',
        }))
      })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, district, category, offset, siteId, radiusM, latitude, longitude, key])

  const current = state.key === key
  return {
    ...state, ...options, loading: !current || state.loading,
    error: current ? state.error : null,
    page: current && !state.loading ? state.page : emptyPage,
    retry: () => setRevision(value => value + 1),
    retryOptions: () => setOptionsRevision(value => value + 1),
  }
}
