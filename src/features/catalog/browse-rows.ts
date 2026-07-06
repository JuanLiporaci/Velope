import type { CatalogItem, CatalogRow, BrowseMode } from './types'
import { padItemsToCount } from './catalog-rows'
import { searchCatalogItems } from '../search/search-utils'

const FAVORITES_ROW_ID = 'favorites-row'
export const SEARCH_ROW_ID = 'search-results-row'
const ITEMS_PER_ROW = 30

export function buildBrowseRows(
  sourceRows: CatalogRow[],
  favorites: CatalogItem[],
  searchQuery: string,
  catalogIndex: CatalogItem[],
  browseMode: BrowseMode = 'catalog',
): CatalogRow[] {
  if (browseMode === 'favorites') {
    if (favorites.length === 0) {
      return [{ id: 'favorites-empty', title: 'Mis favoritos', items: [] }]
    }

    return [
      {
        id: FAVORITES_ROW_ID,
        title: 'Mis favoritos',
        items: padItemsToCount(favorites, Math.min(favorites.length, ITEMS_PER_ROW)),
      },
    ]
  }

  const trimmedQuery = searchQuery.trim()
  if (trimmedQuery) {
    const matches = searchCatalogItems(catalogIndex, trimmedQuery, ITEMS_PER_ROW)

    if (matches.length > 0) {
      return [
        {
          id: SEARCH_ROW_ID,
          title: `Resultados para "${trimmedQuery}"`,
          items: matches,
        },
      ]
    }

    return [
      {
        id: SEARCH_ROW_ID,
        title: `Sin resultados para "${trimmedQuery}"`,
        items: [],
      },
    ]
  }

  return sourceRows
}

export function isSearchActive(searchQuery: string): boolean {
  return searchQuery.trim().length > 0
}
