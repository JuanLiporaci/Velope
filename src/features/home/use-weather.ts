import { useEffect, useState } from 'react'

export interface WeatherState {
  temperature: number | null
  condition: string
  icon: 'sun' | 'cloud' | 'rain' | 'snow' | 'fog' | 'storm'
  isLoading: boolean
  error: string | null
}

const DEFAULT_LAT = 40.4168
const DEFAULT_LON = -3.7038

function weatherCodeToCondition(code: number): { label: string; icon: WeatherState['icon'] } {
  if (code === 0) {
    return { label: 'Despejado', icon: 'sun' }
  }

  if (code <= 3) {
    return { label: 'Parcialmente nublado', icon: 'cloud' }
  }

  if (code <= 48) {
    return { label: 'Niebla', icon: 'fog' }
  }

  if (code <= 67) {
    return { label: 'Lluvia', icon: 'rain' }
  }

  if (code <= 77) {
    return { label: 'Nieve', icon: 'snow' }
  }

  if (code <= 82) {
    return { label: 'Chubascos', icon: 'rain' }
  }

  if (code <= 99) {
    return { label: 'Tormenta', icon: 'storm' }
  }

  return { label: 'Nublado', icon: 'cloud' }
}

async function fetchWeather(latitude: number, longitude: number): Promise<WeatherState> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(latitude))
  url.searchParams.set('longitude', String(longitude))
  url.searchParams.set('current', 'temperature_2m,weather_code')
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('No se pudo cargar el clima')
  }

  const data = (await response.json()) as {
    current?: { temperature_2m?: number; weather_code?: number }
  }

  const temperature = data.current?.temperature_2m ?? null
  const code = data.current?.weather_code ?? 0
  const mapped = weatherCodeToCondition(code)

  return {
    temperature,
    condition: mapped.label,
    icon: mapped.icon,
    isLoading: false,
    error: null,
  }
}

function resolveCoordinates(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => resolve({ latitude: DEFAULT_LAT, longitude: DEFAULT_LON }),
      { timeout: 8000, maximumAge: 300_000 },
    )
  })
}

export function useWeather(): WeatherState {
  const [weather, setWeather] = useState<WeatherState>({
    temperature: null,
    condition: 'Cargando clima...',
    icon: 'cloud',
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { latitude, longitude } = await resolveCoordinates()
        const result = await fetchWeather(latitude, longitude)

        if (!cancelled) {
          setWeather(result)
        }
      } catch (error) {
        if (!cancelled) {
          setWeather({
            temperature: null,
            condition: 'Clima no disponible',
            icon: 'cloud',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error de clima',
          })
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return weather
}
