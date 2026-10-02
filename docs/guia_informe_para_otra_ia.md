# Guía autónoma para elaborar el informe de investigación

Este archivo puede entregarse por sí solo a otra IA. Contiene el contexto, las decisiones técnicas, el enfoque del cuestionario y la estructura exigida por los extractos del concurso. Es una guía de redacción, no un informe terminado ni un instrumento validado.

## 1. Instrucciones para la IA que continuará el informe

Ayuda a redactar el informe académico en español, con estilo objetivo e impersonal y respetando las bases resumidas aquí. Trabaja por secciones y mantén coherencia entre problema, objetivos, método, instrumentos, resultados y conclusiones.

- El equipo desarrollará el software por separado; tu tarea principal será apoyar el informe y el instrumento.
- La encuesta a estudiantes de Trabajo Social será una fuente central de resultados. No reemplazarla por pruebas de software como única evidencia.
- No inventar población, muestra, instituciones, respuestas, porcentajes, coordenadas, resultados, validaciones ni referencias.
- Usar `[PENDIENTE: dato necesario]` cuando falte información. Distinguir decisiones propuestas de hechos comprobados.
- No redactar resultados como obtenidos mientras no se entreguen datos. Se pueden preparar tablas vacías y pautas de análisis.
- Verificar toda referencia antes de citarla; no inventar autores, DOI o enlaces. La bibliografía técnica no sustituye antecedentes académicos.
- Mantener PostgreSQL y PostGIS en la arquitectura. Ya se entregó código React y FastAPI con migraciones para catálogo espacial, cuentas, experiencias y cuestionario piloto. No confundir código entregado con funcionamiento validado.
- No afirmar mejora de decisiones, reducción de tiempos o impacto causal usando únicamente una encuesta de prioridades/experiencias.
- No imponer la estructura extensa de una tesis: las bases recibidas piden un trabajo con formato de artículo.

## 2. Proyecto y estado real

Se desarrolla un sistema web geográfico para consultar y comparar centros de prácticas preprofesionales de Trabajo Social de la Universidad Nacional del Centro del Perú (UNCP).

Integrará tres componentes:

1. Información institucional verificada: sedes, tipo, dirección, estado, fuente y fecha de actualización.
2. Información geográfica: ubicación, distrito, distancia geográfica y búsqueda por radio.
3. Información estudiantil: criterios considerados importantes y valoración de experiencias de prácticas, obtenidos mediante cuestionario.

La unidad geográfica es la **sede**: una institución puede tener varias ubicaciones. Las experiencias deben asociarse a una sede y un periodo.

Estado del desarrollo al avance 10: se entregó código de React/TypeScript/Vite/Leaflet, catálogo y mapa, búsqueda por radio, comparación de hasta tres sedes, API FastAPI, migraciones PostgreSQL/PostGIS, acceso por roles, experiencias habilitadas, cuestionario piloto y resultados descriptivos restringidos a administración/coordinación. El usuario informó que puede abrir la API, cargó seis sedes demo y creó cuentas administrador y estudiante. No se ha confirmado una aplicación de campo, instrumento validado ni padrón real revisado. Desde el avance 03 no se ejecutan tests ni comprobaciones de funcionamiento por indicación del usuario.

El cuestionario implementado contiene cinco ítems de prioridades y cinco de experiencia, escalas de 1 a 5 y no aplica. Todos los envíos actuales se marcan como piloto y están vinculados a cuentas; no son anónimos. Los resultados muestran frecuencias y porcentajes por ítem sobre respuestas válidas, no índices de calidad ni efectos causales. La evaluación de experiencia exige una asignación de sede y periodo; esa habilitación técnica no demuestra por sí sola experiencia real. Antes de trabajo de campo se debe cerrar el instrumento y publicar una versión específica, separada del piloto.

Ámbito espacial propuesto: Huancayo, El Tambo y Chilca, provincia de Huancayo. Confirmarlo con el padrón. Periodo propuesto: 2026, con semestre y fechas pendientes. No modificar fechas para aparentar cumplimiento de una convocatoria.

## 3. Título y enfoque recomendado

**Título de trabajo:** «Sistema web geográfico para consultar y comparar centros de prácticas preprofesionales de Trabajo Social de la UNCP, Huancayo, 2026».

Son 23 palabras contadas por espacios. Incluye delimitación temática, institucional, espacial y temporal; máximo permitido: 25 palabras.

El problema propuesto es la dificultad para consultar de forma integrada información institucional, geográfica y experiencias de prácticas. Su existencia y magnitud deben respaldarse mediante diagnóstico; todavía no están demostradas.

