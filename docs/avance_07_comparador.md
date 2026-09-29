# Avance 07 — Comparador de hasta tres sedes

## Alcance

Nueva página `/comparar`, accesible desde la navegación y una bandeja de selección en el catálogo. Se pueden añadir o quitar sedes desde las tarjetas o la ficha del mapa, hasta un máximo de tres. La selección conserva únicamente ID y nombre en memoria y acompaña la navegación entre páginas y filtros. Al recargar o cerrar la pestaña se reinicia; no se guardan datos en el navegador ni en PostgreSQL.

La comparación vuelve a consultar las fichas por ID. No reutiliza resultados antiguos del catálogo. Incluye:

- Institución, distrito, ámbito, dirección y descripción.
- Estado y fecha de verificación.
- Identificación de registros ficticios.
- Convenios, vacantes y valoraciones como información aún no disponible.
- Enlace para abrir cada sede en el mapa.

La tabla permite desplazamiento horizontal en pantallas pequeñas y dispone de encabezados de fila/columna. Una sede puede consultarse sola; el mensaje invita a añadir otra. Al alcanzar tres, se deshabilita añadir una cuarta hasta retirar alguna.

## Estados y límites

Hay selección vacía, consulta en curso, actualización manual y errores por sede. Si una sede no existe o fue desactivada, se conserva su columna con un aviso para que el usuario pueda retirarla. No se sustituyen errores por valores antiguos ni por ceros.

No hay ranking, puntaje ni ganadora automática. Las distancias no se arrastran desde el explorador porque podrían provenir de orígenes distintos; se consultan allí usando el mismo punto de referencia. El comparador de este avance muestra características del catálogo, no una nueva consulta espacial conjunta.

## Organización

- `features/compare/CompareContext.tsx`: selección compartida y límite de tres.
- `features/compare/CompareButton.tsx`: botón reutilizable de selección.
- `features/compare/CompareTray.tsx`: bandeja y acceso a comparación.
- `features/compare/compare.css`: estilos del módulo.
- `pages/ComparePage.tsx`: consulta de fichas y tabla.
- `features/catalog/catalogApi.ts`: función compartida para obtener una sede.

## Arranque

No añade dependencias, migraciones ni cambios de base. Mantener la migración del avance 06 ya aplicada.

Terminal backend, desde la raíz:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Otra terminal desde la raíz:

```powershell
cd frontend
npm run dev
```

En Centros o Explorador, marcar «Comparar sede» y abrir Comparar en la navegación. La selección puede combinar sedes de diferentes páginas del catálogo.

## Estado y siguiente parte

Código generado sin pruebas, compilación, llamadas a la API ni revisión visual, por instrucción del usuario. No se declara verificado.

Avance 08: acceso, roles y preparación del cuestionario. Ese bloque puede dividirse en entregas menores para mantener el desarrollo gradual y cerrar el instrumento antes de recoger respuestas reales.
