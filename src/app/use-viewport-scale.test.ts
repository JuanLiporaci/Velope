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

  it('expands the logical canvas on ultrawide screens instead of letterboxing', () => {
    expect(computeViewportScale(2560, 1080)).toEqual({
      width: 2560,
      height: 1080,
      scale: 1,
      hostWidth: 2560,
      hostHeight: 1080,
      offsetX: 0,
      offsetY: 0,
    })
  })

  it('expands the logical height on taller browser windows', () => {
    const viewport = computeViewportScale(1440, 900)

    expect(viewport.hostWidth).toBe(1440)
    expect(viewport.hostHeight).toBe(900)
    expect(viewport.scale).toBeCloseTo(1440 / 1920)
    expect(viewport.offsetX).toBe(0)
    expect(viewport.offsetY).toBe(0)
    expect(viewport.height).toBeCloseTo(900 / viewport.scale)
  })

  it('uses the full viewport on wide but short monitors', () => {
    const viewport = computeViewportScale(1600, 750)

    expect(viewport.scale).toBeCloseTo(750 / 1080)
    expect(viewport.height * viewport.scale).toBeCloseTo(750)
    expect(viewport.width * viewport.scale).toBeCloseTo(1600)
    expect(viewport.offsetX).toBe(0)
  })
})
