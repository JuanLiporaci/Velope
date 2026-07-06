import { useEffect, useState } from 'react'
import { getImageFallbackLabel, getPosterImageUrl } from '../features/catalog/image-url'
import type { CatalogItem } from '../features/catalog/types'

interface PosterCardProps {
  item: CatalogItem
  isFocused: boolean
  width: number
  height: number
}

export function PosterCard({ item, isFocused, width, height }: PosterCardProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const posterUrl = getPosterImageUrl(item.posterUrl)
  const shouldShowImage = Boolean(posterUrl) && !hasImageError

  useEffect(() => {
    setHasImageError(false)
  }, [posterUrl])

  return (
    <article
      aria-label={`${item.title} ${item.year}`}
      aria-current={isFocused ? 'true' : undefined}
      className={`poster-card relative shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-elevated)] ${
        isFocused ? 'poster-card--focused' : 'opacity-80'
      }`}
      style={{ width, height, transformOrigin: 'center center' }}
    >
      {shouldShowImage ? (
        <img
          src={posterUrl ?? undefined}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onError={() => setHasImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <PosterFallback title={item.title} />
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(12,13,16,0.95)] to-transparent px-3 pb-3 pt-10 transition-opacity duration-150 ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</p>
        {item.year ? (
          <p className="text-xs text-[var(--color-text-secondary)]">{item.year}</p>
        ) : null}
      </div>
    </article>
  )
}

interface PosterFallbackProps {
  title: string
}

function PosterFallback({ title }: PosterFallbackProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_30%_15%,rgba(45,212,168,0.18),transparent_32%),linear-gradient(145deg,#171a22,#0e1015)] px-4 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-semibold text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        {getImageFallbackLabel(title)}
      </div>
      <p className="line-clamp-3 text-sm font-medium leading-tight text-[var(--color-text-primary)]">{title}</p>
    </div>
  )
}
