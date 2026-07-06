import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { AppLayout } from './app-layout'
import { BrowseScreen } from '../components/browse-screen'
import { DetailsScreen } from '../components/details-screen'
import { ErrorState } from '../components/error-state'
import { buildBrowseRows } from '../features/catalog/browse-rows'
import { flattenCatalogRows, mergeCatalogItems } from '../features/catalog/catalog-index'
import {
  getFocusedItem,
  loadCatalogRowsLazy,
  ROW_COUNT,
} from '../features/catalog/catalog-rows'
import { GENRE_NAV_ITEMS } from '../features/catalog/genres'
import type {
  AppScreen,
  BrowseFocus,
  BrowseMode,
  BrowseSession,
  CatalogItem,
  CatalogRow,
  DetailsFocus,
} from '../features/catalog/types'
import { INITIAL_DETAILS_FOCUS } from '../features/catalog/types'
import { useLocalFavorites } from '../features/favorites/use-local-favorites'
import { getRecommendationItems } from '../features/recommendations/recommendation-utils'
import { useAppNavigation } from '../features/navigation/use-app-navigation'

export function App() {
  const [screen, setScreen] = useState<AppScreen>('browse')
  const [sourceRows, setSourceRows] = useState<CatalogRow[]>([])
  const [detailsItem, setDetailsItem] = useState<CatalogItem | null>(null)
  const [detailsFocus, setDetailsFocus] = useState<DetailsFocus>(INITIAL_DETAILS_FOCUS)
  const [searchQuery, setSearchQuery] = useState('')
  const [playFeedback, setPlayFeedback] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isGenreLoading, setIsGenreLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [browseMode, setBrowseMode] = useState<BrowseMode>('catalog')
  const { favorites, toggleFavorite, isFavorite } = useLocalFavorites()
  const [activeGenreIndex, setActiveGenreIndex] = useState(0)
  const browseSessionRef = useRef<BrowseSession>({
    genreId: GENRE_NAV_ITEMS[0].id,
    genreIndex: 0,
    rowIndex: 0,
    itemIndex: 0,
  })
  const loadTokenRef = useRef(0)

  const catalogIndex = useMemo(
    () => mergeCatalogItems(flattenCatalogRows(sourceRows), favorites),
    [favorites, sourceRows],
  )

  const browseRows = useMemo(
    () => buildBrowseRows(sourceRows, favorites, searchQuery, catalogIndex, browseMode),
    [browseMode, catalogIndex, favorites, searchQuery, sourceRows],
  )

  const recommendations = useMemo(() => {
    if (!detailsItem) {
      return []
    }

    return getRecommendationItems(detailsItem, catalogIndex, 12)
  }, [catalogIndex, detailsItem])

  const loadGenreCatalog = useCallback(async (genreIndex: number) => {
    const token = loadTokenRef.current + 1
    loadTokenRef.current = token
    const genre = GENRE_NAV_ITEMS[genreIndex]

    setIsGenreLoading(true)
    setError(null)
    setSourceRows([])
    setActiveGenreIndex(genreIndex)

    try {
      const loadedRows = await loadCatalogRowsLazy(genre.filter, (row) => {
        if (loadTokenRef.current !== token) {
          return
        }

        setSourceRows((current) => [...current, row])
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

  const openDetails = useCallback((item: CatalogItem, currentFocus?: BrowseSession) => {
    if (currentFocus) {
      browseSessionRef.current = currentFocus
    }

    setDetailsItem(item)
    setDetailsFocus(INITIAL_DETAILS_FOCUS)
    setPlayFeedback(null)
    setScreen('details')
  }, [])

  const setFocusRef = useRef<Dispatch<SetStateAction<BrowseFocus>>>(() => {})

  const { focus, setFocus } = useAppNavigation({
    rows: browseRows,
    enabled: !error,
    isDetailsOpen: screen === 'details',
    detailsFocus,
    setDetailsFocus,
    recommendationCount: recommendations.length,
    onGenreChange: (genreIndex) => {
      if (genreIndex === activeGenreIndex && !isGenreLoading) {
        return
      }

      setSearchQuery('')
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
      const item = getFocusedItem(browseRows, currentFocus)
      if (!item) {
        return
      }

      openDetails(item, {
        genreId: GENRE_NAV_ITEMS[currentFocus.genreIndex].id,
        genreIndex: currentFocus.genreIndex,
        rowIndex: currentFocus.rowIndex,
        itemIndex: currentFocus.itemIndex,
      })
    },
    onCloseDetails: () => {
      const session = browseSessionRef.current
      setScreen('browse')
      setDetailsItem(null)
      setDetailsFocus(INITIAL_DETAILS_FOCUS)
      setPlayFeedback(null)
      setFocus({
        zone: 'content',
        railIndex: browseMode === 'favorites' ? 1 : 0,
        genreIndex: session.genreIndex,
        rowIndex: session.rowIndex,
        itemIndex: session.itemIndex,
      })
    },
    onDetailsAction: (action) => {
      if (!detailsItem) {
        return
      }

      if (action === 'play') {
        setPlayFeedback(`Reproduciendo "${detailsItem.title}" · demo UI`)
        return
      }

      if (action === 'favorite') {
        toggleFavorite(detailsItem)
        return
      }

      if (action === 'recommendations' && recommendations.length > 0) {
        setDetailsFocus((current) => ({
          ...current,
          zone: 'recommendations',
          recommendationIndex: 0,
        }))
      }
    },
    onSelectRecommendation: (index) => {
      const item = recommendations[index]
      if (!item) {
        return
      }

      openDetails(item)
    },
    onSearchInput: (value) => {
      setSearchQuery((current) => `${current}${value}`)
    },
    onSearchBackspace: () => {
      setSearchQuery((current) => current.slice(0, -1))
    },
    onRailSelect: (railIndex) => {
      if (screen === 'details') {
        setScreen('browse')
        setDetailsItem(null)
        setDetailsFocus(INITIAL_DETAILS_FOCUS)
        setPlayFeedback(null)
      }

      if (railIndex === 0) {
        setBrowseMode('catalog')
        setFocusRef.current((current) => ({
          ...current,
          zone: 'search',
          railIndex: 0,
        }))
        return
      }

      setBrowseMode('favorites')
      setSearchQuery('')
      setFocusRef.current((current) => ({
        ...current,
        zone: 'content',
        railIndex: 1,
        rowIndex: 0,
        itemIndex: 0,
      }))
    },
  })

  setFocusRef.current = setFocus

  const handleSelectRail = useCallback(
    (index: number) => {
      if (screen === 'details') {
        setScreen('browse')
        setDetailsItem(null)
        setDetailsFocus(INITIAL_DETAILS_FOCUS)
        setPlayFeedback(null)
      }

      if (index === 0) {
        setBrowseMode('catalog')
        setFocus((current) => ({
          ...current,
          zone: 'search',
          railIndex: 0,
        }))
        return
      }

      setBrowseMode('favorites')
      setSearchQuery('')
      setFocus((current) => ({
        ...current,
        zone: 'content',
        railIndex: 1,
        rowIndex: 0,
        itemIndex: 0,
      }))
    },
    [screen, setFocus],
  )

  const handleToggleFavorite = useCallback(() => {
    if (detailsItem) {
      toggleFavorite(detailsItem)
    }
  }, [detailsItem, toggleFavorite])

  const handleSelectRecommendation = useCallback(
    (item: CatalogItem) => {
      openDetails(item)
    },
    [openDetails],
  )

  const handleSelectBrowseItem = useCallback(
    (item: CatalogItem) => {
      openDetails(item, {
        genreId: GENRE_NAV_ITEMS[focus.genreIndex].id,
        genreIndex: focus.genreIndex,
        rowIndex: focus.rowIndex,
        itemIndex: focus.itemIndex,
      })
    },
    [focus.genreIndex, focus.itemIndex, focus.rowIndex, openDetails],
  )


  const handleCloseDetails = useCallback(() => {
    const session = browseSessionRef.current
    setScreen('browse')
    setDetailsItem(null)
    setDetailsFocus(INITIAL_DETAILS_FOCUS)
    setPlayFeedback(null)
    setFocus({
      zone: 'content',
      railIndex: browseMode === 'favorites' ? 1 : 0,
      genreIndex: session.genreIndex,
      rowIndex: session.rowIndex,
      itemIndex: session.itemIndex,
    })
  }, [browseMode, setFocus])

  const handlePlay = useCallback(() => {
    if (detailsItem) {
      setPlayFeedback(`Reproduciendo "${detailsItem.title}" · demo UI`)
    }
  }, [detailsItem])

  const handleShowRecommendations = useCallback(() => {
    if (recommendations.length > 0) {
      setDetailsFocus((current) => ({
        ...current,
        zone: 'recommendations',
        recommendationIndex: 0,
      }))
    }
  }, [recommendations.length])

  const handleActivateSearch = useCallback(() => {
    setFocus((current) => ({ ...current, zone: 'search' }))
  }, [setFocus])

  return (
    <AppLayout
      focus={focus}
      browseMode={browseMode}
      favoritesCount={favorites.length}
      onSelectRail={handleSelectRail}
      isRailInteractive={screen === 'browse'}
    >
      {error ? (
        <ErrorState message={error} onRetry={() => void loadGenreCatalog(focus.genreIndex)} />
      ) : screen === 'details' && detailsItem ? (
        <DetailsScreen
          item={detailsItem}
          recommendations={recommendations}
          isFavorite={isFavorite(detailsItem.id)}
          focus={detailsFocus}
          playFeedback={playFeedback}
          onBack={handleCloseDetails}
          onPlay={handlePlay}
          onToggleFavorite={handleToggleFavorite}
          onShowRecommendations={handleShowRecommendations}
          onSelectRecommendation={handleSelectRecommendation}
        />
      ) : (
        <BrowseScreen
          rows={browseRows}
          focus={focus}
          browseMode={browseMode}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onActivateSearch={handleActivateSearch}
          onSelectItem={handleSelectBrowseItem}
          isContentLoading={isInitialLoading || isGenreLoading}
          loadedRowCount={ROW_COUNT}
          showInitialSplash={isInitialLoading && sourceRows.length === 0}
        />
      )}
    </AppLayout>
  )
}
