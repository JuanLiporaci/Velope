import type { CatalogRow, BrowseFocus, NavigationDirection } from '../catalog/types'
import { GENRE_NAV_ITEMS } from '../catalog/genres'
import { clampIndex, getNextFocusPosition, wrapIndex } from './navigation-utils'

export const INITIAL_BROWSE_FOCUS: BrowseFocus = {
  zone: 'nav',
  genreIndex: 0,
  rowIndex: 0,
  itemIndex: 0,
}

export function getNextBrowseFocus(
  current: BrowseFocus,
  direction: NavigationDirection,
  rows: CatalogRow[],
): BrowseFocus {
  if (current.zone === 'nav') {
    switch (direction) {
      case 'left':
        return {
          ...current,
          genreIndex: wrapIndex(current.genreIndex - 1, GENRE_NAV_ITEMS.length),
        }
      case 'right':
        return {
          ...current,
          genreIndex: wrapIndex(current.genreIndex + 1, GENRE_NAV_ITEMS.length),
        }
      case 'down':
        return {
          ...current,
          zone: 'content',
          rowIndex: 0,
          itemIndex: clampIndex(current.itemIndex, rows[0]?.items.length ?? 1),
        }
      case 'up':
        return current
      default:
        return current
    }
  }

  switch (direction) {
    case 'up': {
      if (current.rowIndex === 0) {
        return {
          ...current,
          zone: 'nav',
        }
      }

      const contentFocus = getNextFocusPosition(
        { rowIndex: current.rowIndex, itemIndex: current.itemIndex },
        'up',
        rows,
      )

      return {
        ...current,
        zone: 'content',
        rowIndex: contentFocus.rowIndex,
        itemIndex: contentFocus.itemIndex,
      }
    }
    case 'down':
    case 'left':
    case 'right': {
      const contentFocus = getNextFocusPosition(
        { rowIndex: current.rowIndex, itemIndex: current.itemIndex },
        direction,
        rows,
      )

      return {
        ...current,
        zone: 'content',
        rowIndex: contentFocus.rowIndex,
        itemIndex: contentFocus.itemIndex,
      }
    }
    default:
      return current
  }
}

export function normalizeBrowseFocus(focus: BrowseFocus, rows: CatalogRow[]): BrowseFocus {
  const genreIndex = clampIndex(focus.genreIndex, GENRE_NAV_ITEMS.length)
  const rowIndex = clampIndex(focus.rowIndex, Math.max(rows.length, 1))
  const row = rows[rowIndex]
  const itemIndex = clampIndex(focus.itemIndex, Math.max(row?.items.length ?? 1, 1))

  return {
    zone: rows.length === 0 ? 'nav' : focus.zone,
    genreIndex,
    rowIndex,
    itemIndex,
  }
}