### Ajuste metodológico para esta versión del informe

La planificación inicial contemplaba una evaluación comparativa de uso. A partir de la preferencia del equipo, este documento propone que el núcleo empírico sea **descriptivo, basado en encuesta e información espacial**, acompañado del desarrollo y verificación del sistema. La comparación de tiempos con/sin sistema queda como ampliación opcional.

Por ello, la pregunta principal propuesta es:

> ¿Cómo integrar la localización de los centros de prácticas y la información obtenida de las estudiantes de Trabajo Social de la UNCP en un sistema web geográfico de consulta y comparación, en Huancayo durante el periodo definido?

Preguntas descriptivas complementarias:

- ¿Qué criterios consideran importantes las estudiantes al elegir un centro?
- ¿Cómo valoran las estudiantes con experiencia las condiciones formativas de las sedes donde realizaron prácticas?
- ¿Cómo se distribuyen las sedes registradas en el ámbito de estudio?

**Objetivo general propuesto:** desarrollar un sistema web geográfico que integre información institucional, análisis espacial y resultados de un cuestionario estudiantil para apoyar la consulta y comparación de centros de prácticas de Trabajo Social de la UNCP.

| Objetivo específico | Fuente/instrumento | Resultado que lo responde |
|---|---|---|
| Identificar criterios de elección y necesidades de información | Bloque de prioridades/necesidades del cuestionario | Distribuciones por criterio y necesidades reportadas |
| Describir experiencias de prácticas por sede y periodo | Bloque de experiencia, solo para estudiantes elegibles | Valoraciones por dimensión y cantidad de respuestas |
| Construir un padrón georreferenciado verificable | Ficha institucional y revisión cartográfica | Cobertura del padrón y mapa de sedes |
| Integrar información en la aplicación | Diseño, implementación y registro de pruebas | Funciones implementadas y evidencia técnica |

Clasificación de trabajo: investigación aplicada con desarrollo tecnológico y un componente de encuesta descriptivo, no experimental y transversal si se realiza una única recolección. Confirmar terminología con el asesor. No llamar experimental al estudio solo porque se construya software. No es indispensable plantear una hipótesis causal para estos objetivos; los extractos indican hipótesis si lo amerita.

## 4. ¿La encuesta puede constituir los resultados?

**Sí. La encuesta es la técnica y el cuestionario es el instrumento. Las respuestas procesadas constituyen resultados empíricos.** Deben responder a los objetivos y presentarse con tablas/figuras, interpretación y discusión con antecedentes.

Sin embargo, deben distinguirse estas conclusiones:

| Si se pregunta… | Permite informar… | No demuestra por sí solo… |
|---|---|---|
| Qué criterios son importantes | Prioridades declaradas por las participantes | Que un centro cumple esos criterios |
| Cómo fue su experiencia en una sede | Percepción sobre esa experiencia y periodo | Calidad objetiva universal de la institución |
| Qué información les cuesta encontrar | Necesidades o dificultades reportadas | Que el sistema ya resolvió la dificultad |
| Qué opinan tras usar el sistema | Utilidad/facilidad percibida | Reducción objetiva de tiempo o impacto causal |

Además de la encuesta, el artículo debe mostrar la integración espacial y el producto tecnológico efectivamente desarrollado. Las capturas de pantalla ayudan a documentarlo, pero no sustituyen las respuestas ni las pruebas.

Si finalmente solo se aplica el bloque de prioridades, se podrán informar prioridades; no presentar valoraciones por centro sin preguntar a quienes realizaron prácticas allí. Si se pretende afirmar que el sistema mejora el desempeño, añadir una evaluación de tareas con un protocolo adecuado.

## 5. Diseño del cuestionario

Se puede usar **un solo formulario con secciones y saltos lógicos**, aunque conceptualmente mida cosas distintas. No es obligatorio aplicar dos encuestas independientes.

### Bloque A. Participación y elegibilidad

- Presentación del propósito, voluntariedad, tratamiento de información y contacto del equipo.
- Aceptación de participación; si no acepta, finalizar sin conservar respuestas de contenido.
- Confirmación de pertenencia a la población definida.
- Situación respecto de prácticas: no iniciadas, en curso o concluidas, según criterios del protocolo.
- Si tiene experiencia elegible: sede y periodo. Preferir un catálogo de códigos para evitar nombres duplicados.

