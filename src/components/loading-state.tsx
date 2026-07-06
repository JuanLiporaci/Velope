interface LoadingStateProps {
  rowCount?: number
}

export function LoadingState({ rowCount = 10 }: LoadingStateProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="hero-panel relative h-[300px] overflow-hidden">
        <div className="hero-panel__ambient absolute inset-0" />
        <div className="absolute inset-0 skeleton-shimmer opacity-70" />
        <div className="hero-panel__vignette absolute inset-0" />
      </div>

      <div className="flex-1 overflow-hidden px-12 pt-8">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div key={rowIndex} className="mb-6">
            <div className="mb-3 h-5 w-40 rounded skeleton-shimmer" />
            <div className="flex gap-4">
              {Array.from({ length: 8 }).map((__, itemIndex) => (
                <div
                  key={itemIndex}
                  className="h-[240px] w-[160px] shrink-0 rounded-xl skeleton-shimmer"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
