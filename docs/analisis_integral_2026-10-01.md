# Análisis integral de Territorio

Fecha: 1 de octubre de 2026. Revisión estática del repositorio y su documentación.

**Diagnóstico previo a las correcciones.** Para los hallazgos atendidos y pendientes actuales, consultar [correcciones del análisis](correcciones_analisis_integral.md) y [definición vigente](definicion_vigente.md). Este informe conserva la fotografía del estado revisado originalmente.

## 1. Dictamen y alcance de revisión

El proyecto tiene una arquitectura coherente para una aplicación académica: React/TypeScript/Leaflet, una API FastAPI y persistencia PostgreSQL/PostGIS. Existe una implementación considerable del catálogo, consulta espacial, comparación, autenticación, experiencias y cuestionario piloto. La organización permite continuar sin una reescritura.

Su estado defendible es **prototipo académico con módulos implementados en código, validación técnica pendiente y trabajo de campo pendiente**. Los diez avances no equivalen a completar todos los compromisos de la propuesta ni a terminar la investigación.

Se revisaron los 21 Markdown existentes al inicio, código de frontend y backend, modelos, cuatro migraciones, scripts, estilos, configuración, manifiestos y encabezado del bloqueo npm. Se inspeccionó el estado de Git. No se ejecutaron servidores, compilaciones, pruebas, migraciones ni consultas a PostgreSQL, respetando la restricción documentada. No se leyó el contenido de `.env`. No se auditó cada dependencia transitiva, ni se verificaron externamente bibliografía y convocatoria. La revisión de CSS permite evaluar organización, no certificar apariencia, contraste o funcionamiento en dispositivos.

Había 104 archivos versionados y dos formatos Markdown sin seguimiento. Existían `node_modules`, `dist` y `.venv`; su presencia no demuestra que correspondan al código actual o que este funcione. Rama observada: `codex/avance-10-operacion-entrega`.

## 2. Estructura y responsabilidades

```text
Proyecto_Final/
├── README.md                         Estado y entrada operativa
├── informacion_nuestro_proyecto.md    Propuesta metodológica y técnica
├── informacion_concurso_investigacion.md  Extractos de las bases
├── iniciar.ps1                       Arranque local de cada servicio
├── docs/                             Avances, planificación y formatos
├── frontend/
│   └── src/
│       ├── pages/                    Pantallas y composición
│       ├── features/                 Catálogo, acceso, comparación,
│       │                             cuestionario, gestión y resultados
│       └── services/                 Cliente HTTP compartido
└── backend/
    ├── app/
    │   ├── api/                      Rutas y parte de las reglas
    │   ├── core/                     Configuración y seguridad
    │   ├── db/                       Conexión y metadatos
    │   ├── models/                   Persistencia
    │   ├── schemas/                  Validación y algunos contratos
    │   └── services/                 Catálogo e instrumento
    ├── migrations/                  Esquema versionado
    └── scripts/                     Cuentas, demos y asignaciones
```

La separación por funciones del frontend resulta apropiada. Se reutiliza el catálogo entre mapa y directorio, el comparador comparte selección mediante contexto y las peticiones se centralizan. TypeScript está configurado en modo estricto.

En el backend, la separación es más consistente en catálogo que en los módulos posteriores: autenticación, recepción del cuestionario, gestión y agregación contienen reglas directamente en `api/`. `management` y `results` importan dependencias desde otros módulos de rutas. Conviene extraer progresivamente las dependencias comunes de acceso y los servicios de gestión/resultados cuando se intervenga en ellos. No hace falta introducir una arquitectura más compleja.

Los estilos tienen nombres mayormente específicos, pero `catalog.css` contiene reglas globales de botones y foco; `styles.css` y `shell.css` comparten responsabilidades. Varios CSS y bloques JSX están comprimidos en líneas muy largas, lo que dificulta revisar cambios. Un formato consistente y estilos globales claramente separados mejorarían el mantenimiento.

## 3. Qué existe y qué falta

