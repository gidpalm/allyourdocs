export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-[var(--surface-3)] ${className}`} />
  )
}

export function ToolPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--bg)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="card p-8">
          <div className="text-center mb-10">
            <Skeleton className="w-20 h-20 mx-auto mb-6 rounded-2xl" />
            <Skeleton className="h-8 w-64 mx-auto mb-3" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