No incluir nombres, DNI, domicilio, datos de beneficiarios o detalles de casos atendidos. Si se necesita comprobar elegibilidad, separar ese registro de las respuestas analíticas y explicar quién tiene acceso. No prometer anonimato absoluto si se conserva un vínculo identificador.

Para el formulario inicial, proponer una sola experiencia: la más reciente dentro del periodo elegible. Si se decide admitir varias, registrar cada experiencia por separado y considerar que una estudiante aporta observaciones relacionadas; no contarlas como participantes independientes.

### Bloque B. Necesidades de información

Ejemplos de preguntas propuestas, pendientes de revisión:

- ¿Qué medios utiliza para informarse sobre centros de prácticas? Respuesta múltiple con alternativas revisadas con la población y opción otra.
- ¿Qué información le resulta más difícil encontrar? Ubicación, actividades, supervisión, requisitos, disponibilidad, otra, ninguna; ajustar alternativas tras el piloto.

Estos ítems describen necesidades y no usan necesariamente una escala Likert.

### Bloque C. Importancia de criterios

Consigna propuesta: «Al considerar un centro de prácticas, indique qué importancia tiene para usted cada aspecto».

Escala: 1 nada importante; 2 poco importante; 3 moderadamente importante; 4 importante; 5 muy importante. Ofrecer no puedo determinarlo cuando corresponda, fuera de la escala numérica.

Ítems de partida:

- Cercanía respecto del punto desde el cual se desplaza habitualmente, sin pedir su dirección.
- Facilidad para llegar al centro.
- Acompañamiento del supervisor o supervisora.
- Oportunidades de aprendizaje relacionadas con Trabajo Social.
- Disponibilidad de recursos para desarrollar las actividades asignadas.

Revisar solapamientos: cercanía y facilidad de llegada están relacionadas, pero no son idénticas. No convertir automáticamente todos estos ítems en componentes independientes de un índice.

### Bloque D. Experiencia en una sede

Solo para quienes realizaron o realizan prácticas en una sede y periodo elegibles; considerar si las experiencias en curso necesitan un tiempo mínimo antes de valorar, y definirlo previamente.

Consigna propuesta: «Pensando en la sede y el periodo indicados, señale su grado de acuerdo con cada afirmación».

Escala: 1 totalmente en desacuerdo; 2 en desacuerdo; 3 ni de acuerdo ni en desacuerdo; 4 de acuerdo; 5 totalmente de acuerdo. Incluir no aplica/no puedo evaluar como respuesta no numérica.

Ejemplos iniciales, no instrumento validado:

- Recibí orientación para desarrollar las actividades asignadas.
- Pude solicitar retroalimentación sobre mi desempeño.
- Las actividades permitieron aplicar conocimientos de Trabajo Social.
- Tuve oportunidades de aprender procedimientos relacionados con mi formación.
- Conté con los recursos necesarios para las actividades asignadas.

No sumar todos los ítems por costumbre. La agrupación en dimensiones y su puntuación deben justificarse y revisarse. Estos ejemplos no establecen por sí solos una escala validada.

### Bloque E. Uso del sistema, opcional y posterior

Únicamente si las participantes ya lo utilizaron. Se pueden preguntar claridad de la información y facilidad percibida para comparar. Mantener separado del cuestionario inicial; no preguntar por experiencia con funciones todavía inexistentes.

### Revisión previa y población

Antes de aplicar: definir población y periodo, revisar contenido con especialistas, pilotar comprensión y duración, ajustar redacción y fijar una versión. No afirmar juicio de expertos, confiabilidad o validez hasta documentarlos.

La cantidad de participantes, tamaño de población y estrategia de muestreo están pendientes. Si se invita a toda la población pero responde una parte, informar convocatoria censal y participación efectiva, sin afirmar un censo completo. Si se usa conveniencia, reconocer sus límites.

## 6. Tratamiento y presentación de las respuestas

1. Elaborar un diccionario: código del ítem, redacción, escala, valores y condición de aplicación.
2. Revisar duplicados, elegibilidad, sede, periodo y saltos del formulario.
3. Distinguir falta de respuesta, no aplica y pregunta no mostrada por salto lógico. Nunca asignarles cero.
4. Describir cantidad de participantes y respuestas válidas por ítem. En preguntas múltiples, aclarar que los porcentajes pueden sumar más de 100 %.
5. Presentar frecuencias, porcentajes y mediana para ítems ordinales; si se usan medias, explicar el criterio y acompañarlas con distribución y número de respuestas.
6. No generalizar a todas las estudiantes si el muestreo no lo permite.
7. Evitar publicar resultados de grupos pequeños que puedan identificar participantes. Cualquier umbral de publicación debe acordarse; cinco respuestas no garantizan anonimato ni suficiencia estadística.
8. Separar experiencia pasada, periodo actual y disponibilidad de plazas: las respuestas no certifican convenio ni vacantes.

