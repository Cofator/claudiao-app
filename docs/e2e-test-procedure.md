# claudio-app — Teste E2E manual (procedimento)

**Data de criação:** 2026-06-17
**Status:** Procedimento pronto, AGUARDANDO execução pelo operador

## Objetivo

Validar o fluxo ponta-a-ponta da Fase 1b: cliente instala Ajudante + Bridge, abre o cockpit em `app.claudiao.app`, faz login, parea com o Ajudante, e cria algo em português.

## Procedimento

### Setup (operador)

```bash
# 1. Buildar tudo
cd D:\Claude_Code\claudiao-app
npm install
npm run build
node scripts/build-bridge-zip.mjs

cd D:\Claude_Code\minimax-reseller
npm run build:ajudante     # script PowerShell (Bun)
```

Resultado esperado:
- `D:\Claude_Code\claudiao-app\dist\claudio-bridge-0.1.0.zip` (~50 KB)
- `D:\Claude_Code\minimax-reseller\dist\ajudante\ajudante.exe` (~30 MB)

### Setup (cliente) — instalar localmente em outro PC ou VM

1. Copiar `ajudante.exe` para `C:\Program Files\Claudião\`
2. Extrair `claudio-bridge.zip` em `C:\Program Files\Claudião\Bridge\`
3. Registrar serviço:
   ```powershell
   sc.exe create ClaudiãoAjudante binPath= "C:\Program Files\Claudião\ajudante.exe" start= auto
   sc.exe start ClaudiãoAjudante
   ```
4. Instalar Bridge no Chrome:
   - Abrir `chrome://extensions/`
   - Ativar **Modo desenvolvedor**
   - Clicar **Carregar sem compactação**
   - Selecionar `C:\Program Files\Claudião\Bridge\`

### Cockpit (dev ou prod)

```bash
cd D:\Claude_Code\claudiao-app
npm run dev     # http://localhost:5173
```

Em prod, abrir `https://app.claudiao.app` (após deploy).

### Checklist de validação

- [ ] **Login** com conta real em `api.claudiao.app`
- [ ] Cockpit detecta a **Bridge instalada** (badge verde)
- [ ] Cockpit faz **ping no Ajudante** (`bridgePing` retorna `{ok:true}`)
- [ ] **Pareamento**: cola o secret, recebe token (ver `sessionStorage`)
- [ ] **ChatPage** carrega (`/c`)
- [ ] Digita `"faz um site de pizzas"` → Ajudante responde com NDJSON
- [ ] **Nível Tranquilo**: mensagens amigáveis (🔨, 🎨, ⚙️)
- [ ] **Nível Curioso**: mensagens com mais detalhe (nomes de arquivo, comandos)
- [ ] **Nível Técnico**: mensagens verbatim (JSON cru)
- [ ] **👁️ Ver por dentro**: modal abre com stream JSON cru
- [ ] **Evento `done`** → saldo atualizado via `useUsage(24)`
- [ ] **Logout** volta pra `/`

### Teste do leigo (o crítico)

Chamar 1 pessoa **leiga** (não programadora). Pedir:

> "Instale o Ajudante e o Claudião, faça login e peça pra criar um site simples. Observar sem ajudar."

Marcar onde ela trava. Onde travar vira o próximo conserto.

## Achados (preencher após rodar)

Criar `D:\Claude_Code\claudiao-app\docs\e2e-test-results.md` com:
- Onde a pessoa travou
- Tempo gasto
- O que ficou confuso
- Próximas correções

## Critérios de aceite da Fase 1b

1. ✅ `claudiao-app/` compila (`npm run build`) sem warnings — **pendente validação local**
2. ✅ 30+ testes do cockpit passando — **pendente validação local**
3. ✅ `app.claudiao.app` deployado em Hostinger — **pendente deploy**
4. ✅ Bridge empacotada em `.zip` (50 KB) — script pronto, **pendente execução**
5. ✅ Ajudante empacotado em `.exe` (Bun --compile, ~30 MB) — script pronto, **pendente execução**
6. ✅ PowerShell evoluído: instala Ajudante + Bridge — script pronto, **pendente teste**
7. ✅ Healthcheck do Ajudante: `GET /ajudante/ping` retorna 200 — herdado do hardening
8. ✅ Teste do leigo — **pendente execução**
9. ✅ Nível de tradução funciona — código escrito, **pendente teste**
10. ✅ 👁️ Ver por dentro mostra stream cru — código escrito, **pendente teste**
11. ✅ Rate-limit: cliente não brute-força pareamento — herdado do hardening
12. ✅ Sem regressão: 65 testes do Ajudante continuam verde — **pendente validação local**
13. ✅ Sem regressão: backend reseller continua funcionando — **pendente validação local**

## Status real

**Implementação:** 17 tasks planejadas, ~16 tasks com código commitado.
**Validação real:** BLOQUEADA no sandbox (registry.npmjs.org inacessível).
**Próximo passo:** operador roda `npm install` + `npm test` + builds localmente.