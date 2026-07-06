import { fetchCinemetaCatalogWithPagination } from './api/cinemeta-api'
import { fetchTvMazeCatalog } from './api/tvmaze-api'
import { GENRE_NAV_ITEMS } from './genres'
import type { CatalogItem, CatalogRow, RowDefinition } from './types'

export const ITEMS_PER_ROW = 30
export const ROW_COUNT = 10

const ALL_ROW_DEFINITIONS: RowDefinition[] = [
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

const GENRE_ROW_TEMPLATES: Array<{ suffix: string; title: string; type: 'movie' | 'series'; catalogId: string }> = [
  { suffix: 'top-movies', title: 'Top películas', type: 'movie', catalogId: 'top' },
  { suffix: 'top-series', title: 'Top series', type: 'series', catalogId: 'top' },
  { suffix: 'rated-movies', title: 'Mejor valoradas', type: 'movie', catalogId: 'imdbRating' },
  { suffix: 'rated-series', title: 'Series mejor valoradas', type: 'series', catalogId: 'imdbRating' },
  { suffix: 'fresh-movies', title: 'Novedades', type: 'movie', catalogId: 'top' },
  { suffix: 'fresh-series', title: 'Series nuevas', type: 'series', catalogId: 'top' },
  { suffix: 'cinema-movies', title: 'Cine destacado', type: 'movie', catalogId: 'imdbRating' },
  { suffix: 'binge-series', title: 'Para maratonear', type: 'series', catalogId: 'imdbRating' },
  { suffix: 'weekend-movies', title: 'Fin de semana', type: 'movie', catalogId: 'top' },
  { suffix: 'weekend-series', title: 'Series del momento', type: 'series', catalogId: 'top' },
]

export function getRowDefinitionsForGenre(genreFilter: string | null): RowDefinition[] {
  if (!genreFilter) {
    return ALL_ROW_DEFINITIONS
  }

  return GENRE_ROW_TEMPLATES.map((template) => ({
    id: `${genreFilter.toLowerCase()}-${template.suffix}`,
    title: `${template.title} · ${genreFilter}`,
    type: template.type,
    catalogId: template.catalogId,
    genre: genreFilter,
  }))
}

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

export async function loadAllCatalogRows(genreFilter: string | null = null): Promise<CatalogRow[]> {
  const definitions = getRowDefinitionsForGenre(genreFilter)
  const rows = await Promise.all(definitions.map((definition) => loadCatalogRow(definition)))
  return rows.filter((row) => row.items.length > 0)
}

export async function loadCatalogRowsLazy(
  genreFilter: string | null,
  onRowLoaded: (row: CatalogRow, index: number) => void,
): Promise<CatalogRow[]> {
  const definitions = getRowDefinitionsForGenre(genreFilter)
  const loadedRows: CatalogRow[] = []

  for (const [index, definition] of definitions.entries()) {
    const row = await loadCatalogRow(definition)

    if (row.items.length > 0) {
      loadedRows.push(row)
      onRowLoaded(row, index)
    }
  }

  return loadedRows
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

export function getGenreIdByIndex(index: number): string {
  const normalized = ((index % GENRE_NAV_ITEMS.length) + GENRE_NAV_ITEMS.length) % GENRE_NAV_ITEMS.length
  return GENRE_NAV_ITEMS[normalized].id
}
