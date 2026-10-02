import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, getJson, postJson } from '../../services/api'
import type { ExperienceRow } from './types'
import ExperienceHistory from './ExperienceHistory'

function StateEditor({ row, token, onSaved, onCancel }: { row: ExperienceRow; token: string; onSaved: () => void; onCancel: () => void }) {
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !reference.trim()) return
    const controller = new AbortController(); request.current = controller
    setBusy(true); setError('')
    try {
      await postJson(`/management/experiences/${row.id}/state`, { enabled: !row.enabled, expected_enabled: row.enabled, reference: reference.trim() }, controller.signal, { 'X-CSRF-Token': token })
      if (!controller.signal.aborted) onSaved()
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof ApiError && reason.status === 409 ? 'Otra operación cambió el estado. Cancela y actualiza el listado.' : `${reason instanceof Error ? reason.message : 'No se pudo confirmar el cambio.'} Consulta el estado actualizado antes de repetirlo.`)
    } finally { if (!controller.signal.aborted) setBusy(false) }
  }
  return <form className="management-state-form" onSubmit={submit}><p>{row.enabled ? 'Se bloquearán nuevos envíos para esta experiencia. Las respuestas anteriores se conservan.' : 'La estudiante podrá responder si todavía no envió este bloque y la recepción del piloto está abierta.'}</p>
    <label htmlFor={`reason-${row.id}`}>Motivo del cambio</label><textarea id={`reason-${row.id}`} required maxLength={250} rows={2} disabled={busy} value={reference} onChange={event => setReference(event.target.value)} />
    <p className="management-small">Este motivo será la referencia vigente. El historial conservará la referencia anterior y el responsable del cambio.</p>
    <div className="management-actions"><button className="button" disabled={busy || !reference.trim()}>{busy ? 'Guardando…' : row.enabled ? 'Confirmar deshabilitación' : 'Confirmar habilitación'}</button><button className="view-link" type="button" disabled={busy} onClick={onCancel}>Cancelar</button></div>
    {error && <p role="alert">{error}</p>}
  </form>
}

export default function ExperienceList({ token, revision, onChanged }: { token: string; revision: number; onChanged: () => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<{ total: number; items: ExperienceRow[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setEditing(null)
    const params = new URLSearchParams({ q: query, offset: String(offset), limit: '10' })
    if (filter !== 'all') params.set('enabled', filter)
    const timer = window.setTimeout(() => {
      getJson<{ total: number; items: ExperienceRow[] }>(`/management/experiences?${params}`, controller.signal)
        .then(result => { if (!controller.signal.aborted) { if (!result.items.length && offset > 0) setOffset(Math.max(0, offset - 10)); else setData(result) } })
        .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el listado.') })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [query, filter, offset, revision])
  return <section className="management-register" aria-label="Experiencias registradas"><div className="management-register-heading"><div><p className="eyebrow">REGISTRO DE EXPERIENCIAS</p><h2>Asignaciones y acceso</h2></div><button className="view-link" disabled={loading || editing !== null} onClick={onChanged}>Actualizar listado</button></div>
    <div className="management-filters"><div><label htmlFor="assignment-search">Buscar asignación</label><input id="assignment-search" type="search" maxLength={100} placeholder="Estudiante, usuario, sede o periodo" value={query} disabled={editing !== null} onChange={event => { setQuery(event.target.value); setOffset(0) }} /></div><div><label htmlFor="assignment-status">Estado</label><select id="assignment-status" value={filter} disabled={editing !== null} onChange={event => { setFilter(event.target.value); setOffset(0) }}><option value="all">Todos</option><option value="true">Habilitadas</option><option value="false">Deshabilitadas</option></select></div></div>
    {notice && <p className="auth-message" role="status">{notice}</p>}
    {loading ? <p className="management-empty" role="status">Cargando experiencias…</p> : error ? <p className="management-empty" role="alert">{error}</p> : data && <>
      <p className="management-small">{data.total} asignaciones coinciden con los filtros.</p>
      {!data.items.length && <div className="management-empty"><h3>Aún no hay asignaciones para mostrar</h3><p>Crea una experiencia con el formulario o cambia los filtros de búsqueda.</p></div>}
      {data.items.map(row => <article key={row.id} className="management-row"><div className="management-row-heading"><div><h3>{row.student_name}</h3><span className="management-small">@{row.username}</span></div><span className={`management-badge ${row.enabled ? 'enabled' : ''}`}>{row.enabled ? 'Habilitada' : 'Deshabilitada'}</span></div>
        <p className="management-site">{row.site_name} {row.is_demo && <span className="management-demo">DEMO</span>}</p><p className="management-small">Periodo: <strong>{row.period}</strong></p><p className="management-reference">{row.reference}</p>
        {!row.eligible && <p className="management-warning">La cuenta estudiante o la sede no están activas. Esta experiencia no admite nuevos envíos.</p>}
        <ExperienceHistory key={`${row.id}-${revision}`} id={row.id} />
        {editing === row.id ? <StateEditor row={row} token={token} onCancel={() => setEditing(null)} onSaved={() => { setNotice(`Estado actualizado para ${row.student_name}, periodo ${row.period}.`); setEditing(null); onChanged() }} /> : <button className="view-link" disabled={editing !== null || (!row.enabled && !row.eligible)} onClick={() => { setEditing(row.id); setNotice('') }}>{row.enabled ? 'Deshabilitar experiencia' : 'Volver a habilitar'}</button>}
      </article>)}
      {data.total > 0 && <div className="management-pagination"><button className="view-link" disabled={offset === 0 || editing !== null} onClick={() => setOffset(n => Math.max(0, n - 10))}>← Anterior</button><span>{offset + 1}–{Math.min(offset + 10, data.total)} de {data.total}</span><button className="view-link" disabled={offset + 10 >= data.total || editing !== null} onClick={() => setOffset(n => n + 10)}>Siguiente →</button></div>}
    </>}
  </section>
}
