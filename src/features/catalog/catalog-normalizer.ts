import type { CatalogItem } from './types'

interface CinemetaLikeMeta {
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

interface TvMazeLikeShow {
  id: number
  name: string
  premiered?: string | null
  summary?: string | null
  image?: { medium?: string; original?: string } | null
  genres?: string[]
  rating?: { average?: number | null }
  externals?: { imdb?: string | null }
}

export function normalizeFromCinemeta(meta: CinemetaLikeMeta, fallbackType: 'movie' | 'series'): CatalogItem {
  const type = meta.type === 'series' ? 'series' : fallbackType
  const id = meta.id ?? meta.imdb_id ?? meta.name ?? 'unknown'

  return {
    id,
    type,
    title: meta.name ?? 'Untitled',
    year: meta.year ?? meta.releaseInfo ?? '',
    posterUrl: meta.poster ?? null,
    backdropUrl: meta.background ?? null,
    description: meta.description ?? '',
    rating: meta.imdbRating ?? null,
    genres: meta.genre ?? meta.genres ?? [],
  }
}

export function normalizeFromTvMaze(show: TvMazeLikeShow): CatalogItem {
  const year = show.premiered ? show.premiered.slice(0, 4) : ''
  const posterUrl = show.image?.medium ?? show.image?.original ?? null

  return {
    id: show.externals?.imdb ?? `tvmaze-${show.id}`,
    type: 'series',
    title: show.name,
    year,
    posterUrl,
    backdropUrl: show.image?.original ?? null,
    description: (show.summary ?? '').replace(/<[^>]*>/g, '').trim(),
    rating: show.rating?.average != null ? String(show.rating.average) : null,
    genres: show.genres ?? [],
  }
}

export function dedupeItems(items: CatalogItem[]): CatalogItem[] {
  const seen = new Set<string>()
  const result: CatalogItem[] = []

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      result.push(item)
    }
  }

  return result
}
