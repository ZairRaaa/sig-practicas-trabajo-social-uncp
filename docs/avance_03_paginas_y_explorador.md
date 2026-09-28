# Avance 03 — Páginas y explorador amplio

## Alcance de esta parte

La aplicación pasa de una única página a cuatro rutas con React Router:

| Ruta | Página | Propósito |
|---|---|---|
| `/` | Inicio | Presentación y acceso al explorador |
| `/explorar` | Explorador geográfico | Mapa amplio, panel de resultados, filtros y ficha sobre el mapa en escritorio |
| `/centros` | Directorio | Tarjetas y ficha sin necesidad de navegar el mapa |
| `/proyecto` | El proyecto | Propósito, componentes y estado de la investigación |

Las rutas desconocidas tienen una pantalla de recuperación. La navegación destaca la página activa. Desde una ficha del directorio se puede abrir `/explorar?sede=demo-01` para situarla en el mapa.

El explorador aprovecha el ancho de la ventana y adapta la altura al espacio disponible. El botón «Ampliar mapa» oculta el panel de resultados; no solicita pantalla completa del navegador. En móvil, el mapa aparece antes de la lista y la ficha debajo del mapa.

Se mantiene el tema verde/crema. Los registros siguen siendo ficticios. No se añaden indicadores de investigación ni valoraciones inventadas.

## Organización

- `src/App.tsx`: rutas, navegación compartida y pantalla no encontrada.
- `src/pages/HomePage.tsx`: portada.
- `src/pages/AboutPage.tsx`: presentación del proyecto.
- `src/features/catalog/Catalog.tsx`: catálogo compartido, con modos explorador/directorio.
- `src/shell.css`: estructura general y distribución de páginas.

## Ejecutar en local

Desde la carpeta raíz del repositorio:

```powershell
cd frontend
npm install
npm run dev
```

Abrir la URL que indique Vite (normalmente `http://localhost:5173/`). Si ese puerto está ocupado puede asignar otro. Mantener la terminal abierta; detener con Ctrl+C. En ejecuciones posteriores, omitir `npm install` si no cambiaron las dependencias. No se requiere PostgreSQL todavía.

Esto inicia un servidor de desarrollo local, no publica la aplicación en internet. Para generar una versión distribuible más adelante se utilizará `npm run build`; `npm run preview` permite servir esa compilación localmente. Esos comandos no se han ejecutado en este avance. Un alojamiento estático futuro deberá redirigir rutas desconocidas a `index.html` para admitir enlaces directos con BrowserRouter.

## Desarrollo durante ocho semanas

Las ocho semanas incluyen datos, instrumentos e informe además del software. La robustez se construirá sobre funciones completas, no sobre páginas vacías.

1. Base de interfaz y catálogo de demostración: realizados en avances anteriores.
2. Navegación y explorador amplio: código añadido en esta parte.
3. FastAPI, PostgreSQL/PostGIS y padrón: siguiente parte.
4. Consultas espaciales y comparador de hasta tres sedes.
5. Acceso, experiencias habilitadas y cuestionario estudiantil.
6. Administración de sedes y resultados agregados.
7. Recolección/análisis e integración con el informe.
8. Preparación de entrega, documentación y exposición.

El comparador, el cuestionario, los resultados y la administración tendrán páginas propias cuando se implementen. El calendario depende del acceso a información y participantes.

## Estado de ejecución

Por indicación del usuario, no se ejecutaron tests, compilación, revisión visual ni otras verificaciones en este avance. El código queda pendiente de ejecución por el usuario; no se declara validado. Las verificaciones consignadas en avances anteriores corresponden únicamente a esas versiones.
