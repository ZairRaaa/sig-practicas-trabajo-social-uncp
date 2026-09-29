import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Center } from './centers'

interface Props {
  centers: Center[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function CenterMap({ centers, selectedId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const [tileError, setTileError] = useState(false)

  useEffect(() => {
    if (!container.current) return
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView([-12.069, -75.213], 13)
    map.current = instance
    L.tileLayer(import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).on('tileerror', () => setTileError(true)).addTo(instance)
    L.control.scale({ imperial: false }).addTo(instance)
    const observer = new ResizeObserver(() => instance.invalidateSize())
    observer.observe(container.current)
    return () => { observer.disconnect(); instance.remove(); map.current = null }
  }, [])

  useEffect(() => {
    const instance = map.current
    if (!instance) return
    markers.current.forEach(marker => marker.remove())
    markers.current.clear()
    centers.forEach((center, index) => {
      const label = document.createElement('span')
      label.textContent = `${center.name}${center.isDemo ? ' · Ubicación ficticia' : ''}`
      const marker = L.marker(center.coordinates, {
        title: center.name,
        alt: `Seleccionar ${center.name}`,
        icon: L.divIcon({ className: 'center-pin', html: `<span><b>${index + 1}</b></span>`, iconSize: [34, 40], iconAnchor: [17, 40] }),
      }).bindTooltip(label).on('click', () => onSelect(center.id)).addTo(instance)
      marker.getElement()?.setAttribute('aria-label', `Seleccionar ${center.name}`)
      markers.current.set(center.id, marker)
    })
    if (centers.length) instance.fitBounds(L.latLngBounds(centers.map(center => center.coordinates)), { padding: [45, 45], maxZoom: 14, animate: false })
  }, [centers, onSelect])

  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('is-selected', id === selectedId)
      marker.setZIndexOffset(id === selectedId ? 1000 : 0)
      if (id === selectedId) map.current?.panTo(marker.getLatLng(), { animate: false })
    })
  }, [selectedId, centers])

  return <div className="map-shell">
    <div ref={container} className="center-map" role="region" aria-label="Mapa de sedes; también disponibles en la lista de centros" />
    <div className="map-caption"><span className="map-dot" />Mapa de esta página · {centers.length} sedes{centers.some(center => center.isDemo) ? ' · Incluye ubicaciones ficticias' : ''}</div>
    {tileError && <p className="map-error" role="status">No se pudo cargar parte del mapa base. Puedes seguir consultando las fichas en la lista.</p>}
  </div>
}
