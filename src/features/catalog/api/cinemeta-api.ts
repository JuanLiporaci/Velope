import type { CatalogItem, MediaType, RowDefinition } from '../types'
import { getCinemetaPosterUrl } from '../catalog-normalizer'

const CINEMETA_BASE = 'https://v3-cinemeta.strem.io'

interface CinemetaMeta {
  id?: string
  imdb_id?: string
  name?: string
  type?: string
  poster?: string
  background?: string
  description?: string
  year?: string
  releaseInfo?: string
  imdbRating?: string
  genre?: string[]
  genres?: string[]
}

interface CinemetaResponse {
  metas?: CinemetaMeta[]
}

function buildCatalogUrl(definition: RowDefinition): string {
  const { type, catalogId, genre, year, skip } = definition
  const extras: string[] = []

  if (genre) {
    extras.push(`genre=${encodeURIComponent(genre)}`)
  }

  if (year) {
    extras.push(`genre=${encodeURIComponent(year)}`)
  }

  if (skip !== undefined) {
    extras.push(`skip=${skip}`)
  }

  const suffix = extras.length > 0 ? `/${extras.join('&')}` : ''

  return `${CINEMETA_BASE}/catalog/${type}/${catalogId}${suffix}.json`
}

export async function fetchCinemetaCatalog(
  definition: RowDefinition,
): Promise<CatalogItem[]> {
  const response = await fetch(buildCatalogUrl(definition), {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Cinemeta error ${response.status} for ${definition.id}`)
  }

  const data = (await response.json()) as CinemetaResponse

  return (data.metas ?? []).map((meta) => normalizeCinemetaMeta(meta, definition.type))
}

function normalizeCinemetaMeta(meta: CinemetaMeta, fallbackType: MediaType): CatalogItem {
  const type = meta.type === 'series' ? 'series' : fallbackType
  const id = meta.id ?? meta.imdb_id ?? meta.name ?? crypto.randomUUID()

  return {
    id,
    type,
    title: meta.name ?? 'Untitled',
    year: meta.year ?? meta.releaseInfo ?? '',
    posterUrl: getCinemetaPosterUrl(meta),
    backdropUrl: meta.background ?? null,
    description: meta.description ?? '',
    rating: meta.imdbRating ?? null,
    genres: meta.genre ?? meta.genres ?? [],
  }
}

export async function fetchCinemetaCatalogWithPagination(
  definition: RowDefinition,
  targetCount: number,
): Promise<CatalogItem[]> {
  const collected: CatalogItem[] = []
  const seenIds = new Set<string>()
  let skip = definition.skip ?? 0
  let attempts = 0

  while (collected.length < targetCount && attempts < 4) {
    const batch = await fetchCinemetaCatalog({ ...definition, skip })

    if (batch.length === 0) {
      break
    }

    for (const item of batch) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id)
        collected.push(item)
      }
    }

    skip += batch.length
    attempts += 1
  }

  return collected.slice(0, targetCount)
}
