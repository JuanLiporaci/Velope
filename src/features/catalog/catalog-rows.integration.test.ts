import { describe, expect, it } from 'vitest'
import { loadAllCatalogRows, ROW_DEFINITIONS } from './catalog-rows'

describe('catalog-rows integration', () => {
  it('loads at least 10 rows with 30 items each from live APIs', async () => {
    const rows = await loadAllCatalogRows()

    expect(rows.length).toBeGreaterThanOrEqual(10)
    expect(ROW_DEFINITIONS.length).toBe(10)

    for (const row of rows) {
      expect(row.items.length).toBeGreaterThanOrEqual(30)
      expect(row.items[0]?.title).toBeTruthy()
    }
  }, 60_000)
})
