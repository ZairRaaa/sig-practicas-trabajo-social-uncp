import { Link } from 'react-router-dom'
import socialWorkLogo from '../assets/trabajo-social-uncp.png'

export default function AboutPage() {
  return <div className="about-page">
    <section className="about-intro">
      <div><p className="eyebrow">Facultad de Trabajo Social</p>
        <h1>Sobre Territorio</h1>
        <p>Territorio reúne información geográfica e institucional para consultar y comparar centros de prácticas preprofesionales de la Universidad Nacional del Centro del Perú.</p>
        <Link to="/explorar" className="button">Abrir el mapa <span aria-hidden="true">↗</span></Link>
      </div>
      <img src={socialWorkLogo} alt="Escudo de la carrera profesional de Trabajo Social de la UNCP" width="1024" height="1024" />
    </section>
    <div className="about-grid">
      <article><h2>Mapa y cercanía</h2><p>Elige un punto de origen y consulta las sedes dentro de un radio de distancia geográfica.</p></article>
      <article><h2>Fichas y fuentes</h2><p>Consulta el ámbito, dirección y fuentes disponibles de cada sede. La coordinación informa sobre la asignación de prácticas.</p></article>
      <article><h2>Experiencias estudiantiles</h2><p>Las cuentas habilitadas dan acceso al cuestionario. El equipo de coordinación consulta los resultados por sede y periodo.</p></article>
    </div>
  </div>
}
