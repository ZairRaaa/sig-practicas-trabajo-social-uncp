import { useEffect, useState } from 'react'
import { getJson } from '../../services/api'

interface HistoryPage {
  has_more: boolean
  items: {
    id: string
    actor: string | null
    origin: string
    previous_enabled: boolean | null
    enabled: boolean
    previous_reference: string | null
    reference: string
    created_at: string
  }[]
}

function History({ id }: { id: string }) {
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const [data, setData] = useState<HistoryPage | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setData(null)
    setError('')
    getJson<HistoryPage>(`/management/experiences/${encodeURIComponent(id)}/history?offset=${offset}`, controller.signal)
      .then(page => { if (!controller.signal.aborted) setData(page) })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el historial.')
      })
    return () => controller.abort()
  }, [id, offset, revision])

  return <div className="management-history">
    <p className="management-small">Se registran cambios desde la incorporación del historial. Las operaciones anteriores no se reconstruyen.</p>
    {error ? <div role="alert"><p>{error}</p><button className="view-link" onClick={() => setRevision(value => value + 1)}>Reintentar historial</button></div>
      : !data ? <p role="status">Cargando historial…</p>
        : <>
          {!data.items.length && <p>No hay eventos registrados en esta página.</p>}
          <ol>{data.items.map(event => <li key={event.id}>
            <p><strong>{event.previous_enabled === null ? 'Asignación creada' : 'Asignación actualizada'}</strong>
              {' · '}{new Date(event.created_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })} (Lima)</p>
            <p>Responsable: {event.actor ?? 'Operador local (sin cuenta de aplicación)'} · {event.origin === 'web' ? 'Gestión web' : 'Comando local'}</p>
            <p>Estado: {event.previous_enabled === null ? 'Sin asignación' : event.previous_enabled ? 'Habilitada' : 'Deshabilitada'} → {event.enabled ? 'Habilitada' : 'Deshabilitada'}</p>
            {event.previous_reference !== null && <p>Referencia anterior: {event.previous_reference}</p>}
            <p>Referencia registrada: {event.reference}</p>
          </li>)}</ol>
          <div className="management-pagination">
            <button className="view-link" disabled={offset === 0} onClick={() => setOffset(value => Math.max(0, value - 20))}>← Más recientes</button>
            <button className="view-link" disabled={!data.has_more || offset + 20 > 100000} onClick={() => setOffset(value => value + 20)}>Más antiguos →</button>
          </div>
        </>}
  </div>
}

export default function ExperienceHistory({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  return <div className="management-history-section">
    <button className="view-link" aria-expanded={open} onClick={() => setOpen(value => !value)}>{open ? 'Ocultar historial' : 'Ver historial'}</button>
    {open && <History id={id} />}
  </div>
}
