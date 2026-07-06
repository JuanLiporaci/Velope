import type { CatalogItem, RecommendationResult } from '../catalog/types'
import { normalizeSearchText } from '../search/search-utils'

const SUBTITLE_SPLIT = /[:–]/

export function extractFranchiseKey(title: string): string {
  const withoutSubtitle = title.split(SUBTITLE_SPLIT)[0] ?? title
  const normalized = normalizeSearchText(withoutSubtitle)
    .replace(/\s+(?:\d+|ii|iii|iv|vi)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized
}

export function extractTitleTokens(title: string): string[] {
  return normalizeSearchText(title)
    .split(' ')
    .filter((token) => token.length > 2)
}

function parseYear(value: string): number | null {
  const year = Number.parseInt(value, 10)
  return Number.isFinite(year) ? year : null
}

function scoreRecommendation(source: CatalogItem, candidate: CatalogItem): RecommendationResult | null {
  if (source.id === candidate.id) {
    return null
  }

  const sourceKey = extractFranchiseKey(source.title)
  const candidateKey = extractFranchiseKey(candidate.title)
  const sourceTokens = new Set(extractTitleTokens(source.title))
  const candidateTokens = extractTitleTokens(candidate.title)

  let score = 0
  let reason: RecommendationResult['reason'] = 'related'

  if (sourceKey.length > 2 && candidateKey === sourceKey) {
    score += 95
    reason = 'sequel'
  } else if (
    sourceKey.length > 3 &&
    candidateKey.startsWith(sourceKey) &&
    candidateKey !== sourceKey
  ) {
    score += 82
    reason = 'franchise'
  } else if (
    sourceKey.length > 3 &&
    sourceKey.startsWith(candidateKey) &&
    candidateKey.length > 3
  ) {
    score += 72
    reason = 'franchise'
  }

  const sharedTokens = candidateTokens.filter((token) => sourceTokens.has(token))
  score += sharedTokens.length * 8

  const sharedGenres = candidate.genres.filter((genre) => source.genres.includes(genre))
  if (sharedGenres.length > 0) {
    score += sharedGenres.length * 16
    if (reason === 'related') {
      reason = 'genre'
    }
  }

  if (candidate.type === source.type) {
    score += 10
  }

  const sourceYear = parseYear(source.year)
  const candidateYear = parseYear(candidate.year)
  if (sourceYear && candidateYear) {
    const distance = Math.abs(sourceYear - candidateYear)
    if (distance <= 3) {
      score += 14 - distance * 2
    }
  }

  const sourceDescription = normalizeSearchText(source.description)
  const candidateDescription = normalizeSearchText(candidate.description)
  for (const token of sharedTokens) {
    if (sourceDescription.includes(token) && candidateDescription.includes(token)) {
      score += 4
    }
  }

  const sourceRating = Number.parseFloat(source.rating ?? '')
  const candidateRating = Number.parseFloat(candidate.rating ?? '')
  if (!Number.isNaN(sourceRating) && !Number.isNaN(candidateRating)) {
    score += Math.min(candidateRating, 10) * 0.8
  }

  if (score <= 0) {
    return null
  }

  return {
    item: candidate,
    score,
    reason,
  }
}

export function getRecommendations(
  source: CatalogItem,
  catalog: CatalogItem[],
  limit = 12,
): RecommendationResult[] {
  const scored = catalog
    .map((candidate) => scoreRecommendation(source, candidate))
    .filter((result): result is RecommendationResult => result !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      const leftYear = parseYear(left.item.year) ?? 0
      const rightYear = parseYear(right.item.year) ?? 0
      return rightYear - leftYear
    })

  const seen = new Set<string>()
  const unique: RecommendationResult[] = []

  for (const result of scored) {
    if (seen.has(result.item.id)) {
      continue
    }

    seen.add(result.item.id)
    unique.push(result)

    if (unique.length >= limit) {
      break
    }
  }

  return unique
}

export function getRecommendationItems(
  source: CatalogItem,
  catalog: CatalogItem[],
  limit = 12,
): CatalogItem[] {
  return getRecommendations(source, catalog, limit).map((result) => result.item)
}
