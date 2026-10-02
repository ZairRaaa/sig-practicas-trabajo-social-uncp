import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, postJson } from '../../services/api'
import ChoiceField from './ChoiceField'
import type { Choice } from './types'

export default function ExperienceForm({ token, onSaved }: { token: string; onSaved: () => void }) {
  const [student, setStudent] = useState<Choice | null>(null)
  const [site, setSite] = useState<Choice | null>(null)
  const [period, setPeriod] = useState('')
  const [reference, setReference] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!student || !site || !period.trim() || !reference.trim() || busy) return
    const controller = new AbortController(); request.current = controller
    setBusy(true); setMessage('')
    try {
      await postJson('/management/experiences', { student_id: student.id, site_id: site.id, period: period.trim(), reference: reference.trim() }, controller.signal, { 'X-CSRF-Token': token })
      if (controller.signal.aborted) return
      setMessage(`Experiencia habilitada para ${student.label} en ${site.label}.`)
      setStudent(null); setSite(null); setReference(''); onSaved()
    } catch (reason) {
      if (!controller.signal.aborted) setMessage(reason instanceof ApiError && reason.status === 409
        ? 'Ya existe una experiencia con esa estudiante, sede y periodo. Búscala en el listado para consultar o cambiar su estado.'
        : `${reason instanceof Error ? reason.message : 'No se pudo confirmar la operación.'} Actualiza el listado antes de repetir el envío.`)
    } finally { if (!controller.signal.aborted) setBusy(false) }
  }
  return <form className="management-panel" onSubmit={submit}><p className="eyebrow">NUEVA ASIGNACIÓN</p><h2>Habilitar una experiencia</h2><p className="management-small">Selecciona quién puede evaluar una sede y en qué periodo. Esta acción no crea respuestas.</p>
    <ChoiceField kind="students" label="Estudiante" value={student} onChange={setStudent} disabled={busy} />
    <ChoiceField kind="sites" label="Sede de prácticas" value={site} onChange={setSite} disabled={busy} />
    <div className="management-field"><label htmlFor="assignment-period">Periodo</label><input id="assignment-period" required maxLength={40} placeholder="Ejemplo: 2026-II" value={period} disabled={busy} onChange={event => setPeriod(event.target.value)} /><span className="management-small">Usa el periodo acordado por el equipo. Las variantes 2026-1 y 2026-2 se guardan como 2026-I y 2026-II.</span></div>
    <div className="management-field"><label htmlFor="assignment-reference">Referencia de habilitación</label><textarea id="assignment-reference" required maxLength={250} rows={3} placeholder="Para las demos: DEMO, piloto técnico" value={reference} disabled={busy} onChange={event => setReference(event.target.value)} /><span className="management-small">Registra el sustento de la asignación. No incluyas datos de personas atendidas.</span></div>
    <button className="button" disabled={busy || !student || !site || !period.trim() || !reference.trim()}>{busy ? 'Guardando…' : 'Habilitar experiencia ↗'}</button>
    {message && <p className="auth-message" role="status">{message}</p>}
  </form>
}
