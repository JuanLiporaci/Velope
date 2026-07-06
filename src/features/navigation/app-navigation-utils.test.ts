import { describe, expect, it } from 'vitest'
import type { CatalogRow } from '../catalog/types'
import {
  getNextBrowseFocus,
  getNextDetailsFocus,
  getNextRailFocus,
  getBrowseRowsSignature,
  INITIAL_BROWSE_FOCUS,
  realignBrowseFocusForRows,
} from './app-navigation-utils'

const mockItem = (id: string, title: string) => ({
  id,
  type: 'movie' as const,
  title,
  year: '2024',
  posterUrl: null,
  backdropUrl: null,
  description: '',
  rating: null,
  genres: [],
})

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
      railIndex: 0,
      genreIndex: 0,
      rowIndex: 0,
      itemIndex: 0,
    })
  })

  it('moves between genres horizontally in nav zone', () => {
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'right', mockRows).genreIndex).toBe(1)
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'left', mockRows).zone).toBe('rail')
  })

  it('moves from nav to content with down arrow', () => {
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'down', mockRows)).toEqual({
      zone: 'content',
      railIndex: 0,
      genreIndex: 0,
      rowIndex: 0,
      itemIndex: 0,
    })
  })

  it('moves from nav to search with up arrow', () => {
    expect(getNextBrowseFocus(INITIAL_BROWSE_FOCUS, 'up', mockRows)).toEqual({
      zone: 'search',
      railIndex: 0,
      genreIndex: 0,
      rowIndex: 0,
      itemIndex: 0,
    })
  })

  it('moves from search to nav with down arrow', () => {
    const searchFocus = {
      zone: 'search' as const,
      railIndex: 0,
      genreIndex: 1,
      rowIndex: 0,
      itemIndex: 0,
    }

    expect(getNextBrowseFocus(searchFocus, 'down', mockRows)).toEqual({
      zone: 'nav',
      railIndex: 0,
      genreIndex: 1,
      rowIndex: 0,
      itemIndex: 0,
    })
  })

  it('returns from first content row to nav with up arrow', () => {
    const contentFocus = {
      zone: 'content' as const,
      railIndex: 0,
      genreIndex: 2,
      rowIndex: 0,
      itemIndex: 5,
    }

    expect(getNextBrowseFocus(contentFocus, 'up', mockRows)).toEqual({
      zone: 'nav',
      railIndex: 0,
      genreIndex: 2,
      rowIndex: 0,
      itemIndex: 5,
    })
  })

  it('moves from rail to search with right arrow', () => {
    const railFocus = {
      zone: 'rail' as const,
      railIndex: 1,
      genreIndex: 0,
      rowIndex: 0,
      itemIndex: 0,
    }

    expect(getNextBrowseFocus(railFocus, 'right', mockRows).zone).toBe('search')
  })

  it('moves from back to first action with down arrow', () => {
    expect(
      getNextDetailsFocus(
        { zone: 'back', actionIndex: 0, recommendationIndex: 0 },
        'down',
        5,
      ).zone,
    ).toBe('actions')
  })

  it('moves vertically between stacked actions', () => {
    const actionsFocus = {
      zone: 'actions' as const,
      actionIndex: 1,
      recommendationIndex: 0,
    }

    expect(getNextDetailsFocus(actionsFocus, 'up', 5).actionIndex).toBe(0)
    expect(getNextDetailsFocus(actionsFocus, 'down', 5).actionIndex).toBe(2)
  })

  it('resets focus to the first search result when rows switch to search mode', () => {
    const catalogFocus = {
      zone: 'content' as const,
      railIndex: 0,
      genreIndex: 0,
      rowIndex: 4,
      itemIndex: 28,
    }

    const searchRows: CatalogRow[] = [
      {
        id: 'search-results-row',
        title: 'Resultados para "rick"',
        items: [mockItem('rick-1', 'Rick and Morty'), mockItem('rick-2', 'Rick')],
      },
    ]

    const realigned = realignBrowseFocusForRows(catalogFocus, searchRows, getBrowseRowsSignature(mockRows))

    expect(realigned.focus.rowIndex).toBe(0)
    expect(realigned.focus.itemIndex).toBe(0)
  })

  it('moves only within rail in insights mode helper', () => {
    const focus = { ...INITIAL_BROWSE_FOCUS, zone: 'rail' as const, railIndex: 2 }

    expect(getNextRailFocus(focus, 'up').railIndex).toBe(1)
    expect(getNextRailFocus(focus, 'down').railIndex).toBe(0)
    expect(getNextRailFocus(focus, 'left').railIndex).toBe(2)
  })
})
