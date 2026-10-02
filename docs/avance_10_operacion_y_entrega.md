# Avance 10 — Operación local y preparación de entrega

**Actualización posterior:** el código actual requiere las migraciones 0005 y 0006 y añade fuente pública, historial y otras correcciones. Sigue la [guía de actualización](correcciones_analisis_integral.md) antes del arranque. El resto de este documento conserva el alcance original del avance 10.

Esta guía reúne el arranque habitual, la demostración y los pendientes del proyecto. Cerrar la hoja de ruta de código no significa que el sistema esté validado, publicado o que el estudio haya concluido.

## 1. Arranque habitual

PostgreSQL debe estar iniciado. Abre dos terminales PowerShell en la raíz del proyecto.

Primera terminal:

```powershell
.\iniciar.ps1 -Servicio backend
```

Segunda terminal:

```powershell
.\iniciar.ps1 -Servicio frontend
```

Abre `http://localhost:5173`. Deja ambas terminales abiertas. Para detener los servicios, presiona Ctrl+C en cada una; esto no borra datos ni detiene el servicio PostgreSQL.

El lanzador usa las carpetas relativas a su propia ubicación, conserva la carpeta de trabajo de la terminal y mantiene visibles los errores. No instala dependencias, aplica migraciones, crea cuentas, carga demos ni cambia `.env`. El frontend exige el puerto 5173; si ya está ocupado, se detiene en vez de usar otro puerto automáticamente.

Si PowerShell bloquea scripts, utiliza los comandos directos de abajo. No necesitas cambiar la política global de ejecución.

Backend, desde la raíz:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend, en otra terminal desde la raíz:

```powershell
cd frontend
npm.cmd run dev -- --host localhost --port 5173 --strictPort
```

## 2. Primera instalación y actualizaciones

Si el proyecto ya arranca, no reinstales todo. Para una máquina nueva, sigue `backend/README.md` para preparar PostgreSQL/PostGIS, el entorno Python y `.env`; luego instala el frontend con `npm ci` desde `frontend`. Los requisitos de Node están en `frontend/package.json`; Python 3.11 o superior es la base propuesta.

Aplica migraciones pendientes desde `backend` cuando una entrega lo indique:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

La última migración de esta entrega es `0004_surveys`. Los avances 09A, 09B y 10 no añaden migraciones. No ejecutes `downgrade` para arrancar el sistema.

Las cuentas se crean una vez con `scripts.create_user`, según la guía 08A. No existe registro público ni recuperación por correo. La contraseña de la aplicación es independiente de la cuenta de PostgreSQL.

## 3. Mapa de pantallas y permisos

| Pantalla | Ruta | Acceso y propósito |
|---|---|---|
| Inicio | `/` | Público; presentación |
| Explorador | `/explorar` | Público; mapa, filtros y búsqueda espacial |
| Centros | `/centros` | Público; directorio |
| Comparador | `/comparar` | Público; hasta tres sedes, sin ranking |
| Proyecto | `/proyecto` | Público; contexto del trabajo |
| Acceso | `/acceso` | Inicio de sesión |
| Mi cuenta | `/cuenta` | Cuenta autenticada y accesos de su rol |
| Cuestionario | `/cuestionario` | Estudiante responde; administración/coordinación consulta |
| Gestión | `/gestion` | Administración/coordinación habilita experiencias |
| Resultados | `/resultados` | Administración/coordinación consulta agregados piloto |

La API exige roles para las operaciones restringidas; ocultar enlaces en React no es el control de autorización.

## 4. Recorrido sugerido para una demostración

Este es un guion para una presentación futura, no una constancia de pruebas realizadas.

1. Presentar el problema y distinguir institución de sede. Identificar los datos demo como ficticios.
2. Abrir Explorador, buscar una sede y explicar filtros y ficha. Mostrar radio/distancia como distancia geográfica, no tiempo de viaje ni ruta vial.
3. Seleccionar hasta tres sedes en Comparar. Explicar que se comparan características del catálogo, sin recomendar una «mejor» sede.
4. Entrar como administrador a Gestión, seleccionar una estudiante existente, una sede demo y un periodo; registrar una referencia explícita de demostración.
5. Cerrar la sesión del administrador y entrar como estudiante. Abrir Cuestionario y explicar los dos bloques independientes, el aviso voluntario y la opción no aplica.
6. Si se desea enviar un registro de demostración, activar previamente `PILOT_SURVEY_ENABLED=true` en `.env` y reiniciar el backend. El envío se guarda y no se edita desde la interfaz. No rellenarlo fingiendo una experiencia real.
7. Cerrar la sesión de estudiante y volver a entrar como administrador. Abrir Resultados, actualizar y explicar los denominadores por pregunta, los envíos frente a participantes y la separación de sedes demo.
8. Terminar exponiendo pendientes del trabajo de campo. No presentar las respuestas piloto como hallazgos definitivos.

