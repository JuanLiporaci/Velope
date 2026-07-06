import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CarouselRow } from './carousel-row'
import type { CatalogItem } from '../features/catalog/types'

const items: CatalogItem[] = Array.from({ length: 30 }, (_, index) => ({
  id: `item-${index}`,
  type: 'movie',
  title: `Movie ${index + 1}`,
  year: '2024',
  posterUrl: null,
  backdropUrl: null,
  description: '',
  rating: null,
  genres: [],
}))

describe('CarouselRow', () => {
  it('scrolls the viewport when focus moves deep into the row', async () => {
    const resizeObserverCallbacks: ResizeObserverCallback[] = []

    class MockResizeObserver {
      observe = vi.fn()
      disconnect = vi.fn()

      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallbacks.push(callback)
      }
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 1736
      },
    })

    const { container } = render(
      <CarouselRow
        title="Películas populares"
        items={items}
        focusedIndex={24}
        isActiveRow
        itemWidth={160}
        itemHeight={240}
        itemGap={20}
      />,
    )

    resizeObserverCallbacks.forEach((callback) => {
      callback([{ contentRect: { width: 1736 } } as ResizeObserverEntry], {} as ResizeObserver)
    })

    const viewport = container.querySelector('.carousel-viewport') as HTMLDivElement

    await waitFor(() => {
      expect(viewport.scrollLeft).toBeGreaterThan(2500)
    })

    vi.unstubAllGlobals()
  })

  it('scrolls far enough for item 30 to remain fully visible', async () => {
    const resizeObserverCallbacks: ResizeObserverCallback[] = []

    class MockResizeObserver {
      observe = vi.fn()
      disconnect = vi.fn()

      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallbacks.push(callback)
      }
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver)

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 1736
      },
    })

    const { container } = render(
      <CarouselRow
        title="Películas populares"
        items={items}
        focusedIndex={29}
        isActiveRow
        itemWidth={160}
        itemHeight={240}
        itemGap={20}
      />,
    )

    resizeObserverCallbacks.forEach((callback) => {
      callback([{ contentRect: { width: 1736 } } as ResizeObserverEntry], {} as ResizeObserver)
    })

    const viewport = container.querySelector('.carousel-viewport') as HTMLDivElement

    await waitFor(() => {
      expect(viewport.scrollLeft).toBeGreaterThan(3600)
    })

    vi.unstubAllGlobals()
  })
})
