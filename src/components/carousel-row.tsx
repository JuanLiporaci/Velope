import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getCarouselOffset,
  getCarouselTrailingSpace,
  getFocusOverflow,
} from '../features/navigation/navigation-utils'
import type { CatalogItem } from '../features/catalog/types'
import { PosterCard } from './poster-card'

interface CarouselRowProps {
  title: string
  items: CatalogItem[]
  focusedIndex: number
  isActiveRow: boolean
  itemWidth: number
  itemHeight: number
  itemGap: number
}

export function CarouselRow({
  title,
  items,
  focusedIndex,
  isActiveRow,
  itemWidth,
  itemHeight,
  itemGap,
}: CarouselRowProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [visibleWidth, setVisibleWidth] = useState(0)
  const focusOverflow = useMemo(() => getFocusOverflow(itemWidth), [itemWidth])
  const trailingSpace = useMemo(() => getCarouselTrailingSpace(itemWidth), [itemWidth])

  useEffect(() => {
    const node = viewportRef.current
    if (!node) {
      return
    }

    function measure() {
      if (viewportRef.current) {
        setVisibleWidth(viewportRef.current.clientWidth)
      }
    }

    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const offset = useMemo(() => {
    if (!isActiveRow || visibleWidth <= 0) {
      return 0
    }

    return getCarouselOffset({
      focusIndex: focusedIndex,
      itemWidth,
      itemGap,
      visibleWidth,
      totalItems: items.length,
    })
  }, [focusedIndex, isActiveRow, itemGap, itemWidth, items.length, visibleWidth])

  useEffect(() => {
    if (!viewportRef.current) {
      return
    }

    viewportRef.current.scrollLeft = isActiveRow ? offset : 0
  }, [isActiveRow, offset])

  return (
    <section className="mb-5" style={{ minHeight: itemHeight + 56 }}>
      <h2
        className={`mb-3 px-12 text-lg font-medium tracking-tight transition-colors duration-150 ${
          isActiveRow ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
        }`}
      >
        {title}
      </h2>

      <div
        ref={viewportRef}
        className="carousel-viewport px-12"
        style={{
          paddingTop: focusOverflow,
          paddingBottom: focusOverflow,
        }}
      >
        <div
          className="carousel-track flex w-max items-center"
          style={{
            gap: itemGap,
            paddingRight: trailingSpace,
          }}
        >
          {items.map((item, index) => (
            <PosterCard
              key={item.id}
              item={item}
              isFocused={isActiveRow && index === focusedIndex}
              width={itemWidth}
              height={itemHeight}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
