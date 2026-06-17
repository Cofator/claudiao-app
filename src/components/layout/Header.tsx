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
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-semibold">🟡 Claudião</h1>
      <div className="flex items-center gap-3">
        {usage.data?.ok && (
          <span className="text-sm text-muted-foreground" title="Gasto últimas 24h">
            👛 R$ {usage.data.totalBrl.toFixed(2)}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={onLogout}>Sair</Button>
      </div>
    </header>
  )
}