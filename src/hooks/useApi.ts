// src/hooks/useApi.ts
// Wrapper de TanStack Query para os endpoints do backend.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, fetchUsage, logout, type LoginResult, type UsageResult } from '@/lib/api'

export function useLogin() {
  const qc = useQueryClient()
  return useMutation<LoginResult, Error, { email: string; password: string }>({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (r) => {
      if (r.ok) qc.setQueryData(['me'], { name: r.name, balanceBrl: r.balanceBrl, token: r.token })
    },
  })
}

export function useUsage(hours: number) {
  return useQuery<UsageResult>({
    queryKey: ['usage', hours],
    queryFn: () => fetchUsage(hours),
    refetchInterval: 30_000,
    staleTime: 10_000,
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => qc.clear(),
  })
}