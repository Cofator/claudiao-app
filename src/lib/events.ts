// src/lib/events.ts
// Tipos do NDJSON que o Ajudante emite. Mantém sincronia com
// D:\Claude_Code\minimax-reseller\src\ajudante\events.ts.
// Se o backend mudar este tipo, atualizar este arquivo também.

export type AjudanteEvent =
  | { kind: 'start'; sessionId: string; model: string; cwd: string }
  | { kind: 'text-delta'; delta: string }
  | { kind: 'assistant-text'; text: string }
  | { kind: 'tool-start'; toolName: string; args?: Record<string, unknown> }
  | { kind: 'done'; ok: boolean; code?: number; resultText?: string; reason?: string }
  | { kind: 'error'; message: string }

export type Nivel = 'tranquilo' | 'curioso' | 'tecnico'