import { useLayoutEffect, useMemo, useRef } from 'react'
import { ITEM_GAP, ITEM_HEIGHT, ITEM_WIDTH } from '../app/layout-constants'
import { CarouselRow } from './carousel-row'
import { GenreNavBar } from './genre-nav-bar'
import { CatalogLoadingPanel } from './loading-splash'
import { HeroPanel } from './hero-panel'
import { SearchBar } from './search-bar'
import { getFocusedItem } from '../features/catalog/catalog-rows'
import { isSearchActive } from '../features/catalog/browse-rows'
import type { BrowseFocus, BrowseMode, CatalogItem, CatalogRow } from '../features/catalog/types'
import { getVerticalScrollOffset } from '../features/navigation/navigation-utils'

interface BrowseScreenProps {
  rows: CatalogRow[]
  focus: BrowseFocus
  browseMode?: BrowseMode
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  onActivateSearch?: () => void
  onSelectItem?: (item: CatalogItem) => void
  isContentLoading?: boolean
  loadedRowCount?: number
  showInitialSplash?: boolean
}

interface RowScrollMetrics {
  rowTops: number[]
  rowHeights: number[]
  totalHeight: number
}

function measureRowScrollMetrics(container: HTMLElement): RowScrollMetrics {
  const sections = container.querySelectorAll<HTMLElement>('[data-row-index]')
  const rowTops: number[] = []
  const rowHeights: number[] = []

  sections.forEach((section) => {
    rowTops.push(section.offsetTop)
    rowHeights.push(section.offsetHeight)
  })

  return {
    rowTops,
    rowHeights,
    totalHeight: container.scrollHeight,
  }
}

function computeContentScrollOffset(
  focus: BrowseFocus,
  rowsLength: number,
  metrics: RowScrollMetrics,
  viewportHeight: number,
): number {
  if (focus.zone !== 'content' || viewportHeight <= 0 || rowsLength === 0) {
    return 0
  }

  const rowTop = metrics.rowTops[focus.rowIndex]
  const rowHeight = metrics.rowHeights[focus.rowIndex]

  if (rowTop === undefined || rowHeight === undefined) {
    return 0
  }

  return getVerticalScrollOffset({
    rowIndex: focus.rowIndex,
    rowTop,
    rowHeight,
    totalContentHeight: metrics.totalHeight,
    viewportHeight,
    totalRows: rowsLength,
  })
}

