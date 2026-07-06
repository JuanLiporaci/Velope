import { describe, expect, it } from 'vitest'
import type { CatalogItem } from '../catalog/types'
import { extractFranchiseKey, getRecommendationItems } from './recommendation-utils'

const catalog: CatalogItem[] = [
  {
    id: '1',
    type: 'movie',
    title: 'Spider-Man',
    year: '2002',
    posterUrl: null,
    backdropUrl: null,
    description: 'Peter Parker becomes a hero',
    rating: '7.4',
    genres: ['Action', 'Adventure'],
  },
  {
    id: '2',
    type: 'movie',
    title: 'Spider-Man 2',
    year: '2004',
    posterUrl: null,
    backdropUrl: null,
    description: 'Peter Parker faces Doctor Octopus',
    rating: '7.5',
    genres: ['Action', 'Adventure'],
  },
  {
    id: '3',
    type: 'movie',
    title: 'The Bear',
    year: '2022',
    posterUrl: null,
    backdropUrl: null,
    description: 'Kitchen drama',
    rating: '8.6',
    genres: ['Drama'],
  },
]

describe('recommendation-utils', () => {
  it('extracts a stable franchise key from sequels', () => {
    expect(extractFranchiseKey('Spider-Man 2')).toBe('spider man')
  })

  it('prioritizes franchise matches for recommendations', () => {
    const source = catalog[0]
    const recommendations = getRecommendationItems(source, catalog, 5)

    expect(recommendations[0]?.title).toBe('Spider-Man 2')
    expect(recommendations.some((item) => item.id === source.id)).toBe(false)
  })

  it('falls back to genre related titles when no franchise exists', () => {
    const source = catalog[2]
    const recommendations = getRecommendationItems(source, catalog, 5)

    expect(recommendations.length).toBeGreaterThan(0)
    expect(recommendations.every((item) => item.id !== source.id)).toBe(true)
  })
})
