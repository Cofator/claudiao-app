// src/components/chat/ChatBox.tsx
// A tela principal do cockpit: caixa de conversa + seletor de nível + raw stream.

import { type FormEvent, useState, useRef } from 'react'
import { bridgeRun } from '@/lib/bridge'
import { useLevel } from '@/hooks/useLevel'
import { useUsage } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LevelSelector } from './LevelSelector'
import { MessageBubble } from './MessageBubble'
import { RawStream } from './RawStream'
import type { AjudanteEvent } from '@/lib/events'

export function ChatBox() {
  const { level } = useLevel()
  const [eventos, setEventos] = useState<AjudanteEvent[]>([])
  const [prompt, setPrompt] = useState('')
  const [running, setRunning] = useState(false)
  const [rawOpen, setRawOpen] = useState(false)
  const usage = useUsage(24)
  const runIdRef = useRef(0)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || running) return
    setRunning(true)
    setEventos([])
    const myRunId = ++runIdRef.current
    const code = await bridgeRun(
      { prompt },
      (evt) => setEventos((prev) => [...prev, evt]),
    )
    setRunning(false)
    if (runIdRef.current === myRunId) {
      setEventos((prev) => [...prev, { kind: 'done', ok: code === 0, code }])
    }
    usage.refetch()
    setPrompt('')
  }

  return (
    <div className="flex flex-col h-screen p-4 max-w-3xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-xl font-semibold">🟡 Claudião</h1>
        <div className="flex items-center gap-3">
          {usage.data?.ok && (
            <span className="text-sm text-muted-foreground">
              👛 R$ {usage.data.totalBrl.toFixed(2)} (24h)
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => setRawOpen(true)}>
            👁️ Ver por dentro
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto py-4 space-y-1">
        {eventos.length === 0 && !running && (
          <p className="text-muted-foreground text-center mt-20">
            Diga o que você quer criar e o Claudião faz pra você ✨
          </p>
        )}
        {eventos.map((evt, i) => (
          <MessageBubble key={i} event={evt} nivel={level} />
        ))}
      </main>

      <footer className="border-t pt-4 space-y-3">
        <div className="flex justify-center">
          <LevelSelector />
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Ex: "faz um site de pizzaria"'
            disabled={running}
            autoFocus
          />
          <Button type="submit" disabled={running || !prompt.trim()}>
            {running ? '...' : 'Enviar'}
          </Button>
        </form>
      </footer>

      <RawStream open={rawOpen} onClose={() => setRawOpen(false)} eventos={eventos} />
    </div>
  )
}