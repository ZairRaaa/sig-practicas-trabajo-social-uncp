import { Fragment, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Center, Origin } from '../centers'
import { drawRelief, elevationRange, initialCamera, makeProjection, radiusPoints, terrainPoint } from './terrainModel'
import './terrain.css'

interface Props {
  centers: Center[]
  selectedId: string | null
  onSelect: (id: string) => void
  origin: Origin | null
  radiusM: number
}

const meters = new Intl.NumberFormat('es-PE')
const markerOffsets = [[0, -13], ...[28, 48, 68].flatMap(radius =>
  Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4
    return [Math.cos(angle) * radius, Math.sin(angle) * radius - 13]
  }),
)]

export default function TerrainMap({ centers, selectedId, onSelect, origin, radiusM }: Props) {
  const scene = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [camera, setCamera] = useState(initialCamera)
  const [unavailable, setUnavailable] = useState(false)
  const projection = useMemo(() => makeProjection(size, camera), [size, camera])
  const outline = useMemo(() => origin ? radiusPoints(origin, radiusM) : [], [origin, radiusM])

  useLayoutEffect(() => {
    const element = scene.current
    if (!element) return
    const measure = () => setSize({ width: element.clientWidth, height: element.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const element = canvas.current
    if (!element || !size.width || !size.height) return
    const context = element.getContext('2d')
    if (!context) {
      setUnavailable(true)
      return
    }
    const frame = requestAnimationFrame(() => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const pixelWidth = Math.round(size.width * ratio)
      const pixelHeight = Math.round(size.height * ratio)
      if (element.width !== pixelWidth || element.height !== pixelHeight) {
        element.width = pixelWidth
        element.height = pixelHeight
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      drawRelief(context, size, projection.project)
      context.beginPath()
      let connected = false
      for (const sample of outline) {
        if (!sample) {
          connected = false
          continue
        }
        const point = projection.project(sample.vertex)
        if (connected) context.lineTo(point.x, point.y)
        else context.moveTo(point.x, point.y)
        connected = true
      }
      context.setLineDash([5, 4])
      context.lineWidth = 2
      context.strokeStyle = '#ffde9b'
      context.stroke()
      context.setLineDash([])
    })
    return () => cancelAnimationFrame(frame)
  }, [outline, projection, size])

  const startDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    if (event.button !== 0 || drag.current) return
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const moveDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    const previous = drag.current
    if (!previous || previous.id !== event.pointerId) return
    const x = event.clientX - previous.x, y = event.clientY - previous.y
    drag.current = { id: previous.id, x: event.clientX, y: event.clientY }
    setCamera(view => ({
      ...view, bearing: (view.bearing - x * .43) % 360,
      pitch: Math.max(25, Math.min(68, view.pitch + y * .18)),
    }))
  }
  const endDrag = (event: PointerEvent<HTMLCanvasElement>) => {
    if (drag.current?.id === event.pointerId) drag.current = null
  }
  const turn = (degrees: number) => setCamera(view => ({ ...view, bearing: (view.bearing + degrees) % 360 }))
  const markers: { x: number; y: number }[] = []
  const pins = centers.flatMap((center, index) => {
    const sample = center.coordinates && terrainPoint(center.coordinates)
    if (!sample) return []
    const point = projection.project(sample.vertex)
    const marker = markerOffsets.map(([x, y]) => ({ x: point.x + x, y: point.y + y }))
      .find(candidate => candidate.x > 13 && candidate.x < size.width - 13 && candidate.y > 13 && candidate.y < size.height - 13
        && markers.every(placed => Math.hypot(candidate.x - placed.x, candidate.y - placed.y) >= 28))
      ?? { x: point.x, y: point.y - 13 }
    markers.push(marker)
    return [{ center, index, sample, point, marker }]
  })
  const pending = centers.filter(center => !center.coordinates).length
  const outOfBounds = centers.length - pins.length - pending
  const localOrigin = origin && terrainPoint(origin)
  const originPoint = localOrigin && projection.project(localOrigin.vertex)
  const visible = !unavailable && size.width > 0

  return <section className="terrain-map" aria-label="Relieve 3D del valle del Mantaro">
    <div className="terrain-tools">
      <button className="view-link" type="button" onClick={() => turn(-25)} disabled={unavailable} aria-label="Girar relieve a la izquierda">↶</button>
      <button className="view-link" type="button" onClick={() => turn(25)} disabled={unavailable} aria-label="Girar relieve a la derecha">↷</button>
      <label>Zoom <input type="range" min="85" max="145" step="5" value={Math.round(camera.zoom * 100)} disabled={unavailable}
        onChange={event => setCamera(view => ({ ...view, zoom: Number(event.target.value) / 100 }))} /></label>
      <button className="view-link" type="button" onClick={() => setCamera(initialCamera)} disabled={unavailable}>Restablecer vista</button>
    </div>
    <div className="center-map terrain-scene" ref={scene}>
      <canvas ref={canvas} aria-hidden="true" onPointerDown={startDrag} onPointerMove={moveDrag}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} />
      {unavailable && <p className="terrain-fallback" role="status">El relieve 3D no está disponible en este navegador. Puedes usar el mapa 2D.</p>}
      {visible && <>
        <div className="terrain-location">Valle del Mantaro</div>
        <div className="terrain-compass" aria-hidden="true">N <span style={{ transform: `rotate(${projection.northAngle}deg)` }}>↑</span></div>
        <div className="terrain-legend" aria-label="Rango de altitud del relieve">
          <span>{meters.format(elevationRange.min)} m</span><i /><span>{meters.format(elevationRange.max)} m</span>
        </div>
        {originPoint && <span className="terrain-origin" style={{ left: originPoint.x, top: originPoint.y }} role="img" aria-label="Origen de la búsqueda por radio" />}
        {pins.map(({ center, index, sample, point, marker }) => <Fragment key={center.id}>
          <i className="terrain-pin-line" aria-hidden="true" style={{ left: point.x, top: point.y,
            width: Math.hypot(marker.x - point.x, marker.y - point.y),
            transform: `rotate(${Math.atan2(marker.y - point.y, marker.x - point.x)}rad)` }} />
          <button type="button"
          className={`terrain-pin${center.id === selectedId ? ' is-selected' : ''}`}
          style={{ left: marker.x, top: marker.y, zIndex: center.id === selectedId ? 200 : 120 - Math.round(point.depth) }}
          aria-label={`${center.name}${center.isDemo ? ', ubicación ficticia' : ''}, ${meters.format(sample.elevation)} metros de altitud aproximada`}
          title={`${center.name}${center.isDemo ? ' · Ubicación ficticia' : ''} · ${meters.format(sample.elevation)} m aprox.`}
          onClick={() => onSelect(center.id)}>{index + 1}</button>
        </Fragment>)}
      </>}
    </div>
    <div className="map-caption terrain-caption">
      <span>Arrastra para girar · {pins.length} sedes en el área{pending ? ` · ${pending} sin coordenadas` : ''}{outOfBounds ? ` · ${outOfBounds} fuera del área` : ''}</span>
      <span>Relieve exagerado · <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md#srtm" target="_blank" rel="noreferrer">Mapzen · SRTM (USGS)</a></span>
    </div>
  </section>
}
