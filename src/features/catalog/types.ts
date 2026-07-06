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

export type FocusZone = 'nav' | 'content'

export interface BrowseFocus {
  zone: FocusZone
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

export type DetailsAction = 'play' | 'favorite'

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
