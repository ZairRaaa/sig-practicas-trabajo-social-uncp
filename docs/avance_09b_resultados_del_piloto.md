# Avance 09B — Resultados descriptivos del piloto

**Historial de entrega.** Las [correcciones posteriores](correcciones_analisis_integral.md) añaden selección de versión registrada en el panel. Las referencias a una única versión expuesta describen la entrega original de 09B. El registro actual sigue conteniendo únicamente el piloto v1.

## Acceso y uso

1. Mantén React y el backend encendidos. Reinicia el backend si no utiliza recarga automática.
2. Entra con tu administrador o una cuenta de coordinación.
3. Abre **Mi cuenta → Ver resultados del piloto**, o `http://localhost:5173/resultados`. También hay un enlace desde Gestión de experiencias.
4. Selecciona **Prioridades** o **Experiencias**.
5. En experiencias, selecciona tipo de sede, sede y periodo. Solo se ofrecen sedes y periodos con envíos registrados para esta versión piloto.
6. Pulsa **Actualizar resultados** después de recibir nuevos envíos. No hay actualización automática en segundo plano.

No hay nuevas dependencias ni migraciones. Se reutilizan las respuestas guardadas en el avance 08B. Abrir esta página no crea ni modifica respuestas. Puedes consultar los resultados aunque `PILOT_SURVEY_ENABLED=false`: ese interruptor solo controla nuevos envíos.

Si todavía no hay respuestas, la página muestra un estado vacío. No se generan resultados de ejemplo. Para recorrer el flujo local, una cuenta estudiante debe responder el cuestionario piloto y luego el administrador puede consultar esta vista.

## Qué muestra

- Número de envíos incluidos en la selección.
- Número de participantes distintas dentro de esa selección.
- Por cada ítem: frecuencia de cada alternativa de 1 a 5, porcentaje, barra visual y cantidad «No aplica / no puedo evaluar».
- Versión del instrumento y fecha de cálculo, presentada en hora de Lima.
- Cantidad de registros excluidos por estructura o copia del instrumento incompatibles.

Las tablas acompañan los gráficos para que los valores no dependan del color ni del ancho de las barras. La página se adapta a pantallas pequeñas; las tablas permiten desplazamiento horizontal cuando haga falta.

## Cómo se calculan los valores

Para cada ítem:

`respuestas válidas = conteos de las alternativas 1 + 2 + 3 + 4 + 5`

`porcentaje de una alternativa = conteo de esa alternativa / respuestas válidas × 100`

«No aplica» se cuenta por separado y nunca se convierte en cero. Cuando no existen respuestas válidas, el porcentaje es nulo y la interfaz muestra un guion. Se redondea a un decimal; la suma puede diferir ligeramente de 100 %.

Un envío de prioridades corresponde a una estudiante y versión. En experiencias, una estudiante puede tener varios envíos por sedes o periodos diferentes. Los porcentajes de ese bloque describen respuestas por experiencia, no porcentajes de personas únicas. No se suman las participantes de ambos bloques porque pueden ser las mismas personas.

No se calcula tasa de participación: falta definir un padrón de invitadas y una ventana de aplicación que sirvan como denominador. Tampoco se presentan promedios globales, un índice de calidad, ranking, significancia estadística o inferencias causales.

## Selección y conservación de datos

Solo se incluyen registros `is_pilot=true` de la versión actual definida en `services/questionnaire.py`. Cada registro debe contener exactamente los ítems esperados, valores nulos o enteros entre 1 y 5 y una copia del bloque igual a la versión actual. Los registros incompatibles se excluyen completos y se informa cuántos fueron excluidos.

Las sedes demo y no demo se consultan por separado. «Sede no demo» no convierte sus respuestas piloto en datos definitivos. Prioridades no tiene sede ni periodo de prácticas asociado; reúne todos los envíos piloto compatibles de ese bloque, incluidas cuentas utilizadas para demostración. No sirve para separar por cohorte de campo.

Se conservan en los agregados las respuestas históricas de asignaciones, sedes o cuentas que luego se deshabilitaron. Los nombres de sedes, periodos y clasificación demo provienen de las tablas actuales; no constituyen una fotografía histórica de esos metadatos. Si en el futuro se permite editarlos, será necesario definir su versionado antes de comparar cortes históricos.

## Acceso y privacidad

Frontend y API restringen la consulta a `admin` y `coordinator` con cuenta activa. Las respuestas llevan `Cache-Control: no-store`. No se envían nombres de estudiantes, usuarios ni respuestas individuales al navegador de resultados. Los identificadores de participante se utilizan únicamente dentro del servidor para contar personas distintas.

Esta vista interna no es un mecanismo de anonimización: no suprime grupos pequeños y los filtros podrían permitir inferir respuestas en grupos de una o pocas personas. No se incorpora al catálogo público ni se implementa una exportación. Antes de publicar tablas de campo se deben definir reglas de divulgación y agrupación acordes con el protocolo de investigación.

## Arquitectura

| Archivo | Responsabilidad |
|---|---|
| `backend/app/api/results.py` | Opciones de filtros, validación y agregación de registros piloto |
| `frontend/src/pages/ResultsPage.tsx` | Acceso, filtros, cargas cancelables y estados vacíos/error |
| `frontend/src/features/results/types.ts` | Contrato de datos del panel |
| `frontend/src/features/results/Distribution.tsx` | Tabla y barras por ítem |
| `frontend/src/features/results/results.css` | Presentación adaptable |

API:

- `GET /api/v1/results/options`: sedes y periodos con envíos piloto de la versión actual.
- `GET /api/v1/results/summary?kind=priorities`: resumen de prioridades.
- `GET /api/v1/results/summary?kind=experience&scope=demo`: resumen de experiencias demo.
- Experiencias admite `scope=non_demo`, `site_id` y `period`. Prioridades rechaza filtros de sede o periodo.

El servidor recorre las respuestas en lotes de 500, acumula conteos y participantes únicas y devuelve solo agregados. Está pensado para el piloto académico; para volúmenes mayores convendrá trasladar los conteos a agregaciones SQL y paginar las opciones de filtros. La versión actual es la única expuesta; consultar versiones históricas requiere una futura ampliación.

## Estado y siguiente parte

Código entregado sin tests, compilaciones, consultas HTTP, consultas a PostgreSQL ni inspección visual, conforme a la indicación del usuario. Funcionamiento pendiente de ejecución local.

El siguiente avance previsto es 10: preparación de entrega y documentación de operación. El instrumento definitivo, las condiciones del trabajo de campo y el análisis del informe siguen requiriendo revisión académica; los datos aquí presentados continúan siendo piloto.
