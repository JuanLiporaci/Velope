import { useEffect, useState } from 'react'
import { BookmarkSimple, Play, Star } from '@phosphor-icons/react'
import { getHeroBackdropImageUrl, getHeroPosterImageUrl } from '../features/catalog/image-url'
import type { CatalogItem } from '../features/catalog/types'

interface DetailsScreenProps {
  item: CatalogItem
}

export function DetailsScreen({ item }: DetailsScreenProps) {
  const [hasBackdropError, setHasBackdropError] = useState(false)
  const [hasPosterError, setHasPosterError] = useState(false)

  const backdropUrl = getHeroBackdropImageUrl(item.backdropUrl) ?? item.backdropUrl
  const posterUrl = getHeroPosterImageUrl(item.posterUrl) ?? item.posterUrl

  useEffect(() => {
    setHasBackdropError(false)
    setHasPosterError(false)
  }, [backdropUrl, posterUrl])

  const showBackdrop = Boolean(backdropUrl) && !hasBackdropError

  return (
    <section className="details-screen relative flex h-full flex-col overflow-hidden">
      <div className="hero-panel__ambient absolute inset-0" aria-hidden="true" />

      {showBackdrop ? (
        <img
          key={backdropUrl}
          src={backdropUrl ?? undefined}
          alt=""
          aria-hidden="true"
          onError={() => setHasBackdropError(true)}
          className="hero-panel__backdrop absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
      ) : null}

      <div className="hero-panel__vignette absolute inset-0" aria-hidden="true" />
      <div className="hero-panel__grain pointer-events-none absolute inset-0" aria-hidden="true" />

      <header className="relative z-10 border-b border-[var(--color-border-subtle)] px-12 py-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          Pulsa Back para volver
        </p>
      </header>

      <div className="relative z-10 grid flex-1 grid-cols-[280px_minmax(0,1fr)] gap-10 px-12 py-8">
        <div className="flex flex-col gap-5">
          {posterUrl && !hasPosterError ? (
            <div className="hero-panel__poster">
              <img src={posterUrl} alt={item.title} onError={() => setHasPosterError(true)} className="h-[420px] w-full object-cover" />
              <div className="hero-panel__poster-shine pointer-events-none absolute inset-0" aria-hidden="true" />
            </div>
          ) : (
            <div className="hero-panel__poster flex h-[420px] items-center justify-center text-5xl font-semibold text-[var(--color-accent)]">
              {item.title.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="details-action details-action--primary">
              <Play size={18} weight="fill" />
              Play now
            </button>
            <button type="button" className="details-action">
              <BookmarkSimple size={18} weight="fill" />
              Favoritos
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <span className="hero-panel__badge mb-4 w-fit">
            {item.type === 'movie' ? 'Película' : 'Serie'}
          </span>

          <h1 className="mb-4 max-w-[16ch] text-5xl font-semibold leading-[1.02] tracking-tight text-[var(--color-text-primary)]">
            {item.title}
          </h1>

          <div className="mb-5 flex flex-wrap items-center gap-3">
            {item.year ? <span className="text-sm text-[var(--color-text-secondary)]">{item.year}</span> : null}
            {item.rating ? (
              <span className="hero-panel__rating">
                <Star size={14} weight="fill" />
                IMDb {item.rating}
              </span>
            ) : null}
            {item.genres.slice(0, 4).map((genre) => (
              <span key={genre} className="hero-panel__genre">
                {genre}
              </span>
            ))}
          </div>

          <p className="max-w-[62ch] text-base leading-relaxed text-[var(--color-text-secondary)]">
            {item.description || 'Sin descripción disponible para este título.'}
          </p>
        </div>
      </div>
    </section>
  )
}
