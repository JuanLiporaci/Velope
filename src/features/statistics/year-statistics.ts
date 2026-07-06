export interface GenreStat {
  label: string
  percentage: number
}

export interface FeaturedTitle {
  id: string
  title: string
  subtitle: string
  posterPath: string
}

export interface TvYearStatistics {
  totalHours: string
  moviesCount: string
  episodesCount: string
  daysActive: string
  topGenre: GenreStat
  genres: GenreStat[]
  heroTitle: FeaturedTitle
  runnerUpTitle: FeaturedTitle
  topRow: FeaturedTitle[]
  summary: string
  primeTime: string
}

function poster(imdbId: string): string {
  return `https://images.metahub.space/poster/medium/${imdbId}/img`
}

export const HARDCODED_TV_YEAR_STATISTICS: TvYearStatistics = {
  totalHours: '487 h',
  moviesCount: '142',
  episodesCount: '318',
  daysActive: '156 días',
  topGenre: { label: 'Ciencia ficción', percentage: 34 },
  genres: [
    { label: 'Ciencia ficción', percentage: 34 },
    { label: 'Drama', percentage: 22 },
    { label: 'Thriller', percentage: 18 },
    { label: 'Comedia', percentage: 14 },
  ],
  heroTitle: {
    id: 'tt0816692',
    title: 'Interstellar',
    subtitle: 'Película favorita del año',
    posterPath: poster('tt0816692'),
  },
  runnerUpTitle: {
    id: 'tt0903747',
    title: 'Breaking Bad',
    subtitle: 'Serie más vista',
    posterPath: poster('tt0903747'),
  },
  topRow: [
    {
      id: 'tt15398776',
      title: 'Oppenheimer',
      subtitle: '3 h 00 min',
      posterPath: poster('tt15398776'),
    },
    {
      id: 'tt0468569',
      title: 'The Dark Knight',
      subtitle: '8.8 IMDb',
      posterPath: poster('tt0468569'),
    },
    {
      id: 'tt1160419',
      title: 'Dune',
      subtitle: 'Vista 4 veces',
      posterPath: poster('tt1160419'),
    },
    {
      id: 'tt0944947',
      title: 'Game of Thrones',
      subtitle: '62 episodios',
      posterPath: poster('tt0944947'),
    },
  ],
  summary: 'Más ciencia ficción, noches entre 21:00 y 23:00, y mucho Nolan.',
  primeTime: '21:00 – 23:00',
}

export function getHardcodedTvYearStatistics(): TvYearStatistics {
  return HARDCODED_TV_YEAR_STATISTICS
}

// Legacy export kept for tests migrating to TV shape
export type YearStatistics = TvYearStatistics

export const HARDCODED_YEAR_STATISTICS = HARDCODED_TV_YEAR_STATISTICS

export function getHardcodedYearStatistics(): TvYearStatistics {
  return HARDCODED_TV_YEAR_STATISTICS
}
