interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-12 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-accent)]">Error de catálogo</p>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight">No pudimos cargar el contenido</h1>
      <p className="max-w-lg text-base text-[var(--color-text-secondary)]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-transform active:scale-[0.98]"
      >
        Reintentar
      </button>
    </div>
  )
}
