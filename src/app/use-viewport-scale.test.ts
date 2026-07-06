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

  it('letterboxes ultrawide screens instead of cropping content', () => {
    expect(computeViewportScale(2560, 1080)).toEqual({
      width: 1920,
      height: 1080,
      scale: 1,
      hostWidth: 2560,
      hostHeight: 1080,
      offsetX: 320,
      offsetY: 0,
    })
  })

  it('fits the full canvas inside shorter browser windows', () => {
    const viewport = computeViewportScale(1440, 900)

    expect(viewport.hostWidth).toBe(1440)
    expect(viewport.hostHeight).toBe(900)
    expect(viewport.scale).toBeCloseTo(1440 / 1920)
    expect(viewport.offsetX).toBe(0)
    expect(viewport.offsetY).toBeCloseTo((900 - 1080 * viewport.scale) / 2)
  })

  it('avoids vertical clipping on wide but short monitors', () => {
    const viewport = computeViewportScale(1600, 750)

    expect(viewport.scale).toBeCloseTo(750 / 1080)
    expect(1080 * viewport.scale).toBeLessThanOrEqual(750)
    expect(1920 * viewport.scale).toBeLessThanOrEqual(1600)
    expect(viewport.offsetX).toBeGreaterThan(0)
  })
})
