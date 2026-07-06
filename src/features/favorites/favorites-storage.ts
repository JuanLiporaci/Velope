import type { CatalogItem } from '../catalog/types'

export const FAVORITES_STORAGE_KEY = 'velope.favorites.v1'

export function readFavoritesFromStorage(): CatalogItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidCatalogItem)
  } catch {
    return []
  }
}

export function writeFavoritesToStorage(items: CatalogItem[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items))
}

export function toggleFavoriteInList(items: CatalogItem[], item: CatalogItem): CatalogItem[] {
  const exists = items.some((favorite) => favorite.id === item.id)

  if (exists) {
    return items.filter((favorite) => favorite.id !== item.id)
  }

  return [item, ...items]
}

export function isItemFavorite(items: CatalogItem[], itemId: string): boolean {
  return items.some((favorite) => favorite.id === itemId)
}

function isValidCatalogItem(value: unknown): value is CatalogItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<CatalogItem>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    (candidate.type === 'movie' || candidate.type === 'series') &&
    typeof candidate.year === 'string' &&
    Array.isArray(candidate.genres)
  )
}
