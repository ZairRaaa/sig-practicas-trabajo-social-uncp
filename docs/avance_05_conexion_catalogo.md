# Avance 05 — Catálogo conectado a la API

## Arranque habitual (dos terminales)

Desde la raíz del proyecto, terminal del backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Desde la raíz del proyecto, segunda terminal para React:

```powershell
cd frontend
npm run dev
```

Mantener ambas abiertas; Ctrl+C detiene cada proceso. PostgreSQL debe estar iniciado como servicio local. Abrir la dirección que imprima Vite, habitualmente `http://localhost:5173/`. Esto es ejecución de desarrollo local, no publicación en internet.

No reinstalar ni recrear tablas en cada arranque. Instalar dependencias solo en la preparación inicial o cuando cambien; aplicar `alembic upgrade head` cuando se añadan migraciones. **Este avance no añade migraciones ni dependencias.** Se necesita haber aplicado `0001_catalog` del avance anterior.

Ver `/docs` indica que la API arrancó; no garantiza que PostgreSQL o el esquema estén disponibles.

## Qué cambia

- Se retiran los seis registros fijos del frontend; el catálogo se obtiene de PostgreSQL mediante FastAPI.
- La interfaz distingue consulta en curso, error con reintento, base vacía y búsqueda sin coincidencias.
- La búsqueda tiene un breve retardo y cancela solicitudes anteriores; no muestra resultados de una consulta obsoleta.
- Distritos y ámbitos proceden de la API. La búsqueda consulta nombre de sede, institución, ámbito y distrito sin distinguir mayúsculas y tildes españolas.
- Lista y mapa muestran la misma página (hasta 12 sedes). El total incluye todas las coincidencias; no se presenta el mapa de una página como si mostrara el padrón completo.
- Los enlaces `/explorar?sede=<UUID>` consultan la sede directamente, aunque no pertenezca a la primera página. Un aviso permite volver al catálogo completo.
- Las fichas y marcadores distinguen datos ficticios con `is_demo`. Un registro verificado no implica plazas disponibles.
- Se añade `GET /api/v1/categories` para obtener ámbitos presentes en sedes activas.

## Conexión local

Vite reenvía `/api` a `http://127.0.0.1:8000`. Esto mantiene las peticiones del navegador en el mismo origen durante el desarrollo. Reiniciar Vite después de cambiar su configuración.

Si el backend utiliza otro puerto, copiar `frontend/.env.example` a `frontend/.env` (solo si no existe) y cambiar `API_PROXY_TARGET`. Nunca poner contraseñas PostgreSQL en el frontend.

`VITE_API_BASE_URL` es una alternativa para configurar una API externa explícita; requiere CORS apropiado. El proxy de desarrollo no configura por sí solo un despliegue de producción ni `vite preview`.

## Carga opcional de demostración

Para ver ejemplos guardados realmente en PostgreSQL, desde `backend`, ejecutar una vez:

```powershell
.\.venv\Scripts\python.exe -m scripts.seed_demo --confirm-demo
```

El comando utiliza la base configurada en `backend/.env`. Inserta seis instituciones/sedes ficticias con UUID estables, tres distritos de demostración y coordenadas ilustrativas. Marca las sedes como `is_demo=true`, con verificación pendiente. **Los códigos 990001–990003 son sintéticos; no son UBIGEO oficiales.** Los nombres de distrito llevan `(demo)`.

La operación es transaccional: si falla, se revierte la carga de esa ejecución. Repetirla no duplica las sedes ni sobrescribe registros. Detecta conflictos con sus identificadores. No restaura registros previamente modificados ni reactiva sedes desactivadas.

No es una importación institucional ni se debe usar como evidencia de investigación. Antes de cargar información real se definirá un flujo separado, con fuente y revisión. No se ejecutó este script durante la entrega.

## Organización del código

| Archivo | Responsabilidad |
|---|---|
| `frontend/src/services/api.ts` | Solicitudes, errores, cancelación y tiempo máximo |
| `features/catalog/catalogApi.ts` | Contrato API y conversión longitud/latitud a Leaflet |
| `features/catalog/useCatalog.ts` | Ciclo de consulta, opciones, carga y reintento |
| `features/catalog/centers.ts` | Tipos del catálogo; sin fixtures ocultos |
| `features/catalog/Catalog.tsx` | Búsqueda, filtros, paginación y selección |
| `features/catalog/CenterDetails.tsx` | Ficha de una sede |
| `backend/scripts/seed_demo.py` | Carga local explícita de ejemplos |

## Siguiente parte

Consultas espaciales con PostGIS: origen seleccionado, radio y distancia geográfica. Después, comparación de sedes. El cuestionario, autenticación y administración mantienen sus fases propias.

## Estado de entrega

Código y documentación generados sin tests, compilaciones, inspección del navegador ni llamadas a la API, por instrucción del usuario. No se leyeron credenciales ni se modificó la base local. La ejecución de esta integración queda pendiente por parte del usuario.
