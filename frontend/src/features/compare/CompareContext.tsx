import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface Selection { id: string; name: string }
interface CompareState {
  selections: Selection[]
  toggle: (site: Selection) => void
  remove: (id: string) => void
  clear: () => void
}
const CompareContext = createContext<CompareState | null>(null)
export const MAX_COMPARE = 3

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<Selection[]>([])
  const toggle = (site: Selection) => setSelections(current => {
    if (current.some(item => item.id === site.id)) return current.filter(item => item.id !== site.id)
    return current.length < MAX_COMPARE ? [...current, { id: site.id, name: site.name }] : current
  })
  return <CompareContext.Provider value={{ selections, toggle,
    remove: id => setSelections(current => current.filter(item => item.id !== id)),
    clear: () => setSelections([]),
  }}>{children}</CompareContext.Provider>
}

export function useComparison() {
  const context = useContext(CompareContext)
  if (!context) throw new Error('El comparador requiere CompareProvider.')
  return context
}
