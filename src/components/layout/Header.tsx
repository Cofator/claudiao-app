// src/components/layout/Header.tsx
import { useUsage, useLogout } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const usage = useUsage(24)
  const logout = useLogout()
  const navigate = useNavigate()

  async function onLogout() {
    await logout.mutateAsync()
    sessionStorage.clear()
    navigate('/')
  }

  return (
    <header className="relative z-10 flex justify-between items-center px-4 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <img src="/brand/logo-horizontal.png" alt="Claudião" className="h-8 w-auto" />
      <div className="flex items-center gap-4">
        {usage.data?.ok && (
          <span
            className="text-sm font-medium text-claudio-amber"
            title="Gasto nas últimas 24h"
          >
            R$ {usage.data.totalBrl.toFixed(2)}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Sair
        </Button>
      </div>
    </header>
  )
}
