import { describe, expect, it } from 'vitest'
import type { CatalogItem } from '../catalog/types'
import {
  isItemFavorite,
  readFavoritesFromStorage,
  toggleFavoriteInList,
  writeFavoritesToStorage,
} from './favorites-storage'

const sampleItem: CatalogItem = {
  id: 'tt123',
  type: 'movie',
  title: 'Spider-Man',
  year: '2002',
  posterUrl: null,
  backdropUrl: null,
  description: 'A hero rises.',
  rating: '7.4',
  genres: ['Action'],
}

describe('favorites-storage', () => {
  it('adds and removes favorites by id', () => {
    const added = toggleFavoriteInList([], sampleItem)
    expect(added).toHaveLength(1)
    expect(isItemFavorite(added, 'tt123')).toBe(true)

    const removed = toggleFavoriteInList(added, sampleItem)
    expect(removed).toHaveLength(0)
  })

  it('reads invalid localStorage payloads safely', () => {
    window.localStorage.setItem('velope.favorites.v1', '{bad json')
    expect(readFavoritesFromStorage()).toEqual([])

    window.localStorage.setItem('velope.favorites.v1', JSON.stringify([{ id: 1 }]))
    expect(readFavoritesFromStorage()).toEqual([])
  })

  it('persists favorites to localStorage', () => {
    writeFavoritesToStorage([sampleItem])
    expect(readFavoritesFromStorage()).toEqual([sampleItem])
  })
})