Tablas propuestas, todavía vacías:

- Tabla 1: participantes convocadas, elegibles y respuestas analizadas.
- Tabla 2: necesidades de información, con denominador y tipo de pregunta.
- Tabla 3: distribución de importancia por criterio.
- Tabla 4: valoraciones de experiencia por dimensión/ítem, sede y periodo, solo cuando pueda publicarse.
- Tabla 5: cantidad de sedes verificadas por distrito y tipo.
- Tabla 6: funciones implementadas, prueba realizada y resultado comprobado.

Figuras posibles: barras de prioridades, distribución de respuestas y mapa de sedes. Cada una debe llevar título, fuente, denominador o periodo cuando aplique y explicación objetiva.

Un índice de conveniencia sigue siendo opcional. No asignar pesos arbitrarios ni presentar un puntaje como porcentaje de calidad. Si se incorpora, documentar normalización, pesos, faltantes y sensibilidad; evitar contar dos veces dimensiones semejantes.

## 7. Fundamentos técnicos confirmados

**Sí se trabajará con PostgreSQL y PostGIS.** PostgreSQL será el gestor de base de datos; PostGIS es su extensión espacial, no una segunda base independiente.

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| Interfaz | React, TypeScript y Vite | Mapa, filtros, fichas, formularios y comparación |
| Mapa | Leaflet y mapa base de OpenStreetMap mediante proveedor | Representación visual; no demuestra por sí sola análisis espacial |
| API | Python y FastAPI | Reglas, permisos, consultas y entrega de información |
| Persistencia | PostgreSQL + PostGIS | Sedes, periodos, instrumentos, respuestas y geometrías |
| Preparación | QGIS | Revisión cartográfica y de coordenadas |
| Análisis | Python y herramientas estadísticas según protocolo | Procesamiento reproducible de respuestas anonimizadas |

Arquitectura prevista:

```text
Estudiantes / coordinación
            ↓
React + TypeScript + Leaflet
            ↓ API
Python + FastAPI
            ↓
PostgreSQL + PostGIS
  ├── instituciones y sedes
  ├── distritos y ubicaciones
  ├── periodos y experiencias
  └── instrumentos y respuestas
```

Es un monolito modular. El navegador no accede directamente a PostgreSQL.

PostGIS permitirá consultas por radio, distancias y relaciones entre sedes y distritos. La distancia será geográfica, no tiempo de viaje ni ruta. El punto de referencia institucional debe verificarse. Las respuestas sobre facilidad de llegada expresan percepción y no se confunden con esa distancia.

Fuentes de datos previstas: padrón de la coordinación, verificación de sedes, cartografía con metadatos y cuestionario. No tratar instituciones encontradas en un mapa como centros habilitados sin comprobación.

## 8. Reglas del concurso recibidas

Disponemos de extractos de las páginas 9, 11 y 12 de un documento de 15 páginas. Falta confirmar el documento completo, convocatoria, plazos, extensión total y reglas sobre anexos. La rúbrica indica 16 de julio de 2026; esa fecha no acredita una entrega vigente.

| Sección/criterio | Regla observada | Puntaje |
|---|---|---:|
| Título | Máximo 25 palabras; delimitación temática, temporal y espacial; Calibri 16 | 4 |
| Resumen | Hasta 250 palabras; desarrollo de autores, estrategia cuando corresponda, resultados y relevancia; objetivo y metodología; al menos tres palabras clave | 12 |
| Introducción | Problema, antecedentes, propósito e hipótesis si amerita; máximo una página y media | 15 |
| Cuerpo | Método, estrategia, población/muestra, técnicas, instrumentos, herramientas y objetivo claro | 16 |
| Resultados | Vinculados a instrumentos; figuras/tablas explicadas; discusión con otros trabajos | 24 |
| Conclusiones | Lo demostrado, relevancia, ventajas, limitaciones, aplicación y futuro | 12 |
| Referencia bibliográfica | APA; criterio distingue al menos diez y más de diez, con redacción ambigua | 7 |
| Presentación | Exposición y defensa | 10 |
| Total | | 100 |

