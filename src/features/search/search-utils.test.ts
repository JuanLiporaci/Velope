import { describe, expect, it } from 'vitest'
import type { CatalogItem } from '../catalog/types'
import { expandSearchTerms, normalizeSearchText, searchCatalogItems } from './search-utils'

const catalog: CatalogItem[] = [
  {
    id: '1',
    type: 'movie',
    title: 'Spider-Man',
    year: '2002',
    posterUrl: null,
    backdropUrl: null,
    description: 'Marvel superhero adventure',
    rating: '7.4',
    genres: ['Action', 'Adventure'],
  },
  {
    id: '2',
    type: 'movie',
    title: 'The Bear',
    year: '2022',
    posterUrl: null,
    backdropUrl: null,
    description: 'Kitchen drama series',
    rating: '8.6',
    genres: ['Drama', 'Comedy'],
  },
  {
    id: '3',
    type: 'series',
    title: 'Dark Matter',
    year: '2024',
    posterUrl: null,
    backdropUrl: null,
    description: 'Science fiction thriller in space',
    rating: '7.8',
    genres: ['Sci-Fi', 'Thriller'],
  },
]

describe('search-utils', () => {
  it('normalizes accents and punctuation', () => {
    expect(normalizeSearchText('Ciencia Ficción')).toBe('ciencia ficcion')
  })

  it('expands bilingual aliases for genre terms', () => {
    const terms = expandSearchTerms('accion')
    expect(terms).toContain('accion')
    expect(terms.some((term) => term.includes('action') || term === 'action')).toBe(true)
  })

  it('finds titles by english and spanish queries', () => {
    expect(searchCatalogItems(catalog, 'spiderman')[0]?.title).toBe('Spider-Man')
    expect(searchCatalogItems(catalog, 'accion').some((item) => item.title === 'Spider-Man')).toBe(true)
    expect(searchCatalogItems(catalog, 'sci fi')[0]?.title).toBe('Dark Matter')
  })
})
