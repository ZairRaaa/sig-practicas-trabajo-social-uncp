Título de investigación
“Sistema web geográfico basado en análisis espacial y valoración estudiantil para centros de prácticas preprofesionales de Trabajo Social, UNCP-Huancayo, 2026”

Puedes construirla con:

Leaflet + OpenStreetMap + PostgreSQL/PostGIS

OpenStreetMap te proporciona el mapa base con calles, avenidas, nombres de lugares, etc.; Leaflet permite mostrarlo e interactuar con él. Si quieres obtener la ubicación actual de la estudiante, el navegador puede hacerlo mediante geolocalización, sin Google Maps.

Google Maps sería necesario solamente si quisieras específicamente sus mapas, Street View, rutas de Google, tiempos de viaje de Google, etc. Para este trabajo yo no pagaría ni complicaría el proyecto con Google Maps.

La arquitectura quedaría aproximadamente así:

                    ESTUDIANTE
                        │
                        ▼
              ┌───────────────────┐
              │     WEB SIG       │
              │ HTML / JS/Leaflet │
              └─────────┬─────────┘
                        │
                    API / Backend
                        │
                Python FastAPI
                        │
                        ▼
              ┌───────────────────┐
              │ PostgreSQL        │
              │ + PostGIS         │
              └───────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
 Instituciones                Encuestas/Evaluaciones
 coordenadas                   de estudiantes

Y sí: tú registrarías previamente las instituciones. Luego las estudiantes que hayan realizado prácticas allí podrían evaluarlas. El sistema combina esa información con datos espaciales y genera algo como el ejemplo que pusiste.

Funcionalidades completas del sistema

Yo lo dejaría con estas funcionalidades, separando lo verdaderamente importante de lo que podemos agregar después:

Módulo	Funcionalidad	¿Qué haría?
1. Mapa interactivo	Visualización de instituciones	Mostrar todos los centros de prácticas sobre un mapa de Huancayo, El Tambo, Chilca, etc.
	Navegación	Zoom, desplazamiento y selección de puntos, similar a Google Maps.
	Información emergente	Al hacer clic en una institución muestra nombre, tipo, distrito y valoración.
2. Gestión de instituciones	Registrar institución	El administrador registra nombre, dirección, tipo, distrito y coordenadas.
	Editar institución	Modificar datos existentes.
	Eliminar/desactivar	Retirar instituciones que ya no estén disponibles.
	Ubicación en mapa	El administrador puede colocar el marcador directamente sobre el mapa.
3. Encuesta estudiantil	Encuesta inicial	Conocer qué criterios consideran más importantes las estudiantes para elegir/evaluar un centro de prácticas.
	Criterios	Accesibilidad, distancia, tiempo de desplazamiento, experiencia, etc.
	Escala Likert	Valoraciones del 1 al 5.
	Resultados	Obtener promedios y determinar qué criterios tienen mayor importancia.
4. Evaluación de centros	Seleccionar institución	La estudiante indica en qué institución realizó sus prácticas.
	Valorar institución	Puntuar accesibilidad, experiencia, ubicación y otros criterios definidos.
	Comentario opcional	Añadir observaciones sobre la experiencia.
	Promedio institucional	Calcular automáticamente la valoración promedio de cada centro.
5. Análisis espacial con PostGIS	Distancia desde la UNCP	Calcular automáticamente cuántos kilómetros hay hasta cada institución.
	Centros dentro de un radio	Buscar instituciones a 1, 2, 3, 5 km, etc.
	Centro más cercano	Identificar qué institución está espacialmente más cerca.
	Conteo por zona	Determinar cuántas instituciones existen por distrito o sector.
	Concentración espacial	Identificar zonas donde existen muchas o pocas instituciones.
6. Índice de conveniencia	Cálculo automático	Combinar criterios de encuesta, evaluación y características espaciales.
	Puntuación	Generar un valor de 0 a 100 para cada institución.
	Clasificación	Mostrar conveniencia Alta, Media o Baja.
	Explicación	Mostrar por qué una institución obtuvo determinada puntuación.
7. Búsqueda y filtros	Buscar por nombre	Buscar una institución específica.
	Filtrar por distrito	Huancayo, El Tambo, Chilca, etc.
	Filtrar por tipo	Salud, educación, municipalidad, ONG, programas sociales, etc.
	Filtrar por valoración	Mostrar centros con determinado nivel de valoración.
	Filtrar por distancia	Por ejemplo, centros a menos de 3 km de la UNCP.
	Filtrar por conveniencia	Alta, media o baja.
