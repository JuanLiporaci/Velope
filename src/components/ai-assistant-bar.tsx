import { useState } from 'react'
import {
  CloudFog,
  CloudRain,
  CloudSun,
  Microphone,
  Snowflake,
  Sparkle,
  Sun,
} from '@phosphor-icons/react'
import { useLiveClock } from '../features/home/use-live-clock'
import { useWeather, type WeatherState } from '../features/home/use-weather'

interface AiAssistantBarProps {
  onSubmitQuery: (query: string) => void
  compact?: boolean
}

function WeatherIcon({ icon }: { icon: WeatherState['icon'] }) {
  const size = 20
  const weight = 'fill' as const

  switch (icon) {
    case 'sun':
      return <Sun size={size} weight={weight} />
    case 'rain':
      return <CloudRain size={size} weight={weight} />
    case 'snow':
      return <Snowflake size={size} weight={weight} />
    case 'fog':
      return <CloudFog size={size} weight={weight} />
    case 'storm':
      return <CloudRain size={size} weight={weight} />
    default:
      return <CloudSun size={size} weight={weight} />
  }
}

export function AiAssistantBar({ onSubmitQuery, compact = false }: AiAssistantBarProps) {
  const [query, setQuery] = useState('')
  const { dateLabel, timeLabel } = useLiveClock()
  const weather = useWeather()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      return
    }

    onSubmitQuery(trimmed)
    setQuery('')
  }

  return (
    <header
      className={`ai-bar shrink-0 border-b border-[var(--color-border-subtle)] px-8 backdrop-blur-md ${
        compact ? 'py-2' : 'sticky top-0 z-20 py-3 px-10'
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <form
          onSubmit={handleSubmit}
          className={`ai-bar__assistant flex items-center gap-3 rounded-full border px-4 ${
            compact ? 'min-h-[40px] py-2' : 'min-h-[48px] px-5 py-2.5'
          }`}
        >
          <Sparkle size={20} weight="fill" className="shrink-0 text-[var(--color-accent)]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pregúntale a Velope... Ej: Quiero una película como Interstellar pero más corta."
            aria-label="Asistente de búsqueda"
            className={`min-w-0 flex-1 bg-transparent text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] ${
              compact ? 'text-sm' : 'text-base'
            }`}
          />
          <button
            type="button"
            aria-label="Búsqueda por voz"
            className="ai-bar__action flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-secondary)] transition-transform duration-150 active:scale-[0.98]"
          >
            <Microphone size={18} weight="bold" />
          </button>
          <button
            type="submit"
            aria-label="Buscar con asistente"
            className="ai-bar__action ai-bar__action--primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(45,212,168,0.35)] bg-[rgba(45,212,168,0.14)] text-[var(--color-accent)] transition-transform duration-150 active:scale-[0.98]"
          >
            <Sparkle size={18} weight="fill" />
          </button>
        </form>

        <div className="flex items-center gap-5 text-sm">
          <div className="hidden text-right lg:block">
            <p className="capitalize text-[var(--color-text-secondary)]">{dateLabel}</p>
            <p className="font-mono text-lg tracking-tight text-[var(--color-text-primary)]">{timeLabel}</p>
          </div>

          <div className="ai-bar__weather flex items-center gap-2 rounded-2xl border border-[var(--color-border-subtle)] px-3 py-2">
            <span className="text-[var(--color-accent)]">
              <WeatherIcon icon={weather.icon} />
            </span>
            <div>
              {weather.temperature !== null ? (
                <p className="font-mono text-base leading-none text-[var(--color-text-primary)]">
                  {Math.round(weather.temperature)}°C
                </p>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">--</p>
              )}
              <p className="max-w-[120px] truncate text-xs text-[var(--color-text-muted)]">
                {weather.isLoading ? 'Actualizando...' : weather.condition}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
