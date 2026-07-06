import { useCallback, useState } from 'react'
import type { CatalogItem } from '../catalog/types'
import {
  isItemFavorite,
  readFavoritesFromStorage,
  toggleFavoriteInList,
  writeFavoritesToStorage,
} from './favorites-storage'

export function useLocalFavorites() {
  const [favorites, setFavorites] = useState<CatalogItem[]>(() => readFavoritesFromStorage())

  const toggleFavorite = useCallback((item: CatalogItem) => {
    setFavorites((current) => {
      const next = toggleFavoriteInList(current, item)
      writeFavoritesToStorage(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (itemId: string) => isItemFavorite(favorites, itemId),
    [favorites],
  )

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  }
}
