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
        className={`ai-bar__assistant flex items-center gap-4 rounded-full border transition-colors duration-150 ${
          isFocused ? 'ai-bar__assistant--focused' : ''
        } ${compact ? 'min-h-[44px] px-4 py-2' : 'min-h-[72px] px-7 py-3.5'}`}
      >
        <Sparkle
          size={compact ? 20 : 26}
          weight="fill"
          className="shrink-0 text-[var(--color-accent)]"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onActivate}
          placeholder={placeholder}
          aria-label="Asistente de búsqueda"
          className={`min-w-0 flex-1 bg-transparent text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] ${
            compact ? 'text-sm' : 'text-xl'
          }`}
        />
        <button
          type="button"
          aria-label="Búsqueda por voz"
          className={`ai-bar__action flex shrink-0 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-secondary)] transition-transform duration-150 active:scale-[0.98] ${
            compact ? 'h-9 w-9' : 'h-12 w-12'
          }`}
        >
          <Microphone size={compact ? 18 : 22} weight="bold" />
        </button>
        <button
          type="submit"
          aria-label="Buscar con asistente"
          className={`ai-bar__action ai-bar__action--primary flex shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,168,0.35)] bg-[rgba(45,212,168,0.14)] text-[var(--color-accent)] transition-transform duration-150 active:scale-[0.98] ${
            compact ? 'h-9 w-9' : 'h-12 w-12'
          }`}
        >
          <Sparkle size={compact ? 18 : 22} weight="fill" />
        </button>
      </form>
      {hint ? <p className="mt-2 text-sm text-[var(--color-text-muted)]">{hint}</p> : null}
    </div>
  )
}
