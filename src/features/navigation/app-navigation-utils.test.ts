import { describe, expect, it } from 'vitest'
import type { CatalogRow } from '../catalog/types'
import { getNextBrowseFocus, INITIAL_BROWSE_FOCUS } from './app-navigation-utils'

const mockRows: CatalogRow[] = Array.from({ length: 3 }, (_, rowIndex) => ({
  id: `row-${rowIndex}`,
  title: `Row ${rowIndex}`,
  items: Array.from({ length: 30 }, (_, itemIndex) => ({
    id: `item-${rowIndex}-${itemIndex}`,
    type: 'movie',
    title: `Title ${itemIndex}`,
    year: '2024',
    posterUrl: null,
    backdropUrl: null,
    description: '',
    rating: null,
    genres: [],
  })),
}))

describe('app-navigation-utils', () => {
  it('starts with nav focus on All', () => {
    expect(INITIAL_BROWSE_FOCUS).toEqual({
      zone: 'nav',
      genreIndex: 0,
      rowIndex: 0,
      itemIndex: 0,
    })
  })

  it('moves between genres horizontally in nav zone', () => {
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'right', mockRows).genreIndex).toBe(1)
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'left', mockRows).genreIndex).toBe(4)
  })

  it('moves from nav to content with down arrow', () => {
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'down', mockRows)).toEqual({
      zone: 'content',
      genreIndex: 0,
      rowIndex: 0,
      itemIndex: 0,
    })
  })

  it('returns from first content row to nav with up arrow', () => {
    const contentFocus = {
      zone: 'content' as const,
      genreIndex: 2,
      rowIndex: 0,
      itemIndex: 5,
    }

    expect(getNextBrowseFocus(contentFocus, 'up', mockRows)).toEqual({
      zone: 'nav',
      genreIndex: 2,
      rowIndex: 0,
      itemIndex: 5,
    })
  })
})
