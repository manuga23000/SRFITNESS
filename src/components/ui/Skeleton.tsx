export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function SocioCardSkeleton() {
  return (
    <div className="rounded-3xl border border-ink-800 bg-ink-900 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 !rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-20 !rounded-full" />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
        <Skeleton className="h-12 !rounded-2xl" />
        <Skeleton className="h-12 w-12 !rounded-2xl" />
        <Skeleton className="h-12 w-12 !rounded-2xl" />
      </div>
    </div>
  )
}

export function ListaSkeleton({ cantidad = 4 }: { cantidad?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <SocioCardSkeleton key={i} />
      ))}
    </div>
  )
}
