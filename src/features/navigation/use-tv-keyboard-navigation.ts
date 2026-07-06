import { useCallback, useEffect, useRef, useState } from 'react'
import type { CatalogRow, FocusPosition, NavigationDirection } from '../catalog/types'
import { getNextFocusPosition } from './navigation-utils'

const INITIAL_REPEAT_DELAY_MS = 280
const FAST_REPEAT_INTERVAL_MS = 55

interface UseTvKeyboardNavigationOptions {
  rows: CatalogRow[]
  enabled?: boolean
}

interface UseTvKeyboardNavigationResult {
  focus: FocusPosition
  setFocus: (focus: FocusPosition) => void
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

export function useTvKeyboardNavigation({
  rows,
  enabled = true,
}: UseTvKeyboardNavigationOptions): UseTvKeyboardNavigationResult {
  const [focus, setFocus] = useState<FocusPosition>({ rowIndex: 0, itemIndex: 0 })
  const focusRef = useRef(focus)
  const rowsRef = useRef(rows)
  const repeatTimerRef = useRef<number | null>(null)
  const activeDirectionRef = useRef<NavigationDirection | null>(null)

  focusRef.current = focus
  rowsRef.current = rows

  const move = useCallback((direction: NavigationDirection) => {
    setFocus((current) => getNextFocusPosition(current, direction, rowsRef.current))
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
    if (!enabled || rows.length === 0) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const direction = directionFromKey(event.key)
      if (!direction) {
        return
      }

      event.preventDefault()

      if (event.repeat) {
        return
      }

      move(direction)
      scheduleRepeat(direction)
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
  }, [clearRepeatTimer, enabled, move, rows.length, scheduleRepeat])

  useEffect(() => {
    if (rows.length === 0) {
      return
    }

    setFocus((current) => {
      const rowIndex = Math.min(current.rowIndex, rows.length - 1)
      const row = rows[rowIndex]
      const itemIndex = Math.min(current.itemIndex, Math.max(row.items.length - 1, 0))
      return { rowIndex, itemIndex }
    })
  }, [rows])

  return { focus, setFocus }
}
