// src/lib/api.ts
// Cliente para o backend do minimax-reseller (api.claudiao.app).
// Reusa os endpoints /api/client/* já existentes (ver src/client-api.ts no repo
// minimax-reseller em D:\Claude_Code\minimax-reseller\).

const API_BASE = 'https://api.claudiao.app'

export type LoginResult =
  | { ok: true; token: string; baseUrl: string; name: string; balanceBrl: number; windowHours: number }
  | { ok: false; error: string }

export async function login(email: string, password: string): Promise<LoginResult> {
  const r = await fetch(`${API_BASE}/api/client/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await r.json()
  if (!r.ok || !data.ok) return { ok: false, error: data.error ?? `HTTP ${r.status}` }
  return data as LoginResult
}

export type UsageResult = {
  ok: true
  totalTokens: number
  totalBrl: number
  samples: number
  hiddenCount: number
  windowHours: number
} | { ok: false; error: string }

export async function fetchUsage(hours: number): Promise<UsageResult> {
  const r = await fetch(`${API_BASE}/api/client/usage?hours=${hours}`, {
    credentials: 'include',
  })
  const data = await r.json()
  if (!r.ok || !data.ok) return { ok: false, error: data.error ?? `HTTP ${r.status}` }
  return data as UsageResult
}

export type ExtratoResult = {
  ok: true
  rows: Array<{ createdAt: string; amountBrl: number; model?: string }>
  summary: { totalTokens: number; totalBrl: number; samples: number }
} | { ok: false; error: string }

export async function fetchExtrato(hours: number): Promise<ExtratoResult> {
  const r = await fetch(`${API_BASE}/api/client/extrato?hours=${hours}`, {
    credentials: 'include',
  })
  const data = await r.json()
  if (!r.ok || !data.ok) return { ok: false, error: data.error ?? `HTTP ${r.status}` }
  return data as ExtratoResult
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/client/logout`, { method: 'POST', credentials: 'include' })
}