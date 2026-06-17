import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { LevelProvider, useLevel } from './useLevel'

beforeEach(() => localStorage.clear())

describe('useLevel', () => {
  it('default eh curioso quando localStorage vazio', () => {
    const { result } = renderHook(() => useLevel(), { wrapper: LevelProvider })
    expect(result.current.level).toBe('curioso')
  })

  it('setLevel persiste no localStorage', () => {
    const { result } = renderHook(() => useLevel(), { wrapper: LevelProvider })
    act(() => result.current.setLevel('tecnico'))
    expect(result.current.level).toBe('tecnico')
    expect(localStorage.getItem('claudiao:level')).toBe('tecnico')
  })

  it('hidrata do localStorage no mount', () => {
    localStorage.setItem('claudiao:level', 'tranquilo')
    const { result } = renderHook(() => useLevel(), { wrapper: LevelProvider })
    expect(result.current.level).toBe('tranquilo')
  })

  it('ignora valor invalido no localStorage', () => {
    localStorage.setItem('claudiao:level', 'invalido')
    const { result } = renderHook(() => useLevel(), { wrapper: LevelProvider })
    expect(result.current.level).toBe('curioso')
  })
})