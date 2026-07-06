import type {
  BrowseFocus,
  CatalogRow,
  DetailsFocus,
  NavigationDirection,
} from '../catalog/types'
import { GENRE_NAV_ITEMS } from '../catalog/genres'
import { SEARCH_ROW_ID } from '../catalog/browse-rows'
import { RAIL_ITEMS } from '../catalog/types'
import { clampIndex, getNextFocusPosition, wrapIndex } from './navigation-utils'

export const INITIAL_BROWSE_FOCUS: BrowseFocus = {
  zone: 'nav',
  railIndex: 0,
  genreIndex: 0,
  rowIndex: 0,
  itemIndex: 0,
}

/** Solo rail lateral (p. ej. pantalla insights sin grid de catálogo). */
export function getNextRailFocus(
  current: BrowseFocus,
  direction: NavigationDirection,
): BrowseFocus {
  const railIndex =
    direction === 'up'
      ? wrapIndex(current.railIndex - 1, RAIL_ITEMS.length)
      : direction === 'down'
        ? wrapIndex(current.railIndex + 1, RAIL_ITEMS.length)
        : current.railIndex

  return { ...current, zone: 'rail', railIndex }
}

export function getNextBrowseFocus(
  current: BrowseFocus,
  direction: NavigationDirection,
  rows: CatalogRow[],
): BrowseFocus {
  if (current.zone === 'rail') {
    switch (direction) {
      case 'up':
        return {
          ...current,
          railIndex: wrapIndex(current.railIndex - 1, RAIL_ITEMS.length),
        }
      case 'down':
        return {
          ...current,
          railIndex: wrapIndex(current.railIndex + 1, RAIL_ITEMS.length),
        }
      case 'right':
        return { ...current, zone: 'search' }
      case 'left':
        return current
      default:
        return current
    }
  }

  if (current.zone === 'search') {
    switch (direction) {
      case 'down':
        return { ...current, zone: 'nav' }
      case 'up':
        return current
      case 'left':
        return { ...current, zone: 'rail' }
      default:
        return current
    }
  }

  if (current.zone === 'nav') {
    switch (direction) {
      case 'left':
        if (current.genreIndex === 0) {
          return { ...current, zone: 'rail' }
        }
        return {
          ...current,
          genreIndex: wrapIndex(current.genreIndex - 1, GENRE_NAV_ITEMS.length),
        }
      case 'right':
        return {
          ...current,
          genreIndex: wrapIndex(current.genreIndex + 1, GENRE_NAV_ITEMS.length),
        }
      case 'up':
        return { ...current, zone: 'search' }
      case 'down':
        return {
          ...current,
          zone: 'content',
          rowIndex: 0,
          itemIndex: clampIndex(current.itemIndex, rows[0]?.items.length ?? 1),
        }
      default:
        return current
    }
  }

  switch (direction) {
    case 'left': {
      if (current.itemIndex === 0) {
        return { ...current, zone: 'rail' }
      }

      const contentFocus = getNextFocusPosition(
        { rowIndex: current.rowIndex, itemIndex: current.itemIndex },
        'left',
        rows,
      )

      return {
        ...current,
        zone: 'content',
        rowIndex: contentFocus.rowIndex,
        itemIndex: contentFocus.itemIndex,
      }
    }
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

export function getBrowseRowsSignature(rows: CatalogRow[]): string {
  return rows
    .map((row) => `${row.id}:${row.items.map((item) => item.id).join(',')}`)
    .join('|')
}

function isSpecialBrowseRow(rowId: string | undefined): boolean {
  return rowId === SEARCH_ROW_ID || rowId === 'favorites-row' || rowId === 'favorites-empty'
}

export function realignBrowseFocusForRows(
  focus: BrowseFocus,
  rows: CatalogRow[],
  previousSignature: string | null,
): { focus: BrowseFocus; signature: string } {
  const signature = getBrowseRowsSignature(rows)

  if (signature === previousSignature) {
    return { focus: normalizeBrowseFocus(focus, rows), signature }
  }

  const primaryRowId = rows[0]?.id
  const previousWasSpecial =
    previousSignature !== null &&
    (previousSignature.startsWith(`${SEARCH_ROW_ID}:`) ||
      previousSignature.startsWith('favorites-row:') ||
      previousSignature.startsWith('favorites-empty:'))
  const shouldResetPosition = isSpecialBrowseRow(primaryRowId) || previousWasSpecial

  if (shouldResetPosition) {
    return {
      focus: normalizeBrowseFocus({ ...focus, rowIndex: 0, itemIndex: 0 }, rows),
      signature,
    }
  }

  return {
    focus: normalizeBrowseFocus(focus, rows),
    signature,
  }
}

export function normalizeBrowseFocus(focus: BrowseFocus, rows: CatalogRow[]): BrowseFocus {
  const railIndex = clampIndex(focus.railIndex, RAIL_ITEMS.length)
  const genreIndex = clampIndex(focus.genreIndex, GENRE_NAV_ITEMS.length)
  const rowIndex = clampIndex(focus.rowIndex, Math.max(rows.length, 1))
  const row = rows[rowIndex]
  const itemIndex = clampIndex(focus.itemIndex, Math.max(row?.items.length ?? 1, 1))

  return {
    zone: rows.length === 0 ? 'nav' : focus.zone,
    railIndex,
    genreIndex,
    rowIndex,
    itemIndex,
  }
}

export function getNextDetailsFocus(
  current: DetailsFocus,
  direction: NavigationDirection,
  recommendationCount: number,
): DetailsFocus {
  if (current.zone === 'back') {
    switch (direction) {
      case 'down':
      case 'right':
        return { ...current, zone: 'actions', actionIndex: 0 }
      case 'up':
      case 'left':
        return current
      default:
        return current
    }
  }

  if (current.zone === 'actions') {
    switch (direction) {
      case 'up':
        if (current.actionIndex === 0) {
          return { ...current, zone: 'back' }
        }
        return {
          ...current,
          actionIndex: current.actionIndex - 1,
        }
      case 'down':
        if (current.actionIndex >= 2) {
          if (recommendationCount > 0) {
            return {
              ...current,
              zone: 'recommendations',
              recommendationIndex: 0,
            }
          }
          return current
        }
        return {
          ...current,
          actionIndex: current.actionIndex + 1,
        }
      case 'left':
        return { ...current, zone: 'back' }
      case 'right':
        if (recommendationCount > 0) {
          return {
            ...current,
            zone: 'recommendations',
            recommendationIndex: 0,
          }
        }
        return current
      default:
        return current
    }
  }

  switch (direction) {
    case 'left':
      return {
        ...current,
        recommendationIndex: wrapIndex(current.recommendationIndex - 1, recommendationCount),
      }
    case 'right':
      return {
        ...current,
        recommendationIndex: wrapIndex(current.recommendationIndex + 1, recommendationCount),
      }
    case 'up':
      return {
        ...current,
        zone: 'actions',
        actionIndex: 2,
      }
    case 'down':
      return current
    default:
      return current
  }
}
