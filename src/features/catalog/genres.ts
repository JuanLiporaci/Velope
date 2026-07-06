export interface GenreNavItem {
  id: string
  label: string
  filter: string | null
}

export const GENRE_NAV_ITEMS: GenreNavItem[] = [
  { id: 'all', label: 'All', filter: null },
  { id: 'action', label: 'Action', filter: 'Action' },
  { id: 'drama', label: 'Drama', filter: 'Drama' },
  { id: 'comedy', label: 'Comedy', filter: 'Comedy' },
  { id: 'scifi', label: 'Sci-Fi', filter: 'Sci-Fi' },
]

export function getGenreByIndex(index: number): GenreNavItem {
  const normalized = ((index % GENRE_NAV_ITEMS.length) + GENRE_NAV_ITEMS.length) % GENRE_NAV_ITEMS.length
  return GENRE_NAV_ITEMS[normalized]
}

export function getGenreIndexById(id: string): number {
  const index = GENRE_NAV_ITEMS.findIndex((genre) => genre.id === id)
  return index >= 0 ? index : 0
}
