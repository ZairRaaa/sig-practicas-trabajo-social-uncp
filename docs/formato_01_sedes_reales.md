# Formato 01 — Datos reales para el catálogo de sedes

**Quién lo completa:** el equipo del proyecto, consultando fuentes institucionales y la ubicación de cada sede. No es una encuesta para las estudiantes.

**Cómo usarlo:** duplica la ficha de la sección 2 por cada sede física. Escribe `PENDIENTE` cuando falte información; no inventes valores. Puedes empezar con una sola sede completa. Guarda tu copia rellenada fuera del repositorio si contiene referencias internas.

Este documento guía la recopilación. La [sección 5](#5-preparar-y-cargar-el-csv-en-windows) explica cómo generar el CSV, revisar las fichas y cargar las sedes. El importador asigna los UUID a partir de los códigos de trabajo.

## 1. Alcance del catálogo

| Dato | Completar |
|---|---|
| Distritos/provincias que incluirá el proyecto | [COMPLETAR] |
| Periodo al que corresponde la revisión del padrón | [COMPLETAR] |
| Número de instituciones identificadas | [COMPLETAR o PENDIENTE] |
| Número de sedes físicas identificadas | [COMPLETAR o PENDIENTE] |
| Fuente principal del padrón | [Nombre de documento, entidad o enlace] |
| ¿Se ha confirmado qué información puede publicarse? | [Sí / No / Pendiente; indicar sustento] |

Una institución puede tener varias sedes. Si comparten institución, usa exactamente el mismo nombre institucional en todas sus fichas. La categoría del modelo actual corresponde a la institución; no asignes categorías contradictorias a sus sedes.

## 2. Ficha de sede — duplicar por cada ubicación

### A. Información que podrá mostrarse en la web

| Campo | Completar | Cómo completarlo |
|---|---|---|
| Código de trabajo | [SEDE-001] | Código temporal para relacionar documentos; no es un UUID |
| Nombre oficial de la institución | [COMPLETAR] | Máximo 200 caracteres; conservar el nombre oficial |
| Nombre de esta sede | [COMPLETAR] | Máximo 200 caracteres; distinguir sucursal o local |
| Categoría/ámbito institucional | [COMPLETAR] | Máximo 80 caracteres; por ejemplo salud, educación o gobierno local, si corresponde. Acordar categorías consistentes |
| Departamento | [COMPLETAR] | Contexto para identificar el distrito; no hay campo propio en el modelo actual |
| Provincia | [COMPLETAR] | Contexto para identificar el distrito; no hay campo propio en el modelo actual |
| Distrito | [COMPLETAR] | Nombre real; no reutilizar los distritos sintéticos de las demos |
| UBIGEO del distrito, si lo tienes | [COMPLETAR o PENDIENTE] | Seis dígitos con fuente; no adivinar. Podemos resolverlo después |
| Dirección pública de la sede | [COMPLETAR] | Máximo 300 caracteres; no usar el domicilio de una estudiante |
| Descripción breve | [COMPLETAR] | Dos a cuatro frases sobre la sede y su relación documentada con Trabajo Social; evitar promesas de vacantes o convenios sin evidencia |
| Referencia pública de la fuente | [COMPLETAR o PENDIENTE] | Hasta 1000 caracteres revisados para publicación: entidad, documento o enlace público. Campo `public_source`; no incluir referencias restringidas |
| Latitud | [COMPLETAR o PENDIENTE] | Número decimal, con punto y signo; coordenadas WGS84 |
| Longitud | [COMPLETAR o PENDIENTE] | Número decimal, con punto y signo; conservar el orden latitud/longitud |
| Enlace de ubicación | [PEGAR ENLACE o PENDIENTE] | Enlace directo al lugar que ayude a localizarlo, no una búsqueda genérica de toda la ciudad |

**Si no sabes obtener las coordenadas:** entrega dirección, distrito y enlace al lugar. Deja latitud y longitud pendientes. Antes de incorporar el punto al mapa habrá que resolver y revisar esa ubicación; el esquema necesita coordenadas para registrar una sede.

### B. Fuente y revisión — control del equipo

| Campo | Completar |
|---|---|
| Fuente del nombre, dirección y descripción | [Enlace/documento/entidad, con título identificable] |
| Fuente de las coordenadas o ubicación | [Enlace/mapa/registro de campo] |
| Fecha de consulta de la fuente | [AAAA-MM-DD] |
| ¿La ubicación corresponde a este local, no a otra sede? | [Confirmado / Pendiente] |
| Fecha de revisión de la ficha | [AAAA-MM-DD o PENDIENTE] |
| Responsable de revisión | [Rol o código interno; no hace falta compartir nombre personal] |
| Estado de revisión | [Pendiente / Revisado con evidencia] |
| ¿Mostrar esta sede en el catálogo? | [Sí / No / Pendiente de decisión] |
| Sustento o condición para publicar estos datos | [Referencia o PENDIENTE] |
| Observaciones o discrepancias entre fuentes | [COMPLETAR o NINGUNA] |

Una dirección publicada en un mapa ayuda a ubicar el local, pero no acredita convenio, elegibilidad para prácticas ni plazas disponibles. «Revisado» requiere evidencia; no basta con que el formulario esté completo. El estado técnico `active` controla visibilidad, no acredita vigencia de convenios. Los datos reales se registrarán como `is_demo=false`; no se transformarán las demos en sedes reales sobrescribiendo sus identidades.

### C. Información opcional para decidir futuras ampliaciones

Estos datos **no tienen campos estructurados ni funciones de gestión en la web actual**. Completa solo si cuentas con fuentes y quieres incorporarlos más adelante.

| Dato opcional | Valor y fuente |
|---|---|
| Existencia/vigencia de convenio | [COMPLETAR o PENDIENTE] |
| Periodos en que recibió practicantes | [COMPLETAR o PENDIENTE] |
| Requisitos institucionales de prácticas | [COMPLETAR o PENDIENTE] |
| Actividades formativas documentadas | [COMPLETAR o PENDIENTE] |
| Horarios institucionales de atención | [COMPLETAR o PENDIENTE] |
| Contacto institucional autorizado para publicación | [COMPLETAR o PENDIENTE; no teléfonos personales] |

No hace falta recoger datos de personas atendidas, casos sociales, nombres de supervisores o documentos personales para alimentar el mapa.

## 3. Resumen de sedes recopiladas

| Código de trabajo | Institución | Sede | Distrito | ¿Ubicación resuelta? | ¿Fuente documentada? | Estado de publicación |
|---|---|---|---|---|---|---|
| SEDE-001 | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] | [Sí/No] | [Sí/No] | [Decisión] |
| SEDE-002 | [COMPLETAR] | [COMPLETAR] | [COMPLETAR] | [Sí/No] | [Sí/No] | [Decisión] |