Usa cambios de sesión explícitos: dos pestañas del mismo navegador comparten la cookie. Las teselas del mapa base pueden requerir conexión a Internet; la base local no implica que todo el mapa funcione sin conexión.

## 5. Problemas habituales

| Situación | Acción |
|---|---|
| Puerto 5173 u 8000 ocupado | Localiza tu terminal anterior y detén ese servicio con Ctrl+C; no cierres procesos desconocidos |
| API no disponible | Revisa la terminal del backend y mantén el proceso abierto |
| Error de base de datos | Revisa que PostgreSQL esté iniciado, los valores locales de `.env` y las migraciones pendientes |
| Credenciales incorrectas | Usa el nombre de usuario, no el nombre visible; las credenciales PostgreSQL no sirven para `/acceso` |
| La estudiante no ve una sede | Comprueba en Gestión su usuario, sede, periodo y habilitación; después pulsa Actualizar estado en el cuestionario |
| No permite enviar | Revisa el rol estudiante, el interruptor del piloto, la aceptación del aviso y los cinco ítems |
| Ya existe una respuesta | Un bloque/experiencia solo se envía una vez por estudiante y versión |
| Resultados vacíos | Revisa bloque y filtros; asignar una sede no crea respuestas |
| Error de permisos tras cambiar de sesión | Recarga la página y entra con el rol adecuado |

Mantén el hostname `localhost` durante la sesión. Si eliges otro puerto, el origen debe coincidir con `CORS_ORIGINS`; el lanzador propone 5173 para evitar esa variación.

## 6. Conservación y transferencia

Git guarda código y migraciones, no el contenido de PostgreSQL. Conserva por separado una copia de seguridad de la base mediante las herramientas de PostgreSQL/pgAdmin antes de trasladarla o cambiarla. No se creó ni restauró ningún respaldo en este avance.

Los respaldos contienen cuentas, sesiones y respuestas vinculadas a estudiantes; no deben subirse al repositorio ni compartirse como anexos públicos. `.env`, `backups/` y `data/private/` están excluidos por `.gitignore`. Esa exclusión no cifra los archivos ni sustituye controlar su acceso.

Para entregar el código, incluye README, frontend, backend, migraciones y documentación. Completa `.env` localmente en el equipo receptor; no envíes contraseñas en el informe. Las capturas del informe deben evitar nombres/usuarios reales y respuestas identificables.

## 7. Qué falta antes de afirmar que el proyecto está concluido

- Revisión académica del instrumento, consentimiento, población/muestra, elegibilidad y fechas reales del trabajo de campo.
- Padrón de sedes con fuentes y coordenadas revisadas. Las demos no sustituyen esa información.
- Versión del cuestionario de campo y separación de sus datos respecto del piloto. La versión actual guarda todo como piloto.
- Aplicación de la encuesta, análisis y discusión con referencias verificadas. No completar tablas con resultados inventados.
- Validación técnica y evidencia de uso cuando el equipo decida realizarla. Desde el avance 03 no se ejecutan tests ni comprobaciones a pedido del usuario.
- Preparación específica para publicación: HTTPS, secretos, permisos de base, límites de acceso, respaldos y política de datos. Vite de desarrollo y Uvicorn con `--reload` son para operación local.

No se incorpora en esta fase administración visual de cuentas o catálogo, recuperación de contraseñas, historial de auditoría, exportación de respuestas, rutas viales ni ranking multicriterio.

## 8. Estado de la entrega

Se añadió `iniciar.ps1` y se actualizó la documentación principal y la guía del informe. No se ejecutaron el lanzador, servidores, migraciones, instalaciones, builds, tests, consultas a PostgreSQL, endpoints ni inspección visual. El avance es una entrega de código/documentación, no una certificación de funcionamiento.
