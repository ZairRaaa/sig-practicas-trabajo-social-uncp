import { useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const storageKey = 'territorio-theme'
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

function readPreference(): Theme | null {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState(readPreference)
  const [systemDark, setSystemDark] = useState(systemTheme.matches)
  const theme = preference ?? (systemDark ? 'dark' : 'light')

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e1526' : '#f4f6fb')
  }, [theme])

  useEffect(() => {
    const syncSystem = (event: MediaQueryListEvent) => setSystemDark(event.matches)
    const syncStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setPreference(readPreference())
    }
    systemTheme.addEventListener('change', syncSystem)
    window.addEventListener('storage', syncStorage)
    return () => {
      systemTheme.removeEventListener('change', syncSystem)
      window.removeEventListener('storage', syncStorage)
    }
  }, [])

  const changeTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setPreference(next)
    try {
      localStorage.setItem(storageKey, next)
    } catch {
      // La preferencia puede seguir usándose en la pestaña actual.
    }
  }

  return <button type="button" className="theme-toggle" aria-label="Modo oscuro" aria-pressed={theme === 'dark'}
    title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} onClick={changeTheme}>
    <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>{theme === 'dark' ? 'Claro' : 'Oscuro'}
  </button>
}
