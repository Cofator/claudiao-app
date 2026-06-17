// src/components/pairing/BridgeGuide.tsx
// Mostra 3 passos para instalar a Bridge no Chrome/Edge.

export function BridgeGuide() {
  return (
    <ol className="space-y-3 list-decimal pl-5">
      <li>
        Abra o Chrome/Edge em <code className="bg-muted px-1 rounded">chrome://extensions/</code> e ative
        o <strong>Modo desenvolvedor</strong> (canto superior direito).
      </li>
      <li>
        Clique em <strong>Carregar sem compactação</strong>.
      </li>
      <li>
        Selecione a pasta <code className="bg-muted px-1 rounded">C:\Program Files\Claudião\Bridge\</code>.
      </li>
    </ol>
  )
}