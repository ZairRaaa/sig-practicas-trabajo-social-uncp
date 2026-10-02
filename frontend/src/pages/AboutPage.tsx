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
      <article><span className="step-number">01</span><h2>El territorio</h2><p>Explora las sedes, selecciona un punto y consulta cuáles están dentro de un radio. Las distancias son geográficas; no representan recorridos ni tiempos de viaje.</p></article>
      <article><span className="step-number">02</span><h2>Las experiencias</h2><p>El cuestionario piloto recoge prioridades y experiencias de estudiantes con acceso habilitado. Coordinación consulta los resultados por sede y periodo; las valoraciones aún no se publican en las fichas.</p></article>
      <article><span className="step-number">03</span><h2>La información</h2><p>Las fichas distinguen sedes demo, estado de verificación, fecha y referencia pública cuando están registrados. Confirma convenios y disponibilidad con la coordinación.</p></article>
    </div>
    <section className="about-status"><div><p className="eyebrow">DÓNDE ESTAMOS</p><h2>Un prototipo en etapa piloto</h2></div><p>Se han implementado el catálogo, la búsqueda espacial, el comparador, el acceso por roles, la gestión de experiencias y los resultados del cuestionario piloto. Quedan pendientes la validación técnica, el padrón real y la revisión académica antes del trabajo de campo. Los datos de demostración son ficticios y el piloto no constituye resultados definitivos de investigación.</p></section>
  </div>
}
