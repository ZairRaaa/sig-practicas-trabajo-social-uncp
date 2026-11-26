import { useEffect } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Catalog from './features/catalog/Catalog'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ComparePage from './pages/ComparePage'
import LoginPage from './pages/LoginPage'
import AccountPage from './pages/AccountPage'
import QuestionnairePage from './pages/QuestionnairePage'
import ManagementPage from './pages/ManagementPage'
import ResultsPage from './pages/ResultsPage'
import ThemeToggle from './ThemeToggle'
import socialWorkLogo from './assets/trabajo-social-uncp.png'
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
    titles['/cuestionario'] = 'Cuestionario piloto'
    titles['/gestion'] = 'Gestión de experiencias'
    titles['/resultados'] = 'Resultados del piloto'
    document.title = `${titles[location.pathname] ?? 'Página no encontrada'} · Territorio UNCP`
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.getElementById('contenido')?.focus({ preventScroll: true })
  }, [location.pathname])

  return <div className={`app-shell ${explorer ? 'app-shell-explorer' : ''}`}>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="app-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Territorio, Trabajo Social UNCP, inicio">
          <img src={socialWorkLogo} alt="" width="50" height="50" />
          <span>Territorio<span className="brand-caption">Trabajo Social · UNCP</span></span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/explorar">Mapa</NavLink>
          <NavLink to="/centros">Directorio</NavLink>
          <NavLink to="/comparar">Comparar{selections.length > 0 && <span className="nav-count">{selections.length}</span>}</NavLink>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <NavLink className="account-link" to={auth.user ? '/cuenta' : '/acceso'}>{auth.loading ? 'Cuenta' : auth.user ? 'Mi cuenta' : 'Ingresar'}</NavLink>
        </div>
      </div>
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
        <Route path="/cuestionario" element={<QuestionnairePage />} />
        <Route path="/gestion" element={<ManagementPage />} />
        <Route path="/resultados" element={<ResultsPage />} />
        <Route path="*" element={<section className="section not-found"><h1>Página no encontrada</h1><Link className="button" to="/explorar">Abrir el mapa <span aria-hidden="true">↗</span></Link></section>} />
      </Routes>
    </main>
    <footer className="app-footer"><span>Territorio · Trabajo Social UNCP</span><Link to="/proyecto">Acerca del proyecto <span aria-hidden="true">↗</span></Link></footer>
  </div>
}

export default function App() { return <BrowserRouter><AuthProvider><CompareProvider><Application /></CompareProvider></AuthProvider></BrowserRouter> }