8. Centros cercanos	Seleccionar punto	El usuario hace clic sobre cualquier ubicación del mapa.
	Definir radio	1 km, 2 km, 5 km.
	Buscar	PostGIS encuentra las instituciones dentro de dicho radio.
	Ordenar resultados	Por distancia, valoración o índice de conveniencia.
9. Mapas temáticos	Mapa de instituciones	Distribución geográfica de los centros registrados.
	Mapa por tipo	Diferentes símbolos para salud, educación, municipalidades, etc.
	Mapa de conveniencia	Verde = alta, amarillo = media, rojo = baja.
	Mapa de calor	Mostrar dónde se concentran los centros utilizados por las estudiantes.
10. Dashboard	Total de instituciones	Número de centros registrados.
	Instituciones por distrito	Gráficos estadísticos.
	Instituciones por tipo	Salud, educación, ONG, etc.
	Valoración promedio	Promedio general de las evaluaciones.
	Centros más evaluados	Instituciones con mayor cantidad de respuestas.
11. Reportes	Resultados de encuesta	Tablas y gráficos de las respuestas obtenidas.
	Ranking descriptivo	Ordenar centros por puntuación sin borrar el detalle de cada criterio.
	Exportación	Descargar resultados a CSV o PDF, si tienen tiempo para implementarlo.
12. Administración	Panel administrador	Gestionar instituciones, encuestas y evaluaciones.
	Estadísticas	Consultar resultados globales del sistema.

Eso parece bastante, pero no tienes que programarlo todo con el mismo nivel de complejidad. Varias funcionalidades salen prácticamente de la misma información.

¿Cómo funcionaría realmente?

Pongamos que tú registras estas tres instituciones:

Centro de Salud Justicia Paz y Vida
Municipalidad Distrital de El Tambo
Centro de Salud Chilca

Cada una tendría una coordenada almacenada en PostGIS:

Centro de Salud A
Latitud: ...
Longitud: ...
Distrito: El Tambo
Tipo: Salud

Cuando cargas la aplicación, Leaflet obtiene esas coordenadas y pone los marcadores sobre OpenStreetMap.

Algo así:

                  EL TAMBO
              🏥 Centro A
                    │
                    │ 3.2 km
                    │
                 🎓 UNCP


         HUANCAYO                 CHILCA

      🏛 Centro B                🏥 Centro C

Luego haces clic sobre el marcador:

┌────────────────────────────────┐
│ CENTRO DE SALUD XXXXX          │
│                                │
│ Tipo: Salud                    │
│ Distrito: El Tambo             │
│                                │
│ Distancia desde UNCP: 3.2 km   │
│                                │
│ Evaluaciones: 28               │
│ Valoración: ★★★★☆ 4.3/5        │
│                                │
│ Accesibilidad: 4.5/5           │
│ Experiencia:   4.2/5           │
│ Ubicación:     4.1/5           │
│                                │
│ CONVENIENCIA                   │
│ ████████████████░░ 82/100      │
│                                │
│ NIVEL: ALTO                    │
│                                │
│ [ Ver evaluaciones ]           │
└────────────────────────────────┘

Eso ya sería el núcleo de tu sistema.

Pero hay dos encuestas diferentes conceptualmente

Esto es importante para que no se te mezcle todo.

1. Encuesta inicial de investigación

La aplicas a las estudiantes de Trabajo Social.

Por ejemplo:

¿Qué tan importante considera la accesibilidad del centro de prácticas?

¿Qué tan importante considera la distancia?

¿Qué tan importante considera el tiempo de desplazamiento?

Escala 1–5.

Supongamos que obtienes:

Factor	Promedio
Accesibilidad	4.7
Tiempo de desplazamiento	4.4
Distancia	4.2
Experiencia en la institución	4.0

Esto te permite argumentar:

Las estudiantes consideran que la accesibilidad es el factor territorial más importante.

Y esos resultados pueden ayudarte a definir los pesos del índice.

2. Evaluación de cada institución

Después preguntas a quienes realmente hayan realizado prácticas allí:

¿Cómo califica la accesibilidad de esta institución?

¿Cómo califica su experiencia?

¿Cómo califica las condiciones para desarrollar sus prácticas?

Aquí ya no preguntas qué tan importante es un criterio.

Preguntas qué tan bien cumple una institución ese criterio.

