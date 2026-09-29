import { useEffect } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Catalog from './features/catalog/Catalog'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ComparePage from './pages/ComparePage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import './features/auth/auth.css'
import { CompareProvider, useComparison } from './features/compare/CompareContext'
import './features/compare/compare.css'
import './shell.css'

function Application() {
  const auth = useAuth()
  const { selections } = useComparison()
  const location = useLocation()
  const explorer = location.pathname === '/explorar'
  useEffect(() => {
    const titles: Record<string, string> = { '/': 'Inicio', '/explorar': 'Explorador geográfico', '/centros': 'Centros de prácticas', '/comparar': 'Comparador de sedes', '/proyecto': 'El proyecto' }
    titles['/acceso'] = 'Iniciar sesión'
    titles['/cuenta'] = 'Mi cuenta'
    document.title = `${titles[location.pathname] ?? 'Página no encontrada'} · Territorio UNCP`
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [location.pathname])

  return <div className={`app-shell ${explorer ? 'app-shell-explorer' : ''}`}>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="header app-header">
      <Link className="brand" to="/" aria-label="Territorio, inicio"><span className="brand-icon" aria-hidden="true">t.</span><span>territorio<span className="brand-caption">PRÁCTICAS · UNCP</span></span></Link>
      <nav aria-label="Navegación principal">
        <NavLink to="/" end>Inicio</NavLink>
        <NavLink to="/explorar">Explorador</NavLink>
        <NavLink to="/centros">Centros</NavLink>
        <NavLink to="/comparar">Comparar{selections.length ? ` (${selections.length})` : ''}</NavLink>
        <NavLink to="/proyecto">El proyecto</NavLink>
      </nav>
      <Link className="account-link" to={auth.user ? '/cuenta' : '/acceso'}>{auth.loading ? 'Cuenta' : auth.user ? 'Mi cuenta' : 'Iniciar sesión'}</Link>
    </header>
    <main id="contenido" tabIndex={-1} className={explorer ? 'explorer-main' : 'page-main'}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explorar" element={<Catalog key="explorer" mode="explorer" />} />
        <Route path="/centros" element={<Catalog key="directory" mode="directory" />} />
        <Route path="/proyecto" element={<AboutPage />} />
        <Route path="/comparar" element={<ComparePage />} />
        <Route path="/acceso" element={<LoginPage />} />
        <Route path="/cuenta" element={<AccountPage />} />
        <Route path="*" element={<section className="section not-found"><p className="eyebrow">404 / FUERA DEL RECORRIDO</p><h1>No encontramos esa página</h1><p>Puedes volver al inicio o explorar las sedes de demostración.</p><Link className="button" to="/explorar">Ir al explorador ↗</Link></section>} />
      </Routes>
    </main>
    {!explorer && <footer><span>territorio · UNCP</span><p>Información, experiencia y territorio. Trabajo Social.</p><Link to="/proyecto">Acerca del proyecto ↗</Link></footer>}
  </div>
}

export default function App() { return <BrowserRouter><AuthProvider><CompareProvider><Application /></CompareProvider></AuthProvider></BrowserRouter> }
