import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Origin } from './centers'

interface Props {
  origin: Origin | null
  radiusM: number
  picking: boolean
  expanded: boolean
  onExpand: () => void
  onPick: () => void
  onOrigin: (origin: Origin) => void
  onRadius: (radius: number) => void
  onClear: () => void
}

export default function SpatialControls({ origin, radiusM, picking, expanded, onExpand, onPick, onOrigin, onRadius, onClear }: Props) {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const lat = Number(latitude), lon = Number(longitude)
    if (latitude.trim() && longitude.trim() && Number.isFinite(lat) && Number.isFinite(lon)
      && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) onOrigin([lat, lon])
  }
  return <section className="spatial-controls" aria-labelledby="spatial-title">
    <h2 id="spatial-title">Proximidad</h2>
    <div className="spatial-actions">
      <button className={`view-link ${picking ? 'picking-active' : ''}`} onClick={onPick} aria-pressed={picking}>{picking ? 'Cancelar' : origin ? 'Cambiar origen' : 'Elegir origen'}</button>
      <label>Radio<select value={radiusM} onChange={event => onRadius(Number(event.target.value))}>{[500, 1000, 2000, 3000, 5000, 10000, 20000].map(radius => <option key={radius} value={radius}>{radius < 1000 ? `${radius} m` : `${radius / 1000} km`}</option>)}</select></label>
      {origin && <button className="clear-filters" onClick={onClear}>Quitar proximidad</button>}
    </div>
    <button className="view-link map-size-toggle" aria-pressed={expanded} onClick={onExpand}>{expanded ? 'Mostrar lista' : 'Ampliar mapa'}</button>
    {(picking || origin) && <p className="spatial-status" role="status">{picking ? 'Selecciona un punto sobre el mapa.' : 'Sedes dentro del radio, ordenadas por distancia geográfica.'}</p>}
    <details className="coordinate-entry"><summary>Ingresar coordenadas</summary><form onSubmit={submit}>
      <label>Latitud<input required type="number" min={-90} max={90} step="any" placeholder="−12.06" value={latitude} onChange={event => setLatitude(event.target.value)} /></label>
      <label>Longitud<input required type="number" min={-180} max={180} step="any" placeholder="−75.21" value={longitude} onChange={event => setLongitude(event.target.value)} /></label>
      <button className="view-link" type="submit">Usar coordenadas</button>
    </form></details>
  </section>
}
