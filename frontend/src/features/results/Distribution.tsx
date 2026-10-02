import type { Summary } from './types'

const percent = (value: number | null) => value === null ? '—' : `${value.toLocaleString('es-PE', { maximumFractionDigits: 1 })} %`
export default function Distribution({ item, index }: { item: Summary['items'][number]; index: number }) {
  return <article className="result-item"><header><span className="result-number">{String(index + 1).padStart(2, '0')}</span><h2>{item.text}</h2></header>
    <div className="result-denominators"><span><strong>{item.valid}</strong> respuestas válidas</span><span><strong>{item.not_applicable}</strong> no aplica / no puedo evaluar</span></div>
    <div className="result-table-wrap"><table><caption className="result-caption">Distribución por alternativa · porcentajes sobre {item.valid} respuestas válidas</caption><thead><tr><th scope="col">Alternativa</th><th scope="col">Respuestas</th><th scope="col">Porcentaje</th><th scope="col"><span className="result-chart-label">Distribución</span></th></tr></thead><tbody>
      {item.distribution.map(bin => <tr key={bin.score}><th scope="row"><span className="result-score">{bin.score}</span>{bin.label}</th><td>{bin.count}</td><td>{percent(bin.percent)}</td><td className="result-bar-cell"><div className="result-bar-track" aria-hidden="true"><span style={{ width: `${bin.percent ?? 0}%` }} /></div></td></tr>)}
    </tbody></table></div>
    {!item.valid && <p className="result-note">Sin respuestas válidas para calcular porcentajes en este ítem.</p>}
  </article>
}
