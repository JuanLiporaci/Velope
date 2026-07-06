import { describe, expect, it } from 'vitest'
import { getHardcodedTvYearStatistics, HARDCODED_TV_YEAR_STATISTICS } from './year-statistics'

describe('year-statistics', () => {
  it('exposes curated TV dashboard stats with poster-backed titles', () => {
    const stats = getHardcodedTvYearStatistics()

    expect(stats).toBe(HARDCODED_TV_YEAR_STATISTICS)
    expect(stats.totalHours).toBe('487 h')
    expect(stats.topGenre.label).toBe('Ciencia ficción')
    expect(stats.heroTitle.posterPath).toContain('tt0816692')
    expect(stats.topRow).toHaveLength(4)
    expect(stats.summary.length).toBeLessThan(90)
  })
})
