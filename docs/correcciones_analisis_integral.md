# Correcciones del análisis integral

Actualización final: 2 de octubre de 2026. Código y documentación posteriores al avance 10. Rama local: `codex/correcciones-analisis-integral`.

## Cambios implementados

- Inicio y Proyecto describen las funciones actuales y los límites del piloto.
- Ficha y comparador muestran fecha en hora de Lima y referencia pública, con estado explícito cuando falta.
- La evidencia interna `sites.source` permanece privada; el nuevo campo `public_source` contiene únicamente texto revisado para publicación. Se representa como texto, sin interpretar HTML.
- Sesión: recuperación al volver a la ventana, aviso entre pestañas mediante BroadcastChannel y reacción centralizada a 401/403. Las respuestas de recuperaciones canceladas no reemplazan una sesión nueva. No se reenvían escrituras automáticamente ni se almacenan tokens en localStorage.
- Errores: se conservan los mensajes públicos de la API para 4xx; errores 5xx mantienen texto genérico. Los fallos SQL se registran por categoría e identificador de incidencia sin SQL, parámetros ni credenciales.
- Distritos y categorías se cargan independientemente del listado; escribir o paginar ya no repite sus consultas. Un fallo de opciones no vacía las sedes. Hay reintento separado.
- Periodos: se unifican espacios, mayúsculas y variantes semestrales `2026-1`, `2026/I`, `2026-I` y sus equivalentes de segundo semestre. Los periodos históricos no se reescriben. Una asignación equivalente existente impide un alta duplicada desde la API; el comando local la reutiliza. Si hay varias equivalencias históricas, el comando solicita gestionarlas por ID en la web y no fusiona respuestas.
- Historial de experiencias: registra responsable web, fecha, estado y referencia anterior/nueva dentro de la misma transacción. El comando local identifica su origen como `local_script`, sin atribuirlo a una cuenta ficticia. La gestión ofrece consulta paginada de eventos.
- Registro de instrumentos: `pilot_2026_v1.py` conserva los textos aplicados. El panel permite seleccionar una versión piloto registrada; el cálculo usa sus ítems, no necesariamente los de la versión de recepción vigente. No se añadieron preguntas ni se cambiaron textos de la v1.
- Dependencias de autenticación y base compartidas en `api/dependencies.py`; normalización y registro de eventos compartidos en `services/experiences.py`.
- Los controles globales salen del CSS del catálogo y se cargan desde `controls.css`.
- `/ready` comprueba las tablas de los módulos actuales y la columna de fuente pública, además de PostGIS. No sustituye las pruebas funcionales ni una comparación completa del esquema.
- [Definición vigente](definicion_vigente.md) e [índice documental](README.md) consolidan el enfoque descriptivo y separan alcance actual e historial.

## Actualización de la base local

Esta entrega añade dos migraciones y no las ejecuta:

| Migración | Cambio |
|---|---|
| `0005_public_source` | Referencia pública opcional de la sede; inicialmente nula |
| `0006_experience_events` | Historial de asignaciones; inicialmente vacío |

Con el backend detenido y una copia de seguridad disponible, desde la raíz:

```powershell
cd backend
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Después, inicia los servicios con `iniciar.ps1` según el README. La API actual necesita el esquema actualizado. Las migraciones no copian referencias privadas a públicas, ni inventan quién hizo cambios históricos, ni modifican respuestas del cuestionario. No hay dependencias nuevas.

## Registrar una fuente pública

Con la migración aplicada, desde `backend`, reemplaza el identificador por el UUID real de la sede:

```powershell
.\.venv\Scripts\python.exe -m scripts.set_public_source --site UUID_DE_LA_SEDE
```

El comando solicita una referencia de 1–1000 caracteres que el equipo haya revisado para publicación. Puede incluir título de documento, entidad, fecha de consulta o enlace público; no datos personales ni referencias restringidas. No modifica `source`, `verified_at` o `verification_status`: publicar una referencia no verifica una sede. Para retirarla, usar el mismo comando con `--clear`.

## Conservar versiones del instrumento

No editar `pilot_2026_v1.py` después de aplicar esa versión. Para una futura versión, crear otro módulo y añadirlo al registro en `questionnaire.py`, manteniendo las anteriores. Cambiar la versión de recepción solo cuando corresponda al protocolo. Los resultados aceptan `version` en `/results/options` y `/results/summary`; omitirlo selecciona la vigente. Una versión desconocida devuelve 404.

El registro actual solo contiene `pilot-2026-v1`. La recepción y el panel siguen limitados al piloto. Esta corrección no habilita campo ni anonimiza agregados. Los metadatos de sede/periodo siguen siendo los actuales.

## Pendientes que requieren otro trabajo o información

Importador/gestión del padrón real, exportación agregada, integración pública de valoraciones, versión de campo, padrón y decisiones académicas, publicación y recuperación de cuentas. Se conservan en la matriz de alcance; no se presentan como resueltos por estas correcciones.

## Validación pendiente

Se revisan los cambios por lectura y diff. Por la restricción registrada del proyecto, no se ejecutan builds, tests, servidores, endpoints ni migraciones en esta entrega. No se declara funcionamiento validado.

Cuando se habilite la ejecución, los casos relevantes son:

1. Migrar una copia del esquema 0004 con datos existentes y confirmar que conserva sedes/respuestas y no publica `source`.
2. Comprobar tipos/build y arranque con esquema 0006; comprobar el fallo de `/ready` con esquema incompleto.
3. Registrar/retirar fuente pública; verla en listado, búsqueda espacial, ficha y comparador.
4. Caducar sesión, alternar cuentas entre pestañas y simular respuestas tardías; comprobar que no persisten datos del usuario anterior.
5. Recibir errores 403 específicos y errores 5xx; no exponer diagnósticos internos ni repetir POST automáticamente.
6. Fallar `/districts` y comprobar que `/sites` sigue mostrándose; escribir y paginar sin volver a pedir opciones.
7. Crear una experiencia con periodo variante; repetir con forma canónica y comprobar conflicto. Probar antecedentes equivalentes sin fusionarlos.
8. Crear/cambiar estado desde web y comando; comprobar evento y asignación en la misma transacción, acceso solo de personal y paginación del historial.
9. Probar selección de versión registrada/desconocida y distribuciones con NA; confirmar que añadir otra versión no oculta las anteriores.