## 4. Qué entregarme primero

Entrega la sección 1 y al menos una ficha con institución, sede, categoría, distrito, dirección, descripción, fuente y ubicación o enlace. Con eso podremos detectar qué falta y preparar la incorporación de datos reales sin solicitar contraseñas ni acceso a tu cuenta de PostgreSQL.

El catálogo también aporta al informe: cantidad de sedes registradas, distribución por distrito/ámbito y cobertura del padrón. No llamar a ese registro «todas las sedes existentes» si el padrón no es exhaustivo.

## 5. Preparar y cargar el CSV en Windows

Conserva la sección 1 como ficha general del padrón. Define el ámbito y el periodo, identifica la fuente principal y registra los conteos que conozcas y qué información se puede publicar. Completa una fila del CSV por sede física. Los campos opcionales de la sección 2C y la información de investigación del [Formato 02](formato_02_investigacion_y_resultados.md) se conservan por separado.

Desde la raíz del proyecto en PowerShell, genera una plantilla vacía en `data/private/`, carpeta excluida de Git. El comando conserva el archivo si ya existe.

```powershell
cd backend
New-Item -ItemType Directory -Force -Path ..\data\private | Out-Null
$padron = '..\data\private\sedes_reales.csv'
.\.venv\Scripts\python.exe -m scripts.import_sites $padron --plantilla
```

Guarda el CSV en UTF-8 con los encabezados de la plantilla. Se admite punto y coma o coma como separador de columnas. Mantén el UBIGEO como texto para conservar ceros iniciales, las fechas como `AAAA-MM-DD` y las coordenadas con punto decimal.

