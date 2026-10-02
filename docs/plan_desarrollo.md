# Plan de desarrollo por fases y commits

Plan inicial conservado. Para el enfoque académico y alcance actuales, usar la [definición vigente](definicion_vigente.md); para las entregas, la [hoja de ruta](hoja_de_ruta.md). Las verificaciones de este plan continúan pendientes de ejecución según la restricción posterior registrada en el README.

Trabajamos en el repositorio existente. No volver a ejecutar `git init` ni crear otro repositorio dentro de `frontend`.

Cada fase debe dejar un resultado ejecutable o verificable. Usar commits pequeños por responsabilidad; no esperar al final de una fase grande para guardar todo. Los commits iniciales son locales; publicar en el remoto es una acción separada.

| Fase | Entregable | Commits orientativos | Verificación |
|---|---|---|---|
| 0. Definición | Propuesta, bases y plan versionados | `docs: define project scope and development phases` | Documentos y exclusión de secretos/datos privados |
| 1. Interfaz base | React + TypeScript + Vite, pantalla inicial y catálogo vacío | `feat(frontend): bootstrap React application` | Tipos y compilación de producción |
| 2. Catálogo de demostración | Leaflet, sedes sintéticas, búsqueda, filtros y fichas | Separar datos/tipos, mapa y filtros | Interacciones, estados vacíos y etiquetas de datos ficticios |
| 3. API y datos | FastAPI, PostGIS, migraciones e importación | Separar API, esquema e importación | Integridad, errores y pruebas de importación |
| 4. Análisis espacial | Radio, distancia y comparación conectados a API | Consultas espaciales y luego integración web | Casos conocidos dentro/fuera/borde del radio |
| 5. Acceso y valoraciones | Sesiones, roles, experiencias verificadas y agregados | Separar autenticación, formularios y publicación de agregados | Permisos, duplicados y evidencia insuficiente |
| 6. Investigación | Datos autorizados, instrumentos y evaluación con estudiantes | Instrumentos versionados y análisis reproducible | Protocolo, privacidad y coherencia de resultados |
| 7. Entrega | Despliegue, respaldo, artículo y demostración | Infraestructura y documentación final | Restauración, flujo completo y defensa |

## Reglas de trabajo

1. Desarrollar cada fase en una rama `codex/fase-N-descripcion`, partiendo del estado aprobado anterior.
2. Antes de cada commit revisar `git diff` y ejecutar las verificaciones aplicables.
3. Añadir archivos explícitamente; no incluir credenciales, bases reales identificables o `node_modules`.
4. Mantener un único archivo de bloqueo de npm para la interfaz y versionarlo.
5. No mezclar una función nueva con una reestructuración grande.
6. Registrar qué funciona y qué queda pendiente en el README.

## Alcance del arranque

Las fases 0 y 1 incluyen únicamente documentación y base de interfaz. La pantalla inicial no inventará centros, evaluaciones ni vacantes. El mapa y los datos sintéticos pertenecen a la fase 2. Backend, cuentas y base espacial se implementan después.

Antes de usar datos reales se necesitan padrón autorizado, ámbito/periodo e instrumentos revisados. El índice multicriterio continúa siendo opcional según la propuesta.
