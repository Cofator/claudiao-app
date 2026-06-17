import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { bridgePing, bridgePair, bridgeRun, isBridgeAvailable } from '@/lib/bridge'

describe('bridge wrapper', () => {
  let listeners: Array<(e: MessageEvent) => void> = []

  beforeEach(() => {
    listeners = []
    vi.stubGlobal('window', {
      postMessage: vi.fn(),
      addEventListener: (_: string, cb: any) => listeners.push(cb),
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  describe('isBridgeAvailable', () => {
    it('true se chegou mensagem source=claudiao-bridge nos ultimos 5s', () => {
      listeners.forEach((cb) => cb({ data: { source: 'claudiao-bridge', type: 'ajudante:ping:ok', payload: {} } } as MessageEvent))
      expect(isBridgeAvailable()).toBe(true)
    })

    it('false se nenhuma mensagem chegou', () => {
      expect(isBridgeAvailable()).toBe(false)
    })
  })

  describe('bridgePing', () => {
    it('resolve com {ok, name, version}', async () => {
      const p = bridgePing()
      listeners.forEach((cb) => cb({ data: { source: 'claudiao-bridge', requestId: expect.any(String), type: 'ajudante:ping:ok', payload: { ok: true, name: 'ajudante', version: '0.1.0' } } } as MessageEvent))
      const r = await p
      expect(r.ok).toBe(true)
    })
  })

  describe('bridgePair', () => {
    it('resolve com {token}', async () => {
      const p = bridgePair('meu-segredo')
      listeners.forEach((cb) => cb({ data: { source: 'claudiao-bridge', requestId: expect.any(String), type: 'ajudante:pair:ok', payload: { ok: true, token: 'tk' } } } as MessageEvent))
      const r = await p
      expect(r.token).toBe('tk')
    })
  })

  describe('bridgeRun', () => {
    it('emite eventos e resolve com code no done', async () => {
      const eventos: any[] = []
      const done = bridgeRun({ prompt: 'oi' }, (e) => eventos.push(e))
      listeners.forEach((cb) => cb({ data: { source: 'claudiao-bridge', requestId: expect.any(String), type: 'ajudante:run:stream', payload: { kind: 'start', sessionId: 's1', model: 'm', cwd: '/p' } } } as MessageEvent))
      listeners.forEach((cb) => cb({ data: { source: 'claudiao-bridge', requestId: expect.any(String), type: 'ajudante:run:stream', payload: { kind: 'text-delta', delta: 'oi' } } } as MessageEvent))
      listeners.forEach((cb) => cb({ data: { source: 'claudiao-bridge', requestId: expect.any(String), type: 'ajudante:run:done', payload: { code: 0 } } } as MessageEvent))
      const code = await done
      expect(eventos.map((e) => e.kind)).toEqual(['start', 'text-delta'])
      expect(code).toBe(0)
    })
  })
})