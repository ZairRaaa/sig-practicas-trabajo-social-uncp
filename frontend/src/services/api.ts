const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) { super(message) }
}

type AuthFailure = 401 | 403
const authListeners = new Set<(status: AuthFailure) => void>()
let sessionRevision = 0

export function markSessionChanged() {
  sessionRevision += 1
}

export function subscribeAuthFailures(listener: (status: AuthFailure) => void) {
  authListeners.add(listener)
  return () => { authListeners.delete(listener) }
}

async function errorMessage(response: Response): Promise<string> {
  // La API entrega mensajes públicos explícitos. Nunca mostrar cuerpos de errores 5xx.
  if ([400, 401, 403, 404, 409, 422, 429].includes(response.status)) {
    const payload: unknown = await response.json().catch(() => null)
    if (payload && typeof payload === 'object' && 'detail' in payload
      && typeof payload.detail === 'string' && payload.detail.trim().length > 0
      && payload.detail.length <= 1000) return payload.detail
  }
  const messages: Record<number, string> = {
    401: 'La sesión no está activa o las credenciales son incorrectas.',
    403: 'No tienes permiso para esta acción o la sesión debe actualizarse.',
    404: 'El recurso solicitado no existe o ya no está disponible.',
    409: 'La información cambió. Actualiza el estado antes de continuar.',
    422: 'Revisa los datos enviados; algún valor no es válido.',
    429: 'Demasiados intentos. Espera un minuto antes de continuar.',
    503: 'El servicio no está disponible. Puede faltar la conexión a la base o aplicar sus migraciones.',
  }
  return messages[response.status] ?? 'No se pudo completar la solicitud. Inténtalo de nuevo.'
}

async function requestJson<T>(path: string, signal: AbortSignal, body?: unknown, extraHeaders: Record<string, string> = {}): Promise<T> {
  const requestRevision = sessionRevision
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) controller.abort()
  let timedOut = false
  const timeout = window.setTimeout(() => { timedOut = true; controller.abort() }, 15000)
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      signal: controller.signal,
      credentials: 'include',
      method: body === undefined ? 'GET' : 'POST',
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...extraHeaders },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!response.ok) {
      const message = await errorMessage(response)
      if (!signal.aborted && requestRevision === sessionRevision
        && path !== '/auth/login' && path !== '/auth/me'
        && (response.status === 401 || response.status === 403)) {
        authListeners.forEach(listener => listener(response.status as AuthFailure))
      }
      throw new ApiError(message, response.status)
    }
    return await response.json() as T
  } catch (error) {
    if (signal.aborted) throw new DOMException('Solicitud cancelada', 'AbortError')
    if (timedOut) throw new ApiError('El servidor tardó demasiado en responder. Inténtalo de nuevo.')
    if (error instanceof ApiError) throw error
    throw new ApiError('No se pudo conectar con el servicio. Comprueba que el backend esté en ejecución.')
  } finally {
    window.clearTimeout(timeout)
    signal.removeEventListener('abort', abort)
  }
}

export function getJson<T>(path: string, signal: AbortSignal): Promise<T> {
  return requestJson<T>(path, signal)
}

export function postJson<T>(path: string, body: unknown, signal: AbortSignal, headers: Record<string, string> = {}): Promise<T> {
  return requestJson<T>(path, signal, body, headers)
}
