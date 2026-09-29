import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import SurveyForm from '../features/survey/SurveyForm'
import type { Instrument, Participation, SurveyKind } from '../features/survey/types'
import { getJson } from '../services/api'
import '../features/survey/survey.css'

export default function QuestionnairePage() {
  const auth = useAuth()
  if (auth.loading) return <p className="auth-loading" role="status">Recuperando sesión…</p>
  if (auth.error) return <div className="auth-loading"><p role="alert">{auth.error}</p><button className="view-link" onClick={auth.reload}>Actualizar sesión</button></div>
  if (!auth.user) return <Navigate to="/acceso" replace />
  return <Questionnaire key={auth.user.id} student={auth.user.role === 'student'} csrfToken={auth.csrfToken} />
}

function Questionnaire({ student, csrfToken }: { student: boolean; csrfToken: string | null }) {
  const [data, setData] = useState<{ instrument: Instrument; participation: Participation | null } | null>(null)
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [kind, setKind] = useState<SurveyKind>('priorities')
  const [experienceId, setExperienceId] = useState('')
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    Promise.all([getJson<Instrument>('/survey/instrument', controller.signal), student ? getJson<Participation>('/survey/participation', controller.signal) : Promise.resolve(null)])
      .then(([instrument, participation]) => { if (!controller.signal.aborted) setData({ instrument, participation }) })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el cuestionario.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision, student])
  const experience = data?.participation?.experiences.find(item => item.id === experienceId)
  const submitted = kind === 'priorities' ? data?.participation?.priorities_submitted : experience?.submitted
  return <section className="survey-page">
    <Link className="view-link" to="/cuenta">← Mi cuenta</Link>
    <header className="survey-hero"><div><p className="eyebrow">PARTICIPACIÓN / TRABAJO SOCIAL</p><h1>Tu perspectiva<br />también cuenta.</h1><p>Comparte tus prioridades y, cuando corresponda, tu experiencia en una sede de prácticas.</p></div><div className="survey-stamp"><strong>Piloto</strong><span>Instrumento pendiente de revisión académica</span></div></header>
    {saved && <p className="auth-message" role="status">Tu respuesta piloto fue guardada correctamente.</p>}
    <div className="survey-toolbar"><span>Dos bloques independientes · participación voluntaria</span><button className="view-link" disabled={loading} onClick={() => setRevision(value => value + 1)}>Actualizar estado</button></div>
    {loading ? <p role="status">Cargando instrumento y participación…</p> : error ? <div className="auth-message" role="alert"><p>{error}</p><Link to="/cuenta">Volver a mi cuenta</Link></div> : data && <>
      {!student && <p className="survey-notice">Vista de consulta. Las cuentas de administración y coordinación no envían respuestas.</p>}
      {!data.instrument.enabled && <p className="survey-notice">La recepción del piloto está cerrada. Puedes consultar las preguntas.</p>}
      <div className="survey-layout"><aside className="survey-sidebar"><p className="eyebrow">TU RECORRIDO</p>
        <button className={kind === 'priorities' ? 'selected' : ''} aria-pressed={kind === 'priorities'} onClick={() => setKind('priorities')}><b>01 · Mis prioridades</b><span>{data.participation?.priorities_submitted ? 'Respuesta registrada' : 'No requiere una experiencia asignada'}</span></button>
        <button className={kind === 'experience' ? 'selected' : ''} aria-pressed={kind === 'experience'} onClick={() => setKind('experience')}><b>02 · Mi experiencia</b><span>Una respuesta por sede y periodo habilitados</span></button>
        <p className="survey-muted">Versión {data.instrument.version}. Los registros de este piloto no son resultados definitivos de la investigación.</p>
      </aside><div>
        {kind === 'experience' && student && <div className="survey-target"><label htmlFor="experience">Elige tu experiencia habilitada</label><select id="experience" value={experienceId} onChange={event => setExperienceId(event.target.value)}><option value="">Selecciona una sede y periodo</option>{data.participation?.experiences.map(item => <option key={item.id} value={item.id}>{item.site_name} · {item.period}{item.is_demo ? ' · DEMO' : ''}{item.submitted ? ' · Respondida' : ''}</option>)}</select>
          {!data.participation?.experiences.length && <p>Aún no tienes experiencias habilitadas. Solicita a coordinación que registre tu sede y periodo. Puedes responder el bloque de prioridades.</p>}
          {experience?.is_demo && <p>Esta sede es de demostración. Su evaluación solo sirve para el piloto técnico.</p>}
        </div>}
        {submitted ? <article className="survey-complete"><span aria-hidden="true">✓</span><h2>Respuesta registrada</h2><p>Ya participaste en este bloque para la versión actual. Gracias por compartir tu perspectiva.</p></article> : kind === 'experience' && student && !experience ? <p className="survey-notice">Selecciona una experiencia para ver sus preguntas.</p> : <SurveyForm key={`${data.instrument.version}-${kind}-${experienceId}`} instrument={data.instrument} kind={kind} experienceId={kind === 'experience' ? experienceId || undefined : undefined} csrfToken={csrfToken} readOnly={!student} onSubmitted={() => { setSaved(true); setRevision(value => value + 1) }} />}
      </div></div>
    </>}
  </section>
}
