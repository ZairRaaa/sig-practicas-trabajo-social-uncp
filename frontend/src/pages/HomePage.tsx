import { Link } from 'react-router-dom'
import panorama from '../assets/huancayo-panorama.jpg'

const actions = [
  { to: '/centros', icon: '☷', title: 'Directorio', description: 'Busca sedes por nombre, distrito o ámbito.' },
  { to: '/comparar', icon: '▥', title: 'Comparador', description: 'Revisa hasta tres fichas una al lado de la otra.' },
  { to: '/proyecto', icon: '◎', title: 'Sobre Territorio', description: 'Conoce el proyecto de Trabajo Social de la UNCP.' },
]

export default function HomePage() {
  return <div className="home-page">
    <section className="hero" aria-labelledby="home-title">
      <img className="hero-image" src={panorama} alt="" fetchPriority="high" width="1280" height="960" />
      <div className="hero-copy">
        <p className="eyebrow">Prácticas preprofesionales</p>
        <h1 id="home-title">Encuentra tu sede <em>de prácticas.</em></h1>
        <p className="intro">Explora y compara los centros de prácticas de Trabajo Social de la UNCP en Huancayo y sus alrededores.</p>
        <div className="hero-actions">
          <Link className="button hero-button" to="/explorar">Explorar el mapa <span aria-hidden="true">↗</span></Link>
          <Link className="view-link hero-secondary" to="/explorar?relieve=3d">Ver relieve 3D <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="hero-location">
        <span>Huancayo · Valle del Mantaro</span>
        <small>Foto de <a href="https://commons.wikimedia.org/wiki/File:Vista_Panor%C3%A1mica_de_la_ciudad_de_Huancayo.jpg" target="_blank" rel="noreferrer">Johann Wilde Huaman Ricaldi</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a></small>
      </div>
    </section>

    <section className="home-actions" aria-labelledby="home-actions-title">
      <h2 id="home-actions-title">Herramientas de Territorio</h2>
      <div className="home-action-grid">
        {actions.map(action => <Link key={action.to} to={action.to} className="home-action">
          <span className="home-action-icon" aria-hidden="true">{action.icon}</span>
          <div><h3>{action.title}</h3><p>{action.description}</p></div>
          <span className="action-arrow" aria-hidden="true">↗</span>
        </Link>)}
      </div>
    </section>
  </div>
}
