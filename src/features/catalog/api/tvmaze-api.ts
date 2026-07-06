import type { CatalogItem } from '../types'

const TVMAZE_BASE = 'https://api.tvmaze.com'

interface TvMazeImage {
  medium?: string
  original?: string
}

interface TvMazeShow {
  id: number
  name: string
  premiered?: string | null
  summary?: string | null
  image?: TvMazeImage | null
  genres?: string[]
  rating?: { average?: number | null }
  externals?: { imdb?: string | null }
}

export async function fetchTvMazeShows(page: number): Promise<CatalogItem[]> {
  const response = await fetch(`${TVMAZE_BASE}/shows?page=${page}`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`TVMaze error ${response.status} on page ${page}`)
  }

  const shows = (await response.json()) as TvMazeShow[]

  return shows.map((show) => normalizeTvMazeShow(show))
}

export async function fetchTvMazeCatalog(targetCount: number): Promise<CatalogItem[]> {
  const collected: CatalogItem[] = []
  let page = 0

  while (collected.length < targetCount && page < 6) {
    const batch = await fetchTvMazeShows(page)
    if (batch.length === 0) {
      break
    }
    collected.push(...batch)
    page += 1
  }

  return collected.slice(0, targetCount)
}

function normalizeTvMazeShow(show: TvMazeShow): CatalogItem {
  const year = show.premiered ? show.premiered.slice(0, 4) : ''
  const posterUrl = show.image?.medium ?? show.image?.original ?? null

  return {
    id: show.externals?.imdb ?? `tvmaze-${show.id}`,
    type: 'series',
    title: show.name,
    year,
    posterUrl,
    backdropUrl: show.image?.original ?? null,
    description: stripHtml(show.summary ?? ''),
    rating: show.rating?.average != null ? String(show.rating.average) : null,
    genres: show.genres ?? [],
  }
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim()
}
