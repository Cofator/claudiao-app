// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-muted-foreground">Página não encontrada.</p>
      <Link to="/">
        <Button>Voltar pro início</Button>
      </Link>
    </div>
  )
}