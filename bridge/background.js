// bridge/background.js
// Service worker (MV3).
// Recebe mensagens do content.js, faz fetch no Ajudante local, devolve resposta.

const AJUDANTE_BASE = 'http://127.0.0.1:8765'

async function callAjudante(request) {
  const { type, payload } = request
  let path, method, body
  switch (type) {
    case 'ajudante:ping':
      path = '/ajudante/ping'; method = 'GET'; break
    case 'ajudante:pair':
      path = '/ajudante/pair'; method = 'POST'; body = JSON.stringify(payload); break
    case 'ajudante:run':
      throw new Error('use streamRun for type ajudante:run')
    default:
      throw new Error(`unknown type: ${type}`)
  }

  const r = await fetch(`${AJUDANTE_BASE}${path}`, {
    method,
    headers: { 'content-type': 'application/json', origin: 'https://app.claudiao.app' },
    body,
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`HTTP ${r.status}: ${text}`)
  }
  return r.json()
}

async function streamRun(payload, port) {
  const r = await fetch(`${AJUDANTE_BASE}/ajudante/run`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://app.claudiao.app',
    },
    body: JSON.stringify(payload),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    port.postMessage({ source: 'claudiao-bridge', type: 'ajudante:error', payload: { message: `HTTP ${r.status}: ${text}` } })
    return
  }
  const reader = r.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const evt = JSON.parse(line)
        port.postMessage({ source: 'claudiao-bridge', type: 'ajudante:run:stream', payload: evt })
      } catch {
        // linha inválida — ignora
      }
    }
  }
  port.postMessage({ source: 'claudiao-bridge', type: 'ajudante:run:done', payload: { code: 0 } })
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.source !== 'claudiao-cockpit') return

  if (msg.type === 'ajudante:run') {
    chrome.tabs.connect(sender.tab.id, { name: 'ajudante-run' }).then((port) => {
      streamRun(msg.payload, port)
    }).catch((err) => {
      sendResponse({ ok: false, error: String(err) })
    })
    return
  }

  callAjudante(msg).then(
    (data) => sendResponse({ ok: true, data }),
    (err) => sendResponse({ ok: false, error: String(err) }),
  )
  return true
})