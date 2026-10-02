# Formato 01 — Datos reales para el catálogo de sedes

**Quién lo completa:** el equipo del proyecto, consultando fuentes institucionales y la ubicación de cada sede. No es una encuesta para las estudiantes.

**Cómo usarlo:** duplica la ficha de la sección 2 por cada sede física. Escribe `PENDIENTE` cuando falte información; no inventes valores. Puedes empezar con una sola sede completa. Guarda tu copia rellenada fuera del repositorio si contiene referencias internas.

Este documento prepara los datos: no los importa automáticamente ni publica nada en la web. Cuando esté completo, se podrá preparar una carga acorde al modelo existente. No necesitas buscar ni crear UUID: son identificadores técnicos que asignará el sistema.

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
