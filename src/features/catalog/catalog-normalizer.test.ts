import { describe, expect, it } from 'vitest'
import { getHeroBackdropImageUrl, getPosterImageUrl, normalizeImageUrl } from './image-url'
import { dedupeItems, normalizeFromCinemeta, normalizeFromTvMaze } from './catalog-normalizer'

describe('catalog-normalizer', () => {
  it('proxies Metahub images through wsrv to avoid browser/DNS blocks', () => {
    const imageUrl = normalizeImageUrl('https://images.metahub.space/poster/small/tt32565993/img')

    expect(imageUrl).toBe(
      'https://wsrv.nl/?url=images.metahub.space%2Fposter%2Fsmall%2Ftt32565993%2Fimg&w=360&h=540&fit=cover&output=webp',
    )
  })

  it('uses larger hero image sizes for posters and backdrops', () => {
    const poster = getPosterImageUrl('https://images.metahub.space/poster/small/tt32565993/img')
    const backdrop = getHeroBackdropImageUrl('https://images.metahub.space/background/medium/tt32565993/img')

    expect(poster).toContain('w=360')
    expect(backdrop).toContain('w=1920')
  })

  it('normalizes cinemeta movie metadata', () => {
    const item = normalizeFromCinemeta(
      {
        id: 'tt0111161',
        name: 'The Shawshank Redemption',
        type: 'movie',
        poster: 'https://example.com/poster.jpg',
        background: 'https://example.com/bg.jpg',
        description: 'Hopeful prison drama',
        year: '1994',
        imdbRating: '9.3',
        genre: ['Drama'],
      },
      'movie',
    )

    expect(item).toEqual({
      id: 'tt0111161',
      type: 'movie',
      title: 'The Shawshank Redemption',
      year: '1994',
      posterUrl: 'https://example.com/poster.jpg',
      backdropUrl: 'https://example.com/bg.jpg',
      description: 'Hopeful prison drama',
      rating: '9.3',
      genres: ['Drama'],
    })
  })

  it('normalizes tvmaze show metadata', () => {
    const item = normalizeFromTvMaze({
      id: 1,
      name: 'Under the Dome',
      premiered: '2013-06-24',
      summary: '<p>Small town mystery</p>',
      image: {
        medium: 'https://example.com/medium.jpg',
        original: 'https://example.com/original.jpg',
      },
      genres: ['Drama', 'Science-Fiction'],
      rating: { average: 6.5 },
      externals: { imdb: 'tt1553654' },
    })

    expect(item.id).toBe('tt1553654')
    expect(item.type).toBe('series')
    expect(item.title).toBe('Under the Dome')
    expect(item.year).toBe('2013')
    expect(item.description).toBe('Small town mystery')
    expect(item.rating).toBe('6.5')
  })

  it('dedupes catalog items by id', () => {
    const items = dedupeItems([
      normalizeFromCinemeta({ id: 'tt1', name: 'One' }, 'movie'),
      normalizeFromCinemeta({ id: 'tt2', name: 'Two' }, 'movie'),
      normalizeFromCinemeta({ id: 'tt1', name: 'One duplicate' }, 'movie'),
    ])

    expect(items).toHaveLength(2)
    expect(items.map((item) => item.id)).toEqual(['tt1', 'tt2'])
  })
})