| Área | Evidencia en código | Límite actual |
|---|---|---|
| Catálogo | API, filtros, paginación, lista, ficha y mapa | Sin importador real ni edición visual de sedes |
| SIG | Puntos EPSG:4326, radio y distancia mediante PostGIS | Sin polígonos distritales, rutas ni análisis de concentración |
| Comparación | Hasta tres fichas consultadas por ID | Sin distancias comunes en tabla ni valoraciones integradas |
| Acceso | Cuentas locales, sesiones, tres roles, CSRF | Sin recuperación/cambio de contraseña ni administración visual de cuentas |
| Experiencias | Asignación estudiante/sede/periodo y habilitación | Periodo libre; sin historial de cambios |
| Cuestionario | Dos bloques de cinco ítems, consentimiento y versión | Siempre piloto; sin versión de campo |
| Resultados | Frecuencias, porcentajes, NA y participantes únicas | Versión actual únicamente; sin exportación ni análisis reproducible externo |
| Operación | Lanzador y guías para Windows | Sin despliegue de producción ni restauración comprobada |
| Investigación | Propuesta, guía y formatos de recopilación | Padrón, protocolo cerrado, aplicación y resultados pendientes |

El comparador y las encuestas están conectados mediante sedes/experiencias en la base, pero sus resultados no llegan a las fichas o a la tabla pública. Esta es una brecha relevante respecto de la idea de comparar alternativas usando experiencias estudiantiles. La restricción actual es explícita y razonable para el piloto; integrarlas después requiere definir qué agregados se pueden mostrar.

## 4. Documentación y coherencia de la investigación

### Dos enfoques metodológicos sin una referencia vigente única

`informacion_nuestro_proyecto.md`, líneas 37–39, propone desarrollar **y evaluar** si el sistema facilita la consulta frente al medio disponible. Más adelante describe tareas, tiempos y comparación contrabalanceada.

`docs/guia_informe_para_otra_ia.md`, líneas 45–59, registra explícitamente una preferencia posterior del equipo por un enfoque descriptivo basado en encuesta e información espacial; la comparación de tiempos pasa a ser opcional. Es un cambio documentado de enfoque, pero la propuesta principal sigue conservando los objetivos anteriores.

La acción necesaria es consolidar pregunta, objetivos, instrumentos y resultados esperados en una versión vigente, marcando los documentos previos como antecedentes. Si se mantiene el enfoque descriptivo, las conclusiones deben describir prioridades, experiencias y distribución espacial; no afirmar una mejora medida de decisiones o tiempos.

### Alcance inicial frente a entrega

La propuesta incluye importación CSV, verificación/edición de sedes, exportación agregada y una comparación más rica. La hoja de ruta declara los avances entregados, mientras que la guía operativa reconoce esas exclusiones. Falta una matriz única que clasifique cada requisito como implementado, pendiente, opcional o retirado del alcance aprobado.

La guía del informe también propone necesidades de información y evaluación posterior de uso. El instrumento real solo incluye prioridades y experiencia. El Formato 02 reconoce correctamente esta diferencia. No se deben incluir resultados sobre necesidades o facilidad de uso si no se recogen esas variables.

### Calidad y organización de los Markdown

Son fortalezas la conservación de la propuesta original, el registro de límites, las guías operativas y la distinción entre datos ficticios, piloto y campo. Las bases recibidas son extractos de tres páginas; no permiten determinar por sí solas el cronograma completo.

La carpeta `docs/` mezcla historia, instrucciones vigentes y preparación de investigación. Se recomienda un índice documental y, posteriormente, agrupar en `historial/`, `operacion/`, `investigacion/` y `arquitectura/`, actualizando enlaces. No es necesario mover todo para seguir trabajando.

Los dos formatos nuevos son útiles: uno prepara el padrón institucional y otro las decisiones del estudio, elegibilidad y resultados. Al iniciar esta revisión estaban sin seguimiento en Git y no figuraban en el índice del README. Conviene incorporarlos al registro de documentación cuando el equipo los dé por definitivos.

## 5. Hallazgos concretos del código