Encabezados Calibri 14 y texto Calibri 12. Redacción objetiva e impersonal. Preparar más de diez referencias pertinentes verificadas y confirmar interpretación de los subcriterios bibliográficos. El extracto no precisa edición APA, márgenes, interlineado o límite total: no inventarlos como requisitos.

## 9. Índice propuesto del informe

Los encabezados principales respetan las bases; las subsecciones organizan el contenido y pueden compactarse según extensión. No son capítulos obligatorios adicionales exigidos por el concurso.

```text
Título
Autores y afiliación [según formato completo que se confirme]

Resumen
Palabras clave

1. Introducción
   1.1. Contexto y naturaleza del problema
   1.2. Antecedentes y necesidad identificada
   1.3. Propósito, objetivos y delimitación

2. Cuerpo
   2.1. Enfoque y diseño del estudio
   2.2. Ámbito, población, muestra y criterios de participación
   2.3. Técnica de encuesta e instrumento cuestionario
        2.3.1. Necesidades y prioridades
        2.3.2. Experiencia de prácticas por sede y periodo
        2.3.3. Revisión y pilotaje del instrumento
   2.4. Fuentes institucionales y preparación de datos geográficos
   2.5. Procedimiento de recolección y tratamiento de información
   2.6. Diseño e implementación del sistema
        2.6.1. Requerimientos y alcance
        2.6.2. Arquitectura y tecnologías
        2.6.3. Modelo de datos PostgreSQL/PostGIS
        2.6.4. Consultas espaciales e integración del cuestionario
   2.7. Plan de análisis y verificación técnica
   2.8. Consideraciones de participación y protección de información

3. Resultados
   3.1. Participación y calidad de los datos
   3.2. Necesidades de información y prioridades estudiantiles
   3.3. Valoración de experiencias de prácticas
   3.4. Distribución geográfica de las sedes registradas
   3.5. Sistema desarrollado e integración de resultados
   3.6. Verificación de funcionalidades
   3.7. Discusión con antecedentes y limitaciones

4. Conclusiones
   4.1. Hallazgos vinculados a los objetivos
   4.2. Relevancia, ventajas y limitaciones
   4.3. Aplicación y perspectivas futuras

Referencia bibliográfica

Anexos [solo si las bases completas los permiten]
   A. Cuestionario y lógica de secciones
   B. Evidencia real de revisión/pilotaje
   C. Matriz de consistencia y operacionalización
   D. Diccionario de datos y ficha institucional
   E. Evidencia de pruebas y pantallas
```

La introducción completa, incluidas sus subsecciones, debe respetar el máximo de una página y media. El resumen se finaliza después de obtener resultados. La sección 3.3 se incluye solo si se recoge experiencia; si se añade evaluación posterior de uso, incorporarla como subsección identificada, sin fingir que ya se realizó.

El índice es una guía de escritura. El extracto no exige imprimir una tabla de contenidos en el artículo final; confirmarlo antes de añadir páginas extras. Los anexos nunca deben publicar respuestas identificables.

## 10. Qué se puede redactar ahora y qué requiere datos

**Ahora:** contexto provisional, propósito, objetivos, delimitación propuesta, arquitectura prevista, protocolo, cuestionario preliminar y estructura de tablas. Revisar antecedentes reales. Usar futuro para actividades pendientes.

**Después de aplicar instrumentos:** población efectiva, participación, resultados, discusión y conclusiones respaldadas. Actualizar método a lo que realmente se ejecutó y explicar cambios.

**Después de implementar:** funciones comprobadas, arquitectura efectiva y pruebas reales. No convertir el plan tecnológico en resultados de ejecución.

Datos pendientes prioritarios: convocatoria completa y fecha; periodo académico; población y acceso; criterio de experiencia elegible; padrón; tamaño y estrategia de muestra; instrumento final; autorizaciones y fuentes bibliográficas.

## 11. Mensaje listo para enviar junto con este archivo

> Quiero que me ayudes a elaborar el informe de investigación de este proyecto según las bases resumidas en el Markdown. La encuesta a estudiantes de Trabajo Social será una fuente central de resultados. Usaremos un cuestionario que diferencie necesidades/prioridades de la valoración de experiencias de prácticas. El sistema se desarrolla con React y TypeScript, Python/FastAPI y PostgreSQL con PostGIS. Primero revisa la coherencia entre objetivos, cuestionario e índice; después trabajemos sección por sección. No inventes respuestas, validaciones, datos ni referencias. Marca los datos faltantes. No afirmes que el sistema mejora el desempeño si solo tenemos información descriptiva. Conserva la estructura del concurso y distingue lo previsto de lo implementado.
