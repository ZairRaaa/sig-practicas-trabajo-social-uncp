const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) { super(message) }
}

async function requestJson<T>(path: string, signal: AbortSignal, body?: unknown): Promise<T> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) controller.abort()
  let timedOut = false
  const timeout = window.setTimeout(() => { timedOut = true; controller.abort() }, 15000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      signal: controller.signal,
      method: body === undefined ? 'GET' : 'POST',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!response.ok) {
      const message = response.status === 404 ? 'La sede no existe o ya no está disponible.'
        : response.status === 422 ? 'Los parámetros de la consulta no son válidos. Revisa las coordenadas y el radio.'
        : response.status === 503 ? 'El catálogo no está disponible. Puede faltar la conexión a la base o aplicar sus migraciones.'
          : 'No se pudo consultar el catálogo. Inténtalo de nuevo.'
      throw new ApiError(message, response.status)
    }
    return await response.json() as T
  } catch (error) {
    if (signal.aborted) throw new DOMException('Solicitud cancelada', 'AbortError')
    if (timedOut) throw new ApiError('El servidor tardó demasiado en responder. Inténtalo de nuevo.')
    if (error instanceof ApiError) throw error
    throw new ApiError('No se pudo conectar con el catálogo. Comprueba que el backend esté en ejecución.')
  } finally {
    window.clearTimeout(timeout)
    signal.removeEventListener('abort', abort)
  }
}

export function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  return requestJson<T>(path, signal)
}

export function postJson<T>(path: string, body: unknown, signal: AbortSignal): Promise<T> {
  return requestJson<T>(path, signal, body)
}
