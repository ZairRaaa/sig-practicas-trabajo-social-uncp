import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Distribution from '../features/results/Distribution'
import type { ResultOptions, Summary } from '../features/results/types'
import { getJson } from '../services/api'
import '../features/results/results.css'

function Results() {
  const [kind, setKind] = useState<'priorities' | 'experience'>('priorities')
  const [scope, setScope] = useState<'demo' | 'non_demo'>('demo')
  const [site, setSite] = useState('')
  const [period, setPeriod] = useState('')
  const [options, setOptions] = useState<ResultOptions | null>(null)
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setData(null)
    const params = new URLSearchParams({ kind })
    if (kind === 'experience') {
      params.set('scope', scope)
      if (site) params.set('site_id', site)
      if (period) params.set('period', period)
    }
    Promise.all([getJson<ResultOptions>('/results/options', controller.signal), getJson<Summary>(`/results/summary?${params}`, controller.signal)])
      .then(([nextOptions, summary]) => { if (!controller.signal.aborted) { setOptions(nextOptions); setData(summary) } })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los resultados.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [kind, scope, site, period, revision])
  const available = options?.experiences.filter(item => item.is_demo === (scope === 'demo')) ?? []
  const sites = [...new Map(available.map(item => [item.site_id, item.site_name])).entries()]
  const periods = [...new Set(available.filter(item => !site || item.site_id === site).map(item => item.period))].sort()
  return <section className="results-page"><div className="results-navigation"><Link className="view-link" to="/cuenta">← Mi cuenta</Link><Link className="view-link" to="/gestion">Gestionar experiencias ↗</Link></div>
    <header className="results-hero"><p className="eyebrow">OBSERVATORIO / CUESTIONARIO</p><h1>Escuchar también<br />es conocer el territorio.</h1><p>Una lectura descriptiva de las prioridades y experiencias registradas.</p><span className="results-pilot">DATOS PILOTO · INSTRUMENTO PENDIENTE DE REVISIÓN</span></header>
    <div className="results-tabs" role="group" aria-label="Bloque del cuestionario"><button aria-pressed={kind === 'priorities'} onClick={() => setKind('priorities')}>01 · Prioridades</button><button aria-pressed={kind === 'experience'} onClick={() => setKind('experience')}>02 · Experiencias</button></div>
    <div className="results-filters">{kind === 'experience' ? <>
      <div><label htmlFor="result-scope">Tipo de sede</label><select id="result-scope" value={scope} onChange={event => { setScope(event.target.value as 'demo' | 'non_demo'); setSite(''); setPeriod('') }}><option value="demo">Sedes de demostración</option><option value="non_demo">Sedes no demo · respuestas piloto</option></select></div>
      <div><label htmlFor="result-site">Sede</label><select id="result-site" disabled={loading || Boolean(error)} value={site} onChange={event => { setSite(event.target.value); setPeriod('') }}><option value="">Todas las sedes de este tipo</option>{sites.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div>
      <div><label htmlFor="result-period">Periodo</label><select id="result-period" disabled={loading || Boolean(error)} value={period} onChange={event => setPeriod(event.target.value)}><option value="">Todos los periodos</option>{periods.map(value => <option key={value} value={value}>{value}</option>)}</select></div>
    </> : <p>Las prioridades no están asociadas a una sede ni a un periodo de prácticas.</p>}<button className="view-link" disabled={loading} onClick={() => setRevision(value => value + 1)}>Actualizar resultados</button></div>
    {loading ? <p className="results-empty" role="status">Calculando resultados del bloque seleccionado…</p> : error ? <div className="results-empty" role="alert"><p>{error}</p><button className="view-link" onClick={() => setRevision(value => value + 1)}>Reintentar</button></div> : data && <>
      <div className="results-metrics"><article><span>Envíos incluidos</span><strong>{data.submissions}</strong><small>{kind === 'experience' ? 'Una respuesta por experiencia y versión' : 'Una respuesta por estudiante y versión'}</small></article><article><span>Participantes únicas</span><strong>{data.participants}</strong><small>Dentro de la selección actual</small></article><article><span>Ítems del bloque</span><strong>{data.items.length}</strong><small>Escala de 1 a 5 y opción no aplica</small></article></div>
      <div className="results-reading"><h2>Cómo leer estos resultados</h2><p>Cada porcentaje utiliza únicamente las respuestas válidas de ese ítem. «No aplica / no puedo evaluar» se cuenta por separado y nunca equivale a cero. Los porcentajes pueden no sumar exactamente 100 % por redondeo.</p><p>{kind === 'experience' ? 'Una estudiante puede aportar varias experiencias; por eso los envíos no equivalen necesariamente a personas distintas. Se incluyen envíos históricos aunque la asignación o cuenta se haya deshabilitado.' : 'Este bloque reúne preferencias declaradas; no mide la calidad de una sede ni la satisfacción con las prácticas.'}</p><p>Estos datos piloto no representan resultados definitivos ni permiten establecer causalidad o un ranking de sedes. Las celdas pequeñas pueden permitir inferencias sobre personas; el acceso a esta vista está restringido a coordinación y administración.</p></div>
      {data.excluded > 0 && <p className="results-warning" role="status">{data.excluded} envíos excluidos por estructura o instrumento incompatible con la versión actual. No forman parte de los conteos mostrados.</p>}
      {!data.submissions ? <div className="results-empty"><h2>Todavía no hay respuestas incluidas</h2><p>Cuando una estudiante envíe este bloque, aparecerá aquí al actualizar. Para experiencias, revisa también el tipo de sede, la sede y el periodo seleccionados.</p></div> : <div className="results-items">{data.items.map((item, index) => <Distribution key={item.id} item={item} index={index} />)}</div>}
      <p className="results-footnote">Versión {data.version} · Calculado el {new Date(data.generated_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Lima). Solo registros piloto. No se muestran nombres ni respuestas individuales.</p>
    </>}
  </section>
}

export default function ResultsPage() {
  const auth = useAuth()
  if (auth.loading) return <p className="auth-loading" role="status">Recuperando sesión…</p>
  if (auth.error) return <div className="auth-loading"><p role="alert">{auth.error}</p><button className="view-link" onClick={auth.reload}>Actualizar sesión</button></div>
  if (!auth.user) return <Navigate to="/acceso" replace />
  if (auth.user.role === 'student') return <section className="account-page"><h1>Resultados de coordinación</h1><p>Esta vista está disponible para administración y coordinación.</p><Link className="button" to="/cuenta">Volver a mi cuenta</Link></section>
  return <Results key={auth.user.id} />
}
