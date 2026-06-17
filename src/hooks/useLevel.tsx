// src/hooks/useLevel.ts
// Nível de tradução: persiste em localStorage. Default = curioso.

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Nivel } from '@/lib/events'

const STORAGE_KEY = 'claudiao:level'
const DEFAULT: Nivel = 'curioso'
const VALID: readonly Nivel[] = ['tranquilo', 'curioso', 'tecnico']

function isValidNivel(v: unknown): v is Nivel {
  return typeof v === 'string' && (VALID as readonly string[]).includes(v)
}

function readStorage(): Nivel {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return isValidNivel(v) ? v : DEFAULT
  } catch {
    return DEFAULT
  }
}

function writeStorage(v: Nivel): void {
  try { localStorage.setItem(STORAGE_KEY, v) } catch { /* ignore */ }
}

interface LevelContextValue {
  level: Nivel
  setLevel: (v: Nivel) => void
}

const LevelContext = createContext<LevelContextValue | null>(null)

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<Nivel>(DEFAULT)

  useEffect(() => {
    setLevelState(readStorage())
  }, [])

  const setLevel = (v: Nivel) => {
    setLevelState(v)
    writeStorage(v)
  }

  return <LevelContext.Provider value={{ level, setLevel }}>{children}</LevelContext.Provider>
}

export function useLevel(): LevelContextValue {
  const ctx = useContext(LevelContext)
  if (!ctx) throw new Error('useLevel deve ser usado dentro de LevelProvider')
  return ctx
}