| Campos del CSV | Qué completar |
|---|---|
| `codigo_sede`, `institucion`, `sede`, `categoria` | Un código único y estable como `SEDE-001`, el nombre oficial de la institución, el nombre de la sede física y un ámbito consistente. Usa el mismo nombre y categoría para las demás sedes de esa institución. |
| `departamento`, `provincia`, `distrito`, `direccion`, `descripcion` | Ubicación administrativa, dirección pública y descripción breve respaldada. |
| `latitud`, `longitud`, `fuente_ubicacion`, `enlace_ubicacion` | Coordenadas WGS84 y su fuente o enlace directo al local. Puedes comenzar con el enlace. La vista previa señalará que faltan las coordenadas mientras estén pendientes. |
| `fuente_institucional`, `fecha_consulta` | Referencia identificable que respalde la ficha y fecha en que se consultó. |
| `ubicacion_confirmada`, `estado_revision`, `fecha_revision`, `responsable_revision` | Para verificar una sede, indica `Confirmado` y `Revisado con evidencia`, la fecha de revisión y el rol o código del responsable. Usa `Pendiente` donde corresponda. |
| `mostrar_catalogo`, `sustento_publicacion` | Decide `Sí` o `No`. Para `Sí`, completa la revisión y registra el sustento de publicación. Con `No`, la sede se registra inactiva. Si la decisión sigue pendiente, la fila requiere corrección. |
| `ubigeo`, `fuente_ubigeo` | Añade el código oficial de seis dígitos y su fuente si los tienes. Sin código se conserva el distrito en la evidencia de la ficha y queda pendiente en el catálogo y su filtro. |
| `referencia_publica`, `observaciones` | Opcionales. Escribe en `referencia_publica` solo texto autorizado para aparecer en la web. Las referencias internas y las observaciones se guardan en la evidencia privada. |

**Vista previa del archivo.** Desde `backend`, usa el mismo `$padron` en PowerShell. El informe muestra la línea, el código, el estado y las correcciones o avisos. Comprueba campos, formatos, rangos de coordenadas y posibles conflictos dentro del lote. La correspondencia entre las coordenadas, el local y el UBIGEO se revisa con las fuentes del equipo.

```powershell
.\.venv\Scripts\python.exe -m scripts.import_sites $padron
```

**Consulta y carga local.** Con una copia de seguridad disponible, aplica las migraciones pendientes si corresponde y consulta la base configurada en `backend/.env`. La consulta es de solo lectura y añade conflictos con registros existentes a la vista previa.

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m scripts.import_sites $padron --consultar-base
```

Cuando el informe muestre cero fichas con correcciones, ejecuta la carga explícita:

```powershell
.\.venv\Scripts\python.exe -m scripts.import_sites $padron --aplicar
```

La carga inserta las nuevas fichas como `is_demo=false` en una sola transacción. Una corrección pendiente bloquea todo el lote. Al repetir un lote idéntico, las filas ya ingresadas se identifican por su código y UUID. Un conflicto que implique cambiar una sede existente requiere revisión aparte. Conserva los códigos y la salida con sus UUID para vincular las fichas del Formato 02 con el catálogo.

## 6. Vista local de sedes candidatas

Territorio incluye una selección preliminar de cuatro sedes de la provincia de Huancayo con fuentes públicas. Incluye Huayucachi como candidata al ámbito del padrón. Las fichas distinguen el servicio o convenio documentado de las asignaciones y plazas que debe confirmar la coordinación. Las fotos incluidas acreditan autoría, licencia y lugar representado.

Para ver la selección desde la raíz, activa el catálogo preliminar solo en la terminal del frontend:

```powershell
$env:VITE_CATALOGO_PREVIO = 'true'
.\iniciar.ps1 -Servicio frontend
```

Abre el [explorador local](http://localhost:5173/explorar). Este modo de desarrollo lee las fichas del proyecto y usa Leaflet para estimar las distancias del catálogo preliminar. El acceso por roles, las experiencias y el piloto usan el backend habitual. Para regresar al catálogo PostgreSQL, detén Vite, quita la variable con `Remove-Item Env:VITE_CATALOGO_PREVIO` y vuelve a iniciar el frontend.
