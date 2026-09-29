import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useComparison } from '../features/compare/CompareContext'
import { loadCenter } from '../features/catalog/catalogApi'
import type { Center } from '../features/catalog/centers'

type Entry = { id: string; center: Center | null; error: string | null }
const rows: { label: string; value: (center: Center) => string }[] = [
  { label: 'Institución', value: center => center.institution },
  { label: 'Distrito', value: center => center.district },
  { label: 'Ámbito de intervención', value: center => center.type },
  { label: 'Dirección', value: center => center.address || 'No registrada' },
  { label: 'Descripción', value: center => center.description },
  { label: 'Estado del registro', value: center => center.verificationStatus === 'verified' ? 'Verificado' : 'Pendiente de verificación' },
  { label: 'Fecha de verificación', value: center => {
    if (!center.verifiedAt) return 'No registrada'
    const date = new Date(center.verifiedAt)
    return Number.isNaN(date.getTime()) ? 'Fecha no disponible' : date.toLocaleDateString('es-PE')
  } },
  { label: 'Tipo de información', value: center => center.isDemo ? 'Demostración · datos ficticios' : 'Registro del catálogo' },
  { label: 'Convenio y vacantes', value: () => 'Sin información confirmada' },
  { label: 'Valoración estudiantil', value: () => 'Aún no disponible' },
]

export default function ComparePage() {
  const { selections, remove, clear } = useComparison()
  const [revision, setRevision] = useState(0)
  const ids = selections.map(site => site.id)
  const idsKey = JSON.stringify(ids)
  const requestKey = `${idsKey}:${revision}`
  const [result, setResult] = useState<{ key: string; entries: Entry[] } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const requestedIds: string[] = JSON.parse(idsKey)
    Promise.all(requestedIds.map(async (id): Promise<Entry> => {
      try { return { id, center: await loadCenter(id, controller.signal), error: null } }
      catch (error) { return { id, center: null, error: error instanceof Error ? error.message : 'No se pudo consultar la sede.' } }
    })).then(entries => { if (!controller.signal.aborted) setResult({ key: requestKey, entries }) })
    return () => controller.abort()
  }, [idsKey, requestKey])

  const entries = result?.key === requestKey ? result.entries : []
  const loading = selections.length > 0 && result?.key !== requestKey
  const hasError = entries.some(entry => entry.error)
  return <section className="compare-page" aria-labelledby="compare-title">
    <div className="compare-heading"><div><p className="eyebrow">MIRAR LAS OPCIONES, CON CONTEXTO</p><h1 id="compare-title">Un lugar junto a otro.</h1><p>Hasta tres sedes, con información comparable y datos pendientes a la vista.</p></div><Link className="view-link" to="/centros">Elegir sedes ↗</Link></div>
    {!selections.length ? <div className="compare-empty"><span aria-hidden="true">▥</span><h2>Tu comparación comienza en el catálogo</h2><p>Marca «Comparar sede» en dos o tres fichas del directorio o explorador.</p><Link className="button" to="/centros">Explorar centros ↗</Link></div> : <>
      <div className="compare-toolbar"><p role="status">{loading ? 'Actualizando información desde el catálogo…' : `${selections.length} de 3 sedes seleccionadas`}</p><div><button className="view-link" onClick={() => setRevision(value => value + 1)} disabled={loading}>Actualizar datos</button><button className="clear-filters" onClick={clear}>Vaciar selección</button></div></div>
      {selections.length === 1 && <p className="compare-hint">Añade otra sede para comparar. Puedes hacerlo desde distintas páginas del catálogo.</p>}
      {hasError && <p className="compare-warning" role="alert">Algunas sedes no pudieron consultarse. Puedes reintentar con «Actualizar datos» o retirarlas de la selección.</p>}
      {entries.some(entry => entry.center?.isDemo) && <p className="compare-warning">Esta selección incluye información ficticia. No representa centros habilitados ni resultados de investigación.</p>}
      <div className="comparison-scroll" tabIndex={0} role="region" aria-label="Tabla de comparación; desplázate horizontalmente en pantallas pequeñas" aria-busy={loading}>
        <table className="comparison-table">
          <caption>Información actual de las sedes seleccionadas</caption>
          <thead><tr><th scope="col">Aspecto</th>{selections.map((site, index) => {
            const entry = entries.find(item => item.id === site.id)
            return <th scope="col" key={site.id}><span className="comparison-number">0{index + 1}</span><h2>{entry?.center?.name || site.name}</h2><button onClick={() => remove(site.id)} aria-label={`Quitar ${site.name}`}>Quitar ×</button>{entry?.error && <p className="comparison-cell-error">{entry.error}</p>}</th>
          })}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{selections.map(site => {
            const entry = entries.find(item => item.id === site.id)
            return <td key={site.id}>{loading ? 'Cargando…' : entry?.center ? row.value(entry.center) : 'No disponible'}</td>
          })}</tr>)}
            <tr><th scope="row">Ubicación</th>{selections.map(site => <td key={site.id}>{entries.find(entry => entry.id === site.id)?.center ? <Link className="text-link" to={`/explorar?sede=${encodeURIComponent(site.id)}`}>Abrir ficha en el mapa ↗</Link> : 'No disponible'}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <aside className="compare-footnote"><strong>Comparar no es calificar.</strong> Los datos faltantes no equivalen a cero. Esta tabla no asigna puntajes ni identifica una sede ganadora. Las distancias se consultan en el explorador desde un mismo origen; no se mezclan mediciones de búsquedas diferentes.</aside>
    </>}
  </section>
}
