import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { BrowseFocus, CatalogRow, NavigationDirection } from '../catalog/types'
import { GENRE_NAV_ITEMS } from '../catalog/genres'
import { getNextBrowseFocus, INITIAL_BROWSE_FOCUS, normalizeBrowseFocus } from './app-navigation-utils'

const INITIAL_REPEAT_DELAY_MS = 280
const FAST_REPEAT_INTERVAL_MS = 55

interface UseAppNavigationOptions {
  rows: CatalogRow[]
  enabled?: boolean
  onGenreChange?: (genreIndex: number) => void
  onOpenDetails?: (focus: BrowseFocus) => void
  onCloseDetails?: () => void
  isDetailsOpen?: boolean
}

interface UseAppNavigationResult {
  focus: BrowseFocus
  setFocus: Dispatch<SetStateAction<BrowseFocus>>
}

function directionFromKey(key: string): NavigationDirection | null {
  switch (key) {
    case 'ArrowUp':
      return 'up'
    case 'ArrowDown':
      return 'down'
    case 'ArrowLeft':
      return 'left'
    case 'ArrowRight':
      return 'right'
    default:
      return null
  }
}

function isBackKey(key: string): boolean {
  return key === 'Escape' || key === 'Backspace' || key === 'BrowserBack'
}

function isEnterKey(key: string): boolean {
  return key === 'Enter'
}

export function useAppNavigation({
  rows,
  enabled = true,
  onGenreChange,
  onOpenDetails,
  onCloseDetails,
  isDetailsOpen = false,
}: UseAppNavigationOptions): UseAppNavigationResult {
  const [focus, setFocus] = useState<BrowseFocus>(INITIAL_BROWSE_FOCUS)
  const focusRef = useRef(focus)
  const rowsRef = useRef(rows)
  const repeatTimerRef = useRef<number | null>(null)
  const activeDirectionRef = useRef<NavigationDirection | null>(null)
  const lastGenreIndexRef = useRef(focus.genreIndex)

  focusRef.current = focus
  rowsRef.current = rows

  const move = useCallback((direction: NavigationDirection) => {
    setFocus((current) => getNextBrowseFocus(current, direction, rowsRef.current))
  }, [])

  const clearRepeatTimer = useCallback(() => {
    if (repeatTimerRef.current !== null) {
      window.clearInterval(repeatTimerRef.current)
      repeatTimerRef.current = null
    }
  }, [])

  const scheduleRepeat = useCallback(
    (direction: NavigationDirection) => {
      clearRepeatTimer()
      activeDirectionRef.current = direction

      window.setTimeout(() => {
        if (activeDirectionRef.current !== direction) {
          return
        }

        repeatTimerRef.current = window.setInterval(() => {
          move(direction)
        }, FAST_REPEAT_INTERVAL_MS)
      }, INITIAL_REPEAT_DELAY_MS)
    },
    [clearRepeatTimer, move],
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isDetailsOpen) {
        if (isBackKey(event.key)) {
          event.preventDefault()
          onCloseDetails?.()
        }
        return
      }

      if (isEnterKey(event.key)) {
        event.preventDefault()

        if (focusRef.current.zone === 'nav') {
          if (focusRef.current.genreIndex !== lastGenreIndexRef.current) {
            lastGenreIndexRef.current = focusRef.current.genreIndex
            onGenreChange?.(focusRef.current.genreIndex)
          }
          return
        }

        if (focusRef.current.zone === 'content' && rowsRef.current.length > 0) {
          onOpenDetails?.(focusRef.current)
        }
        return
      }

      const direction = directionFromKey(event.key)
      if (!direction) {
        return
      }

      event.preventDefault()

      if (event.repeat) {
        return
      }

      const previousGenreIndex = focusRef.current.genreIndex
      move(direction)
      scheduleRepeat(direction)

      window.setTimeout(() => {
        const nextGenreIndex = focusRef.current.genreIndex
        if (
          focusRef.current.zone === 'nav' &&
          nextGenreIndex !== previousGenreIndex &&
          (direction === 'left' || direction === 'right')
        ) {
          lastGenreIndexRef.current = nextGenreIndex
          onGenreChange?.(nextGenreIndex)
        }
      }, 0)
    }

    function handleKeyUp(event: KeyboardEvent) {
      const direction = directionFromKey(event.key)
      if (!direction) {
        return
      }

      if (activeDirectionRef.current === direction) {
        activeDirectionRef.current = null
        clearRepeatTimer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearRepeatTimer()
    }
  }, [clearRepeatTimer, enabled, isDetailsOpen, move, onCloseDetails, onGenreChange, onOpenDetails, scheduleRepeat])

  useEffect(() => {
    if (rows.length === 0) {
      setFocus((current) => ({
        ...current,
        zone: 'nav',
      }))
      return
    }

    setFocus((current) => normalizeBrowseFocus(current, rows))
  }, [rows])

  useEffect(() => {
    lastGenreIndexRef.current = focus.genreIndex
  }, [focus.genreIndex])

  return { focus, setFocus }
}

export { GENRE_NAV_ITEMS, INITIAL_BROWSE_FOCUS }
