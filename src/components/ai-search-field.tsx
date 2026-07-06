import { Microphone, Sparkle } from '@phosphor-icons/react'

interface AiSearchFieldProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isFocused?: boolean
  onActivate?: () => void
  compact?: boolean
  placeholder?: string
  hint?: string
}

export function AiSearchField({
  value,
  onChange,
  onSubmit,
  isFocused = false,
  onActivate,
  compact = false,
  placeholder = 'Pregúntale a Velope... Ej: Quiero una película como Interstellar pero más corta.',
  hint,
}: AiSearchFieldProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <div className="min-w-0">
      <form
        onSubmit={handleSubmit}
        className={`ai-bar__assistant flex items-center gap-3 rounded-full border px-4 transition-colors duration-150 ${
          isFocused ? 'ai-bar__assistant--focused' : ''
        } ${compact ? 'min-h-[40px] py-2' : 'min-h-[48px] px-5 py-2.5'}`}
      >
        <Sparkle size={20} weight="fill" className="shrink-0 text-[var(--color-accent)]" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onActivate}
          placeholder={placeholder}
          aria-label="Asistente de búsqueda"
          className={`min-w-0 flex-1 bg-transparent text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] ${
            compact ? 'text-sm' : 'text-base'
          }`}
        />
        <button
          type="button"
          aria-label="Búsqueda por voz"
          className="ai-bar__action flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-secondary)] transition-transform duration-150 active:scale-[0.98]"
        >
          <Microphone size={18} weight="bold" />
        </button>
        <button
          type="submit"
          aria-label="Buscar con asistente"
          className="ai-bar__action ai-bar__action--primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,168,0.35)] bg-[rgba(45,212,168,0.14)] text-[var(--color-accent)] transition-transform duration-150 active:scale-[0.98]"
        >
          <Sparkle size={18} weight="fill" />
        </button>
      </form>
      {hint ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{hint}</p> : null}
    </div>
  )
}
