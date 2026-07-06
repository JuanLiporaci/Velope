import { MagnifyingGlass } from '@phosphor-icons/react'
import type { BrowseFocus } from '../features/catalog/types'

interface SearchBarProps {
  focus: BrowseFocus
  query: string
  onQueryChange: (query: string) => void
  onActivate?: () => void
}

export function SearchBar({ focus, query, onQueryChange, onActivate }: SearchBarProps) {
  const isFocused = focus.zone === 'search'

  return (
    <div
      className={`search-bar border-b border-[var(--color-border-subtle)] px-12 py-4 backdrop-blur-sm ${
        isFocused ? 'search-bar--focused' : 'search-bar--idle'
      }`}
    >
      <label className="search-bar__field flex min-h-[56px] items-center gap-4 rounded-full border px-6 py-3.5">
        <MagnifyingGlass
          size={22}
          weight="bold"
          className={isFocused ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}
        />
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={onActivate}
          placeholder="Buscar en español o inglés: acción, horror, spiderman..."
          aria-label="Buscar títulos"
          className="min-w-0 flex-1 bg-transparent text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
        />
        {query ? (
          <span className="text-sm text-[var(--color-text-muted)]">{query.length} chars</span>
        ) : null}
      </label>
      <p className="mt-2.5 text-sm text-[var(--color-text-muted)]">
        {isFocused
          ? 'Escribe para buscar · Enter baja a resultados · ↑↓ para navegar'
          : 'Sube con ↑ desde géneros para buscar'}
      </p>
    </div>
  )
}
