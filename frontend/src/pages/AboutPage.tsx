import { Link } from 'react-router-dom'

export default function AboutPage() {
  return <div className="about-page">
    <section className="about-intro">
      <p className="eyebrow">EL PROYECTO / TRABAJO SOCIAL</p>
      <h1>Conectar lugares.<br /><em>Comprender experiencias.</em></h1>
      <p>Territorio busca reunir información geográfica e institucional para apoyar la consulta de centros de prácticas preprofesionales de Trabajo Social de la UNCP.</p>
      <Link to="/explorar" className="button">Conocer el explorador ↗</Link>
    </section>
    <div className="about-grid">
      <article><span className="step-number">01</span><h2>El territorio</h2><p>Ubicación de las sedes y, en una siguiente fase, consultas de proximidad con PostgreSQL y PostGIS. La distancia geográfica se distinguirá del recorrido real.</p></article>
      <article><span className="step-number">02</span><h2>Las experiencias</h2><p>Un cuestionario recogerá prioridades y experiencias de las estudiantes. Las valoraciones se mostrarán con su periodo y cantidad de respuestas.</p></article>
      <article><span className="step-number">03</span><h2>La información</h2><p>El padrón institucional permitirá identificar sedes y registrar la fuente y fecha de sus datos. La disponibilidad deberá confirmarse con la coordinación.</p></article>
    </div>
    <section className="about-status"><div><p className="eyebrow">DÓNDE ESTAMOS</p><h2>Una aplicación en construcción</h2></div><p>Esta versión permite explorar sedes ficticias y consultar sus fichas. Aún no contiene padrón verificado, respuestas de encuestas ni vacantes reales. El acceso, los cuestionarios y las funciones administrativas se incorporarán progresivamente.</p></section>
  </div>
}
