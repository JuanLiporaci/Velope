export type MediaType = 'movie' | 'series'

export interface CatalogItem {
  id: string
  type: MediaType
  title: string
  year: string
  posterUrl: string | null
  backdropUrl: string | null
  description: string
  rating: string | null
  genres: string[]
}

export interface CatalogRow {
  id: string
  title: string
  items: CatalogItem[]
}

export interface FocusPosition {
  rowIndex: number
  itemIndex: number
}

export type NavigationDirection = 'up' | 'down' | 'left' | 'right'

export type RailItemId = 'home' | 'favorites' | 'insights'

export type BrowseMode = 'catalog' | 'favorites' | 'insights'

export type FocusZone = 'rail' | 'search' | 'nav' | 'content'

export interface BrowseFocus {
  zone: FocusZone
  railIndex: number
  genreIndex: number
  rowIndex: number
  itemIndex: number
}

export interface BrowseSession {
  genreId: string
  genreIndex: number
  rowIndex: number
  itemIndex: number
}

export type AppScreen = 'browse' | 'details'

export type DetailsActionId = 'play' | 'favorite' | 'recommendations'

export type DetailsFocusZone = 'back' | 'actions' | 'recommendations'

export interface DetailsFocus {
  zone: DetailsFocusZone
  actionIndex: number
  recommendationIndex: number
}

export const RAIL_ITEMS: Array<{ id: RailItemId; label: string }> = [
  { id: 'home', label: 'Inicio' },
  { id: 'favorites', label: 'Guardados' },
  { id: 'insights', label: 'Tu año' },
]

export const DETAILS_ACTIONS: DetailsActionId[] = ['play', 'favorite', 'recommendations']

export const INITIAL_DETAILS_FOCUS: DetailsFocus = {
  zone: 'back',
  actionIndex: 0,
  recommendationIndex: 0,
}

export interface RowDefinition {
  id: string
  title: string
  type: MediaType
  catalogId: string
  genre?: string
  year?: string
  skip?: number
}

export interface CatalogFetchResult {
  items: CatalogItem[]
  source: 'cinemeta' | 'tvmaze'
}

export interface SearchResult {
  item: CatalogItem
  score: number
}

export interface RecommendationResult {
  item: CatalogItem
  score: number
  reason: 'sequel' | 'franchise' | 'genre' | 'related'
}
