import { useEffect, useState } from 'react'

export interface ViewportScale {
  width: number
  height: number
  scale: number
  hostWidth: number
  hostHeight: number
}

const BASE_WIDTH = 1920
const BASE_HEIGHT = 1080
const TV_ASPECT = BASE_WIDTH / BASE_HEIGHT

export function computeViewportScale(
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
): ViewportScale {
  const scaleByWidth = viewportWidth / BASE_WIDTH
  const scaleByHeight = viewportHeight / BASE_HEIGHT
  const windowAspect = viewportWidth / viewportHeight
  const scale = windowAspect >= TV_ASPECT ? scaleByWidth : scaleByHeight

  return {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    scale,
    hostWidth: BASE_WIDTH * scale,
    hostHeight: BASE_HEIGHT * scale,
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
