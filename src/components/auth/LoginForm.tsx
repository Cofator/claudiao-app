// src/components/auth/LoginForm.tsx
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useApi'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const r = await login.mutateAsync({ email, password })
    if (r.ok) {
      sessionStorage.setItem('claudiao:ajudante-token', r.token)
      navigate('/parear')
    }
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/brand/logo-horizontal.png"
          alt="Claudião"
          className="h-14 w-auto drop-shadow-[0_8px_24px_rgba(240,180,65,0.25)]"
        />
        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
          Seu ajudante pra usar o Claude sem complicação.
        </p>
      </div>

      <Card className="w-full max-w-sm border-border/80 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)]">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="senha">
                Senha
              </label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {login.isError && (
              <p className="text-sm text-destructive">{login.error.message}</p>
            )}
            {login.data && !login.data.ok && (
              <p className="text-sm text-destructive">{login.data.error}</p>
            )}
            <Button type="submit" disabled={login.isPending} className="w-full font-semibold">
              {login.isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground/70">claudiao.app</p>
    </div>
  )
}
