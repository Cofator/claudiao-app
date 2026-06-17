import { describe, it, expect } from 'vitest'
import { translate } from './Translator'
import type { AjudanteEvent } from '@/lib/events'

const startEvt: AjudanteEvent = { kind: 'start', sessionId: 's1', model: 'sonnet-4-6', cwd: '/p' }
const writeFileTool: AjudanteEvent = { kind: 'tool-start', toolName: 'WriteFile', args: { file_path: '/p/index.html' } }
const bashNpm: AjudanteEvent = { kind: 'tool-start', toolName: 'Bash', args: { command: 'npm install' } }
const bashRm: AjudanteEvent = { kind: 'tool-start', toolName: 'Bash', args: { command: 'rm -rf /p/x' } }
const editTool: AjudanteEvent = { kind: 'tool-start', toolName: 'Edit', args: { file_path: '/p/style.css', line: 88 } }
const errorEvt: AjudanteEvent = { kind: 'error', message: 'port 3000 in use' }
const doneOk: AjudanteEvent = { kind: 'done', ok: true, resultText: 'site pronto' }
const doneFail: AjudanteEvent = { kind: 'done', ok: false, reason: 'timeout' }

describe('translate', () => {
  describe('tranquilo', () => {
    it('start: silencio', () => expect(translate(startEvt, 'tranquilo')).toBeNull())
    it('WriteFile: 🔨 Criando...', () => expect(translate(writeFileTool, 'tranquilo')?.texto).toMatch(/Criando/i))
    it('Bash npm: ⚙️ Preparando...', () => expect(translate(bashNpm, 'tranquilo')?.texto).toMatch(/Preparando/i))
    it('Bash rm: 🛑 pedindo confirmação', () => {
      const r = translate(bashRm, 'tranquilo')
      expect(r?.texto).toMatch(/apagar|confirmação|🛑/i)
      expect(r?.perigoso).toBe(true)
    })
    it('Edit: 🎨 Ajustando...', () => expect(translate(editTool, 'tranquilo')?.texto).toMatch(/Ajustando/i))
    it('error: ⚠️ probleminha', () => expect(translate(errorEvt, 'tranquilo')?.texto).toMatch(/⚠️|probleminha/i))
    it('done ok: ✅ Prontinho', () => expect(translate(doneOk, 'tranquilo')?.texto).toMatch(/✅|Prontinho/i))
    it('done fail: 🛑 Deu ruim', () => expect(translate(doneFail, 'tranquilo')?.texto).toMatch(/🛑|Deu ruim|tentar/i))
  })

  describe('curioso', () => {
    it('start: Comecei a trabalhar', () => expect(translate(startEvt, 'curioso')?.texto).toMatch(/Comecei a trabalhar/i))
    it('WriteFile: menciona o arquivo', () => expect(translate(writeFileTool, 'curioso')?.texto).toMatch(/index\.html/))
    it('Bash npm: menciona o comando', () => expect(translate(bashNpm, 'curioso')?.texto).toMatch(/npm install/))
    it('Bash rm: menciona o que vai apagar', () => expect(translate(bashRm, 'curioso')?.texto).toMatch(/rm -rf/))
    it('error: mensagem do erro', () => expect(translate(errorEvt, 'curioso')?.texto).toMatch(/port 3000/))
  })

  describe('tecnico', () => {
    it('start: mostra model', () => expect(translate(startEvt, 'tecnico')?.texto).toMatch(/sonnet-4-6/))
    it('WriteFile: caminho do arquivo', () => expect(translate(writeFileTool, 'tecnico')?.texto).toMatch(/WriteFile.*index\.html/))
    it('Bash npm: comando exato', () => expect(translate(bashNpm, 'tecnico')?.texto).toMatch(/Bash: npm install/))
    it('error: mensagem completa', () => expect(translate(errorEvt, 'tecnico')?.texto).toBe('port 3000 in use'))
  })

  it('tool desconhecida: fallback Estou trabalhando', () => {
    const unknown = { kind: 'tool-start', toolName: 'XptoTool', args: {} } as unknown as AjudanteEvent
    expect(translate(unknown, 'tranquilo')?.texto).toMatch(/trabalhando/i)
  })
})