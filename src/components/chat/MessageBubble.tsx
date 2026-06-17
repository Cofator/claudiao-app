// src/components/chat/MessageBubble.tsx
import type { AjudanteEvent, Nivel } from '@/lib/events'
import { translate, type MensagemAmigavel } from './Translator'

interface MessageBubbleProps {
  event: AjudanteEvent
  nivel: Nivel
}

export function MessageBubble({ event, nivel }: MessageBubbleProps) {
  const msg = translate(event, nivel)
  if (!msg) return null
  return <Bubble msg={msg} />
}

function Bubble({ msg }: { msg: MensagemAmigavel }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="text-2xl leading-none">{msg.emoji || '💬'}</span>
      <span className={msg.perigoso ? 'text-orange-600 font-medium' : ''}>{msg.texto}</span>
    </div>
  )
}