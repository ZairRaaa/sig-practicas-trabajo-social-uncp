# Territorio API — base del backend

FastAPI + SQLAlchemy + PostgreSQL/PostGIS. Código preparado, aún no ejecutado ni verificado por solicitud del usuario. Python 3.11 o superior propuesto. Las dependencias se declaran con rangos; todavía no existe un bloqueo reproducible de versiones Python.

## Organización

```text
app/
  main.py          # Aplicación, CORS y errores públicos
  core/config.py   # Variables locales y URL segura de conexión
  db/              # Motor, sesiones y metadatos
  models/          # Instituciones, distritos y sedes
  schemas/         # Contratos de respuesta
  services/        # Consultas del catálogo
  api/             # Rutas HTTP
migrations/        # Historial de esquema con Alembic
.env.example       # Plantilla sin contraseña
requirements.txt   # Dependencias
```

## 1. Preparar PostgreSQL (acción del usuario)

Se necesita PostgreSQL con el paquete PostGIS compatible con su versión. Si todavía no está instalado, indicar al equipo qué versión de PostgreSQL tienes y si administras con pgAdmin; no compartir contraseña. No hace falta instalar Docker para esta parte.

Usa una base nueva y exclusiva del proyecto. En **pgAdmin**, conectado con tu cuenta administradora:

1. En `Login/Group Roles`, crear `territorio_app`, permitir inicio de sesión y establecer una contraseña local. No conceder superusuario, creación de roles ni de bases.
2. En `Databases`, crear `territorio` y seleccionar `territorio_app` como propietario.
3. Abrir Query Tool **sobre la base `territorio`**, con la cuenta administradora, y ejecutar:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
GRANT USAGE, CREATE ON SCHEMA public TO territorio_app;
```

Si aparece que la extensión no está disponible, falta instalar PostGIS para esa instalación de PostgreSQL; no se soluciona cambiando la contraseña ni creando tablas a mano. Detenerse ahí e informar el mensaje sin credenciales.

Las tablas las creará Alembic con el usuario `territorio_app`. El rol sirve para migraciones y desarrollo local; antes de publicar se separará el rol de migración del usuario de ejecución con permisos mínimos. No usar la cuenta administradora como usuario habitual de la API.

## 2. Preparar Python

Desde la raíz del repositorio, en PowerShell:

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Copiar `.env.example` solo la primera vez para no sobrescribir una configuración existente. Editar `backend/.env` localmente y completar `DB_PASSWORD`; adaptar host, puerto, nombre y usuario si elegiste otros. Las contraseñas con espacios o `#` deben escribirse entre comillas en el archivo. No incluir `.env` en commits ni capturas. La conexión utiliza campos separados, sin construir una URL manual con la contraseña.

Estos comandos utilizan el Python del entorno directamente; no es necesario modificar la política de ejecución de PowerShell ni activar scripts.

## 3. Crear las tablas y arrancar la API

Desde `backend`:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

`alembic upgrade head` aplica las migraciones pendientes; no vuelve a crear tablas ya migradas. La aplicación no crea tablas automáticamente al arrancar. No ejecutar `downgrade` sobre información que se quiera conservar: revierte tablas y datos.

Mantener abierta la terminal. La documentación interactiva de la API estará en [localhost:8000/docs](http://localhost:8000/docs). La API se limita a la máquina local con `127.0.0.1`. En otra terminal puede seguir ejecutándose React con `npm run dev` desde `frontend`.

## Rutas previstas

| Método/ruta | Función |
|---|---|
| `GET /api/v1/health` | Estado del proceso; no comprueba la base |
| `GET /api/v1/ready` | Estado de conexión, PostGIS y existencia de la tabla de sedes |
| `GET /api/v1/sites` | Sedes activas, paginadas |
| `GET /api/v1/sites/{uuid}` | Ficha o 404 |
| `GET /api/v1/districts` | Distritos registrados |

Filtros de sedes: `q` busca texto en el nombre sin distinguir mayúsculas; `district` recibe UBIGEO de seis dígitos; `category` exige coincidencia exacta; `limit` entre 1 y 100; `offset` entre 0 y 100000. A diferencia de la demo web, esta búsqueda todavía no normaliza tildes. La siguiente integración deberá unificar su comportamiento.

Ejemplo de respuesta de una **base vacía**, sin registros inventados:

```json
{"items": [], "total": 0, "limit": 30, "offset": 0}
```

Las coordenadas se devuelven en campos `longitude` y `latitude` separados. Al conectarlas a Leaflet se convertirán explícitamente al orden `[latitude, longitude]`. En PostGIS se almacenan puntos EPSG:4326, con longitud primero. Todavía no se realizan consultas de distancia ni radio.

## Alcance y límites

Solo se implementan lecturas HTTP. No hay endpoints públicos de creación/edición, autenticación, encuestas ni importación. Los datos reales no deben exponerse hasta definir permisos. `active` indica que la sede no fue desactivada, no certifica convenio vigente ni vacantes. `verified` exige fuente y fecha, pero no sustituye una revisión institucional.

La base separa institución y sede; el distrito puede quedar sin asignar hasta verificarlo. Los polígonos distritales, periodos, convenios y experiencias se incorporarán mediante migraciones posteriores. No se cargan UBIGEO o coordenadas supuestamente oficiales sin fuente.

CORS permite los dos orígenes locales de Vite del archivo de ejemplo; si Vite cambia de puerto, actualizar `CORS_ORIGINS` (lista JSON) y reiniciar la API. CORS no sustituye autenticación.

No se ejecutaron instalación Python, migraciones, servidor, endpoints, compilaciones ni tests durante esta entrega.
