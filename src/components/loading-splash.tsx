export function CatalogLoadingPanel() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-12">
      <div className="loading-splash__orb loading-splash__orb--one" aria-hidden="true" />
      <div className="loading-splash__orb loading-splash__orb--two" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="loading-splash__mark mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-accent)]/35 bg-[var(--color-accent-muted)] text-xl font-bold text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          V
        </div>

        <div className="loading-splash__pulse mb-4 h-1.5 w-44 overflow-hidden rounded-full bg-white/8">
          <div className="loading-splash__pulse-bar h-full w-1/2 rounded-full bg-[var(--color-accent)]" />
        </div>

        <p className="text-sm tracking-[0.18em] uppercase text-[var(--color-text-muted)]">
          Preparando catálogo
        </p>
      </div>
    </div>
  )
}
