// bridge/content.js
// Injetado em https://app.claudiao.app/*.
// Roteia window.postMessage (do cockpit) ↔ chrome.runtime.sendMessage (para o background).

window.addEventListener('message', (event) => {
  if (event.source !== window) return
  const data = event.data
  if (!data || data.source !== 'claudiao-cockpit') return

  chrome.runtime.sendMessage({ ...data, forwardedAt: Date.now() })
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || msg.source !== 'claudiao-bridge') return
  window.postMessage(msg, '*')
})