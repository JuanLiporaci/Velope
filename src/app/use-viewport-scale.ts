import { useEffect, useState } from 'react'

export interface ViewportScale {
  width: number
  height: number
  scale: number
  hostWidth: number
  hostHeight: number
  offsetX: number
  offsetY: number
}

const BASE_WIDTH = 1920
const BASE_HEIGHT = 1080

export function computeViewportScale(
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
): ViewportScale {
  const scaleByWidth = viewportWidth / BASE_WIDTH
  const scaleByHeight = viewportHeight / BASE_HEIGHT
  const scale = Math.max(scaleByWidth, scaleByHeight)
  const renderedWidth = BASE_WIDTH * scale

  return {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    scale,
    hostWidth: viewportWidth,
    hostHeight: viewportHeight,
    offsetX: (viewportWidth - renderedWidth) / 2,
    offsetY: 0,
  }
}

export function useViewportScale(): ViewportScale {
  const [viewport, setViewport] = useState<ViewportScale>(() =>
    typeof window === 'undefined'
      ? {
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          scale: 1,
          hostWidth: BASE_WIDTH,
          hostHeight: BASE_HEIGHT,
          offsetX: 0,
          offsetY: 0,
        }
      : computeViewportScale(),
  )

  useEffect(() => {
    function handleResize() {
      setViewport(computeViewportScale())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}
