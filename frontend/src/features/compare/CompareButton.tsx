import { MAX_COMPARE, useComparison } from './CompareContext'

export default function CompareButton({ id, name }: { id: string; name: string }) {
  const { selections, toggle } = useComparison()
  const chosen = selections.some(item => item.id === id)
  const full = !chosen && selections.length >= MAX_COMPARE
  return <button className={`compare-choice ${chosen ? 'chosen' : ''}`} disabled={full}
    aria-pressed={chosen} aria-label={`${chosen ? 'Quitar de comparación' : 'Comparar'}: ${name}`}
    title={full ? 'Quita una sede para seleccionar otra.' : undefined}
    onClick={() => toggle({ id, name })}>
    <span aria-hidden="true">{chosen ? '✓' : '+'}</span> {chosen ? 'Seleccionada' : full ? 'Límite de 3 sedes' : 'Comparar sede'}
  </button>
}
