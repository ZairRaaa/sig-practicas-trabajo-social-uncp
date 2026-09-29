import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export default function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const request = useRef<AbortController | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => () => request.current?.abort(), [])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const controller = new AbortController()
    request.current = controller
    setBusy(true); setError(null)
    try {
      await auth.signIn(username.trim().toLowerCase(), password, controller.signal)
      setPassword(''); navigate('/cuenta', { replace: true })
    } catch (reason) {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo iniciar sesión.')
    } finally { if (!controller.signal.aborted) { setBusy(false); setPassword('') } }
  }

  if (auth.loading) return <p className="auth-loading" role="status">Recuperando sesión…</p>
  if (auth.user) return <Navigate to="/cuenta" replace />
  return <section className="auth-page">
    <div className="auth-story"><p className="eyebrow">TU ESPACIO EN TERRITORIO</p><h1>Una cuenta.<br /><em>Tu participación.</em></h1><p>Accede con la cuenta que te haya habilitado el equipo responsable. El catálogo y el mapa pueden consultarse sin iniciar sesión.</p><Link to="/explorar" className="text-link">Continuar explorando ↗</Link></div>
    <div className="auth-card"><h2>Iniciar sesión</h2><p>Introduce tu usuario y contraseña.</p>
      {auth.error && <p className="auth-message" role="status">{auth.error}</p>}
      <form onSubmit={submit}>
        <label htmlFor="username">Usuario</label><input id="username" autoComplete="username" required minLength={3} maxLength={80} value={username} onChange={event => setUsername(event.target.value)} disabled={busy} />
        <label htmlFor="password">Contraseña</label><div className="password-field"><input id="password" type={visible ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} value={password} onChange={event => setPassword(event.target.value)} disabled={busy} /><button type="button" aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? 'Ocultar' : 'Mostrar'}</button></div>
        {error && <p className="auth-message" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Entrar a mi cuenta ↗'}</button>
      </form>
      <p className="auth-help">¿No tienes acceso? Solicita una cuenta a la coordinación. El registro público y la recuperación de contraseña aún no están disponibles.</p>
    </div>
  </section>
}
