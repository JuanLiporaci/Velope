import { House, BookmarkSimple } from '@phosphor-icons/react'
import { RAIL_ITEMS, type BrowseFocus, type BrowseMode } from '../features/catalog/types'

interface SidebarRailProps {
  focus: BrowseFocus
  browseMode: BrowseMode
  favoritesCount: number
  onSelectRail: (index: number) => void
  isInteractive?: boolean
}

const RAIL_ICONS = [House, BookmarkSimple]

export function SidebarRail({
  focus,
  browseMode,
  favoritesCount,
  onSelectRail,
  isInteractive = true,
}: SidebarRailProps) {
  const isRailFocused = isInteractive && focus.zone === 'rail'

  return (
    <aside className="sidebar-rail flex w-[88px] shrink-0 flex-col items-center border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-rail)] py-8">
      <div
        className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] text-sm font-bold text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        aria-label="Velope"
      >
        V
      </div>

      <nav aria-label="Navegación principal" className="flex flex-1 flex-col items-center gap-3">
        {RAIL_ITEMS.map((item, index) => {
          const Icon = RAIL_ICONS[index]
          const isFocused = isRailFocused && focus.railIndex === index
          const isActive =
            (item.id === 'home' && browseMode === 'catalog') ||
            (item.id === 'favorites' && browseMode === 'favorites')

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectRail(index)}
              className={`sidebar-rail__item flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-150 ${
                isFocused
                  ? 'sidebar-rail__item--focused'
                  : isActive
                    ? 'sidebar-rail__item--active'
                    : 'sidebar-rail__item--idle'
              }`}
            >
              <Icon size={22} weight={isActive || isFocused ? 'fill' : 'regular'} />
              {item.id === 'favorites' && favoritesCount > 0 ? (
                <span className="sidebar-rail__badge">{favoritesCount}</span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
