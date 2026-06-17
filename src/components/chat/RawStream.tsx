// src/components/chat/RawStream.tsx
// Modal com stream cru do Claude Code (JSON cru, 1 linha por evento).

import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { AjudanteEvent } from '@/lib/events'

export function RawStream({ open, onClose, eventos }: { open: boolean; onClose: () => void; eventos: AjudanteEvent[] }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">👁️ Stream cru do Claude Code</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Fechar</Button>
        </div>
        <pre className="bg-zinc-950 text-zinc-100 p-4 rounded text-xs overflow-auto max-h-[60vh] font-mono">
          {eventos.map((e, i) => `${String(i).padStart(3, '0')} ${JSON.stringify(e)}`).join('\n')}
        </pre>
      </div>
    </Dialog>
  )
}