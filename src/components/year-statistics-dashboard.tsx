import { Clock, FilmStrip, Moon, Television } from '@phosphor-icons/react'
import { getPosterImageUrl } from '../features/catalog/image-url'
import type { FeaturedTitle, TvYearStatistics } from '../features/statistics/year-statistics'

interface YearStatisticsDashboardProps {
  stats: TvYearStatistics
}

export function YearStatisticsDashboard({ stats }: YearStatisticsDashboardProps) {
  const featuredTitles = [stats.heroTitle, stats.runnerUpTitle, ...stats.topRow]

  return (
    <section className="insights-tv-dashboard flex h-full min-h-0 flex-col overflow-hidden px-8 pb-6 pt-5">
      <header className="mb-4 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Resumen {new Date().getFullYear()}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Tu año en Velope
          </h1>
        </div>
        <p className="max-w-md text-right text-sm leading-snug text-[var(--color-text-secondary)]">
          {stats.summary}
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="grid grid-cols-4 gap-3">
            <MetricPill icon={Clock} label="Horas totales" value={stats.totalHours} accent />
            <MetricPill icon={FilmStrip} label="Películas" value={stats.moviesCount} />
            <MetricPill icon={Television} label="Episodios" value={stats.episodesCount} />
            <MetricPill icon={Moon} label="Días activos" value={stats.daysActive} />
          </div>

          <article className="insights-panel min-h-0 flex-1 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-[var(--color-text-primary)]">Destacados del año</h2>
              <span className="text-xs text-[var(--color-text-muted)]">Top 6 títulos</span>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {featuredTitles.map((item, index) => (
                <PosterTile key={item.id} item={item} index={index} />
              ))}
            </div>
          </article>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <article className="insights-panel p-4">
            <p className="mb-1 text-xs text-[var(--color-text-muted)]">Género #1</p>
            <p className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
              {stats.topGenre.label}
            </p>
            <p className="font-mono text-3xl tracking-tight text-[var(--color-accent)]">
              {stats.topGenre.percentage}%
            </p>
          </article>

          <article className="insights-panel min-h-0 flex-1 p-4">
            <h2 className="mb-3 text-sm font-medium text-[var(--color-text-primary)]">Géneros más vistos</h2>
            <ul className="space-y-2.5">
              {stats.genres.map((genre) => (
                <li key={genre.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">{genre.label}</span>
                    <span className="font-mono text-[var(--color-text-primary)]">{genre.percentage}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                    <div
                      className="insights-genre-bar h-full rounded-full bg-[rgba(45,212,168,0.85)]"
                      style={{ width: `${genre.percentage}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="insights-panel px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">Horario preferido</p>
            <p className="font-mono text-lg text-[var(--color-text-primary)]">{stats.primeTime}</p>
          </article>
        </aside>
      </div>
    </section>
  )
}

interface MetricPillProps {
  icon: typeof Clock
  label: string
  value: string
  accent?: boolean
}

function MetricPill({ icon: Icon, label, value, accent = false }: MetricPillProps) {
  return (
    <div
      className={`insights-metric-pill flex flex-col justify-between rounded-2xl border p-3 ${
        accent ? 'insights-metric-pill--accent' : ''
      }`}
    >
      <Icon size={18} weight="fill" className={accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'} />
      <div>
        <p className="text-[11px] text-[var(--color-text-muted)]">{label}</p>
        <p className="font-mono text-xl tracking-tight text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  )
}

function PosterTile({ item, index }: { item: FeaturedTitle; index: number }) {
  const posterUrl = getPosterImageUrl(item.posterPath)

  return (
    <article
      className="insights-poster-tile group relative overflow-hidden rounded-xl border border-[var(--color-border-subtle)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={item.title}
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="aspect-[2/3] w-full bg-[rgba(255,255,255,0.04)]" />
      )}
      <div className="insights-poster-tile__shade absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="truncate text-[10px] uppercase tracking-[0.12em] text-[var(--color-accent)]">{item.subtitle}</p>
        <p className="truncate text-xs font-medium text-white">{item.title}</p>
      </div>
    </article>
  )
}
