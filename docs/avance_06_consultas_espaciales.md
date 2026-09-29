# Avance 06 — Origen, radio y distancia

## Código incorporado

- Selección de origen activando el botón y haciendo clic en el mapa.
- Formulario alternativo de latitud/longitud para uso con teclado.
- Radios de 500 m, 1, 2, 3, 5, 10 y 20 km.
- Filtros espaciales combinados con nombre, distrito y ámbito.
- Resultados ordenados por distancia antes de paginar; mapa y lista muestran la misma página.
- Distancia en tarjetas/fichas, punto de origen y círculo orientativo.
- Cancelación de selección y eliminación del filtro de proximidad.

## PostGIS

`POST /api/v1/spatial/search` recibe `latitude`, `longitude`, `radius_m`, `q`, `district`, `category`, `limit` y `offset` en JSON. Es una consulta sin escritura. La respuesta mantiene el formato del catálogo y añade `distance_m` en cada sede.

`ST_DWithin` filtra por radio y `ST_Distance` calcula distancias, convirtiendo a `geography` para trabajar en metros. Se ordena por distancia e ID para resolver empates. Se rechazan coordenadas fuera de rango, valores no finitos y radios fuera de 100–20000 metros.

El círculo de Leaflet es orientativo: PostGIS decide la pertenencia al radio. Las distancias se redondean al mostrarlas, no para filtrar. No representan rutas, tráfico, tiempo de viaje ni accesibilidad real.

El origen se mantiene en memoria de la interfaz. No se guarda en la base, URL ni almacenamiento del navegador. No se usa GPS. La infraestructura futura no deberá registrar cuerpos de solicitudes con coordenadas.

## Acción del usuario

Desde la raíz del proyecto, aplicar la migración:

```powershell
cd backend
.\.venv\Scripts\python.exe -m alembic upgrade head
```

`0002_spatial_index` agrega un índice GiST sobre la conversión a geography. No borra registros ni requiere volver a cargar las demos. Se utiliza la conexión de `.env`. No hay dependencias nuevas.

Después arrancar el backend:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

En otra terminal desde la raíz:

```powershell
cd frontend
npm run dev
```

Si los servidores ya están abiertos, la recarga de desarrollo puede incorporar el código; la migración siempre se aplica por separado.

## Uso y límites

Explorador → Elegir punto en el mapa → clic en una ubicación → seleccionar radio. También se pueden escribir coordenadas manualmente. Cambiar origen, radio o filtros vuelve a la primera página. Quitar proximidad conserva los otros filtros; Limpiar los restablece todos.

El círculo permanece aunque no existan coincidencias. Una búsqueda espacial libera la consulta de ficha por enlace directo. Las distancias de puntos demo se calculan realmente sobre sus coordenadas ficticias: no se convierten por ello en datos de investigación.

## Estado de entrega

No se ejecutaron migraciones, consultas, compilación, tests ni inspección visual, conforme a la instrucción del usuario. Código pendiente de ejecución. Próxima parte: comparador de hasta tres sedes, sin inventar valoraciones.
