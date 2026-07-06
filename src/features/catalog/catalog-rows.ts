import { fetchCinemetaCatalogWithPagination } from './api/cinemeta-api'
import { fetchTvMazeCatalog } from './api/tvmaze-api'
import type { CatalogItem, CatalogRow, RowDefinition } from './types'

export const ITEMS_PER_ROW = 30

export const ROW_DEFINITIONS: RowDefinition[] = [
  { id: 'popular-movies', title: 'Películas populares', type: 'movie', catalogId: 'top' },
  { id: 'popular-series', title: 'Series populares', type: 'series', catalogId: 'top' },
  { id: 'featured-movies', title: 'Películas destacadas', type: 'movie', catalogId: 'imdbRating' },
  { id: 'featured-series', title: 'Series destacadas', type: 'series', catalogId: 'imdbRating' },
  { id: 'action-movies', title: 'Acción', type: 'movie', catalogId: 'top', genre: 'Action' },
  { id: 'drama-series', title: 'Drama', type: 'series', catalogId: 'top', genre: 'Drama' },
  { id: 'scifi-movies', title: 'Ciencia ficción', type: 'movie', catalogId: 'top', genre: 'Sci-Fi' },
  { id: 'horror-movies', title: 'Terror', type: 'movie', catalogId: 'top', genre: 'Horror' },
  { id: 'comedy-series', title: 'Comedia', type: 'series', catalogId: 'top', genre: 'Comedy' },
  { id: 'new-movies', title: 'Estrenos recientes', type: 'movie', catalogId: 'year', year: '2024' },
]

export function padItemsToCount(items: CatalogItem[], targetCount: number): CatalogItem[] {
  if (items.length === 0) {
    return []
  }

  const result = [...items]

  while (result.length < targetCount) {
    const sourceIndex = result.length % items.length
    const source = items[sourceIndex]
    result.push({
      ...source,
      id: `${source.id}-dup-${result.length}`,
    })
  }

  return result.slice(0, targetCount)
}

export async function loadCatalogRow(definition: RowDefinition): Promise<CatalogRow> {
  try {
    const items = await fetchCinemetaCatalogWithPagination(definition, ITEMS_PER_ROW)
    const padded = padItemsToCount(items, ITEMS_PER_ROW)

    return {
      id: definition.id,
      title: definition.title,
      items: padded,
    }
  } catch {
    const fallbackItems = await fetchTvMazeCatalog(ITEMS_PER_ROW)

    return {
      id: definition.id,
      title: definition.title,
      items: padItemsToCount(fallbackItems, ITEMS_PER_ROW),
    }
  }
}

export async function loadAllCatalogRows(): Promise<CatalogRow[]> {
  const rows = await Promise.all(ROW_DEFINITIONS.map((definition) => loadCatalogRow(definition)))
  return rows.filter((row) => row.items.length > 0)
}

export function getFocusedItem(
  rows: CatalogRow[],
  focus: { rowIndex: number; itemIndex: number },
): CatalogItem | null {
  const row = rows[focus.rowIndex]
  if (!row) {
    return null
  }

  return row.items[focus.itemIndex] ?? null
}
