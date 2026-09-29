import { Link } from 'react-router-dom'
import type { Center } from './centers'
import { formatDistance } from './centers'

export default function CenterDetails({ center, directory, onClose }: {
  center: Center | undefined; directory: boolean; onClose: () => void
}) {
  return <div id="center-detail" className="center-detail" aria-live="polite">
    {center ? <>
      <div className="detail-top"><span className="eyebrow">{center.isDemo ? 'FICHA DE DEMOSTRACIÓN' : 'FICHA DE SEDE'}</span><button aria-label="Cerrar ficha" onClick={onClose}>×</button></div>
      <h3>{center.name}</h3><p>{center.description}</p>
      <dl>
        <div><dt>Institución</dt><dd>{center.institution}</dd></div>
        <div><dt>Distrito</dt><dd>{center.district}</dd></div>
        <div><dt>Ámbito</dt><dd>{center.type}</dd></div>
        <div><dt>Dirección</dt><dd>{center.address || 'Pendiente de registro'}</dd></div>
        <div><dt>Estado del registro</dt><dd>{center.verificationStatus === 'verified' ? 'Verificado' : 'Por verificar'}</dd></div>
        <div><dt>Disponibilidad</dt><dd>No informada</dd></div>
        {center.distanceM !== null && <div><dt>Distancia geográfica</dt><dd>{formatDistance(center.distanceM)} desde el punto elegido</dd></div>}
      </dl>
      <p className="detail-note">{center.isDemo ? 'Información ficticia para demostrar el funcionamiento.' : 'Un registro verificado no certifica convenio vigente ni vacantes.'} Las valoraciones estudiantiles aún no están disponibles.</p>
      {directory && <Link className="button detail-map-link" to={`/explorar?sede=${encodeURIComponent(center.id)}`}>Ubicar en el mapa ↗</Link>}
    </> : <div className="detail-placeholder"><span aria-hidden="true">◎</span><div><h3>Un punto, una historia por conocer</h3><p>Selecciona una sede en el mapa o en la lista para abrir su ficha.</p></div></div>}
  </div>
}
