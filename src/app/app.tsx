import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppLayout } from './app-layout'
import { CarouselRow } from '../components/carousel-row'
import { ErrorState } from '../components/error-state'
import { HeroPanel } from '../components/hero-panel'
import { LoadingState } from '../components/loading-state'
import { getFocusedItem, loadAllCatalogRows } from '../features/catalog/catalog-rows'
import type { CatalogRow } from '../features/catalog/types'
import { getVerticalScrollOffset } from '../features/navigation/navigation-utils'
import { useTvKeyboardNavigation } from '../features/navigation/use-tv-keyboard-navigation'

const TV_HEIGHT = 1080
const HERO_HEIGHT = 300
const FOOTER_HEIGHT = 44
const ITEM_WIDTH = 160
const ITEM_HEIGHT = 240
const ITEM_GAP = 20
const ROW_TITLE_HEIGHT = 56
const ROW_VERTICAL_PADDING = 24
const ROW_GAP = 12
const ROW_HEIGHT = ROW_TITLE_HEIGHT + ITEM_HEIGHT + ROW_VERTICAL_PADDING
const CAROUSEL_VIEWPORT_HEIGHT = TV_HEIGHT - HERO_HEIGHT - FOOTER_HEIGHT

export function App() {
  const [rows, setRows] = useState<CatalogRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const rowsContainerRef = useRef<HTMLDivElement>(null)

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const loadedRows = await loadAllCatalogRows()

      if (loadedRows.length === 0) {
        throw new Error('No se encontraron filas de contenido disponibles.')
      }

      setRows(loadedRows)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Ocurrió un error inesperado al cargar el catálogo.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const { focus } = useTvKeyboardNavigation({
    rows,
    enabled: !isLoading && !error,
  })

  const focusedItem = useMemo(() => getFocusedItem(rows, focus), [focus, rows])

  const verticalOffset = useMemo(
    () =>
      getVerticalScrollOffset({
        rowIndex: focus.rowIndex,
        rowHeight: ROW_HEIGHT,
        rowGap: ROW_GAP,
        viewportHeight: CAROUSEL_VIEWPORT_HEIGHT,
        totalRows: rows.length,
        focusScalePadding: 24,
      }),
    [focus.rowIndex, rows.length],
  )

  useEffect(() => {
    if (rowsContainerRef.current) {
      rowsContainerRef.current.style.transform = `translate3d(0, -${verticalOffset}px, 0)`
    }
  }, [verticalOffset])

  return (
    <AppLayout>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadCatalog()} />
      ) : (
        <div className="flex h-full flex-col">
          <HeroPanel item={focusedItem} />

          <div
            className="relative flex-1 overflow-hidden"
            style={{ height: CAROUSEL_VIEWPORT_HEIGHT }}
          >
            <div
              ref={rowsContainerRef}
              className="pt-1 transition-transform duration-120 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ willChange: 'transform' }}
            >
              {rows.map((row, rowIndex) => (
                <CarouselRow
                  key={row.id}
                  title={row.title}
                  items={row.items}
                  focusedIndex={focus.itemIndex}
                  isActiveRow={rowIndex === focus.rowIndex}
                  itemWidth={ITEM_WIDTH}
                  itemHeight={ITEM_HEIGHT}
                  itemGap={ITEM_GAP}
                />
              ))}
            </div>
          </div>

          <footer className="border-t border-[var(--color-border-subtle)] px-12 py-3 text-xs text-[var(--color-text-muted)]">
            Usa las flechas del teclado para navegar. Fila {focus.rowIndex + 1} de {rows.length} · Item{' '}
            {focus.itemIndex + 1}
          </footer>
        </div>
      )}
    </AppLayout>
  )
}
