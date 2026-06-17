// src/components/chat/LevelSelector.tsx
import { useLevel } from '@/hooks/useLevel'
import type { Nivel } from '@/lib/events'
import { Button } from '@/components/ui/button'

const OPCOES: Array<{ value: Nivel; label: string; emoji: string }> = [
  { value: 'tranquilo', label: 'Tranquilo', emoji: '😌' },
  { value: 'curioso', label: 'Curioso', emoji: '🙂' },
  { value: 'tecnico', label: 'Técnico', emoji: '🤓' },
]

export function LevelSelector() {
  const { level, setLevel } = useLevel()
  return (
    <div className="flex gap-1 border rounded-md p-1">
      {OPCOES.map((o) => (
        <Button
          key={o.value}
          variant={level === o.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLevel(o.value)}
          aria-pressed={level === o.value}
        >
          {o.emoji} {o.label}
        </Button>
      ))}
    </div>
  )
}