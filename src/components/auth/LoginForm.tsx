// src/components/auth/LoginForm.tsx
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <Card className="w-full max-w-sm mx-auto mt-20">
      <CardHeader>
        <CardTitle>Entrar no Claudião</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {login.isError && (
            <p className="text-sm text-red-600">{login.error.message}</p>
          )}
          {login.data && !login.data.ok && (
            <p className="text-sm text-red-600">{login.data.error}</p>
          )}
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}