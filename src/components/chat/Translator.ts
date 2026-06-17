// src/components/chat/Translator.ts
// Função pura: converte um AjudanteEvent numa MensagemAmigavel
// conforme o nível de tradução escolhido. Sem React, sem side effects.

import type { AjudanteEvent, Nivel } from '@/lib/events'

export interface MensagemAmigavel {
  /** Emoji de abertura (ou vazio). */
  emoji: string
  /** Texto principal, em português. */
  texto: string
  /** True se é uma ação perigosa que precisa confirmação. */
  perigoso?: boolean
}

export function translate(event: AjudanteEvent, nivel: Nivel): MensagemAmigavel | null {
  switch (event.kind) {
    case 'start':
      if (nivel === 'tranquilo') return null
      if (nivel === 'curioso') return { emoji: '🟡', texto: 'Comecei a trabalhar...' }
      return { emoji: '⚙️', texto: `iniciando claude, model: ${event.model}, cwd: ${event.cwd}` }

    case 'text-delta': {
      const lower = event.delta.toLowerCase()
      if (lower.includes('writing') || lower.includes('creating')) {
        return nivel === 'tranquilo'
          ? { emoji: '🔨', texto: 'Montando a página...' }
          : { emoji: '🔨', texto: 'Montando o arquivo...' }
      }
      if (lower.includes('editing') || lower.includes('updating')) {
        return nivel === 'tranquilo'
          ? { emoji: '🎨', texto: 'Ajustando uma coisinha...' }
          : { emoji: '🎨', texto: 'Ajustando o estilo...' }
      }
      if (lower.includes('running') || lower.includes('installing')) {
        return nivel === 'tranquilo'
          ? { emoji: '⚙️', texto: 'Preparando tudo, só um instante...' }
          : { emoji: '⚙️', texto: 'Rodando um comando...' }
      }
      return { emoji: '💬', texto: 'Estou trabalhando...' }
    }

    case 'assistant-text':
      return nivel === 'tecnico' ? { emoji: '', texto: event.text } : { emoji: '💬', texto: event.text }

    case 'tool-start': {
      const tool = event.toolName
      const args = event.args ?? {}
      if (tool === 'WriteFile') {
        const file = String(args['file_path'] ?? 'arquivo')
        if (nivel === 'tranquilo') return { emoji: '🔨', texto: 'Criando a página...' }
        if (nivel === 'curioso') return { emoji: '🔨', texto: `Criando \`${file}\`` }
        return { emoji: '', texto: `WriteFile: ${file}` }
      }
      if (tool === 'Edit') {
        const file = String(args['file_path'] ?? 'arquivo')
        const line = args['line'] ? `:${args['line']}` : ''
        if (nivel === 'tranquilo') return { emoji: '🎨', texto: 'Ajustando as cores...' }
        if (nivel === 'curioso') return { emoji: '🎨', texto: `Ajustando \`${file}${line}\`` }
        return { emoji: '', texto: `Edit: ${file}${line}` }
      }
      if (tool === 'Bash') {
        const cmd = String(args['command'] ?? '')
        const perigoso = /rm\s+-rf|del\s+\/|format/i.test(cmd)
        if (nivel === 'tranquilo') {
          if (perigoso) return { emoji: '🛑', texto: 'Vou apagar umas coisas. Posso?', perigoso: true }
          return { emoji: '⚙️', texto: 'Preparando tudo, só um instante...' }
        }
        if (nivel === 'curioso') {
          if (perigoso) return { emoji: '🛑', texto: `Vai apagar: \`${cmd}\`. OK?`, perigoso: true }
          return { emoji: '⚙️', texto: `Rodando \`${cmd}\`` }
        }
        return { emoji: '', texto: `Bash: ${cmd}` }
      }
      return { emoji: '🔧', texto: nivel === 'tranquilo' ? 'Estou trabalhando...' : `Tool: ${tool}` }
    }

    case 'error':
      if (nivel === 'tranquilo') return { emoji: '⚠️', texto: 'Tive um probleminha, já resolvo.' }
      if (nivel === 'curioso') return { emoji: '⚠️', texto: `Erro: ${event.message}` }
      return { emoji: '', texto: event.message }

    case 'done':
      if (event.ok) {
        if (nivel === 'tranquilo') return { emoji: '✅', texto: 'Prontinho! Dá uma olhada 👀' }
        if (nivel === 'curioso') return { emoji: '✅', texto: 'Pronto!' }
        return { emoji: '', texto: `done, code:${event.code ?? 0}` }
      }
      if (nivel === 'tranquilo') return { emoji: '🛑', texto: 'Deu ruim, vou tentar de novo...' }
      if (nivel === 'curioso') return { emoji: '🛑', texto: `Erro: ${event.reason ?? '?'}` }
      return { emoji: '', texto: `done, code:${event.code ?? -1}, reason:${event.reason ?? '?'}` }
  }
}