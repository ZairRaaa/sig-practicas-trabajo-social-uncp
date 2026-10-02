# Avance 09A — Gestión visual de experiencias

**Historial de entrega.** Las [correcciones posteriores](correcciones_analisis_integral.md) incorporan normalización de periodos e historial de cambios con migración 0006. Las limitaciones sobre ausencia de historial descritas abajo corresponden a la versión original de 09A.

Ahora puedes habilitar experiencias desde la aplicación, sin buscar UUID ni ejecutar `assign_experience`. Los comandos de 08B siguen disponibles, pero ya no son necesarios para esta tarea cotidiana.

## Cómo utilizarlo

1. Mantén el backend y React encendidos. Reinicia el backend si no se recarga automáticamente.
2. Inicia sesión con tu cuenta `admin` o una cuenta con rol `coordinator`.
3. Abre **Mi cuenta → Gestionar experiencias**, o visita `http://localhost:5173/gestion`.
4. En **Habilitar una experiencia**, busca y selecciona la estudiante por nombre o usuario.
5. Busca y selecciona una sede. Las sedes de demostración aparecen identificadas como demo.
6. Escribe el periodo, por ejemplo `2026-II`, y una referencia, por ejemplo `DEMO: piloto técnico`.
7. Pulsa **Habilitar experiencia**. La asignación se registra y se actualiza el listado.
8. La estudiante puede entrar a **Mi cuenta → Ir al cuestionario → Mi experiencia** y seleccionar esa sede. Si ya tenía el cuestionario abierto, debe pulsar **Actualizar estado**.

La estudiante que ya creaste y las asignaciones hechas con el comando anterior sirven directamente. No debes recrearlas. La creación de cuentas continúa con `scripts.create_user`; este avance gestiona sus experiencias.

## Qué permite el listado

- Buscar por estudiante, usuario, sede o periodo.
- Filtrar habilitadas, deshabilitadas o todas.
- Consultar resultados paginados de diez asignaciones.
- Deshabilitar y volver a habilitar mediante un formulario con motivo y confirmación explícita.
- Identificar sedes demo y asignaciones cuya cuenta o sede dejaron de estar activas.

Deshabilitar bloquea nuevos envíos para esa experiencia y conserva las respuestas anteriores. Volver a habilitar no permite contestar de nuevo una versión ya respondida. El bloque de prioridades no depende de estas asignaciones.

El motivo del cambio reemplaza la referencia vigente en la tabla existente. No se presenta como un historial de auditoría: este avance no conserva una secuencia de motivos ni el autor de cada cambio. No hay eliminación de experiencias ni modificación de sus estudiante, sede y periodo.

## Base de datos y recepción del piloto

No hay nuevas dependencias, tablas ni migraciones en 09A. Se reutiliza la migración `0004_surveys` del avance anterior. Si todavía no la aplicaste, desde `backend`:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Gestionar asignaciones es independiente de abrir la recepción: para enviar respuestas se mantiene la configuración de `backend/.env`:

```dotenv
PILOT_SURVEY_ENABLED=true
```

Reinicia el backend después de cambiar esa configuración. Todos los envíos siguen siendo piloto, pendientes de revisión académica antes del trabajo de campo. Una habilitación técnica no acredita por sí sola prácticas reales.

## Organización

| Archivo | Responsabilidad |
|---|---|
| `backend/app/api/management.py` | Búsqueda de opciones, listado, creación y cambios de estado |
| `backend/app/schemas/management.py` | Validación de identificadores, periodo, referencia y estado |
| `frontend/src/pages/ManagementPage.tsx` | Acceso por rol y composición de la página |
| `frontend/src/features/management/ChoiceField.tsx` | Búsquedas y selección por nombre |
| `frontend/src/features/management/ExperienceForm.tsx` | Alta de asignación |
| `frontend/src/features/management/ExperienceList.tsx` | Filtros, paginación y cambios de estado |
| `frontend/src/features/management/management.css` | Presentación adaptable a escritorio y móvil |

## API y permisos

Todas las rutas requieren cuenta activa `admin` o `coordinator`, incluso si se consultan directamente. Las estudiantes no pueden acceder al padrón ni asignarse experiencias. Los datos de gestión se devuelven con `Cache-Control: no-store`.

| Método y ruta | Uso |
|---|---|
| `GET /api/v1/management/options?kind=students` | Hasta 50 estudiantes activas, con búsqueda `q` |
| `GET /api/v1/management/options?kind=sites` | Hasta 50 sedes activas, con búsqueda `q` |
| `GET /api/v1/management/experiences` | Listado paginado con `q`, `enabled`, `offset` y `limit` |
| `POST /api/v1/management/experiences` | Habilitar una nueva asignación |
| `POST /api/v1/management/experiences/{id}/state` | Cambiar estado y referencia |

Las escrituras requieren Origin permitido y token CSRF. La restricción única en PostgreSQL evita duplicar estudiante/sede/periodo. Los cambios bloquean la fila durante la operación y comprueban el estado esperado; si difiere, se pide actualizar el listado. Esto no constituye un control de versiones de todo el registro.

No se devuelven contraseñas ni respuestas del cuestionario en este módulo. Los nombres y referencias quedan en la gestión protegida. Si se interrumpe la conexión durante un envío, consulta el listado actualizado antes de repetir la operación.

## Alcance y siguiente parte

09A cubre exclusivamente gestión de experiencias. Quedan fuera edición del catálogo, administración visual de cuentas, historial de auditoría y resultados agregados. Los resultados del cuestionario corresponden a 09B.

Código entregado sin ejecutar tests, compilaciones, solicitudes HTTP, consultas a la base ni comprobaciones visuales, por indicación del usuario. Funcionamiento pendiente de ejecución local.
