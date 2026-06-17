// src/lib/bridge.ts
// Wrapper TypeScript que fala com a Bridge (extensao Chrome) via window.postMessage.

import type { AjudanteEvent } from '@/lib/events'

let lastBridgePingAt = 0

export function isBridgeAvailable(): boolean {
  return Date.now() - lastBridgePingAt < 5_000
}

function send<T>(request: object): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2)
    const onMsg = (e: MessageEvent) => {
      const data = e.data
      if (!data || data.source !== 'claudiao-bridge') return
      if (data.requestId !== id) return
      window.removeEventListener('message', onMsg)
      if (data.error) reject(new Error(data.error))
      else resolve(data.payload as T)
    }
    window.addEventListener('message', onMsg)
    window.postMessage({ source: 'claudiao-cockpit', requestId: id, ...request }, '*')
  })
}

// Detecta mensagens da Bridge para atualizar lastBridgePingAt (handshake implícito).
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e) => {
    if (e.data?.source === 'claudiao-bridge') lastBridgePingAt = Date.now()
  })
}

export async function bridgePing(): Promise<{ ok: true; name: string; version: string } | { ok: false; error: string }> {
  try {
    const r = await send<{ ok: true; name: string; version: string }>({ type: 'ajudante:ping' })
    return r
  } catch (e) {
    return { ok: false, error: String((e as Error).message ?? e) }
  }
}

export async function bridgePair(secret: string): Promise<{ token: string } | { error: string }> {
  try {
    const r = await send<{ ok: true; token: string }>({ type: 'ajudante:pair', payload: { secret } })
    return { token: r.token }
  } catch (e) {
    return { error: String((e as Error).message ?? e) }
  }
}

export function bridgeRun(
  payload: { prompt: string; projectDir?: string; sessionId?: string },
  onEvent: (e: AjudanteEvent) => void,
): Promise<number> {
  return new Promise<number>((resolve) => {
    const id = Math.random().toString(36).slice(2)
    let resolved = false
    const onMsg = (e: MessageEvent) => {
      const data = e.data
      if (!data || data.source !== 'claudiao-bridge') return
      if (data.requestId !== id) return

      if (data.type === 'ajudante:run:stream') {
        onEvent(data.payload as AjudanteEvent)
      } else if (data.type === 'ajudante:run:done') {
        if (!resolved) {
          resolved = true
          window.removeEventListener('message', onMsg)
          resolve(data.payload.code ?? 0)
        }
      } else if (data.type === 'ajudante:error') {
        if (!resolved) {
          resolved = true
          window.removeEventListener('message', onMsg)
          onEvent({ kind: 'error', message: data.payload.message })
          resolve(-1)
        }
      }
    }
    window.addEventListener('message', onMsg)
    window.postMessage({ source: 'claudiao-cockpit', requestId: id, type: 'ajudante:run', payload }, '*')
  })
}