# Avance 02 — Catálogo geográfico de demostración

## Alcance terminado

- Seis sedes ficticias, identificadas en pantalla como ejemplos.
- Mapa Leaflet con atribución OpenStreetMap, zoom y selección de marcadores.
- Búsqueda por nombre, distrito o ámbito, sin distinguir tildes ni mayúsculas.
- Filtros combinables por distrito y ámbito; mismo conjunto de resultados en mapa y lista.
- Ficha de sede, resaltado de selección, cierre, limpieza y estado sin resultados.
- Diseño verde/crema adaptable a móvil y escritorio, controles etiquetados y foco visible.
- Aviso cuando falla la carga de teselas; las fichas siguen disponibles.

Los distritos asignados, nombres, descripciones y coordenadas son sintéticos. No se han validado como información territorial institucional. No hay evaluaciones, vacantes ni distancias reales calculadas por la aplicación.

## Organización

`frontend/src/features/catalog/` contiene `centers.ts` (tipos, ejemplos y filtrado), `Catalog.tsx` (estado y componentes de consulta), `CenterMap.tsx` (ciclo de vida del mapa) y `catalog.css` (estilos de esta función). `App.tsx` conserva la página general.

React mantiene la selección y filtros; Leaflet se limpia al desmontar el componente. Los datos viven únicamente en memoria. No se requiere configurar PostgreSQL en este avance.

## Verificación

Compilación y TypeScript: `npm run build` desde `frontend`.

Comprobaciones en navegador: Chilca + Educación devuelve una sede; abrirla muestra su ficha; una búsqueda inexistente vacía lista y marcadores; restablecer recupera las sedes; buscar `vinculos` encuentra `Vínculos`. Revisión visual en vista móvil y escritorio. El mapa base requiere internet.

## Siguiente parte propuesta

Preparar el backend FastAPI y el esquema inicial PostgreSQL/PostGIS. Antes de configurar la conexión, confirmar instalación local y acordar nombre de base/usuario. Las credenciales se guardarán en configuración local excluida de Git. No hace falta que el usuario cree tablas por su cuenta todavía.

Las consultas de distancia/radio llegarán después de contar con la base espacial. No adelantar autenticación, cuestionarios o índice en esta fase.

## Referencias técnicas

- [API de Leaflet](https://leafletjs.com/reference.html).
- [Política de teselas OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/): conservar atribución y no implementar descarga masiva. La URL puede configurarse con `VITE_TILE_URL`; si cambia el proveedor, revisar también su atribución y condiciones.
