# Avance 08A — Acceso y roles

Primera parte del bloque 08. El cuestionario y las experiencias elegibles se implementarán por separado en 08B.

## Código entregado

- Página de acceso `/acceso` y cuenta `/cuenta`.
- Roles `student`, `coordinator` y `admin`.
- Contraseñas Argon2, sin credenciales iniciales incorporadas al repositorio.
- Sesiones aleatorias, almacenadas como hash en PostgreSQL, con caducidad fija de ocho horas por defecto.
- Cookie HttpOnly, SameSite=Lax y ruta `/api/v1`; Secure configurable para HTTPS.
- Cierre de sesión que revoca el token en la base.
- Comprobación de cuenta activa y rol en el servidor, no solo en la interfaz.
- Control de Origin en inicio/cierre de sesión y token CSRF para el cierre. Las futuras operaciones autenticadas de escritura deberán reutilizar `require_csrf`.
- Límite de diez intentos de acceso por minuto e IP, en memoria del proceso local.

El catálogo sigue siendo de consulta abierta para esta fase. La página de cuenta requiere sesión. `/auth/staff-access` exige coordinación o administración y devuelve su autorización; no implica que la gestión del padrón ya esté construida. Un estudiante recibe 403 en esa ruta aunque manipule la interfaz.

## Preparación necesaria (una vez)

Detener temporalmente el backend con Ctrl+C. Desde la raíz del proyecto:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m scripts.create_user --username admin --role admin
```

El último comando pide nombre visible y contraseña en tu terminal; al escribir la contraseña no se muestran caracteres. Usa 12–128 caracteres y repítela cuando se solicite. No envíes la contraseña al chat. Este usuario pertenece a la aplicación, es diferente del usuario PostgreSQL `territorio_app`.

La migración `0003_auth` añade cuentas y sesiones. Conserva sedes, instituciones y demos. No ejecutar `downgrade` para este arranque.

Para otras cuentas, repetir el comando con un nombre distinto y rol `student` o `coordinator`:

```powershell
.\.venv\Scripts\python.exe -m scripts.create_user --username estudiante01 --role student
```

La herramienta no sobrescribe usuarios existentes ni cambia sus contraseñas. No hay registro público ni recuperación de contraseña en esta fase.

## Arranque habitual

En `backend`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

En otra terminal, desde la raíz:

```powershell
cd frontend
npm run dev
```

Entrar por **Iniciar sesión en React**. Las operaciones de acceso están diseñadas para el origen de la interfaz, no para iniciar sesión desde Swagger `/docs` por defecto. Usar el mismo hostname durante la sesión (por ejemplo localhost); localhost y 127.0.0.1 son hosts distintos para cookies.

Si Vite utiliza otro puerto, añadir su origen exacto a `CORS_ORIGINS` en `backend/.env` y reiniciar FastAPI. No usar `*`. El proxy de Vite mantiene la API bajo `/api` en el mismo origen para el navegador.

Opciones nuevas, con valores locales por defecto; añadir a `.env` solo si se quieren cambiar:

```dotenv
SESSION_COOKIE_SECURE=false
SESSION_HOURS=8
```

Al publicar con HTTPS se requerirá `SESSION_COOKIE_SECURE=true` y configuración explícita del origen. No se debe publicar esta configuración local sin preparar también límites compartidos para intentos de acceso: el contador actual es por proceso y, con el proxy local, varias conexiones pueden compartir la misma IP. No registra contraseñas ni confía en un X-Forwarded-For arbitrario.

## API y organización

| Ruta | Uso |
|---|---|
| `POST /api/v1/auth/login` | Usuario/contraseña; crea sesión y rota la cookie anterior |
| `GET /api/v1/auth/me` | Usuario actual y token CSRF, sin hash de contraseña |
| `POST /api/v1/auth/logout` | Revoca sesión, requiere Origin permitido y X-CSRF-Token |
| `GET /api/v1/auth/staff-access` | Acceso restringido a coordinación/administración |

Backend: `models/auth.py`, `core/security.py`, `api/auth.py`, migración 0003 y `scripts/create_user.py`. Frontend: contexto de sesión, páginas de acceso/cuenta y estilos propios en `features/auth`.

La cookie no se copia a localStorage. El token CSRF se mantiene en memoria y se recupera al consultar `/me`. Los roles y el estado activo se leen de PostgreSQL en cada petición protegida. Las sesiones expiradas se eliminan al iniciar otra sesión. No se implementa todavía administración de cuentas, cambio de contraseña, encuestas ni recuperación por correo.

## Estado de entrega

Código y documentación generados sin instalación, migraciones, creación de cuentas, consultas, tests, compilación ni inspección visual. No se leyó `.env` ni se solicitaron credenciales. Pendiente de ejecución por el usuario, conforme a su preferencia.
