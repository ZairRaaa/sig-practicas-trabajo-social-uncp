import { Link } from 'react-router-dom'

const steps = [
  { number: '01', title: 'Explora el territorio', text: 'Consulta las sedes y su ubicación en el ámbito de estudio.' },
  { number: '02', title: 'Compara con contexto', text: 'Revisa proximidad, condiciones y experiencias por periodo.' },
  { number: '03', title: 'Decide con información', text: 'Confirma requisitos y disponibilidad con la coordinación de prácticas.' },
]

export default function HomePage() { return <>
        <section className="hero" id="inicio" aria-labelledby="titulo">
          <div className="hero-copy">
            <p className="eyebrow">TRABAJO SOCIAL / UNCP</p>
            <h1 id="titulo">Tu próximo paso,<br /><em>en el territorio.</em></h1>
            <p className="intro">Un espacio para conocer y comparar los centros de prácticas preprofesionales de Trabajo Social.</p>
            <Link className="button" to="/explorar">Abrir el explorador <span aria-hidden="true">↗</span></Link>
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



        <section className="section guide" id="guia" aria-labelledby="guide-title">
          <p className="eyebrow">UNA ELECCIÓN INFORMADA</p>
          <h2 id="guide-title">Del lugar a la experiencia</h2>
          <p className="section-description">Explora la demostración para conocer cómo se organizará la consulta.</p>
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
</> }

