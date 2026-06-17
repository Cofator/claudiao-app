// src/components/pairing/AjudanteDownload.tsx
const DOWNLOAD_URL = 'https://claudiao.app/download/claudio-setup.exe'

export function AjudanteDownload() {
  return (
    <a
      href={DOWNLOAD_URL}
      className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90"
    >
      📥 Baixar o Ajudante do Claudião
    </a>
  )
}