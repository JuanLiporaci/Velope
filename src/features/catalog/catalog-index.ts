import type { CatalogItem, CatalogRow } from './types'
import { dedupeItems } from './catalog-normalizer'

export function flattenCatalogRows(rows: CatalogRow[]): CatalogItem[] {
  const items: CatalogItem[] = []

  for (const row of rows) {
    items.push(...row.items)
  }

  return dedupeItems(items.filter((item) => !item.id.includes('-dup-')))
}

export function mergeCatalogItems(...groups: CatalogItem[][]): CatalogItem[] {
  return dedupeItems(groups.flat())
}
