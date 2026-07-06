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
const BASE_ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT

export function computeViewportScale(
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
): ViewportScale {
  const viewportAspectRatio = viewportWidth / viewportHeight
  const scale =
    viewportAspectRatio >= BASE_ASPECT_RATIO
      ? viewportHeight / BASE_HEIGHT
      : viewportWidth / BASE_WIDTH
  const width =
    viewportAspectRatio >= BASE_ASPECT_RATIO
      ? viewportWidth / scale
      : BASE_WIDTH
  const height =
    viewportAspectRatio >= BASE_ASPECT_RATIO
      ? BASE_HEIGHT
      : viewportHeight / scale

  return {
    width,
    height,
    scale,
    hostWidth: viewportWidth,
    hostHeight: viewportHeight,
    offsetX: 0,
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
