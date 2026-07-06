import { useEffect, useState } from 'react'
import { ArrowLeft, BookmarkSimple, Play, Sparkle, Star } from '@phosphor-icons/react'
import { getHeroBackdropImageUrl, getHeroPosterImageUrl } from '../features/catalog/image-url'
import type { CatalogItem, DetailsActionId, DetailsFocus } from '../features/catalog/types'
import { DETAILS_ACTIONS } from '../features/catalog/types'
import { RecommendationRow } from './recommendation-row'

interface DetailsScreenProps {
  item: CatalogItem
  recommendations: CatalogItem[]
  isFavorite: boolean
  focus: DetailsFocus
  playFeedback: string | null
  onBack: () => void
  onPlay: () => void
  onToggleFavorite: () => void
  onShowRecommendations: () => void
  onSelectRecommendation: (item: CatalogItem) => void
}

const ACTION_LABELS: Record<DetailsActionId, string> = {
  play: 'Reproducir',
  favorite: 'Guardar',
  recommendations: 'Sugerencias',
}

export function DetailsScreen({
  item,
  recommendations,
  isFavorite,
  focus,
  playFeedback,
  onBack,
  onPlay,
  onToggleFavorite,
  onShowRecommendations,
  onSelectRecommendation,
}: DetailsScreenProps) {
  const [hasBackdropError, setHasBackdropError] = useState(false)
  const [hasPosterError, setHasPosterError] = useState(false)

  const backdropUrl = getHeroBackdropImageUrl(item.backdropUrl) ?? item.backdropUrl
  const posterUrl = getHeroPosterImageUrl(item.posterUrl) ?? item.posterUrl

  useEffect(() => {
    setHasBackdropError(false)
    setHasPosterError(false)
  }, [backdropUrl, posterUrl])

  const showBackdrop = Boolean(backdropUrl) && !hasBackdropError
  const isBackFocused = focus.zone === 'back'

  function handleActionClick(action: DetailsActionId) {
    if (action === 'play') {
      onPlay()
      return
    }

    if (action === 'favorite') {
      onToggleFavorite()
      return
    }

    onShowRecommendations()
  }

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
          className="hero-panel__backdrop hero-panel__backdrop--visible absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
      ) : null}

      <div className="hero-panel__vignette absolute inset-0" aria-hidden="true" />
      <div className="hero-panel__grain pointer-events-none absolute inset-0" aria-hidden="true" />

      <header className="relative z-10 flex items-center gap-4 border-b border-[var(--color-border-subtle)] px-12 py-4">
        <button
          type="button"
          aria-label="Volver atrás"
          onClick={onBack}
          className={`details-back ${isBackFocused ? 'details-back--focused' : ''}`}
        >
          <ArrowLeft size={20} weight="bold" />
          <span>Volver</span>
        </button>
        <p className="text-sm text-[var(--color-text-muted)]">
          Enter en Volver para regresar · Flechas para acciones y sugerencias
        </p>
      </header>

      <div className="relative z-10 grid flex-1 grid-cols-[240px_minmax(0,1fr)] gap-10 overflow-hidden px-12 py-8">
        <div className="flex flex-col gap-4">
          {posterUrl && !hasPosterError ? (
            <div className="hero-panel__poster">
              <img
                src={posterUrl}
                alt={item.title}
                onError={() => setHasPosterError(true)}
                className="h-[360px] w-full object-cover"
              />
              <div className="hero-panel__poster-shine pointer-events-none absolute inset-0" aria-hidden="true" />
            </div>
          ) : (
            <div className="hero-panel__poster flex h-[360px] items-center justify-center text-5xl font-semibold text-[var(--color-accent)]">
              {item.title.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {DETAILS_ACTIONS.map((action, index) => {
              const isFocused = focus.zone === 'actions' && focus.actionIndex === index

              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleActionClick(action)}
                  className={`details-action details-action--stacked ${
                    action === 'play' ? 'details-action--primary ' : ''
                  }${isFocused ? 'details-action--focused' : ''} ${
                    action === 'favorite' && isFavorite ? 'details-action--saved' : ''
                  }`}
                >
                  {action === 'play' ? <Play size={18} weight="fill" /> : null}
                  {action === 'favorite' ? (
                    <BookmarkSimple size={18} weight={isFavorite ? 'fill' : 'regular'} />
                  ) : null}
                  {action === 'recommendations' ? <Sparkle size={18} weight="fill" /> : null}
                  <span>{ACTION_LABELS[action]}</span>
                  {action === 'favorite' && isFavorite ? (
                    <span className="details-action__status">Guardado</span>
                  ) : null}
                </button>
              )
            })}
          </div>

          {playFeedback ? (
            <div className="play-feedback rounded-2xl border border-[rgba(45,212,168,0.25)] bg-[rgba(45,212,168,0.08)] px-4 py-3 text-sm text-[var(--color-accent)]">
              {playFeedback}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6 overflow-y-auto pr-2">
          <div className="flex min-w-0 flex-col">
            <span className="hero-panel__badge mb-4 w-fit">
              {item.type === 'movie' ? 'Película' : 'Serie'}
            </span>

            <h1 className="mb-4 max-w-[18ch] text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--color-text-primary)]">
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

          <RecommendationRow
            items={recommendations}
            focusedIndex={focus.recommendationIndex}
            isFocused={focus.zone === 'recommendations'}
            onSelectItem={onSelectRecommendation}
          />
        </div>
      </div>
    </section>
  )
}
