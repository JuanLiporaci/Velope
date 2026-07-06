import type { CatalogRow, FocusPosition, NavigationDirection } from '../catalog/types'

export const FOCUS_SCALE = 1.08
export const FOCUS_RING_PADDING = 12
export const FOCUS_RING_WIDTH = 2

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0
  }

  return ((index % length) + length) % length
}

export function clampIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0
  }

  return Math.max(0, Math.min(index, length - 1))
}

export function getNextFocusPosition(
  current: FocusPosition,
  direction: NavigationDirection,
  rows: CatalogRow[],
): FocusPosition {
  if (rows.length === 0) {
    return { rowIndex: 0, itemIndex: 0 }
  }

  const currentRow = rows[current.rowIndex]
  if (!currentRow || currentRow.items.length === 0) {
    return { rowIndex: 0, itemIndex: 0 }
  }

  switch (direction) {
    case 'left':
      return {
        rowIndex: current.rowIndex,
        itemIndex: wrapIndex(current.itemIndex - 1, currentRow.items.length),
      }
    case 'right':
      return {
        rowIndex: current.rowIndex,
        itemIndex: wrapIndex(current.itemIndex + 1, currentRow.items.length),
      }
    case 'up': {
      const nextRowIndex = clampIndex(current.rowIndex - 1, rows.length)
      const nextRow = rows[nextRowIndex]
      return {
        rowIndex: nextRowIndex,
        itemIndex: clampIndex(current.itemIndex, nextRow.items.length),
      }
    }
    case 'down': {
      const nextRowIndex = clampIndex(current.rowIndex + 1, rows.length)
      const nextRow = rows[nextRowIndex]
      return {
        rowIndex: nextRowIndex,
        itemIndex: clampIndex(current.itemIndex, nextRow.items.length),
      }
    }
    default:
      return current
  }
}

export interface CarouselOffsetInput {
  focusIndex: number
  itemWidth: number
  itemGap: number
  visibleWidth: number
  totalItems: number
  edgePadding?: number
  focusScale?: number
}

export function getFocusOverflow(itemWidth: number, focusScale = FOCUS_SCALE): number {
  const scalePad = Math.ceil((itemWidth * focusScale - itemWidth) / 2)

  return scalePad + FOCUS_RING_PADDING + FOCUS_RING_WIDTH
}

/** @deprecated Use getFocusOverflow */
export function getFocusScaleOverflow(itemWidth: number, focusScale = FOCUS_SCALE): number {
  return getFocusOverflow(itemWidth, focusScale)
}

export function getCarouselTrailingSpace(itemWidth: number, focusScale = FOCUS_SCALE): number {
  return getFocusOverflow(itemWidth, focusScale)
}

export function getCarouselTrackWidth({
  itemWidth,
  itemGap,
  totalItems,
  focusScale = FOCUS_SCALE,
}: Pick<CarouselOffsetInput, 'itemWidth' | 'itemGap' | 'totalItems' | 'focusScale'>): number {
  const stride = itemWidth + itemGap

  return totalItems * stride - itemGap + getFocusOverflow(itemWidth, focusScale)
}

export function getCarouselMaxOffset({
  itemWidth,
  itemGap,
  visibleWidth,
  totalItems,
  edgePadding = 48,
  focusScale = FOCUS_SCALE,
}: Pick<
  CarouselOffsetInput,
  'itemWidth' | 'itemGap' | 'visibleWidth' | 'totalItems' | 'edgePadding' | 'focusScale'
>): number {
  if (totalItems <= 0 || visibleWidth <= 0) {
    return 0
  }

  const trackWidth = getCarouselTrackWidth({ itemWidth, itemGap, totalItems, focusScale })

  return Math.max(0, trackWidth - visibleWidth + edgePadding)
}

export function getFocusedVisualRight({
  focusIndex,
  itemWidth,
  itemGap,
  offset,
  focusScale = FOCUS_SCALE,
}: Pick<CarouselOffsetInput, 'focusIndex' | 'itemWidth' | 'itemGap' | 'focusScale'> & {
  offset: number
}): number {
  const stride = itemWidth + itemGap
  const focusOverflow = getFocusOverflow(itemWidth, focusScale)

  return focusIndex * stride - offset + itemWidth + focusOverflow
}

export function getCarouselOffset({
  focusIndex,
  itemWidth,
  itemGap,
  visibleWidth,
  totalItems,
  edgePadding = 48,
  focusScale = FOCUS_SCALE,
}: CarouselOffsetInput): number {
  if (totalItems <= 0 || visibleWidth <= 0) {
    return 0
  }

  const stride = itemWidth + itemGap
  const focusOverflow = getFocusOverflow(itemWidth, focusScale)
  const itemLeft = focusIndex * stride
  const itemRight = itemLeft + itemWidth + focusOverflow
  const maxOffset = getCarouselMaxOffset({
    itemWidth,
    itemGap,
    visibleWidth,
    totalItems,
    edgePadding,
    focusScale,
  })

  let offset = 0

  if (itemRight > visibleWidth - edgePadding) {
    offset = itemRight - (visibleWidth - edgePadding)
  }

  if (itemLeft - offset < edgePadding) {
    offset = Math.max(0, itemLeft - edgePadding)
  }

  return Math.max(0, Math.min(offset, maxOffset))
}

export interface VerticalScrollInput {
  rowIndex: number
  rowStride?: number
  rowVisibleHeight?: number
  rowTop?: number
  rowHeight?: number
  totalContentHeight?: number
  viewportHeight: number
  totalRows: number
  edgePadding?: number
  bottomPadding?: number
}

export function getVerticalScrollOffset({
  rowIndex,
  rowStride = 0,
  rowVisibleHeight = 0,
  rowTop: measuredRowTop,
  rowHeight: measuredRowHeight,
  totalContentHeight,
  viewportHeight,
  totalRows,
  edgePadding = 20,
  bottomPadding = 20,
}: VerticalScrollInput): number {
  if (totalRows <= 0 || viewportHeight <= 0) {
    return 0
  }

  const hasMeasuredRow = measuredRowTop !== undefined && measuredRowHeight !== undefined
  const rowTop = hasMeasuredRow ? measuredRowTop : rowIndex * rowStride
  const rowHeight = hasMeasuredRow ? measuredRowHeight : rowVisibleHeight
  const rowBottom = rowTop + rowHeight

  if (rowHeight <= 0) {
    return 0
  }

  const totalHeight =
    totalContentHeight ??
    (rowStride > 0 && rowVisibleHeight > 0
      ? (totalRows - 1) * rowStride + rowVisibleHeight + bottomPadding
      : 0)

  if (totalHeight <= 0) {
    return 0
  }

  const maxScroll = Math.max(0, totalHeight - viewportHeight)

  if (totalHeight <= viewportHeight) {
    return 0
  }

  if (rowIndex >= totalRows - 1) {
    return maxScroll
  }

  if (rowTop <= edgePadding) {
    return 0
  }

  if (rowBottom > viewportHeight - edgePadding) {
    const desired = rowBottom - viewportHeight + edgePadding
    return Math.min(Math.max(0, desired), maxScroll)
  }

  return Math.max(0, Math.min(rowTop - edgePadding, maxScroll))
}
