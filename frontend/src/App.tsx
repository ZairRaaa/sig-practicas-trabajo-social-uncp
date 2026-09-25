const steps = [
  { number: '01', title: 'Explora el territorio', text: 'Consulta las sedes y su ubicación en el ámbito de estudio.' },
  { number: '02', title: 'Compara con contexto', text: 'Revisa proximidad, condiciones y experiencias por periodo.' },
  { number: '03', title: 'Decide con información', text: 'Confirma requisitos y disponibilidad con la coordinación de prácticas.' },
]

export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Territorio, inicio">
          <span className="brand-icon" aria-hidden="true">t.</span>
          <span>territorio<span className="brand-caption">PRÁCTICAS · UNCP</span></span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#catalogo">Centros de prácticas</a>
          <a href="#guia">Cómo funciona</a>
        </nav>
        <span className="version">Versión inicial</span>
      </header>

      <main id="contenido">
        <section className="hero" id="inicio" aria-labelledby="titulo">
          <div className="hero-copy">
            <p className="eyebrow">TRABAJO SOCIAL / UNCP</p>
            <h1 id="titulo">Tu próximo paso,<br /><em>en el territorio.</em></h1>
            <p className="intro">Un espacio para conocer y comparar los centros de prácticas preprofesionales de Trabajo Social.</p>
            <a className="button" href="#catalogo">Explorar centros <span aria-hidden="true">↗</span></a>
            <p className="scope">Ámbito propuesto · Huancayo, El Tambo y Chilca</p>
          </div>
          <div className="territory-art" aria-hidden="true">
            <div className="contour contour-one" />
            <div className="contour contour-two" />
            <div className="contour contour-three" />
            <span className="art-coordinate">EXPLORAR / CONOCER / COMPARAR</span>
            <div className="art-center">Un lugar para<br /><i>aprender haciendo.</i></div>
            <span className="art-note">TRABAJO SOCIAL EN EL TERRITORIO</span>
          </div>
        </section>

        <section className="catalog section" id="catalogo" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div><p className="eyebrow">DIRECTORIO INSTITUCIONAL</p><h2 id="catalog-title">Centros de prácticas</h2></div>
            <span className="status"><span aria-hidden="true" />Padrón pendiente</span>
          </div>
          <div className="empty-state">
            <span className="empty-symbol" aria-hidden="true">◎</span>
            <h3>Estamos preparando el catálogo</h3>
            <p>Las sedes aparecerán cuando se incorpore y verifique el padrón institucional. Aún no hay centros ni valoraciones disponibles en esta versión.</p>
            <a className="text-link" href="#guia">Conoce cómo consultar la información <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="section guide" id="guia" aria-labelledby="guide-title">
          <p className="eyebrow">UNA ELECCIÓN INFORMADA</p>
          <h2 id="guide-title">Del lugar a la experiencia</h2>
          <p className="section-description">Así se organizará la consulta cuando el catálogo esté disponible.</p>
          <div className="steps">
            {steps.map(step => (
              <article key={step.number} className="step">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3><p>{step.text}</p>
              </article>
            ))}
          </div>
          <aside className="notice"><strong>La información necesita contexto.</strong> La cercanía geográfica no equivale al tiempo de viaje. Un centro registrado no garantiza convenio vigente ni vacantes.</aside>
        </section>
      </main>
      <footer><span>territorio · UNCP</span><p>Proyecto académico de consulta de centros de prácticas de Trabajo Social.</p></footer>
    </>
  )
}
