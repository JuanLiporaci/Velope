import { describe, expect, it } from 'vitest'
import type { CatalogRow } from '../catalog/types'
import {
  getCarouselMaxOffset,
  getCarouselOffset,
  getFocusedVisualRight,
  getFocusOverflow,
  getNextFocusPosition,
  getVerticalScrollOffset,
  wrapIndex,
} from './navigation-utils'

const mockRows: CatalogRow[] = [
  {
    id: 'row-1',
    title: 'Row 1',
    items: Array.from({ length: 30 }, (_, index) => ({
      id: `r1-${index}`,
      type: 'movie',
      title: `Movie ${index}`,
      year: '2024',
      posterUrl: null,
      backdropUrl: null,
      description: '',
      rating: null,
      genres: [],
    })),
  },
  {
    id: 'row-2',
    title: 'Row 2',
    items: Array.from({ length: 30 }, (_, index) => ({
      id: `r2-${index}`,
      type: 'series',
      title: `Series ${index}`,
      year: '2023',
      posterUrl: null,
      backdropUrl: null,
      description: '',
      rating: null,
      genres: [],
    })),
  },
]

const carouselDefaults = {
  itemWidth: 160,
  itemGap: 20,
  visibleWidth: 1736,
  totalItems: 30,
  edgePadding: 48,
}

