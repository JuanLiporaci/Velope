import type { CatalogItem, SearchResult } from '../catalog/types'

const BILINGUAL_ALIASES: Record<string, string[]> = {
  action: ['action', 'accion', 'acción'],
  adventure: ['adventure', 'aventura', 'aventuras'],
  animation: ['animation', 'animacion', 'animación', 'animado'],
  comedy: ['comedy', 'comedia', 'comico', 'cómico'],
  crime: ['crime', 'crimen', 'policial'],
  documentary: ['documentary', 'documental'],
  drama: ['drama', 'dramatico', 'dramático'],
  family: ['family', 'familia', 'familiar'],
  fantasy: ['fantasy', 'fantasia', 'fantasía'],
  history: ['history', 'historia', 'historico', 'histórico'],
  horror: ['horror', 'terror', 'miedo'],
  music: ['music', 'musica', 'música', 'musical'],
  mystery: ['mystery', 'misterio'],
  romance: ['romance', 'romantico', 'romántico', 'amor'],
  scifi: ['sci fi', 'sci-fi', 'science fiction', 'ciencia ficcion', 'ciencia ficción', 'cf'],
  thriller: ['thriller', 'suspense', 'suspenso'],
  war: ['war', 'guerra', 'belico', 'bélico'],
  western: ['western', 'vaqueros', 'oeste'],
  movie: ['movie', 'movies', 'pelicula', 'película', 'peliculas', 'películas', 'cine', 'film'],
  series: ['series', 'serie', 'show', 'shows', 'tv', 'television', 'televisión'],
  anime: ['anime', 'manga'],
  superhero: ['superhero', 'superheroe', 'superhéroe', 'marvel', 'dc'],
}

const STOP_WORDS = new Set(['de', 'la', 'el', 'los', 'las', 'the', 'and', 'y', 'a', 'en', 'of'])

export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/\s+/g, '')
}

export function expandSearchTerms(query: string): string[] {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return []
  }

  const rawTerms = normalizedQuery.split(' ').filter((term) => term.length > 0 && !STOP_WORDS.has(term))
  const expanded = new Set<string>(rawTerms)

  for (const canonical of Object.keys(BILINGUAL_ALIASES)) {
    const aliases = BILINGUAL_ALIASES[canonical]
    const aliasHit = aliases.some((alias) => normalizedQuery.includes(normalizeSearchText(alias)))

    if (aliasHit) {
      expanded.add(canonical)
      aliases.forEach((alias) => expanded.add(normalizeSearchText(alias)))
    }
  }

  for (const term of rawTerms) {
    for (const [canonical, aliases] of Object.entries(BILINGUAL_ALIASES)) {
      if (aliases.some((alias) => alias.includes(term) || term.includes(alias))) {
        expanded.add(canonical)
      }
    }
  }

  return [...expanded]
}

function buildItemSearchBlob(item: CatalogItem): string {
  return normalizeSearchText(
    [item.title, item.year, item.type, item.description, ...item.genres].join(' '),
  )
}

function scoreCatalogItem(item: CatalogItem, query: string, terms: string[]): number {
  const normalizedQuery = normalizeSearchText(query)
  const compactQuery = compactSearchText(query)
  const title = normalizeSearchText(item.title)
  const compactTitle = compactSearchText(item.title)
  const blob = buildItemSearchBlob(item)

  if (!normalizedQuery) {
    return 0
  }

  let score = 0

  if (title === normalizedQuery || compactTitle === compactQuery) {
    score += 120
  } else if (title.startsWith(normalizedQuery) || compactTitle.startsWith(compactQuery)) {
    score += 90
  } else if (title.includes(normalizedQuery) || compactTitle.includes(compactQuery)) {
    score += 70
  }

  for (const term of terms) {
    if (title.includes(term)) {
      score += 24
    }

    if (blob.includes(term)) {
      score += 12
    }

    for (const genre of item.genres) {
      if (normalizeSearchText(genre).includes(term)) {
        score += 18
      }
    }
  }

  const rating = Number.parseFloat(item.rating ?? '')
  if (!Number.isNaN(rating)) {
    score += rating
  }

  return score
}

export function searchCatalog(
  items: CatalogItem[],
  query: string,
  limit = 30,
): SearchResult[] {
  const terms = expandSearchTerms(query)
  if (terms.length === 0) {
    return []
  }

  const scored = items
    .map((item) => ({
      item,
      score: scoreCatalogItem(item, query, terms),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.item.title.localeCompare(right.item.title)
    })

  return scored.slice(0, limit)
}

export function searchCatalogItems(items: CatalogItem[], query: string, limit = 30): CatalogItem[] {
  return searchCatalog(items, query, limit).map((result) => result.item)
}
