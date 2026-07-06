import { useState } from 'react'
import {
  CloudFog,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from '@phosphor-icons/react'
import { AiSearchField } from './ai-search-field'
import { useLiveClock } from '../features/home/use-live-clock'
import { useWeather, type WeatherState } from '../features/home/use-weather'

interface AiAssistantBarProps {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: () => void
  onSubmitQuery?: (query: string) => void
  isFocused?: boolean
  onActivate?: () => void
  compact?: boolean
  showMeta?: boolean
  clearOnSubmit?: boolean
  hint?: string
  placeholder?: string
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

export function AiAssistantBar({
  value,
  onChange,
  onSubmit,
  onSubmitQuery,
  isFocused = false,
  onActivate,
  compact = false,
  showMeta = true,
  clearOnSubmit = false,
  hint,
  placeholder,
}: AiAssistantBarProps) {
  const [localQuery, setLocalQuery] = useState('')
  const { dateLabel, timeLabel } = useLiveClock()
  const weather = useWeather()

  const isControlled = value !== undefined && onChange !== undefined
  const query = isControlled ? value : localQuery

  function handleChange(nextValue: string) {
    if (isControlled) {
      onChange(nextValue)
      return
    }

    setLocalQuery(nextValue)
  }

  function handleSubmit() {
    const trimmed = query.trim()

    if (onSubmit) {
      onSubmit()
      return
    }

    if (!trimmed) {
      return
    }

    onSubmitQuery?.(trimmed)

    if (clearOnSubmit) {
      if (isControlled) {
        onChange?.('')
      } else {
        setLocalQuery('')
      }
    }
  }

  return (
    <header
      className={`ai-bar shrink-0 border-b border-[var(--color-border-subtle)] backdrop-blur-md ${
        compact ? 'px-8 py-2' : 'sticky top-0 z-20 px-12 py-4'
      }`}
    >
      <div className={`grid items-center gap-4 ${showMeta ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-1'}`}>
        <AiSearchField
          value={query}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isFocused={isFocused}
          onActivate={onActivate}
          compact={compact}
          hint={hint}
          placeholder={placeholder}
        />

        {showMeta ? (
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
        ) : null}
      </div>
    </header>
  )
}
