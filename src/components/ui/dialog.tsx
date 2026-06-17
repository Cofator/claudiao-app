import { type ReactNode, useEffect } from 'react'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn('bg-background rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto', className)}
      >
        {children}
      </div>
    </div>
  )
}