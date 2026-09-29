import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CenterMap from './CenterMap'
import CenterDetails from './CenterDetails'
import { useCatalog } from './useCatalog'
import './catalog.css'

export default function Catalog({ mode = 'explorer' }: { mode?: 'explorer' | 'directory' }) {
  const [params, setParams] = useSearchParams()
  const focusedId = params.get('sede')
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [type, setType] = useState('')
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { page, loading, error, districts, categories, retry } = useCatalog({
    query, district, category: type, offset, siteId: focusedId,
  })
  const centers = page.items
  const selected = centers.find(center => center.id === (focusedId ?? selectedId))
  const selectCenter = useCallback((id: string) => setSelectedId(id), [])
  const releaseFocus = () => {
    if (focusedId) {
      const next = new URLSearchParams(params)
      next.delete('sede')
      setParams(next, { replace: true })
    }
  }
  const resetPage = () => { setOffset(0); setSelectedId(null); releaseFocus() }
  const clear = () => { setQuery(''); setDistrict(''); setType(''); resetPage() }
  const hasFilters = Boolean(query || district || type || focusedId)
  const ready = !loading && !error

  return <section className={`catalog section catalog-${mode} ${expanded ? 'map-expanded' : ''}`} id="catalogo" aria-labelledby="catalog-title">
    <div className="section-heading">
      <div><p className="eyebrow">INFORMACIÓN Y TERRITORIO / UNCP</p><h1 id="catalog-title">{mode === 'explorer' ? 'Explorador geográfico' : 'Directorio de centros'}</h1></div>
      <div className="catalog-actions"><Link to={mode === 'explorer' ? '/centros' : '/explorar'} className="view-link">{mode === 'explorer' ? 'Ver directorio ↗' : 'Abrir mapa ↗'}</Link>{mode === 'explorer' && <button className="view-link" onClick={() => setExpanded(value => !value)} aria-pressed={expanded}>{expanded ? 'Mostrar panel' : 'Ampliar mapa'}</button>}</div>
    </div>
    <p className="catalog-description">Consulta las sedes registradas y abre una ficha para conocer su información.</p>
    <div className="catalog-source"><span className="source-dot" />Fuente: catálogo de la API<span>La disponibilidad de plazas debe confirmarse con la coordinación.</span></div>
    {centers.some(center => center.isDemo) && <div className="demo-notice"><strong>Incluye datos ficticios.</strong> Las fichas etiquetadas «Demostración» y sus ubicaciones no representan centros habilitados ni vacantes reales.</div>}
    {focusedId && <div className="focused-notice">Consulta de una sede por enlace directo.<button onClick={clear}>Volver al catálogo completo</button></div>}

    <div className="catalog-filters" role="search" aria-label="Buscar centros">
      <label className="search-field">Buscar un centro<input type="search" maxLength={150} placeholder="Nombre, distrito o ámbito…" value={query} onChange={event => { setQuery(event.target.value); resetPage() }} /></label>
      <label>Distrito<select value={district} onChange={event => { setDistrict(event.target.value); resetPage() }}><option value="">Todos los distritos</option>{districts.map(value => <option key={value.ubigeo} value={value.ubigeo}>{value.name}</option>)}</select></label>
      <label>Ámbito<select value={type} onChange={event => { setType(event.target.value); resetPage() }}><option value="">Todos los ámbitos</option>{categories.map(value => <option key={value}>{value}</option>)}</select></label>
      <button className="clear-filters" onClick={clear} disabled={!hasFilters && !selectedId && !offset}>Limpiar</button>
    </div>

    {loading && <div className="catalog-feedback" role="status"><span className="loading-dot" />Consultando el catálogo…</div>}
    {error && <div className="catalog-feedback catalog-error" role="alert"><div><strong>No pudimos cargar las sedes</strong><p>{error}</p></div><button className="view-link" onClick={retry}>Reintentar</button></div>}

    <div className="catalog-workspace" aria-busy={loading}>
      <div className="catalog-list">
        <div className="results-heading"><p role="status">{ready ? `${page.total} ${page.total === 1 ? 'sede encontrada' : 'sedes encontradas'}` : 'Catálogo de sedes'}</p></div>
        <div className="cards">
          {centers.map((center, index) => <button key={center.id} className={`center-card ${selected?.id === center.id ? 'selected' : ''}`} onClick={() => selectCenter(center.id)} aria-pressed={selected?.id === center.id} aria-controls="center-detail">
            <span className="card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="card-content"><span className={`type-badge type-${center.type === 'Salud' ? 'health' : center.type === 'Educación' ? 'education' : 'community'}`}>{center.type}</span><strong>{center.name}</strong><span className="card-district">{center.district}</span><span className={`record-tag ${center.isDemo ? 'record-demo' : ''}`}>{center.isDemo ? 'Demostración' : center.verificationStatus === 'verified' ? 'Registro verificado' : 'Por verificar'}</span></span>
            <span className="card-arrow" aria-hidden="true">↗</span>
          </button>)}
          {ready && !centers.length && <div className="no-results"><span aria-hidden="true">⌕</span><h3>{hasFilters ? 'No encontramos coincidencias' : 'El catálogo está vacío'}</h3><p>{hasFilters ? 'Prueba otro nombre o combina menos filtros.' : 'Las sedes aparecerán cuando se incorporen registros a la base de datos.'}</p>{(hasFilters || offset > 0) && <button className="button" onClick={clear}>Restablecer búsqueda</button>}</div>}
        </div>
      </div>
      <div className="map-column">
        {mode === 'explorer' && <CenterMap centers={centers} selectedId={selected?.id ?? null} onSelect={selectCenter} />}
        <CenterDetails center={selected} directory={mode === 'directory'} onClose={() => { setSelectedId(null); releaseFocus() }} />
      </div>
    </div>
    {ready && !focusedId && (page.total > page.limit || offset > 0) && <nav className="catalog-pagination" aria-label="Páginas del catálogo">
      <button className="view-link" disabled={offset === 0} onClick={() => { setOffset(value => Math.max(0, value - page.limit)); setSelectedId(null) }}>← Anterior</button>
      <span>Página {Math.floor(offset / page.limit) + 1} · El mapa muestra esta página</span>
      <button className="view-link" disabled={offset + page.limit >= page.total || offset + page.limit > 100000} onClick={() => { setOffset(value => value + page.limit); setSelectedId(null) }}>Siguiente →</button>
    </nav>}
  </section>
}
