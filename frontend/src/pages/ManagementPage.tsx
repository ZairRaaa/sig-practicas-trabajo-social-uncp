import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import ExperienceForm from '../features/management/ExperienceForm'
import ExperienceList from '../features/management/ExperienceList'
import '../features/management/management.css'

function Management({ token }: { token: string }) {
  const [revision, setRevision] = useState(0)
  const refresh = () => setRevision(value => value + 1)
  return <section className="management-page"><Link className="view-link" to="/cuenta">← Mi cuenta</Link><header className="management-hero"><div><p className="eyebrow">COORDINACIÓN / EXPERIENCIAS</p><h1>Conecta cada estudiante<br />con su experiencia.</h1><p>Organiza las sedes y los periodos habilitados para participar en el cuestionario.</p></div><div className="management-hero-note"><span>01</span><strong>Selecciona</strong><span>02</span><strong>Habilita</strong><span>03</span><strong>Gestiona</strong></div></header>
    <p className="management-guidance">Las asignaciones habilitan el bloque «Mi experiencia». El bloque «Mis prioridades» no requiere una sede. La recepción del cuestionario depende de que el piloto esté abierto.</p>
    <p><Link className="view-link" to="/resultados">Consultar resultados agregados del piloto ↗</Link></p>
    <div className="management-layout"><ExperienceForm token={token} onSaved={refresh} /><ExperienceList token={token} revision={revision} onChanged={refresh} /></div>
  </section>
}

export default function ManagementPage() {
  const auth = useAuth()
  if (auth.loading) return <p className="auth-loading" role="status">Recuperando sesión…</p>
  if (auth.error) return <div className="auth-loading"><p role="alert">{auth.error}</p><button className="view-link" onClick={auth.reload}>Actualizar sesión</button></div>
  if (!auth.user || !auth.csrfToken) return <Navigate to="/acceso" replace />
  if (auth.user.role === 'student') return <section className="account-page"><h1>Área de coordinación</h1><p>Tu cuenta no tiene permisos de gestión. Puedes consultar tus experiencias desde el cuestionario.</p><Link className="button" to="/cuestionario">Ir al cuestionario ↗</Link></section>
  return <Management key={auth.user.id} token={auth.csrfToken} />
}
