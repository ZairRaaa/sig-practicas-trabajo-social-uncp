import { useEffect, useId, useState } from 'react'
import { getJson } from '../../services/api'
import type { Choice } from './types'

interface Props { kind: 'students' | 'sites'; label: string; value: Choice | null; onChange: (value: Choice | null) => void; disabled: boolean }
export default function ChoiceField({ kind, label, value, onChange, disabled }: Props) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Choice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [more, setMore] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError(''); setItems([])
    const timer = window.setTimeout(() => {
      getJson<{ items: Choice[]; has_more: boolean }>(`/management/options?kind=${kind}&q=${encodeURIComponent(query)}`, controller.signal)
        .then(result => { if (!controller.signal.aborted) { setItems(result.items); setMore(result.has_more) } })
        .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las opciones.') })
        .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [kind, query, revision])
  return <div className="management-field"><label htmlFor={`${id}-search`}>{label}</label>
    <input id={`${id}-search`} type="search" maxLength={100} placeholder={kind === 'students' ? 'Buscar por nombre o usuario' : 'Buscar por nombre de sede'} value={query} disabled={disabled} onChange={event => setQuery(event.target.value)} />
    <label className="management-small" htmlFor={id}>Selecciona una opción</label>
    <select id={id} required value={value?.id ?? ''} disabled={disabled || loading || Boolean(error)} onChange={event => onChange(items.find(item => item.id === event.target.value) ?? null)}>
      <option value="">{loading ? 'Cargando…' : 'Seleccionar…'}</option>
      {value && !items.some(item => item.id === value.id) && <option value={value.id}>{value.label} · {value.detail}</option>}
      {items.map(item => <option key={item.id} value={item.id}>{item.label} · {item.detail}</option>)}
    </select>
    {error ? <div role="alert"><p>{error}</p><button type="button" className="view-link" onClick={() => setRevision(n => n + 1)}>Reintentar opciones</button></div> : !loading && !items.length ? <p className="management-small">No hay coincidencias. {kind === 'students' ? 'Se muestran solo cuentas estudiante activas.' : 'Se muestran solo sedes activas.'}</p> : more && !loading && <p className="management-small">Se muestran las primeras 50 opciones. Escribe un nombre más específico.</p>}
  </div>
}
