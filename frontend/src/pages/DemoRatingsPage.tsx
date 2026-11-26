import { useState } from 'react'
import demo from '../features/results/demoExperiences.json'
import '../features/results/demo-ratings.css'

const options = [1, 2, 3, 4, 5]
const items = [
  'B1 · Orientación', 'B2 · Retroalimentación', 'B3 · Aplicación de conocimientos',
  'B4 · Aprendizaje', 'B5 · Recursos', 'B6 · Valoración general',
]
const sites = [
  { id: 'aprender', name: 'Centro Aprender', category: 'Educación' },
  { id: 'bienestar', name: 'Centro Bienestar', category: 'Salud' },
  { id: 'crecer', name: 'Centro Crecer', category: 'Educación' },
  { id: 'cuidar', name: 'Centro Cuidar', category: 'Salud' },
  { id: 'encuentro', name: 'Centro Encuentro', category: 'Comunidad' },
  { id: 'senderos', name: 'Centro Senderos', category: 'Comunidad' },
  { id: 'vinculos', name: 'Centro Vínculos', category: 'Comunidad' },
]
const formatScore = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })
const formatPercent = new Intl.NumberFormat('es-PE', { style: 'percent', maximumFractionDigits: 1 })

function summarize(values: (number | null)[]) {
  const scores = values.filter((value): value is number => value !== null).sort((first, second) => first - second)
  const valid = scores.length
  const right = Math.floor(valid / 2)
  return {
    valid,
    notApplicable: values.length - valid,
    average: valid ? scores.reduce((sum, score) => sum + score, 0) / valid : null,
    median: valid ? (scores[Math.floor((valid - 1) / 2)] + scores[right]) / 2 : null,
    counts: options.map(option => scores.filter(score => score === option).length),
  }
}

export default function DemoRatingsPage() {
  const [selection, setSelection] = useState('')
  const responses = selection ? demo.experiences.filter(row => row.site === selection) : demo.experiences
  const participants = new Set(demo.experiences.map(row => row.participant)).size
  const completed = responses.filter(row => row.status === 'Concluida').length

  return <section className="ratings-demo" aria-labelledby="ratings-demo-title">
    <header className="ratings-demo-hero">
      <p className="eyebrow">Datos · {demo.period}</p>
      <h1 id="ratings-demo-title">Valoraciones por sede</h1>
      <p>Escenario de demostración con centros y respuestas.</p>
      <dl className="ratings-demo-metrics">
        <div><dt>Invitaciones</dt><dd>{demo.invited}</dd></div>
        <div><dt>Participantes</dt><dd>{participants}</dd></div>
        <div><dt>Experiencias</dt><dd>{demo.experiences.length}</dd></div>
      </dl>
    </header>

    <section className="ratings-demo-sites" aria-labelledby="ratings-demo-sites-title">
      <h2 id="ratings-demo-sites-title">Fichas de demostración</h2>
      <p>Las estrellas muestran el promedio de B6, la valoración general de la experiencia.</p>
      <div className="ratings-demo-grid">
        {sites.map(site => {
          const rating = summarize(demo.experiences.filter(row => row.site === site.id).map(row => row.scores[5]))
          return <article className="ratings-demo-card" key={site.id}>
            <p className="ratings-demo-category">{site.category}</p>
            <h3>{site.name}</h3>
            {rating.average === null ? <p>Sin respuestas válidas de B6.</p> : <div className="ratings-demo-score">
              <span className="ratings-demo-stars" aria-hidden="true">★★★★★<span style={{ width: `${rating.average * 20}%` }}>★★★★★</span></span>
              <strong>{formatScore.format(rating.average)} / 5</strong>
            </div>}
            <p>{rating.valid} respuestas de ejemplo válidas</p>
            <a className="text-link" href="#desglose-demo" onClick={() => setSelection(site.id)} aria-label={`Ver desglose de ${site.name}`}>Ver desglose <span aria-hidden="true">↓</span></a>
          </article>
        })}
      </div>
    </section>

    <section className="ratings-demo-breakdown" id="desglose-demo" aria-labelledby="ratings-demo-breakdown-title">
      <div className="ratings-demo-heading">
        <div><h2 id="ratings-demo-breakdown-title">Desglose por pregunta</h2><p>{responses.length} experiencias · {completed} concluidas · {responses.length - completed} en curso</p></div>
        <label>Sede
          <select value={selection} onChange={event => setSelection(event.target.value)}>
            <option value="">Todas las sedes</option>
            {sites.map(site => <option value={site.id} key={site.id}>{site.name}</option>)}
          </select>
        </label>
      </div>
      <div className="ratings-demo-table-wrap" role="region" tabIndex={0} aria-label="Resultados de ejemplo por alternativa">
        <table className="ratings-demo-table">
          <caption>Frecuencia y porcentaje por alternativa. Los porcentajes se calculan sobre las respuestas válidas.</caption>
          <thead><tr><th scope="col">Ítem</th>{options.map(option => <th key={option} scope="col">{option}</th>)}<th scope="col">NA</th><th scope="col">Válidas</th><th scope="col">Mediana</th></tr></thead>
          <tbody>{items.map((item, index) => {
            const result = summarize(responses.map(row => row.scores[index]))
            return <tr key={item}><th scope="row">{item}</th>{result.counts.map((count, option) =>
              <td key={option}>{count}{result.valid > 0 && <small>{formatPercent.format(count / result.valid)}</small>}</td>,
            )}<td>{result.notApplicable}</td><td>{result.valid}</td><td>{result.median === null ? '—' : formatScore.format(result.median)}</td></tr>
          })}</tbody>
        </table>
      </div>
    </section>
  </section>
}