| Prioridad | Hallazgo | Consecuencia y acción sugerida |
|---|---|---|
| Alta para coherencia | `AboutPage.tsx:12–16` afirma que proximidad, cuestionarios y roles son futuros | Contradice rutas existentes. Actualizar el texto al estado real; separar lo implementado de lo validado |
| Alta para trazabilidad | `Site.source` existe en la base, pero no se selecciona en `services/catalog.py` ni se incluye en `SiteRead`; la ficha tampoco muestra fecha | El público ve «Verificado» sin poder consultar el sustento. Definir una fuente pública segura y mostrar fecha; no exponer referencias internas indiscriminadamente |
| Media | `AuthContext.tsx` recupera `/auth/me` al montar o al solicitar recarga; el cliente HTTP no invalida sesión ante 401 | Tras caducar o cambiar sesión en otra pestaña, la interfaz puede conservar usuario/rol obsoletos y repetir errores. Centralizar recuperación de sesión. La API sigue autorizando con el usuario real de cada petición |
| Media | `services/api.ts:22–30` descarta el cuerpo de error y usa mensajes por código HTTP | Se pierde la diferencia entre piloto cerrado, experiencia inhabilitada o cambio de versión; el 404 siempre habla de una sede. Definir códigos de error de dominio y mensajes seguros/contextuales |
| Media | `useCatalog.ts:30–34` vuelve a pedir distritos y categorías en cada búsqueda/página | Genera peticiones repetidas y el fallo de opciones hace fallar toda la carga. Separar su ciclo de carga del listado |
| Media para datos reales | `Experience.period` es texto libre y participa en una clave única | `2026-II` y `2026-2` pueden representar el mismo periodo sin ser iguales para la base. Acordar normalización o catálogo de periodos antes del campo |
| Media para trazabilidad | `management.py:92` reemplaza la referencia al cambiar estado | Se pierde el motivo anterior y no se conserva actor/fecha de modificación. Añadir historial si la gestión se usará con participantes reales |
| Media para evolución | `results.py` filtra exclusivamente `VERSION` y compara la copia del bloque con el bloque actual | Cambiar de versión deja los envíos anteriores fuera de la vista; editar una versión aplicada puede excluir respuestas. Mantener instrumentos inmutables y consulta explícita por versión |
| Baja | `HomePage.tsx:5` invita a revisar condiciones y experiencias por periodo | La comparación pública actual no ofrece esas valoraciones. Ajustar la promesa de la portada |

Los hallazgos describen el comportamiento deducible del código; no son incidencias reproducidas mediante ejecución.

## 6. Modelo de datos, SIG y seguridad

Las siete entidades implementadas son `District`, `Institution`, `Site`, `User`, `UserSession`, `Experience` y `SurveySubmission`. La distinción institución/sede y la vinculación experiencia/periodo son decisiones útiles. Las restricciones evitan duplicar asignaciones y envíos; los estados verificados requieren evidencia y fecha.

La implementación espacial usa longitud/latitud al construir puntos PostGIS y convierte explícitamente al orden de Leaflet. Las consultas convierten a `geography`, aplican `ST_DWithin`, calculan `ST_Distance` y ordenan antes de paginar. La migración 0002 incorpora el índice de expresión correspondiente. Hay análisis espacial implementado, aunque no se verificó su ejecución ni uso efectivo del índice.

El mapa representa la página actual de hasta doce sedes, no todo el padrón. La interfaz lo explica. La pertenencia a distrito es una asignación por clave, no un cálculo con polígonos. El círculo se dibuja en Leaflet; no se implementa `ST_Buffer`, aunque la propuesta original lo menciona entre posibilidades.

La base de seguridad incluye Argon2, tokens aleatorios almacenados como hash, cookies HttpOnly, roles comprobados en servidor y Origin/CSRF en escrituras autenticadas. Se limita el login y se evita reflejar SQL y cuerpos de validación al cliente. Estas medidas son visibles en código, no una certificación de seguridad.

Límites operativos relevantes: contador de login en memoria por proceso; configuración local HTTP; cuentas sin recuperación de contraseña; ausencia de auditoría de modificaciones y de validación automatizada. El manejo genérico de errores evita exponer detalles, pero tampoco registra aquí un diagnóstico interno estructurado, lo que dificultará distinguir problemas de conexión, esquema y consultas.

