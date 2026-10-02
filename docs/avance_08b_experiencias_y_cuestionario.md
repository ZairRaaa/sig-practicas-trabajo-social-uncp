# Avance 08B — Experiencias y cuestionario piloto

Actualización 09A: ya puedes habilitar experiencias desde **Mi cuenta → Gestionar experiencias** con tu administrador. Consulta [la guía de gestión visual](avance_09a_gestion_de_experiencias.md). El comando descrito abajo sigue siendo una alternativa local.

Este avance incorpora `/cuestionario`, accesible desde Mi cuenta. El administrador consulta el instrumento; las cuentas con rol `student` pueden responder cuando se habilite la recepción. No hay resultados inventados ni respuestas cargadas automáticamente.

## Alcance

- Prioridades: cinco ítems sobre elección de centro, sin exigir experiencia previa.
- Experiencia: cinco ítems sobre una sede y periodo habilitados para esa estudiante por el responsable local.
- Escalas independientes de 1 a 5 y opción «No aplica / no puedo evaluar», almacenada como nulo, nunca como cero.
- Aviso de participación voluntaria y aceptación por envío. Las respuestas están vinculadas a la cuenta: no son anónimas.
- Un envío por estudiante, versión y bloque o experiencia; restricción única en PostgreSQL contra duplicados concurrentes.
- Guarda fecha, versión y copia del bloque y aviso aplicados. No modificar preguntas de una versión ya aplicada: crear una nueva.
- Borradores solo en memoria; cambiar de bloque, experiencia, actualizar estado o salir los descarta. Sin edición después del envío.
- Validación del rol, propietario y habilitación de la experiencia en el servidor; protección de escritura con sesión, Origin y CSRF.

## Preparación local

Detén el backend con Ctrl+C. Desde la raíz del proyecto:

```powershell
cd backend
.\.venv\Scripts\python.exe -m alembic upgrade head
```

La migración `0004_surveys` añade `experiences` y `survey_submissions`. No requiere nuevas dependencias ni cambios manuales en PostGIS.

En `backend/.env`, añade o actualiza esta línea para recibir respuestas del piloto:

```dotenv
PILOT_SURVEY_ENABLED=true
```

Por defecto es `false`. Al desactivarlo se rechazan nuevos envíos; los anteriores se conservan. Reinicia el backend después de cambiar esta configuración.

Si todavía no tienes una cuenta estudiante, créala desde `backend`:

```powershell
.\.venv\Scripts\python.exe -m scripts.create_user --username estudiante01 --role student
```

No recrees el administrador ni una cuenta ya existente. La herramienta solicita nombre visible y contraseña en tu terminal.

Para habilitar el segundo bloque, copia el `id` UUID de una sede desde el listado público de sedes en `http://localhost:8000/docs` y reemplaza `UUID_DE_LA_SEDE`:

```powershell
.\.venv\Scripts\python.exe -m scripts.assign_experience --student estudiante01 --site UUID_DE_LA_SEDE --period "2026-II" --reference "DEMO: piloto técnico, no acredita prácticas reales"
```

Usa las sedes demo y cuentas destinadas al piloto técnico para recorrer la aplicación. Habilitar una experiencia no crea respuestas. Para retirar la habilitación, repite los mismos estudiante, sede y periodo añadiendo `--disable` y una referencia del motivo. Los envíos previos se conservan. La referencia no debe incluir datos de personas atendidas.

No necesitas una asignación para responder prioridades. La administración visual de experiencias corresponde al avance 09; por ahora se usa este comando local.

## Arranque y uso

En `backend`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

En otra terminal, desde la raíz:

```powershell
cd frontend
npm run dev
```

En React, entra como estudiante y abre **Mi cuenta → Ir al cuestionario**. Con `admin`, el enlace es **Consultar instrumento** y no permite enviar. Ante un corte de conexión durante el envío, utiliza **Actualizar estado** antes de volver a responder: el servidor podría haber guardado la respuesta aunque el navegador no recibiera la confirmación.

## Organización técnica

| Capa | Archivos y responsabilidad |
|---|---|
| Instrumento | `backend/app/services/questionnaire.py`: textos, escalas, aviso y versión |
| Persistencia | `models/survey.py` y migración 0004: experiencias y envíos |
| Validación | `schemas/survey.py`: escala, consentimiento y forma del bloque |
| API | `api/survey.py`: consulta y recepción autorizada |
| Operación local | `scripts/assign_experience.py`: habilitar/deshabilitar experiencias |
| Interfaz | `pages/QuestionnairePage.tsx`: sesión, carga, selección y estado |
| Formulario | `features/survey`: tipos, preguntas, envío y estilos adaptables |

Rutas: `GET /api/v1/survey/instrument` para cuentas autenticadas; `GET /api/v1/survey/participation` y `POST /api/v1/survey/submissions` para estudiantes. No se exponen respuestas individuales en estas consultas ni en el catálogo público.

## Uso en la investigación

El instrumento es una propuesta piloto, no está validado. Todos los registros de esta entrega llevan `is_pilot=true`, incluso al habilitar la recepción. No deben presentarse como resultados definitivos. Antes de recolectar los datos del informe deben cerrarse objetivos, variables, población/muestra, elegibilidad, revisión académica, consentimiento y condiciones de tratamiento de datos; después se publicará una versión para el trabajo de campo.

Separar resultados de prioridades de resultados de experiencia. No convertir «no aplica» en cero ni mezclar demo/piloto con datos de campo. La experiencia exige haber realizado prácticas en la sede correspondiente; una asignación técnica por sí sola no acredita ese hecho. El diseño actual permite recoger percepciones, no demostrar causalidad ni que el sistema mejore el desempeño profesional.

Pendiente para 09: gestión visual, resultados agregados con denominadores válidos y control de acceso. No se implementan todavía exportaciones, anonimización, edición de respuestas ni informes estadísticos.

## Estado de entrega

Código generado sin tests, compilación, consultas HTTP, ejecución de migraciones, consultas a PostgreSQL ni inspección visual, conforme a lo solicitado. Su funcionamiento queda pendiente de ejecución local.
