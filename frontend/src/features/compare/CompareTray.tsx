import { Link } from 'react-router-dom'
import { useComparison } from './CompareContext'

export default function CompareTray() {
  const { selections, remove, clear } = useComparison()
  if (!selections.length) return null
  return <aside className="compare-tray" aria-label="Selección para comparar">
    <div><strong role="status">{selections.length} de 3 sedes seleccionadas</strong><p>Compara información sin perder tu selección al cambiar de página.</p></div>
    <div className="compare-chips">{selections.map(site => <button key={site.id} onClick={() => remove(site.id)} aria-label={`Quitar ${site.name}`} title={site.name}>{site.name}<span aria-hidden="true">×</span></button>)}</div>
    <div className="compare-tray-actions"><button className="clear-filters" onClick={clear}>Vaciar</button><Link className="button" to="/comparar">Abrir comparador ↗</Link></div>
  </aside>
}
