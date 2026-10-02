import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { roleLabels, useAuth } from '../features/auth/AuthContext'

export default function AccountPage() {
  const auth = useAuth()
  const request = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => () => request.current?.abort(), [])
  const action = async () => {
    const controller = new AbortController(); request.current = controller
    setBusy(true); setMessage(null)
    try {
      await auth.signOut(controller.signal)
    } catch (reason) {
      if (!controller.signal.aborted) setMessage(reason instanceof Error ? reason.message : 'No se pudo completar la acción.')
    } finally { if (!controller.signal.aborted) setBusy(false) }
  }
  if (auth.loading) return <p className="auth-loading" role="status">Recuperando sesión…</p>
  if (auth.error) return <div className="auth-loading"><p role="alert">{auth.error}</p><button className="view-link" onClick={auth.reload}>Reintentar</button></div>
  if (!auth.user) return <Navigate to="/acceso" replace />
  return <section className="account-page"><p className="eyebrow">MI CUENTA / TERRITORIO</p><h1>Hola, {auth.user.display_name}.</h1><p className="account-intro">Este es tu espacio de acceso al proyecto.</p>
    <div className="account-grid"><article className="auth-card"><h2>Tu perfil</h2><dl><dt>Usuario</dt><dd>{auth.user.username}</dd><dt>Rol</dt><dd>{roleLabels[auth.user.role]}</dd></dl><button className="view-link" disabled={busy} onClick={action}>Cerrar sesión</button></article>
      <article className="auth-card"><h2>Participación y permisos</h2><p>{auth.user.role === 'student' ? 'Consulta el cuestionario piloto y las experiencias habilitadas para tu cuenta. Participar es voluntario.' : 'Gestiona las experiencias de las estudiantes y consulta el instrumento piloto. Los envíos están reservados a cuentas de estudiante.'}</p>
        <Link className="button" to="/cuestionario">{auth.user.role === 'student' ? 'Ir al cuestionario' : 'Consultar instrumento'} ↗</Link>
        {auth.user.role !== 'student' && <p><Link className="button" to="/gestion">Gestionar experiencias ↗</Link></p>}
        {auth.user.role !== 'student' && <p><Link className="view-link" to="/resultados">Ver resultados del piloto ↗</Link></p>}
      </article></div>
    {message && <div className="auth-message" role="status"><p>{message}</p><button className="view-link" disabled={busy} onClick={auth.reload}>Actualizar sesión</button></div>}
  </section>
}
