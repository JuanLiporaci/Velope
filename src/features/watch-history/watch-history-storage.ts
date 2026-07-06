import type { CatalogItem, MediaType } from '../catalog/types'

export const WATCH_HISTORY_STORAGE_KEY = 'velope.watch-history.v1'

export interface WatchSession {
  id: string
  itemId: string
  title: string
  type: MediaType
  genres: string[]
  startedAt: string
  durationMinutes: number
}

const MOVIE_DURATION_MINUTES = 118
const SERIES_EPISODE_MINUTES = 47

export function estimateDurationMinutes(type: MediaType): number {
  return type === 'movie' ? MOVIE_DURATION_MINUTES : SERIES_EPISODE_MINUTES
}

export function readWatchHistoryFromStorage(): WatchSession[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(WATCH_HISTORY_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidWatchSession)
  } catch {
    return []
  }
}

export function writeWatchHistoryToStorage(sessions: WatchSession[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(sessions))
}

export function appendWatchSession(sessions: WatchSession[], item: CatalogItem): WatchSession[] {
  const session: WatchSession = {
    id: `${item.id}-${Date.now()}`,
    itemId: item.id,
    title: item.title,
    type: item.type,
    genres: item.genres,
    startedAt: new Date().toISOString(),
    durationMinutes: estimateDurationMinutes(item.type),
  }

  return [session, ...sessions].slice(0, 500)
}

function isValidWatchSession(value: unknown): value is WatchSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<WatchSession>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.itemId === 'string' &&
    typeof candidate.title === 'string' &&
    (candidate.type === 'movie' || candidate.type === 'series') &&
    Array.isArray(candidate.genres) &&
    typeof candidate.startedAt === 'string' &&
    typeof candidate.durationMinutes === 'number'
  )
}
