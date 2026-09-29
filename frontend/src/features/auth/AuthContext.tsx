import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, getJson, postJson } from '../../services/api'

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
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    getJson<Session>('/auth/me', controller.signal).then(setSession).catch((reason: unknown) => {
      if (controller.signal.aborted) return
      setSession(null)
      if (!(reason instanceof ApiError && reason.status === 401)) {
        setError('No se pudo recuperar la sesión. Comprueba que la API esté disponible.')
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [revision])

  const signIn = async (username: string, password: string, signal: AbortSignal) => {
    const next = await postJson<Session>('/auth/login', { username, password }, signal)
    setSession(next); setError(null)
  }
  const signOut = async (signal: AbortSignal) => {
    if (!session) return
    await postJson('/auth/logout', {}, signal, { 'X-CSRF-Token': session.csrf_token })
    setSession(null); setError(null)
  }
  return <AuthContext.Provider value={{ user: session?.user ?? null, csrfToken: session?.csrf_token ?? null, loading, error,
    reload: () => setRevision(value => value + 1), signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Se requiere AuthProvider.')
  return value
}