describe('navigation-utils', () => {
  it('wraps indices at row boundaries', () => {
    expect(wrapIndex(-1, 30)).toBe(29)
    expect(wrapIndex(30, 30)).toBe(0)
    expect(wrapIndex(5, 30)).toBe(5)
  })

  it('moves focus horizontally with wrap-around', () => {
    const start = { rowIndex: 0, itemIndex: 0 }

    expect(getNextFocusPosition(start, 'right', mockRows)).toEqual({ rowIndex: 0, itemIndex: 1 })
    expect(getNextFocusPosition({ rowIndex: 0, itemIndex: 29 }, 'right', mockRows)).toEqual({
      rowIndex: 0,
      itemIndex: 0,
    })
    expect(getNextFocusPosition({ rowIndex: 0, itemIndex: 0 }, 'left', mockRows)).toEqual({
      rowIndex: 0,
      itemIndex: 29,
    })
  })

  it('moves focus vertically while clamping item index', () => {
    const start = { rowIndex: 0, itemIndex: 20 }

    expect(getNextFocusPosition(start, 'down', mockRows)).toEqual({ rowIndex: 1, itemIndex: 20 })
    expect(getNextFocusPosition({ rowIndex: 1, itemIndex: 20 }, 'up', mockRows)).toEqual({
      rowIndex: 0,
      itemIndex: 20,
    })
  })

  it('keeps carousel offset at zero for early items', () => {
    expect(
      getCarouselOffset({
        focusIndex: 0,
        itemWidth: 160,
        itemGap: 20,
        visibleWidth: 1200,
        totalItems: 30,
      }),
    ).toBe(0)
  })

  it('scrolls carousel when focus moves beyond visible edge', () => {
    const offset = getCarouselOffset({
      focusIndex: 10,
      itemWidth: 160,
      itemGap: 20,
      visibleWidth: 800,
      totalItems: 30,
      edgePadding: 48,
    })

    expect(offset).toBeGreaterThan(0)
  })

  it('keeps late-row items fully visible including focus scale and ring', () => {
    const maxOffset = getCarouselMaxOffset(carouselDefaults)

    for (const focusIndex of [27, 28, 29]) {
      const offset = getCarouselOffset({
        ...carouselDefaults,
        focusIndex,
      })

      const stride = 160 + 20
      const focusedLeftInViewport = focusIndex * stride - offset
      const visualRight = getFocusedVisualRight({
        focusIndex,
        itemWidth: 160,
        itemGap: 20,
        offset,
      })

      expect(offset).toBeLessThanOrEqual(maxOffset)
      expect(focusedLeftInViewport).toBeGreaterThanOrEqual(0)
      expect(visualRight).toBeLessThanOrEqual(carouselDefaults.visibleWidth - carouselDefaults.edgePadding + 1)
    }
  })

  it('scrolls the row when focus reaches item 25', () => {
    const offset = getCarouselOffset({
      ...carouselDefaults,
      focusIndex: 24,
    })

    expect(offset).toBeGreaterThan(2500)

    const focusedLeftInViewport = 24 * (160 + 20) - offset
    expect(focusedLeftInViewport).toBeGreaterThan(0)
    expect(focusedLeftInViewport).toBeLessThan(carouselDefaults.visibleWidth - 160)
  })

  it('fits item 30 perfectly without clipping the focused poster', () => {
    const focusOverflow = getFocusOverflow(160)
    const maxOffset = getCarouselMaxOffset(carouselDefaults)
    const offset = getCarouselOffset({
      ...carouselDefaults,
      focusIndex: 29,
    })

    expect(offset).toBe(maxOffset)
    expect(
      getFocusedVisualRight({
        focusIndex: 29,
        itemWidth: 160,
        itemGap: 20,
        offset,
      }),
    ).toBe(carouselDefaults.visibleWidth - carouselDefaults.edgePadding)
    expect(focusOverflow).toBeGreaterThan(0)
  })

  it('resets carousel offset when wrapping from item 30 back to item 1', () => {
    const wrappedFocus = getNextFocusPosition({ rowIndex: 0, itemIndex: 29 }, 'right', mockRows)
    const offset = getCarouselOffset({
      ...carouselDefaults,
      focusIndex: wrappedFocus.itemIndex,
    })

    expect(wrappedFocus.itemIndex).toBe(0)
    expect(offset).toBe(0)
  })

  it('computes vertical scroll offset for lower rows', () => {
    const offset = getVerticalScrollOffset({
      rowIndex: 5,
      rowStride: 342,
      rowVisibleHeight: 322,
      viewportHeight: 656,
      totalRows: 10,
      bottomPadding: 29,
    })

    expect(offset).toBeGreaterThan(0)
  })

  it('scrolls vertically when active row would be clipped at the bottom', () => {
    const offset = getVerticalScrollOffset({
      rowIndex: 2,
      rowStride: 342,
      rowVisibleHeight: 322,
      viewportHeight: 656,
      totalRows: 10,
      bottomPadding: 29,
    })

    const rowBottom = 2 * 342 + 322
    expect(offset).toBeGreaterThanOrEqual(rowBottom - 656)
  })

  it('reveals the final row without clipping when focused on the last item', () => {
    const viewportHeight = 656
    const rowStride = 342
    const rowVisibleHeight = 322
    const bottomPadding = 29
    const totalRows = 10
    const lastRowIndex = 9

    const offset = getVerticalScrollOffset({
      rowIndex: lastRowIndex,
      rowStride,
      rowVisibleHeight,
      viewportHeight,
      totalRows,
      bottomPadding,
    })

    const totalHeight = (totalRows - 1) * rowStride + rowVisibleHeight + bottomPadding
    const maxScroll = totalHeight - viewportHeight

    expect(offset).toBe(maxScroll)

    const rowBottomInViewport = lastRowIndex * rowStride - offset + rowVisibleHeight
    expect(rowBottomInViewport).toBeLessThanOrEqual(viewportHeight)
  })

  it('pins the last row to the bottom when the carousel is taller than the scroll constant', () => {
    const viewportHeight = 920
    const rowStride = 342
    const rowVisibleHeight = 322
    const bottomPadding = 29
    const totalRows = 10
    const lastRowIndex = 9

    const offset = getVerticalScrollOffset({
      rowIndex: lastRowIndex,
      rowStride,
      rowVisibleHeight,
      viewportHeight,
      totalRows,
      bottomPadding,
    })

    const totalHeight = (totalRows - 1) * rowStride + rowVisibleHeight + bottomPadding
    const maxScroll = totalHeight - viewportHeight

    expect(offset).toBe(maxScroll)
    expect(lastRowIndex * rowStride - offset + rowVisibleHeight).toBeLessThanOrEqual(viewportHeight)
  })

  it('uses measured row metrics from the DOM when provided', () => {
    const viewportHeight = 666
    const totalContentHeight = 3450
    const rowTop = 3078
    const rowHeight = 322

    const offset = getVerticalScrollOffset({
      rowIndex: 9,
      rowTop,
      rowHeight,
      totalContentHeight,
      viewportHeight,
      totalRows: 10,
    })

    expect(offset).toBe(totalContentHeight - viewportHeight)
    expect(rowTop - offset + rowHeight).toBeLessThanOrEqual(viewportHeight)
  })
})
