import { useCallback, useEffect, useState } from 'react'
import type { CatalogItem } from '../catalog/types'
import {
  appendWatchSession,
  readWatchHistoryFromStorage,
  writeWatchHistoryToStorage,
  type WatchSession,
} from './watch-history-storage'

export function useWatchHistory() {
  const [sessions, setSessions] = useState<WatchSession[]>(() => readWatchHistoryFromStorage())

  useEffect(() => {
    writeWatchHistoryToStorage(sessions)
  }, [sessions])

  const recordWatch = useCallback((item: CatalogItem) => {
    setSessions((current) => appendWatchSession(current, item))
  }, [])

  return { sessions, recordWatch }
}
