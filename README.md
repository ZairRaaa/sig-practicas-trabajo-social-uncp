# SIG de centros de prácticas de Trabajo Social — UNCP

Sistema en desarrollo para consultar y comparar centros mediante información institucional, proximidad espacial y valoración estudiantil.

- [Propuesta mejorada, metodología, arquitectura y plan](informacion_nuestro_proyecto.md).
- [Extractos del concurso](informacion_concurso_investigacion.md).
- [Propuesta original conservada](docs/propuesta_original.md).
- [Guía autónoma para trabajar el informe con otra IA](docs/guia_informe_para_otra_ia.md): bases, índice, enfoque de encuesta y contexto técnico.

## Estado actual: fase 2 — catálogo de demostración

Interfaz con React, TypeScript, Vite y Leaflet en `frontend/`. Incluye mapa, seis sedes ficticias, búsqueda, filtros por distrito/ámbito y fichas seleccionables. Diseño adaptable a móviles. Todavía no hay datos institucionales reales, cuentas ni backend. «Territorio» es un nombre de trabajo para la interfaz. Ver el [detalle de este avance](docs/avance_02_catalogo.md).

Tecnologías siguientes: Leaflet, Python/FastAPI y PostgreSQL/PostGIS. Ver el [plan de fases y commits](docs/plan_desarrollo.md).

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

Siguiente fase: backend FastAPI y esquema inicial PostgreSQL/PostGIS. No es necesario configurar PostgreSQL para ejecutar la demostración actual. Los datos institucionales reales requieren autorización y verificación.
