import { useEffect, useState } from 'react'

interface LiveClockState {
  dateLabel: string
  timeLabel: string
}

function formatClock(now: Date): LiveClockState {
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now)

  const timeLabel = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now)

  return { dateLabel, timeLabel }
}

export function useLiveClock(): LiveClockState {
  const [clock, setClock] = useState<LiveClockState>(() => formatClock(new Date()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(formatClock(new Date()))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  return clock
}
