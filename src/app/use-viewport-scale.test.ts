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
    })
  })

  it('scales proportionally for the 1280x720 bonus viewport', () => {
    expect(computeViewportScale(1280, 720)).toEqual({
      width: 1920,
      height: 1080,
      scale: 2 / 3,
      hostWidth: 1280,
      hostHeight: 720,
    })
  })

  it('fills ultrawide screens by width instead of leaving side gutters', () => {
    expect(computeViewportScale(2560, 1080)).toEqual({
      width: 1920,
      height: 1080,
      scale: 2560 / 1920,
      hostWidth: 2560,
      hostHeight: 1440,
    })
  })

  it('sizes the host wrapper to the rendered canvas dimensions', () => {
    const viewport = computeViewportScale(1440, 900)

    expect(viewport.hostWidth).toBeCloseTo(1600)
    expect(viewport.hostHeight).toBeCloseTo(900)
    expect(viewport.scale).toBeCloseTo(900 / 1080)
  })
})
