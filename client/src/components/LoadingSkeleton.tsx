export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse bg-ivory-dark" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse bg-ivory-dark" />
        <div className="h-4 w-1/3 animate-pulse bg-ivory-dark" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
