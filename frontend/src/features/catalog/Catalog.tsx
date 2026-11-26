import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CenterMap from './CenterMap'
import CenterDetails from './CenterDetails'
import { useCatalog } from './useCatalog'
import { catalogPreviewEnabled } from './catalogApi'
import SpatialControls from './SpatialControls'
import { formatDistance } from './centers'
import type { Origin } from './centers'
import CompareButton from '../compare/CompareButton'
import CompareTray from '../compare/CompareTray'
import './catalog.css'

const TerrainMap = lazy(() => import('./terrain/TerrainMap'))

export default function Catalog({ mode = 'explorer' }: { mode?: 'explorer' | 'directory' }) {
  const [params, setParams] = useSearchParams()
  const focusedId = params.get('sede')
  const terrain = mode === 'explorer' && params.get('relieve') === '3d'
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [type, setType] = useState('')
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<Origin | null>(null)
  const [radiusM, setRadiusM] = useState(2000)
  const [pickingOrigin, setPickingOrigin] = useState(false)
  const { page, loading, error, districts, categories, retry, optionsLoading, optionsError, retryOptions } = useCatalog({
    query, district, category: type, offset, siteId: focusedId, origin, radiusM,
  })
  const centers = page.items
  const selected = centers.find(center => center.id === (focusedId ?? selectedId))
  const detailRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLParagraphElement>(null)
  const activeSiteId = selected?.id
  useEffect(() => {
    if (activeSiteId) detailRef.current?.focus()
  }, [activeSiteId])
  const selectCenter = useCallback((id: string) => setSelectedId(id), [])
  const releaseFocus = () => {
    if (focusedId) {
      const next = new URLSearchParams(params)
      next.delete('sede')
      setParams(next, { replace: true })
    }
  }
  const resetPage = () => { setOffset(0); setSelectedId(null); releaseFocus() }
  const clear = () => { setQuery(''); setDistrict(''); setType(''); setOrigin(null); setPickingOrigin(false); resetPage() }
  const chooseOrigin = (point: Origin) => { setOrigin(point); setPickingOrigin(false); resetPage() }
  const changeMapMode = (showTerrain: boolean) => {
    if (terrain === showTerrain) return
    const next = new URLSearchParams(params)
    if (showTerrain) {
      next.set('relieve', '3d')
      setPickingOrigin(false)
    } else {
      next.delete('relieve')
    }
    setParams(next, { replace: true })
  }
  const pickOrigin = () => {
    if (terrain) changeMapMode(false)
    setPickingOrigin(value => !value)
  }
  const hasFilters = Boolean(query || district || type || focusedId || origin)
  const ready = !loading && !error
  const closeDetail = () => {
    setExpanded(false)
    setSelectedId(null)
    releaseFocus()
    requestAnimationFrame(() => listRef.current?.focus())
  }
  const details = selected && <div className="detail-panel" ref={detailRef} tabIndex={-1}>
    <CenterDetails center={selected} directory={mode === 'directory'} onClose={closeDetail} />
  </div>

  return <section className={`catalog section catalog-${mode} ${expanded ? 'map-expanded' : ''}`} id="catalogo" aria-labelledby="catalog-title">
    <div className="section-heading catalog-heading">
      <div><p className="eyebrow">Centros de prácticas</p><h1 id="catalog-title">{mode === 'explorer' ? 'Explorador geográfico' : 'Directorio de sedes'}</h1></div>
      <nav className="catalog-views" aria-label="Vista del catálogo">
        <Link to="/explorar" aria-current={mode === 'explorer' ? 'page' : undefined}>Mapa</Link>
        <Link to="/centros" aria-current={mode === 'directory' ? 'page' : undefined}>Directorio</Link>
      </nav>
    </div>
    {catalogPreviewEnabled && <p className="catalog-source">Vista preliminar de sedes reales. Consulta plazas y asignaciones con coordinación.</p>}
    {centers.some(center => center.isDemo) && <div className="demo-notice">Las fichas marcadas «Demostración» contienen datos ficticios.</div>}
    {focusedId && <div className="focused-notice">Consulta de una sede por enlace directo.<button onClick={clear}>Volver al catálogo completo</button></div>}

    <div className="catalog-filters" role="search" aria-label="Buscar centros">
      <label className="search-field">Buscar un centro<input type="search" maxLength={150} placeholder="Nombre, distrito o ámbito…" value={query} onChange={event => { setQuery(event.target.value); resetPage() }} /></label>
      <label>Distrito<select value={district} disabled={optionsLoading} onChange={event => { setDistrict(event.target.value); resetPage() }}><option value="">Todos</option>{districts.map(value => <option key={value.ubigeo} value={value.ubigeo}>{value.name}</option>)}</select></label>
      <label>Ámbito<select value={type} disabled={optionsLoading} onChange={event => { setType(event.target.value); resetPage() }}><option value="">Todos</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <button className="clear-filters" onClick={clear} disabled={!hasFilters && !selectedId && !offset}>Limpiar filtros</button>
    </div>

    {optionsError && <div className="catalog-feedback" role="status">
      <div><strong>No se pudieron actualizar los filtros.</strong><p>{optionsError} Puedes seguir buscando por nombre y consultar las sedes.</p></div>
      <button className="view-link" onClick={retryOptions}>Reintentar filtros</button>
    </div>}

    {error && <div className="catalog-feedback catalog-error" role="alert"><div><strong>No pudimos cargar las sedes</strong><p>{error}</p></div><button className="view-link" onClick={retry}>Reintentar</button></div>}

    <div className="catalog-workspace" aria-busy={loading}>
      {mode === 'explorer' && <div className="map-column">
        <SpatialControls origin={origin} radiusM={radiusM} picking={pickingOrigin} expanded={expanded}
          terrain={terrain} onMapMode={changeMapMode} onExpand={() => setExpanded(value => !value)} onPick={pickOrigin} onOrigin={chooseOrigin}
          onRadius={radius => { setRadiusM(radius); resetPage() }}
          onClear={() => { setOrigin(null); setPickingOrigin(false); resetPage() }} />
        {terrain ? <Suspense fallback={<p className="terrain-loading" role="status">Cargando relieve del valle…</p>}>
          <TerrainMap centers={centers} selectedId={activeSiteId ?? null} onSelect={selectCenter} origin={origin} radiusM={radiusM} />
        </Suspense> : <CenterMap centers={centers} selectedId={activeSiteId ?? null} onSelect={selectCenter}
          origin={origin} radiusM={radiusM} pickingOrigin={pickingOrigin} onOrigin={chooseOrigin} />}
      </div>}
      {mode === 'explorer' && details ? details : <div className="catalog-list" id="catalog-results">
        <div className="results-heading"><p role="status" ref={listRef} tabIndex={-1}>{loading ? 'Consultando sedes…' : ready ? `${page.total} ${page.total === 1 ? 'sede encontrada' : 'sedes encontradas'}` : 'Sedes'}</p></div>
        <div className="cards">
          {centers.map((center, index) => <div key={center.id} className="catalog-card-item"><button className={`center-card ${selected?.id === center.id ? 'selected' : ''}`} onClick={() => selectCenter(center.id)} aria-pressed={selected?.id === center.id} aria-controls={selected?.id === center.id ? 'center-detail' : undefined}>
            {mode === 'explorer' && <span className={`card-number${center.coordinates ? '' : ' card-number-pending'}`} aria-hidden="true">{index + 1}</span>}
            <span className="card-content"><span className={`type-badge type-${center.type === 'Salud' ? 'health' : center.type === 'Educación' ? 'education' : 'community'}`}>{center.type}</span><strong>{center.name}</strong><span className="card-district">{center.district}</span><span className={`record-tag ${center.isDemo ? 'record-demo' : ''}`}>{center.preview ? 'Candidata' : center.isDemo ? 'Demostración' : center.verificationStatus === 'verified' ? 'Registro verificado' : 'Por verificar'}{center.preview?.coordinateReference ? ' · Ubicación referencial' : !center.coordinates && ' · Ubicación pendiente'}</span></span>
            <span className="card-tail">{center.distanceM !== null && <span className="distance-badge" aria-label={`Distancia ${center.preview?.coordinateReference ? 'aproximada' : 'geográfica'}: ${formatDistance(center.distanceM)}`}>{center.preview?.coordinateReference ? '≈ ' : ''}{formatDistance(center.distanceM)}</span>}<span className="card-arrow" aria-hidden="true">↗</span></span>
          </button><CompareButton id={center.id} name={center.name} /></div>)}
          {ready && !centers.length && <div className="no-results"><h3>{hasFilters ? 'No encontramos coincidencias' : 'El catálogo está vacío'}</h3><p>{hasFilters ? 'Prueba otro nombre o combina menos filtros.' : 'Las sedes aparecerán cuando se incorporen registros a la base de datos.'}</p>{(hasFilters || offset > 0) && <button className="button" onClick={clear}>Restablecer búsqueda</button>}</div>}
        </div>
      </div>}
      {mode === 'directory' && details}
    </div>
    <CompareTray />
    {ready && !focusedId && (page.total > page.limit || offset > 0) && <nav className="catalog-pagination" aria-label="Páginas del catálogo">
      <button className="view-link" disabled={offset === 0} onClick={() => { setOffset(value => Math.max(0, value - page.limit)); setSelectedId(null) }}>← Anterior</button>
      <span>Página {Math.floor(offset / page.limit) + 1} · El mapa muestra esta página</span>
      <button className="view-link" disabled={offset + page.limit >= page.total || offset + page.limit > 100000} onClick={() => { setOffset(value => value + page.limit); setSelectedId(null) }}>Siguiente →</button>
    </nav>}
  </section>
}
