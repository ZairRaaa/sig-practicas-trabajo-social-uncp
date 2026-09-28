import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { centerTypes, demoCenters, districts, filterCenters } from './centers'
import CenterMap from './CenterMap'
import './catalog.css'

export default function Catalog({ mode = 'explorer' }: { mode?: 'explorer' | 'directory' }) {
  const [params] = useSearchParams()
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const [type, setType] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(() => params.get('sede'))
  const centers = useMemo(() => filterCenters(demoCenters, query, district, type), [query, district, type])
  const selected = centers.find(center => center.id === selectedId)
  const selectCenter = useCallback((id: string) => setSelectedId(id), [])
  const clear = () => { setQuery(''); setDistrict(''); setType(''); setSelectedId(null) }

  return <section className={`catalog section catalog-${mode} ${expanded ? 'map-expanded' : ''}`} id="catalogo" aria-labelledby="catalog-title">
    <div className="section-heading">
      <div><p className="eyebrow">HUANCAYO / EL TAMBO / CHILCA</p><h1 id="catalog-title">{mode === 'explorer' ? 'Explorador geográfico' : 'Directorio de centros'}</h1></div>
      <div className="catalog-actions"><Link to={mode === 'explorer' ? '/centros' : '/explorar'} className="view-link">{mode === 'explorer' ? 'Ver directorio ↗' : 'Abrir mapa ↗'}</Link>{mode === 'explorer' && <button className="view-link" onClick={() => setExpanded(value => !value)} aria-pressed={expanded}>{expanded ? 'Mostrar panel' : 'Ampliar mapa'}</button>}</div>
    </div>
    <p className="catalog-description">Explora el mapa y abre una ficha para conocer cómo se presentará cada sede.</p>
    <div className="demo-notice"><strong>Datos ficticios.</strong> Los nombres, distritos asignados y ubicaciones son ejemplos de interfaz. No representan centros habilitados ni vacantes reales.</div>

    <div className="catalog-filters" role="search" aria-label="Buscar centros">
      <label className="search-field">Buscar un centro<input type="search" placeholder="Nombre, distrito o ámbito…" value={query} onChange={event => { setQuery(event.target.value); setSelectedId(null) }} /></label>
      <label>Distrito<select value={district} onChange={event => { setDistrict(event.target.value); setSelectedId(null) }}><option value="">Todos los distritos</option>{districts.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Ámbito<select value={type} onChange={event => { setType(event.target.value); setSelectedId(null) }}><option value="">Todos los ámbitos</option>{centerTypes.map(value => <option key={value}>{value}</option>)}</select></label>
      <button className="clear-filters" onClick={clear} disabled={!query && !district && !type && !selectedId}>Limpiar</button>
    </div>

    <div className="catalog-workspace">
      <div className="catalog-list">
        <div className="results-heading"><p role="status">{centers.length} {centers.length === 1 ? 'sede de ejemplo' : 'sedes de ejemplo'}</p><span>Selecciona una ficha ↘</span></div>
        <div className="cards">
          {centers.map((center, index) => <button key={center.id} className={`center-card ${selected?.id === center.id ? 'selected' : ''}`} onClick={() => selectCenter(center.id)} aria-pressed={selected?.id === center.id} aria-controls="center-detail">
            <span className="card-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span className="card-content"><span className={`type-badge type-${center.type === 'Salud' ? 'health' : center.type === 'Educación' ? 'education' : 'community'}`}>{center.type}</span><strong>{center.name}</strong><span className="card-district">{center.district} · Ejemplo ficticio</span></span>
            <span className="card-arrow" aria-hidden="true">↗</span>
          </button>)}
          {!centers.length && <div className="no-results"><span aria-hidden="true">⌕</span><h3>No encontramos coincidencias</h3><p>Prueba otro nombre o combina menos filtros.</p><button className="button" onClick={clear}>Restablecer búsqueda</button></div>}
        </div>
      </div>
      <div className="map-column">
        {mode === 'explorer' && <CenterMap centers={centers} selectedId={selected?.id ?? null} onSelect={selectCenter} />}
        <div id="center-detail" className="center-detail" aria-live="polite">
          {selected ? <><div className="detail-top"><span className="eyebrow">FICHA DE DEMOSTRACIÓN</span><button aria-label="Cerrar ficha" onClick={() => setSelectedId(null)}>×</button></div><h3>{selected.name}</h3><p>{selected.description}</p><dl><div><dt>Distrito de ejemplo</dt><dd>{selected.district}</dd></div><div><dt>Ámbito</dt><dd>{selected.type}</dd></div><div><dt>Valoraciones</dt><dd>Sin encuestas</dd></div><div><dt>Disponibilidad</dt><dd>No verificada</dd></div></dl><p className="detail-note">Esta ficha es ficticia. La información institucional se incorporará después de verificar el padrón.</p></> : <div className="detail-placeholder"><span aria-hidden="true">◎</span><div><h3>Un punto, una historia por conocer</h3><p>Selecciona una sede en el mapa o en la lista para abrir su ficha.</p></div></div>}
          {selected && mode === 'directory' && <Link className="button detail-map-link" to={`/explorar?sede=${encodeURIComponent(selected.id)}`}>Ubicar en el mapa ↗</Link>}
        </div>
      </div>
    </div>
  </section>
}
