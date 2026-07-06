import { ITEM_HEIGHT, ITEM_WIDTH } from '../app/layout-constants'
import type { CatalogItem } from '../features/catalog/types'
import { PosterCard } from './poster-card'

interface RecommendationRowProps {
  items: CatalogItem[]
  focusedIndex: number
  isFocused: boolean
  onSelectItem?: (item: CatalogItem) => void
}

export function RecommendationRow({
  items,
  focusedIndex,
  isFocused,
  onSelectItem,
}: RecommendationRowProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)] px-8 py-6">
        <h2 className="mb-2 text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
          También te puede gustar
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          No encontramos sugerencias relacionadas en el catálogo cargado.
        </p>
      </section>
    )
  }

  return (
    <section
      className={`recommendation-row rounded-[1.75rem] border px-8 py-6 transition-colors duration-150 ${
        isFocused
          ? 'recommendation-row--focused border-[rgba(45,212,168,0.35)] bg-[rgba(45,212,168,0.05)]'
          : 'border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)]'
      }`}
    >
      <h2 className="mb-4 text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
        También te puede gustar
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem?.(item)}
            className="shrink-0 border-0 bg-transparent p-0"
          >
            <PosterCard
              item={item}
              isFocused={isFocused && index === focusedIndex}
              width={ITEM_WIDTH}
              height={ITEM_HEIGHT}
              onSelect={onSelectItem}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
