import { type ReactNode } from 'react'
import { useViewportScale } from './use-viewport-scale'
import { SidebarRail } from '../components/sidebar-rail'
import type { BrowseFocus, BrowseMode } from '../features/catalog/types'

interface AppLayoutProps {
  children: ReactNode
  focus: BrowseFocus
  browseMode?: BrowseMode
  favoritesCount?: number
  onSelectRail: (index: number) => void
  isRailInteractive?: boolean
}

export function AppLayout({
  children,
  focus,
  browseMode = 'catalog',
  favoritesCount = 0,
  onSelectRail,
  isRailInteractive = true,
}: AppLayoutProps) {
  const viewport = useViewportScale()

  return (
    <div className="tv-shell">
      <div className="tv-viewport-host">
        <div
          className="tv-viewport"
          style={{
            width: viewport.width,
            height: viewport.height,
            transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.scale})`,
          }}
        >
          <div className="flex h-full">
            <SidebarRail
              focus={focus}
              browseMode={browseMode}
              favoritesCount={favoritesCount}
              onSelectRail={onSelectRail}
              isInteractive={isRailInteractive}
            />

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
