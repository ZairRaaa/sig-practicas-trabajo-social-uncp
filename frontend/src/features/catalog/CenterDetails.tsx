import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Center, CenterPhoto } from './centers'
import { formatDistance, formatVerificationDate } from './centers'
import CompareButton from '../compare/CompareButton'

function SitePhoto({ photo }: { photo: CenterPhoto }) {
  const [failed, setFailed] = useState(false)
  return <figure className="detail-photo">
    {failed ? <a href={photo.source} target="_blank" rel="noreferrer">Abrir fotografía en Wikimedia Commons</a>
      : <img src={photo.url} alt={photo.caption} loading="lazy" onError={() => setFailed(true)} />}
    <figcaption><a href={photo.source} target="_blank" rel="noreferrer">{photo.caption}</a>{' · '}{photo.author}{' · '}
      <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></figcaption>
  </figure>
}

export default function CenterDetails({ center, directory, onClose }: {
  center: Center | undefined; directory: boolean; onClose: () => void
}) {
  return <div id="center-detail" className="center-detail" aria-live="polite">
    {center ? <>
      <div className="detail-top"><span className="eyebrow">{center.isDemo ? 'FICHA DE DEMOSTRACIÓN' : 'FICHA DE SEDE'}</span><button aria-label="Cerrar ficha" onClick={onClose}>×</button></div>
      <h3>{center.name}</h3><p>{center.description}</p>
      {center.preview?.photo && <SitePhoto key={center.id} photo={center.preview.photo} />}
      <CompareButton id={center.id} name={center.name} />
      <dl>
        <div><dt>Institución</dt><dd>{center.institution}</dd></div>
        <div><dt>Distrito</dt><dd>{center.district}</dd></div>
        <div><dt>Ámbito</dt><dd>{center.type}</dd></div>
        <div><dt>Dirección</dt><dd>{center.address || 'Pendiente de registro'}</dd></div>
        {!center.coordinates && <div><dt>Ubicación en el mapa</dt><dd>Coordenadas pendientes de verificación</dd></div>}
        {center.preview ? <>
          <div><dt>Relación con Trabajo Social</dt><dd>{center.preview.relationship}</dd></div>
          <div><dt>Fuentes públicas</dt><dd><ul className="detail-sources">{center.preview.sources.map(source =>
            <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>,
          )}</ul></dd></div>
        </> : <>
          <div><dt>Estado del registro</dt><dd>{center.verificationStatus === 'verified' ? 'Verificado' : 'Por verificar'}</dd></div>
          <div><dt>Fecha de verificación</dt><dd>{formatVerificationDate(center.verifiedAt)}</dd></div>
          <div><dt>Fuente pública</dt><dd>{center.publicSource || 'Referencia pública pendiente de registro'}</dd></div>
        </>}
        <div><dt>Disponibilidad</dt><dd>No informada</dd></div>
        {center.distanceM !== null && <div><dt>Distancia geográfica</dt><dd>{formatDistance(center.distanceM)} desde el punto elegido</dd></div>}
      </dl>
      <p className="detail-note">{center.preview ? 'Ficha preliminar para revisión de la coordinación.' : center.isDemo ? 'Información ficticia para demostrar el funcionamiento.' : 'Un registro verificado no certifica convenio vigente ni vacantes.'} Las valoraciones estudiantiles aún no están disponibles.</p>
      {directory && center.coordinates && <Link className="button detail-map-link" to={`/explorar?sede=${encodeURIComponent(center.id)}`}>Ubicar en el mapa ↗</Link>}
    </> : <div className="detail-placeholder"><span aria-hidden="true">◎</span><div><h3>Un punto, una historia por conocer</h3><p>Selecciona una sede en el mapa o en la lista para abrir su ficha.</p></div></div>}
  </div>
}
