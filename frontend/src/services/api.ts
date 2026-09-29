const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) { super(message) }
}

export async function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) controller.abort()
  let timedOut = false
  const timeout = window.setTimeout(() => { timedOut = true; controller.abort() }, 15000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      signal: controller.signal, headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      const message = response.status === 404 ? 'La sede no existe o ya no está disponible.'
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
