// src/components/pairing/PairingFlow.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bridgePair, bridgePing, isBridgeAvailable } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BridgeGuide } from './BridgeGuide'
import { AjudanteDownload } from './AjudanteDownload'

export function PairingFlow() {
  const [secret, setSecret] = useState('')
  const [status, setStatus] = useState<'idle' | 'paring' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function checkAjudante() {
    const r = await bridgePing()
    if (!r.ok) setError('Ajudante não respondeu. Abra o Ajudante no seu PC e tente de novo.')
    else setError(null)
  }

  async function onPair() {
    setStatus('paring')
    setError(null)
    const r = await bridgePair(secret)
    if ('error' in r) {
      setStatus('error')
      setError(r.error)
      return
    }
    sessionStorage.setItem('claudiao:ajudante-token', r.token)
    setStatus('done')
    setTimeout(() => navigate('/c'), 500)
  }

  const bridgeUp = isBridgeAvailable()

  return (
    <Card className="w-full max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Conectar ao Ajudante</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <span>Extensão Bridge:</span>
          {bridgeUp
            ? <Badge className="border-claudio-ok/40 bg-claudio-ok/10 text-claudio-ok">Instalada ✅</Badge>
            : <Badge className="border-claudio-amber/40 bg-claudio-amber/10 text-claudio-amber">Não detectada</Badge>}
        </div>

        {!bridgeUp && (
          <div className="border rounded p-4 space-y-3 bg-muted/50">
            <p className="font-medium">1. Instale a extensão Bridge no seu navegador</p>
            <BridgeGuide />
          </div>
        )}

        <div className="border rounded p-4 space-y-3">
          <p className="font-medium">2. Abra o Ajudante no seu PC</p>
          {!bridgeUp && <AjudanteDownload />}
          {bridgeUp && (
            <Button variant="outline" onClick={checkAjudante}>
              🔄 Verificar Ajudante
            </Button>
          )}
        </div>

        <div className="border rounded p-4 space-y-3">
          <p className="font-medium">3. Cole o secret do Ajudante</p>
          <Input
            type="text"
            placeholder="Cole aqui o código que aparece no Ajudante"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={onPair} disabled={!secret || status === 'paring'}>
            {status === 'paring' ? 'Pareando...' : '🤝 Parear'}
          </Button>
        </div>

        {status === 'done' && <p className="text-claudio-ok font-medium">✅ Pareado! Indo pro chat...</p>}
      </CardContent>
    </Card>
  )
}