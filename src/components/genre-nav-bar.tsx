import { GENRE_NAV_ITEMS } from '../features/catalog/genres'
import type { BrowseFocus } from '../features/catalog/types'

interface GenreNavBarProps {
  focus: BrowseFocus
}

export function GenreNavBar({ focus }: GenreNavBarProps) {
  const isNavFocused = focus.zone === 'nav'

  return (
    <nav
      aria-label="Géneros"
      className="genre-nav border-b border-[var(--color-border-subtle)] bg-[rgba(12,13,16,0.92)] px-12 py-4 backdrop-blur-sm"
    >
      <ul className="flex items-center gap-3">
        {GENRE_NAV_ITEMS.map((genre, index) => {
          const isFocused = isNavFocused && focus.genreIndex === index
          const isActive = focus.genreIndex === index

          return (
            <li key={genre.id}>
              <span
                aria-current={isActive ? 'true' : undefined}
                className={`genre-nav__item inline-flex min-w-[96px] items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-all duration-150 ${
                  isFocused
                    ? 'genre-nav__item--focused'
                    : isActive
                      ? 'genre-nav__item--active'
                      : 'genre-nav__item--idle'
                }`}
              >
                {genre.label}
              </span>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