export function BrowseScreen({
  rows,
  focus,
  browseMode = 'catalog',
  searchQuery,
  onSearchQueryChange,
  onActivateSearch,
  onSelectItem,
  isContentLoading = false,
  loadedRowCount,
  showInitialSplash = false,
}: BrowseScreenProps) {
  const rowsContainerRef = useRef<HTMLDivElement>(null)
  const carouselViewportRef = useRef<HTMLDivElement>(null)
  const focusedItem = useMemo(
    () => (focus.zone === 'content' ? getFocusedItem(rows, focus) : null),
    [focus, rows],
  )
  const isSearchMode = isSearchActive(searchQuery) && browseMode === 'catalog'
  const heroItem = useMemo(() => {
    if (focus.zone === 'content') {
      return focusedItem ?? rows[0]?.items[0] ?? null
    }

    if (isSearchMode) {
      return rows[0]?.items[0] ?? null
    }

    return focusedItem ?? rows[0]?.items[0] ?? null
  }, [focus.zone, focusedItem, isSearchMode, rows])
  const isFavoritesMode = browseMode === 'favorites'
  const hasEmptyFavorites = isFavoritesMode && rows.some((row) => row.id === 'favorites-empty')

  useLayoutEffect(() => {
    const container = rowsContainerRef.current
    const viewport = carouselViewportRef.current
    if (!container || !viewport || rows.length === 0 || showInitialSplash) {
      if (container) {
        container.style.transform = 'translate3d(0, 0, 0)'
      }
      return
    }

    function applyVerticalScroll() {
      if (!rowsContainerRef.current || !carouselViewportRef.current) {
        return
      }

      const metrics = measureRowScrollMetrics(rowsContainerRef.current)
      const viewportHeight = carouselViewportRef.current.clientHeight
      const offset = computeContentScrollOffset(focus, rows.length, metrics, viewportHeight)

      rowsContainerRef.current.style.transform = `translate3d(0, -${offset}px, 0)`
    }

    applyVerticalScroll()

    const observer = new ResizeObserver(applyVerticalScroll)
    observer.observe(container)
    observer.observe(viewport)

    container.querySelectorAll<HTMLElement>('[data-row-index]').forEach((section) => {
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [focus, rows.length, showInitialSplash])

  const visibleRows = rows.length
  const totalRows = loadedRowCount ?? rows.length
  const hasEmptySearchRow = rows.some((row) => row.items.length === 0)
  const activeRowItemCount = rows[focus.rowIndex]?.items.length ?? 0

  return (
    <div className="flex h-full flex-col">
      <SearchBar
        focus={focus}
        query={searchQuery}
        onQueryChange={onSearchQueryChange}
        onActivate={onActivateSearch}
      />
      {!isFavoritesMode ? <GenreNavBar focus={focus} /> : null}
      {!isFavoritesMode ? <HeroPanel item={heroItem} /> : null}

      <div ref={carouselViewportRef} className="relative min-h-0 flex-1 overflow-hidden">
        {showInitialSplash ? (
          <CatalogLoadingPanel />
        ) : isContentLoading && rows.length === 0 ? (
          <div className="px-12 pt-8">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div key={rowIndex} className="mb-6">
                <div className="mb-3 h-5 w-40 rounded skeleton-shimmer" />
                <div className="flex gap-4">
                  {Array.from({ length: 8 }).map((__, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="h-[240px] w-[160px] shrink-0 rounded-xl skeleton-shimmer"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : hasEmptyFavorites ? (
          <div className="flex h-full items-center justify-center px-12">
            <div className="max-w-xl rounded-[1.75rem] border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)] px-8 py-10 text-center">
              <p className="text-lg font-medium text-[var(--color-text-primary)]">Aún no tienes guardados</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                Abre cualquier título y pulsa Guardar para añadirlo a tu lista personal.
              </p>
            </div>
          </div>
        ) : hasEmptySearchRow ? (
          <div className="flex h-full items-center justify-center px-12">
            <div className="max-w-xl rounded-[1.75rem] border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.02)] px-8 py-10 text-center">
              <p className="text-lg font-medium text-[var(--color-text-primary)]">
                No encontramos coincidencias
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                Prueba con otro término en español o inglés, por ejemplo acción, horror, spiderman o sci-fi.
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={rowsContainerRef}
            className="pt-1 transition-transform duration-120 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ willChange: 'transform' }}
          >
            {rows.map((row, rowIndex) => (
              <CarouselRow
                key={row.id}
                rowIndex={rowIndex}
                title={row.title}
                items={row.items}
                focusedIndex={focus.itemIndex}
                isActiveRow={focus.zone === 'content' && rowIndex === focus.rowIndex}
                itemWidth={ITEM_WIDTH}
                itemHeight={ITEM_HEIGHT}
                itemGap={ITEM_GAP}
                onSelectItem={onSelectItem}
              />
            ))}

            {isContentLoading && rows.length > 0 && rows.length < totalRows
              ? Array.from({ length: Math.max(totalRows - rows.length, 0) }).map((_, index) => (
                  <div key={`placeholder-${index}`} className="mb-5 px-12">
                    <div className="mb-3 h-5 w-48 rounded skeleton-shimmer" />
                    <div className="flex gap-5 py-3">
                      {Array.from({ length: 8 }).map((__, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="h-[240px] w-[160px] shrink-0 rounded-xl skeleton-shimmer"
                        />
                      ))}
                    </div>
                  </div>
                ))
              : null}
          </div>
        )}
      </div>

      <footer className="border-t border-[var(--color-border-subtle)] px-12 py-3 text-xs text-[var(--color-text-muted)]">
        {focus.zone === 'rail'
          ? `Menú lateral · ${focus.railIndex === 0 ? 'Inicio' : 'Guardados'} · Enter para abrir · → para continuar`
          : focus.zone === 'search'
            ? 'Búsqueda activa · Escribe para filtrar · Enter baja a resultados · ← vuelve al menú'
            : focus.zone === 'nav'
              ? `Menú de géneros · ${focus.genreIndex + 1} de 5 · Enter para confirmar · ↓ para contenido`
              : isSearchMode
                ? `Resultados · Item ${Math.min(focus.itemIndex + 1, activeRowItemCount || 1)} de ${activeRowItemCount} · Enter para detalles`
                : isFavoritesMode
                ? `Guardados · Fila ${focus.rowIndex + 1} · Item ${focus.itemIndex + 1} · Enter para detalles`
                : `Fila ${focus.rowIndex + 1} de ${visibleRows || totalRows} · Item ${focus.itemIndex + 1} · Enter para detalles · ↑ para menú`}
      </footer>
    </div>
  )
}
