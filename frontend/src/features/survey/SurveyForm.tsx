import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, postJson } from '../../services/api'
import type { Instrument, SurveyKind } from './types'

interface Props { instrument: Instrument; kind: SurveyKind; experienceId?: string; csrfToken: string | null; readOnly: boolean; onSubmitted: () => void }

export default function SurveyForm({ instrument, kind, experienceId, csrfToken, readOnly, onSubmitted }: Props) {
  const block = instrument.blocks[kind]
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState('')
  const request = useRef<AbortController | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  const count = block.items.filter(item => Object.prototype.hasOwnProperty.call(answers, item.id)).length
  const disabled = readOnly || !instrument.enabled || busy || sent
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || !csrfToken || !consent || count !== block.items.length) return
    const controller = new AbortController(); request.current = controller
    setBusy(true); setMessage('')
    try {
      await postJson('/survey/submissions', { version: instrument.version, kind, experience_id: experienceId ?? null, consent: true, answers }, controller.signal, { 'X-CSRF-Token': csrfToken })
      if (controller.signal.aborted) return
      setSent(true); setMessage('Respuesta piloto guardada. Gracias por participar.'); onSubmitted()
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof ApiError && error.status === 409
        ? 'Puede existir un envío previo o haber cambiado el instrumento. Actualiza el estado antes de volver a enviar.'
        : `${error instanceof Error ? error.message : 'No se pudo confirmar el envío.'} Actualiza el estado antes de reenviar para consultar si quedó guardado.`)
    } finally { if (!controller.signal.aborted) setBusy(false) }
  }
  return <form className="survey-form" onSubmit={submit}>
    <div className="survey-form-heading"><span className="eyebrow">{kind === 'priorities' ? '01 / PRIORIDADES' : '02 / EXPERIENCIA'}</span><h2>{block.title}</h2><p>{block.instruction}</p></div>
    <div className="survey-progress"><span>{count} de {block.items.length} ítems respondidos</span><progress max={block.items.length} value={count} aria-label="Avance del bloque" /></div>
    {block.items.map((item, index) => <fieldset className="survey-question" key={item.id} disabled={disabled}>
      <legend><span>{String(index + 1).padStart(2, '0')}</span> {item.text}</legend>
      <div className="survey-options">{block.scale.map((label, score) => <label key={label}><input type="radio" name={item.id} value={score + 1} required checked={answers[item.id] === score + 1} onChange={() => setAnswers(previous => ({ ...previous, [item.id]: score + 1 }))} /><span><b>{score + 1}</b>{label}</span></label>)}</div>
      <label className="survey-na"><input type="radio" name={item.id} value="na" required checked={Object.prototype.hasOwnProperty.call(answers, item.id) && answers[item.id] === null} onChange={() => setAnswers(previous => ({ ...previous, [item.id]: null }))} /> No aplica / no puedo evaluar</label>
    </fieldset>)}
    <div className="survey-consent"><h3>Antes de participar</h3><p>{instrument.notice}</p><label><input type="checkbox" required checked={consent} disabled={disabled} onChange={event => setConsent(event.target.checked)} /> He leído este aviso y acepto participar voluntariamente en este piloto.</label></div>
    <p className="survey-muted">Cada bloque se envía por separado y una sola vez por versión. Revisa tus respuestas: no podrás editarlas después. El borrador se pierde al cambiar de bloque o salir.</p>
    <button className="button" disabled={disabled || !csrfToken || !consent || count !== block.items.length}>{busy ? 'Guardando…' : sent ? 'Respuesta guardada' : 'Enviar este bloque ↗'}</button>
    {message && <p className="auth-message" role="status">{message}</p>}
  </form>
}