Esa diferencia es fundamental.

Así se calcularía el índice

Imagina que de tu primera encuesta determinas estos pesos:

Accesibilidad       30 %
Valoración general  30 %
Distancia           25 %
Experiencia         15 %
                    ─────
                    100 %

Y una institución obtiene:

Accesibilidad:       90/100
Valoración:          85/100
Distancia:           75/100
Experiencia:         80/100

Entonces:

(90 × 0.30)
+
(85 × 0.30)
+
(75 × 0.25)
+
(80 × 0.15)

= 83.25

Resultado:

Índice de conveniencia: 83.25 / 100
Nivel: ALTO

Y aquí ya tenemos una integración muy bonita:

Encuesta → determina criterios/pesos.

Estudiantes → evalúan instituciones.

PostGIS → calcula características espaciales.

Sistema → calcula el índice.

¿Qué aporta realmente PostGIS?

Esto es importante porque el profesor podría preguntarte:

“¿Y para qué usaste PostGIS? Eso también se puede hacer con una base de datos normal.”

Tu respuesta debe ser clara.

Con PostGIS podrías realizar cosas como:

ST_Distance()

Para saber la distancia entre la UNCP y una institución.

ST_DWithin()

Para:

“Mostrar instituciones dentro de 2 km.”

ST_Buffer()

Para crear visualmente el área de influencia de 1, 2 o 5 km.

ST_Intersects()

Para identificar en qué distrito o zona se encuentra una institución.

ST_Contains()

Para determinar qué puntos pertenecen a determinada área geográfica.

Ahí se nota que sí es un proyecto SIG.

Una función que yo sí pondría

Dentro del mapa habría un botón:

📍 Buscar centros cercanos

La estudiante hace clic en el mapa.

Por ejemplo:

Radio:

○ 1 km
● 2 km
○ 5 km

[ BUSCAR ]

PostGIS responde:

Se encontraron 4 instituciones.

1. Centro A
   0.8 km
   Conveniencia: 87/100

2. Centro B
   1.1 km
   Conveniencia: 82/100

3. Centro C
   1.6 km
   Conveniencia: 74/100

4. Centro D
   1.9 km
   Conveniencia: 68/100

Y los cuatro aparecen resaltados en el mapa.

Esa función no es extremadamente difícil y, para una demostración de Sistema de Información Geográfica, se vería bastante bien.

¿Y la ubicación actual?

También podrías tener:

📍 Usar mi ubicación

El navegador pregunta:

“¿Permitir que este sitio conozca tu ubicación?”

Si la estudiante acepta, aparece su posición.

             🏥 Centro A


                    📍 Tú
                radio 2 km


          🏥 Centro B

Y PostGIS puede buscar los centros cercanos.

Eso tampoco necesita Google Maps.

Para una primera versión incluso puedes dejarlo fuera y permitir simplemente que el usuario haga clic sobre el mapa. Es más sencillo y evita almacenar ubicaciones personales.

Lo que no implementaría

Para que el proyecto no se vaya de las manos, yo no pondría navegación GPS paso a paso, tráfico en tiempo real, Street View, rutas de transporte público, inteligencia artificial, predicción de seguridad ni cálculo automático de tiempos reales de viaje.

Ahí ya estarías intentando construir Google Maps 😅.

Tu proyecto debería concentrarse en:

localización + consultas espaciales + percepción estudiantil + análisis + visualización.

Eso es suficiente.

Y ya tenemos una investigación bastante coherente

La lógica completa sería:

PROBLEMA
│
│ Dificultad para consultar y analizar de manera
│ integrada información geográfica y valoración
│ estudiantil sobre centros de prácticas.
│
▼
ENCUESTA A ESTUDIANTES
│
│ ¿Qué factores consideran importantes?
│ ¿Cómo evalúan los centros utilizados?
│
▼
BASE DE DATOS ESPACIAL
│
│ PostgreSQL + PostGIS
│
├── Instituciones
├── Coordenadas
├── Distritos
├── Evaluaciones
└── Resultados de encuesta
│
▼
ANÁLISIS SIG
│
├── Distancias
├── Cercanía
├── Distribución
├── Concentración
└── Índice de conveniencia
│
▼
SISTEMA WEB
│
├── Mapa
├── Filtros
├── Centros cercanos
├── Evaluaciones
├── Índice
└── Estadísticas
│
▼
RESULTADOS DE INVESTIGACIÓN