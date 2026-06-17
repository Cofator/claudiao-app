import { describe, it, expect, beforeEach } from 'vitest'
import {
  bridgePing,
  bridgePair,
  bridgeRun,
  isBridgeAvailable,
  __resetBridgeForTest,
  __markBridgePingedForTest,
} from '@/lib/bridge'

// Esses testes dependem do window real do jsdom (o modulo registra um listener
// global no load). Usamos os helpers de teste para controlar o estado de
// handshake de forma deterministica.

describe('bridge wrapper', () => {
  beforeEach(() => {
    __resetBridgeForTest()
  })

  describe('isBridgeAvailable', () => {
    it('false se nao houve ping da bridge', () => {
      expect(isBridgeAvailable()).toBe(false)
    })

    it('true apos um ping recente', () => {
      __markBridgePingedForTest()
      expect(isBridgeAvailable()).toBe(true)
    })

    it('true quando chega mensagem source=claudiao-bridge no window real', () => {
      // O modulo bridge.ts adiciona um listener global que atualiza o ping.
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { source: 'claudiao-bridge', type: 'ajudante:ping:ok', payload: {} },
        }),
      )
      expect(isBridgeAvailable()).toBe(true)
    })
  })

  describe('bridgePing', () => {
    it('resolve com {ok, name, version} quando bridge responde', async () => {
      const idPromise = new Promise<string>((resolve) => {
        const orig = window.postMessage.bind(window)
        ;(window as any).postMessage = (msg: any, _origin: string) => {
          if (msg?.source === 'claudiao-cockpit' && msg?.type === 'ajudante:ping') {
            resolve(msg.requestId)
            ;(window as any).postMessage = orig
          }
        }
      })

      const pingPromise = bridgePing()
      const reqId = await idPromise

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'claudiao-bridge',
            requestId: reqId,
            type: 'ajudante:ping:ok',
            payload: { ok: true, name: 'ajudante', version: '0.1.0' },
          },
        }),
      )

      const r = await pingPromise
      expect(r.ok).toBe(true)
      if (r.ok) {
        expect(r.name).toBe('ajudante')
        expect(r.version).toBe('0.1.0')
      }
    })

    it('resolve com {ok:false, error} quando bridge rejeita', async () => {
      const idPromise = new Promise<string>((resolve) => {
        const orig = window.postMessage.bind(window)
        ;(window as any).postMessage = (msg: any, _origin: string) => {
          if (msg?.source === 'claudiao-cockpit' && msg?.type === 'ajudante:ping') {
            resolve(msg.requestId)
            ;(window as any).postMessage = orig
          }
        }
      })

      const pingPromise = bridgePing()
      const reqId = await idPromise

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'claudiao-bridge',
            requestId: reqId,
            error: 'ajudante offline',
          },
        }),
      )

      const r = await pingPromise
      expect(r.ok).toBe(false)
    })
  })

  describe('bridgePair', () => {
    it('resolve com {token} quando bridge confirma', async () => {
      const idPromise = new Promise<string>((resolve) => {
        const orig = window.postMessage.bind(window)
        ;(window as any).postMessage = (msg: any, _origin: string) => {
          if (msg?.source === 'claudiao-cockpit' && msg?.type === 'ajudante:pair') {
            resolve(msg.requestId)
            ;(window as any).postMessage = orig
          }
        }
      })

      const pairPromise = bridgePair('meu-segredo')
      const reqId = await idPromise

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'claudiao-bridge',
            requestId: reqId,
            type: 'ajudante:pair:ok',
            payload: { ok: true, token: 'tk-123' },
          },
        }),
      )

      const r = await pairPromise
      expect('token' in r).toBe(true)
      if ('token' in r) expect(r.token).toBe('tk-123')
    })
  })

  describe('bridgeRun', () => {
    it('emite eventos e resolve com code no done', async () => {
      const idPromise = new Promise<string>((resolve) => {
        const orig = window.postMessage.bind(window)
        ;(window as any).postMessage = (msg: any, _origin: string) => {
          if (msg?.source === 'claudiao-cockpit' && msg?.type === 'ajudante:run') {
            resolve(msg.requestId)
            ;(window as any).postMessage = orig
          }
        }
      })

      const eventos: any[] = []
      const runPromise = bridgeRun({ prompt: 'oi' }, (e) => eventos.push(e))
      const reqId = await idPromise

      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'claudiao-bridge',
            requestId: reqId,
            type: 'ajudante:run:stream',
            payload: { kind: 'start', sessionId: 's1', model: 'm', cwd: '/p' },
          },
        }),
      )
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'claudiao-bridge',
            requestId: reqId,
            type: 'ajudante:run:stream',
            payload: { kind: 'text-delta', delta: 'oi' },
          },
        }),
      )
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            source: 'claudiao-bridge',
            requestId: reqId,
            type: 'ajudante:run:done',
            payload: { code: 0 },
          },
        }),
      )

      const code = await runPromise
      expect(eventos.map((e) => e.kind)).toEqual(['start', 'text-delta'])
      expect(code).toBe(0)
    })
  })
})
