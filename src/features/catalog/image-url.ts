const IMAGE_PROXY_BASE = 'https://wsrv.nl'
const METAHUB_HOST = 'images.metahub.space'

interface ProxyImageOptions {
  width: number
  height: number
  fit?: 'cover' | 'contain'
}

function buildProxyUrl(source: string, options: ProxyImageOptions): string {
  const fit = options.fit ?? 'cover'
  return `${IMAGE_PROXY_BASE}/?url=${encodeURIComponent(source)}&w=${options.width}&h=${options.height}&fit=${fit}&output=webp`
}

export function normalizeImageUrl(
  url: string | null | undefined,
  options: ProxyImageOptions = { width: 360, height: 540 },
): string | null {
  if (!url) {
    return null
  }

  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.hostname === METAHUB_HOST) {
      const source = `${parsedUrl.hostname}${parsedUrl.pathname}${parsedUrl.search}`
      return buildProxyUrl(source, options)
    }

    return url
  } catch {
    return url
  }
}

export function getPosterImageUrl(url: string | null | undefined): string | null {
  return normalizeImageUrl(url, { width: 360, height: 540, fit: 'cover' })
}

export function getHeroPosterImageUrl(url: string | null | undefined): string | null {
  return normalizeImageUrl(url, { width: 420, height: 630, fit: 'cover' })
}

export function getHeroBackdropImageUrl(url: string | null | undefined): string | null {
  return normalizeImageUrl(url, { width: 1280, height: 720, fit: 'cover' })
}

export function getImageFallbackLabel(title: string): string {
  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    return 'V'
  }

  return trimmedTitle.slice(0, 1).toUpperCase()
}
