import { House } from '@phosphor-icons/react'
import { type ReactNode } from 'react'
import { useViewportScale } from './use-viewport-scale'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const viewport = useViewportScale()

  return (
    <div className="tv-shell">
      <div
        className="tv-viewport-host"
        style={{
          width: viewport.hostWidth,
          height: viewport.hostHeight,
        }}
      >
        <div
          className="tv-viewport"
          style={{
            width: viewport.width,
            height: viewport.height,
            transform: `scale(${viewport.scale})`,
          }}
        >
          <div className="flex h-full">
            <aside className="flex w-[88px] shrink-0 flex-col items-center border-r border-[var(--color-border-subtle)] bg-[var(--color-surface-rail)] py-8">
              <div
                className="mb-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] text-sm font-bold text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                aria-label="Velope"
              >
                V
              </div>

              <nav aria-label="Navegación principal" className="flex flex-1 flex-col items-center">
                <button
                  type="button"
                  aria-label="Inicio"
                  aria-current="page"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] transition-transform active:scale-[0.98]"
                >
                  <House size={22} weight="fill" />
                </button>
              </nav>
            </aside>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </div>
  )
}
