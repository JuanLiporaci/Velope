import { describe, expect, it } from 'vitest'
import { computeViewportScale } from './use-viewport-scale'

describe('computeViewportScale', () => {
  it('renders natively at the recommended 1920x1080 TV viewport', () => {
    expect(computeViewportScale(1920, 1080)).toEqual({
      width: 1920,
      height: 1080,
      scale: 1,
      hostWidth: 1920,
      hostHeight: 1080,
      offsetX: 0,
      offsetY: 0,
    })
  })

  it('scales proportionally for the 1280x720 bonus viewport', () => {
    expect(computeViewportScale(1280, 720)).toEqual({
      width: 1920,
      height: 1080,
      scale: 2 / 3,
      hostWidth: 1280,
      hostHeight: 720,
      offsetX: 0,
      offsetY: 0,
    })
  })

  it('fills ultrawide screens without leaving letterboxing gutters', () => {
    expect(computeViewportScale(2560, 1080)).toEqual({
      width: 1920,
      height: 1080,
      scale: 2560 / 1920,
      hostWidth: 2560,
      hostHeight: 1080,
      offsetX: 0,
      offsetY: 0,
    })
  })

  it('fills the browser window and top-aligns the canvas', () => {
    const viewport = computeViewportScale(1440, 900)

    expect(viewport.hostWidth).toBe(1440)
    expect(viewport.hostHeight).toBe(900)
    expect(viewport.scale).toBeCloseTo(900 / 1080)
    expect(viewport.offsetY).toBe(0)
    expect(viewport.offsetX).toBeCloseTo((1440 - 1920 * viewport.scale) / 2)
  })
})
