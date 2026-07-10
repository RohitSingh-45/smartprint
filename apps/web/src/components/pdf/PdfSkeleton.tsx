export function PdfSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading PDF pages">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="aspect-[1/1.3] w-full animate-pulse rounded-lg bg-[var(--surface-2)]" />
          <div className="mx-auto h-3 w-16 animate-pulse rounded bg-[var(--surface-2)]" />
        </div>
      ))}
    </div>
  );
}
