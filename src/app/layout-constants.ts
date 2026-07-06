import { getFocusOverflow } from '../features/navigation/navigation-utils'

export const TV_HEIGHT = 1080
export const GENRE_NAV_HEIGHT = 81
export const HERO_HEIGHT = 300
export const FOOTER_HEIGHT = 44

export const ITEM_WIDTH = 160
export const ITEM_HEIGHT = 240
export const ITEM_GAP = 20

/** text-lg (28px line) + mb-3 (12px) */
export const ROW_TITLE_BLOCK = 40
export const ROW_MARGIN_BOTTOM = 20
export const ROW_FOCUS_OVERFLOW = getFocusOverflow(ITEM_WIDTH)
export const ROW_CONTENT_HEIGHT = ROW_TITLE_BLOCK + ITEM_HEIGHT + ROW_FOCUS_OVERFLOW * 2
export const ROW_STRIDE = ROW_CONTENT_HEIGHT + ROW_MARGIN_BOTTOM

export const CAROUSEL_VIEWPORT_HEIGHT =
  TV_HEIGHT - HERO_HEIGHT - FOOTER_HEIGHT - GENRE_NAV_HEIGHT

export const CAROUSEL_BOTTOM_PADDING = ROW_FOCUS_OVERFLOW + 8
