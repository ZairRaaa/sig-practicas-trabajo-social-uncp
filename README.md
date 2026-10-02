# Territorio — SIG de prácticas de Trabajo Social, UNCP

Sistema web en desarrollo para consultar y comparar sedes de prácticas e integrar prioridades y experiencias estudiantiles. «Territorio» es el nombre de trabajo de la interfaz.

## Estado de la entrega

Código entregado hasta el avance 10: catálogo y mapa, búsqueda espacial por radio, comparador de hasta tres sedes, acceso por roles, cuestionario piloto, gestión visual de experiencias y resultados descriptivos. React/TypeScript/Vite/Leaflet en `frontend`; FastAPI/SQLAlchemy y PostgreSQL/PostGIS en `backend`.

Correcciones posteriores: textos actualizados, fuente pública y fecha de verificación, recuperación de sesión, mensajes de error, carga independiente de filtros, normalización de periodos, historial de experiencias y consulta de resultados por versión piloto. **El código actual requiere aplicar las migraciones 0005 y 0006** con `alembic upgrade head` antes de arrancar la API. Consulta la [guía de actualización](docs/correcciones_analisis_integral.md).

La [definición vigente](docs/definicion_vigente.md) consolida el enfoque descriptivo de encuesta e información espacial y la matriz de alcance. Los diez avances son entregas de código; no significan investigación concluida ni todos los requisitos iniciales implementados.

El usuario informó seis sedes demo cargadas y cuentas administrador y estudiante creadas. Desde el avance 03 no se ejecutan tests ni comprobaciones de funcionamiento por indicación del usuario. Código entregado no equivale a sistema validado ni a investigación concluida. El instrumento actual y todos sus envíos son piloto.

## Arranque habitual en Windows

Con PostgreSQL iniciado y la instalación inicial completada, abre dos terminales PowerShell en la raíz.

Terminal 1:

```powershell
.\iniciar.ps1 -Servicio backend
```

Terminal 2:

```powershell
.\iniciar.ps1 -Servicio frontend
```

Abre [Territorio](http://localhost:5173). Para detener, Ctrl+C en cada terminal. El lanzador no instala dependencias ni aplica migraciones; exige el puerto 5173 para la interfaz. Si PowerShell bloquea scripts, usa los comandos directos de la [guía de operación](docs/avance_10_operacion_y_entrega.md).

Para una máquina nueva: sigue la [preparación del backend](backend/README.md), instala el frontend con `npm ci` desde `frontend` y aplica las migraciones indicadas. Node compatible con `frontend/package.json` (`^20.19.0 || >=22.12.0`); Python 3.11 o superior propuesto. No sobrescribas un `.env` existente ni recrees cuentas para cada arranque.

## Accesos principales

| Función | Ruta | Rol |
|---|---|---|
| Mapa y búsqueda | `/explorar` | Público |
| Directorio | `/centros` | Público |
| Comparador | `/comparar` | Público |
| Inicio de sesión | `/acceso` | Todos |
| Cuenta y accesos | `/cuenta` | Autenticado |
| Cuestionario piloto | `/cuestionario` | Estudiante responde; personal consulta |
| Gestión de experiencias | `/gestion` | Admin/coordinación |
| Resultados piloto | `/resultados` | Admin/coordinación |

La estudiante responde prioridades sin asignación previa. Para evaluar una experiencia, el administrador selecciona su cuenta, sede y periodo desde Gestión. La recepción exige `PILOT_SURVEY_ENABLED=true` en `backend/.env` y reiniciar el backend tras cambiarlo. Desactivar la recepción conserva los datos. Consultar resultados no requiere abrir nuevos envíos.

## Documentación

- [Índice: documentación vigente e historial](docs/README.md).
- [Definición vigente, objetivos y matriz de alcance](docs/definicion_vigente.md).
- [Correcciones del análisis y actualización de la base](docs/correcciones_analisis_integral.md).
- [Formato 01: recopilación de sedes reales](docs/formato_01_sedes_reales.md).
- [Formato 02: decisiones de investigación y resultados](docs/formato_02_investigacion_y_resultados.md).
- [Operación, demostración y preparación de entrega](docs/avance_10_operacion_y_entrega.md).
- [Hoja de ruta y estado de los diez avances](docs/hoja_de_ruta.md).
- [Acceso y creación de cuentas](docs/avance_08a_acceso_y_roles.md).
- [Cuestionario piloto y migración 0004](docs/avance_08b_experiencias_y_cuestionario.md).
- [Gestión visual de experiencias](docs/avance_09a_gestion_de_experiencias.md).
- [Resultados y criterios de cálculo](docs/avance_09b_resultados_del_piloto.md).
- [Propuesta inicial de metodología y arquitectura (antecedente)](informacion_nuestro_proyecto.md).
- [Extractos del concurso](informacion_concurso_investigacion.md).
- [Guía para elaborar el informe con otra IA](docs/guia_informe_para_otra_ia.md).
- [Propuesta original conservada](docs/propuesta_original.md).

## Datos y alcance

Las sedes demo son ficticias. La distancia geográfica no es distancia de ruta ni tiempo de viaje. El comparador no produce rankings. Los porcentajes del cuestionario excluyen «no aplica» de su denominador y distinguen envíos de participantes. Los resultados no se publican en el catálogo y no acreditan efectos causales.

Quedan pendientes la revisión académica, padrón real, versión de campo, aplicación de encuesta, análisis del informe y validación técnica. También queda pendiente preparar una publicación con HTTPS y configuración de producción; el arranque descrito es local.

Git conserva código, no los datos PostgreSQL. `.env`, respaldos, dependencias y compilaciones no deben incluirse en el repositorio. La guía de operación describe la transferencia y conservación de datos.

## Desarrollo y Git

Los avances se guardan en commits y ramas locales `codex/`. No se hace push ni merge a `main` como parte de estas entregas. Las guías de cada avance conservan su alcance histórico; la hoja de ruta y este README resumen el estado actual.

El comando existente `npm run build`, desde `frontend`, ejecuta la comprobación de tipos y genera `dist`. Se documenta para una futura etapa autorizada de validación; no se ejecutó en este avance. Las dependencias Python mantienen rangos y no cuentan aún con un archivo de bloqueo reproducible.
