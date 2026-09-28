# Avance 04 — FastAPI y catálogo PostgreSQL/PostGIS

## Código incorporado

- Backend independiente, organizado en configuración, conexión, modelos, contratos, servicios y rutas.
- Configuración mediante `.env`, excluido de Git; plantilla sin secretos.
- API de consulta de sedes y distritos, filtros y paginación con límites.
- Estados separados para proceso activo y disponibilidad de base espacial.
- Manejo de errores de base sin divulgar consultas ni credenciales.
- Migración inicial con institución, distrito y sede, punto EPSG:4326 e índice espacial GiST.
- Restricciones de integridad y fuente/fecha obligatorias para marcar una sede como verificada.

La base parte vacía. El frontend conserva la demostración local y todavía no consume esta API.

## Acción externa necesaria

El usuario debe disponer de PostgreSQL/PostGIS y crear una base exclusiva `territorio`, con usuario local `territorio_app`. Después completará su contraseña en `backend/.env`, instalará las dependencias Python y aplicará la migración. Las instrucciones están en [backend/README.md](../backend/README.md).

No enviar contraseñas al chat. Si PostgreSQL o PostGIS no están instalados, continuar primero con esa preparación según la versión instalada. No crear tablas manualmente.

## Próxima parte

Una vez preparada la base local, añadir una carga de datos controlada y conectar React a la API: estados de carga/error/vacío, adaptación de coordenadas y sustitución explícita de datos demo. Más adelante se implementarán radio, distancia y comparación.

## Estado de entrega

Solo se generó código y documentación. No se ejecutaron tests ni verificaciones, de acuerdo con la instrucción del usuario. La compatibilidad del entorno y la ejecución de migraciones quedan pendientes; no se declara este backend probado ni desplegado.
