import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type {
  BrowseFocus,
  CatalogRow,
  DetailsActionId,
  DetailsFocus,
  NavigationDirection,
} from '../catalog/types'
import { DETAILS_ACTIONS, INITIAL_DETAILS_FOCUS } from '../catalog/types'
import { GENRE_NAV_ITEMS } from '../catalog/genres'
import {
  getNextBrowseFocus,
  getNextDetailsFocus,
  getNextRailFocus,
  INITIAL_BROWSE_FOCUS,
  realignBrowseFocusForRows,
} from './app-navigation-utils'

const INITIAL_REPEAT_DELAY_MS = 280
const FAST_REPEAT_INTERVAL_MS = 55

interface UseAppNavigationOptions {
  rows: CatalogRow[]
  enabled?: boolean
  isInsightsMode?: boolean
  onGenreChange?: (genreIndex: number) => void
  onRailSelect?: (railIndex: number) => void
  onOpenDetails?: (focus: BrowseFocus) => void
  onCloseDetails?: () => void
  onDetailsAction?: (action: DetailsActionId) => void
  onSelectRecommendation?: (index: number) => void
  onSearchInput?: (value: string) => void
  onSearchBackspace?: () => void
  isDetailsOpen?: boolean
  detailsFocus?: DetailsFocus
  setDetailsFocus?: Dispatch<SetStateAction<DetailsFocus>>
  recommendationCount?: number
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
  return key === 'Escape' || key === 'BrowserBack'
}

function isEnterKey(key: string): boolean {
  return key === 'Enter'
}

function isPrintableKey(key: string): boolean {
  return key.length === 1 && !key.startsWith('Arrow') && key !== 'Enter'
}

export function useAppNavigation({
  rows,
  enabled = true,
  isInsightsMode = false,
  onGenreChange,
  onRailSelect,
  onOpenDetails,
  onCloseDetails,
  onDetailsAction,
  onSelectRecommendation,
  onSearchInput,
  onSearchBackspace,
  isDetailsOpen = false,
  detailsFocus = INITIAL_DETAILS_FOCUS,
  setDetailsFocus,
  recommendationCount = 0,
}: UseAppNavigationOptions): UseAppNavigationResult {
  const [focus, setFocus] = useState<BrowseFocus>(INITIAL_BROWSE_FOCUS)
  const focusRef = useRef(focus)
  const rowsRef = useRef(rows)
  const rowsSignatureRef = useRef<string | null>(null)
  const detailsFocusRef = useRef(detailsFocus)
  const repeatTimerRef = useRef<number | null>(null)
  const activeDirectionRef = useRef<NavigationDirection | null>(null)
  const lastGenreIndexRef = useRef(focus.genreIndex)

  focusRef.current = focus
  rowsRef.current = rows
  detailsFocusRef.current = detailsFocus

  const move = useCallback((direction: NavigationDirection) => {
    setFocus((current) => getNextBrowseFocus(current, direction, rowsRef.current))
  }, [])

  const moveRail = useCallback((direction: NavigationDirection) => {
    setFocus((current) => getNextRailFocus({ ...current, zone: 'rail' }, direction))
  }, [])

  const moveDetails = useCallback(
    (direction: NavigationDirection) => {
      setDetailsFocus?.((current) =>
        getNextDetailsFocus(current, direction, recommendationCount),
      )
    },
    [recommendationCount, setDetailsFocus],
  )

  const clearRepeatTimer = useCallback(() => {
    if (repeatTimerRef.current !== null) {
      window.clearInterval(repeatTimerRef.current)
      repeatTimerRef.current = null
    }
  }, [])

  const scheduleRepeat = useCallback(
    (direction: NavigationDirection, mode: 'browse' | 'details' | 'rail') => {
      clearRepeatTimer()
      activeDirectionRef.current = direction

      window.setTimeout(() => {
        if (activeDirectionRef.current !== direction) {
          return
        }

        repeatTimerRef.current = window.setInterval(() => {
          if (mode === 'details') {
            moveDetails(direction)
          } else if (mode === 'rail') {
            moveRail(direction)
          } else {
            move(direction)
          }
        }, FAST_REPEAT_INTERVAL_MS)
      }, INITIAL_REPEAT_DELAY_MS)
    },
    [clearRepeatTimer, move, moveDetails, moveRail],
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
          return
        }

        const direction = directionFromKey(event.key)
        if (direction) {
          event.preventDefault()
          if (event.repeat) {
            return
          }

          moveDetails(direction)
          scheduleRepeat(direction, 'details')
          return
        }

        if (isEnterKey(event.key)) {
          event.preventDefault()
          const currentDetailsFocus = detailsFocusRef.current

          if (currentDetailsFocus.zone === 'back') {
            onCloseDetails?.()
            return
          }

          if (currentDetailsFocus.zone === 'recommendations') {
            onSelectRecommendation?.(currentDetailsFocus.recommendationIndex)
            return
          }

          const action = DETAILS_ACTIONS[currentDetailsFocus.actionIndex]
          onDetailsAction?.(action)
        }

        return
      }

      if (isInsightsMode) {
        if (isEnterKey(event.key)) {
          event.preventDefault()
          onRailSelect?.(focusRef.current.railIndex)
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

        if (direction === 'up' || direction === 'down') {
          moveRail(direction)
          scheduleRepeat(direction, 'rail')
        }

        return
      }

      if (focusRef.current.zone === 'search' && isPrintableKey(event.key)) {
        event.preventDefault()
        onSearchInput?.(event.key)
        return
      }

      if (focusRef.current.zone === 'search' && event.key === 'Backspace') {
        event.preventDefault()
        onSearchBackspace?.()
        return
      }

      if (isEnterKey(event.key)) {
        event.preventDefault()

        if (focusRef.current.zone === 'rail') {
          onRailSelect?.(focusRef.current.railIndex)
          return
        }

        if (focusRef.current.zone === 'search') {
          setFocus((current) => ({
            ...current,
            zone: 'content',
            rowIndex: 0,
            itemIndex: 0,
          }))
          return
        }

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
      scheduleRepeat(direction, 'browse')

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
  }, [
    clearRepeatTimer,
    enabled,
    isDetailsOpen,
    isInsightsMode,
    move,
    moveDetails,
    moveRail,
    onCloseDetails,
    onDetailsAction,
    onGenreChange,
    onOpenDetails,
    onRailSelect,
    onSearchBackspace,
    onSearchInput,
    onSelectRecommendation,
    scheduleRepeat,
  ])

  useEffect(() => {
    if (isInsightsMode) {
      return
    }

    if (rows.length === 0) {
      setFocus((current) => ({
        ...current,
        zone: 'nav',
      }))
      return
    }

    const realigned = realignBrowseFocusForRows(focusRef.current, rows, rowsSignatureRef.current)
    rowsSignatureRef.current = realigned.signature
    setFocus(realigned.focus)
  }, [isInsightsMode, rows])

  useEffect(() => {
    lastGenreIndexRef.current = focus.genreIndex
  }, [focus.genreIndex])

  return { focus, setFocus }
}

export { GENRE_NAV_ITEMS, INITIAL_BROWSE_FOCUS }
