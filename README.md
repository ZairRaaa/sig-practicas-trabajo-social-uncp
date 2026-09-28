# SIG de centros de prácticas de Trabajo Social — UNCP

Sistema en desarrollo para consultar y comparar centros mediante información institucional, proximidad espacial y valoración estudiantil.

- [Propuesta mejorada, metodología, arquitectura y plan](informacion_nuestro_proyecto.md).
- [Extractos del concurso](informacion_concurso_investigacion.md).
- [Propuesta original conservada](docs/propuesta_original.md).
- [Guía autónoma para trabajar el informe con otra IA](docs/guia_informe_para_otra_ia.md): bases, índice, enfoque de encuesta y contexto técnico.

## Estado actual: interfaz multipágina y base del backend

Interfaz con React, TypeScript, Vite y Leaflet en `frontend/`. Incluye mapa, seis sedes ficticias, búsqueda, filtros por distrito/ámbito y fichas seleccionables. Diseño adaptable a móviles. Todavía no hay datos institucionales reales ni cuentas; el backend está preparado en código y pendiente de configuración. «Territorio» es un nombre de trabajo para la interfaz. Ver el [detalle de este avance](docs/avance_02_catalogo.md).

Backend FastAPI y esquema PostgreSQL/PostGIS añadidos en `backend/`, pendientes de instalación y ejecución local. La interfaz todavía utiliza datos demo. Sigue las [instrucciones del backend](backend/README.md) y el [avance 04](docs/avance_04_backend_y_postgis.md). Ver también el [plan de fases y commits](docs/plan_desarrollo.md).

Ahora hay páginas de Inicio, Explorador, Centros y El proyecto. El mapa ocupa una vista amplia y permite ocultar el panel. Ver [avance 03](docs/avance_03_paginas_y_explorador.md). Esta versión se entrega sin tests ni verificaciones, por indicación del usuario.

## Ejecutar localmente

Requiere Node `^20.19.0 || >=22.12.0` y npm. Se verificó con Node 22.14.0. React se instala dentro del proyecto; no necesita instalación global.

```powershell
cd frontend
npm ci
npm run dev
```

Abrir la dirección local que muestre Vite. Para detenerlo, usar Ctrl+C. Si las dependencias ya están instaladas, basta con `npm run dev` desde `frontend`.

## Verificar y compilar

```powershell
cd frontend
npm run build
```

Este comando verifica tipos y crea `frontend/dist`. Para revisar esa compilación: `npm run preview`. `dist` y `node_modules` no se versionan; `package-lock.json` sí.

## Flujo Git

Se conserva el repositorio existente y su primer commit. El arranque se realiza en `codex/fase-1-base-react`, con commits separados para documentación e interfaz. Los cambios se guardan localmente; no se ha hecho push ni merge a `main`.

Siguiente fase: preparar la base local, carga controlada y conexión de React a la API. PostgreSQL no es necesario para la demo del frontend, pero sí para usar el catálogo del backend. Los datos institucionales reales requieren autorización y verificación.
