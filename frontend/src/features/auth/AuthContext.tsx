import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, getJson, markSessionChanged, postJson, subscribeAuthFailures } from '../../services/api'

export type Role = 'student' | 'coordinator' | 'admin'
export const roleLabels: Record<Role, string> = { student: 'Estudiante', coordinator: 'Coordinación', admin: 'Administración' }
interface User { id: string; username: string; display_name: string; role: Role }
interface Session { user: User; csrf_token: string }
interface AuthState {
  csrfToken: string | null
  user: User | null; loading: boolean; error: string | null
  reload: () => void
  signIn: (username: string, password: string, signal: AbortSignal) => Promise<void>
  signOut: (signal: AbortSignal) => Promise<void>
}
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const recovery = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const changingSession = useRef(false)
  const channel = useRef<BroadcastChannel | null>(null)

  const refreshSession = useCallback(async (foreground = false) => {
    if (changingSession.current) return
    recovery.current?.abort()
    const controller = new AbortController()
    recovery.current = controller
    const current = ++generation.current
    if (foreground) setLoading(true)
    try {
      const next = await getJson<Session>('/auth/me', controller.signal)
      if (controller.signal.aborted || current !== generation.current) return
      markSessionChanged()
      setSession(next)
      setError(null)
    } catch (reason) {
      if (controller.signal.aborted || current !== generation.current) return
      markSessionChanged()
      setSession(null)
      setError(reason instanceof ApiError && reason.status === 401
        ? null : 'No se pudo recuperar la sesión. Comprueba que la API esté disponible.')
    } finally {
      if (!controller.signal.aborted && current === generation.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeAuthFailures(status => {
      if (status === 403) {
        // Actualizar token/rol sin reenviar automáticamente una escritura.
        void refreshSession()
        return
      }
      recovery.current?.abort()
      generation.current += 1
      markSessionChanged()
      setSession(null)
      setError(null)
      setLoading(false)
    })
    const onFocus = () => { void refreshSession() }
    window.addEventListener('focus', onFocus)
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel('territorio-auth')
      channel.current.onmessage = event => {
        if (event.data === 'session-changed') void refreshSession(true)
      }
    }
    void refreshSession(true)
    return () => {
      recovery.current?.abort()
      generation.current += 1
      unsubscribe()
      window.removeEventListener('focus', onFocus)
      channel.current?.close()
      channel.current = null
    }
  }, [refreshSession])

  const beginSessionChange = () => {
    changingSession.current = true
    recovery.current?.abort()
    generation.current += 1
    markSessionChanged()
  }

  const signIn = async (username: string, password: string, signal: AbortSignal) => {
    beginSessionChange()
    try {
      const next = await postJson<Session>('/auth/login', { username, password }, signal)
      if (signal.aborted) return
      markSessionChanged()
      setSession(next)
      setError(null)
      channel.current?.postMessage('session-changed')
    } finally {
      changingSession.current = false
      setLoading(false)
    }
  }
  const signOut = async (signal: AbortSignal) => {
    if (!session) return
    beginSessionChange()
    try {
      await postJson('/auth/logout', {}, signal, { 'X-CSRF-Token': session.csrf_token })
      if (signal.aborted) return
      markSessionChanged()
      setSession(null)
      setError(null)
      channel.current?.postMessage('session-changed')
    } catch (reason) {
      changingSession.current = false
      void refreshSession()
      throw reason
    } finally {
      changingSession.current = false
      setLoading(false)
    }
  }
  return <AuthContext.Provider value={{ user: session?.user ?? null, csrfToken: session?.csrf_token ?? null, loading, error,
    reload: () => { void refreshSession(true) }, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Se requiere AuthProvider.')
  return value
}
