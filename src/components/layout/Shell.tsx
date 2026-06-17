// src/components/layout/Shell.tsx
import { type ReactNode } from 'react'
import { Header } from './Header'

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}