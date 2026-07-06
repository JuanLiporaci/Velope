import { useCallback, useEffect, useRef, useState } from 'react'
import { AppLayout } from './app-layout'
import { BrowseScreen } from '../components/browse-screen'
import { DetailsScreen } from '../components/details-screen'
import { ErrorState } from '../components/error-state'
import {
  getFocusedItem,
  loadCatalogRowsLazy,
  ROW_COUNT,
} from '../features/catalog/catalog-rows'
import { GENRE_NAV_ITEMS } from '../features/catalog/genres'
import type { AppScreen, BrowseSession, CatalogItem, CatalogRow } from '../features/catalog/types'
import { useAppNavigation } from '../features/navigation/use-app-navigation'

export function App() {
  const [screen, setScreen] = useState<AppScreen>('browse')
  const [rows, setRows] = useState<CatalogRow[]>([])
  const [detailsItem, setDetailsItem] = useState<CatalogItem | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isGenreLoading, setIsGenreLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const browseSessionRef = useRef<BrowseSession>({
    genreId: GENRE_NAV_ITEMS[0].id,
    genreIndex: 0,
    rowIndex: 0,
    itemIndex: 0,
  })
  const loadTokenRef = useRef(0)

  const loadGenreCatalog = useCallback(async (genreIndex: number) => {
    const token = loadTokenRef.current + 1
    loadTokenRef.current = token
    const genre = GENRE_NAV_ITEMS[genreIndex]

    setIsGenreLoading(true)
    setError(null)
    setRows([])
    setActiveGenreIndex(genreIndex)

    try {
      const loadedRows = await loadCatalogRowsLazy(genre.filter, (row) => {
        if (loadTokenRef.current !== token) {
          return
        }

        setRows((current) => [...current, row])
      })

      if (loadTokenRef.current !== token) {
        return
      }

      if (loadedRows.length === 0) {
        throw new Error('No se encontraron filas de contenido para este género.')
      }
    } catch (loadError) {
      if (loadTokenRef.current !== token) {
        return
      }

      const message =
        loadError instanceof Error ? loadError.message : 'Ocurrió un error inesperado al cargar el catálogo.'
      setError(message)
    } finally {
      if (loadTokenRef.current === token) {
        setIsGenreLoading(false)
        setIsInitialLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadGenreCatalog(0)
  }, [loadGenreCatalog])

  const { focus, setFocus } = useAppNavigation({
    rows,
    enabled: !error && screen !== 'details',
    isDetailsOpen: screen === 'details',
    onGenreChange: (genreIndex) => {
      if (genreIndex === activeGenreIndex && !isGenreLoading) {
        return
      }

      setFocus((current) => ({
        ...current,
        genreIndex,
        zone: 'nav',
        rowIndex: 0,
        itemIndex: 0,
      }))
      void loadGenreCatalog(genreIndex)
    },
    onOpenDetails: (currentFocus) => {
      const item = getFocusedItem(rows, currentFocus)
      if (!item) {
        return
      }

      browseSessionRef.current = {
        genreId: GENRE_NAV_ITEMS[currentFocus.genreIndex].id,
        genreIndex: currentFocus.genreIndex,
        rowIndex: currentFocus.rowIndex,
        itemIndex: currentFocus.itemIndex,
      }
      setDetailsItem(item)
      setScreen('details')
    },
    onCloseDetails: () => {
      const session = browseSessionRef.current
      setScreen('browse')
      setDetailsItem(null)
      setFocus({
        zone: 'content',
        genreIndex: session.genreIndex,
        rowIndex: session.rowIndex,
        itemIndex: session.itemIndex,
      })
    },
  })

  return (
    <AppLayout>
      {error ? (
        <ErrorState message={error} onRetry={() => void loadGenreCatalog(focus.genreIndex)} />
      ) : screen === 'details' && detailsItem ? (
        <DetailsScreen item={detailsItem} />
      ) : (
        <BrowseScreen
          rows={rows}
          focus={focus}
          isContentLoading={isInitialLoading || isGenreLoading}
          loadedRowCount={ROW_COUNT}
          showInitialSplash={isInitialLoading && rows.length === 0}
        />
      )}
    </AppLayout>
  )
}
