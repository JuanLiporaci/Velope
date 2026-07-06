import { useEffect, useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { getHeroBackdropImageUrl, getHeroPosterImageUrl } from '../features/catalog/image-url'
import type { CatalogItem } from '../features/catalog/types'

interface HeroPanelProps {
  item: CatalogItem | null
}

export function HeroPanel({ item }: HeroPanelProps) {
  const [hasBackdropError, setHasBackdropError] = useState(false)
  const [hasPosterError, setHasPosterError] = useState(false)

  const backdropUrl = getHeroBackdropImageUrl(item?.backdropUrl) ?? item?.backdropUrl ?? null
  const posterUrl = getHeroPosterImageUrl(item?.posterUrl) ?? item?.posterUrl ?? null

  useEffect(() => {
    setHasBackdropError(false)
    setHasPosterError(false)
  }, [backdropUrl, posterUrl])

  if (!item) {
    return (
      <div className="hero-panel relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 skeleton-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[rgba(12,13,16,0.7)] to-transparent" />
      </div>
    )
  }

  const showBackdrop = Boolean(backdropUrl) && !hasBackdropError

  return (
    <section className="hero-panel relative h-[300px] overflow-hidden">
      <div className="hero-panel__ambient absolute inset-0" aria-hidden="true" />

      {showBackdrop ? (
        <img
          key={backdropUrl}
          src={backdropUrl ?? undefined}
          alt=""
          aria-hidden="true"
          onError={() => setHasBackdropError(true)}
          className="hero-panel__backdrop absolute inset-0 h-full w-full object-cover object-[68%_center]"
        />
      ) : (
        <div
          key={item.id}
          className="hero-panel__fallback absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(45,212,168,0.16),transparent_42%),linear-gradient(125deg,#171b24,#0c0d10)]"
          aria-hidden="true"
        />
      )}

      <div className="hero-panel__vignette absolute inset-0" aria-hidden="true" />
      <div className="hero-panel__grain pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 grid h-full grid-cols-[minmax(0,1fr)_196px] items-end gap-8 px-12 pb-7">
        <div className="flex min-w-0 flex-col justify-end">
          <div className="mb-3 flex items-center gap-3">
            <span className="hero-panel__badge">
              {item.type === 'movie' ? 'Película' : 'Serie'}
            </span>
            {item.year ? (
              <span className="text-xs tracking-wide text-[var(--color-text-muted)]">{item.year}</span>
            ) : null}
          </div>

          <h1 className="mb-3 max-w-[18ch] text-[2rem] font-semibold leading-[1.05] tracking-tight text-[var(--color-text-primary)]">
            {item.title}
          </h1>

          <div className="mb-3 flex flex-wrap items-center gap-2.5">
            {item.rating ? (
              <span className="hero-panel__rating">
                <Star size={14} weight="fill" />
                IMDb {item.rating}
              </span>
            ) : null}
            {item.genres.slice(0, 3).map((genre) => (
              <span key={genre} className="hero-panel__genre">
                {genre}
              </span>
            ))}
          </div>

          {item.description ? (
            <p className="line-clamp-2 max-w-[56ch] text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {item.description}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end pb-0.5">
          {posterUrl && !hasPosterError ? (
            <div key={posterUrl} className="hero-panel__poster">
              <img
                src={posterUrl}
                alt={item.title}
                onError={() => setHasPosterError(true)}
                className="h-[236px] w-[160px] object-cover"
              />
              <div className="hero-panel__poster-shine pointer-events-none absolute inset-0" aria-hidden="true" />
            </div>
          ) : (
            <div className="hero-panel__poster flex h-[236px] w-[160px] items-center justify-center text-4xl font-semibold text-[var(--color-accent)]">
              {item.title.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