La base admite algunas inconsistencias si futuras herramientas escriben directamente: por ejemplo, la propiedad de una experiencia se comprueba en la API, pero las claves foráneas separadas no garantizan por sí solas que `SurveySubmission.user_id` sea el usuario de `experience_id`. No es un bypass encontrado en el endpoint actual; es una condición a preservar en futuros importadores.

## 7. Cuestionario, resultados y evidencia

La recepción controla rol estudiante, versión, cinco identificadores de ítems exactos, valores enteros de 1 a 5 o nulos, aceptación y experiencia habilitada. Conserva una copia del instrumento y aviso. PostgreSQL impide duplicados y se bloquea la asignación durante envío/cambio de estado.

Los agregados distinguen envíos de participantes, excluyen NA del denominador y conservan respuestas históricas de asignaciones deshabilitadas. Los datos incompatibles se excluyen y se informa su cantidad. Son decisiones consistentes con el alcance descriptivo.

Todavía no existe una cohorte de campo: prioridades mezcla los envíos piloto compatibles, incluidas cuentas demo; experiencias separa por la clasificación actual de la sede. `PILOT_SURVEY_ENABLED=true` abre recepción, pero todos los envíos siguen siendo piloto. Hace falta diseñar la separación antes de recoger datos definitivos.

La vista de resultados no suprime grupos pequeños y puede mostrar distribuciones de una sola persona. Está restringida a coordinación/administración y la documentación lo reconoce; no debe confundirse con una exportación anónima lista para publicar.

Los nombres, periodos y clasificación demo se obtienen de las tablas actuales, no de una fotografía histórica. Cualquier futura edición de esos metadatos requiere decidir cómo conservar cortes reproducibles. También falta extracción agregada para el informe y un procedimiento de análisis reproducible.

## 8. Reproducibilidad, operación y Git

El bloqueo npm está versionado y su entrada principal coincide con el manifiesto leído. Python declara rangos sin bloqueo reproducible. No hay suite de pruebas, configuración de lint ni CI en los archivos revisados. Existen comandos de tipos y compilación, pero no se ejecutaron durante esta revisión.

El lanzador local controla carpetas, dependencias presentes y puerto de interfaz, y no modifica automáticamente la base. Las migraciones separan correctamente creación de esquema y arranque de la API. `/ready` solo verifica PostGIS y la existencia de `sites`; no acredita que autenticación/cuestionario tengan todas sus tablas, límite que el README del backend sí documenta.

No se observaron cambios de archivos versionados al inicio, únicamente los dos formatos sin seguimiento. No se hicieron commits, cambios de rama ni publicación durante el análisis. `.gitignore` contempla secretos, dependencias, compilaciones, respaldos y datos privados, pero la revisión no equivale a una búsqueda exhaustiva de secretos en todo el historial Git.

## 9. Orden recomendado para continuar

1. **Cerrar la definición vigente del estudio.** Consolidar objetivos, población, ámbito, periodos y bloques del instrumento; resolver qué funciones se mantienen como requisito.
2. **Alinear documentación e interfaz.** Actualizar presentación, índice de documentos y matriz de alcance. Hacer visible la evidencia pública de verificación de sedes.
3. **Preparar el primer lote real.** Completar Formato 01, acordar categorías y periodos, y crear una carga validada con reporte de aceptados/rechazados y control de duplicados.
4. **Validar el flujo existente cuando se habilite esa etapa.** Tipos/build, instalación y migraciones limpias, radio con casos conocidos, permisos, CSRF, duplicados, NA, agregados, sesión caducada y uso móvil/teclado. Registrar resultados efectivos.
5. **Preparar campo y análisis.** Instrumento fijo revisado, separación piloto/campo, ventana de aplicación y exportación agregada compatible con el informe.
6. **Cerrar operación y entrega.** Respaldo/restauración comprobados, instrucciones reproducibles y publicación solo si forma parte del alcance acordado.

El siguiente avance más útil es cerrar coherencia, datos y verificación. Agregar más pantallas o un índice de conveniencia antes de resolver esas dependencias ampliaría el trabajo sin aportar todavía evidencia al estudio.
