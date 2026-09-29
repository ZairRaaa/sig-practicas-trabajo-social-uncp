# SIG de centros de prácticas de Trabajo Social — UNCP

Sistema en desarrollo para consultar y comparar centros mediante información institucional, proximidad espacial y valoración estudiantil.

- [Propuesta mejorada, metodología, arquitectura y plan](informacion_nuestro_proyecto.md).
- [Extractos del concurso](informacion_concurso_investigacion.md).
- [Propuesta original conservada](docs/propuesta_original.md).
- [Guía autónoma para trabajar el informe con otra IA](docs/guia_informe_para_otra_ia.md): bases, índice, enfoque de encuesta y contexto técnico.

## Estado actual: comparador de sedes

Interfaz React, TypeScript, Vite y Leaflet en `frontend/`. El catálogo consulta la API e incluye búsqueda, filtros, fichas y paginación sincronizada con el mapa. No incluye datos fijos ocultos: una base vacía se muestra vacía. Puede cargarse opcionalmente un conjunto ficticio en PostgreSQL. «Territorio» es un nombre de trabajo para la interfaz.

Backend FastAPI y esquema PostgreSQL/PostGIS en `backend/`. El usuario ha comunicado que puede abrir `/docs`; no se ha comprobado su base de datos. Sigue las [instrucciones del backend](backend/README.md) y el [avance 05: conexión y arranque](docs/avance_05_conexion_catalogo.md). Ver también el [plan de fases y commits](docs/plan_desarrollo.md).

Ahora hay páginas de Inicio, Explorador, Centros y El proyecto. El mapa ocupa una vista amplia y permite ocultar el panel. Ver [avance 03](docs/avance_03_paginas_y_explorador.md). Esta versión se entrega sin tests ni verificaciones, por indicación del usuario.

## Ejecutar localmente

Requiere Node `^20.19.0 || >=22.12.0` y npm. Se verificó con Node 22.14.0. React se instala dentro del proyecto; no necesita instalación global.

Después de la instalación inicial, iniciar **dos terminales** desde la raíz del proyecto.

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
npm run dev
```

Abrir la dirección local que muestre Vite. Para detener cada proceso, usar Ctrl+C. PostgreSQL debe estar iniciado. No reinstalar dependencias ni ejecutar migraciones en cada arranque. El avance 06 añade la migración 0002_spatial_index: aplicarla una vez. No hay dependencias nuevas. Si aún no se instalaron las dependencias, usar `npm ci` en `frontend` y seguir la preparación del backend.

## Verificar y compilar

```powershell
cd frontend
npm run build
```

Este comando verifica tipos y crea `frontend/dist`. Para revisar esa compilación: `npm run preview`. `dist` y `node_modules` no se versionan; `package-lock.json` sí.

## Flujo Git

Se conserva el repositorio existente y su primer commit. El arranque se realiza en `codex/fase-1-base-react`, con commits separados para documentación e interfaz. Los cambios se guardan localmente; no se ha hecho push ni merge a `main`.

Radio y distancia geográfica añadidos. Ver [avance 06 y su migración](docs/avance_06_consultas_espaciales.md) y [hoja de ruta de 10 avances](docs/hoja_de_ruta.md). Siguiente parte: acceso y preparación del cuestionario, en entregas acotadas. Los datos institucionales reales requieren autorización y revisión. Este avance se entrega sin tests ni verificaciones, conforme a la instrucción del usuario.


Avance 07: nueva página de comparación de hasta tres sedes, con selección compartida y datos consultados a la API. [Detalle y arranque](docs/avance_07_comparador.md). No añade dependencias ni migraciones. Sin pruebas ni verificaciones en esta entrega.
